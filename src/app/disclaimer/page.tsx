import React from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, Info, BookOpen } from "lucide-react";

export const metadata = {
  title: "Professional Disclaimer | Fyntrust",
  description: "Fyntrust professional advisory, statutory filing, and free business calculator disclaimer.",
  alternates: {
    canonical: "https://fyntrust.in/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: "Disclaimer", url: "/disclaimer" }]} />

      <div className="space-y-3">
        <Badge variant="warning" size="md">Statutory Disclaimer</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Professional & Regulatory Disclaimer
        </h1>
        <p className="text-xs text-fyn-slate-muted">
          Important disclosures regarding platform tools, legal representation, and statutory computations.
        </p>
      </div>

      <Card variant="default" className="p-8 border-fyn-slate-border space-y-6 text-xs text-fyn-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> 1. Professional Advisory Execution
          </h2>
          <p>
            Fyntrust is a digital technology platform facilitating business incorporation, statutory taxation, and financial compliance services. All audits, statutory filings, and legal opinions are performed directly by qualified Chartered Accountants (ICAI members), Company Secretaries (ICSI members), or Advocates registered with respective Bar Councils.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Info className="w-4 h-4 text-fyn-primary" /> 2. Free Business Tools & Calculators
          </h2>
          <p>
            The free calculators, Business Compliance Checkup diagnostic, and Business Health Check scorecard available on this website are provided strictly for educational and preliminary informational purposes. They do not constitute formal audited financial opinions. Users should consult their assigned Fyntrust Chartered Accountant for personalized tax planning.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-fyn-primary" /> 3. No Government Affiliation Claim
          </h2>
          <p>
            Fyntrust Technologies Pvt. Ltd. is an independent private corporate advisory enterprise and is not an agency of the Government of India, Ministry of Corporate Affairs, or Central Board of Direct Taxes. All filings are submitted to official portals on behalf of clients pursuant to authorized professional mandates.
          </p>
        </section>
      </Card>
    </div>
  );
}
