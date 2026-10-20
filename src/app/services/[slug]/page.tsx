import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  PhoneCall,
  ArrowRight,
  Sparkles,
  Building2,
  Briefcase,
  Check,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!service) return { title: "Service Not Found | Fyntrust" };

  return {
    title: `${service.name} — Expert CA Support & Pricing | Fyntrust`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      packages: true,
    },
  });

  if (!service) {
    notFound();
  }

  const whatsIncluded: string[] = service.whatsIncluded ? JSON.parse(service.whatsIncluded) : [];
  const eligibility: string[] = service.eligibility ? JSON.parse(service.eligibility) : [];
  const documentsRequired: string[] = service.documentsRequired ? JSON.parse(service.documentsRequired) : [];
  const processSteps: { step: number; title: string; desc: string }[] = service.processSteps
    ? JSON.parse(service.processSteps)
    : [];
  const faqs: { q: string; a: string }[] = service.faqs ? JSON.parse(service.faqs) : [];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* ============================================================
          SERVICE HERO
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-gradient-to-br from-[#142A2B] via-[#01574F] to-[#142A2B] text-white p-8 sm:p-12 rounded-3xl border border-white/10 shadow-xl">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href={`/services/category/${service.category.slug}`}
              className="text-[#78BB69] font-bold hover:underline"
            >
              {service.category.name}
            </Link>
            <span className="text-white/40">•</span>
            <Badge variant="gold" size="sm">
              {service.department || "Corporate"}
            </Badge>
            {service.slaDays && (
              <Badge variant="accent" size="sm">
                SLA: {service.slaDays} Working Days
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white leading-tight">
            {service.name}
          </h1>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
            {service.fullDescription || service.shortDescription}
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#78BB69]" />
              <span>Assigned CA / Expert Review</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C5A869]" />
              <span>Encrypted Document Vault</span>
            </div>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white text-fyn-slate shadow-2xl border border-fyn-slate-border space-y-5">
          <div className="space-y-2.5">
            <Link href={`/order?service=${service.slug}`} className="block">
              <Button variant="primary" size="md" className="w-full font-bold">
                Get Started Now
              </Button>
            </Link>
            <Link href="/contact" className="block">
              <Button variant="outline" size="md" className="w-full" leftIcon={<PhoneCall className="w-4 h-4" />}>
                Talk to an Expert
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-center text-fyn-slate-muted">
            ⚡ Quick 2-minute digital initiation
          </div>
        </div>
      </div>

      {/* ============================================================
          WHAT'S INCLUDED & PACKAGES
          ============================================================ */}
      {service.packages && service.packages.length > 0 ? (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="primary">Packages & Pricing</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
              Choose the Plan for Your Business
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.packages.map((pkg) => {
              const features: string[] = pkg.features ? JSON.parse(pkg.features) : [];
              return (
                <Card
                  key={pkg.id}
                  variant={pkg.isPopular ? "executive" : "default"}
                  className="flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {pkg.isPopular && <Badge variant="accent" size="sm">Recommended Plan</Badge>}
                    <div>
                      <h3 className="text-lg font-bold font-heading text-fyn-slate">{pkg.name}</h3>
                    </div>

                    <ul className="space-y-2 text-xs text-fyn-slate pt-3 border-t border-fyn-slate-border">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-fyn-accent shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4 border-t border-fyn-slate-border">
                    <Link href={`/order?service=${service.slug}&package=${pkg.id}`}>
                      <Button variant={pkg.isPopular ? "primary" : "outline"} size="sm" className="w-full">
                        Select {pkg.name}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : whatsIncluded.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">What’s Included in This Service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whatsIncluded.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-fyn-slate-border flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-fyn-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-fyn-slate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ============================================================
          ELIGIBILITY & DOCUMENTS REQUIRED
          ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {eligibility.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-fyn-slate-border space-y-4">
            <div className="flex items-center gap-2.5 text-fyn-primary">
              <Briefcase className="w-5 h-5" />
              <h3 className="text-lg font-bold font-heading text-fyn-slate">Eligibility Criteria</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-fyn-slate-muted">
              {eligibility.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fyn-primary mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {documentsRequired.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-fyn-slate-border space-y-4">
            <div className="flex items-center gap-2.5 text-fyn-primary">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-bold font-heading text-fyn-slate">Documents Required</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-fyn-slate-muted">
              {documentsRequired.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-fyn-accent shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ============================================================
          PROCESS STEPS (Visual Timeline)
          ============================================================ */}
      {processSteps.length > 0 && (
        <div className="space-y-8 bg-slate-50 p-8 sm:p-12 rounded-3xl border border-fyn-slate-border">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="accent">Step-by-Step Delivery</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
              How the Process Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div key={step.step} className="p-6 rounded-2xl bg-white border border-fyn-slate-border space-y-2">
                <span className="text-2xl font-extrabold text-[#78BB69] font-heading">
                  0{step.step}
                </span>
                <h4 className="text-sm font-bold font-heading text-fyn-slate">{step.title}</h4>
                <p className="text-xs text-fyn-slate-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          FAQS SECTION
          ============================================================ */}
      {faqs.length > 0 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <Badge variant="primary">Frequently Asked Questions</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate">
              Got Questions Regarding {service.name}?
            </h2>
          </div>

          <div className="space-y-4 pt-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-fyn-slate-border space-y-2">
                <div className="flex items-start gap-2.5 font-bold text-sm text-fyn-slate font-heading">
                  <HelpCircle className="w-4 h-4 text-fyn-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-fyn-slate-muted leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          BOTTOM CTA BAR
          ============================================================ */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#01574F] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold font-heading">Ready to Initiate {service.name}?</h3>
          <p className="text-xs sm:text-sm text-white/80">
            Submit your basic details to get assigned a dedicated Chartered Accountant immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/order?service=${service.slug}`}>
            <Button variant="accent" size="lg" className="font-bold">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
