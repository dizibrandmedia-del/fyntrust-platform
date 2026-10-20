"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { FileSpreadsheet, Plus } from "lucide-react";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientMobile: "",
    businessName: "",
    serviceName: "Virtual CFO Retainer",
    scopeDetails: "Monthly MIS, statutory compliance, board reporting, and tax audit representation.",
    basePrice: "25000",
    discount: "0",
    validDays: "15",
  });

  async function fetchQuotations() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/quotations");
      if (res.ok) {
        const json = await res.json();
        setQuotations(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchQuotations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Sales Quotations & Custom Quotes
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Issue formal bespoke quotations with GST breakdowns for enterprise advisory, Virtual CFO, and M&A audits.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + Generate Quotation
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading quotations..." />
        </div>
      ) : quotations.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No quotations generated yet.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Quotation #</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Advisory Scope</th>
                  <th className="p-4">Total Amount (Incl. 18% GST)</th>
                  <th className="p-4">Valid Until</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-primary">{q.quoteNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{q.clientName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{q.clientMobile}</div>
                    </td>
                    <td className="p-4 font-semibold text-fyn-slate">{q.serviceName}</td>
                    <td className="p-4 font-bold text-[#01574F] font-heading">{formatCurrency(q.totalAmount)}</td>
                    <td className="p-4 text-fyn-slate-muted">{new Date(q.validUntil).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge variant="accent" size="sm">
                        {q.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-lg w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">Generate Advisory Quotation</h2>
            <form onSubmit={handleCreateQuotation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Client Name *</label>
                  <Input
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="e.g. Vikas Gupta"
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Mobile Number *</label>
                  <Input
                    required
                    value={form.clientMobile}
                    onChange={(e) => setForm({ ...form, clientMobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Service / Scope Title *</label>
                <Input
                  required
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Base Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Discount (₹)</label>
                  <Input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Scope & Deliverables</label>
                <Textarea
                  rows={2}
                  value={form.scopeDetails}
                  onChange={(e) => setForm({ ...form, scopeDetails: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="primary" size="sm" type="submit" className="w-full">
                  Create Quotation
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
