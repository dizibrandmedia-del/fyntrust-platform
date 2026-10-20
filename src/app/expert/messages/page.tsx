"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { MessageSquare, Lock, ArrowRight } from "lucide-react";

export default function ExpertMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const res = await fetch("/api/expert/messages");
        if (res.ok) {
          const json = await res.json();
          setMessages(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Client & Operations Messages
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Direct communication logs for all assigned filings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading messages..." />
        </div>
      ) : messages.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No conversations yet. Open an assigned order to message the client directly.
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card
              key={m.id}
              variant="default"
              className={`p-4 border text-xs space-y-1.5 ${
                m.isInternalOnly ? "bg-amber-50/70 border-amber-200" : "bg-white border-fyn-slate-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {m.isInternalOnly && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="font-bold text-fyn-slate font-heading">{m.sender?.fullName}</span>
                  <Badge variant={m.isInternalOnly ? "warning" : "primary"} size="sm">
                    {m.sender?.role}
                  </Badge>
                  <span className="text-fyn-slate-muted font-mono font-bold">
                    Order: {m.order?.orderNumber}
                  </span>
                </div>
                <span className="text-[10px] text-fyn-slate-muted">
                  {new Date(m.createdAt).toLocaleString("en-IN")}
                </span>
              </div>

              <p className="text-fyn-slate pt-1">{m.message}</p>

              <div className="pt-2 flex justify-end">
                <Link href={`/expert/orders/${m.orderId}`}>
                  <Button variant="ghost" size="sm">
                    Open Filing Thread →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
