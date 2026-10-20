"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { CheckSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function ExpertTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/expert/tasks");
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
      const res = await fetch(`/api/expert/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Filing Task Management
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Track statutory filing checklist items, application submission milestones, and compliance verification.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading filing tasks..." />
        </div>
      ) : tasks.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          You're all caught up! No pending tasks.
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              variant="default"
              className={`p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                task.status === "COMPLETED"
                  ? "bg-slate-50 border-slate-200 text-fyn-slate-muted"
                  : "bg-white border-fyn-slate-border hover:border-fyn-primary"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.status === "COMPLETED"}
                    onChange={() => handleToggleTask(task.id, task.status)}
                    className="rounded border-slate-300 text-fyn-primary focus:ring-fyn-primary h-4 w-4"
                  />
                  <span className={`font-bold font-heading text-sm text-fyn-slate ${task.status === "COMPLETED" ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                  <Badge variant={task.priority === "URGENT" ? "danger" : "warning"} size="sm">
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-[11px] text-fyn-slate-muted">
                  Order: <strong className="font-mono text-fyn-primary">{task.order?.orderNumber}</strong> • {task.order?.service?.name} • {task.order?.customer?.businessName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={task.status === "COMPLETED" ? "accent" : "primary"} size="sm">
                  {task.status}
                </Badge>
                <Link href={`/expert/orders/${task.orderId}`}>
                  <Button variant="outline" size="sm">
                    Open Filing →
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
