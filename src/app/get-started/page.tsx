"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import {
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function GetStartedForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") || "gst-registration";
  const defaultPackage = searchParams.get("package") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedService, setSelectedService] = useState(defaultService);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    city: "",
    businessType: "Private Limited",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const services = [
    { slug: "gst-registration", name: "GST Registration", category: "Tax Services" },
    { slug: "private-limited-company-registration", name: "Private Limited Incorporation", category: "Business Registration" },
    { slug: "gst-return-filing", name: "GST Return Filing (Monthly)", category: "Tax Services" },
    { slug: "income-tax-return-filing", name: "Income Tax Return (ITR)", category: "Tax Services" },
    { slug: "monthly-bookkeeping-accounting", name: "Monthly Bookkeeping & Accounting", category: "Accounting" },
    { slug: "virtual-cfo-advisory", name: "Virtual CFO Advisory", category: "Executive Advisory" },
    { slug: "annual-roc-filing-company", name: "Annual ROC Filing for Companies", category: "ROC Compliance" },
    { slug: "trademark-registration", name: "Trademark Registration", category: "Legal Support" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const activeServiceName = services.find((s) => s.slug === selectedService)?.name || selectedService;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim() || undefined,
          businessName: formData.businessName.trim() || undefined,
          city: formData.city.trim() || undefined,
          businessType: formData.businessType,
          notes: `[Initiated Service: ${activeServiceName}] [Package: ${defaultPackage}] ${formData.notes}`.trim(),
          source: "GET_STARTED_FLOW",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to initiate service request.");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-8 max-w-4xl mx-auto space-y-10 font-body">
      <div className="text-center space-y-3">
        <Badge variant="primary">Step-by-Step Onboarding</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Start Your Business Service Journey
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-xl mx-auto">
          Choose your service, provide basic business details, and get assigned a dedicated Chartered Accountant.
        </p>
      </div>

      {success ? (
        <Card variant="executive" className="text-center p-8 sm:p-12 space-y-5">
          <div className="w-16 h-16 bg-[#78BB69]/20 text-[#78BB69] rounded-full flex items-center justify-center mx-auto border border-[#78BB69]/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Service Initiation Successful!
          </h2>
          <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-lg mx-auto leading-relaxed">
            Your service request has been registered in our central desk. A senior Fyntrust CA will
            call you on <strong>+91 {formData.mobile}</strong> to verify documents and initiate your statutory filing.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" size="md">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="md">
                Go to Client Portal
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-fyn-slate-border shadow-sm space-y-8">
          {/* Step Indicators */}
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 1 ? "bg-fyn-primary text-white" : "bg-fyn-primary-subtle text-fyn-primary"
                }`}
              >
                1
              </div>
              <span className="font-bold text-sm text-fyn-slate">Choose Service</span>
            </div>

            <div className="w-12 h-0.5 bg-fyn-slate-border hidden sm:block" />

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 2 ? "bg-fyn-primary text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </div>
              <span className="font-bold text-sm text-fyn-slate">Business Details</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.slug}
                    onClick={() => setSelectedService(s.slug)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      selectedService === s.slug
                        ? "border-fyn-primary bg-fyn-primary-subtle/40 shadow-sm"
                        : "border-fyn-slate-border hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-fyn-slate font-heading">{s.name}</div>
                      <div className="text-[11px] text-fyn-slate-muted">{s.category}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Business Details
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person Name"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Mobile Number"
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. rahul@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Business City"
                  placeholder="e.g. Lucknow, Mumbai, Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  placeholder="e.g. Verma Enterprises"
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
                    { label: "Startup / New Venture", value: "Startup" },
                  ]}
                />
              </div>

              <Textarea
                label="Any specific requirements or notes (Optional)"
                placeholder="Share any details on turnover, state of registration, or priority deadlines..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="flex items-center justify-between pt-4 border-t border-fyn-slate-border">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  ← Back to Services
                </Button>
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                  Confirm & Initiate Service
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading onboarding flow..." />
        </div>
      }
    >
      <GetStartedForm />
    </Suspense>
  );
}
