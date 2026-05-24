import React, { useState } from "react";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CreditCard,
  Briefcase,
  BarChart2,
  ShoppingBag,
  PieChart,
  MessageSquare,
  Target,
  Image,
  Globe,
  Star,
  Activity,
  UserCog,
  FileSignature,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/cn";

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number | string;
  section?: string;
}

export const ADMIN_NAV: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral", section: "Início" },
  { id: "clients", icon: Users, label: "Clientes", section: "Operação" },
  { id: "traffic", icon: Activity, label: "Operação de Tráfego", section: "Operação" },
  { id: "crm", icon: Briefcase, label: "CRM", section: "Operação" },
  { id: "schedule", icon: Calendar, label: "Agenda", section: "Operação" },
  { id: "team", icon: UserCog, label: "Equipe & Tarefas", section: "Gestão" },
  { id: "finance", icon: CreditCard, label: "Financeiro", section: "Gestão" },
  { id: "contracts", icon: FileSignature, label: "Contratos", section: "Gestão" },
  { id: "reports", icon: FileText, label: "Relatórios", section: "Gestão" },
];

export const CLIENT_NAV: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral", section: "Início" },
  { id: "google-ads", icon: BarChart2, label: "Google Ads", section: "Marketing" },
  { id: "meta-ads", icon: PieChart, label: "Meta Ads", section: "Marketing" },
  { id: "ifood", icon: ShoppingBag, label: "iFood", section: "Marketing" },
  { id: "gmb", icon: Star, label: "Google Meu Negócio", section: "Marketing" },
  { id: "site", icon: Globe, label: "Site & Tráfego", section: "Marketing" },
  { id: "strategy", icon: Target, label: "Estratégia", section: "Gestão" },
  { id: "crm", icon: Users, label: "CRM", section: "Gestão" },
  { id: "materials", icon: Image, label: "Materiais", section: "Gestão" },
  { id: "messages", icon: MessageSquare, label: "Mensagens", badge: 2, section: "Gestão" },
  { id: "reports", icon: FileText, label: "Relatórios", section: "Gestão" },
  { id: "finance", icon: CreditCard, label: "Financeiro", section: "Gestão" },
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
  const [collapsed, setCollapsed] = useState(false);

  function logout() {
    sessionStorage.clear();
    window.location.href = "/login.html";
  }

  const navItems = type === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const sections = Array.from(new Set(navItems.map((n) => n.section).filter(Boolean))) as string[];

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300",
        collapsed ? "w-[88px]" : "w-72"
      )}
    >
      {/* HEADER */}
      <div className="relative">
        {type === "admin" ? (
          <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
            <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className={cn("h-8 transition-all", collapsed && "h-7")} />
            {!collapsed && (
              <span className="ml-3 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-[10px] font-bold tracking-widest uppercase">
                Admin
              </span>
            )}
          </div>
        ) : (
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
            <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className={cn("h-8 mb-6", collapsed && "h-7 mb-0")} />
            {clientInfo && !collapsed && (
              <div className="flex items-center gap-3.5 bg-gradient-to-br from-[#F8FAFC] to-white dark:from-[#0B1120] dark:to-[#0F172A] p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-bold flex-shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${clientInfo.color}25, ${clientInfo.color}10)`,
                    color: clientInfo.color,
                    border: `1px solid ${clientInfo.color}30`,
                  }}
                >
                  {clientInfo.avatar}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {clientInfo.restaurant}
                  </p>
                  <p className="text-[11px] truncate text-slate-500 dark:text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                    {clientInfo.type}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-9 w-6 h-6 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          <ChevronLeft size={12} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {sections.map((section) => (
          <div key={section} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                {section}
              </p>
            )}
            {navItems
              .filter((n) => n.section === section)
              .map(({ id, icon: Icon, label, badge }) => {
                const isActive = active === id;
                const showBadge = badge ?? (type === "admin" && id === "clients" ? pendingCount : undefined);
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all relative group",
                      isActive
                        ? "bg-gradient-to-r from-[#e01c1c]/10 to-[#ff8732]/5 text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-[#e01c1c] to-[#ff8732]" />
                    )}
                    <Icon
                      size={18}
                      className={cn("flex-shrink-0 transition-colors", isActive ? "text-[#e01c1c]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate">{label}</span>
                        {showBadge && Number(showBadge) > 0 && (
                          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#e01c1c] text-white">
                            {showBadge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && showBadge && Number(showBadge) > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#e01c1c]" />
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 space-y-0.5">
        <button
          onClick={() => setActive("settings")}
          title={collapsed ? "Configurações" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
        >
          <Settings size={18} className="text-slate-400 flex-shrink-0" />
          {!collapsed && "Configurações"}
        </button>
        <button
          onClick={logout}
          title={collapsed ? "Sair" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
}
