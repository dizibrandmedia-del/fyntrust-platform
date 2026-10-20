"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  ShoppingBag,
  FileCheck,
  CreditCard,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Receipt,
  Download,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/dashboard");
        if (!res.ok) {
          throw new Error("Unable to load dashboard data. Please try again.");
        }
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message || "Failed to load customer workspace");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading corporate workspace..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <h3 className="text-lg font-bold">Workspace Unavailable</h3>
        <p className="text-xs">{error || "Could not retrieve account details."}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { user, customerProfile, metrics, actionRequired, recentOrders, upcomingCompliance } = data;

  return (
    <div className="space-y-8 font-body">
      {/* ============================================================
          TOP WELCOME BANNER
          ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#142A2B] to-[#01574F] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#78BB69]" />
            <span className="text-[11px] font-semibold text-[#78BB69] uppercase tracking-wider">
              {customerProfile.businessType || "Corporate Account"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">
            Welcome, {user.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-white/80">
            {customerProfile.businessName || "Your Enterprise"} • GSTIN:{" "}
            {customerProfile.gstNumber || "Unregistered"} • Location: {customerProfile.city || "India"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/order">
            <Button variant="accent" size="sm" className="font-bold shadow-md">
              + New Service Order
            </Button>
          </Link>
          <Link href="/customer/documents">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Upload Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================
          KPI SUMMARY CARDS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default" className="p-5 flex items-center justify-between border-fyn-slate-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fyn-slate-muted">Active Services</span>
            <div className="text-2xl font-bold font-heading text-fyn-slate">
              {metrics.activeServicesCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-fyn-primary">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between border-fyn-slate-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fyn-slate-muted">Active Orders</span>
            <div className="text-2xl font-bold font-heading text-fyn-slate">
              {metrics.activeOrdersCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between border-fyn-slate-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fyn-slate-muted">Pending Documents</span>
            <div className="text-2xl font-bold font-heading text-amber-600">
              {metrics.pendingDocumentsCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between border-fyn-slate-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fyn-slate-muted">Pending Payments</span>
            <div className="text-2xl font-bold font-heading text-rose-600">
              {metrics.pendingPaymentsCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* ============================================================
          HIGH PRIORITY ACTION ITEMS
          ============================================================ */}
      {actionRequired.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-fyn-slate-muted flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Action Required</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionRequired.map((act: any) => (
              <div
                key={act.id}
                className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-fyn-slate font-heading">{act.title}</div>
                  <p className="text-xs text-fyn-slate-muted">{act.desc}</p>
                </div>
                <Link href={act.link} className="shrink-0">
                  <Button variant="primary" size="sm">
                    Resolve →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          RECENT ORDERS & COMPLIANCE SPLIT GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Active Orders & Trackers
            </h2>
            <Link href="/customer/orders" className="text-xs font-bold text-fyn-primary hover:underline">
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <Card variant="default" className="p-8 text-center space-y-3 border-fyn-slate-border">
              <ShoppingBag className="w-8 h-8 mx-auto text-fyn-slate-muted" />
              <div className="text-sm font-bold text-fyn-slate font-heading">No active orders yet</div>
              <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
                Explore our certified Chartered Accountant services to get started with business incorporation, GST, or tax filing.
              </p>
              <Link href="/services">
                <Button variant="primary" size="sm">
                  Browse Services Catalogue
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <Card
                  key={order.id}
                  variant="default"
                  className="p-5 border-fyn-slate-border hover:border-fyn-primary transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-fyn-primary font-heading">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "success"
                            : order.paymentStatus === "PENDING"
                            ? "danger"
                            : "primary"
                        }
                        size="sm"
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold font-heading text-fyn-slate">
                      {order.service?.name}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-fyn-slate-muted">
                      <span>Order Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                      <span>•</span>
                      <span>Total: {formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <Link href={`/customer/orders/${order.id}`} className="shrink-0 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Track Progress →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Compliance Calendar (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">
              Compliance Due Dates
            </h2>
            <Link href="/customer/compliance" className="text-xs font-bold text-fyn-primary hover:underline">
              Full Calendar →
            </Link>
          </div>

          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            {upcomingCompliance.length === 0 ? (
              <div className="py-6 text-center text-xs text-fyn-slate-muted space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-fyn-slate-muted" />
                <p>All statutory filings are currently up to date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingCompliance.map((comp: any) => (
                  <div
                    key={comp.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-fyn-slate-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-fyn-slate font-heading">{comp.title}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {new Date(comp.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-fyn-slate-muted">{comp.period || "Statutory Return"}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-fyn-slate-border text-center">
              <Link href="/customer/compliance">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View Statutory Calendar
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
