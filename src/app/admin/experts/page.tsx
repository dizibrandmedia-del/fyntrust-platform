"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { GraduationCap, UserPlus, UserCheck, Star, Briefcase } from "lucide-react";

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    qualification: "FCA",
    membershipNumber: "",
    city: "Lucknow",
    state: "Uttar Pradesh",
    experienceYears: "5",
  });

  async function fetchExperts() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/experts");
      if (res.ok) {
        const json = await res.json();
        setExperts(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleRegisterExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchExperts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Chartered Accountants & Legal Partners
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Professional partner roster, qualifications, ICAI/Bar Council memberships, and active filing workloads.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + Onboard Expert Partner
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading professional partners..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((exp) => (
            <Card key={exp.id} variant="default" className="p-5 border-fyn-slate-border space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={exp.availabilityStatus === "AVAILABLE" ? "accent" : "warning"} size="sm">
                  {exp.availabilityStatus}
                </Badge>
                <span className="text-[11px] font-bold text-fyn-slate-muted">
                  {exp.experienceYears} Years Exp.
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-fyn-slate text-sm font-heading">{exp.user?.fullName}</h3>
                <p className="text-xs font-semibold text-fyn-primary">
                  CA / {exp.qualification} {exp.membershipNumber ? `• M.No: ${exp.membershipNumber}` : ""}
                </p>
                <p className="text-[11px] text-fyn-slate-muted">{exp.city}, {exp.state}</p>
              </div>

              <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs">
                <span className="text-fyn-slate-muted">Active Filings:</span>
                <strong className="text-fyn-slate">{exp.assignedOrders?.length || 0} Orders</strong>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Onboard Expert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">Onboard Professional Expert</h2>
            <form onSubmit={handleRegisterExpert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Full Name *</label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. CA Saurabh Mishra"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Email Address *</label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. saurabh@fyntrust.in"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Mobile Number *</label>
                <Input
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="e.g. 9118066449"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Qualification *</label>
                  <select
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                  >
                    <option value="FCA">FCA (Chartered Accountant)</option>
                    <option value="ACA">ACA (Chartered Accountant)</option>
                    <option value="FCS">FCS (Company Secretary)</option>
                    <option value="ACS">ACS (Company Secretary)</option>
                    <option value="LL.B">LL.B (Legal Counsel)</option>
                    <option value="CMA">CMA (Cost Accountant)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">ICAI / Bar M.No</label>
                  <Input
                    value={form.membershipNumber}
                    onChange={(e) => setForm({ ...form, membershipNumber: e.target.value })}
                    placeholder="e.g. 543210"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="primary" size="sm" type="submit" className="w-full">
                  Save Expert Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
