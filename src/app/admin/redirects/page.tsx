"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  ArrowRight,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newRedirect, setNewRedirect] = useState({
    sourceUrl: "",
    destinationUrl: "",
    statusCode: 301,
  });

  async function fetchRedirects() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/redirects");
      if (res.ok) {
        const json = await res.json();
        setRedirects(json.data?.redirects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRedirect),
      });

      const json = await res.json();
      if (res.ok) {
        setCreating(false);
        setNewRedirect({ sourceUrl: "", destinationUrl: "", statusCode: 301 });
        fetchRedirects();
      } else {
        setErrorMsg(json.error || "Failed to create redirect");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create redirect");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRedirects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            URL Redirects & 301 Engine
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage permanent (301) and temporary (302) URL redirects to prevent 404 broken links and preserve search equity.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-1" /> Create Redirect
        </Button>
      </div>

      {creating && (
        <Card variant="default" className="p-6 border-fyn-primary bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Create New URL Redirect
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Old Source URL / Path *</label>
                <Input
                  required
                  placeholder="/old-ca-page or /services/tax"
                  value={newRedirect.sourceUrl}
                  onChange={(e) => setNewRedirect({ ...newRedirect, sourceUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">New Destination URL *</label>
                <Input
                  required
                  placeholder="/services/income-tax-return-filing"
                  value={newRedirect.destinationUrl}
                  onChange={(e) => setNewRedirect({ ...newRedirect, destinationUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">HTTP Status Code</label>
                <select
                  value={newRedirect.statusCode}
                  onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value={301}>301 (Permanent Redirect)</option>
                  <option value={302}>302 (Temporary Redirect)</option>
                  <option value={307}>307 (Temporary Redirect)</option>
                  <option value={308}>308 (Permanent Redirect)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" size="md" type="submit" disabled={actionLoading}>
                <Save className="w-4 h-4 mr-1" /> Save & Activate Redirect
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Redirects Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading URL redirect rules..." />
        </div>
      ) : redirects.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No URL redirect rules configured. Click "Create Redirect" above to add one.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Old Source URL</th>
                  <th className="p-4">Target Destination URL</th>
                  <th className="p-4">Status Code</th>
                  <th className="p-4">Total Hits</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-slate">
                      {r.sourceUrl}
                    </td>
                    <td className="p-4 font-mono text-fyn-primary flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      {r.destinationUrl}
                    </td>
                    <td className="p-4">
                      <Badge variant={r.statusCode === 301 ? "accent" : "warning"} size="sm">
                        {r.statusCode}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-fyn-slate">
                      {r.hitsCount} hits
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r.id)}
                        disabled={actionLoading}
                        className="text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
