import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "accent" | "gold" | "secondary" | "warning" | "danger" | "neutral" | "success";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-fyn-primary-subtle text-fyn-primary border-fyn-primary/20",
    accent: "bg-fyn-accent-subtle text-fyn-accent-dark border-fyn-accent/30",
    gold: "bg-fyn-gold-subtle text-fyn-gold-dark border-fyn-gold/30 font-semibold",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    neutral: "bg-fyn-bg-subtle text-fyn-slate-muted border-fyn-slate-border",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-body select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
