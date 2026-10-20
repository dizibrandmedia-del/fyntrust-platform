"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/payments");
        if (res.ok) {
          const json = await res.json();
          setPayments(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load payments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Payment Transactions & History
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          All verified digital payment records, gateway transaction IDs, and settlement statuses.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading payment ledger..." />
        </div>
      ) : payments.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <CreditCard className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No payment transactions found</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            Your transaction history will appear here once you initiate or complete a service order.
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Service & Order</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fyn-slate-border">
                {payments.map((pay) => {
                  const isSuccess = pay.status === "COMPLETED";
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-fyn-slate">
                        {pay.gatewayPaymentId || pay.gatewayOrderId || "PENDING_INIT"}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-fyn-slate">{pay.order?.service?.name}</div>
                        <div className="text-[10px] text-fyn-slate-muted font-mono">{pay.order?.orderNumber}</div>
                      </td>
                      <td className="p-4 text-fyn-slate-muted">
                        {new Date(pay.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4 font-bold text-[#01574F] font-heading text-sm">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="p-4">
                        <Badge variant={isSuccess ? "success" : "danger"} size="sm">
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/customer/orders/${pay.orderId}`}>
                          <Button variant="ghost" size="sm">
                            View Order →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
