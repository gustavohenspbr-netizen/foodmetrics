import React from "react";
import { cn } from "../../lib/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "brand" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const TONES = {
  brand: "from-[#e01c1c] to-[#ff8732]",
  success: "from-emerald-500 to-emerald-400",
  warning: "from-amber-500 to-amber-400",
  danger: "from-red-500 to-red-400",
  info: "from-blue-500 to-blue-400",
};

const SIZES = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export function ProgressBar({ value, max = 100, tone = "brand", size = "md", showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden", SIZES[size])}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", TONES[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Progresso
          </span>
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{pct.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
