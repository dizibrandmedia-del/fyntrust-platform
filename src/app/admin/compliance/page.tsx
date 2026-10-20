"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  CalendarCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function AdminCompliancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function fetchCompliance() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/compliance");
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
    fetchCompliance();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading enterprise compliance operations..." />
      </div>
    );
  }

  const { records = [], metrics = {} } = data || {};

  const filtered = records.filter((r: any) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.customer?.businessName && r.customer.businessName.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Statutory Compliance Command Centre
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Monitor client statutory filing deadlines across GST, TDS, ROC, and ITR with automated penalty risk flags.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchCompliance}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Deadlines
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Overdue Filings</span>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {metrics.overdueCount || 0}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Late Fee Exposure</span>
        </Card>

        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Upcoming (Due Soon)</span>
          <div className="text-2xl font-bold font-heading text-[#01574F]">
            {metrics.upcomingCount || 0}
          </div>
          <span className="text-[10px] text-fyn-slate-muted">Next 30 Days</span>
        </Card>

        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Completed Filings</span>
          <div className="text-2xl font-bold font-heading text-emerald-700">
            {metrics.completedCount || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">✓ 100% Verified</span>
        </Card>

        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Total Tracked Obligations</span>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {metrics.totalTracked || 0}
          </div>
          <span className="text-[10px] text-fyn-slate-muted">All Client Portfolios</span>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by Filing Title or Enterprise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Categories</option>
          <option value="GST">GST</option>
          <option value="TDS">TDS</option>
          <option value="ROC_MCA">ROC / MCA</option>
          <option value="INCOME_TAX">Income Tax</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OVERDUE">Overdue</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Deadlines Table */}
      {filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No compliance obligations match your filter criteria.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Filing Obligation</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Statutory Due Date</th>
                  <th className="p-4">Assigned CA Desk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Penalty Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{item.title}</div>
                      <div className="text-[10px] text-fyn-slate-muted uppercase tracking-wider">{item.category} • {item.period}</div>
                    </td>
                    <td className="p-4 font-bold text-fyn-slate">
                      {item.customer?.businessName}
                    </td>
                    <td className="p-4 font-mono font-bold text-fyn-primary">
                      {new Date(item.dueDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-fyn-slate-muted">
                      {item.assignedExpert?.user?.fullName || "Unassigned"}
                    </td>
                    <td className="p-4">
                      <Badge variant={item.status === "COMPLETED" ? "accent" : item.status === "OVERDUE" ? "danger" : "primary"} size="sm">
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-[11px] text-amber-900">
                      {item.penaltyRisk || "Standard late fee"}
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
