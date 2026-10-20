"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  FileCheck,
  CreditCard,
  Download,
  UploadCloud,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Trash2,
} from "lucide-react";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message state
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Payment state
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/customer/orders/${orderId}`);
        if (!res.ok) {
          throw new Error("Unable to load order details. Please verify your access.");
        }
        const json = await res.json();
        setOrder(json.data);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMsg(true);
    try {
      const res = await fetch("/api/customer/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setOrder((prev: any) => ({
          ...prev,
          messages: [...(prev.messages || []), json.data],
        }));
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Handle Pay Now
  const handlePayNow = async () => {
    setPaymentLoading(true);
    try {
      const initRes = await fetch("/api/orders/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error?.message || "Payment initiation failed");

      // Verify payment (Mock verification)
      const verifyRes = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          gatewayOrderId: initData.data.gatewayOrderId,
          gatewayPaymentId: `pay_${Date.now()}_mock`,
          gatewaySignature: "sig_fyntrust_verified_mock",
        }),
      });

      if (verifyRes.ok) {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Retrieving service filing record..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <h3 className="text-lg font-bold">Order Not Accessible</h3>
        <p className="text-xs">{error || "Could not retrieve order details."}</p>
        <Link href="/customer/orders">
          <Button variant="outline" size="sm">
            ← Return to Orders List
          </Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID";
  const invoice = order.invoices?.[0];

  return (
    <div className="space-y-8 font-body">
      {/* Back Button */}
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-fyn-slate-muted hover:text-fyn-primary"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
      </Link>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-fyn-slate-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold font-heading text-fyn-primary">
              {order.orderNumber}
            </span>
            <Badge variant={isPaid ? "success" : "danger"}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            {order.service?.name}
          </h1>
          <p className="text-xs text-fyn-slate-muted">
            Order Date: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • Category: {order.service?.department || "Tax & Compliance"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {!isPaid ? (
            <Button
              variant="accent"
              size="md"
              className="font-bold shadow-md"
              isLoading={paymentLoading}
              onClick={handlePayNow}
            >
              Pay {formatCurrency(order.totalAmount)} Now
            </Button>
          ) : invoice ? (
            <a
              href={`/api/invoices/${invoice.invoiceNumber}/download`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="md" leftIcon={<Download className="w-4 h-4 text-fyn-primary" />}>
                Download Tax Invoice
              </Button>
            </a>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          5-STAGE MILESTONE TRACKER
          ============================================================ */}
      <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
        <h2 className="text-lg font-bold font-heading text-fyn-slate">
          Statutory Filing Milestones
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {order.steps.map((step: any, idx: number) => {
            const isCompleted = step.status === "COMPLETED";
            const isCurrent = step.status === "IN_PROGRESS" || (idx === 0 && !isPaid);

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all space-y-2 ${
                  isCompleted
                    ? "bg-[#E6F7ED] border-[#78BB69] text-[#0E7C3A]"
                    : isCurrent
                    ? "bg-[#E6F0EF] border-[#01574F] text-[#01574F] shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold font-heading">0{step.stepNumber}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C3A]" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="text-xs font-bold font-heading text-fyn-slate">{step.title}</div>
                <div className="text-[10px] uppercase font-semibold">
                  {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ============================================================
          DOCUMENTS VAULT & MESSAGES SPLIT GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attached Documents Vault */}
        <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-fyn-slate">
                Encrypted Document Vault
              </h2>
              <p className="text-xs text-fyn-slate-muted">
                {order.documents?.length || 0} files attached for CA verification
              </p>
            </div>
            <Link href="/customer/documents">
              <Button variant="ghost" size="sm">
                + Upload Files
              </Button>
            </Link>
          </div>

          {order.documents?.length === 0 ? (
            <div className="py-8 text-center text-xs text-fyn-slate-muted space-y-2">
              <FileCheck className="w-8 h-8 mx-auto text-fyn-slate-muted" />
              <p>No documents uploaded yet for this filing.</p>
              <Link href="/customer/documents">
                <Button variant="outline" size="sm">
                  Upload Required Documents
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {order.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-slate-50 border border-fyn-slate-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-fyn-slate font-heading">{doc.name}</div>
                    <div className="text-[10px] text-fyn-slate-muted">
                      Uploaded on {new Date(doc.createdAt).toLocaleDateString("en-IN")} • {doc.category}
                    </div>
                  </div>
                  <Badge variant={doc.status === "VERIFIED" ? "success" : "neutral"} size="sm">
                    {doc.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* In-App CA Communication Thread */}
        <Card variant="default" className="p-6 sm:p-8 border-fyn-slate-border space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-fyn-slate-border pb-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">
                CA Team Communication
              </h2>
              <p className="text-xs text-fyn-slate-muted">
                Direct query thread with your assigned Chartered Accountant
              </p>
            </div>

            {/* Messages Scroll Area */}
            <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
              {order.messages?.length === 0 ? (
                <div className="py-8 text-center text-xs text-fyn-slate-muted space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-fyn-slate-muted" />
                  <p>No queries or updates yet.</p>
                  <p className="text-[11px]">Type a query below to message your assigned CA.</p>
                </div>
              ) : (
                order.messages.map((msg: any) => {
                  const isClient = msg.senderRole === "CUSTOMER";
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                        isClient
                          ? "ml-auto bg-[#01574F] text-white rounded-br-none"
                          : "mr-auto bg-slate-100 text-fyn-slate border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75">
                        {isClient ? "You" : "Fyntrust CA Desk"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* New Message Input Form */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-fyn-slate-border flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about your filing..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-fyn-slate-border text-xs focus:outline-none focus:border-fyn-primary"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={sendingMsg}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
