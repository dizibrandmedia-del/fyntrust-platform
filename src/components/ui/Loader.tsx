import React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = "md", text, className }) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 space-y-3", className)}>
      <div
        className={cn(
          "rounded-full border-fyn-primary-subtle border-t-fyn-primary animate-spin",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-xs font-medium text-fyn-slate-muted">{text}</p>}
    </div>
  );
};
