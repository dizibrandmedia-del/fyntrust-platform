"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Bell, Mail, MessageSquare } from "lucide-react";

export default function AdminNotificationsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/notifications/templates");
        if (res.ok) {
          const json = await res.json();
          setTemplates(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Notification System & Dispatch Templates
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage Email, WhatsApp, and Dashboard dynamic alert triggers with merge variable support.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading notification templates..." />
        </div>
      ) : templates.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="accent" size="sm">ORDER_CONFIRMATION</Badge>
              <span className="text-[10px] font-bold text-fyn-slate-muted">EMAIL + WHATSAPP</span>
            </div>
            <h3 className="font-bold text-fyn-slate text-sm font-heading">Filing Order Received & Invoice Generated</h3>
            <p className="text-xs text-fyn-slate-muted">
              Triggered immediately upon successful online payment or order creation.
            </p>
            <div className="text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg text-fyn-slate-muted border border-slate-200">
              Variables: {"{{customerName}}"}, {"{{orderNumber}}"}, {"{{serviceName}}"}, {"{{amount}}"}
            </div>
          </Card>

          <Card variant="default" className="p-5 border-fyn-slate-border space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="gold" size="sm">EXPERT_ASSIGNED</Badge>
              <span className="text-[10px] font-bold text-fyn-slate-muted">DASHBOARD + EMAIL</span>
            </div>
            <h3 className="font-bold text-fyn-slate text-sm font-heading">CA Expert Assigned to Filing</h3>
            <p className="text-xs text-fyn-slate-muted">
              Triggered when Super Admin manually assigns a Chartered Accountant.
            </p>
            <div className="text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg text-fyn-slate-muted border border-slate-200">
              Variables: {"{{customerName}}"}, {"{{expertName}}"}, {"{{orderNumber}}"}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <Card key={tpl.id} variant="default" className="p-5 border-fyn-slate-border space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="accent" size="sm">{tpl.eventType}</Badge>
                <span className="text-[10px] font-bold text-fyn-slate-muted">{tpl.channel}</span>
              </div>
              <h3 className="font-bold text-fyn-slate text-sm font-heading">{tpl.name}</h3>
              <p className="text-xs text-fyn-slate-muted">{tpl.bodyTemplate}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
