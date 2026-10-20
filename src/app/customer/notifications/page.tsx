"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Bell, CheckCheck, Clock, ArrowRight } from "lucide-react";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/customer/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Activity & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Real-time status alerts for milestone completions, document verification, payments, and compliance.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-fyn-primary" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading notification alerts..." />
        </div>
      ) : notifications.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <Bell className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">You are all caught up</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            No new activity or alerts. Updates on your active filings will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              variant="default"
              className={`p-5 border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? "border-fyn-slate-border bg-white"
                  : "border-[#01574F]/30 bg-[#E6F0EF]/40 shadow-sm"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-heading text-fyn-slate">
                    {notif.title}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#78BB69]" />
                  )}
                </div>
                <p className="text-xs text-fyn-slate-muted leading-relaxed">{notif.message}</p>
                <div className="text-[10px] text-fyn-slate-muted pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              <Badge variant={notif.channel === "WHATSAPP" ? "success" : "neutral"} size="sm">
                {notif.channel || "IN_APP"}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
