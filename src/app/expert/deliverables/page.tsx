"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Award, FileText, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

export default function ExpertDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDeliverables() {
    try {
      setLoading(true);
      const res = await fetch("/api/expert/deliverables");
      if (res.ok) {
        const json = await res.json();
        setDeliverables(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeliverables();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Work Deliverables & Completion Certificates
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track submitted government certificates, ITR filing acknowledgements, MCA approval letters, and Virtual CFO reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading deliverables..." />
        </div>
      ) : deliverables.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No deliverables submitted yet. Upload completion certificates directly from the assigned order workspace.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Deliverable Title & Type</th>
                  <th className="p-4">Order Link</th>
                  <th className="p-4">Client Enterprise</th>
                  <th className="p-4">Submission Status</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliverables.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#01574F]" />
                        <div>
                          <div className="font-bold text-fyn-slate font-heading">{del.name}</div>
                          <div className="text-[10px] text-fyn-slate-muted uppercase tracking-wider">{del.deliverableType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-fyn-primary">
                      {del.order?.orderNumber}
                      <span className="block text-[10px] text-fyn-slate-muted font-sans font-normal">{del.order?.service?.name}</span>
                    </td>
                    <td className="p-4 font-bold text-fyn-slate">
                      {del.order?.customer?.businessName}
                    </td>
                    <td className="p-4">
                      <Badge variant={del.status === "DELIVERED" ? "accent" : del.status === "REVISION_REQUIRED" ? "danger" : "primary"} size="sm">
                        {del.status.replace(/_/g, " ")}
                      </Badge>
                      {del.revisionFeedback && (
                        <p className="text-[10px] text-red-600 mt-0.5">{del.revisionFeedback}</p>
                      )}
                    </td>
                    <td className="p-4 text-fyn-slate-muted">
                      {new Date(del.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={del.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-fyn-slate hover:bg-slate-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link href={`/expert/orders/${del.orderId}`}>
                          <Button variant="outline" size="sm">
                            Manage →
                          </Button>
                        </Link>
                      </div>
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
