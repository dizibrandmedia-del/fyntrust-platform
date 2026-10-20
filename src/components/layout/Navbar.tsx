"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ConsultationModal } from "@/components/common/ConsultationModal";
import {
  Mail,
  Phone,
  Menu,
  X,
  ChevronDown,
  Building2,
  Receipt,
  Calculator,
  Users,
  FileCheck,
  TrendingUp,
  Scale,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const serviceCategories = [
    {
      name: "Business Registration",
      slug: "business-registration",
      desc: "Pvt Ltd, LLP, OPC & MSME Incorporation",
      icon: Building2,
    },
    {
      name: "Tax Services",
      slug: "tax-services",
      desc: "GST, ITR, TDS Filings & Tax Audits",
      icon: Receipt,
    },
    {
      name: "Accounting & Finance",
      slug: "accounting-finance",
      desc: "Monthly Bookkeeping & MIS Reporting",
      icon: Calculator,
    },
    {
      name: "Payroll & HR Compliance",
      slug: "payroll-compliance",
      desc: "Salary Calculation, PF & ESIC",
      icon: Users,
    },
    {
      name: "MCA / ROC Compliance",
      slug: "mca-roc-compliance",
      desc: "Annual Filings & Director KYC",
      icon: FileCheck,
    },
    {
      name: "Virtual CFO",
      slug: "virtual-cfo",
      desc: "Executive Financial Leadership & Runway",
      icon: TrendingUp,
    },
    {
      name: "Business Legal Support",
      slug: "legal-support",
      desc: "Agreements, Contracts & Trademark",
      icon: Scale,
    },
  ];

  const navLinks = [
    { name: "Services", href: "/services", hasDropdown: true },
    { name: "Pricing", href: "/pricing" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about" },
    { name: "Resources", href: "/resources" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-sm">
        {/* TOP CONTACT & TRUST BAR (Preserved Emerald Background #01574F) */}
        <div className="bg-[#01574F] text-white/90 text-xs py-2 px-4 sm:px-8 border-b border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a
                href="mailto:team@fyntrust.in"
                className="flex items-center gap-2 hover:text-[#78BB69] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#78BB69]" />
                <span>team@fyntrust.in</span>
              </a>
              <a
                href="tel:+919118066449"
                className="flex items-center gap-2 hover:text-[#78BB69] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#78BB69]" />
                <span>+91 9118066449</span>
              </a>
              <span className="text-white/40">|</span>
              <span className="text-white/80 font-medium">
                PAN India Network of Qualified CAs, CS & CFOs
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-white/70">Offices: Lucknow & Ghazipur</span>
              <span className="text-white/40">•</span>
              <Link
                href="/login"
                className="text-[#78BB69] font-semibold hover:text-white transition-colors"
              >
                Client / Partner Login
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION BAR */}
        <nav className="bg-white border-b border-fyn-slate-border/80 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Logo size="md" href="/" />

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 font-body">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative group"
                      onMouseEnter={() => setServicesDropdownOpen(true)}
                      onMouseLeave={() => setServicesDropdownOpen(false)}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors",
                          isActive
                            ? "text-fyn-primary bg-fyn-primary-subtle/60"
                            : "text-fyn-slate hover:text-fyn-primary hover:bg-slate-50"
                        )}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                      </Link>

                      {/* Mega Dropdown Menu */}
                      {servicesDropdownOpen && (
                        <div className="absolute top-full left-0 w-[580px] p-4 bg-white rounded-2xl shadow-2xl border border-fyn-slate-border grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-150">
                          {serviceCategories.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                              <Link
                                key={cat.slug}
                                href={`/services/category/${cat.slug}`}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-fyn-bg-subtle transition-colors group/item"
                              >
                                <div className="p-2 rounded-lg bg-fyn-primary-subtle text-fyn-primary group-hover/item:bg-fyn-primary group-hover/item:text-white transition-colors shrink-0">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-fyn-slate group-hover/item:text-fyn-primary transition-colors">
                                    {cat.name}
                                  </div>
                                  <p className="text-[11px] text-fyn-slate-muted leading-tight mt-0.5">
                                    {cat.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                          <div className="col-span-2 pt-2 border-t border-fyn-slate-border/60 flex items-center justify-between text-xs px-2">
                            <span className="text-fyn-slate-muted">All services managed end-to-end</span>
                            <Link href="/services" className="text-fyn-primary font-bold hover:underline">
                              View Full Service Catalogue →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors",
                      isActive
                        ? "text-fyn-primary bg-fyn-primary-subtle/60"
                        : "text-fyn-slate hover:text-fyn-primary hover:bg-slate-50"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConsultModalOpen(true)}
              >
                Talk to an Expert
              </Button>
              <Link href="/get-started">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setConsultModalOpen(true)}
              >
                Talk to CA
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-fyn-slate hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-fyn-slate-border bg-white px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold text-fyn-slate hover:bg-fyn-bg-subtle hover:text-fyn-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-fyn-slate-border space-y-2.5">
                <Link href="/get-started" onClick={() => setMobileMenuOpen(false)} className="w-full block">
                  <Button variant="primary" size="md" className="w-full">
                    Get Started — Choose Service
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setConsultModalOpen(true);
                  }}
                >
                  Talk to an Expert
                </Button>
                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-fyn-primary hover:underline"
                  >
                    Client & Partner Portal Login →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Global Consultation Modal */}
      <ConsultationModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </>
  );
};
