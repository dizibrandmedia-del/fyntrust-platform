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
import {
  Briefcase,
  FileCheck,
  CheckSquare,
  Award,
  MessageSquare,
  Lock,
  ArrowLeft,
  AlertCircle,
  FileText,
  Plus,
  Send,
  ExternalLink,
} from "lucide-react";

export default function ExpertOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Status Update state
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Document Request state
  const [showReqDocModal, setShowReqDocModal] = useState(false);
  const [reqDocName, setReqDocName] = useState("");
  const [reqDocReason, setReqDocReason] = useState("");

  // Document Rejection state
  const [rejectionDocId, setRejectionDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // New Task state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("NORMAL");

  // Deliverable Upload state
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState({
    name: "Final Statutory Filing Certificate",
    deliverableType: "CERTIFICATE",
    fileUrl: "https://fyntrust.in/sample_deliverable.pdf",
    description: "Official government registration certificate / filing acknowledgement.",
  });

  // Messaging state
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [actionMessage, setActionMessage] = useState("");

  async function fetchOrderDetail() {
    try {
      setLoading(true);
      const res = await fetch(`/api/expert/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        setNewStatus(json.data.status);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Handle Work Status Update
  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/expert/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage("✓ Filing work status updated successfully.");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Document Verification
  const handleVerifyDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/expert/documents/${docId}`, {
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
      const res = await fetch(`/api/expert/documents/${docId}`, {
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

  // Handle Request Additional Document
  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expert/documents/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          name: reqDocName,
          reason: reqDocReason,
        }),
      });
      if (res.ok) {
        setShowReqDocModal(false);
        setReqDocName("");
        setReqDocReason("");
        setActionMessage("✓ Additional document requested from client.");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/expert/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          title: newTaskTitle,
          priority: newTaskPriority,
        }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Task Completion Toggle
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
      const res = await fetch(`/api/expert/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Upload Deliverable
  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expert/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ...deliverableForm,
        }),
      });
      if (res.ok) {
        setShowDeliverableModal(false);
        setActionMessage("✓ Deliverable submitted for review.");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      setSendingMessage(true);
      const res = await fetch(`/api/expert/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          message: messageText,
          isInternalOnly: isInternal,
        }),
      });
      if (res.ok) {
        setMessageText("");
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading filing workspace..." />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center text-xs text-fyn-slate-muted">Order not found or restricted.</div>;
  }

  // Parse dynamic requirement answers if present
  let parsedRequirements: Record<string, any> = {};
  try {
    if (order.requirementData) {
      parsedRequirements = JSON.parse(order.requirementData);
    }
  } catch (e) {}

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div className="space-y-1">
          <Link href="/expert/orders" className="text-xs font-bold text-fyn-primary flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Filings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-fyn-slate">
              Filing: {order.orderNumber}
            </h1>
            <Badge variant="primary" size="sm">
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <Button variant="accent" size="sm" onClick={() => setShowDeliverableModal(true)}>
          + Upload Final Deliverable
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Grid: 2 Cols Left, 1 Col Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Client Overview, Requirements, Documents, Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Service Card */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">Client & Statutory Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Service Offering</span>
                <span className="font-bold text-fyn-slate">{order.service?.name}</span>
                <span className="text-[11px] text-fyn-slate-muted block font-mono">SLA: {order.service?.slaDays || 3} Days</span>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Client Enterprise</span>
                <span className="font-bold text-fyn-slate">{order.customer?.businessName}</span>
                <span className="text-[11px] text-fyn-slate-muted block">{order.customer?.city}, {order.customer?.state}</span>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">Primary Contact</span>
                <span className="font-bold text-fyn-slate">{order.customer?.user?.fullName}</span>
                <span className="text-[11px] text-fyn-slate-muted block">{order.customer?.user?.mobile} • {order.customer?.user?.email}</span>
              </div>
              <div>
                <span className="text-fyn-slate-muted block text-[11px]">GSTIN / PAN</span>
                <span className="font-mono font-bold text-fyn-slate">{order.customer?.gstNumber || order.customer?.panNumber || "Not Applicable"}</span>
              </div>
            </div>

            {/* Dynamic Questionnaire Responses */}
            {Object.keys(parsedRequirements).length > 0 && (
              <div className="pt-3 border-t border-fyn-slate-border space-y-2">
                <span className="text-[11px] font-bold uppercase text-fyn-primary tracking-wider block">
                  Applicant Questionnaire Answers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {Object.entries(parsedRequirements).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-fyn-slate-muted capitalize text-[10px] block">{k.replace(/_/g, " ")}:</span>
                      <strong className="text-fyn-slate">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Document Verification & Checklist */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-heading text-fyn-slate">
                Document Checklist & Verification ({order.documents?.length || 0})
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowReqDocModal(true)}>
                + Request Additional Doc
              </Button>
            </div>

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
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-fyn-primary hover:underline">
                          View File ↗
                        </a>
                      )}
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

            {/* Rejection Drawer */}
            {rejectionDocId && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 text-xs">
                <div className="font-bold text-red-800">Specify Rejection Reason (visible to client):</div>
                <Input
                  placeholder="e.g. Electricity bill is older than 2 months, please upload latest bill"
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

          {/* Deliverables Section */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">
              Uploaded Deliverables & Certificates ({order.deliverables?.length || 0})
            </h2>

            {order.deliverables?.length === 0 ? (
              <p className="text-xs text-fyn-slate-muted">No deliverables uploaded yet. Upload the certificate/acknowledgement once filing is complete.</p>
            ) : (
              <div className="space-y-3">
                {order.deliverables.map((del: any) => (
                  <div
                    key={del.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#01574F]" />
                        <span className="font-bold text-fyn-slate">{del.name}</span>
                        <Badge variant="accent" size="sm">
                          {del.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-fyn-slate-muted">{del.description}</p>
                    </div>

                    <a href={del.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-fyn-primary hover:underline">
                      Download File ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Work Status & Messaging */}
        <div className="space-y-6">
          {/* Work Status Transition Card */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">Update Filing Status</h2>
            <div className="space-y-3 text-xs">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              >
                <option value="WORK_IN_PROGRESS">Work In Progress</option>
                <option value="DOCUMENTS_PENDING">Documents Pending</option>
                <option value="SUBMITTED_FILED">Application Filed on Portal</option>
                <option value="GOVERNMENT_PROCESSING">Government Processing</option>
                <option value="UNDER_REVIEW">Ready for Review</option>
                <option value="COMPLETED">Filing Completed</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </Card>

          {/* Filing Checklist Tasks */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate">Filing Checklist Tasks</h2>

            <form onSubmit={handleAddTask} className="space-y-2">
              <Input
                placeholder="e.g. Verify DIN eligibility on MCA..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="text-xs"
              />
              <div className="flex gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <Button variant="outline" size="sm" type="submit">
                  + Add Task
                </Button>
              </div>
            </form>

            <div className="space-y-2 pt-2">
              {order.tasks?.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id, t.status)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    t.status === "COMPLETED" ? "bg-emerald-50/50 border-emerald-200 line-through text-fyn-slate-muted" : "bg-white border-fyn-slate-border"
                  }`}
                >
                  <span className="font-medium">{t.title}</span>
                  <Badge variant={t.status === "COMPLETED" ? "accent" : "warning"} size="sm">
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Communication Thread (Public / Internal) */}
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-4">
            <h2 className="text-sm font-bold font-heading text-fyn-slate flex items-center justify-between">
              <span>Communication</span>
              <label className="text-[10px] flex items-center gap-1 font-bold text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                Internal Note Only
              </label>
            </h2>

            <form onSubmit={handleSendMessage} className="space-y-2">
              <Textarea
                placeholder={isInternal ? "Write confidential note for Admin desk..." : "Message client directly..."}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <Button variant={isInternal ? "outline" : "primary"} size="sm" className="w-full" disabled={sendingMessage}>
                <Send className="w-3.5 h-3.5 mr-1" />
                {isInternal ? "Post Internal Note" : "Send Client Message"}
              </Button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
              {order.messages?.map((m: any) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl text-xs space-y-1 ${
                    m.isInternalOnly ? "bg-amber-50 border border-amber-200 text-amber-950" : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{m.sender?.fullName} ({m.sender?.role})</span>
                    <span className="font-normal text-fyn-slate-muted">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p>{m.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Request Document Modal */}
      {showReqDocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">Request Missing Document</h2>
            <form onSubmit={handleRequestDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Document Name *</label>
                <Input
                  required
                  placeholder="e.g. Director Electricity Bill (Within 2 Months)"
                  value={reqDocName}
                  onChange={(e) => setReqDocName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Reason / Requirement *</label>
                <Textarea
                  required
                  placeholder="Explain why this document is required for filing..."
                  value={reqDocReason}
                  onChange={(e) => setReqDocReason(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="primary" size="sm" type="submit" className="w-full">
                  Send Request to Client
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowReqDocModal(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Upload Deliverable Modal */}
      {showDeliverableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-fyn-slate">Upload Work Deliverable</h2>
            <form onSubmit={handleUploadDeliverable} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Deliverable Name *</label>
                <Input
                  required
                  value={deliverableForm.name}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Deliverable Type *</label>
                <select
                  value={deliverableForm.deliverableType}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, deliverableType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="CERTIFICATE">Government Registration Certificate</option>
                  <option value="ACKNOWLEDGEMENT">Statutory Filing Acknowledgement</option>
                  <option value="ROC_FILING">MCA / ROC Filing Document</option>
                  <option value="REPORT">Audit & Financial Statement Report</option>
                  <option value="MIS">Virtual CFO Monthly MIS</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">File URL / S3 Key *</label>
                <Input
                  required
                  value={deliverableForm.fileUrl}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Description</label>
                <Textarea
                  value={deliverableForm.description}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="accent" size="sm" type="submit" className="w-full font-bold">
                  Submit Deliverable
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeliverableModal(false)} className="w-full">
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
