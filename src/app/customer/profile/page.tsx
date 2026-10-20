"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { Alert } from "@/components/ui/Alert";
import { User, Building2, ShieldCheck, Check, Save } from "lucide-react";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessType: "Private Limited",
    city: "",
    state: "Uttar Pradesh",
    address: "",
    gstNumber: "",
    panNumber: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/profile");
        if (res.ok) {
          const json = await res.json();
          setUser(json.data.user);
          setProfile(json.data.profile);
          setFormData({
            fullName: json.data.user.fullName || "",
            businessName: json.data.profile.businessName || "",
            businessType: json.data.profile.businessType || "Private Limited",
            city: json.data.profile.city || "",
            state: json.data.profile.state || "Uttar Pradesh",
            address: json.data.profile.address || "",
            gstNumber: json.data.profile.gstNumber || "",
            panNumber: json.data.profile.panNumber || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update profile");
      }

      setSuccessMsg("Business profile updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading enterprise profile settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-body">
      {/* Header */}
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Business & Applicant Profile
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Manage your enterprise registration details, primary applicant contacts, and statutory tax IDs.
        </p>
      </div>

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Applicant Details */}
        <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-5">
          <div className="flex items-center gap-2 text-fyn-primary border-b border-fyn-slate-border pb-3">
            <User className="w-5 h-5" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">Primary Applicant Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <div>
              <label className="text-xs font-bold text-fyn-slate block mb-1">Email (System Login)</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fyn-slate block mb-1">Mobile (OTP Verified)</label>
              <input
                type="text"
                disabled
                value={user?.mobile || ""}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Enterprise Registration Details */}
        <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-5">
          <div className="flex items-center gap-2 text-fyn-primary border-b border-fyn-slate-border pb-3">
            <Building2 className="w-5 h-5" />
            <h3 className="text-base font-bold font-heading text-fyn-slate">Enterprise Entity Profile</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Business Name *"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
              <Select
                label="Entity Legal Structure *"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                options={[
                  { label: "Private Limited Company", value: "Private Limited" },
                  { label: "Limited Liability Partnership (LLP)", value: "LLP" },
                  { label: "Sole Proprietorship", value: "Proprietorship" },
                  { label: "Partnership Firm", value: "Partnership" },
                  { label: "One Person Company (OPC)", value: "OPC" },
                  { label: "Startup / Unregistered", value: "Startup" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City *"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State *"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <Textarea
              label="Registered Office Address"
              placeholder="e.g. 301 Corporate Hub, Gomtinagar, Lucknow, UP - 226010"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Goods & Services Tax Number (GSTIN)"
                placeholder="15-digit GSTIN"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
              <Input
                label="Permanent Account Number (PAN)"
                placeholder="10-digit PAN"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
