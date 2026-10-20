import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  Lock,
  ArrowUpRight,
} from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: "Private Limited Registration", href: "/services/private-limited-company-registration" },
    { name: "LLP Registration", href: "/services/llp-registration" },
    { name: "GST Registration & Filing", href: "/services/gst-registration" },
    { name: "Income Tax Return (ITR)", href: "/services/income-tax-return-filing" },
    { name: "Monthly Bookkeeping & MIS", href: "/services/monthly-bookkeeping-accounting" },
    { name: "Annual ROC Filing", href: "/services/annual-roc-filing-company" },
    { name: "Virtual CFO Advisory", href: "/services/virtual-cfo-advisory" },
    { name: "Trademark Registration", href: "/services/trademark-registration" },
  ];

  const categories = [
    { name: "Business Registration", href: "/services/category/business-registration" },
    { name: "Tax Services", href: "/services/category/tax-services" },
    { name: "Accounting & Finance", href: "/services/category/accounting-finance" },
    { name: "Payroll & HR Compliance", href: "/services/category/payroll-compliance" },
    { name: "MCA / ROC Compliance", href: "/services/category/mca-roc-compliance" },
    { name: "Virtual CFO", href: "/services/category/virtual-cfo" },
    { name: "Business Legal Support", href: "/services/category/legal-support" },
  ];

  const popularCities = [
    { name: "Delhi", href: "/ca-services/delhi" },
    { name: "Mumbai", href: "/ca-services/mumbai" },
    { name: "Bengaluru", href: "/ca-services/bengaluru" },
    { name: "Hyderabad", href: "/ca-services/hyderabad" },
    { name: "Lucknow", href: "/ca-services/lucknow" },
    { name: "Varanasi", href: "/ca-services/varanasi" },
    { name: "Noida", href: "/ca-services/noida" },
    { name: "Pune", href: "/ca-services/pune" },
    { name: "Kolkata", href: "/ca-services/kolkata" },
    { name: "Chennai", href: "/ca-services/chennai" },
  ];

  return (
    <footer className="bg-[#142A2B] text-white border-t-4 border-[#01574F]">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-white/10 py-8 px-4 sm:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#01574F]/50 text-[#78BB69] border border-[#78BB69]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-white font-heading">Strict Confidentiality</div>
              <p className="text-xs text-white/60">Bank-grade data security and client non-disclosure.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#01574F]/50 text-[#C5A869] border border-[#C5A869]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-white font-heading">Certified CA & CS Network</div>
              <p className="text-xs text-white/60">Services executed exclusively by certified professionals.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#01574F]/50 text-[#78BB69] border border-[#78BB69]/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-white font-heading">100% Transparent Pricing</div>
              <p className="text-xs text-white/60">No hidden charges or surprise government fee marks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Corporate Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Logo variant="white" size="lg" />
          <p className="text-sm text-white/75 leading-relaxed font-body pr-4">
            Fyntrust is India’s premier digital corporate business-services platform. We empower
            startups, MSMEs, and established enterprises with end-to-end Chartered Accountancy,
            Taxation, Company Secretarial, Accounting, and Virtual CFO solutions through our curated
            PAN India professional network.
          </p>

          <div className="space-y-3 text-xs text-white/80">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#78BB69] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Registered Corporate Office:</span>
                <p className="text-white/70">1st Office: Alamapati, Ghazipur, Uttar Pradesh - 233001</p>
                <p className="text-white/70">2nd Office: Gomtinagar Extension, Lucknow, UP - 226010</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#78BB69] shrink-0" />
              <a href="tel:+919118066449" className="hover:text-[#78BB69] transition-colors">
                +91 9118066449
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#78BB69] shrink-0" />
              <a href="mailto:team@fyntrust.in" className="hover:text-[#78BB69] transition-colors">
                team@fyntrust.in
              </a>
            </div>
          </div>
        </div>

        {/* Popular Services */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#78BB69] font-heading">
            Popular Services
          </h3>
          <ul className="space-y-2.5 text-xs text-white/75 font-body">
            {services.map((s) => (
              <li key={s.name}>
                <Link href={s.href} className="hover:text-white hover:underline transition-colors">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Categories */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#78BB69] font-heading">
            Core Verticals
          </h3>
          <ul className="space-y-2.5 text-xs text-white/75 font-body">
            {categories.map((c) => (
              <li key={c.name}>
                <Link href={c.href} className="hover:text-white hover:underline transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links & Resources */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#78BB69] font-heading">
            Company & Resources
          </h3>
          <ul className="space-y-2.5 text-xs text-white/75 font-body">
            <li><Link href="/about" className="hover:text-white transition-colors">About Fyntrust</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Overview</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Free Business Toolkit</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Compliance & Tax Blog</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Our Advisors</Link></li>
            <li><Link href="/login" className="text-[#C5A869] font-semibold hover:underline">Client Portal Login</Link></li>
          </ul>
        </div>
      </div>

      {/* PAN India City Network Grid */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-8 bg-black/10 text-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="font-semibold text-white/90">PAN India Expert Locations:</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/60">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={city.href}
                className="hover:text-[#78BB69] transition-colors inline-flex items-center gap-1"
              >
                <span>CA Services in {city.name}</span>
                <ArrowUpRight className="w-3 h-3 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer & Copyright */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-8 text-[11px] text-white/50 leading-relaxed">
        <div className="max-w-7xl mx-auto space-y-3">
          <p>
            <strong className="text-white/70">Statutory Disclaimer:</strong> Fyntrust is a digital business
            facilitation and management consulting platform. Professional services including statutory audits,
            taxation filings, litigation support, and legal drafting are executed independently by qualified
            Chartered Accountants, Company Secretaries, Advocates, and finance professionals registered with
            their respective apex regulatory bodies (ICAI, ICSI, Bar Council of India).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-white/5 gap-2">
            <div>
              © {currentYear} Fyntrust Technologies Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-white/60">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <span>•</span>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
