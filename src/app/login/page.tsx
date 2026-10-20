"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import {
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  // Top-Level Role Selection: "CLIENT" or "ADMIN"
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "ADMIN">("CLIENT");

  // Client Auth Method: "password" or "otp"
  const [clientAuthMode, setClientAuthMode] = useState<"password" | "otp">("password");

  // Client credentials
  const [clientIdentifier, setClientIdentifier] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientMobile, setClientMobile] = useState("");
  const [clientOtp, setClientOtp] = useState("");
  const [clientOtpSent, setClientOtpSent] = useState(false);

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Password visibility toggles
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Handle Client Password Login
  const handleClientPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: clientIdentifier,
          password: clientPassword,
          expectedRole: "CLIENT",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid email or password.");
      }

      setSuccessMsg("Authentication successful. Opening your client dashboard...");
      const targetUrl = redirectParam || data.data?.redirectUrl || "/customer/dashboard";
      setTimeout(() => {
        router.push(targetUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: adminEmail,
          password: adminPassword,
          expectedRole: "ADMIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid administrator credentials.");
      }

      setSuccessMsg("Administrator identity verified. Opening operations centre...");
      const targetUrl = redirectParam || data.data?.redirectUrl || "/admin/dashboard";
      setTimeout(() => {
        router.push(targetUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Admin authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Client OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: clientMobile,
          purpose: "LOGIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to generate OTP.");
      }

      setClientOtpSent(true);
      setSuccessMsg(`OTP sent successfully to +91 ${clientMobile}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Client OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const res = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: clientMobile,
          otp: clientOtp,
          purpose: "LOGIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid OTP code.");
      }

      if (!data.data?.isExistingUser) {
        setSuccessMsg("Mobile verified! Please complete your registration.");
        setTimeout(() => {
          router.push(`/register?mobile=${encodeURIComponent(clientMobile)}`);
        }, 800);
        return;
      }

      setSuccessMsg("OTP verified! Redirecting to your dashboard...");
      const targetUrl = redirectParam || data.data?.redirectUrl || "/customer/dashboard";
      setTimeout(() => {
        router.push(targetUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Step 1: Send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const isMobile = /^[6-9]\d{9}$/.test(forgotIdentifier.trim());
      const payload = isMobile
        ? { mobile: forgotIdentifier.trim(), purpose: "RESET_PASSWORD" }
        : { email: forgotIdentifier.trim(), purpose: "RESET_PASSWORD" };

      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to send reset OTP.");
      }

      setForgotOtpSent(true);
      setForgotSuccess("Verification OTP sent. Enter the code and your new password.");
    } catch (err: any) {
      setForgotError(err.message || "Unable to send reset OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Forgot Password - Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to reset password.");
      }

      setForgotSuccess("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotOtpSent(false);
        setForgotIdentifier("");
        setForgotOtp("");
        setForgotNewPassword("");
        setSuccessMsg("Password reset successfully. Please sign in with your new password.");
      }, 1200);
    } catch (err: any) {
      setForgotError(err.message || "Failed to update password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-8 max-w-md mx-auto space-y-6 font-body">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <Badge variant="primary">Client & Partner Portal</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Sign In to Fyntrust
        </h1>
        <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
          Access your encrypted documents, track statutory CA filings, and manage compliance.
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card variant="default" className="p-6 sm:p-8 space-y-6 shadow-lg border-fyn-slate-border">
        {/* ============================================================
            1. PRIMARY ROLE SELECTOR (Client / Partner vs Admin)
            ============================================================ */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-fyn-slate-muted">
            Login Role
          </label>
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("CLIENT");
                resetMessages();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === "CLIENT"
                  ? "bg-white text-fyn-primary shadow-sm border border-slate-200"
                  : "text-fyn-slate-muted hover:text-fyn-slate"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Client / Partner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole("ADMIN");
                resetMessages();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === "ADMIN"
                  ? "bg-[#01574F] text-white shadow-sm"
                  : "text-fyn-slate-muted hover:text-fyn-slate"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {/* ============================================================
            2. CLIENT / PARTNER VIEW
            ============================================================ */}
        {selectedRole === "CLIENT" ? (
          <div className="space-y-5">
            {/* Sub-Toggle: Email / Password vs Mobile OTP */}
            <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setClientAuthMode("password");
                  resetMessages();
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  clientAuthMode === "password"
                    ? "bg-white text-fyn-primary font-bold shadow-sm"
                    : "text-fyn-slate-muted hover:text-fyn-slate"
                }`}
              >
                Email / Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientAuthMode("otp");
                  resetMessages();
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  clientAuthMode === "otp"
                    ? "bg-white text-fyn-primary font-bold shadow-sm"
                    : "text-fyn-slate-muted hover:text-fyn-slate"
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {/* Client: Email / Password Form */}
            {clientAuthMode === "password" ? (
              <form onSubmit={handleClientPasswordLogin} className="space-y-4">
                <Input
                  label="Email Address or Mobile Number"
                  required
                  placeholder="name@company.com or 9876543210"
                  value={clientIdentifier}
                  onChange={(e) => setClientIdentifier(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                />

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      label="Password"
                      required
                      type={showClientPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientPassword(!showClientPassword)}
                      className="absolute right-3 top-[34px] text-slate-400 hover:text-fyn-slate"
                    >
                      {showClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotIdentifier(clientIdentifier);
                        setForgotError(null);
                        setForgotSuccess(null);
                      }}
                      className="text-[11px] font-semibold text-fyn-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full font-bold shadow-sm"
                    isLoading={isLoading}
                  >
                    Sign In as Client
                  </Button>
                </div>
              </form>
            ) : !clientOtpSent ? (
              /* Client: Mobile OTP Form - Step 1 */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="Registered Mobile Number"
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={clientMobile}
                  onChange={(e) => setClientMobile(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full font-bold shadow-sm"
                    isLoading={isLoading}
                  >
                    Send 6-Digit OTP
                  </Button>
                </div>
              </form>
            ) : (
              /* Client: Mobile OTP Form - Step 2 */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  label="Enter 6-Digit OTP"
                  required
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={clientOtp}
                  onChange={(e) => setClientOtp(e.target.value)}
                  leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                />

                <div className="flex items-center justify-between text-xs text-fyn-slate-muted">
                  <span>Sent to +91 {clientMobile}</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-fyn-primary font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setClientOtpSent(false)}
                  >
                    Change Number
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    className="flex-1 font-bold shadow-sm"
                    isLoading={isLoading}
                  >
                    Verify OTP & Login
                  </Button>
                </div>
              </form>
            )}

            {/* Client Registration Link */}
            <div className="pt-4 border-t border-fyn-slate-border text-center text-xs text-fyn-slate-muted">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-fyn-primary hover:underline">
                Register as New Business
              </Link>
            </div>
          </div>
        ) : (
          /* ============================================================
              3. ADMIN & OPERATIONS VIEW
              ============================================================ */
          <div className="space-y-5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-fyn-slate flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#01574F] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-600">
                Restricted to authorized Fyntrust operations personnel, verified Chartered Accountants, and system administrators.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                label="Admin Work Email"
                required
                type="email"
                placeholder="admin@fyntrust.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <div className="relative">
                <Input
                  label="Master Password"
                  required
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-fyn-slate"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-bold bg-[#01574F] hover:bg-[#014740] shadow-sm"
                  isLoading={isLoading}
                >
                  Sign In to Admin Centre
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-fyn-slate-border text-center text-[11px] text-fyn-slate-muted">
              Admin accounts are provisioned exclusively by the Fyntrust Executive Desk.
            </div>
          </div>
        )}
      </Card>

      {/* ============================================================
          FORGOT PASSWORD MODAL
          ============================================================ */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-fyn-primary-subtle text-fyn-primary">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm text-fyn-slate">Reset Account Password</h3>
                  <p className="text-[11px] text-fyn-slate-muted">Verify via OTP to set a new password</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && <Alert variant="error">{forgotError}</Alert>}
            {forgotSuccess && <Alert variant="success">{forgotSuccess}</Alert>}

            {!forgotOtpSent ? (
              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <Input
                  label="Registered Email or 10-Digit Mobile"
                  required
                  placeholder="e.g. name@company.com or 9876543210"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={forgotLoading}>
                    Send Reset OTP
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="6-Digit Reset OTP"
                  required
                  placeholder="123456"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                />
                <Input
                  label="New Secure Password (min 8 characters)"
                  required
                  type="password"
                  placeholder="••••••••"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotOtpSent(false)}
                  >
                    Back
                  </Button>
                  <Button type="submit" variant="accent" size="sm" isLoading={forgotLoading}>
                    Update Password & Close
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center text-xs text-fyn-slate-muted">
          Loading authentication portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
