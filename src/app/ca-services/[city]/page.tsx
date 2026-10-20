import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFaqSchema } from "@/lib/seo/schema";
import { generateWhatsAppChatUrl } from "@/lib/whatsapp/whatsapp-service";
import {
  MapPin,
  ShieldCheck,
  Award,
  Building2,
  Receipt,
  Calculator,
  TrendingUp,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CityPageProps {
  params: {
    city: string;
  };
}

export async function generateMetadata({ params }: CityPageProps) {
  const city = await prisma.city.findUnique({
    where: { slug: params.city },
  });

  if (!city || !city.isActive) return { title: "City Not Found | Fyntrust" };

  return {
    title: city.seoTitle || `CA Services & Financial Advisory in ${city.name} | Fyntrust`,
    description:
      city.seoDescription ||
      `Find certified Chartered Accountants, Tax Consultants, and Virtual CFO services in ${city.name}, ${city.state}. Full digital & local support.`,
    alternates: {
      canonical: `https://fyntrust.in/ca-services/${city.slug}`,
    },
    openGraph: {
      title: `CA Services & Financial Advisory in ${city.name} | Fyntrust`,
      description: `Expert CA, CS, and Virtual CFO services for businesses in ${city.name}, ${city.state}.`,
    },
  };
}

export default async function CityServicesPage({ params }: CityPageProps) {
  const city = await prisma.city.findUnique({
    where: { slug: params.city },
    include: {
      cityServicePages: {
        where: { isPublished: true },
        include: { service: true },
      },
    },
  });

  if (!city || !city.isActive) {
    notFound();
  }

  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 9,
  });

  const cityFaqs = [
    {
      q: `Can Fyntrust CAs handle state-level GST and tax notices in ${city.name}?`,
      a: `Yes. Fyntrust assigns certified Chartered Accountants with direct experience in ${city.state} tax circles and GST commissionerates to represent and respond to notices.`,
    },
    {
      q: `How does digital CA advisory work for a business in ${city.name}?`,
      a: `You upload your financial documents securely to your private Fyntrust Document Vault. Your assigned CA prepares the return, shares draft computations for review, and completes filing upon your approval.`,
    },
    {
      q: `Do you have physical corporate offices in Uttar Pradesh?`,
      a: `Yes. Fyntrust maintains physical branch offices in Lucknow (Hazratganj Financial District) and Ghazipur, in addition to full digital coverage across India.`,
    },
  ];

  const faqSchema = generateFaqSchema(cityFaqs);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: `Fyntrust CA Services ${city.name}`,
    description: `Chartered Accountancy, GST Filing, and Company Registration in ${city.name}, ${city.state}`,
    url: `https://fyntrust.in/ca-services/${city.slug}`,
    telephone: "+91 9118066449",
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "IN",
    },
  };

  const whatsappUrl = generateWhatsAppChatUrl(`Hello Fyntrust team, I need CA services in ${city.name}.`);

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={faqSchema} />

      <Breadcrumbs
        items={[
          { name: "PAN India Locations", url: "/locations" },
          { name: city.name, url: `/ca-services/${city.slug}` },
        ]}
      />

      {/* City Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#142A2B] via-[#01574F] to-[#142A2B] text-white space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-[#78BB69]" />
          <span className="text-[#78BB69] font-bold">Regional CA Hub</span>
          <span className="text-white/40">•</span>
          <span>{city.state}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white">
          Chartered Accountant & Financial Advisory in {city.name}
        </h1>

        <p className="text-sm sm:text-base text-white/85 max-w-3xl leading-relaxed">
          {city.shortDescription || `Access certified CAs, Company Secretaries, and Virtual CFOs for GST filing, Company Registration, Income Tax Audits, and Accounting support across ${city.name} and ${city.state}.`}
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href={`/get-started?city=${city.slug}`}>
            <Button variant="accent" size="lg" className="font-bold">
              Consult CA in {city.name} →
            </Button>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10" leftIcon={<MessageSquare className="w-4 h-4 text-[#78BB69]" />}>
              WhatsApp Regional Desk
            </Button>
          </a>
        </div>
      </div>

      {/* Services available in this city */}
      <div className="space-y-8">
        <div className="space-y-2">
          <Badge variant="primary">Practice Offerings in {city.name}</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Core CA & Compliance Services for {city.name} Businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allServices.map((service) => (
            <Card
              key={service.id}
              variant="default"
              className="flex flex-col justify-between hover:border-fyn-primary hover:shadow-md transition-all p-6 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-fyn-primary uppercase">
                    {service.category.name}
                  </span>
                </div>

                <h3 className="text-base font-bold font-heading text-fyn-slate">
                  {service.name} in {city.name}
                </h3>

                <p className="text-xs text-fyn-slate-muted leading-relaxed line-clamp-3">
                  {service.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-fyn-slate-border flex items-center justify-between gap-3">
                <Link
                  href={`/ca-services/${city.slug}/${service.slug}`}
                  className="text-xs font-bold text-fyn-primary hover:underline"
                >
                  Local Details →
                </Link>
                <Link href={`/get-started?service=${service.slug}&city=${city.slug}`}>
                  <Button variant="primary" size="sm">
                    Book Service
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Local Ground Presence Assurance */}
      <div className="p-8 rounded-3xl bg-slate-50 border border-fyn-slate-border grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="space-y-2">
          <ShieldCheck className="w-8 h-8 text-fyn-primary mx-auto md:mx-0" />
          <h4 className="font-bold text-sm text-fyn-slate font-heading">State Tax Circle Support</h4>
          <p className="text-xs text-fyn-slate-muted">Handled by experts familiar with commercial tax circles in {city.state}.</p>
        </div>
        <div className="space-y-2">
          <Award className="w-8 h-8 text-fyn-accent mx-auto md:mx-0" />
          <h4 className="font-bold text-sm text-fyn-slate font-heading">Verified Certified Experts</h4>
          <p className="text-xs text-fyn-slate-muted">All audits and filings are executed exclusively by accredited CAs and CS.</p>
        </div>
        <div className="space-y-2">
          <PhoneCall className="w-8 h-8 text-[#C5A869] mx-auto md:mx-0" />
          <h4 className="font-bold text-sm text-fyn-slate font-heading">Direct Regional Phone Desk</h4>
          <p className="text-xs text-fyn-slate-muted">Call our executive line at +91 9118066449 for rapid advisory response.</p>
        </div>
      </div>

      {/* Local FAQs */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge variant="accent">Local Guidance</Badge>
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Frequently Asked Questions for {city.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cityFaqs.map((faq, idx) => (
            <Card key={idx} variant="default" className="p-6 border-fyn-slate-border space-y-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-fyn-primary shrink-0 mt-0.5" />
                <h3 className="text-sm font-bold text-fyn-slate font-heading">{faq.q}</h3>
              </div>
              <p className="text-xs text-fyn-slate-muted leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
