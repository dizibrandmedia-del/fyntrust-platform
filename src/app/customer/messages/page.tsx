"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { MessageSquare, Send, ArrowRight, User } from "lucide-react";

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/messages");
        if (res.ok) {
          const json = await res.json();
          setMessages(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Messages & CA Advisory Threads
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Unified communications with your assigned Chartered Accountants, legal partners, and compliance specialists.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading communication channels..." />
        </div>
      ) : messages.length === 0 ? (
        <Card variant="default" className="p-12 text-center space-y-4 border-fyn-slate-border">
          <MessageSquare className="w-12 h-12 mx-auto text-fyn-slate-muted" />
          <h3 className="text-base font-bold text-fyn-slate font-heading">No message threads active</h3>
          <p className="text-xs text-fyn-slate-muted max-w-sm mx-auto">
            You can message your dedicated CA directly from any active order detail page.
          </p>
          <Link href="/customer/orders">
            <Button variant="primary" size="sm">
              Go to My Orders
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              variant="default"
              className="p-5 border-fyn-slate-border hover:border-fyn-primary transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-fyn-primary font-heading">
                    {msg.order?.orderNumber || "General Inquiry"}
                  </span>
                  <span className="text-[10px] text-fyn-slate-muted">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="text-xs text-fyn-slate">
                  <strong>{msg.sender?.fullName || "CA Desk"}:</strong> {msg.message}
                </div>
              </div>

              {msg.order?.id && (
                <Link href={`/customer/orders/${msg.order.id}`} className="shrink-0 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    Reply in Order Workspace →
                  </Button>
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
