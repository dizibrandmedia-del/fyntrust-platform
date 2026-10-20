import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { customerRegisterSchema } from "@/lib/security/validation";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ConflictError } from "@/lib/errors/app-error";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = customerRegisterSchema.parse(body);

    // Check duplicate email or mobile
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.email }, { mobile: validated.mobile }],
      },
    });

    if (existing) {
      throw new ConflictError("An account with this email or mobile number already exists");
    }

    const passwordHash = await hashPassword(validated.password);

    // Create user and customer profile atomically
    const newUser = await prisma.user.create({
      data: {
        email: validated.email,
        mobile: validated.mobile,
        fullName: validated.fullName,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
        customerProfile: {
          create: {
            businessName: validated.businessName,
            businessType: validated.businessType,
            city: validated.city,
            state: validated.state,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    const session = {
      userId: newUser.id,
      email: newUser.email,
      mobile: newUser.mobile,
      fullName: newUser.fullName,
      role: "CUSTOMER" as const,
      customerProfileId: newUser.customerProfile?.id,
    };

    const token = signToken(session);

    // Record audit log
    await recordAuditLog({
      userId: newUser.id,
      userRole: "CUSTOMER",
      action: "CREATE",
      entity: "Customer",
      entityId: newUser.customerProfile?.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });

    const response = apiSuccess(
      {
        user: session,
        token,
      },
      "Account registered successfully",
      201
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
