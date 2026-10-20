"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  Layers,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Pause,
  Play,
  XCircle,
  FileText,
  Search,
  Filter,
} from "lucide-react";

export default function AdminRecurringServicesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchRecurring() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/recurring-services");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "ACTIVE" | "PAUSED" | "CANCELLED") => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/recurring-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CHANGE_STATUS", status: newStatus }),
      });
      if (res.ok) {
        fetchRecurring();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async (id: string, cycleNumber: number) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/recurring-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_INVOICE", cycleNumber }),
      });
      if (res.ok) {
        alert("Recurring invoice generated successfully!");
        fetchRecurring();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading recurring revenue operations..." />
      </div>
    );
  }

  const { services = [], metrics = {} } = data || {};

  const filtered = services.filter((s: any) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (s.customer?.businessName && s.customer.businessName.toLowerCase().includes(query)) ||
      (s.service?.name && s.service.name.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Recurring Retainers & MRR Command Centre
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage monthly client bookkeeping subscriptions, GST filing retainers, and automated billing cycles.
          </p>
        </div>
      </div>

      {/* MRR Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Monthly Recurring Revenue (MRR)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#01574F]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#01574F]">
            ₹{metrics.monthlyRecurringRevenue?.toLocaleString("en-IN") || 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Predictable Active Retainer Base
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Active Retainers</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {metrics.totalActive || 0}
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            Monthly / Quarterly Clients
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Payment Due / Overdue</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {metrics.paymentDueCount || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Automated Payment Link Active
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search by Client Enterprise, Service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Subscriptions</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No recurring subscriptions match your filter criteria.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Retainer Service</th>
                  <th className="p-4">Frequency & Amount</th>
                  <th className="p-4">Assigned Expert</th>
                  <th className="p-4">Next Billing Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{sub.customer?.businessName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{sub.customer?.user?.fullName} • {sub.customer?.user?.mobile}</div>
                    </td>
                    <td className="p-4 font-semibold text-fyn-slate">
                      {sub.service?.name}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">₹{sub.totalAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{sub.billingFrequency}</div>
                    </td>
                    <td className="p-4 text-fyn-slate-muted">
                      {sub.assignedExpert?.user?.fullName || "Unassigned"}
                    </td>
                    <td className="p-4">
                      {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="p-4">
                      <Badge variant={sub.status === "ACTIVE" ? "accent" : sub.status === "PAUSED" ? "warning" : "danger"} size="sm">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === "ACTIVE" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(sub.id, "PAUSED")}
                            disabled={actionLoading}
                          >
                            <Pause className="w-3 h-3 mr-1" /> Pause
                          </Button>
                        ) : (
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleStatusChange(sub.id, "ACTIVE")}
                            disabled={actionLoading}
                          >
                            <Play className="w-3 h-3 mr-1" /> Resume
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateInvoice(sub.id, sub.billingCycles?.[0]?.cycleNumber || 1)}
                          disabled={actionLoading}
                        >
                          <FileText className="w-3 h-3 mr-1" /> Invoice
                        </Button>
                      </div>
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
