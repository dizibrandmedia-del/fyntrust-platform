import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "gold" | "secondary" | "outline" | "ghost" | "destructive" | "dark" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-fyn-primary text-white hover:bg-fyn-primary-dark focus:ring-fyn-primary shadow-sm hover:shadow",
      accent:
        "bg-fyn-accent text-white hover:bg-fyn-accent-dark focus:ring-fyn-accent shadow-sm",
      gold:
        "bg-fyn-gold text-white hover:bg-fyn-gold-dark focus:ring-fyn-gold shadow-fyn-gold font-semibold",
      secondary:
        "bg-fyn-primary-subtle text-fyn-primary hover:bg-fyn-primary-subtle/80 focus:ring-fyn-primary",
      outline:
        "border border-fyn-slate-border text-fyn-slate hover:bg-fyn-bg-subtle focus:ring-fyn-primary bg-white",
      ghost:
        "text-fyn-slate hover:bg-fyn-bg-subtle focus:ring-fyn-primary",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      dark:
        "bg-fyn-dark text-white hover:bg-fyn-dark-surface focus:ring-fyn-dark shadow-md",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
