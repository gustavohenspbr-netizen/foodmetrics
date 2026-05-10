import React from "react";
import { Search, MousePointer, Target, DollarSign, Filter, ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { MOCK_GOOGLE_CAMPAIGNS } from "../../lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function GoogleAdsView() {
  const chartData = [
    { name: "S1", cliques: 4000, conv: 240 },
    { name: "S2", cliques: 3000, conv: 139 },
    { name: "S3", cliques: 2000, conv: 98 },
    { name: "S4", cliques: 2780, conv: 390 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Ads" className="w-6 h-6" />
            Performance no Google Ads
          </h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Rede de Pesquisa, Performance Max e Display
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[12px] font-bold border border-emerald-200 dark:border-emerald-500/20">Contas Sincronizadas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Investimento" value="R$ 4.250" sub="+12% vs mês ant." up icon={DollarSign} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
        <MetricCard label="Cliques" value="11.780" sub="+8% vs mês ant." up icon={MousePointer} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-500/10" />
        <MetricCard label="Conversões" value="867" sub="+22% vs mês ant." up icon={Target} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <MetricCard label="Custo por Conv." value="R$ 4,90" sub="-15% vs mês ant." up icon={Search} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tráfego vs Conversões (Pesquisa)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-2">{label}</p>
                        {payload.map((p: any) => (
                          <p key={p.name} style={{ color: p.color }} className="text-[13px] font-bold">
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar yAxisId="left" dataKey="cliques" fill="#4285f4" radius={[4, 4, 0, 0]} name="Cliques" />
                <Bar yAxisId="right" dataKey="conv" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campanhas Ativas</h2>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Filter size={18} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#0B1120]/50 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Campanha</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Investimento</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CPA</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {MOCK_GOOGLE_CAMPAIGNS.map((camp) => (
                    <tr key={camp.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {camp.name}
                          {camp.status === 'Ativa' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-bold text-slate-600 dark:text-slate-300">R$ {camp.spend}</td>
                      <td className="px-8 py-5 text-[14px] font-bold text-emerald-600 dark:text-emerald-400">R$ {camp.cpa.toFixed(2)}</td>
                      <td className="px-8 py-5 text-[14px] font-bold text-blue-600 dark:text-blue-400">{camp.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Dispositivos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <span className="font-bold text-[14px] text-slate-900 dark:text-white">Mobile</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white">82%</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                    <Monitor size={20} />
                  </div>
                  <span className="font-bold text-[14px] text-slate-900 dark:text-white">Desktop</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white">18%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Termos de Pesquisa Top 3</h3>
            <div className="space-y-3">
              {[
                { term: "hamburgueria artesanal perto de mim", pos: 1 },
                { term: "delivery de hamburguer rapido", pos: 2 },
                { term: "melhor smash burger sp", pos: 3 },
              ].map(t => (
                <div key={t.term} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold">
                    #{t.pos}
                  </div>
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{t.term}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
