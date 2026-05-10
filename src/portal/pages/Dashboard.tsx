import React, { useEffect, useState } from "react";
import { DollarSign, MousePointer, Eye } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { MetricCard } from "../components/MetricCard";
import {
  MOCK_CLIENT_USER, MOCK_GOOGLE_CAMPAIGNS,
  MOCK_META_CAMPAIGNS, MOCK_IFOOD_DATA,
  MOCK_MONTHLY_SPEND
} from "../lib/mockData";

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

export function ClientDashboard() {
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const client = MOCK_CLIENT_USER;

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("fm_role");
    if (!role) window.location.href = "/login.html";
  }, []);

  const totalGoogleSpend = MOCK_GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalMetaSpend = MOCK_META_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalConversions = MOCK_GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const totalReach = MOCK_META_CAMPAIGNS.reduce((s, c) => s + c.reach, 0);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="client" active={active} setActive={setActive} clientInfo={client} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar type="client" active={active} clientName={client.restaurant} />

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {active === "dashboard" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard label="Gasto Google" value={`R$ ${totalGoogleSpend.toFixed(0)}`} sub="+12% vs mês ant." up icon={DollarSign} color="#4285f4" />
                  <MetricCard label="Gasto Meta" value={`R$ ${totalMetaSpend.toFixed(0)}`} sub="+8% vs mês ant." up icon={DollarSign} color="#1877f2" />
                  <MetricCard label="Conversões Google" value={totalConversions} sub="+22% vs mês ant." up icon={MousePointer} color="#10b981" />
                  <MetricCard label="Alcance Meta" value={totalReach.toLocaleString("pt-BR")} sub="+5% vs mês ant." up icon={Eye} color="#8b5cf6" />
                </div>

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
