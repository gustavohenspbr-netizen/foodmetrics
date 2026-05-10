"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, FileText, Bell, Settings,
  LogOut, TrendingUp, DollarSign, UserCheck, Clock,
  CheckCircle, AlertCircle, ChevronRight, Calendar,
  Send, MoreVertical, CreditCard, Briefcase
} from "lucide-react";
import { MOCK_CLIENTS, MOCK_REPORTS, MOCK_SCHEDULES } from "@/lib/mockData";

export default function AdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
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
    <div className="flex min-h-screen bg-transparent">

      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderLeft: "none", borderBottom: "none", borderRadius: 0 }}>
        
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-8" />
          <span className="block text-xs mt-2 px-2 py-0.5 rounded-md w-fit"
            style={{ background: "rgba(224,28,28,0.15)", color: "#f87171", border: "1px solid rgba(224,28,28,0.2)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
            { id: "clients", icon: Users, label: "Clientes" },
            { id: "crm", icon: Briefcase, label: "CRM" },
            { id: "finance", icon: CreditCard, label: "Financeiro" },
            { id: "reports", icon: FileText, label: "Relatórios" },
            { id: "schedule", icon: Calendar, label: "Agendamentos" },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`sidebar-link w-full text-left ${active === id ? "active" : ""}`}>
              <Icon size={17} />
              {label}
              {id === "clients" && pendingClients.length > 0 && (
                <span className="ml-auto text-xs rounded-full px-2 py-0.5 font-bold"
                  style={{ background: "rgba(224,28,28,0.2)", color: "#f87171" }}>
                  {pendingClients.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button className="sidebar-link w-full text-left">
            <Settings size={17} /> Configurações
          </button>
          <button onClick={logout} className="sidebar-link w-full text-left">
            <LogOut size={17} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-10"
          style={{ background: "rgba(8,8,16,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h1 className="text-lg font-bold text-white">
              {active === "dashboard" && "Visão Geral"}
              {active === "clients" && "Gestão de Clientes"}
              {active === "crm" && "CRM & Vendas"}
              {active === "finance" && "Financeiro"}
              {active === "reports" && "Relatórios"}
              {active === "schedule" && "Agendamentos Automáticos"}
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Food Métricas — Painel Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl glass">
              <Bell size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
              {pendingClients.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "#e01c1c", color: "#fff" }}>
                  {pendingClients.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#e01c1c,#c01010)", color: "#fff" }}>
                AG
              </div>
              <span className="text-sm font-medium text-white">Angelo Garcia</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* === DASHBOARD === */}
          {active === "dashboard" && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: "Clientes Ativos", value: activeClients.length, icon: UserCheck, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                  { label: "Aprovação Pendente", value: pendingClients.length, icon: Clock, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
                  { label: "Investimento Mensal", value: `R$ ${totalSpend.toLocaleString("pt-BR")}`, icon: DollarSign, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
                  { label: "Relatórios Enviados", value: MOCK_REPORTS.length, icon: TrendingUp, color: "#e01c1c", bg: "rgba(224,28,28,0.1)" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {pendingClients.length > 0 && (
                <div className="glass rounded-2xl p-6" style={{ border: "1px solid rgba(245,158,11,0.2)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={18} style={{ color: "#fbbf24" }} />
                    <h2 className="font-bold text-white">Aprovações Pendentes</h2>
                  </div>
                  <div className="space-y-3">
                    {pendingClients.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{ background: c.color + "22", color: c.color }}>
                            {c.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{c.restaurant}</p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                            ✓ Aprovar
                          </button>
                          <button className="px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(224,28,28,0.1)", color: "#f87171", border: "1px solid rgba(224,28,28,0.2)" }}>
                            ✕ Recusar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client table */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h2 className="font-bold text-white">Carteira de Clientes</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                    Ver todos →
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Cliente", "Tipo", "Google Ads", "Meta Ads", "iFood", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeClients.map(c => (
                      <tr key={c.id} className="glass-hover transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: c.color + "22", color: c.color }}>
                              {c.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{c.restaurant}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{c.type}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">R$ {c.googleSpend.toLocaleString("pt-BR")}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">R$ {c.metaSpend.toLocaleString("pt-BR")}</td>
                        <td className="px-6 py-4 text-sm text-white">⭐ {c.ifoodRating}</td>
                        <td className="px-6 py-4">
                          <span className={`badge-green text-xs px-2.5 py-1 rounded-full font-medium`}>
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent reports */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4">Relatórios Recentes</h2>
                <div className="space-y-3">
                  {MOCK_REPORTS.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(59,130,246,0.12)" }}>
                          <FileText size={16} style={{ color: "#60a5fa" }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.title}</p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{r.period}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "read" ? "badge-green" : "badge-blue"}`}>
                        {r.status === "read" ? "Lido" : "Enviado"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* === CLIENTS === */}
          {active === "clients" && (
            <div className="space-y-4">
              {MOCK_CLIENTS.map(c => (
                <div key={c.id} className="glass rounded-2xl p-6 flex items-center justify-between glass-hover cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold"
                      style={{ background: c.color + "22", color: c.color }}>
                      {c.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white">{c.restaurant}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.email} · {c.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {c.status === "active" && (
                      <>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Google Ads</p>
                          <p className="text-sm font-semibold text-white">R$ {c.googleSpend.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Meta Ads</p>
                          <p className="text-sm font-semibold text-white">R$ {c.metaSpend.toLocaleString()}</p>
                        </div>
                      </>
                    )}
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${c.status === "active" ? "badge-green" : "badge-amber"}`}>
                      {c.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                    {c.status === "pending" && (
                      <button className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                        ✓ Aprovar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === REPORTS === */}
          {active === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{MOCK_REPORTS.length} relatórios enviados</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#e01c1c,#c01010)" }}>
                  <Send size={15} /> Novo Relatório
                </button>
              </div>
              {MOCK_REPORTS.map(r => (
                <div key={r.id} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{r.title}</h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{r.period}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${r.status === "read" ? "badge-green" : "badge-blue"}`}>
                      {r.status === "read" ? "✓ Lido" : "→ Enviado"}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      {r.clients.length} cliente(s)
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      {new Date(r.sentAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === SCHEDULE === */}
          {active === "schedule" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{MOCK_SCHEDULES.length} agendamentos ativos</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#e01c1c,#c01010)" }}>
                  <Calendar size={15} /> Novo Agendamento
                </button>
              </div>
              {MOCK_SCHEDULES.map(s => (
                <div key={s.id} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{s.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-lg badge-blue">{s.type === "monthly" ? "Mensal" : "Semanal"}</span>
                        <span className="text-xs px-2 py-1 rounded-lg badge-muted">{s.channel === "email" ? "📧 E-mail" : "💬 WhatsApp"}</span>
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                          Próximo: {new Date(s.nextRun).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${s.active ? "badge-green" : "badge-muted"}`}>
                        {s.active ? "Ativo" : "Pausado"}
                      </span>
                      <button><MoreVertical size={16} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === CRM === */}
          {active === "crm" && (
            <div className="glass rounded-2xl p-10 text-center space-y-4" style={{ border: "1px dashed rgba(255,255,255,0.15)" }}>
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Briefcase size={32} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">CRM de Vendas (Em Breve)</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Gerencie seu funil de vendas, acompanhe leads, feche mais contratos de assessoria e acompanhe a jornada do cliente desde o primeiro contato.
                </p>
              </div>
            </div>
          )}

          {/* === FINANCEIRO === */}
          {active === "finance" && (
            <div className="glass rounded-2xl p-10 text-center space-y-4" style={{ border: "1px dashed rgba(255,255,255,0.15)" }}>
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                <CreditCard size={32} style={{ color: "#4ade80" }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Gestão Financeira (Em Breve)</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Controle de recebimentos, emissão de notas fiscais, alertas de inadimplência e projeção de faturamento da agência.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
