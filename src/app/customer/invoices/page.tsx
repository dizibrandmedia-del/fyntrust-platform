"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Download, FileText, CheckCircle2 } from "lucide-react";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/invoices");
        if (res.ok) {
          const json = await res.json();
          setInvoices(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Tax Invoices & Receipts
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Download GST-compliant tax invoices for corporate accounting, tax deductions, and audit records.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading corporate tax invoices..." />
        </div>
      ) : invoices.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <Receipt className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No tax invoices generated yet</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            Invoices are automatically generated upon successful payment verification.
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Invoice Number</th>
                  <th className="p-4">Service Description</th>
                  <th className="p-4">Invoice Date</th>
                  <th className="p-4">Base Fee</th>
                  <th className="p-4">GST (18%)</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">PDF Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fyn-slate-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-fyn-primary">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{inv.order?.service?.name}</div>
                      <div className="text-[10px] text-fyn-slate-muted font-mono">{inv.order?.orderNumber}</div>
                    </td>
                    <td className="p-4 text-fyn-slate-muted">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4 font-semibold text-fyn-slate">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="p-4 font-semibold text-fyn-slate">
                      {formatCurrency(inv.taxAmount)}
                    </td>
                    <td className="p-4 font-bold text-[#01574F] font-heading text-sm">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`/api/invoices/${inv.invoiceNumber}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5 text-fyn-primary" />}>
                          Print A4 Tax Invoice
                        </Button>
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
