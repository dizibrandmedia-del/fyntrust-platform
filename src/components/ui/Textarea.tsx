import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-fyn-slate">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full min-h-[90px] rounded-lg border bg-white p-3.5 text-sm text-fyn-slate placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-fyn-primary focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed",
            error ? "border-red-500 focus:ring-red-500" : "border-fyn-slate-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-fyn-slate-muted">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
