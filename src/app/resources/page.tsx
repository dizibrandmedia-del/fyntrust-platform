"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TOOLS_LIST, RESOURCE_ARTICLES } from "@/lib/tools/constants";
import {
  Receipt,
  Calculator,
  FileCheck,
  TrendingUp,
  Users,
  Scale,
  Building2,
  Clock,
  Download,
  FileText,
  ArrowRight,
  Search,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    "ALL",
    "GST",
    "Income Tax",
    "MCA",
    "Virtual CFO",
    "Tax",
    "Startup",
  ];

  const filteredArticles = RESOURCE_ARTICLES.filter((art) => {
    const s = search.toLowerCase();
    const matchesSearch =
      art.title.toLowerCase().includes(s) ||
      art.desc.toLowerCase().includes(s) ||
      art.category.toLowerCase().includes(s);
    const matchesCat = selectedCategory === "ALL" || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="gold">Fyntrust Knowledge Hub</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Business & Statutory Resource Hub
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Complimentary guides, tax calculators, compliance checklists, and corporate diagnostics
          designed to give Indian business founders total operational clarity.
        </p>
      </div>

      {/* Interactive Diagnostics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" className="p-6 border-fyn-slate-border bg-gradient-to-br from-[#142A2B] to-[#01574F] text-white space-y-4">
          <Badge variant="accent" size="sm">Diagnostic Checkup</Badge>
          <h2 className="text-xl font-bold font-heading">Is Your Business Fully Compliant?</h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Run our 2-minute diagnostic checkup to verify your GST, TDS, ROC, and ITR filing track record and identify potential exposure.
          </p>
          <Link href="/business-compliance-checkup">
            <Button variant="accent" size="sm" className="font-bold">
              Start Compliance Checkup →
            </Button>
          </Link>
        </Card>

        <Card variant="default" className="p-6 border-fyn-slate-border bg-white space-y-4 shadow-sm">
          <Badge variant="primary" size="sm">Financial Scorecard</Badge>
          <h2 className="text-xl font-bold font-heading text-fyn-slate">Business Financial Health Check</h2>
          <p className="text-xs text-fyn-slate-muted leading-relaxed">
            Assess cash flow stability, accounting quality, working capital buffers, and financial visibility with our health index.
          </p>
          <Link href="/business-health-check">
            <Button variant="outline" size="sm" className="font-bold">
              Run Health Assessment →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Featured Free Calculators */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Free Financial & Tax Calculators
          </h2>
          <Link href="/tools" className="text-xs font-bold text-fyn-primary hover:underline">
            View All 12 Calculators →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_LIST.slice(0, 6).map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
                <Card
                  variant="default"
                  className="h-full flex flex-col justify-between hover:border-fyn-primary hover:shadow-md transition-all p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50 text-[#01574F] group-hover:bg-[#01574F] group-hover:text-white transition-colors w-fit">
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-fyn-slate-muted leading-relaxed">{tool.description}</p>
                  </div>

                  <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                    <span>Calculate Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Guides, Articles & Checklists */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-3">
          <h2 className="text-2xl font-bold font-heading text-fyn-slate">
            Compliance Guides & Advisory Articles
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  selectedCategory === cat ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art, idx) => (
            <Card key={idx} variant="default" className="p-6 border-fyn-slate-border flex flex-col justify-between space-y-4 hover:border-fyn-primary transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{art.category}</Badge>
                  <span className="text-[11px] text-fyn-slate-muted">{art.readTime}</span>
                </div>
                <h3 className="text-base font-bold font-heading text-fyn-slate">{art.title}</h3>
                <p className="text-xs text-fyn-slate-muted leading-relaxed">{art.desc}</p>
              </div>

              <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs">
                <span className="font-semibold text-fyn-primary">{art.type}</span>
                <Link href="/contact" className="text-xs font-bold text-fyn-primary hover:underline flex items-center gap-1">
                  <span>Consult Expert</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
