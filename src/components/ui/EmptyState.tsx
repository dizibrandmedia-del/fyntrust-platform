import React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-fyn-slate-border bg-fyn-bg/50 max-w-lg mx-auto my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-fyn-primary-subtle flex items-center justify-center text-fyn-primary mb-4">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h4 className="font-heading font-bold text-base text-fyn-slate">{title}</h4>
      <p className="text-xs md:text-sm text-fyn-slate-muted mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
