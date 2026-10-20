import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error" | "gold";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  ...props
}) => {
  const icons = {
    info: <Info className="w-5 h-5 text-fyn-primary shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-fyn-accent-dark shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    gold: <Info className="w-5 h-5 text-fyn-gold-dark shrink-0" />,
  };

  const variantStyles = {
    info: "bg-fyn-primary-subtle border-fyn-primary/30 text-fyn-primary-dark",
    success: "bg-fyn-accent-subtle border-fyn-accent/30 text-emerald-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    error: "bg-red-50 border-red-200 text-red-900",
    gold: "bg-fyn-gold-subtle border-fyn-gold/30 text-fyn-gold-dark",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm text-left leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold tracking-tight">{title}</h5>}
        <div className="text-xs md:text-sm">{children}</div>
      </div>
    </div>
  );
};
