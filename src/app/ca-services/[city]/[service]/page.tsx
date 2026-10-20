import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateServiceSchema, generateFaqSchema } from "@/lib/seo/schema";
import { generateWhatsAppChatUrl } from "@/lib/whatsapp/whatsapp-service";
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Building2,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CityServicePageProps {
  params: {
    city: string;
    service: string;
  };
}

export async function generateMetadata({ params }: CityServicePageProps) {
  const city = await prisma.city.findUnique({
    where: { slug: params.city },
  });

  const service = await prisma.service.findUnique({
    where: { slug: params.service },
  });

  if (!city || !service || !city.isActive || !service.isActive) {
    return { title: "Page Not Found | Fyntrust" };
  }

  const title = `${service.name} in ${city.name} | Expert CA & CS | Fyntrust`;
  const description = `Get professional ${service.name} services in ${city.name}, ${city.state}. 100% online processing with certified Chartered Accountants, fast SLA, and transparent fees.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://fyntrust.in/ca-services/${city.slug}/${service.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://fyntrust.in/ca-services/${city.slug}/${service.slug}`,
    },
  };
}

export default async function CityServiceDetailPage({ params }: CityServicePageProps) {
  const city = await prisma.city.findUnique({
    where: { slug: params.city },
  });

  const service = await prisma.service.findUnique({
    where: { slug: params.service },
    include: { category: true, packages: { where: { isActive: true } } },
  });

  // Thin-content check
  if (!city || !service || !city.isActive || !service.isActive) {
    notFound();
  }

  // Parse JSON data fields safely
  const whatsIncluded = service.whatsIncluded ? JSON.parse(service.whatsIncluded) : [];
  const documentsRequired = service.documentsRequired ? JSON.parse(service.documentsRequired) : [];
  const processSteps = service.processSteps ? JSON.parse(service.processSteps) : [];
  const rawFaqs = service.faqs ? JSON.parse(service.faqs) : [];

  const localFaqs = [
    {
      q: `How long does ${service.name} take for businesses in ${city.name}?`,
      a: `Typically within ${service.slaDays} business days upon receiving complete verified documents in your private vault.`,
    },
    {
      q: `Will a local CA or tax expert in ${city.state} handle my application?`,
      a: `Yes. Fyntrust assigns accredited Chartered Accountants familiar with ${city.state} state commercial tax authorities and MCA regional directors.`,
    },
    ...rawFaqs,
  ];

  const serviceSchema = generateServiceSchema({
    name: `${service.name} in ${city.name}`,
    description: service.shortDescription,
    url: `/ca-services/${city.slug}/${service.slug}`,
  });

  const faqSchema = generateFaqSchema(localFaqs);
  const whatsappUrl = generateWhatsAppChatUrl(`Hello Fyntrust team, I want to inquire about ${service.name} in ${city.name}.`);

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

      <Breadcrumbs
        items={[
          { name: "PAN India Locations", url: "/locations" },
          { name: city.name, url: `/ca-services/${city.slug}` },
          { name: service.name, url: `/ca-services/${city.slug}/${service.slug}` },
        ]}
      />

      {/* Hero Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0d1c1d] via-[#01574F] to-[#142A2B] text-white space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="accent" size="sm">
            {service.category.name}
          </Badge>
          <span className="text-white/40">•</span>
          <span className="text-[#78BB69] font-bold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {city.name}, {city.state}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> SLA: {service.slaDays} Days
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white">
          {service.name} in {city.name}
        </h1>

        <p className="text-sm sm:text-base text-white/85 max-w-3xl leading-relaxed">
          {service.shortDescription} Tailored advisory and statutory filing services for commercial enterprises, LLPs, and startups across {city.name}.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link href={`/order?service=${service.slug}&city=${city.slug}`}>
            <Button variant="accent" size="lg" className="font-bold">
              Get Started Now →
            </Button>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="border-white/40 text-white" leftIcon={<MessageSquare className="w-4 h-4 text-[#78BB69]" />}>
              WhatsApp Inquire
            </Button>
          </a>
        </div>
      </div>

      {/* Overview & Who It's For */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-fyn-slate">
              Service Overview for {city.name} Businesses
            </h2>
            <div className="prose prose-sm text-fyn-slate-muted leading-relaxed whitespace-pre-line">
              {service.fullDescription}
            </div>
          </div>

          {/* What's Included */}
          {whatsIncluded.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-heading text-fyn-slate">
                What's Included in {service.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whatsIncluded.map((item: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-fyn-slate">
                    <CheckCircle2 className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Steps */}
          {processSteps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-heading text-fyn-slate">
                Step-by-Step Filing Process
              </h2>
              <div className="space-y-3">
                {processSteps.map((step: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-fyn-slate-border flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#01574F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-fyn-slate font-heading">{step.title || `Phase ${idx + 1}`}</h4>
                      <p className="text-xs text-fyn-slate-muted">{step.desc || step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Documents & Fast Track CTA */}
        <div className="space-y-6">
          <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
            <h3 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#01574F]" /> Required Documents
            </h3>
            <div className="space-y-2 text-xs">
              {documentsRequired.length > 0 ? (
                documentsRequired.map((doc: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-fyn-slate">
                    • {doc}
                  </div>
                ))
              ) : (
                <p className="text-fyn-slate-muted">Standard KYC, PAN, Aadhaar & Business Address Proof.</p>
              )}
            </div>
          </Card>

          <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4 text-center">
            <ShieldCheck className="w-10 h-10 text-[#01574F] mx-auto" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">100% Verified CA Assurance</h3>
            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              Every document is vetted and filed directly by verified Chartered Accountants and Company Secretaries.
            </p>
            <Link href={`/order?service=${service.slug}&city=${city.slug}`} className="block">
              <Button variant="primary" size="md" className="w-full font-bold">
                Order Online Now →
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Local FAQs */}
      <div className="space-y-6 pt-6 border-t border-fyn-slate-border">
        <div className="space-y-2">
          <Badge variant="accent">Local Queries</Badge>
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Frequently Asked Questions for {service.name} in {city.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localFaqs.map((faq: any, idx: number) => (
            <Card key={idx} variant="default" className="p-5 border-fyn-slate-border space-y-2">
              <h4 className="text-sm font-bold text-fyn-slate font-heading flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-fyn-primary shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-fyn-slate-muted leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
