import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  TrendingUp,
  FileCheck,
  Calculator,
  Receipt,
  Scale,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  HelpCircle,
  Download,
  Star,
  FileSpreadsheet,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch CMS data from database
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const featuredServices = await prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true, packages: true },
    take: 6,
  });

  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  const cities = await prisma.city.findMany({
    where: { isPopular: true },
    take: 12,
  });

  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
    take: 3,
  });

  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  const iconMap: Record<string, any> = {
    Building2,
    Receipt,
    Calculator,
    Users,
    FileCheck,
    TrendingUp,
    Scale,
  };

  const businessTools = [
    { title: "GST Calculator", desc: "Compute CGST, SGST, IGST and net tax liability", icon: Receipt },
    { title: "Income Tax Calculator", desc: "Compare Old vs New Tax Regime for FY 2026-27", icon: Calculator },
    { title: "TDS Rate Finder", desc: "Look up statutory TDS sections (194C, 194J, 194I, 194Q)", icon: FileCheck },
    { title: "EMI & Loan Calculator", desc: "Calculate monthly installments and interest schedules", icon: TrendingUp },
    { title: "Salary / CTC Breakup Tool", desc: "Structure employee compensation, PF, ESIC & in-hand pay", icon: Users },
    { title: "Business Profit Margin Calculator", desc: "Calculate Gross & Net margins and breakeven point", icon: Scale },
    { title: "HSN / SAC Code Search", desc: "Find applicable GST rates for goods and services", icon: Building2 },
    { title: "Statutory Due Date Checker", desc: "Track upcoming GST, TDS, ITR & ROC deadlines", icon: Clock },
  ];

  return (
    <div className="space-y-0 font-body">
      {/* ============================================================
          SECTION 1 — HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#142A2B] via-[#01574F] to-[#142A2B] text-white py-20 lg:py-28 px-4 sm:px-8 border-b border-white/10">
        {/* Subtle executive background accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#78BB69_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#78BB69]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#78BB69]">
              <Sparkles className="w-4 h-4 text-[#C5A869]" />
              <span>India’s Dedicated Corporate CA & Financial Advisory Partner</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-heading leading-[1.15]">
              Your Business. <br />
              <span className="text-[#78BB69]">Our Experts.</span> <br />
              Complete Financial & Compliance Support.
            </h1>

            <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
              Access CA, Tax, Accounting, Compliance, Payroll, Legal & Virtual CFO services
              through Fyntrust’s PAN India expert network.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link href="/get-started">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full sm:w-auto shadow-xl hover:shadow-[#78BB69]/20 font-bold"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Your Business Journey
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white"
                  leftIcon={<PhoneCall className="w-4 h-4 text-[#78BB69]" />}
                >
                  Talk to an Expert
                </Button>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#78BB69] shrink-0" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C5A869] shrink-0" />
                <span>Certified CAs & CS</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#78BB69] shrink-0" />
                <span>Guaranteed SLAs</span>
              </div>
            </div>
          </div>

          {/* Right Executive Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#78BB69]/20 border border-[#78BB69]/40 flex items-center justify-center text-[#78BB69] font-bold">
                    FY
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-white">Fyntrust Advisory Desk</div>
                    <div className="text-[11px] text-white/60">Single Window Corporate Governance</div>
                  </div>
                </div>
                <Badge variant="accent" size="sm">PAN India Active</Badge>
              </div>

              <div className="space-y-3.5 text-xs text-white/90">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-[#78BB69]" />
                    <span>Monthly Tax & GST Reconciliation</span>
                  </div>
                  <span className="text-[#78BB69] font-semibold">100% Compliant</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-[#C5A869]" />
                    <span>Executive MIS & Financial Statements</span>
                  </div>
                  <span className="text-white/80">Delivered by 7th</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#78BB69]" />
                    <span>Virtual CFO Runway Management</span>
                  </div>
                  <span className="text-[#C5A869] font-semibold">Active Advisory</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center space-y-2">
                <div className="text-xs text-white/70">Need instant consultation on Company Setup or Tax?</div>
                <a
                  href="tel:+919118066449"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#78BB69] hover:underline"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call +91 9118066449 (Direct CA Desk)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — TRUST STATISTICS (CMS-Driven)
          ============================================================ */}
      <section className="bg-white py-12 px-4 sm:px-8 border-b border-fyn-slate-border shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#01574F] font-heading">100+</div>
            <div className="text-xs sm:text-sm font-medium text-fyn-slate-muted">Expert Network Across India</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#01574F] font-heading">PAN India</div>
            <div className="text-xs sm:text-sm font-medium text-fyn-slate-muted">28 States & UTs Covered</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#01574F] font-heading">1,000+</div>
            <div className="text-xs sm:text-sm font-medium text-fyn-slate-muted">Businesses & Startups Served</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#01574F] font-heading">99.8%</div>
            <div className="text-xs sm:text-sm font-medium text-fyn-slate-muted">Statutory Filing Accuracy</div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — FEATURED SERVICES (CMS-Driven)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary">Core Corporate Offerings</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Comprehensive Corporate Services
          </h2>
          <p className="text-sm sm:text-base text-fyn-slate-muted">
            From company incorporation to monthly accounting, tax return filings, and CFO advisory —
            get complete financial support under one trusted umbrella.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredServices.map((service) => {
            const IconComp = (service.category?.icon && iconMap[service.category.icon]) || Briefcase;
            return (
              <Card
                key={service.id}
                variant="executive"
                className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 group border-fyn-slate-border"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-fyn-primary-subtle text-fyn-primary group-hover:bg-fyn-primary group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-fyn-slate-muted leading-relaxed mt-2 line-clamp-3">
                      {service.shortDescription}
                    </p>
                  </div>

                  {service.whatsIncluded && (
                    <ul className="space-y-1.5 text-xs text-fyn-slate pt-2 border-t border-fyn-slate-border/50">
                      {JSON.parse(service.whatsIncluded).slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-fyn-accent shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t border-fyn-slate-border flex items-center justify-between gap-3">
                  <Link href={`/services/${service.slug}`} className="text-xs font-bold text-fyn-primary hover:underline">
                    Learn More →
                  </Link>
                  <Link href={`/get-started?service=${service.slug}`}>
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link href="/services">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore All 25+ Corporate Services
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — WHY FYNTRUST
          ============================================================ */}
      <section className="bg-[#142A2B] text-white py-20 px-4 sm:px-8 border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="gold">The Fyntrust Difference</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Why Serious Businesses Choose Fyntrust
            </h2>
            <p className="text-sm sm:text-base text-white/70">
              We combine institutional accounting rigor with seamless digital workflows,
              giving founders a single reliable business partner for every stage of growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="p-3 rounded-xl bg-[#01574F] text-[#78BB69] w-fit">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-heading text-white">One Business Partner</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                No more juggling separate bookkeepers, tax agents, and corporate lawyers. Everything handled centrally.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="p-3 rounded-xl bg-[#01574F] text-[#C5A869] w-fit">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-heading text-white">Curated Expert Network</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Every filing and audit is prepared and reviewed exclusively by verified, seasoned CAs and CS professionals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="p-3 rounded-xl bg-[#01574F] text-[#78BB69] w-fit">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-heading text-white">PAN India Ground Presence</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Local jurisdiction compliance support across Tier-1, Tier-2, and industrial hubs across India.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="p-3 rounded-xl bg-[#01574F] text-[#C5A869] w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-heading text-white">Strategic CFO Oversight</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Beyond compliance, gain proactive financial modeling, cash flow control, and investor-ready reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — PAN INDIA EXPERT NETWORK (CMS-Driven)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary">Nationwide Presence</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Expert Support Across India
          </h2>
          <p className="text-sm sm:text-base text-fyn-slate-muted">
            Fyntrust operates through a certified network of Chartered Accountants and corporate partners in key commercial hubs nationwide.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/ca-services/${city.slug}`}
              className="p-4 rounded-xl border border-fyn-slate-border bg-white hover:border-fyn-primary hover:shadow-md transition-all text-center group"
            >
              <div className="text-xs font-bold text-fyn-slate group-hover:text-fyn-primary font-heading">
                {city.name}
              </div>
              <div className="text-[11px] text-fyn-slate-muted mt-0.5">{city.state}</div>
            </Link>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-fyn-bg-subtle border border-fyn-slate-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fyn-primary text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-fyn-slate text-sm">Need local jurisdiction representation?</span>
              <p className="text-fyn-slate-muted">Our partners coordinate state tax and ROC representations seamlessly.</p>
            </div>
          </div>
          <Link href="/contact">
            <Button variant="outline" size="sm">
              Contact Regional CA Desk
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================
          SECTION 6 — HOW IT WORKS (6-Step Timeline)
          ============================================================ */}
      <section className="bg-slate-50 py-20 px-4 sm:px-8 border-y border-fyn-slate-border">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="accent">Simple & Transparent</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
              How Fyntrust Works
            </h2>
            <p className="text-sm sm:text-base text-fyn-slate-muted">
              Professional CA and corporate services delivered through an efficient, paperless digital workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Tell Us About Your Business", desc: "Select your required service and provide basic business entity details in minutes." },
              { num: "02", title: "Choose Your Package", desc: "Transparent scope and government fees with zero hidden marks or surprise invoices." },
              { num: "03", title: "Submit Documents", desc: "Upload required identity and financial records to our secure, encrypted client vault." },
              { num: "04", title: "Fyntrust Assigns Expert", desc: "A qualified CA or CS is assigned to review, draft, and manage your statutory filing." },
              { num: "05", title: "Track Your Work", desc: "Receive live milestone updates, step-by-step progress tracking, and proactive notifications." },
              { num: "06", title: "Receive Deliverables", desc: "Download verified certificates, challans, and filing acknowledgments directly." },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-white border border-fyn-slate-border shadow-sm space-y-3 relative group hover:border-fyn-primary transition-colors"
              >
                <span className="text-3xl font-extrabold text-[#78BB69] font-heading">{step.num}</span>
                <h3 className="text-base font-bold text-fyn-slate font-heading">{step.title}</h3>
                <p className="text-xs text-fyn-slate-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7 — SERVICE CATEGORIES OVERVIEW
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary">Core Practice Areas</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Explore All Practice Verticals
          </h2>
          <p className="text-sm sm:text-base text-fyn-slate-muted">
            Click into any practice area to explore specific packages, eligibility criteria, and process workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComp = (cat.icon && iconMap[cat.icon]) || Briefcase;
            return (
              <Link
                key={cat.slug}
                href={`/services/category/${cat.slug}`}
                className="p-6 rounded-2xl border border-fyn-slate-border bg-white hover:border-fyn-primary hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-fyn-primary-subtle text-fyn-primary w-fit group-hover:bg-fyn-primary group-hover:text-white transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-fyn-slate-muted leading-relaxed mt-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-fyn-slate-border/60 text-xs font-bold text-fyn-primary flex items-center gap-1">
                  <span>View Services</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          SECTION 8 — VIRTUAL CFO EXECUTIVE SPOTLIGHT
          ============================================================ */}
      <section className="bg-gradient-to-r from-[#142A2B] via-[#01574F] to-[#142A2B] text-white py-20 px-4 sm:px-8 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="gold">Executive Financial Leadership</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold font-heading leading-tight">
              Get an Expert Virtual CFO <br />
              <span className="text-[#78BB69]">Without Hiring Full-Time.</span>
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
              Professional financial planning, cash-flow management, MIS, budgeting,
              forecasting and strategic financial support for growing businesses.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                "Financial Planning",
                "Cash Flow Control",
                "Executive MIS",
                "Budgeting & Targets",
                "Rolling Forecasting",
                "Profitability Analysis",
                "Management Reporting",
                "CFO Advisory",
              ].map((item) => (
                <div key={item} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-center font-medium">
                  {item}
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/services/virtual-cfo-advisory">
                <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Talk to a Virtual CFO
                </Button>
              </Link>
              <div className="text-xs text-white/70">
                <span>Final pricing depends on turnover, volume, and scope.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-5">
            <div className="font-heading font-bold text-white text-base">Virtual CFO Deliverables</div>
            <ul className="space-y-3 text-xs text-white/90">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
                <span><strong>13-Week Rolling Cash Flow:</strong> Proactive liquidity and runway tracking.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
                <span><strong>Unit Economics & Gross Margin:</strong> Pinpoint leakages across product lines.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
                <span><strong>Bi-Weekly Founder Governance:</strong> High-level financial strategy calls.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
                <span><strong>Fundraising & Due Diligence:</strong> Complete data room preparation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 9 — PRICING & PACKAGES OVERVIEW (CMS-Driven)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary">Transparent & Predictable</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
            Professional Service Packages
          </h2>
          <p className="text-sm sm:text-base text-fyn-slate-muted">
            Tailored compliance and accounting tiers designed for every stage of your business growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Starter Compliance",
              idealFor: "Sole Proprietorships & Freelancers",
              price: "₹999 / mo",
              features: ["GST Return Filing (GSTR-1, 3B)", "Quarterly ITR Support", "Basic Bookkeeping Entry", "Email Support"],
              isPopular: false,
            },
            {
              name: "Growth Compliance",
              idealFor: "Pvt Ltd Companies & LLPs",
              price: "₹2,999 / mo",
              features: ["Monthly Bookkeeping & Ledger", "GST & TDS Return Filings", "Annual ROC Filing Support", "Dedicated Accountant & CA"],
              isPopular: true,
            },
            {
              name: "Advanced Business",
              idealFor: "Established MSMEs (₹1Cr-₹10Cr)",
              price: "₹6,999 / mo",
              features: ["Full Accounting Outsourcing", "Monthly Executive MIS Dashboards", "PF & ESIC Payroll Processing", "Quarterly CA Tax Advisory"],
              isPopular: false,
            },
            {
              name: "Virtual CFO Suite",
              idealFor: "Scale-ups & High Growth Firms",
              price: "₹10,000 / mo",
              features: ["Dedicated Senior CFO Leader", "13-Week Cash Flow Modeling", "Investor MIS & Board Decks", "Strategic Budgeting & Tax Planning"],
              isPopular: false,
            },
          ].map((pkg) => (
            <Card
              key={pkg.name}
              variant={pkg.isPopular ? "executive" : "default"}
              className="flex flex-col justify-between"
            >
              <div className="space-y-4">
                {pkg.isPopular && <Badge variant="accent" size="sm">Most Popular</Badge>}
                <div>
                  <h3 className="text-lg font-bold font-heading text-fyn-slate">{pkg.name}</h3>
                  <div className="text-xs text-fyn-slate-muted mt-1">{pkg.idealFor}</div>
                </div>


                <ul className="space-y-2 text-xs text-fyn-slate pt-2">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-fyn-accent shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-fyn-slate-border">
                <Link href="/pricing">
                  <Button variant={pkg.isPopular ? "primary" : "outline"} size="sm" className="w-full">
                    View Package Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 10 — FREE BUSINESS TOOLKIT SHOWCASE
          ============================================================ */}
      <section className="bg-slate-50 py-20 px-4 sm:px-8 border-y border-fyn-slate-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="gold">Complimentary Resources</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
              Free Business & Financial Toolkit
            </h2>
            <p className="text-sm sm:text-base text-fyn-slate-muted">
              Essential financial calculators, tax estimators, and statutory compliance checklists for Indian business owners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {businessTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="p-5 rounded-2xl bg-white border border-fyn-slate-border shadow-sm hover:border-fyn-primary hover:shadow-md transition-all space-y-2 group"
                >
                  <div className="p-2.5 rounded-lg bg-fyn-primary-subtle text-fyn-primary w-fit group-hover:bg-fyn-primary group-hover:text-white transition-colors">
                    <ToolIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-fyn-slate-muted">{tool.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <Link href="/resources">
              <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse All Tools & Guides in Resource Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 11 & 12 — COMPLIANCE & BUSINESS HEALTH CHECK
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Compliance Checkup */}
          <div className="p-8 rounded-3xl bg-[#142A2B] text-white border border-white/10 space-y-5">
            <Badge variant="gold">Compliance Health</Badge>
            <h3 className="text-2xl font-bold font-heading text-white">
              Is Your Business Fully Compliant?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Quickly identify potential compliance gaps across GST, ITR, TDS, ROC/MCA, payroll and accounting before notices arrive.
            </p>
            <div className="pt-2">
              <Link href="/contact?subject=ComplianceCheckup">
                <Button variant="accent" size="md">
                  Check My Business Compliance
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-white/50 pt-2 border-t border-white/10">
              *Preliminary assessment only. Not formal legal/tax certification.
            </p>
          </div>

          {/* Business Health Check */}
          <div className="p-8 rounded-3xl bg-[#01574F] text-white border border-white/10 space-y-5">
            <Badge variant="accent">Financial Health</Badge>
            <h3 className="text-2xl font-bold font-heading text-white">
              Know the Financial Health of Your Business
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Assess your turnover, gross margin velocity, working capital runway, and tax liability optimization with a senior advisor.
            </p>
            <div className="pt-2">
              <Link href="/contact?subject=HealthCheck">
                <Button variant="gold" size="md">
                  Start Business Health Check
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-white/50 pt-2 border-t border-white/10">
              *Preliminary analysis. Detailed financial audits conducted upon formal mandate.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 13 — TESTIMONIALS (CMS-Driven)
          ============================================================ */}
      {reviews.length > 0 && (
        <section className="bg-slate-50 py-20 px-4 sm:px-8 border-y border-fyn-slate-border">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="primary">Client Stories</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
                Trusted by Businesses Across India
              </h2>
              <p className="text-sm sm:text-base text-fyn-slate-muted">
                Here is what founders and managing directors say about partnering with Fyntrust.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 rounded-2xl bg-white border border-fyn-slate-border shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-fyn-slate leading-relaxed italic">
                      "{review.reviewText}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-fyn-slate-border">
                    <div className="font-bold text-xs text-fyn-slate font-heading">{review.customerName}</div>
                    <div className="text-[11px] text-fyn-slate-muted">{review.businessName}</div>
                    <div className="text-[10px] text-fyn-primary font-semibold mt-0.5">{review.city} • {review.serviceName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          SECTION 14 — RESOURCE HUB PREVIEW (CMS-Driven Blogs)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="primary">Knowledge & Insights</Badge>
            <h2 className="text-3xl font-bold font-heading text-fyn-slate">
              Latest Tax & Compliance Insights
            </h2>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Articles
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="p-6 rounded-2xl bg-white border border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between text-xs text-fyn-slate-muted">
                <span className="font-semibold text-fyn-primary">{blog.category}</span>
                <span>{new Date(blog.publishedAt || new Date()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                {blog.title}
              </h3>
              <p className="text-xs text-fyn-slate-muted leading-relaxed line-clamp-2">
                {blog.excerpt}
              </p>
              <div className="pt-2 text-xs font-bold text-fyn-primary flex items-center gap-1">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 15 — FINAL CORPORATE CTA
          ============================================================ */}
      <section className="bg-gradient-to-b from-[#01574F] to-[#142A2B] text-white py-20 px-4 sm:px-8 border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge variant="gold">Start With Confidence</Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading">
            Build Your Business With Confidence.
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
            Get professional support for accounting, tax, compliance, finance and business growth
            from certified Chartered Accountants and Virtual CFOs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/get-started">
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white"
                leftIcon={<PhoneCall className="w-4 h-4 text-[#78BB69]" />}
              >
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
