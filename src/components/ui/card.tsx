import React from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: any) {
  return (
    <div className={cn("bg-surface-card border border-surface-border rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: any) {
  return (
    <div className={cn("p-6 flex flex-col space-y-1.5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: any) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: any) {
  return (
    <p className={cn("text-sm text-slate-500", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: any) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: any) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  );
}
