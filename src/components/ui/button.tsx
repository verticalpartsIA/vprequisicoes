import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-brand hover:bg-brand-dark text-white font-bold shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/30 transition-all",
  outline:
    "border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all",
  ghost:
    "bg-transparent text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all",
  destructive:
    "bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm transition-all",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
