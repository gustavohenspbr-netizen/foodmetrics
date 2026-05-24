import React from "react";
import { cn } from "../../lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
  inset?: boolean;
}

export function Card({ hoverable, padded = true, inset, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all",
        inset
          ? "bg-[#F8FAFC] dark:bg-[#0B1120] border-slate-200/60 dark:border-slate-800/60"
          : "bg-white dark:bg-[#0F172A] border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
        hoverable && "hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-slate-300/60 dark:hover:border-slate-700/60 cursor-pointer",
        padded && "p-6",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
      <div className="min-w-0">
        <h3 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
