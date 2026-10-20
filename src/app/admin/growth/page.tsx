"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  TrendingUp,
  Users,
  Target,
  ShoppingBag,
  DollarSign,
  Share2,
  RefreshCw,
  Award,
} from "lucide-react";

export default function AdminGrowthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchGrowth() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/growth");
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
    fetchGrowth();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Aggregating growth analytics..." />
      </div>
    );
  }

  const { metrics = {}, leadsBySource = [], topServices = [], topCampaigns = [] } = data || {};

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Growth, Attribution & Conversion Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track visitor traffic, UTM marketing channel attribution, lead-to-paid conversion rates, and revenue performance.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchGrowth}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Total Page Events</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {metrics.totalVisitors?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[10px] text-fyn-slate-muted">Analytics Traffic Logged</span>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">CRM Leads Generated</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-700">
            {metrics.totalLeads?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold">
            {metrics.conversionRate || 0}% Paid Conversion
          </span>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Paid Orders Completed</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-fyn-slate">
            {metrics.paidOrders || 0} / {metrics.totalOrders || 0}
          </div>
          <span className="text-[10px] text-fyn-slate-muted">Total Orders Placed</span>
        </Card>

        <Card variant="default" className="p-5 border-fyn-slate-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fyn-slate-muted">Platform Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#01574F]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#01574F]">
            ₹{metrics.totalRevenue?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">100% Verified Receipts</span>
        </Card>
      </div>

      {/* Grid: Lead Sources & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources Breakdown */}
        <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Share2 className="w-4 h-4 text-fyn-primary" /> Lead Attribution by Marketing Source
          </h2>

          {leadsBySource.length === 0 ? (
            <p className="text-xs text-fyn-slate-muted py-6 text-center">No leads recorded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {leadsBySource.map((src: any) => (
                <div key={src.source} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-fyn-slate">{src.source}</span>
                  <Badge variant="accent" size="sm">
                    {src.count} Leads
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Services by Revenue */}
        <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
          <h2 className="text-base font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Award className="w-4 h-4 text-fyn-primary" /> Top Services by Revenue
          </h2>

          {topServices.length === 0 ? (
            <p className="text-xs text-fyn-slate-muted py-6 text-center">No service orders recorded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {topServices.map((srv: any) => (
                <div key={srv.serviceId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-fyn-slate">{srv.name}</span>
                    <span className="block text-[10px] text-fyn-slate-muted">{srv.ordersCount} Orders</span>
                  </div>
                  <span className="font-bold font-heading text-[#01574F]">
                    ₹{srv.revenue?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Top Campaigns Table */}
      {topCampaigns.length > 0 && (
        <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
          <h2 className="text-base font-bold font-heading text-fyn-slate">
            Top UTM Marketing Campaigns
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Source</th>
                  <th className="p-3 text-right">Attributed Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCampaigns.map((camp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-fyn-slate">{camp.campaign}</td>
                    <td className="p-3 text-fyn-primary">{camp.source}</td>
                    <td className="p-3 text-right font-bold text-fyn-slate">{camp.eventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
