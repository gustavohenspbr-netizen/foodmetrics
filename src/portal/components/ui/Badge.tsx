import React from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand" | "orange";
type Size = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
}

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60",
  success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20",
  warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
  danger: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/20",
  info: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
  brand: "bg-[#e01c1c]/10 dark:bg-[#e01c1c]/15 text-[#e01c1c] dark:text-red-400 border-[#e01c1c]/20",
  orange: "bg-[#ff8732]/10 dark:bg-[#ff8732]/15 text-[#ff8732] dark:text-orange-400 border-[#ff8732]/20",
};

const DOT_COLOR: Record<Tone, string> = {
  neutral: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  brand: "bg-[#e01c1c]",
  orange: "bg-[#ff8732]",
};

const SIZES: Record<Size, string> = {
  sm: "text-[10px] px-2 py-0.5 gap-1.5",
  md: "text-[11px] px-2.5 py-1 gap-2",
};

export function Badge({ tone = "neutral", size = "sm", dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-wider rounded-full border",
        TONES[tone],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", DOT_COLOR[tone])} />}
      {children}
    </span>
  );
}
