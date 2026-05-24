import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const COLORS: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { ...t, id, duration: t.duration ?? 4000 };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration) {
        setTimeout(() => remove(id), toast.duration);
      }
    },
    [remove]
  );

  const value: ToastContextValue = {
    push,
    success: (title, description) => push({ type: "success", title, description }),
    error: (title, description) => push({ type: "error", title, description }),
    info: (title, description) => push({ type: "info", title, description }),
    warning: (title, description) => push({ type: "warning", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 flex items-start gap-3 animate-[slideInRight_0.25s_ease-out]"
            >
              <Icon size={20} className={cn("flex-shrink-0 mt-0.5", COLORS[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px) }
          to { opacity: 1; transform: translateX(0) }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
