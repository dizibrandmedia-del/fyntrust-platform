import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "executive" | "gold" | "dark" | "flat";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border border-fyn-slate-border shadow-fyn rounded-xl",
    executive:
      "bg-white border-t-4 border-t-fyn-primary border-x border-b border-fyn-slate-border shadow-fyn-md rounded-xl",
    gold: "bg-white border-t-4 border-t-fyn-gold border-x border-b border-fyn-gold/30 shadow-fyn-gold rounded-xl",
    dark: "bg-fyn-dark text-white border border-fyn-dark-surface shadow-lg rounded-xl",
    flat: "bg-fyn-bg-subtle border border-fyn-slate-border/70 rounded-xl",
  };

  return (
    <div className={cn("p-6 text-left transition-all", variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("font-heading font-bold text-lg text-fyn-slate tracking-tight", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-xs md:text-sm text-fyn-slate-muted", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("pt-0", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex items-center pt-4 border-t border-fyn-slate-border/60", className)} {...props} />
);
