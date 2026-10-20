import React from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Lock, Eye, Server, FileCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Fyntrust",
  description: "Learn how Fyntrust safeguards client confidential financial records, KYC documents, and business tax data.",
  alternates: {
    canonical: "https://fyntrust.in/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: "Privacy Policy", url: "/privacy" }]} />

      <div className="space-y-3">
        <Badge variant="accent" size="md">Confidentiality & Data Protection</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Fyntrust Privacy & Data Security Policy
        </h1>
        <p className="text-xs text-fyn-slate-muted">
          Last updated: August 2026 • In compliance with the Information Technology Act, 2000 & Digital Data Protection Standards.
        </p>
      </div>

      <Card variant="default" className="p-8 border-fyn-slate-border space-y-6 text-xs text-fyn-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Lock className="w-4 h-4 text-fyn-primary" /> 1. Commitment to Client Confidentiality
          </h2>
          <p>
            At Fyntrust (Fyntrust Technologies Pvt. Ltd.), we recognize that financial, accounting, tax, and incorporation documents are strictly confidential. We apply bank-grade AES-256 encryption at rest and TLS 1.3 encryption in transit for all document uploads, balance sheets, KYC proofs, and GST filings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-fyn-primary" /> 2. Information We Collect
          </h2>
          <p>
            When you engage Fyntrust for Chartered Accountancy, Tax, or Legal services, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-fyn-slate-muted">
            <li><strong>Identity & KYC Details:</strong> Full Name, Email, Mobile Number, PAN, Aadhaar, DIN (where statutory filing demands).</li>
            <li><strong>Corporate & Entity Records:</strong> Certificate of Incorporation, MOA/AOA, GSTIN, Bank Statements, Financial Ledgers.</li>
            <li><strong>Billing & Invoicing:</strong> Registered billing address, GST number for input tax credit, and payment receipts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Eye className="w-4 h-4 text-fyn-primary" /> 3. Strict Need-to-Know Access
          </h2>
          <p>
            Your confidential files are stored within your isolated customer document vault. Documents are accessible <em>only</em> to your assigned certified Chartered Accountant, Company Secretary, or verified Fyntrust operations reviewer assigned to your specific order. We never sell, rent, or trade client financial data to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Server className="w-4 h-4 text-fyn-primary" /> 4. Data Retention & Document Vault
          </h2>
          <p>
            Statutory records, filed returns, and acknowledgments are securely preserved in your customer vault throughout your active subscription and in accordance with Indian Companies Act & Income Tax retention mandates (typically 8 financial years).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fyn-primary" /> 5. Contact the Privacy & Compliance Officer
          </h2>
          <p>
            For any queries regarding your data security, deletion requests, or confidentiality questions:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-fyn-slate font-medium">
            <strong>Fyntrust Compliance Desk</strong><br />
            Email: <a href="mailto:team@fyntrust.in" className="text-fyn-primary underline">team@fyntrust.in</a><br />
            Phone: +91 9118066449<br />
            Corporate Office: Hazratganj Financial District, Lucknow, Uttar Pradesh, 226001.
          </div>
        </section>
      </Card>
    </div>
  );
}
