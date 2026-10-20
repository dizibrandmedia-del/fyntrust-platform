"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Building2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    city: "",
    businessType: "Private Limited",
    service: "GST & Tax Filing",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim() || undefined,
          businessName: formData.businessName.trim() || undefined,
          city: formData.city.trim() || undefined,
          businessType: formData.businessType,
          notes: `[Subject: ${formData.service}] ${formData.notes}`.trim(),
          source: "WEBSITE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to submit enquiry.");
      }

      setSuccessMsg(
        "Thank you! Your enquiry has been received and assigned to a Fyntrust Senior CA / Business Advisor. We will contact you within 30 minutes."
      );
      setFormData({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        city: "",
        businessType: "Private Limited",
        service: "GST & Tax Filing",
        notes: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit. Please call +91 9118066449 directly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Executive CA Helpdesk</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Connect With Our Advisory Team
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Reach out for tailored financial consultation, company incorporation, tax audits,
          or virtual CFO retainers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Corporate Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-3xl bg-[#142A2B] text-white space-y-6 border border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold font-heading">Corporate Advisory Desk</h2>
            <p className="text-xs text-white/75 leading-relaxed">
              Our central operations and chartered accountancy desk operates Monday through Saturday,
              9:00 AM to 7:00 PM IST.
            </p>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Direct Phone Lines</div>
                  <a href="tel:+919118066449" className="text-white/80 hover:text-[#78BB69] transition-colors block">
                    +91 9118066449 (Main CA Desk)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Email Enquiries</div>
                  <a href="mailto:team@fyntrust.in" className="text-white/80 hover:text-[#78BB69] transition-colors block">
                    team@fyntrust.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">WhatsApp Advisory Channel</div>
                  <a
                    href="https://wa.me/919118066449"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#78BB69] font-bold hover:underline block"
                  >
                    Chat on WhatsApp (+91 9118066449) →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <MapPin className="w-5 h-5 text-[#78BB69] shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <div>
                    <div className="font-semibold text-white">1st Registered Office</div>
                    <p className="text-white/70">Alamapati, Ghazipur, Uttar Pradesh - 233001</p>
                  </div>
                  <div>
                    <div className="font-semibold text-white">2nd Executive Office</div>
                    <p className="text-white/70">Gomtinagar Extension, Lucknow, Uttar Pradesh - 226010</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-fyn-slate-border space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-fyn-primary">
              <ShieldCheck className="w-4 h-4 text-fyn-accent" />
              <span>Strict Privacy & Non-Disclosure</span>
            </div>
            <p className="text-xs text-fyn-slate-muted leading-relaxed">
              We uphold strict professional ethics. All queries and business financial data are kept
              100% confidential under non-disclosure terms.
            </p>
          </div>
        </div>

        {/* Right Contact Form (Lead Creation) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-fyn-slate-border shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate">
              Submit Business Enquiry
            </h2>
            <p className="text-xs text-fyn-slate-muted mt-1">
              Fill in your details below and a qualified CA or CS will reach out to you directly.
            </p>
          </div>

          {successMsg ? (
            <Alert variant="success" title="Enquiry Submitted Successfully">
              {successMsg}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="10-Digit Mobile Number"
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. ananya@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="City"
                  placeholder="e.g. Lucknow, Delhi, Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business / Enterprise Name"
                  placeholder="e.g. Zenith Tech Innovations"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
                <Select
                  label="Entity Type"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  options={[
                    { label: "Private Limited Company", value: "Private Limited" },
                    { label: "Limited Liability Partnership (LLP)", value: "LLP" },
                    { label: "Sole Proprietorship", value: "Proprietorship" },
                    { label: "Partnership Firm", value: "Partnership" },
                    { label: "One Person Company (OPC)", value: "OPC" },
                    { label: "Startup / New Business", value: "Startup" },
                  ]}
                />
              </div>

              <Select
                label="Primary Service Required"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                options={[
                  { label: "GST Registration & Return Filing", value: "GST & Tax Filing" },
                  { label: "Company Incorporation (Pvt Ltd / LLP)", value: "Company Incorporation" },
                  { label: "Income Tax Return (ITR) & Tax Audit", value: "Income Tax & Audit" },
                  { label: "Monthly Accounting & Bookkeeping", value: "Accounting & Bookkeeping" },
                  { label: "Virtual CFO Advisory & Financial Strategy", value: "Virtual CFO" },
                  { label: "Annual MCA / ROC Statutory Compliance", value: "ROC Compliance" },
                  { label: "Business Agreements & Trademark", value: "Legal & Trademark" },
                  { label: "General Business Consultation", value: "General Consultation" },
                ]}
              />

              <Textarea
                label="Detailed Query / Business Requirements"
                placeholder="Tell us about your turnover, current accounting software, or specific compliance questions..."
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold"
                  isLoading={isLoading}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Enquiry to CA Desk
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
