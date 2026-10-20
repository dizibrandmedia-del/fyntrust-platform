"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, Briefcase } from "lucide-react";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/reports");
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
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Generating operational reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Operational & Service Performance Reports
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Revenue by corporate service category, filing volume trends, and CA expert workload distribution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Performance Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-fyn-slate">Revenue & Filings by Service</h2>
          <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Service Offering</th>
                  <th className="p-4">Total Filings</th>
                  <th className="p-4">Paid Orders</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.servicePerformance?.map((s: any) => (
                  <tr key={s.serviceId} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-fyn-slate font-heading">{s.serviceName}</td>
                    <td className="p-4 font-semibold text-fyn-slate">{s.totalOrders}</td>
                    <td className="p-4"><Badge variant="accent" size="sm">{s.paidOrders}</Badge></td>
                    <td className="p-4 text-right font-bold text-[#01574F] font-heading">{formatCurrency(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expert Workload Distribution */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-fyn-slate">CA Expert Workload & Efficiency</h2>
          <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">CA Expert</th>
                  <th className="p-4">Active Filings</th>
                  <th className="p-4">Completed</th>
                  <th className="p-4 text-right">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.expertWorkload?.map((e: any) => (
                  <tr key={e.expertId} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate font-heading">{e.expertName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">CA / {e.qualification}</div>
                    </td>
                    <td className="p-4 font-bold text-amber-700">{e.activeOrders}</td>
                    <td className="p-4 font-bold text-emerald-700">{e.completedOrders}</td>
                    <td className="p-4 text-right">
                      <Badge variant={e.activeOrders > 5 ? "warning" : "accent"} size="sm">
                        {e.activeOrders > 5 ? "Heavy" : "Normal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
