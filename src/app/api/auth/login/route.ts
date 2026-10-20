import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/security/validation";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { recordAuditLog } from "@/lib/security/audit";
import { UserRole } from "@/lib/types/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const identifier = validated.identifier.trim();

    // Find user by email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { mobile: identifier }],
      },
      include: {
        customerProfile: true,
        expertProfile: true,
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      throw new UnauthorizedError("Invalid credentials or inactive account");
    }

    // Brute-force lockout check: maximum 5 failed attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailures = await prisma.loginHistory.count({
      where: {
        userId: user.id,
        status: "FAILED",
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentFailures >= 5) {
      throw new UnauthorizedError(
        "Account is temporarily locked due to repeated failed login attempts. Please wait 15 minutes or reset your password."
      );
    }

    // Validate expected role if specified from login portal role tab
    const adminRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "SALES",
      "CA_FINANCE_EXPERT",
      "ACCOUNTANT",
      "LEGAL_PARTNER",
      "VIRTUAL_CFO",
    ];
    const isUserAdmin = adminRoles.includes(user.role);

    if (validated.expectedRole === "ADMIN" && !isUserAdmin) {
      throw new UnauthorizedError(
        "Access denied. This account does not possess administrative or operations privileges."
      );
    }

    const isValidPassword = await comparePassword(validated.password, user.passwordHash);
    if (!isValidPassword) {
      // Record failed login attempt
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          status: "FAILED",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent"),
        },
      });

      throw new UnauthorizedError("Invalid credentials");
    }

    // Record successful login history
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        status: "SUCCESS",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent"),
      },
    });

    // Determine target dashboard redirect
    let redirectUrl = "/customer/dashboard";
    if (["SUPER_ADMIN", "ADMIN", "SALES"].includes(user.role)) {
      redirectUrl = "/admin/dashboard";
    } else if (["CA_FINANCE_EXPERT", "ACCOUNTANT", "LEGAL_PARTNER", "VIRTUAL_CFO"].includes(user.role)) {
      redirectUrl = "/expert/dashboard";
    }

    // Create session & JWT
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

    // Audit log
    await recordAuditLog({
      userId: user.id,
      userRole: user.role,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });

    const response = apiSuccess(
      {
        user: session,
        token,
        redirectUrl,
      },
      "Login successful"
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
