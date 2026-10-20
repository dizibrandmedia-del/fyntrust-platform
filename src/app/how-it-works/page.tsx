import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Headphones,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "How Fyntrust Works — Seamless Digital CA & Compliance Delivery | Fyntrust",
  description: "Learn how Fyntrust pairs your business with certified Chartered Accountants and Virtual CFOs through a transparent digital workflow.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Select Service & Outline Requirements",
      desc: "Choose from 25+ corporate services across Business Incorporation, GST, Tax Audit, Bookkeeping, or CFO Advisory, and provide basic entity details.",
      icon: FileText,
    },
    {
      step: "02",
      title: "Transparent Scope & Payment",
      desc: "Receive clear, upfront pricing with zero hidden surcharges. Complete payment securely via UPI, Card, Netbanking, or Corporate Invoice.",
      icon: ShieldCheck,
    },
    {
      step: "03",
      title: "Upload Documents to Secure Client Vault",
      desc: "Upload entity records, PAN, Aadhaar, bank statements, or invoices directly into your encrypted, bank-grade digital document vault.",
      icon: Lock,
    },
    {
      step: "04",
      title: "Fyntrust Assigns Qualified CA / CS Expert",
      desc: "Our operations desk evaluates your jurisdiction and domain to assign a verified Chartered Accountant or Company Secretary to lead your filing.",
      icon: UserCheck,
    },
    {
      step: "05",
      title: "Drafting, Computation & Review",
      desc: "Your assigned expert prepares the filings, computes tax credits/liabilities, drafts resolutions, and shares computations for your review.",
      icon: Activity,
    },
    {
      step: "06",
      title: "Statutory Portal Submission & Delivery",
      desc: "Filings are executed directly on MCA, GSTN, or Income Tax portals. Verified ARN acknowledgments, challans, and certificates are delivered to your portal.",
      icon: CheckCircle2,
    },
    {
      step: "07",
      title: "Proactive Recurring Compliance Tracking",
      desc: "Never miss a due date. Fyntrust automatically tracks future return deadlines, advance taxes, and ROC filings with proactive CA reminders.",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent">Transparent Delivery</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          How Fyntrust Delivers Corporate Excellence
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          We have eliminated cumbersome paperwork and endless follow-ups. Experience institutional
          accounting and legal services through a streamlined, paperless workflow.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {steps.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.step}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-fyn-slate-border shadow-sm hover:border-fyn-primary hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-6 group"
            >
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-3xl font-extrabold text-[#78BB69] font-heading w-10">
                  {item.step}
                </span>
                <div className="p-3 rounded-2xl bg-fyn-primary-subtle text-fyn-primary group-hover:bg-fyn-primary group-hover:text-white transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold font-heading text-fyn-slate">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-fyn-slate-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Confidentiality Callout */}
      <div className="p-8 rounded-3xl bg-[#142A2B] text-white border border-white/10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#78BB69] text-xs font-bold">
            <Lock className="w-4 h-4" />
            <span>Bank-Grade Encryption</span>
          </div>
          <h3 className="text-xl font-bold font-heading">Your Data Is Strictly Confidential</h3>
          <p className="text-xs text-white/70 max-w-lg">
            All financials, documents, and corporate filings are stored with AES-256 encryption.
            Experts sign strict non-disclosure agreements before accessing any client data.
          </p>
        </div>
        <Link href="/get-started">
          <Button variant="accent" size="lg" className="font-bold shrink-0">
            Start Your Service Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
