import React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "../lib/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  color?: string;
  spark?: number[];
  hint?: string;
  size?: "sm" | "md" | "lg";
}

export function MetricCard({
  label,
  value,
  delta,
  deltaLabel = "vs mês anterior",
  icon: Icon,
  color = "#e01c1c",
  spark,
  hint,
  size = "md",
}: MetricCardProps) {
  const sparkData = spark?.map((v, i) => ({ x: i, y: v }));
  const isUp = (delta ?? 0) >= 0;

  return (
    <div className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between mb-5">
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>

      <p
        className={cn(
          "font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums leading-none",
          size === "sm" && "text-2xl",
          size === "md" && "text-3xl",
          size === "lg" && "text-4xl"
        )}
      >
        {value}
      </p>

      <div className="flex items-end justify-between mt-3 gap-3">
        <div className="flex-1">
          {delta !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                  isUp
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                )}
              >
                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isUp ? "+" : ""}
                {delta.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{deltaLabel}</span>
            </div>
          )}
          {hint && !delta && (
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{hint}</p>
          )}
        </div>

        {sparkData && sparkData.length > 1 && (
          <div className="w-20 h-10 -mb-1">
            <ResponsiveContainer>
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#spark-${label})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
