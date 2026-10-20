"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { User, ShieldCheck, GraduationCap, MapPin, Briefcase } from "lucide-react";

export default function ExpertProfilePage() {
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    city: "",
    state: "",
    availabilityStatus: "AVAILABLE",
    expertise: "",
  });

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/expert/profile");
      if (res.ok) {
        const json = await res.json();
        setExpert(json.data);
        setForm({
          city: json.data.city || "",
          state: json.data.state || "",
          availabilityStatus: json.data.availabilityStatus || "AVAILABLE",
          expertise: json.data.expertise || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/expert/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("✓ Profile & availability status updated successfully.");
        fetchProfile();
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
        <Loader size="lg" text="Loading professional profile..." />
      </div>
    );
  }

  if (!expert) {
    return <div className="p-8 text-center text-xs text-fyn-slate-muted">Profile not found.</div>;
  }

  return (
    <div className="space-y-6 font-body max-w-3xl">
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Professional Partner Profile
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Your ICAI/Bar professional qualifications, expertise domains, active availability, and assigned filing stats.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Readonly Credentials Card */}
      <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-heading text-fyn-slate">{expert.user?.fullName}</h2>
            <p className="text-xs font-semibold text-fyn-primary">
              Chartered Accountant / {expert.qualification}
            </p>
          </div>
          <Badge variant={expert.availabilityStatus === "AVAILABLE" ? "accent" : "warning"} size="md">
            {expert.availabilityStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-fyn-slate-border text-xs">
          <div>
            <span className="text-fyn-slate-muted block text-[11px]">Contact Details</span>
            <strong className="text-fyn-slate">{expert.user?.mobile}</strong>
            <span className="block text-[11px] text-fyn-slate-muted">{expert.user?.email}</span>
          </div>
          <div>
            <span className="text-fyn-slate-muted block text-[11px]">Experience</span>
            <strong className="text-fyn-slate">{expert.experienceYears} Years Practicing</strong>
          </div>
          <div>
            <span className="text-fyn-slate-muted block text-[11px]">Assigned Filings</span>
            <strong className="text-[#01574F] font-bold font-heading">{expert._count?.assignedOrders || 0} Total Orders</strong>
          </div>
        </div>
      </Card>

      {/* Permitted Profile Settings Form */}
      <Card variant="default" className="p-6 border-fyn-slate-border">
        <h3 className="text-sm font-bold font-heading text-fyn-slate mb-4">Availability & Operational City</h3>
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Availability Status</label>
              <select
                value={form.availabilityStatus}
                onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              >
                <option value="AVAILABLE">Available (Open for new assignments)</option>
                <option value="BUSY">Busy (High active workload)</option>
                <option value="INACTIVE">Inactive / On Leave</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Specialized Expertise</label>
              <Input
                value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                placeholder="e.g. GST Audits, MCA Filings, Virtual CFO"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">City</label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">State</label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-fyn-slate-border">
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Profile Settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
