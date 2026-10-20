"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TOOLS_LIST } from "@/lib/tools/constants";
import {
  Search,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function ToolsHubPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = ["ALL", "TAX", "COMPLIANCE", "FINANCE", "HR & PAYROLL", "STARTUP", "BILLING", "ADVISORY"];

  const filtered = TOOLS_LIST.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s);
    const matchesCat = activeCategory === "ALL" || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="accent" size="md">
            Free Fyntrust Business Toolkit
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
            Financial, Tax & Compliance Calculators
          </h1>
          <p className="text-sm sm:text-base text-fyn-slate-muted">
            100% free professional utilities designed for Indian business owners, CFOs, and founders. Calculate tax liabilities, verify statutory due dates, and optimize business financials.
          </p>
        </div>

        {/* Diagnostic CTA Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#142A2B] to-[#01574F] text-white shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <Badge variant="accent" size="sm">
                Interactive Checkup
              </Badge>
              <h2 className="text-xl font-bold font-heading">Is Your Business Fully Compliant?</h2>
              <p className="text-xs text-white/80">
                Take our 2-minute diagnostic to identify potential statutory exposure across GST, TDS, ROC, and ITR.
              </p>
            </div>
            <Link href="/business-compliance-checkup">
              <Button variant="accent" size="sm" className="font-bold">
                Start Compliance Checkup →
              </Button>
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-fyn-slate-border shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <Badge variant="primary" size="sm">
                Diagnostic Scorecard
              </Badge>
              <h2 className="text-xl font-bold font-heading text-fyn-slate">
                Know the Financial Health of Your Business
              </h2>
              <p className="text-xs text-fyn-slate-muted">
                Analyze your cash flow, working capital, accounting quality, and financial visibility with our health check.
              </p>
            </div>
            <Link href="/business-health-check">
              <Button variant="outline" size="sm" className="font-bold">
                Run Business Health Check →
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-fyn-slate-muted absolute left-3 top-3.5" />
              <Input
                placeholder="Search calculators & tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-[#01574F] text-white font-bold"
                      : "bg-white text-fyn-slate border border-fyn-slate-border hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
                <Card
                  variant="default"
                  className="h-full p-6 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-emerald-50 text-[#01574F] group-hover:bg-[#01574F] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="accent" size="sm">
                        {tool.badge}
                      </Badge>
                    </div>

                    <h2 className="text-base font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-xs text-fyn-slate-muted leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                    <span>Open Calculator</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Statutory Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Statutory Disclaimer:</strong> The tools and calculators on this platform provide indicative estimates for educational and informational purposes only. They do not constitute formal legal, taxation, accounting, or financial opinion. Tax laws and statutory rates are subject to official notifications by the Ministry of Finance / MCA. Please consult a qualified Fyntrust Chartered Accountant for advisory specific to your enterprise.
          </p>
        </div>
      </div>
    </div>
  );
}
