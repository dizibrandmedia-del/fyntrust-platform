import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ServiceCategory, Service, ServicePackage } from "@prisma/client";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Corporate Services Catalogue | Fyntrust",
  description: "Browse 25+ certified CA, tax, accounting, compliance, and virtual CFO services for Indian businesses.",
};

type CategoryWithServices = ServiceCategory & {
  services: (Service & { packages: ServicePackage[] })[];
};

export default async function ServicesCataloguePage() {
  const categories: CategoryWithServices[] = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      services: {
        where: { isActive: true },
        include: { packages: true },
      },
    },
  });

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Building2,
    Receipt,
    Calculator,
    Users,
    FileCheck,
    TrendingUp,
    Scale,
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Practice Directory</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Corporate & Financial Services
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Explore our complete directory of business incorporation, tax filing, accounting,
          statutory compliance, and virtual CFO advisory solutions.
        </p>
      </div>

      {/* Categories Loop */}
      <div className="space-y-16">
        {categories.map((category: CategoryWithServices) => {
          const IconComp = (category.icon && iconMap[category.icon]) || Briefcase;
          return (
            <div key={category.id} className="space-y-6 scroll-mt-28" id={category.slug}>
              <div className="flex items-center gap-3 border-b border-fyn-slate-border pb-4">
                <div className="p-2.5 rounded-xl bg-fyn-primary-subtle text-fyn-primary">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-fyn-slate">
                    {category.name}
                  </h2>
                  <p className="text-xs text-fyn-slate-muted">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service: Service & { packages: ServicePackage[] }) => (
                  <Card
                    key={service.id}
                    variant="default"
                    className="flex flex-col justify-between hover:border-fyn-primary hover:shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-fyn-primary uppercase tracking-wider">
                          {service.department || "Advisory"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-heading text-fyn-slate">
                        {service.name}
                      </h3>

                      <p className="text-xs text-fyn-slate-muted leading-relaxed line-clamp-3">
                        {service.shortDescription}
                      </p>

                      {service.slaDays && (
                        <div className="flex items-center gap-1.5 text-[11px] text-fyn-slate-muted pt-1">
                          <Clock className="w-3.5 h-3.5 text-fyn-accent" />
                          <span>Estimated SLA: {service.slaDays} working days</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-5 mt-4 border-t border-fyn-slate-border flex items-center justify-between gap-3">
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-xs font-bold text-fyn-primary hover:underline"
                      >
                        View Full Details →
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
          );
        })}
      </div>
    </div>
  );
}
