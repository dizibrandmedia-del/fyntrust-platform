"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { FileCheck, FileText, CheckCircle2, XCircle, Search, ExternalLink } from "lucide-react";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rejectionDocId, setRejectionDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function fetchDocs() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleVerify = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (docId: string) => {
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
        fetchDocs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = documents.filter((d) => {
    return statusFilter === "ALL" || d.status === statusFilter;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Document Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Review applicant PAN, Aadhaar, MOA, electricity bills, and bank statements with instant validation.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Documents</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading verification queue..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No documents found matching the filter.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Document Name & Category</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Order Link</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-fyn-primary" />
                        <div>
                          <div className="font-bold text-fyn-slate">{doc.name}</div>
                          <div className="text-[10px] text-fyn-slate-muted uppercase tracking-wider">{doc.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{doc.customer?.businessName || doc.customer?.user?.fullName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{doc.customer?.user?.mobile}</div>
                    </td>
                    <td className="p-4 font-mono text-fyn-primary font-bold">
                      {doc.order?.orderNumber || "General Vault"}
                    </td>
                    <td className="p-4">
                      <Badge variant={doc.status === "VERIFIED" ? "accent" : doc.status === "REJECTED" ? "danger" : "warning"} size="sm">
                        {doc.status}
                      </Badge>
                      {doc.rejectionReason && (
                        <p className="text-[10px] text-red-600 font-medium mt-0.5">{doc.rejectionReason}</p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-fyn-slate hover:bg-slate-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {doc.status !== "VERIFIED" && (
                          <Button variant="accent" size="sm" onClick={() => handleVerify(doc.id)}>
                            Verify ✓
                          </Button>
                        )}
                        {doc.status !== "REJECTED" && (
                          <Button variant="danger" size="sm" onClick={() => setRejectionDocId(doc.id)}>
                            Reject ✕
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionDocId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 bg-white space-y-4">
            <h2 className="text-lg font-bold font-heading text-red-700">Reject Document</h2>
            <p className="text-xs text-fyn-slate-muted">
              Enter reason explaining why this document cannot be accepted (the client will see this in their portal).
            </p>
            <Input
              required
              placeholder="e.g. Incomplete scan, missing director signature on page 3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={() => handleReject(rejectionDocId)}>
                Confirm Rejection
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRejectionDocId(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
