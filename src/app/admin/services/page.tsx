"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, Plus, Edit2, CheckCircle, XCircle } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    shortDescription: "",
    startingPrice: "",
    slaDays: "3",
    department: "TAX",
  });

  async function fetchServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const json = await res.json();
        setServices(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Service Catalogue & CMS
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage statutory filing offerings, live pricing, SLAs, eligibility rules, and required documents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading services..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Service Offering</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Starting Fee</th>
                  <th className="p-4">SLA (Turnaround)</th>
                  <th className="p-4">Package Tiers</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate font-heading">{s.name}</div>
                      <div className="text-[10px] text-fyn-slate-muted font-mono">/services/{s.slug}</div>
                    </td>
                    <td className="p-4 text-fyn-slate font-semibold">
                      {s.category?.name || "General"}
                    </td>
                    <td className="p-4 font-bold text-[#01574F] font-heading">
                      {formatCurrency(s.startingPrice)}
                    </td>
                    <td className="p-4 text-fyn-slate-muted font-medium">
                      {s.slaDays} Working Days
                    </td>
                    <td className="p-4">
                      <Badge variant="neutral" size="sm">
                        {s.packages?.length || 0} Tiers
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={s.isActive ? "accent" : "danger"} size="sm">
                        {s.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant={s.isActive ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleToggleActive(s.id, s.isActive)}
                      >
                        {s.isActive ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
