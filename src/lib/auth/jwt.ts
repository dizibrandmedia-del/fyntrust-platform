import jwt from "jsonwebtoken";
import { JWTPayload, UserSession } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fyntrust-fallback-secret-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(session: UserSession): string {
  const payload: JWTPayload = {
    sub: session.userId,
    email: session.email,
    mobile: session.mobile,
    fullName: session.fullName,
    role: session.role,
    customerProfileId: session.customerProfileId,
    expertProfileId: session.expertProfileId,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      userId: decoded.sub,
      email: decoded.email,
      mobile: decoded.mobile,
      fullName: decoded.fullName,
      role: decoded.role,
      customerProfileId: decoded.customerProfileId,
      expertProfileId: decoded.expertProfileId,
    };
  } catch (error) {
    return null;
  }
}
