import React, { useState } from "react";
import { Bell, Check, MessageSquare, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dropdown } from "./ui/Dropdown";
import { MOCK_NOTIFICATIONS } from "../lib/mockData";
import { cn } from "../lib/cn";

const ICON_MAP: Record<string, any> = {
  alert: AlertTriangle,
  check: CheckCircle2,
  file: FileText,
  message: MessageSquare,
};

const TONE_MAP: Record<string, string> = {
  alert: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  message: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <Dropdown
      align="right"
      width="w-[380px]"
      trigger={
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] flex items-center justify-center font-bold bg-[#e01c1c] text-white border-2 border-white dark:border-[#0F172A]">
              {unread}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <p className="text-[14px] font-bold text-slate-900 dark:text-white">Notificações</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {unread > 0 ? `${unread} não lidas` : "Você está em dia!"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-bold text-[#e01c1c] hover:underline flex items-center gap-1"
          >
            <Check size={12} /> Marcar todas
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((n) => {
          const Icon = ICON_MAP[n.icon] ?? Bell;
          return (
            <button
              key={n.id}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0",
                !n.read && "bg-[#e01c1c]/[0.02] dark:bg-[#e01c1c]/[0.04]"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", TONE_MAP[n.type] ?? TONE_MAP.info)}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] leading-tight text-slate-900 dark:text-white", !n.read && "font-bold", n.read && "font-semibold")}>
                  {n.title}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{n.description}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#e01c1c] flex-shrink-0 mt-1.5" />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/60">
        <button className="w-full py-3 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          Ver todas as notificações
        </button>
      </div>
    </Dropdown>
  );
}
