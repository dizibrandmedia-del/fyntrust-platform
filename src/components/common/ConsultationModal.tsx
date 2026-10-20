"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ShieldCheck, PhoneCall } from "lucide-react";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultService = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    city: "",
    businessType: "Private Limited",
    service: defaultService || "General Advisory",
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
          notes: `[Service Requested: ${formData.service}] ${formData.notes}`.trim(),
          source: "WEBSITE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to submit consultation request");
      }

      setSuccessMsg(
        "Thank you! Your consultation request has been assigned to our senior CA advisory team. We will call you within 30 minutes."
      );
      setFormData({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        city: "",
        businessType: "Private Limited",
        service: "",
        notes: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please call +91 9118066449 directly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consult a Senior CA / Finance Advisor"
      description="Connect directly with our PAN India Chartered Accountants and Virtual CFOs for tailored guidance."
      maxWidth="lg"
    >
      {successMsg ? (
        <div className="space-y-5 py-4">
          <Alert variant="success" title="Request Received Successfully">
            {successMsg}
          </Alert>
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Full Name"
              required
              placeholder="e.g. Rohit Gupta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
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
              label="Business Name"
              placeholder="e.g. ABC Technologies"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
            <Select
              label="Business Entity Type"
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              options={[
                { label: "Private Limited Company", value: "Private Limited" },
                { label: "Limited Liability Partnership (LLP)", value: "LLP" },
                { label: "Sole Proprietorship", value: "Proprietorship" },
                { label: "Partnership Firm", value: "Partnership" },
                { label: "One Person Company (OPC)", value: "OPC" },
                { label: "Startup / Pre-incorporation", value: "Startup" },
              ]}
            />
          </div>

          <Select
            label="Service Requirement"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            options={[
              { label: "GST Registration & Return Filing", value: "GST Services" },
              { label: "Income Tax Return (ITR) & Tax Audit", value: "Tax Services" },
              { label: "Private Limited / LLP Registration", value: "Company Registration" },
              { label: "Monthly Bookkeeping & Accounting", value: "Accounting & Finance" },
              { label: "Virtual CFO & Financial Strategy", value: "Virtual CFO" },
              { label: "Annual MCA / ROC Compliance", value: "ROC Compliance" },
              { label: "Business Agreements & Trademark", value: "Legal Support" },
              { label: "General Advisory / Other Support", value: "General Advisory" },
            ]}
          />

          <Textarea
            label="Brief Requirements or Query (Optional)"
            placeholder="Tell us about your business requirement, estimated turnover, or current compliance status..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex items-center gap-2 text-xs text-fyn-slate-muted pt-1">
            <ShieldCheck className="w-4 h-4 text-fyn-accent" />
            <span>Strict NDA & confidentiality guaranteed. Your details will never be shared.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-fyn-slate-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<PhoneCall className="w-4 h-4" />}
            >
              Request Free Consultation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
