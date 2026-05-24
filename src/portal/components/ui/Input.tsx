import React, { forwardRef } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon: Icon, iconRight, className, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 bg-white dark:bg-[#0B1120] border rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all",
            "focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40",
            error
              ? "border-red-300 dark:border-red-500/50"
              : "border-slate-200 dark:border-slate-800",
            Icon && "pl-11",
            iconRight && "pr-11",
            className
          )}
          {...rest}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{iconRight}</div>
        )}
      </div>
      {(hint || error) && (
        <p
          className={cn(
            "text-[12px] mt-1.5 font-medium",
            error ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});
