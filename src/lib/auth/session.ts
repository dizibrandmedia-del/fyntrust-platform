import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { UserSession, UserRole } from "../types/auth";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export const AUTH_COOKIE_NAME = "fyntrust_auth_token";

export function getSessionFromToken(token: string): UserSession | null {
  return verifyToken(token);
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = verifyToken(token);
    if (session) return session;
  }

  // 2. Check HTTP-only cookie
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (cookie && cookie.value) {
    const session = verifyToken(cookie.value);
    if (session) return session;
  }

  return null;
}

export function requireAuth(req: NextRequest): UserSession {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw new UnauthorizedError("Authentication required to access this resource");
  }
  return session;
}

export function requireRole(req: NextRequest, allowedRoles: UserRole[]): UserSession {
  const session = requireAuth(req);
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(`Access denied for role ${session.role}`);
  }
  return session;
}

