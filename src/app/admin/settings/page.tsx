"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Settings, ShieldCheck, Building2, Phone, Mail, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    companyName: "Fyntrust Technologies Pvt. Ltd.",
    email: "team@fyntrust.in",
    phone: "+91 9118066449",
    office1: "Alamapati, Ghazipur, UP - 233001",
    office2: "Gomtinagar Extension, Lucknow, UP - 226010",
    gstin: "09AAFCF1234F1Z8",
    orderPrefix: "FYN-2026",
    invoicePrefix: "FYN/INV/2026",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("✓ Company operational settings updated successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading corporate configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body max-w-3xl">
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Company Settings & Operations
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Corporate statutory parameters, office addresses, GSTIN numbers, and tax invoice sequence prefixes.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {message}
        </div>
      )}

      <Card variant="default" className="p-6 border-fyn-slate-border">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Company Legal Name</label>
              <Input
                value={settings.companyName || ""}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Corporate GSTIN</label>
              <Input
                value={settings.gstin || ""}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Official Support Email</label>
              <Input
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Official Support Hotline</label>
              <Input
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Registered Office (Ghazipur)</label>
              <Input
                value={settings.office1 || ""}
                onChange={(e) => setSettings({ ...settings, office1: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Corporate Office (Lucknow)</label>
              <Input
                value={settings.office2 || ""}
                onChange={(e) => setSettings({ ...settings, office2: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Order ID Sequence Prefix</label>
              <Input
                value={settings.orderPrefix || ""}
                onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Invoice Number Prefix</label>
              <Input
                value={settings.invoicePrefix || ""}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-fyn-slate-border">
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
