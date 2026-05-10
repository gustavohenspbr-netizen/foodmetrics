"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Users, FileText, Bell, Settings,
  LogOut, TrendingUp, DollarSign, UserCheck, Clock,
  CheckCircle, AlertCircle, ChevronRight, Calendar,
  Send, MoreVertical, CreditCard, Briefcase, Sun, Moon, Search, Star
} from "lucide-react";
import { MOCK_CLIENTS, MOCK_REPORTS, MOCK_SCHEDULES } from "@/lib/mockData";

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const role = sessionStorage.getItem("fm_role");
      if (role !== "admin") router.push("/login");
    }
  }, [router]);

  function logout() {
    sessionStorage.clear();
    router.push("/login");
  }

  const activeClients = MOCK_CLIENTS.filter(c => c.status === "active");
  const pendingClients = MOCK_CLIENTS.filter(c => c.status === "pending");
  const totalSpend = activeClients.reduce((s, c) => s + c.googleSpend + c.metaSpend, 0);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">

      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/50">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-8" />
          <span className="ml-3 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-[10px] font-bold tracking-widest uppercase">
            Admin
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Menu Principal</p>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
            { id: "clients", icon: Users, label: "Clientes" },
            { id: "crm", icon: Briefcase, label: "CRM" },
            { id: "finance", icon: CreditCard, label: "Financeiro" },
            { id: "reports", icon: FileText, label: "Relatórios" },
            { id: "schedule", icon: Calendar, label: "Agendamentos" },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                active === id 
                  ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
              }`}>
              <Icon size={18} className={active === id ? "text-[#e01c1c] dark:text-red-500" : "text-slate-400"} />
              {label}
              {id === "clients" && pendingClients.length > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-[#e01c1c] text-white">
                  {pendingClients.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">
          <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
            <Settings size={18} className="text-slate-400" /> Configurações
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
            <LogOut size={18} className="text-slate-400" /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {active === "dashboard" && "Visão Geral"}
              {active === "clients" && "Gestão de Clientes"}
              {active === "crm" && "CRM & Vendas"}
              {active === "finance" && "Financeiro"}
              {active === "reports" && "Relatórios"}
              {active === "schedule" && "Agendamentos Automáticos"}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-700 transition-all">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Pesquisar..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" />
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* Notifications */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Bell size={18} />
              {pendingClients.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-[#e01c1c] text-white border-2 border-white dark:border-[#0F172A]">
                  {pendingClients.length}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Angelo Garcia</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
                AG
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto space-y-8">

            {/* === DASHBOARD === */}
            {active === "dashboard" && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Clientes Ativos", value: activeClients.length, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                    { label: "Aprovação Pendente", value: pendingClients.length, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                    { label: "Investimento Mensal", value: `R$ ${totalSpend.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Relatórios Enviados", value: MOCK_REPORTS.length, icon: TrendingUp, color: "text-[#e01c1c] dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                          <Icon size={20} className={color} />
                        </div>
                      </div>
                      <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  
                  {/* Left Column */}
                  <div className="xl:col-span-2 space-y-8">
                    {/* Client table */}
                    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Carteira de Clientes</h2>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                          Ver todos &rarr;
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#F8FAFC] dark:bg-[#0B1120]/50 border-b border-slate-100 dark:border-slate-800/50">
                              {["Cliente", "Tipo", "Google Ads", "Meta Ads", "iFood", "Status"].map(h => (
                                <th key={h} className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {activeClients.map(c => (
                              <tr key={c.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors cursor-pointer group">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
                                      style={{ background: c.color + "15", color: c.color, border: `1px solid ${c.color}30` }}>
                                      {c.avatar}
                                    </div>
                                    <div>
                                      <p className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.restaurant}</p>
                                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{c.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-[14px] text-slate-600 dark:text-slate-300 font-medium">{c.type}</td>
                                <td className="px-8 py-5 text-[15px] font-bold text-slate-900 dark:text-white">R$ {c.googleSpend.toLocaleString("pt-BR")}</td>
                                <td className="px-8 py-5 text-[15px] font-bold text-slate-900 dark:text-white">R$ {c.metaSpend.toLocaleString("pt-BR")}</td>
                                <td className="px-8 py-5 text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pt-7">
                                  <Star size={16} className="text-amber-500 fill-amber-500" /> {c.ifoodRating}
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    Ativo
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Pending approvals */}
                    {pendingClients.length > 0 && (
                      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="bg-amber-50/50 dark:bg-amber-500/10 px-8 py-5 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                          <AlertCircle size={20} className="text-amber-600 dark:text-amber-500" />
                          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Aprovações Pendentes</h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {pendingClients.map(c => (
                            <div key={c.id} className="p-8 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                                  style={{ background: c.color + "15", color: c.color, border: `1px solid ${c.color}30` }}>
                                  {c.avatar}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-[15px]">{c.restaurant}</p>
                                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{c.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-600/20">
                                  Aprovar
                                </button>
                                <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                  Recusar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent reports */}
                    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Relatórios Recentes</h2>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {MOCK_REPORTS.slice(0,4).map(r => (
                          <div key={r.id} className="px-8 py-5 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1">{r.title}</p>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">{r.period}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              r.status === "read" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                            }`}>
                              {r.status === "read" ? "Lido" : "Enviado"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
