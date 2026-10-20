import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password";
import { signToken, verifyToken } from "./jwt";
import { generateOTP, hashOTP, verifyOTP } from "./otp";
import { UserSession } from "../types/auth";
import { loginSchema, resetPasswordSchema } from "../security/validation";

describe("Authentication Foundation", () => {
  it("should hash and verify passwords securely", async () => {
    const raw = "SecurePassword@2026";
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(raw);

    const isMatch = await comparePassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrong = await comparePassword("WrongPassword", hash);
    expect(isWrong).toBe(false);
  });

  it("should sign and verify JWT session tokens", () => {
    const session: UserSession = {
      userId: "user-uuid-1234",
      email: "test@fyntrust.in",
      mobile: "9118066449",
      fullName: "Test CA User",
      role: "CA_FINANCE_EXPERT",
      expertProfileId: "expert-uuid-5678",
    };

    const token = signToken(session);
    expect(token).toBeTypeOf("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(session.userId);
    expect(decoded?.role).toBe("CA_FINANCE_EXPERT");
    expect(decoded?.expertProfileId).toBe("expert-uuid-5678");
  });

  it("should return null for invalid or tampered JWT token", () => {
    const decoded = verifyToken("invalid.tampered.token");
    expect(decoded).toBeNull();
  });

  it("should generate, hash, and verify 6-digit OTP", () => {
    const otp = generateOTP(6);
    expect(otp.length).toBe(6);

    const hash = hashOTP(otp);
    expect(hash).toBeDefined();

    expect(verifyOTP(otp, hash)).toBe(true);
    expect(verifyOTP("000000", hash)).toBe(false);
  });

  it("should validate client and admin expected roles in login schema", () => {
    const clientPayload = {
      identifier: "client@company.com",
      password: "ClientPassword123",
      expectedRole: "CLIENT",
    };
    expect(loginSchema.safeParse(clientPayload).success).toBe(true);

    const adminPayload = {
      identifier: "admin@fyntrust.in",
      password: "AdminPassword123",
      expectedRole: "ADMIN",
    };
    expect(loginSchema.safeParse(adminPayload).success).toBe(true);

    const invalidRolePayload = {
      identifier: "user@domain.com",
      password: "Password123",
      expectedRole: "SUPER_HACKER",
    };
    expect(loginSchema.safeParse(invalidRolePayload).success).toBe(false);
  });

  it("should validate reset password schema requirements", () => {
    const validReset = {
      identifier: "client@company.com",
      otp: "123456",
      newPassword: "NewSecurePassword2026",
    };
    expect(resetPasswordSchema.safeParse(validReset).success).toBe(true);

    const invalidOtp = {
      identifier: "client@company.com",
      otp: "12",
      newPassword: "NewSecurePassword2026",
    };
    expect(resetPasswordSchema.safeParse(invalidOtp).success).toBe(false);

    const shortPassword = {
      identifier: "client@company.com",
      otp: "123456",
      newPassword: "short",
    };
    expect(resetPasswordSchema.safeParse(shortPassword).success).toBe(false);
  });
});
