"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  Calendar,
  Layers,
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function CustomerRecurringServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  async function fetchServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/customer/recurring-services");
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

  const handleRenew = async (serviceId: string) => {
    try {
      setRenewingId(serviceId);
      const res = await fetch(`/api/customer/recurring-services/${serviceId}/renew`, {
        method: "POST",
      });
      if (res.ok) {
        setActionMessage("✓ Service retainer successfully renewed for another year!");
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Recurring Retainers & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage your ongoing monthly GST filing, bookkeeping, payroll, and Virtual CFO subscriptions.
          </p>
        </div>

        <Link href="/services">
          <Button variant="accent" size="sm">
            + Explore Retainer Services
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading recurring subscriptions..." />
        </div>
      ) : services.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold font-heading text-fyn-slate">No Active Retainers</h2>
            <p>
              Subscribe to automated monthly GST filings, regular bookkeeping, or dedicated Virtual CFO advisory to keep your business 100% compliant.
            </p>
            <div className="pt-2">
              <Link href="/services">
                <Button variant="primary" size="sm">
                  View Monthly Compliance Packages →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {services.map((sub) => (
            <Card key={sub.id} variant="default" className="p-6 border-fyn-slate-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-heading text-fyn-slate">
                      {sub.service?.name}
                    </h2>
                    <Badge variant={sub.status === "ACTIVE" ? "accent" : "warning"} size="sm">
                      {sub.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-fyn-slate-muted">
                    Billing Frequency: <strong className="text-fyn-slate">{sub.billingFrequency}</strong> • Started: {new Date(sub.startDate).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-heading text-[#01574F]">
                    ₹{sub.totalAmount.toLocaleString("en-IN")}<span className="text-xs font-normal text-fyn-slate-muted"> / {sub.billingFrequency.toLowerCase()}</span>
                  </div>
                  <span className="text-[10px] text-fyn-slate-muted">Incl. 18% GST (₹{sub.taxAmount})</span>
                </div>
              </div>

              {/* Retainer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-fyn-slate-muted block text-[11px]">Assigned CA Desk</span>
                  <strong className="text-fyn-slate">
                    {sub.assignedExpert?.user?.fullName || "Fyntrust Certified Expert Desk"}
                  </strong>
                  <span className="block text-[10px] text-fyn-slate-muted font-mono">{sub.assignedExpert?.qualification || "CA"}</span>
                </div>
                <div>
                  <span className="text-fyn-slate-muted block text-[11px]">Next Scheduled Billing</span>
                  <strong className="text-fyn-slate">
                    {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString("en-IN") : "Auto-Scheduled"}
                  </strong>
                </div>
                <div>
                  <span className="text-fyn-slate-muted block text-[11px]">Annual Renewal Date</span>
                  <strong className="text-fyn-slate">
                    {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-IN") : "N/A"}
                  </strong>
                </div>
              </div>

              {/* Billing Cycle History */}
              {sub.billingCycles?.length > 0 && (
                <div className="pt-4 border-t border-fyn-slate-border space-y-3">
                  <h3 className="text-xs font-bold uppercase text-fyn-slate tracking-wider">
                    Recent Billing Cycles & Invoices:
                  </h3>
                  <div className="space-y-2">
                    {sub.billingCycles.map((cycle: any) => (
                      <div
                        key={cycle.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-fyn-slate">{cycle.periodLabel} Retainer</span>
                          <span className="block text-[10px] text-fyn-slate-muted">
                            Due: {new Date(cycle.dueDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-fyn-slate">₹{cycle.amount.toLocaleString("en-IN")}</span>
                          <Badge variant={cycle.status === "PAID" ? "accent" : "warning"} size="sm">
                            {cycle.status}
                          </Badge>
                          {cycle.invoiceId && (
                            <Link href="/customer/invoices" className="text-[11px] font-bold text-fyn-primary hover:underline">
                              Invoice ↗
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renewal Action */}
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenew(sub.id)}
                  disabled={renewingId === sub.id}
                >
                  {renewingId === sub.id ? "Renewing..." : "Renew Retainer (1 Year)"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
