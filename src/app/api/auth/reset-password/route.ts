import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/security/validation";
import { hashPassword } from "@/lib/auth/password";
import { verifyOTP } from "@/lib/auth/otp";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { UnauthorizedError, NotFoundError } from "@/lib/errors/app-error";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);

    const identifier = validated.identifier.trim();
    const isMobile = /^[6-9]\d{9}$/.test(identifier);

    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { mobile: identifier }],
      },
    });

    if (!user) {
      throw new NotFoundError("Account not found with provided identifier");
    }

    // Verify valid OTP
    const pendingOtp = await prisma.oTPVerification.findFirst({
      where: {
        OR: [
          isMobile ? { mobile: identifier } : { email: identifier },
          user.mobile ? { mobile: user.mobile } : {},
          user.email ? { email: user.email } : {},
        ],
        purpose: "RESET_PASSWORD",
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingOtp) {
      throw new UnauthorizedError("Invalid or expired password reset OTP");
    }

    const isValid = verifyOTP(validated.otp, pendingOtp.otpHash);
    if (!isValid) {
      throw new UnauthorizedError("Incorrect OTP entered");
    }

    // Mark OTP as verified/used
    await prisma.oTPVerification.update({
      where: { id: pendingOtp.id },
      data: { isVerified: true },
    });

    // Hash and update password
    const newPasswordHash = await hashPassword(validated.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Record audit log
    await recordAuditLog({
      userId: user.id,
      userRole: user.role,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      newValue: { passwordReset: true },
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });

    return apiSuccess(
      { success: true },
      "Password updated successfully. You may now sign in with your new password."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
