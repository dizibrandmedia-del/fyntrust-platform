"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { Target, Phone, Mail, MapPin, UserPlus, UserCheck, MessageSquare, Plus, Check } from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // New Lead Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    businessName: "",
    source: "WEBSITE",
    notes: "",
  });

  // Manage Selected Lead state
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadNote, setLeadNote] = useState("");
  const [converting, setConverting] = useState(false);

  async function fetchLeads() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const json = await res.json();
        setLeads(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      if (res.ok) {
        setShowNewModal(false);
        setNewLeadForm({ name: "", mobile: "", email: "", city: "", businessName: "", source: "WEBSITE", notes: "" });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStage = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!leadNote.trim()) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: leadNote }),
      });
      if (res.ok) {
        setLeadNote("");
        fetchLeads();
        // Update selected lead notes
        const updated = await res.json();
        setSelectedLead(updated.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToCustomer = async (leadId: string) => {
    try {
      setConverting(true);
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        alert("✓ Lead converted to verified Customer Account successfully!");
        fetchLeads();
        setSelectedLead(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const filtered = leads.filter((l) => {
    const s = search.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(s) ||
      l.mobile.includes(s) ||
      (l.email && l.email.toLowerCase().includes(s)) ||
      (l.businessName && l.businessName.toLowerCase().includes(s));

    const matchesStage = stageFilter === "ALL" || l.status === stageFilter;
    const matchesSource = sourceFilter === "ALL" || l.source === sourceFilter;

    return matchesSearch && matchesStage && matchesSource;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Lead CRM Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track inquiries from Website, WhatsApp, Google Ads, and convert qualified prospects to active clients.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowNewModal(true)}>
          + Create CRM Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by Name, Mobile, Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All CRM Stages</option>
          <option value="NEW_LEAD">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="QUOTATION">Quotation Sent</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Lead Sources</option>
          <option value="WEBSITE">Website Form</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="GOOGLE_ADS">Google Ads</option>
          <option value="META_ADS">Meta Ads</option>
          <option value="DIRECT">Direct Call</option>
          <option value="REFERRAL">Referral</option>
        </select>
      </div>

      {/* Leads Table & Split View */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading CRM pipeline..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No CRM leads match the selected filter criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Lead Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer transition-colors ${
                        selectedLead?.id === lead.id ? "bg-emerald-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-fyn-slate font-heading">{lead.name}</div>
                        <div className="text-[10px] text-fyn-slate-muted">{lead.businessName || "Individual Prospect"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-fyn-slate">{lead.mobile}</div>
                        <div className="text-[10px] text-fyn-slate-muted">{lead.city || "Online"}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="neutral" size="sm">
                          {lead.source}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={lead.status === "CONVERTED" ? "accent" : lead.status === "NEW_LEAD" ? "primary" : "warning"} size="sm">
                          {lead.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          Follow Up →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Lead Follow-up Drawer */}
          <div>
            {selectedLead ? (
              <Card variant="default" className="p-5 border-fyn-slate-border space-y-4 text-xs sticky top-24">
                <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
                  <div>
                    <h3 className="font-bold font-heading text-fyn-slate text-sm">{selectedLead.name}</h3>
                    <p className="text-[10px] text-fyn-slate-muted">{selectedLead.mobile} • {selectedLead.city || "Lucknow"}</p>
                  </div>
                  <Badge variant={selectedLead.status === "CONVERTED" ? "accent" : "primary"} size="sm">
                    {selectedLead.status}
                  </Badge>
                </div>

                {/* Stage Progression Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-fyn-slate block text-[11px]">Advance CRM Stage</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateStage(selectedLead.id, e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-fyn-slate-border text-xs bg-white"
                  >
                    <option value="NEW_LEAD">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="QUOTATION">Quotation Sent</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                {/* Convert to Customer CTA */}
                {selectedLead.status !== "CONVERTED" && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="w-full font-bold flex items-center justify-center gap-1.5"
                    onClick={() => handleConvertToCustomer(selectedLead.id)}
                    disabled={converting}
                  >
                    <UserCheck className="w-4 h-4" />
                    {converting ? "Converting..." : "Convert to Client Account"}
                  </Button>
                )}

                {/* Notes Thread */}
                <div className="space-y-2 pt-2 border-t border-fyn-slate-border">
                  <span className="font-bold text-fyn-slate block text-[11px]">Follow-up History</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add follow-up notes..."
                      value={leadNote}
                      onChange={(e) => setLeadNote(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button variant="outline" size="sm" onClick={() => handleAddNote(selectedLead.id)}>
                      Save
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pt-2">
                    {selectedLead.notes &&
                      JSON.parse(selectedLead.notes).map((n: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                          <div className="flex justify-between text-[10px] text-fyn-slate-muted mb-0.5">
                            <strong>{n.author || "Sales Desk"}</strong>
                            <span>{new Date(n.addedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-fyn-slate">{n.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="default" className="p-8 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
                Select a lead from the list to view history, log notes, and convert to customer.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">Create New CRM Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Prospect Name *</label>
                <Input
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Mobile Number *</label>
                <Input
                  required
                  value={newLeadForm.mobile}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Email</label>
                <Input
                  type="email"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">City</label>
                <Input
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  placeholder="e.g. Lucknow, Varanasi, Delhi"
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Lead Source</label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="WEBSITE">Website Form</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="GOOGLE_ADS">Google Ads</option>
                  <option value="DIRECT">Direct Phone Call</option>
                  <option value="REFERRAL">Client Referral</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="primary" size="sm" type="submit" className="w-full">
                  Create Lead
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewModal(false)} className="w-full">
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
