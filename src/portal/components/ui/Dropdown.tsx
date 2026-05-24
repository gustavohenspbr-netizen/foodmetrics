import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
}

export function Dropdown({ trigger, children, align = "right", width = "w-64", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-[fadeSlide_0.15s_ease-out]",
            align === "right" ? "right-0" : "left-0",
            width
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  destructive?: boolean;
}

export function DropdownItem({ icon, destructive, className, children, ...rest }: DropdownItemProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold transition-colors text-left",
        destructive
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60",
        className
      )}
      {...rest}
    >
      {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSection({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
      {label && (
        <p className="px-4 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
