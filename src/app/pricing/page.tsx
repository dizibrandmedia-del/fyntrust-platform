import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Check, ShieldCheck, HelpCircle, PhoneCall } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transparent Corporate Pricing & Packages | Fyntrust",
  description: "Explore transparent pricing for GST, Company Registration, Accounting, ROC, and Virtual CFO services.",
};

export default async function PricingPage() {
  const servicesWithPackages = await prisma.service.findMany({
    where: { isActive: true },
    include: { packages: true, category: true },
    orderBy: { startingPrice: "asc" },
  });

  const tiers = [
    {
      name: "Starter Compliance",
      idealFor: "Sole Proprietors & Micro Businesses",
      price: "₹999",
      billingPeriod: "/ month",
      description: "Essential tax return filings and basic statutory compliance.",
      features: [
        "Monthly GST Return Filing (GSTR-1, GSTR-3B)",
        "Input Tax Credit (ITC) 2B Reconciliation",
        "Quarterly Income Tax Return Advisory",
        "Dedicated CA Helpdesk Support",
        "Standard SLA Delivery",
      ],
      isPopular: false,
    },
    {
      name: "Growth Compliance",
      idealFor: "Private Limited Companies & LLPs",
      price: "₹2,999",
      billingPeriod: "/ month",
      description: "Complete bookkeeping, statutory tax filings, and ROC maintenance.",
      features: [
        "Monthly Cloud Bookkeeping & Ledger Maintenance",
        "GST, TDS & Advance Tax Filings",
        "Annual ROC Filing (AOC-4, MGT-7, DIR-3 KYC)",
        "Monthly P&L and Balance Sheet Statements",
        "Dedicated Chartered Accountant & CS Team",
      ],
      isPopular: true,
    },
    {
      name: "Advanced Finance",
      idealFor: "Established MSMEs (₹1 Cr - ₹10 Cr Turnover)",
      price: "₹6,999",
      billingPeriod: "/ month",
      description: "Complete financial outsourcing, payroll, and executive MIS dashboards.",
      features: [
        "End-to-End Accounting Outsourcing",
        "Executive Monthly MIS & Margin Dashboards",
        "Payroll, PF & ESIC Monthly Compliance",
        "Quarterly Tax Optimization Review",
        "Priority 24-Hour SLA Support",
      ],
      isPopular: false,
    },
    {
      name: "Virtual CFO Suite",
      idealFor: "Funded Startups & High-Growth Scaleups",
      price: "₹10,000",
      billingPeriod: "/ month",
      description: "Fractional CFO leadership, 13-week cash flow runway, and fundraising support.",
      features: [
        "Dedicated Senior Virtual CFO Partner",
        "13-Week Rolling Cash Flow & Runway Modeling",
        "Unit Economics & Margin Optimization",
        "Investor MIS & Board Presentation Support",
        "Direct Founder Advisory Governance Calls",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Clear & Transparent</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Transparent Corporate Pricing
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Predictable monthly retainers and flat one-time professional fees with zero hidden surprises.
          All statutory government fees are transparently itemized.
        </p>
      </div>

      {/* Main Retainer Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            variant={tier.isPopular ? "executive" : "default"}
            className="flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="space-y-4">
              {tier.isPopular && <Badge variant="accent" size="sm">Most Popular Choice</Badge>}
              <div>
                <h3 className="text-lg font-bold font-heading text-fyn-slate">{tier.name}</h3>
                <p className="text-xs text-fyn-slate-muted mt-1">{tier.idealFor}</p>
              </div>

              <p className="text-xs text-fyn-slate leading-relaxed border-t border-fyn-slate-border/60 pt-2">
                {tier.description}
              </p>

              <ul className="space-y-2 text-xs text-fyn-slate pt-2 border-t border-fyn-slate-border">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-fyn-accent shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-fyn-slate-border">
              <Link href={`/get-started?package=${tier.name}`}>
                <Button variant={tier.isPopular ? "primary" : "outline"} size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* One-time Service Rates Table */}
      <div className="space-y-6 bg-white p-8 rounded-3xl border border-fyn-slate-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-fyn-slate">
              One-Time Incorporation & Filing Rates
            </h2>
            <p className="text-xs text-fyn-slate-muted">Standard professional fees for one-off services</p>
          </div>
          <Link href="/services">
            <Button variant="outline" size="sm">
              View All Services →
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-fyn-slate-border text-xs">
          {servicesWithPackages.slice(0, 8).map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-fyn-slate">{s.name}</span>
                <span className="text-fyn-slate-muted block text-[11px]">{s.category.name}</span>
              </div>
              <div className="text-right">
                <Link href={`/services/${s.slug}`} className="text-fyn-primary font-bold hover:underline block text-[11px]">
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Guarantee */}
      <div className="p-8 rounded-3xl bg-slate-50 border border-fyn-slate-border text-center space-y-4 max-w-3xl mx-auto">
        <ShieldCheck className="w-10 h-10 text-fyn-primary mx-auto" />
        <h3 className="text-xl font-bold font-heading text-fyn-slate">The Fyntrust Transparent Pricing Promise</h3>
        <p className="text-xs sm:text-sm text-fyn-slate-muted leading-relaxed">
          We never bill undisclosed out-of-pocket charges. Final quote is agreed upfront based on your
          business turnover, volume, and exact scope.
        </p>
        <Link href="/contact">
          <Button variant="primary" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
            Request Customized Corporate Quote
          </Button>
        </Link>
      </div>
    </div>
  );
}
