"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart2, ShoppingBag, FileText,
  LogOut, TrendingUp, TrendingDown, DollarSign, Eye,
  MousePointer, Star, Package, Bell, CreditCard, Briefcase
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  MOCK_CLIENT_USER, MOCK_GOOGLE_CAMPAIGNS,
  MOCK_META_CAMPAIGNS, MOCK_IFOOD_DATA,
  MOCK_MONTHLY_SPEND, MOCK_REPORTS
} from "@/lib/mockData";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { id: "google", icon: BarChart2, label: "Google Ads" },
  { id: "meta", icon: BarChart2, label: "Meta Ads" },
  { id: "ifood", icon: ShoppingBag, label: "iFood" },
  { id: "crm", icon: Briefcase, label: "CRM" },
  { id: "finance", icon: CreditCard, label: "Financeiro" },
  { id: "reports", icon: FileText, label: "Relatórios" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: R$ {p.value.toLocaleString("pt-BR")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function MetricCard({ label, value, sub, up, icon: Icon, color }: any) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "metric-up" : "metric-down"}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {sub}
        </p>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");
  const client = MOCK_CLIENT_USER;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = sessionStorage.getItem("fm_role");
      if (!role) router.push("/login");
    }
  }, [router]);

  function logout() {
    sessionStorage.clear();
    router.push("/login");
  }

  const totalGoogleSpend = MOCK_GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalMetaSpend = MOCK_META_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalConversions = MOCK_GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const totalReach = MOCK_META_CAMPAIGNS.reduce((s, c) => s + c.reach, 0);

  return (
    <div className="flex min-h-screen bg-transparent">

      {/* SIDEBAR */}
      <aside className="w-60 flex-shrink-0 flex flex-col glass"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderLeft: "none", borderBottom: "none", borderRadius: 0 }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-7 mb-4" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: client.color + "22", color: client.color }}>
              {client.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{client.restaurant}</p>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{client.type}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`sidebar-link w-full text-left ${active === id ? "active" : ""}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
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
              {NAV.find(n => n.id === active)?.label}
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {client.restaurant} · Maio 2025
            </p>
          </div>
          <button className="p-2 rounded-xl glass">
            <Bell size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </header>

        <div className="p-8 space-y-8">

          {/* === OVERVIEW === */}
          {active === "dashboard" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Gasto Google" value={`R$ ${totalGoogleSpend.toFixed(0)}`} sub="+12% vs mês ant." up icon={DollarSign} color="#4285f4" />
                <MetricCard label="Gasto Meta" value={`R$ ${totalMetaSpend.toFixed(0)}`} sub="+8% vs mês ant." up icon={DollarSign} color="#1877f2" />
                <MetricCard label="Conversões Google" value={totalConversions} sub="+22% vs mês ant." up icon={MousePointer} color="#22c55e" />
                <MetricCard label="Alcance Meta" value={totalReach.toLocaleString("pt-BR")} sub="+5% vs mês ant." up icon={Eye} color="#a855f7" />
              </div>

              {/* Spend chart */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-white mb-6">Investimento Mensal</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MOCK_MONTHLY_SPEND}>
                    <defs>
                      <linearGradient id="gGoogle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4285f4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4285f4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1877f2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1877f2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="google" name="Google" stroke="#4285f4" strokeWidth={2} fill="url(#gGoogle)" />
                    <Area type="monotone" dataKey="meta" name="Meta" stroke="#1877f2" strokeWidth={2} fill="url(#gMeta)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* iFood quick stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(234,67,53,0.12)" }}>🛵</div>
                  <div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Pedidos hoje</p>
                    <p className="text-2xl font-bold text-white">{MOCK_IFOOD_DATA.orders.today}</p>
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(251,191,36,0.12)" }}>⭐</div>
                  <div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Avaliação iFood</p>
                    <p className="text-2xl font-bold text-white">{MOCK_IFOOD_DATA.rating}</p>
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(34,197,94,0.12)" }}>💰</div>
                  <div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Receita hoje</p>
                    <p className="text-2xl font-bold text-white">R$ {MOCK_IFOOD_DATA.revenue.today.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === GOOGLE ADS === */}
          {active === "google" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Gasto Total", value: `R$ ${totalGoogleSpend.toFixed(0)}`, color: "#4285f4" },
                  { label: "Conversões", value: totalConversions, color: "#22c55e" },
                  { label: "Cliques", value: MOCK_GOOGLE_CAMPAIGNS.reduce((s,c)=>s+c.clicks,0).toLocaleString(), color: "#fbbf24" },
                  { label: "ROAS Médio", value: "4.0x", color: "#a855f7" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-2xl p-5">
                    <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h2 className="font-bold text-white">Campanhas Ativas</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Campanha", "Status", "Gasto", "Cliques", "CTR", "Conversões", "ROAS"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_GOOGLE_CAMPAIGNS.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-5 py-4 text-sm font-medium text-white">{c.name}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${c.status === "active" ? "badge-green" : "badge-muted"}`}>
                            {c.status === "active" ? "Ativo" : "Pausado"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white">R$ {c.spend.toFixed(2)}</td>
                        <td className="px-5 py-4 text-sm text-white">{c.clicks.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-white">{c.ctr}%</td>
                        <td className="px-5 py-4 text-sm text-white">{c.conversions}</td>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: "#22c55e" }}>{c.roas}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === META ADS === */}
          {active === "meta" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Gasto Total", value: `R$ ${totalMetaSpend.toFixed(0)}`, color: "#1877f2" },
                  { label: "Alcance Total", value: totalReach.toLocaleString(), color: "#a855f7" },
                  { label: "Cliques", value: MOCK_META_CAMPAIGNS.reduce((s,c)=>s+c.clicks,0).toLocaleString(), color: "#fbbf24" },
                  { label: "Resultados", value: MOCK_META_CAMPAIGNS.reduce((s,c)=>s+c.results,0).toLocaleString(), color: "#22c55e" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-2xl p-5">
                    <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h2 className="font-bold text-white">Campanhas Ativas</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Campanha", "Objetivo", "Gasto", "Alcance", "Cliques", "Resultados", "Custo/Result."].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_META_CAMPAIGNS.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-5 py-4 text-sm font-medium text-white">{c.name}</td>
                        <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.objective.replace("_"," ")}</td>
                        <td className="px-5 py-4 text-sm text-white">R$ {c.spend.toFixed(2)}</td>
                        <td className="px-5 py-4 text-sm text-white">{c.reach.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-white">{c.clicks.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-white">{c.results.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: "#22c55e" }}>R$ {c.costPerResult.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === IFOOD === */}
          {active === "ifood" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Avaliação" value={`⭐ ${MOCK_IFOOD_DATA.rating}`} sub={`${MOCK_IFOOD_DATA.totalReviews} avaliações`} up icon={Star} color="#fbbf24" />
                <MetricCard label="Pedidos (mês)" value={MOCK_IFOOD_DATA.orders.month.toLocaleString()} sub="+14% vs mês ant." up icon={Package} color="#e01c1c" />
                <MetricCard label="Receita (mês)" value={`R$ ${MOCK_IFOOD_DATA.revenue.month.toLocaleString("pt-BR")}`} sub="+18% vs mês ant." up icon={DollarSign} color="#22c55e" />
                <MetricCard label="Ticket Médio" value={`R$ ${MOCK_IFOOD_DATA.ticketAvg.month.toFixed(2)}`} sub="+3% vs mês ant." up icon={TrendingUp} color="#a855f7" />
              </div>
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4">Itens Mais Pedidos</h2>
                <div className="space-y-3">
                  {MOCK_IFOOD_DATA.topItems.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold w-6" style={{ color: "rgba(255,255,255,0.2)" }}>#{i+1}</span>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                      </div>
                      <div className="flex gap-6 text-right">
                        <div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Pedidos</p>
                          <p className="text-sm font-bold text-white">{item.orders}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Receita</p>
                          <p className="text-sm font-bold" style={{ color: "#22c55e" }}>R$ {item.revenue.toLocaleString("pt-BR")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === REPORTS === */}
          {active === "reports" && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Relatórios enviados pela Food Métricas</p>
              {MOCK_REPORTS.map(r => (
                <div key={r.id} className="glass rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
                      <FileText size={20} style={{ color: "#60a5fa" }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{r.title}</h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{r.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${r.status === "read" ? "badge-green" : "badge-blue"}`}>
                      {r.status === "read" ? "✓ Lido" : "Novo"}
                    </span>
                    <button className="px-4 py-2 rounded-xl text-xs font-bold glass glass-hover text-white">
                      ↓ Baixar PDF
                    </button>
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
                <h2 className="text-xl font-bold text-white mb-2">Seu CRM de Vendas (Em Breve)</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Acompanhe os leads gerados pelas campanhas em tempo real, gerencie o status de cada atendimento e calcule sua taxa de conversão comercial.
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
                <h2 className="text-xl font-bold text-white mb-2">Seu Financeiro (Em Breve)</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Visualize faturas de assessoria, notas fiscais, relatórios de custo por aquisição (CAC) e retornos sobre investimento global (ROI).
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
