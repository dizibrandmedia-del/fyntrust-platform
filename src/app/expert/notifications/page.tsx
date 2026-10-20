"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Bell, CheckCheck } from "lucide-react";

export default function ExpertNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/expert/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/expert/notifications", { method: "PATCH" });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Activity & Filing Notifications
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Real-time updates regarding new order assignments, uploaded client documents, and review requests.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          You're all caught up! No notifications.
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              variant="default"
              className={`p-4 border transition-all text-xs space-y-1 ${
                n.isRead ? "bg-white border-fyn-slate-border" : "bg-emerald-50/50 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-fyn-slate font-heading text-sm">{n.title}</span>
                <span className="text-[10px] text-fyn-slate-muted font-mono">
                  {new Date(n.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="text-fyn-slate-muted">{n.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
