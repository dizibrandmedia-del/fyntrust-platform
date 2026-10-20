import React from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FileText, CheckCircle2, AlertCircle, Scale, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Fyntrust",
  description: "Terms and conditions governing the engagement of Fyntrust digital Chartered Accountancy, Tax, and Legal Advisory services.",
  alternates: {
    canonical: "https://fyntrust.in/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: "Terms of Service", url: "/terms" }]} />

      <div className="space-y-3">
        <Badge variant="primary" size="md">Service Engagement Agreement</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Terms & Conditions
        </h1>
        <p className="text-xs text-fyn-slate-muted">
          Last updated: August 2026 • Governing client engagements with Fyntrust Technologies Pvt. Ltd.
        </p>
      </div>

      <Card variant="default" className="p-8 border-fyn-slate-border space-y-6 text-xs text-fyn-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Scale className="w-4 h-4 text-fyn-primary" /> 1. Professional Scope & Digital Execution
          </h2>
          <p>
            Fyntrust operates a premier digital corporate advisory and financial compliance platform. When placing an order for Company Registration, GST, Tax Audit, Bookkeeping, or Virtual CFO services, your statutory filings and certifications are executed exclusively by accredited Chartered Accountants, Company Secretaries, and Legal Experts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <FileText className="w-4 h-4 text-fyn-primary" /> 2. Accuracy of Client Information & Documents
          </h2>
          <p>
            Clients are responsible for providing authentic, complete, and un-tampered financial records, invoices, and KYC documents in their Document Vault. Fyntrust and its assigned experts rely on client representations for statutory computations and are not liable for penalties resulting from undisclosed client revenues or forged documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-fyn-primary" /> 3. Government Fees & Turnaround Timelines (SLA)
          </h2>
          <p>
            Service turnaround times (SLAs) begin upon receipt of complete and verified documents from the client. Government portal downtime (e.g., MCA V3, GST Portal, Income Tax Portal) or government officer queries (e.g. Resubmission notices) are beyond Fyntrust's operational control and extend the final approval timeline accordingly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-fyn-primary" /> 4. Payments & Tax Invoices
          </h2>
          <p>
            All fees are displayed transparently prior to checkout. Upon successful payment verification, an official GST-compliant tax invoice is automatically generated and downloadable directly from your Customer Portal.
          </p>
        </section>
      </Card>
    </div>
  );
}
