"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import {
  Search,
  Home,
  Briefcase,
  Wrench,
  PhoneCall,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const popularLinks = [
    { title: "Company & LLP Registration", href: "/services/private-limited-company-registration" },
    { title: "GST Registration & Return Filing", href: "/services/gst-registration" },
    { title: "Income Tax & Corporate Audits", href: "/services/income-tax-return-filing" },
    { title: "Virtual CFO Advisory", href: "/services/virtual-cfo-services" },
    { title: "Free Business Calculators", href: "/tools" },
    { title: "Compliance Checkup", href: "/business-compliance-checkup" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body flex flex-col justify-center py-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <Logo variant="dark" size="lg" />
        </div>

        <div className="space-y-3">
          <span className="text-5xl sm:text-7xl font-bold font-heading text-[#01574F]">
            404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-md mx-auto">
            The page or statutory service you are looking for might have moved, been renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search services, calculators, cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>
          <Button variant="primary" size="md" type="submit">
            Search
          </Button>
        </form>

        {/* Popular Pages */}
        <Card variant="default" className="p-6 border-fyn-slate-border text-left space-y-4">
          <h3 className="text-sm font-bold font-heading text-fyn-slate flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-fyn-primary" /> Popular Fyntrust Services & Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {popularLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-fyn-primary hover:text-fyn-primary transition-all flex items-center justify-between font-medium text-fyn-slate"
              >
                <span>{item.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Advisory Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
