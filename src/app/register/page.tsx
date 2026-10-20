"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    businessName: "",
    businessType: "Private Limited",
    city: "",
    state: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          fullName: formData.fullName,
          businessName: formData.businessName,
          businessType: formData.businessType,
          city: formData.city || undefined,
          state: formData.state || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Registration failed.");
      }

      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-8 max-w-lg mx-auto space-y-8 font-body">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <Badge variant="primary">Client Onboarding</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Create Your Fyntrust Account
        </h1>
        <p className="text-xs text-fyn-slate-muted">
          Manage your business accounting, tax filings, and company secretarial compliance in one place.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8 space-y-6 shadow-md border-fyn-slate-border">
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Mobile Number"
              required
              type="tel"
              placeholder="10-digit number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              required
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Set Password"
              required
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Entity Name"
              required
              placeholder="e.g. Acme Tech Pvt Ltd"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
            <Select
              label="Entity Type"
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              options={[
                { label: "Private Limited Company", value: "Private Limited" },
                { label: "Limited Liability Partnership (LLP)", value: "LLP" },
                { label: "Sole Proprietorship", value: "Proprietorship" },
                { label: "Partnership Firm", value: "Partnership" },
                { label: "One Person Company (OPC)", value: "OPC" },
                { label: "Startup / Early Stage", value: "Startup" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g. Lucknow, Delhi"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              placeholder="e.g. Uttar Pradesh, Delhi"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Fyntrust Account
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-fyn-slate-border text-center text-xs text-fyn-slate-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-fyn-primary hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
