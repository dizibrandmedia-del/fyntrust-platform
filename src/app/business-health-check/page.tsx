"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertCircle, Award } from "lucide-react";

export default function BusinessHealthCheckPage() {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Health check inputs
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("PVT_LTD");
  const [city, setCity] = useState("Lucknow");
  const [turnoverBand, setTurnoverBand] = useState("50L_TO_2CR");
  const [accountingQuality, setAccountingQuality] = useState("MONTHLY_UPDATED");
  const [cashFlowStatus, setCashFlowStatus] = useState("STABLE_PREDICTABLE");
  const [complianceStatus, setComplianceStatus] = useState("ALL_FILED_ON_TIME");
  const [misFrequency, setMisFrequency] = useState("MONTHLY_MIS");

  // Contact info
  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/diagnostics/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          city,
          turnoverBand,
          accountingQuality,
          cashFlowStatus,
          complianceStatus,
          misFrequency,
          contactName,
          contactMobile,
          contactEmail,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json.data);
        setStep(3);
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

        <div className="text-center space-y-3">
          <Badge variant="accent" size="md">
            Diagnostic Health Index
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Know the Financial Health of Your Business
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-xl mx-auto">
            Assess cash flow stability, compliance readiness, bookkeeping quality, and executive reporting visibility.
          </p>
        </div>

        {step === 1 && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Step 1: Business Operations Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Business Name</label>
                <Input
                  placeholder="e.g. Horizon Enterprises"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Annual Turnover Band</label>
                <select
                  value={turnoverBand}
                  onChange={(e) => setTurnoverBand(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="UNDER_20L">Under ₹20 Lakhs</option>
                  <option value="20L_TO_50L">₹20 Lakhs - ₹50 Lakhs</option>
                  <option value="50L_TO_2CR">₹50 Lakhs - ₹2 Crore</option>
                  <option value="2CR_TO_10CR">₹2 Crore - ₹10 Crore</option>
                  <option value="ABOVE_10CR">Above ₹10 Crore</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-fyn-slate-border space-y-4 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">1. Accounting & Bookkeeping Status</label>
                <select
                  value={accountingQuality}
                  onChange={(e) => setAccountingQuality(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="EXCELLENT_DAILY">Updated Daily / Weekly on Cloud ERP</option>
                  <option value="MONTHLY_UPDATED">Updated Monthly for GST / TDS</option>
                  <option value="BACKLOGGED">Backlogged by 2-3 Months</option>
                  <option value="YEAR_END_RUSH">Compiled Only at Financial Year-End</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">2. Cash Flow & Working Capital Health</label>
                <select
                  value={cashFlowStatus}
                  onChange={(e) => setCashFlowStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="STRONG_SURPLUS">Strong Surplus (3+ Months Buffer)</option>
                  <option value="STABLE_PREDICTABLE">Stable & Predictable Inflows</option>
                  <option value="DELAYED_RECEIVABLES">Delayed Client Receivables Causing Squeeze</option>
                  <option value="CRITICAL_SHORTAGE">Critical Working Capital Shortage</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">3. Statutory Filing & Compliance Track Record</label>
                <select
                  value={complianceStatus}
                  onChange={(e) => setComplianceStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="ALL_FILED_ON_TIME">100% On-Time with Zero Late Fees</option>
                  <option value="MINOR_DELAYS">Occasional Minor Delays</option>
                  <option value="NOTICES_PENDING">Pending Tax or MCA Notices to Resolve</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">4. Executive MIS & Financial Visibility</label>
                <select
                  value={misFrequency}
                  onChange={(e) => setMisFrequency(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="WEEKLY_DASHBOARD">Weekly Dashboard with Unit Economics</option>
                  <option value="MONTHLY_MIS">Monthly P&L and Balance Sheet Review</option>
                  <option value="YEAR_END_ONLY">Only Annual Tax Statements</option>
                </select>
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full font-bold" onClick={() => setStep(2)}>
              Proceed to Contact Details & Health Index →
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Step 2: Enter Contact for Health Index Report
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Mobile Number *</label>
                  <Input
                    required
                    placeholder="e.g. 9123456780"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Business Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. vikram@horizon.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button variant="primary" size="md" type="submit" className="w-full font-bold" disabled={loading}>
                  {loading ? "Computing Health Index..." : "Calculate Business Health Score →"}
                </Button>
                <Button variant="ghost" size="md" type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 3 && result && (
          <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="accent" size="md">
                  Overall Health Score: {result.overallScore}/100
                </Badge>
                <h2 className="text-xl font-bold font-heading text-fyn-slate mt-1">
                  Business Financial Scorecard
                </h2>
              </div>
            </div>

            {/* Category Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(result.categoryScores).map(([k, v]: any) => (
                <div key={k} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-fyn-slate-muted uppercase font-bold block">{v.label}</span>
                  <div className={`text-lg font-bold font-heading ${v.score >= 75 ? "text-emerald-700" : "text-amber-700"}`}>
                    {v.score}%
                  </div>
                </div>
              ))}
            </div>

            {result.improvements?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase text-fyn-slate tracking-wider">
                  Key Strategic Recommendations:
                </h3>
                <div className="space-y-2 text-xs">
                  {result.improvements.map((imp: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-fyn-slate">
                      • {imp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button variant="primary" size="md" className="w-full font-bold">
                  Get Detailed CA & CFO Review →
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                Retake Assessment
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
