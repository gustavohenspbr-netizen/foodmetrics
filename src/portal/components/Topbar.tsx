import React from "react";
import { Search, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ADMIN_NAV, CLIENT_NAV } from "./Sidebar";

interface TopbarProps {
  type: "admin" | "client";
  active: string;
  pendingCount?: number;
  clientName?: string;
}

export function Topbar({ type, active, pendingCount = 0, clientName }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  const title = type === "admin" 
    ? ADMIN_NAV.find(n => n.id === active)?.label || "Dashboard"
    : CLIENT_NAV.find(n => n.id === active)?.label || "Dashboard";

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {type === "admin" ? (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">Painel Administrativo — Food Métricas</p>
        ) : (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Visão detalhada de performance · <span className="text-slate-900 dark:text-slate-300 font-bold">Maio 2025</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        {type === "admin" && (
          <div className="hidden lg:flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-700 transition-all">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Pesquisar..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" />
          </div>
        )}

        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Bell size={18} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-[#e01c1c] text-white border-2 border-white dark:border-[#0F172A]">
              {pendingCount}
            </span>
          )}
        </button>

        {type === "admin" && (
          <div className="flex items-center gap-3 pl-5 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Angelo Garcia</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
              AG
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
