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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
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
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 font-bold ${up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {sub}
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-7 mb-6" />
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: client.color + "20", color: client.color }}>
              {client.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{client.restaurant}</p>
              <p className="text-xs truncate text-slate-500 dark:text-slate-400 font-medium">{client.type}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active === id 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              }`}>
              <Icon size={18} className={active === id ? "text-red-600 dark:text-red-500" : ""} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-auto flex flex-col relative">

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {NAV.find(n => n.id === active)?.label}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {client.restaurant} · Maio 2025
            </p>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <button className="relative p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

          {/* === OVERVIEW === */}
          {active === "dashboard" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Gasto Google" value={`R$ ${totalGoogleSpend.toFixed(0)}`} sub="+12% vs mês ant." up icon={DollarSign} color="#4285f4" />
                <MetricCard label="Gasto Meta" value={`R$ ${totalMetaSpend.toFixed(0)}`} sub="+8% vs mês ant." up icon={DollarSign} color="#1877f2" />
                <MetricCard label="Conversões Google" value={totalConversions} sub="+22% vs mês ant." up icon={MousePointer} color="#22c55e" />
                <MetricCard label="Alcance Meta" value={totalReach.toLocaleString("pt-BR")} sub="+5% vs mês ant." up icon={Eye} color="#a855f7" />
              </div>

              {/* Spend chart */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-6">Investimento Mensal</h2>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="google" name="Google" stroke="#4285f4" strokeWidth={3} fill="url(#gGoogle)" />
                    <Area type="monotone" dataKey="meta" name="Meta" stroke="#1877f2" strokeWidth={3} fill="url(#gMeta)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* iFood quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 flex items-center gap-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-red-50 dark:bg-red-500/10">🛵</div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pedidos hoje</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{MOCK_IFOOD_DATA.orders.today}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 flex items-center gap-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-400">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-amber-50 dark:bg-amber-500/10">⭐</div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Avaliação iFood</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{MOCK_IFOOD_DATA.rating}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 flex items-center gap-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-green-500">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-green-50 dark:bg-green-500/10">💰</div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Receita hoje</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">R$ {MOCK_IFOOD_DATA.revenue.today.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
