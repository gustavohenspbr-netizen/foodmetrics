import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  up?: boolean;
  icon: LucideIcon;
  color: string;
  bg?: string;
}

export function MetricCard({ label, value, sub, up, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`} style={!bg ? { backgroundColor: `${color}15` } : {}}>
          <Icon size={20} className={bg ? color : ""} style={!bg ? { color } : {}} />
        </div>
      </div>
      <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && (
        <p className={`text-[13px] mt-2 flex items-center gap-1.5 font-bold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {sub}
        </p>
      )}
    </div>
  );
}
