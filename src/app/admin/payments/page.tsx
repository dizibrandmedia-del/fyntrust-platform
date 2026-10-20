"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/payments");
        if (res.ok) {
          const json = await res.json();
          setPayments(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Payments Ledger & Gateway Settlements
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            All Razorpay/Cashfree digital transactions, verified HMAC signatures, and settlement references.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading payments ledger..." />
        </div>
      ) : payments.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No payment records found.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Payment Ref</th>
                  <th className="p-4">Order Link</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Gateway & Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-primary">
                      {p.gatewayPaymentId || p.id.slice(0, 12)}
                    </td>
                    <td className="p-4 font-mono text-fyn-slate">{p.order?.orderNumber}</td>
                    <td className="p-4 font-bold text-fyn-slate">
                      {p.customer?.businessName || p.customer?.user?.fullName}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-fyn-slate">{p.gateway}</div>
                      <div className="text-[10px] text-fyn-slate-muted uppercase">{p.paymentMethod || "UPI / Netbanking"}</div>
                    </td>
                    <td className="p-4 font-bold text-[#01574F] font-heading">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-4">
                      <Badge variant={p.status === "COMPLETED" ? "accent" : "warning"} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-fyn-slate-muted">
                      {new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
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
