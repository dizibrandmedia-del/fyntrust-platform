import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/security/validation";
import { generateOTP, hashOTP, verifyOTP } from "@/lib/auth/otp";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { notifications } from "@/lib/notifications";
import { UserRole } from "@/lib/types/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/otp - Request an OTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestOtpSchema.parse(body);

    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.oTPVerification.create({
      data: {
        mobile: validated.mobile,
        email: validated.email,
        otpHash,
        purpose: validated.purpose,
        expiresAt,
      },
    });

    // Send OTP via notification engine
    await notifications.send({
      eventType: "STATUS_UPDATE",
      channel: validated.mobile ? "SMS" : "EMAIL",
      recipient: {
        name: "Valued User",
        mobile: validated.mobile,
        email: validated.email,
      },
      variables: {
        otp,
        status: `Your Fyntrust verification OTP is: ${otp}. Valid for 10 minutes.`,
      },
    });

    return apiSuccess(
      {
        recipient: validated.mobile || validated.email,
        expiresInSeconds: 600,
        // In dev / test mode, return test OTP for seamless automated test validation
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      },
      "Verification OTP sent successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/auth/otp - Verify OTP and Login
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifyOtpSchema.parse(body);

    // Find valid pending OTP
    const pendingOtp = await prisma.oTPVerification.findFirst({
      where: {
        OR: [
          validated.mobile ? { mobile: validated.mobile } : {},
          validated.email ? { email: validated.email } : {},
        ],
        purpose: validated.purpose,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingOtp) {
      throw new UnauthorizedError("Invalid or expired OTP");
    }

    const isValid = verifyOTP(validated.otp, pendingOtp.otpHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid OTP entered");
    }

    // Mark verified
    await prisma.oTPVerification.update({
      where: { id: pendingOtp.id },
      data: { isVerified: true },
    });

    // If purpose is LOGIN, find or create user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          validated.mobile ? { mobile: validated.mobile } : {},
          validated.email ? { email: validated.email } : {},
        ],
      },
      include: { customerProfile: true, expertProfile: true },
    });

    if (!user) {
      return apiSuccess({ verified: true, isExistingUser: false }, "OTP verified successfully");
    }

    const session = {
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      fullName: user.fullName,
      role: user.role as UserRole,
      customerProfileId: user.customerProfile?.id,
      expertProfileId: user.expertProfile?.id,
    };

    const token = signToken(session);

    let redirectUrl = "/customer/dashboard";
    if (["SUPER_ADMIN", "ADMIN", "SALES"].includes(user.role)) {
      redirectUrl = "/admin/dashboard";
    } else if (["CA_FINANCE_EXPERT", "ACCOUNTANT", "LEGAL_PARTNER", "VIRTUAL_CFO"].includes(user.role)) {
      redirectUrl = "/expert/dashboard";
    }

    const response = apiSuccess(
      {
        verified: true,
        isExistingUser: true,
        user: session,
        token,
        redirectUrl,
      },
      "OTP verified and login successful"
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
