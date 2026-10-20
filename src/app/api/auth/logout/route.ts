import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getSessionFromRequest } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (session) {
      // Record logout in audit logs
      await recordAuditLog({
        userId: session.userId,
        userRole: session.role,
        action: "STATUS_CHANGE",
        entity: "User",
        entityId: session.userId,
        newValue: { status: "LOGGED_OUT" },
        ipAddress: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      });
    }

    const response = apiSuccess({ loggedOut: true }, "Logged out successfully");

    // Invalidate and delete auth cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
