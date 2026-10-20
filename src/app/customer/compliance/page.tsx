"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  CalendarCheck2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function CustomerCompliancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "MONTH" | "CALENDAR">("LIST");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  async function fetchCompliance() {
    try {
      setLoading(true);
      const res = await fetch("/api/customer/compliance");
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load compliance calendar:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompliance();
  }, []);

  const filtered = records.filter((rec) => {
    const matchesCat = selectedCategory === "ALL" || rec.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || rec.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const overdueCount = records.filter((r) => r.status === "OVERDUE").length;
  const upcomingCount = records.filter((r) => r.status === "UPCOMING" || r.status === "DUE_SOON").length;
  const completedCount = records.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
              Enterprise Statutory Compliance Calendar
            </h1>
            <CalendarCheck2 className="w-6 h-6 text-[#78BB69]" />
          </div>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track statutory filing deadlines, GSTR-1/3B dates, TDS deposits, and MCA / ROC requirements tailored for your enterprise.
          </p>
        </div>

        <div className="flex gap-2">
          {["LIST", "MONTH", "CALENDAR"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                viewMode === mode ? "bg-[#01574F] text-white font-bold" : "bg-white text-fyn-slate border-slate-200"
              }`}
            >
              {mode} View
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Upcoming Deadlines</span>
          <div className="text-2xl font-bold font-heading text-[#01574F]">{upcomingCount}</div>
          <span className="text-[10px] text-fyn-slate-muted">Monitored by Fyntrust CA Desk</span>
        </Card>

        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Overdue / Action Needed</span>
          <div className="text-2xl font-bold font-heading text-amber-600">{overdueCount}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Avoid statutory penalties</span>
        </Card>

        <Card variant="default" className="p-4 border-fyn-slate-border space-y-1">
          <span className="text-xs text-fyn-slate-muted font-medium">Completed Filings</span>
          <div className="text-2xl font-bold font-heading text-emerald-700">{completedCount}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">✓ 100% Verified</span>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "GST", "TDS", "ROC_MCA", "INCOME_TAX"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                selectedCategory === cat ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OVERDUE">Overdue</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading enterprise compliance calendar..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No compliance deadlines match your selected filter criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card
              key={item.id}
              variant="default"
              className={`p-6 border transition-all flex flex-col justify-between space-y-4 ${
                item.status === "OVERDUE"
                  ? "border-amber-300 bg-amber-50/40"
                  : item.status === "COMPLETED"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-fyn-slate-border hover:border-fyn-primary"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={item.category === "GST" ? "primary" : item.category === "ROC_MCA" ? "accent" : "neutral"} size="sm">
                    {item.category.replace(/_/g, " ")}
                  </Badge>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    item.status === "OVERDUE" ? "bg-red-100 text-red-800" : "bg-slate-100 text-fyn-slate"
                  }`}>
                    <Clock className="w-3 h-3" /> {new Date(item.dueDate).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <h3 className="text-sm font-bold font-heading text-fyn-slate">
                  {item.title}
                </h3>

                <p className="text-xs text-fyn-slate-muted leading-relaxed">
                  Filing Period: <strong>{item.period}</strong>
                </p>

                {item.penaltyRisk && (
                  <p className="text-[11px] text-amber-900 font-medium">
                    Late Risk: {item.penaltyRisk}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs">
                <Badge variant={item.status === "COMPLETED" ? "accent" : item.status === "OVERDUE" ? "danger" : "primary"} size="sm">
                  {item.status.replace(/_/g, " ")}
                </Badge>

                <Link href="/services">
                  <span className="font-bold text-[#01574F] hover:underline flex items-center gap-1">
                    File with CA →
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Advisory Banner */}
      <div className="p-6 rounded-2xl bg-[#E6F0EF] border border-[#01574F]/20 text-[#01574F] flex items-start gap-4">
        <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold font-heading text-sm">Automated Retainer Protection</div>
          <p className="text-fyn-slate-muted leading-relaxed">
            Eliminate all late fee risks forever. Enroll into our Monthly Bookkeeping & GST Retainer, and our assigned Chartered Accountants will prepare, reconcile, and file every return automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
