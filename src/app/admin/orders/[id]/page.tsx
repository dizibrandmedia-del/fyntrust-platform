"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  UserCheck,
  FileCheck,
  CreditCard,
  Receipt,
  MessageSquare,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Actions state
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [internalNote, setInternalNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const [rejectionDocId, setRejectionDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [actionMessage, setActionMessage] = useState("");

  async function fetchOrderDetail() {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        setNewStatus(json.data.status);
      }

      // Fetch available experts for assignment
      const expRes = await fetch(`/api/admin/experts?availability=AVAILABLE`);
      if (expRes.ok) {
        const expJson = await expRes.json();
        setExperts(expJson.data || []);
      }
    } catch (err) {
      console.error("Failed to load order detail:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // Handle Manual Expert Assignment
  const handleAssignExpert = async () => {
    if (!selectedExpertId) return;
    try {
      setAssigning(true);
      const res = await fetch(`/api/admin/orders/${id}/assign-expert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertProfileId: selectedExpertId }),
      });
      if (res.ok) {
        setActionMessage("✓ CA Expert successfully assigned to this order.");
        fetchOrderDetail();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to assign expert");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  // Handle Milestone Status Update
  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage("✓ Order status updated successfully.");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Internal Private Note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    try {
      setSubmittingNote(true);
      const res = await fetch(`/api/customer/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          message: internalNote,
          isInternalOnly: true,
        }),
      });
      if (res.ok) {
        setInternalNote("");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Document Verification
  const handleVerifyDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      if (res.ok) {
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Document Rejection
  const handleRejectDoc = async (docId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejecting the document.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectionReason }),
      });
      if (res.ok) {
        setRejectionDocId(null);
        setRejectionReason("");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading order operations details..." />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center text-xs text-fyn-slate-muted">Order not found.</div>;
  }

  return (
    <div className="space-y-8 font-body">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div className="space-y-1">
          <Link href="/admin/orders" className="text-xs font-bold text-fyn-primary flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-fyn-slate">
              Order {order.orderNumber}
            </h1>
            <Badge variant="primary" size="sm">
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {order.invoices?.[0] && (
          <a
            href={`/api/invoices/${order.invoices[0].id}/download`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-fyn-primary bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100"
          >
            <Receipt className="w-4 h-4" /> Download GST Invoice
          </a>
        )}
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Main Order Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Details, Documents, and Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">Filing & Client Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Service & Tier</span>
                <span className="font-bold text-fyn-slate">{order.service?.name}</span>
                <span className="text-[11px] text-fyn-slate-muted block">({order.package?.name || "Standard Compliance"})</span>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Client Enterprise</span>
                <span className="font-bold text-fyn-slate">{order.customer?.businessName || order.customer?.user?.fullName}</span>
                <span className="text-[11px] text-fyn-slate-muted block">{order.customer?.user?.mobile} • {order.customer?.user?.email}</span>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Payment Status</span>
                <Badge variant={order.paymentStatus === "PAID" ? "accent" : "danger"} size="sm">
                  {order.paymentStatus} — {formatCurrency(order.totalAmount)}
                </Badge>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Assigned Chartered Accountant</span>
                {order.assignedExpert ? (
                  <div className="flex items-center gap-1.5 font-bold text-[#01574F]">
                    <UserCheck className="w-4 h-4 text-[#78BB69]" />
                    <span>CA {order.assignedExpert.qualification} ({order.assignedExpert.city})</span>
                  </div>
                ) : (
                  <span className="text-amber-600 font-bold text-[11px]">⚠️ Awaiting CA Assignment</span>
                )}
              </div>
            </div>
          </Card>

          {/* Document Verification Queue */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate flex items-center justify-between">
              <span>Attached Documents ({order.documents?.length || 0})</span>
            </h2>

            {order.documents?.length === 0 ? (
              <p className="text-xs text-fyn-slate-muted">No documents uploaded by client yet.</p>
            ) : (
              <div className="space-y-3">
                {order.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-fyn-slate-border bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-fyn-primary" />
                        <span className="font-bold text-fyn-slate">{doc.name}</span>
                        <Badge variant={doc.status === "VERIFIED" ? "accent" : doc.status === "REJECTED" ? "danger" : "warning"} size="sm">
                          {doc.status}
                        </Badge>
                      </div>
                      {doc.rejectionReason && (
                        <p className="text-[11px] text-red-600 font-medium">Rejection Reason: {doc.rejectionReason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a href={doc.filePath} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-fyn-primary hover:underline">
                        View File ↗
                      </a>
                      {doc.status !== "VERIFIED" && (
                        <Button variant="accent" size="sm" onClick={() => handleVerifyDoc(doc.id)}>
                          Verify ✓
                        </Button>
                      )}
                      {doc.status !== "REJECTED" && (
                        <Button variant="danger" size="sm" onClick={() => setRejectionDocId(doc.id)}>
                          Reject ✕
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejection Modal */}
            {rejectionDocId && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 text-xs">
                <div className="font-bold text-red-800">Specify Rejection Reason (visible to client):</div>
                <Input
                  placeholder="e.g. Please upload a clear color copy of Electricity Bill"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-white text-xs"
                />
                <div className="flex gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleRejectDoc(rejectionDocId)}>
                    Confirm Rejection
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRejectionDocId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Private Internal Notes (Strictly Hidden from Customer) */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold font-heading text-fyn-slate">Private Internal Notes</h2>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
                Staff & CA Eyes Only
              </span>
            </div>

            <form onSubmit={handleAddInternalNote} className="space-y-3">
              <Textarea
                placeholder="Add confidential operations note (e.g. MCA portal ticket #10243 filed, awaiting approval)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <Button variant="outline" size="sm" disabled={submittingNote || !internalNote.trim()}>
                {submittingNote ? "Saving..." : "+ Add Internal Note"}
              </Button>
            </form>

            <div className="space-y-2 pt-2">
              {order.messages
                ?.filter((m: any) => m.isInternalOnly)
                .map((m: any) => (
                  <div key={m.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">{m.sender?.fullName || "Operations Desk"} ({m.sender?.role || "STAFF"})</span>
                      <span className="text-[10px] text-amber-700">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-amber-950">{m.message}</p>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Manual Expert Assignment & Status Update */}
        <div className="space-y-6">
          {/* Manual CA Allocation */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-fyn-primary" /> Manual Expert Assignment
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Select an authorized, active CA / Legal Expert for this service.
            </p>

            <div className="space-y-3 text-xs">
              <select
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              >
                <option value="">-- Choose Available CA Expert --</option>
                {experts.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.user?.fullName} (CA {exp.qualification} • {exp.city})
                  </option>
                ))}
              </select>

              <Button
                variant="accent"
                size="sm"
                className="w-full font-bold"
                onClick={handleAssignExpert}
                disabled={assigning || !selectedExpertId}
              >
                {assigning ? "Assigning..." : "Confirm Expert Assignment"}
              </Button>
            </div>
          </Card>

          {/* Milestone Status Updater */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">Milestone Status</h2>
            <div className="space-y-3 text-xs">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              >
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="DOCUMENTS_PENDING">Documents Pending</option>
                <option value="EXPERT_ASSIGNED">Expert Assigned</option>
                <option value="IN_PROGRESS">Filing In Progress</option>
                <option value="UNDER_REVIEW">Under Review / Portal Submitted</option>
                <option value="COMPLETED">Filing Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : "Update Order Status"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
