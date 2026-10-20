"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  FileCheck,
  CreditCard,
  Receipt,
  CalendarCheck2,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Layers,
} from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerPortalLayout({ children }: CustomerLayoutProps) {
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
          if (data.data?.user) {
            setUser(data.data.user);
          } else {
            router.push("/login?redirect=/customer/dashboard");
          }
        } else {
          router.push("/login?redirect=/customer/dashboard");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const navItems = [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Active Services", href: "/customer/services", icon: Briefcase },
    { label: "Recurring Retainers", href: "/customer/recurring-services", icon: Layers },
    { label: "My Orders", href: "/customer/orders", icon: ShoppingBag },
    { label: "Document Vault", href: "/customer/documents", icon: FileCheck },
    { label: "Payments", href: "/customer/payments", icon: CreditCard },
    { label: "Tax Invoices", href: "/customer/invoices", icon: Receipt },
    { label: "Compliance Calendar", href: "/customer/compliance", icon: CalendarCheck2 },
    { label: "Messages & Support", href: "/customer/messages", icon: MessageSquare },
    { label: "Notifications", href: "/customer/notifications", icon: Bell },
    { label: "Business Profile", href: "/customer/profile", icon: User },
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
          DESKTOP SIDEBAR
          ============================================================ */}
      <aside className="hidden md:flex flex-col w-72 bg-[#142A2B] text-white border-r border-[#1e3c3d] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2">
            <Logo variant="white" size="md" />
          </Link>
        </div>

        {/* Client Entity Badge */}
        {user && (
          <div className="p-4 mx-4 my-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#78BB69]" />
              <span className="text-[11px] font-semibold text-[#78BB69] uppercase tracking-wider">
                Corporate Workspace
              </span>
            </div>
            <div className="text-xs font-bold font-heading truncate text-white">
              {user.customerProfile?.businessName || user.fullName}
            </div>
            <div className="text-[10px] text-white/60 truncate">{user.email}</div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/customer/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#01574F] text-white shadow-sm font-bold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#78BB69]" : "text-white/60"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/services"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>Browse Services</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#78BB69]" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================
          MOBILE TOP NAVBAR
          ============================================================ */}
      <header className="md:hidden bg-[#142A2B] text-white p-4 sticky top-0 z-40 flex items-center justify-between border-b border-white/10 shadow-md">
        <Link href="/customer/dashboard">
          <Logo variant="white" size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/customer/notifications" className="p-2 rounded-lg bg-white/10 text-white relative">
            <Bell className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#142A2B] z-40 p-6 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold ${
                    isActive ? "bg-[#01574F] text-white font-bold" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#78BB69]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-bold bg-rose-500/20 text-rose-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MAIN WORKSPACE CONTENT AREA
          ============================================================ */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-fyn-slate-border sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-fyn-slate-muted">
            <span className="font-semibold text-fyn-primary">Fyntrust Client Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-fyn-slate font-medium capitalize">
              {pathname.replace("/customer/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/order" className="inline-block">
              <Button variant="primary" size="sm">
                + Order New Service
              </Button>
            </Link>

            <Link
              href="/customer/notifications"
              className="p-2 rounded-xl border border-fyn-slate-border text-fyn-slate hover:bg-slate-50 relative"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link
              href="/customer/profile"
              className="flex items-center gap-2.5 pl-3 border-l border-fyn-slate-border text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#01574F] text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || "C"}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-fyn-slate font-heading">{user?.fullName || "Client"}</div>
                <div className="text-[10px] text-fyn-slate-muted">{user?.customerProfile?.city || "Verified Business"}</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
