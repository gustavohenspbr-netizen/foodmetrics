import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MOCK_GOOGLE_CAMPAIGNS, MOCK_META_CAMPAIGNS } from "../../lib/mockData";
import { TrendingUp, MousePointer, Eye, Target } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
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
};

export function AdsView() {
  const chartData = [
    { name: "Semana 1", cliques: 4000, impressoes: 24000 },
    { name: "Semana 2", cliques: 3000, impressoes: 13980 },
    { name: "Semana 3", cliques: 2000, impressoes: 9800 },
    { name: "Semana 4", cliques: 2780, impressoes: 39080 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resumo de Marketing Estratégico</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-[12px] font-bold border border-blue-200 dark:border-blue-500/20">Google Ads Ativo</span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg text-[12px] font-bold border border-indigo-200 dark:border-indigo-500/20">Meta Ads Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Ads" className="w-6 h-6" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campanhas no Google Ads</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {MOCK_GOOGLE_CAMPAIGNS.map(camp => (
              <div key={camp.id} className="p-6 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{camp.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${camp.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {camp.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gasto</p>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">R$ {camp.spend}</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">CPA (Custo p/ Conv.)</p>
                    <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">R$ {camp.cpa.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Retorno (ROAS)</p>
                    <p className="text-[15px] font-bold text-blue-600 dark:text-blue-400">{camp.roas}x</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Meta Ads" className="w-6 h-6" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campanhas no Meta Ads</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {MOCK_META_CAMPAIGNS.map(camp => (
              <div key={camp.id} className="p-6 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{camp.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${camp.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {camp.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1"><Eye size={12}/> Alcance</p>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{camp.reach.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1"><MousePointer size={12}/> Cliques</p>
                    <p className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400">{camp.clicks.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1"><Target size={12}/> CTR</p>
                    <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">{camp.ctr}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-[#e01c1c] dark:text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tráfego vs Retorno Mensal</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis yAxisId="left" orientation="left" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar yAxisId="left" dataKey="cliques" fill="#4285f4" radius={[4, 4, 0, 0]} name="Cliques (Tráfego)" />
            <Bar yAxisId="right" dataKey="impressoes" fill="#1877f2" radius={[4, 4, 0, 0]} name="Impressões (Alcance)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
