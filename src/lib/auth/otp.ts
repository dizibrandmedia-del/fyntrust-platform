import crypto from "crypto";

export function generateOTP(length: number = 6): string {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    // Return standard test OTP for automated testing if configured, or random 6-digit
    return "123456";
  }
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOTP(inputOtp: string, storedHash: string): boolean {
  const inputHash = hashOTP(inputOtp);
  return inputHash === storedHash;
}
