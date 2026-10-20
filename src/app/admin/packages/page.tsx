"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { Layers, Plus } from "lucide-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/packages");
        if (res.ok) {
          const json = await res.json();
          setPackages(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Service Package Tiers
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Configure multi-tier pricing bundles (Starter, Growth, Compliance Pro, Virtual CFO).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading packages..." />
        </div>
      ) : packages.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No service packages found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} variant="default" className="p-5 border-fyn-slate-border space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={pkg.isPopular ? "gold" : "primary"} size="sm">
                  {pkg.tier}
                </Badge>
                <span className="text-lg font-bold font-heading text-[#01574F]">
                  {formatCurrency(pkg.price)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-fyn-slate text-sm font-heading">{pkg.name}</h3>
                <p className="text-[11px] text-fyn-slate-muted">For: {pkg.service?.name}</p>
              </div>

              <p className="text-xs text-fyn-slate-muted">{pkg.description || "Comprehensive statutory execution package."}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
