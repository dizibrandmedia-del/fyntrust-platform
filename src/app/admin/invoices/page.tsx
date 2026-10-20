"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Download } from "lucide-react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/invoices");
        if (res.ok) {
          const json = await res.json();
          setInvoices(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            GST Tax Invoices
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            All statutory tax invoices with HSN/SAC codes, CGST/SGST/IGST breakdowns, and printable PDF documents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading tax invoices..." />
        </div>
      ) : invoices.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No invoices generated yet.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Invoice Number</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Order Link</th>
                  <th className="p-4">Taxable Value</th>
                  <th className="p-4">GST (18%)</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-right">Print / Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-primary">{inv.invoiceNumber}</td>
                    <td className="p-4 font-bold text-fyn-slate">
                      {inv.customer?.businessName || inv.customer?.user?.fullName}
                    </td>
                    <td className="p-4 font-mono text-fyn-slate">{inv.order?.orderNumber}</td>
                    <td className="p-4 text-fyn-slate-muted">{formatCurrency(inv.subtotal)}</td>
                    <td className="p-4 text-fyn-slate-muted">{formatCurrency(inv.cgst + inv.sgst + inv.igst)}</td>
                    <td className="p-4 font-bold text-[#01574F] font-heading">{formatCurrency(inv.totalAmount)}</td>
                    <td className="p-4 text-right">
                      <a
                        href={`/api/invoices/${inv.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-fyn-primary hover:bg-slate-100"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
