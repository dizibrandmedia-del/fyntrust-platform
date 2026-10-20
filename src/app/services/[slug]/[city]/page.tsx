import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  ArrowRight,
  Briefcase,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ServiceCityPageProps {
  params: {
    slug: string;
    city: string;
  };
}

export async function generateMetadata({ params }: ServiceCityPageProps) {
  const [service, city] = await Promise.all([
    prisma.service.findUnique({ where: { slug: params.slug } }),
    prisma.city.findUnique({ where: { slug: params.city } }),
  ]);

  if (!service || !city) return { title: "Page Not Found | Fyntrust" };

  return {
    title: `${service.name} in ${city.name} | Expert CA Support | Fyntrust`,
    description: `Get professional ${service.name} in ${city.name}, ${city.state}. Fast turnaround, dedicated CA review, and transparent pricing.`,
  };
}

export default async function ServiceCityPage({ params }: ServiceCityPageProps) {
  const [service, city] = await Promise.all([
    prisma.service.findUnique({
      where: { slug: params.slug },
      include: { category: true, packages: true },
    }),
    prisma.city.findUnique({ where: { slug: params.city } }),
  ]);

  if (!service || !city) {
    notFound();
  }

  const whatsIncluded: string[] = service.whatsIncluded ? JSON.parse(service.whatsIncluded) : [];
  const processSteps: { step: number; title: string; desc: string }[] = service.processSteps
    ? JSON.parse(service.processSteps)
    : [];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Service + City Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#142A2B] via-[#01574F] to-[#142A2B] text-white space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-[#78BB69]" />
          <span className="text-[#78BB69] font-bold">{city.name}, {city.state}</span>
          <span className="text-white/40">•</span>
          <span>{service.category.name}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white">
          {service.name} in {city.name}
        </h1>

        <p className="text-sm sm:text-base text-white/85 max-w-3xl leading-relaxed">
          Get dedicated Chartered Accountant and corporate secretarial assistance for {service.name.toLowerCase()} in {city.name}.
          {service.shortDescription}
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href={`/get-started?service=${service.slug}&city=${city.slug}`}>
            <Button variant="accent" size="lg" className="font-bold">
              Start {service.name} in {city.name}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="border-white/40 text-white" leftIcon={<PhoneCall className="w-4 h-4 text-[#78BB69]" />}>
              Talk to {city.name} Advisor
            </Button>
          </Link>
        </div>
      </div>

      {/* What's Included */}
      {whatsIncluded.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            What’s Included for {city.name} Businesses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whatsIncluded.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-fyn-slate-border flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-fyn-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-fyn-slate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Steps */}
      {processSteps.length > 0 && (
        <div className="space-y-8 bg-slate-50 p-8 sm:p-12 rounded-3xl border border-fyn-slate-border">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="accent">Simple 100% Online Process</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
              How We Execute in {city.name}
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

      {/* City CTA */}
      <div className="p-8 rounded-3xl bg-[#01574F] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold font-heading">Need Fast Turnaround in {city.name}?</h3>
          <p className="text-xs text-white/80">Submit your details and get assigned a regional CA today.</p>
        </div>
        <Link href={`/get-started?service=${service.slug}&city=${city.slug}`}>
          <Button variant="accent" size="lg" className="font-bold">
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
