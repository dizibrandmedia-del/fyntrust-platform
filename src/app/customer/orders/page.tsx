"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  FileCheck,
  CreditCard,
  Clock,
  ArrowRight,
  Receipt,
  Download,
  AlertCircle,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== "ALL") params.append("status", filter);
        if (search) params.append("search", search);

        const res = await fetch(`/api/customer/orders?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [filter, search]);

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Service Orders & Filing Status
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track all active professional filings, milestone progress, deliverables, and invoices.
          </p>
        </div>
        <Link href="/order">
          <Button variant="primary" size="md">
            + Place New Service Order
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ACTIVE", label: "Active" },
            { id: "PENDING", label: "Pending Payment" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-[#01574F] text-white shadow-sm"
                  : "bg-white text-fyn-slate-muted border border-fyn-slate-border hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search by Order ID or Service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading service orders..." />
        </div>
      ) : orders.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <ShoppingBag className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No service orders found</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            You do not have any orders matching the selected filter. Explore our CA services to start a new filing.
          </p>
          <Link href="/services">
            <Button variant="primary" size="sm">
              Explore Practice Catalogue
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.paymentStatus === "PAID";
            const completedSteps = order.steps.filter((s: any) => s.status === "COMPLETED").length;
            const totalSteps = order.steps.length || 5;

            return (
              <Card
                key={order.id}
                variant="default"
                className="p-6 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-fyn-primary font-heading">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "success"
                            : !isPaid
                            ? "danger"
                            : "primary"
                        }
                        size="sm"
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold font-heading text-fyn-slate">
                      {order.service?.name}
                    </h3>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <div className="text-lg font-bold text-[#01574F] font-heading">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase ${
                        isPaid ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {isPaid ? "Payment Verified" : "Payment Pending"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 w-full sm:max-w-md">
                    <div className="flex items-center justify-between text-[11px] text-fyn-slate-muted">
                      <span>Filing Milestones</span>
                      <span>
                        {completedSteps} of {totalSteps} Completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#78BB69] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {order.invoices.length > 0 && (
                      <a
                        href={`/api/invoices/${order.invoices[0].invoiceNumber}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          Invoice
                        </Button>
                      </a>
                    )}
                    <Link href={`/customer/orders/${order.id}`} className="w-full sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full">
                        View Order Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
