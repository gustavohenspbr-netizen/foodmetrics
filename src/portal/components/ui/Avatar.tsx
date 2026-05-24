import React from "react";
import { cn } from "../../lib/cn";
import { fmt } from "../../lib/format";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name?: string;
  src?: string;
  color?: string;
  size?: Size;
  status?: "online" | "offline" | "busy";
  className?: string;
}

const SIZES: Record<Size, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-16 h-16 text-[18px]",
};

const STATUS_COLOR = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  busy: "bg-amber-500",
};

export function Avatar({ name = "?", src, color = "#0F172A", size = "md", status, className }: AvatarProps) {
  const initials = fmt.initials(name);
  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn("rounded-xl object-cover", SIZES[size])}
        />
      ) : (
        <div
          className={cn("rounded-xl flex items-center justify-center font-bold flex-shrink-0", SIZES[size])}
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0F172A]",
            STATUS_COLOR[status]
          )}
        />
      )}
    </div>
  );
}
