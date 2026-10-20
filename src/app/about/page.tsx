import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Fyntrust — India's Premier Corporate Finance & CA Advisory Platform",
  description: "Learn about Fyntrust's mission to power Indian enterprises with institutional-grade Chartered Accountancy, Tax, and Virtual CFO services.",
};

export default function AboutPage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Our Story & Mission</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Empowering Indian Businesses With Financial Clarity & Compliance Discipline
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Fyntrust is a premier digital corporate business-services platform founded to bridge the gap
          between growing enterprises and institutional-grade Chartered Accountancy, Corporate Law, and Virtual CFO leadership.
        </p>
      </div>

      {/* Corporate Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-fyn-slate-border shadow-sm">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Beyond Traditional Accounting: <br />
            <span className="text-[#01574F]">A Dedicated Growth Partner</span>
          </h2>
          <p className="text-xs sm:text-sm text-fyn-slate-muted leading-relaxed">
            For too long, Indian MSMEs and startup founders have struggled with fragmented service providers —
            hiring one local consultant for GST, another firm for annual audit, a separate lawyer for contracts,
            and having no strategic CFO guidance to navigate cash flow and capital allocation.
          </p>
          <p className="text-xs sm:text-sm text-fyn-slate-muted leading-relaxed">
            Fyntrust unifies every corporate finance vertical into a single digital platform. We combine the
            rigor and domain mastery of top Chartered Accountants with secure digital vaults, guaranteed SLAs,
            and proactive compliance tracking.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-fyn-slate-border space-y-1">
              <span className="text-2xl font-extrabold text-[#01574F] font-heading">1,000+</span>
              <span className="text-xs text-fyn-slate-muted block">Enterprises Advised</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-fyn-slate-border space-y-1">
              <span className="text-2xl font-extrabold text-[#01574F] font-heading">100+</span>
              <span className="text-xs text-fyn-slate-muted block">Certified CAs & CS</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#142A2B] via-[#01574F] to-[#142A2B] text-white space-y-6">
          <h3 className="text-xl font-bold font-heading">Our Core Operating Pillars</h3>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Absolute Confidentiality</span>
                <span className="text-white/70">Encrypted data vaults and strict non-disclosure across all client records.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-[#C5A869] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Statutory Precision</span>
                <span className="text-white/70">Every return and secretarial filing undergoes strict multi-tier verification.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Proactive Strategic Advisory</span>
                <span className="text-white/70">We don’t just record history; we advise founders on cash runway, margins, and tax planning.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership & Network Model */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="accent">PAN India Network</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            The Fyntrust Professional Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Our network comprises seasoned practitioners across all key commercial jurisdictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="executive" className="space-y-3">
            <Award className="w-8 h-8 text-fyn-primary" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">Chartered Accountants (FCA / ACA)</h3>
            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              Specialized in corporate tax planning, statutory audits, GST reconciliation, international transfer pricing, and complex assessments.
            </p>
          </Card>

          <Card variant="executive" className="space-y-3">
            <Building2 className="w-8 h-8 text-fyn-primary" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">Company Secretaries (FCS / ACS)</h3>
            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              Expert in MCA ROC compliances, private limited incorporation, board governance, secretarial audits, and corporate restructuring.
            </p>
          </Card>

          <Card variant="executive" className="space-y-3">
            <TrendingUp className="w-8 h-8 text-fyn-primary" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">Virtual CFOs & CFAs</h3>
            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              Senior finance leaders providing 13-week cash flow modeling, unit economics optimization, investor MIS, and fundraising support.
            </p>
          </Card>
        </div>
      </div>

      {/* Corporate Offices */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-fyn-slate-border space-y-6">
        <div className="space-y-2">
          <Badge variant="primary">Physical Presence</Badge>
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">Corporate Offices</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-fyn-slate">
          <div className="p-5 rounded-2xl bg-white border border-fyn-slate-border space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#01574F]">
              <MapPin className="w-4 h-4 text-fyn-accent" />
              <span>Ghazipur Registered Office</span>
            </div>
            <p className="text-fyn-slate-muted">1st Office: Alamapati, Ghazipur, Uttar Pradesh - 233001</p>
            <p className="text-fyn-slate-muted font-medium">Contact: +91 9118066449 | team@fyntrust.in</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-fyn-slate-border space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#01574F]">
              <MapPin className="w-4 h-4 text-fyn-accent" />
              <span>Lucknow Executive Office</span>
            </div>
            <p className="text-fyn-slate-muted">2nd Office: Gomtinagar Extension, Lucknow, Uttar Pradesh - 226010</p>
            <p className="text-fyn-slate-muted font-medium">Contact: +91 9118066449 | team@fyntrust.in</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-3xl bg-[#01574F] text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold font-heading">Partner With Fyntrust Today</h3>
          <p className="text-xs sm:text-sm text-white/80">Experience proactive finance, accounting, and compliance support.</p>
        </div>
        <Link href="/get-started">
          <Button variant="accent" size="lg" className="font-bold">
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
