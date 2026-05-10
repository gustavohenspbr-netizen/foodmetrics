"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, BarChart2, ShoppingBag, FileText,
  LogOut, TrendingUp, TrendingDown, DollarSign, Eye,
  MousePointer, Star, Package, Bell, CreditCard, Briefcase,
  Sun, Moon, Search
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
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="text-[14px] font-bold">
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
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && (
        <p className={`text-[13px] mt-2 flex items-center gap-1.5 font-bold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {sub}
        </p>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const client = MOCK_CLIENT_USER;

  useEffect(() => {
    setMounted(true);
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
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">

      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-8 mb-8" />
          <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-bold flex-shrink-0 shadow-sm"
              style={{ background: client.color + "15", color: client.color, border: `1px solid ${client.color}30` }}>
              {client.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight">{client.restaurant}</p>
              <p className="text-[12px] truncate text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">{client.type}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Navegação</p>
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                active === id 
                  ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
              }`}>
              <Icon size={18} className={active === id ? "text-[#e01c1c] dark:text-red-500" : "text-slate-400"} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">
          <button onClick={logout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
            <LogOut size={18} className="text-slate-400" /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {NAV.find(n => n.id === active)?.label}
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Visão detalhada de performance · <span className="text-slate-900 dark:text-slate-300 font-bold">Maio 2025</span>
            </p>
          </div>
          <div className="flex items-center gap-5">
            
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto space-y-8">

            {/* === OVERVIEW === */}
            {active === "dashboard" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard label="Gasto Google" value={`R$ ${totalGoogleSpend.toFixed(0)}`} sub="+12% vs mês ant." up icon={DollarSign} color="#4285f4" />
                  <MetricCard label="Gasto Meta" value={`R$ ${totalMetaSpend.toFixed(0)}`} sub="+8% vs mês ant." up icon={DollarSign} color="#1877f2" />
                  <MetricCard label="Conversões Google" value={totalConversions} sub="+22% vs mês ant." up icon={MousePointer} color="#10b981" />
                  <MetricCard label="Alcance Meta" value={totalReach.toLocaleString("pt-BR")} sub="+5% vs mês ant." up icon={Eye} color="#8b5cf6" />
                </div>

                {/* Spend chart */}
                <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Investimento Mensal (2025)</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={MOCK_MONTHLY_SPEND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gGoogle" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4285f4" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4285f4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1877f2" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1877f2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="google" name="Google" stroke="#4285f4" strokeWidth={3} fill="url(#gGoogle)" />
                      <Area type="monotone" dataKey="meta" name="Meta" stroke="#1877f2" strokeWidth={3} fill="url(#gMeta)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* iFood quick stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 flex items-center gap-5 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-l-4 border-l-[#e01c1c]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-red-50 dark:bg-red-500/10">🛵</div>
                    <div>
                      <p className="text-[13px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pedidos hoje</p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{MOCK_IFOOD_DATA.orders.today}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 flex items-center gap-5 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-l-4 border-l-amber-400">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-amber-50 dark:bg-amber-500/10">⭐</div>
                    <div>
                      <p className="text-[13px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Avaliação iFood</p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{MOCK_IFOOD_DATA.rating}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 flex items-center gap-5 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-l-4 border-l-emerald-500">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-emerald-50 dark:bg-emerald-500/10">💰</div>
                    <div>
                      <p className="text-[13px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Receita hoje</p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">R$ {MOCK_IFOOD_DATA.revenue.today.toLocaleString("pt-BR")}</p>
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
