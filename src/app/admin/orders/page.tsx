"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Search, Filter, AlertCircle, CheckCircle, Clock, UserCheck } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [assignedFilter, setAssignedFilter] = useState("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load admin orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.businessName && o.customer.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customer?.user?.fullName && o.customer.user.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customer?.user?.mobile && o.customer.user.mobile.includes(search));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;
    const matchesAssigned =
      assignedFilter === "ALL" ||
      (assignedFilter === "UNASSIGNED" && !o.assignedExpertId) ||
      (assignedFilter === "ASSIGNED" && o.assignedExpertId);

    return matchesSearch && matchesStatus && matchesPayment && matchesAssigned;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Operations & Service Orders
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage filing workflow, manual CA expert allocation, milestone tracking, and deliverables.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <Card variant="default" className="p-4 border-fyn-slate-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-fyn-slate mb-1">Search Orders</label>
            <Input
              placeholder="Search by Order ID, Client, Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-fyn-slate mb-1">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="DOCUMENTS_PENDING">Documents Pending</option>
              <option value="EXPERT_ASSIGNED">Expert Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-fyn-slate mb-1">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-fyn-slate mb-1">CA Allocation</label>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
            >
              <option value="ALL">All Allocations</option>
              <option value="UNASSIGNED">Awaiting Assignment</option>
              <option value="ASSIGNED">CA Assigned</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading orders..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No orders match the selected filters.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Service & Tier</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Assigned CA</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-fyn-primary">{order.orderNumber}</div>
                      <div className="text-[10px] text-fyn-slate-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{order.customer?.businessName || order.customer?.user?.fullName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{order.customer?.user?.mobile}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-fyn-slate">{order.service?.name}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{order.package?.name || "Standard Statutory"}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={order.paymentStatus === "PAID" ? "accent" : "danger"} size="sm">
                        {order.paymentStatus}
                      </Badge>
                      <div className="text-[11px] font-bold text-fyn-slate mt-0.5">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="primary" size="sm">
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {order.assignedExpert ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#01574F]">
                          <UserCheck className="w-3.5 h-3.5 text-[#78BB69]" />
                          <span>CA {order.assignedExpert.qualification}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="font-bold">
                          Manage →
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
  );
}
