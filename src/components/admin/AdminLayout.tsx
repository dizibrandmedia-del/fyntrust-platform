"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  Users,
  Target,
  ShoppingBag,
  FileCheck,
  Briefcase,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  CreditCard,
  Receipt,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CalendarCheck2,
  Wrench,
  TrendingUp,
  Globe,
  MapPin,
  Star,
  RotateCcw,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayoutComponent({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.user?.role;
          if (["SUPER_ADMIN", "ADMIN", "SALES"].includes(role)) {
            setUser(data.data.user);
          } else if (role === "CUSTOMER") {
            router.push("/customer/dashboard");
          } else {
            router.push("/login?redirect=/admin/dashboard");
          }
        } else {
          router.push("/login?redirect=/admin/dashboard");
        }
      } catch (err) {
        console.error("Admin auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const navItems = [
    { label: "Control Centre", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Growth & Attribution", href: "/admin/growth", icon: TrendingUp },
    { label: "Lead CRM", href: "/admin/leads", icon: Target },
    { label: "Operations Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Recurring Retainers", href: "/admin/recurring-services", icon: Layers },
    { label: "Compliance Desk", href: "/admin/compliance", icon: CalendarCheck2 },
    { label: "Document Verification", href: "/admin/documents", icon: FileCheck },
    { label: "Customer Accounts", href: "/admin/customers", icon: Users },
    { label: "CA & Legal Experts", href: "/admin/experts", icon: GraduationCap },
    { label: "Service Catalogue", href: "/admin/services", icon: Briefcase },
    { label: "Package Tiers", href: "/admin/packages", icon: Layers },
    { label: "Sales Quotations", href: "/admin/quotations", icon: FileSpreadsheet },
    { label: "Payments Ledger", href: "/admin/payments", icon: CreditCard },
    { label: "Tax Invoices", href: "/admin/invoices", icon: Receipt },
    { label: "SEO & Metadata", href: "/admin/seo", icon: Globe },
    { label: "PAN India Cities", href: "/admin/cities", icon: MapPin },
    { label: "Reviews Moderation", href: "/admin/reviews", icon: Star },
    { label: "URL Redirects", href: "/admin/redirects", icon: RotateCcw },
    { label: "Tools & Calculators", href: "/admin/tools", icon: Wrench },
    { label: "Notification Templates", href: "/admin/notifications", icon: Bell },
    { label: "Operational Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Security Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "Company Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    document.cookie = "fyntrust_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col md:flex-row font-body">
      {/* ============================================================
          DESKTOP ADMIN SIDEBAR
          ============================================================ */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0d1c1d] text-white border-r border-[#1e3c3d] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Logo variant="white" size="md" />
          </Link>
        </div>

        {/* Admin Staff Info */}
        {user && (
          <div className="p-3.5 mx-4 my-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#78BB69] uppercase tracking-wider">
                Operations Desk
              </span>
              <Badge variant="accent" size="sm">
                {user.role}
              </Badge>
            </div>
            <div className="text-xs font-bold font-heading truncate text-white">{user.fullName}</div>
            <div className="text-[10px] text-white/60 truncate">{user.email}</div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            // Hide Audit Logs and Settings for Sales role
            if (user?.role === "SALES" && ["/admin/audit-logs", "/admin/settings", "/admin/payments"].includes(item.href)) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#01574F] text-white font-bold shadow-sm"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#78BB69]" : "text-white/50"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================
          MOBILE TOP HEADER
          ============================================================ */}
      <header className="md:hidden bg-[#0d1c1d] text-white p-4 sticky top-0 z-40 flex items-center justify-between border-b border-white/10 shadow-md">
        <Link href="/admin/dashboard">
          <Logo variant="white" size="sm" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0d1c1d] z-40 p-6 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? "bg-[#01574F] text-white font-bold" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#78BB69]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MAIN ADMIN WORKSPACE AREA
          ============================================================ */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-fyn-slate-border sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-fyn-slate-muted">
            <span className="font-bold text-fyn-primary">Fyntrust Control Centre</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-fyn-slate font-medium capitalize">
              {pathname.replace("/admin/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/services" target="_blank" className="text-xs text-fyn-slate-muted hover:text-fyn-primary flex items-center gap-1 font-semibold">
              <span>View Public Portal ↗</span>
            </Link>

            <div className="pl-3 border-l border-fyn-slate-border flex items-center gap-2 text-xs font-bold text-fyn-slate">
              <span className="w-2 h-2 rounded-full bg-[#78BB69]" />
              <span>System Live</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
