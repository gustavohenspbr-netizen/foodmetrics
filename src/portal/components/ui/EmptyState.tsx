import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-5 shadow-inner">
          <Icon size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
