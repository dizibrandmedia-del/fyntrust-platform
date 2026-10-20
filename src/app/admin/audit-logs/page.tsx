"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { ShieldAlert, Lock } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/audit-logs");
        if (res.ok) {
          const json = await res.json();
          setLogs(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    return actionFilter === "ALL" || l.action === actionFilter;
  });

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Security & System Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Immutable system audit trail tracking all expert assignments, document verifications, status updates, and configuration changes.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="ASSIGN">ASSIGN</option>
          <option value="VERIFY">VERIFY</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading security audit records..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No audit logs found.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Operator / Staff</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono">
                    <td className="p-4 text-fyn-slate-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <Badge variant="primary" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-fyn-slate">{log.entity}</td>
                    <td className="p-4 text-fyn-slate">{log.user?.fullName || "System Core"}</td>
                    <td className="p-4 text-fyn-slate-muted">{log.userRole || "CORE"}</td>
                    <td className="p-4 text-fyn-slate-muted max-w-xs truncate font-sans text-xs">
                      {log.newValue ? log.newValue.slice(0, 80) : "—"}
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
