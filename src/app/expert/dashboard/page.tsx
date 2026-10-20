"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  Briefcase,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MessageSquare,
  Award,
} from "lucide-react";

export default function ExpertDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/expert/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load expert dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading CA operations workspace..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-fyn-slate-border text-fyn-slate-muted">
        Failed to load CA operations workspace.
      </div>
    );
  }

  const { kpis, assignedOrders, pendingTasks, notifications } = data;

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            CA Operations Workspace
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage your assigned filing portfolio, review customer documents, draft statutory applications, and deliver completion certificates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/expert/orders">
            <Button variant="outline" size="sm">
              View All Filings ({assignedOrders.length})
            </Button>
          </Link>
          <Link href="/expert/documents">
            <Button variant="accent" size="sm">
              Review Documents ({kpis.documentsAwaitingReview})
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================
          EXPERT KPI METRICS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Active Assignments</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#01574F]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#01574F]">
            {kpis.activeAssignments}
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            In Progress: <strong>{kpis.workInProgress}</strong>
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Action Required</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {kpis.pendingActions}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">
            Documents + Pending Tasks
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Docs Awaiting Review</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-blue-700">
            {kpis.documentsAwaitingReview}
          </div>
          <div className="text-[11px] text-fyn-slate-muted">
            PAN, Aadhaar, MOA, Utility Bills
          </div>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Completed This Month</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {kpis.completedThisMonth}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            ✓ 100% Verified Deliverables
          </div>
        </Card>
      </div>

      {/* ============================================================
          ASSIGNED ORDERS QUEUE
          ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-fyn-slate">
            Assigned Filings & Active Workload
          </h2>
          <Link href="/expert/orders" className="text-xs font-bold text-fyn-primary hover:underline">
            View All →
          </Link>
        </div>

        {assignedOrders.length === 0 ? (
          <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
            You currently have no assigned Fyntrust filings. When the operations desk assigns an order, it will appear here.
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Client Enterprise</th>
                    <th className="p-4">Service Offering</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Document Vault</th>
                    <th className="p-4">Filing Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-fyn-primary">{order.orderNumber}</div>
                        <div className="text-[10px] text-fyn-slate-muted">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-fyn-slate">{order.customer?.businessName || order.customer?.user?.fullName}</div>
                        <div className="text-[10px] text-fyn-slate-muted">{order.customer?.user?.mobile}</div>
                      </td>
                      <td className="p-4 font-semibold text-fyn-slate">
                        {order.service?.name}
                        <span className="block text-[10px] text-fyn-slate-muted font-normal">{order.package?.name || "Standard Compliance"}</span>
                      </td>
                      <td className="p-4 text-fyn-slate-muted">
                        {order.customer?.city || "Lucknow"}, {order.customer?.state || "UP"}
                      </td>
                      <td className="p-4">
                        <Badge variant="neutral" size="sm">
                          {order.documents?.length || 0} Documents
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="primary" size="sm">
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/expert/orders/${order.id}`}>
                          <Button variant="accent" size="sm" className="font-bold">
                            Open Workspace →
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
          PENDING TASKS & RECENT NOTIFICATIONS GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Filing Checklist Tasks
            </h2>
            <Link href="/expert/tasks" className="text-xs font-bold text-fyn-primary hover:underline">
              Manage Tasks →
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <Card variant="default" className="p-6 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
              ✓ All filing checklist tasks are completed.
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t: any) => (
                <Card
                  key={t.id}
                  variant="default"
                  className="p-4 border-fyn-slate-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-fyn-slate font-heading">{t.title}</span>
                      <Badge variant={t.priority === "URGENT" ? "danger" : "warning"} size="sm">
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-fyn-slate-muted">
                      Order: {t.order?.orderNumber} • {t.order?.service?.name}
                    </p>
                  </div>

                  <Link href={`/expert/orders/${t.orderId}`}>
                    <Button variant="ghost" size="sm">
                      Resolve →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Recent Partner Alerts
            </h2>
            <Link href="/expert/notifications" className="text-xs font-bold text-fyn-primary hover:underline">
              All Alerts →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-fyn-slate-border p-4 space-y-3 text-xs">
            {notifications.length === 0 ? (
              <p className="text-center text-fyn-slate-muted py-4">No recent notifications.</p>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 border-b border-fyn-slate-border pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-fyn-slate">{n.title}</div>
                    <p className="text-[11px] text-fyn-slate-muted">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-fyn-slate-muted font-mono whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
