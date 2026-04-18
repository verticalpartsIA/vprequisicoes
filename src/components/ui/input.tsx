import * as React from "react";
import { FieldTooltip } from "./FieldTooltip";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, tooltip, icon, required, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 flex flex-col">
        {label && (
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            {label}
            {required && <span className="text-red-500">*</span>}
            {tooltip && <FieldTooltip text={tooltip} />}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${icon ? "pl-12" : ""} ${error ? 'border-red-400 focus-visible:ring-red-200' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
        {hint && !error && <p className="text-[10px] font-medium text-slate-500 ml-1 italic">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
