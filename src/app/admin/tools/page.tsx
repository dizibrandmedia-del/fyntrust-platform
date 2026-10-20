"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TOOLS_LIST } from "@/lib/tools/constants";
import { Wrench, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

export default function AdminToolsPage() {
  const [tools, setTools] = useState(
    TOOLS_LIST.map((t) => ({ ...t, isActive: true }))
  );
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const toggleTool = (slug: string) => {
    setTools(
      tools.map((t) => (t.slug === slug ? { ...t, isActive: !t.isActive } : t))
    );
  };

  return (
    <div className="space-y-8 font-body">
      <div className="border-b border-fyn-slate-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
          Business Toolkit & Calculators CMS
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Configure active calculators, manage statutory disclaimers, and update default tax rate parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Card key={tool.slug} variant="default" className="p-5 border-fyn-slate-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-sm font-heading text-fyn-slate">{tool.title}</span>
                <span className="block text-[10px] text-fyn-slate-muted uppercase tracking-wider">{tool.category}</span>
              </div>
              <Badge variant={tool.isActive ? "accent" : "warning"} size="sm">
                {tool.isActive ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>

            <p className="text-fyn-slate-muted">{tool.description}</p>

            <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between">
              <span className="text-[10px] text-fyn-slate-muted font-mono">/tools/{tool.slug}</span>
              <Button
                variant={tool.isActive ? "outline" : "accent"}
                size="sm"
                onClick={() => toggleTool(tool.slug)}
              >
                {tool.isActive ? "Disable Tool" : "Enable Tool"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
