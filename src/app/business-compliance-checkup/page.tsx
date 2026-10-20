"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, FileText, ArrowLeft } from "lucide-react";

export default function BusinessComplianceCheckupPage() {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Business profile
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("PVT_LTD");
  const [city, setCity] = useState("Lucknow");

  // Diagnostic questions
  const [answers, setAnswers] = useState<Record<string, string>>({
    gstFiledMonthly: "YES",
    advanceTaxCalculated: "YES",
    tdsDeductedProperly: "YES",
    tdsReturnsFiled: "YES",
    annualRocFiled: "YES",
    dir3KycCompleted: "YES",
    monthlyAccountingUpdated: "YES",
  });

  // Lead contact info
  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/diagnostics/compliance-checkup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          city,
          contactName,
          contactMobile,
          contactEmail,
          answers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json.data);
        setStep(3); // Result view
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/tools" className="inline-flex items-center gap-1 text-xs font-bold text-fyn-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Toolkit
        </Link>

        {/* Hero Title */}
        <div className="text-center space-y-3">
          <Badge variant="accent" size="md">
            Interactive Diagnostic
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Is Your Business Fully Compliant?
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-xl mx-auto">
            Take this comprehensive 2-minute diagnostic to identify potential statutory exposure across GST, TDS, ROC, and ITR.
          </p>
        </div>

        {/* Step 1: Business Profile & Questionnaire */}
        {step === 1 && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Step 1: Entity Structure & Basic Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Business Name</label>
                <Input
                  placeholder="e.g. Apex Tech Solutions"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Entity Structure *</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="PVT_LTD">Private Limited Company</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="OPC">One Person Company (OPC)</option>
                  <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                  <option value="PARTNERSHIP">Partnership Firm</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-fyn-slate-border space-y-4">
              <h2 className="text-sm font-bold font-heading text-fyn-slate">
                Statutory Compliance Questionnaire
              </h2>

              <div className="space-y-4 text-xs">
                {/* GST */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-fyn-slate">1. Are your GST returns (GSTR-1 & GSTR-3B) filed on or before the 11th and 20th of every month?</div>
                  <div className="flex gap-4">
                    {["YES", "SOMETIMES_LATE", "NO"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gstFiledMonthly"
                          checked={answers.gstFiledMonthly === opt}
                          onChange={() => setAnswers({ ...answers, gstFiledMonthly: opt })}
                        />
                        <span>{opt.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advance Tax */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-fyn-slate">2. Is Advance Tax calculated and deposited in 4 quarterly installments (June, Sep, Dec, March)?</div>
                  <div className="flex gap-4">
                    {["YES", "NO"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="advanceTaxCalculated"
                          checked={answers.advanceTaxCalculated === opt}
                          onChange={() => setAnswers({ ...answers, advanceTaxCalculated: opt })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* TDS */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-fyn-slate">3. Are TDS deductions (Section 194C/J/I) deposited monthly and 24Q/26Q returns filed quarterly?</div>
                  <div className="flex gap-4">
                    {["YES", "NO"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tdsDeductedProperly"
                          checked={answers.tdsDeductedProperly === opt}
                          onChange={() => setAnswers({ ...answers, tdsDeductedProperly: opt })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ROC */}
                {(businessType === "PVT_LTD" || businessType === "LLP") && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-fyn-slate">4. Have you completed annual MCA filings (AOC-4, MGT-7) and Director DIR-3 KYC for the last FY?</div>
                    <div className="flex gap-4">
                      {["YES", "NO"].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="annualRocFiled"
                            checked={answers.annualRocFiled === opt}
                            onChange={() => setAnswers({ ...answers, annualRocFiled: opt })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accounting */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-fyn-slate">5. Is your monthly bookkeeping and bank reconciliation up to date with zero backlogs?</div>
                  <div className="flex gap-4">
                    {["YES", "NO"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="monthlyAccountingUpdated"
                          checked={answers.monthlyAccountingUpdated === opt}
                          onChange={() => setAnswers({ ...answers, monthlyAccountingUpdated: opt })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full font-bold" onClick={() => setStep(2)}>
              Proceed to Contact Details & Analysis →
            </Button>
          </Card>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Step 2: Enter Contact for Detailed Report
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              We will generate your personalized compliance scorecard and area-wise risk summary immediately.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Mobile Number *</label>
                  <Input
                    required
                    placeholder="e.g. 9876543210"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Business Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. rahul@company.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button variant="primary" size="md" type="submit" className="w-full font-bold" disabled={loading}>
                  {loading ? "Analyzing Compliance Health..." : "Generate Compliance Scorecard →"}
                </Button>
                <Button variant="ghost" size="md" type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Result View */}
        {step === 3 && result && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant={result.score >= 80 ? "accent" : "warning"} size="md">
                  Compliance Score: {result.score}/100
                </Badge>
                <h2 className="text-xl font-bold font-heading text-fyn-slate">
                  {result.score >= 80 ? "Low Compliance Exposure" : "Potential Areas to Review"}
                </h2>
              </div>
            </div>

            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              {result.summary}
            </p>

            {result.reviewAreas?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Key Areas Identified for Attention:
                </h3>
                <div className="space-y-2 text-xs">
                  {result.reviewAreas.map((area: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                      • {area}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.suggestedServices?.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-fyn-slate-border">
                <h3 className="text-xs font-bold uppercase text-fyn-primary tracking-wider">
                  Recommended Fyntrust Retainer Solutions:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.suggestedServices.map((srv: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-fyn-slate font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#78BB69]" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button variant="primary" size="md" className="w-full font-bold">
                  Talk to a Fyntrust CA Expert →
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                Run Another Checkup
              </Button>
            </div>

            <p className="text-[11px] text-fyn-slate-muted italic text-center pt-2">
              {result.disclaimer}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
