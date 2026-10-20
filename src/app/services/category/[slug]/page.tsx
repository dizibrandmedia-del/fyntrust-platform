import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Building2,
  Receipt,
  Calculator,
  Users,
  FileCheck,
  TrendingUp,
  Scale,
  Briefcase,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await prisma.serviceCategory.findUnique({
    where: { slug: params.slug },
  });

  if (!category) return { title: "Category Not Found | Fyntrust" };

  return {
    title: `${category.name} Services & Compliance | Fyntrust`,
    description: category.description,
  };
}

export default async function ServiceCategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.serviceCategory.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        where: { isActive: true },
        include: { packages: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const iconMap: Record<string, any> = {
    Building2,
    Receipt,
    Calculator,
    Users,
    FileCheck,
    TrendingUp,
    Scale,
  };

  const IconComp = (category.icon && iconMap[category.icon]) || Briefcase;

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Category Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#142A2B] via-[#01574F] to-[#142A2B] text-white space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/10 text-[#78BB69]">
            <IconComp className="w-8 h-8" />
          </div>
          <Badge variant="accent" size="sm">Practice Vertical</Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white">
          {category.name}
        </h1>

        <p className="text-sm sm:text-base text-white/85 max-w-3xl leading-relaxed">
          {category.description} Delivered by certified Chartered Accountants, Company Secretaries,
          and corporate finance advisors.
        </p>

        <div className="flex flex-wrap gap-4 pt-2 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#78BB69]" />
            <span>Dedicated CA Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C5A869]" />
            <span>100% Paperless Process</span>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Available Services in {category.name}
          </h2>
          <span className="text-xs text-fyn-slate-muted font-medium">
            {category.services.length} services available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.services.map((service) => (
            <Card
              key={service.id}
              variant="executive"
              className="flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-fyn-primary uppercase">
                    {service.department || "Advisory"}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-heading text-fyn-slate">
                  {service.name}
                </h3>

                <p className="text-xs text-fyn-slate-muted leading-relaxed">
                  {service.shortDescription}
                </p>

                {service.slaDays && (
                  <div className="flex items-center gap-1.5 text-xs text-fyn-slate-muted pt-2 border-t border-fyn-slate-border/60">
                    <Clock className="w-3.5 h-3.5 text-fyn-accent" />
                    <span>Turnaround Time: {service.slaDays} Business Days</span>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-4 border-t border-fyn-slate-border flex items-center justify-between gap-3">
                <Link
                  href={`/services/${service.slug}`}
                  className="text-xs font-bold text-fyn-primary hover:underline"
                >
                  View Details →
                </Link>
                <Link href={`/get-started?service=${service.slug}`}>
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Category CTA */}
      <div className="p-8 rounded-3xl bg-slate-100 border border-fyn-slate-border flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading text-fyn-slate">
            Need Custom Scope or Multi-Entity Compliance?
          </h3>
          <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-xl">
            We structure custom corporate retainers for holding companies, subsidiaries, and fast-growing startups.
          </p>
        </div>
        <Link href="/contact">
          <Button variant="primary" size="lg" leftIcon={<PhoneCall className="w-4 h-4" />}>
            Talk to an Advisor
          </Button>
        </Link>
      </div>
    </div>
  );
}
