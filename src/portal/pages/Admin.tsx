import React, { useEffect, useState } from "react";
import { UserCheck, Clock, DollarSign, TrendingUp, AlertCircle, FileText, Star } from "lucide-react";
import { MOCK_CLIENTS, MOCK_REPORTS } from "../lib/mockData";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { MetricCard } from "../components/MetricCard";

export function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("fm_role");
    if (role !== "admin") window.location.href = "/login.html";
  }, []);

  const activeClients = MOCK_CLIENTS.filter(c => c.status === "active");
  const pendingClients = MOCK_CLIENTS.filter(c => c.status === "pending");
  const totalSpend = activeClients.reduce((s, c) => s + c.googleSpend + c.metaSpend, 0);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="admin" active={active} setActive={setActive} pendingCount={pendingClients.length} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar type="admin" active={active} pendingCount={pendingClients.length} />

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {active === "dashboard" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard label="Clientes Ativos" value={activeClients.length} icon={UserCheck} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
                  <MetricCard label="Aprovação Pendente" value={pendingClients.length} icon={Clock} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
                  <MetricCard label="Investimento Mensal" value={`R$ ${totalSpend.toLocaleString("pt-BR")}`} icon={DollarSign} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
                  <MetricCard label="Relatórios Enviados" value={MOCK_REPORTS.length} icon={TrendingUp} color="text-[#e01c1c] dark:text-red-400" bg="bg-red-50 dark:bg-red-500/10" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-8">
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

                  <div className="space-y-8">
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
