"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import {
  LayoutDashboard,
  ShoppingBag,
  FileCheck,
  CheckSquare,
  Award,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface ExpertLayoutProps {
  children: React.ReactNode;
}

export function ExpertLayoutComponent({ children }: ExpertLayoutProps) {
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
          const allowed = [
            "CA_FINANCE_EXPERT",
            "ACCOUNTANT",
            "LEGAL_PARTNER",
            "VIRTUAL_CFO",
            "SUPER_ADMIN",
            "ADMIN",
          ];
          if (allowed.includes(role)) {
            setUser(data.data.user);
          } else {
            router.push("/login?redirect=/expert/dashboard");
          }
        } else {
          router.push("/login?redirect=/expert/dashboard");
        }
      } catch (err) {
        console.error("Expert auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const navItems = [
    { label: "CA Workspace", href: "/expert/dashboard", icon: LayoutDashboard },
    { label: "Assigned Filings", href: "/expert/orders", icon: ShoppingBag },
    { label: "Document Centre", href: "/expert/documents", icon: FileCheck },
    { label: "Filing Tasks", href: "/expert/tasks", icon: CheckSquare },
    { label: "Work Deliverables", href: "/expert/deliverables", icon: Award },
    { label: "Client Messages", href: "/expert/messages", icon: MessageSquare },
    { label: "Notifications", href: "/expert/notifications", icon: Bell },
    { label: "Professional Profile", href: "/expert/profile", icon: User },
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
          DESKTOP EXPERT SIDEBAR
          ============================================================ */}
      <aside className="hidden md:flex flex-col w-72 bg-[#142A2B] text-white border-r border-[#1e3c3d] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/expert/dashboard" className="flex items-center gap-2">
            <Logo variant="white" size="md" />
          </Link>
        </div>

        {/* Expert Professional Info */}
        {user && (
          <div className="p-3.5 mx-4 my-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#78BB69] uppercase tracking-wider">
                Expert Workspace
              </span>
              <Badge variant="accent" size="sm">
                {user.role.replace(/_/g, " ")}
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
              pathname === item.href || (item.href !== "/expert/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
      <header className="md:hidden bg-[#142A2B] text-white p-4 sticky top-0 z-40 flex items-center justify-between border-b border-white/10 shadow-md">
        <Link href="/expert/dashboard">
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
        <div className="md:hidden fixed inset-0 top-16 bg-[#142A2B] z-40 p-6 flex flex-col justify-between overflow-y-auto">
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
          MAIN EXPERT WORKSPACE
          ============================================================ */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-fyn-slate-border sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-fyn-slate-muted">
            <span className="font-bold text-fyn-primary">Fyntrust CA Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-fyn-slate font-medium capitalize">
              {pathname.replace("/expert/", "").replace("-", " ") || "Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-[#01574F] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#78BB69]" />
            <span>Assigned Partner Desk Active</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
