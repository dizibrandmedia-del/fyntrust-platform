import React from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy | Fyntrust",
  description: "Clear and fair cancellation and refund terms for Fyntrust CA and corporate services.",
  alternates: {
    canonical: "https://fyntrust.in/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: "Refund Policy", url: "/refund-policy" }]} />

      <div className="space-y-3">
        <Badge variant="accent" size="md">Client Satisfaction Policy</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-fyn-slate-muted">
          Transparent guidelines governing service cancellation, fee adjustments, and government challan exclusions.
        </p>
      </div>

      <Card variant="default" className="p-8 border-fyn-slate-border space-y-6 text-xs text-fyn-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-fyn-primary" /> 1. Pre-Processing Cancellation
          </h2>
          <p>
            If you request cancellation of a service order <strong>before</strong> our expert team has commenced drafting, document verification, or name reservation, you are eligible for a 100% refund of professional fees minus standard gateway processing charges (typically 2-3%).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" /> 2. Government Fees & Challans Non-Refundability
          </h2>
          <p>
            Once government challans, stamp duty, MCA name approval fees, or PAN/DSC application fees have been paid to official government portals, statutory fees cannot be refunded by Fyntrust as government portals do not offer fee reversals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-fyn-primary" /> 3. SLA & Quality Assurance Guarantee
          </h2>
          <p>
            In the rare event that an order encounters delay solely attributable to Fyntrust operational oversight, we offer dedicated priority escalation and fee credits applicable to recurring compliance retainers.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-fyn-slate">
          <strong>Need to initiate a refund request?</strong><br />
          Email our billing operations desk at <a href="mailto:team@fyntrust.in" className="text-fyn-primary underline font-bold">team@fyntrust.in</a> with your Order ID (e.g. FYN-XXXX). Requests are reviewed within 2 business days.
        </div>
      </Card>
    </div>
  );
}
