import React from "react";
import { cn } from "../../lib/cn";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export function Tabs({ tabs, active, onChange, variant = "underline", className }: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2",
              active === tab.id
                ? "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                active === tab.id
                  ? "bg-[#e01c1c]/10 text-[#e01c1c]"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("border-b border-slate-200 dark:border-slate-800", className)}>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-5 py-3 text-[14px] font-bold transition-colors flex items-center gap-2",
              active === tab.id
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {tab.count}
              </span>
            )}
            {active === tab.id && (
              <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-[#e01c1c] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
