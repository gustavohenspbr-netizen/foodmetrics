import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: "right" | "left";
  width?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const WIDTHS = {
  sm: "w-full sm:w-96",
  md: "w-full sm:w-[480px]",
  lg: "w-full sm:w-[640px]",
};

export function Drawer({ open, onClose, title, description, side = "right", width = "md", children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 bg-white dark:bg-[#0F172A] shadow-2xl border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300",
          WIDTHS[width],
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </>
  );
}
