import React from "react";
import { LogOut, Settings, LayoutDashboard, Users, FileText, Calendar, CreditCard, Briefcase, BarChart2, ShoppingBag, PieChart, ChefHat } from "lucide-react";

export const ADMIN_NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { id: "clients", icon: Users, label: "Clientes" },
  { id: "crm", icon: Briefcase, label: "CRM" },
  { id: "finance", icon: CreditCard, label: "Financeiro" },
  { id: "reports", icon: FileText, label: "Relatórios" },
  { id: "schedule", icon: Calendar, label: "Agendamentos" },
];

export const CLIENT_NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { id: "google-ads", icon: BarChart2, label: "Google Ads" },
  { id: "meta-ads", icon: PieChart, label: "Meta Ads" },
  { id: "ifood", icon: ShoppingBag, label: "iFood" },
  { id: "crm", icon: Users, label: "CRM" },
  { id: "finance", icon: CreditCard, label: "Financeiro" },
  { id: "reports", icon: FileText, label: "Relatórios" },
];

interface SidebarProps {
  type: "admin" | "client";
  active: string;
  setActive: (id: string) => void;
  pendingCount?: number;
  clientInfo?: {
    restaurant: string;
    type: string;
    avatar: string;
    color: string;
  };
}

export function Sidebar({ type, active, setActive, pendingCount = 0, clientInfo }: SidebarProps) {
  function logout() {
    sessionStorage.clear();
    window.location.href = "/login.html";
  }

  const navItems = type === "admin" ? ADMIN_NAV : CLIENT_NAV;

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {type === "admin" ? (
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/50">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-8" />
          <span className="ml-3 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-[10px] font-bold tracking-widest uppercase">
            Admin
          </span>
        </div>
      ) : (
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-8 mb-8" />
          {clientInfo && (
            <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-bold flex-shrink-0 shadow-sm"
                style={{ background: clientInfo.color + "15", color: clientInfo.color, border: `1px solid ${clientInfo.color}30` }}>
                {clientInfo.avatar}
              </div>
              <div className="overflow-hidden">
                <p className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight">{clientInfo.restaurant}</p>
                <p className="text-[12px] truncate text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">{clientInfo.type}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Navegação
        </p>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${
              active === id 
                ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
            }`}>
            <Icon size={18} className={active === id ? "text-[#e01c1c] dark:text-red-500" : "text-slate-400"} />
            {label}
            {type === "admin" && id === "clients" && pendingCount > 0 && (
              <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-[#e01c1c] text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">
        {type === "admin" && (
          <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
            <Settings size={18} className="text-slate-400" /> Configurações
          </button>
        )}
        <button onClick={logout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
          <LogOut size={18} className="text-slate-400" /> Sair
        </button>
      </div>
    </aside>
  );
}
