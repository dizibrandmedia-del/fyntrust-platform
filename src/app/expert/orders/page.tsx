"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { ShoppingBag, Search, Filter, AlertCircle, FileCheck, CheckCircle2, Clock } from "lucide-react";

export default function ExpertOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/expert/orders");
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load assigned orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(s) ||
      (o.customer?.businessName && o.customer.businessName.toLowerCase().includes(s)) ||
      (o.customer?.user?.fullName && o.customer.user.fullName.toLowerCase().includes(s)) ||
      (o.service?.name && o.service.name.toLowerCase().includes(s));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Assigned Statutory Filings
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            All corporate filing orders assigned to your desk. Verify applicant documents, update milestone statuses, and deliver final certificates.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search by Order ID, Client, Service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Assigned Filings</option>
          <option value="EXPERT_ASSIGNED">Expert Assigned</option>
          <option value="WORK_IN_PROGRESS">Work In Progress</option>
          <option value="DOCUMENTS_PENDING">Documents Pending</option>
          <option value="SUBMITTED_FILED">Portal Submitted / Filed</option>
          <option value="GOVERNMENT_PROCESSING">Government Processing</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading assigned filings..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No assigned filings match your filter criteria.
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
                  <th className="p-4">Documents</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
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
                        {order.documents?.length || 0} Files
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
                          Open Filing →
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
