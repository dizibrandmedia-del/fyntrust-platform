"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Loader } from "@/components/ui/Loader";
import { Alert } from "@/components/ui/Alert";
import {
  FileCheck,
  UploadCloud,
  Trash2,
  Lock,
  Download,
  AlertCircle,
  FileText,
  ShieldCheck,
  Filter,
} from "lucide-react";

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fy, setFy] = useState("2026-27");
  const [category, setCategory] = useState("ALL");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("GENERAL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fy, category]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fy) params.append("financialYear", fy);
      if (category !== "ALL") params.append("category", category);

      const res = await fetch(`/api/customer/documents?${params.toString()}`);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docName.trim()) {
      setUploadError("Please provide a document title and select a file");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentName", docName.trim());
      formData.append("category", uploadCategory);

      const res = await fetch("/api/orders/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload file");
      }

      setShowUploadModal(false);
      setDocName("");
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this document from your vault?")) return;

    try {
      const res = await fetch(`/api/orders/document/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
              Encrypted Document Vault
            </h1>
            <Lock className="w-5 h-5 text-[#78BB69]" />
          </div>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Bank-grade encrypted storage for statutory certificates, PAN, GST, and audit records.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)} leftIcon={<UploadCloud className="w-4 h-4" />}>
          Upload New Document
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Card variant="executive" className="p-6 sm:p-8 space-y-4 border-fyn-primary shadow-xl">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
            <h3 className="text-base font-bold font-heading text-fyn-slate">Upload Document to Vault</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>✕</Button>
          </div>

          {uploadError && <Alert variant="error">{uploadError}</Alert>}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-fyn-slate block mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Registered Rent Agreement"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-fyn-slate-border text-xs focus:outline-none focus:border-fyn-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-fyn-slate block mb-1">Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-fyn-slate-border text-xs focus:outline-none focus:border-fyn-primary bg-white"
                >
                  <option value="GENERAL">General Business Proof</option>
                  <option value="GST">GST Records & Returns</option>
                  <option value="ITR">Income Tax Filings & TDS</option>
                  <option value="INCORPORATION">Incorporation & ROC</option>
                  <option value="BANKING">Bank Accounts & Statements</option>
                  <option value="CFO">MIS & Financial Statements</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-fyn-slate block mb-1">Select File (PDF, JPG, PNG, DOCX) *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-fyn-slate-muted"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-fyn-slate-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={uploading}>
                Confirm & Encrypt Upload
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "All Categories" },
            { id: "GST", label: "GST" },
            { id: "ITR", label: "ITR & Tax" },
            { id: "INCORPORATION", label: "Incorporation" },
            { id: "BANKING", label: "Banking" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === tab.id
                  ? "bg-[#01574F] text-white shadow-sm"
                  : "bg-white text-fyn-slate-muted border border-fyn-slate-border hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fyn-slate-muted">Financial Year:</span>
          <select
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-fyn-slate-border text-xs bg-white font-bold text-fyn-slate"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Decrypting document vault index..." />
        </div>
      ) : documents.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <FileCheck className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No documents in this category</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            Upload your company documents to keep them safely archived and accessible for upcoming statutory filings.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
            Upload Document Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              variant="default"
              className="p-5 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-fyn-primary uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <Badge variant={doc.status === "VERIFIED" ? "success" : "neutral"} size="sm">
                    {doc.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold font-heading text-fyn-slate truncate">
                  {doc.name}
                </h4>

                <div className="text-[11px] text-fyn-slate-muted space-y-0.5">
                  <div>Uploaded: {new Date(doc.createdAt).toLocaleDateString("en-IN")}</div>
                  <div>Financial Year: {doc.financialYear}</div>
                  {doc.order && <div>Linked Order: {doc.order.orderNumber}</div>}
                </div>
              </div>

              <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between">
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
