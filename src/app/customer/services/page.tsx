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
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

export default function CustomerServicesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/orders");
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load customer services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const activeServices = orders.filter((o) => o.status !== "CANCELLED");

  return (
    <div className="space-y-10 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Active Corporate Services
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage your company's active retainers, ongoing registrations, and advisory engagements.
          </p>
        </div>
        <Link href="/services">
          <Button variant="primary" size="md">
            + Explore All Services
          </Button>
        </Link>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading active services portfolio..." />
        </div>
      ) : activeServices.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <Briefcase className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No active services enrolled</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            You do not have any active business services. Browse our catalog to initiate company registration, accounting, or tax advisory.
          </p>
          <Link href="/services">
            <Button variant="primary" size="sm">
              Browse Practice Catalogue
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeServices.map((order) => (
            <Card
              key={order.id}
              variant="default"
              className="p-6 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-fyn-primary uppercase tracking-wider">
                    {order.service?.department || "Tax & Compliance"}
                  </span>
                  <Badge variant={order.status === "COMPLETED" ? "success" : "primary"} size="sm">
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold font-heading text-fyn-slate">
                  {order.service?.name}
                </h3>

                <div className="text-xs text-fyn-slate-muted space-y-1">
                  <div><strong>Order Reference:</strong> {order.orderNumber}</div>
                  <div><strong>Subscribed Plan:</strong> {order.package?.name || "Standard Advisory Plan"}</div>
                  <div><strong>Enrolled Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-fyn-slate-border flex items-center justify-between">
                <span className="text-sm font-bold text-[#01574F] font-heading">
                  {formatCurrency(order.totalAmount)}
                </span>
                <Link href={`/customer/orders/${order.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Service Workspace
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================
          RECOMMENDED CROSS-SELL SERVICES
          ============================================================ */}
      <div className="space-y-6 pt-6 border-t border-fyn-slate-border">
        <div className="space-y-1">
          <Badge variant="accent">Recommended Growth Add-ons</Badge>
          <h2 className="text-xl font-bold font-heading text-fyn-slate">
            Complimentary Services for Your Enterprise
          </h2>
          <p className="text-xs text-fyn-slate-muted">
            Frequently paired services to keep your company compliant and tax-optimized.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              slug: "monthly-bookkeeping-accounting",
              name: "Monthly Bookkeeping & Accounting",
              price: "₹2,999/mo",
              desc: "Complete cloud accounting, bank reconciliations, and P&L reporting.",
            },
            {
              slug: "annual-roc-filing-company",
              name: "Annual MCA / ROC Compliance",
              price: "₹4,999/yr",
              desc: "Statutory AGM records, AOC-4, MGT-7 filings, and board minutes.",
            },
            {
              slug: "virtual-cfo-advisory",
              name: "Virtual CFO & Strategic Advisory",
              price: "₹10,000/mo",
              desc: "13-week rolling cash flows, unit economics, and board MIS.",
            },
          ].map((rec) => (
            <Card key={rec.slug} variant="default" className="p-5 border-fyn-slate-border space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold font-heading text-fyn-slate">{rec.name}</h4>
                <p className="text-xs text-fyn-slate-muted">{rec.desc}</p>
              </div>
              <Link href={`/order?service=${rec.slug}`} className="block pt-2">
                <Button variant="primary" size="sm" className="w-full">
                  Add Service →
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
