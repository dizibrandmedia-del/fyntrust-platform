"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Target,
  FileCheck,
  CreditCard,
  GraduationCap,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Aggregating executive operations data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-fyn-slate-border text-fyn-slate-muted">
        Failed to load control centre metrics.
      </div>
    );
  }

  const { kpis, unassignedOrders, recentOrders, recentLeads, recentAuditLogs } = data;

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Executive Control Centre
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Real-time PAN-India financial operations, order fulfillment, lead pipeline, and expert allocation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads">
            <Button variant="outline" size="sm">
              + New CRM Lead
            </Button>
          </Link>
          <Link href="/admin/services">
            <Button variant="primary" size="sm">
              + New Service
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================
          EXECUTIVE KPI METRICS GRID
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#01574F]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#01574F]">
            {formatCurrency(kpis.totalRevenue)}
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            This Month: <strong>{formatCurrency(kpis.monthlyRevenue)}</strong>
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Total Orders</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {kpis.totalOrders}
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            Pending Payment: <strong>{kpis.pendingPaymentOrders}</strong>
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Unassigned Orders</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {kpis.unassignedOrdersCount}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Action Required: Assign CA
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Leads & Conversion</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {kpis.totalLeads} Leads
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            Conversion Rate: <strong>{kpis.conversionRate}%</strong>
          </div>
        </Card>
      </div>

      {/* ============================================================
          UNASSIGNED ORDERS QUEUE (HIGH PRIORITY ACTION)
          ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Orders Awaiting Manual Expert Assignment ({unassignedOrders.length})
            </h2>
          </div>
          <Link href="/admin/orders?assigned=unassigned" className="text-xs font-bold text-fyn-primary hover:underline">
            View All Unassigned →
          </Link>
        </div>

        {unassignedOrders.length === 0 ? (
          <Card variant="default" className="p-6 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
            ✓ All active paid orders have been assigned to designated Chartered Accountants.
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/50 border-b border-amber-100 text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Client Enterprise</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Documents</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unassignedOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-fyn-primary">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-fyn-slate">{order.customer?.businessName || order.customer?.user?.fullName}</div>
                        <div className="text-[10px] text-fyn-slate-muted">{order.customer?.user?.mobile}</div>
                      </td>
                      <td className="p-4 font-semibold text-fyn-slate">
                        {order.service?.name}
                      </td>
                      <td className="p-4 text-fyn-slate-muted">
                        {order.customer?.city || "Lucknow"}
                      </td>
                      <td className="p-4">
                        <Badge variant="neutral" size="sm">
                          {order.documents?.length || 0} Files
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-[#01574F] font-heading">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="accent" size="sm" className="font-bold">
                            Assign CA →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          RECENT LEADS & AUDIT LOGS SPLIT GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent CRM Leads */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Recent Website Leads
            </h2>
            <Link href="/admin/leads" className="text-xs font-bold text-fyn-primary hover:underline">
              CRM Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead: any) => (
              <Card
                key={lead.id}
                variant="default"
                className="p-4 border-fyn-slate-border hover:border-fyn-primary transition-all flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-fyn-slate font-heading">{lead.name}</span>
                    <Badge variant={lead.status === "NEW_LEAD" ? "accent" : "neutral"} size="sm">
                      {lead.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-fyn-slate-muted">
                    {lead.service?.name || "General Advisory"} • {lead.mobile} • {lead.city || "Online"}
                  </p>
                </div>

                <Link href={`/admin/leads`}>
                  <Button variant="ghost" size="sm">
                    Follow-up →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Audit Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Security & Audit Trail
            </h2>
            <Link href="/admin/audit-logs" className="text-xs font-bold text-fyn-primary hover:underline">
              Full Logs →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-fyn-slate-border p-4 space-y-3 text-xs">
            {recentAuditLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 border-b border-fyn-slate-border pb-2.5 last:border-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-fyn-slate">
                    [{log.action}] on {log.entity}
                  </div>
                  <div className="text-[10px] text-fyn-slate-muted">
                    By {log.user?.fullName || "System"} ({log.userRole || "CORE"})
                  </div>
                </div>
                <span className="text-[10px] text-fyn-slate-muted font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
