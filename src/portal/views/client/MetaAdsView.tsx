import React from "react";
import { Eye, MousePointer, Image as ImageIcon, Video, DollarSign, Filter, Users } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { MOCK_META_CAMPAIGNS } from "../../lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function MetaAdsView() {
  const chartData = [
    { name: "S1", alcance: 40000, engajamento: 2400 },
    { name: "S2", alcance: 30000, engajamento: 1398 },
    { name: "S3", alcance: 20000, engajamento: 9800 },
    { name: "S4", alcance: 27800, engajamento: 3908 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Meta Ads" className="w-6 h-6" />
            Performance no Meta Ads
          </h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Instagram, Facebook e Messenger
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg text-[12px] font-bold border border-indigo-200 dark:border-indigo-500/20">Pixel Instalado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Investimento" value="R$ 3.850" sub="+5% vs mês ant." up icon={DollarSign} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-500/10" />
        <MetricCard label="Alcance Total" value="125.6k" sub="+18% vs mês ant." up icon={Eye} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-500/10" />
        <MetricCard label="Cliques no Link" value="4.320" sub="+12% vs mês ant." up icon={MousePointer} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
        <MetricCard label="Novos Seguidores" value="342" sub="+3% vs mês ant." up icon={Users} color="text-pink-600 dark:text-pink-400" bg="bg-pink-50 dark:bg-pink-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Alcance vs Engajamento Mensal</h2>
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
                <Bar yAxisId="left" dataKey="alcance" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Alcance" />
                <Bar yAxisId="right" dataKey="engajamento" fill="#ec4899" radius={[4, 4, 0, 0]} name="Engajamento" />
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
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Alcance</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cliques</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {MOCK_META_CAMPAIGNS.map((camp) => (
                    <tr key={camp.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {camp.name}
                          {camp.status === 'Ativa' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-bold text-slate-600 dark:text-slate-300">{camp.reach.toLocaleString('pt-BR')}</td>
                      <td className="px-8 py-5 text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{camp.clicks.toLocaleString('pt-BR')}</td>
                      <td className="px-8 py-5 text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{camp.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Formato de Criativo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <span className="font-bold text-[14px] text-slate-900 dark:text-white">Vídeos (Reels/Feed)</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white">74%</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ImageIcon size={20} />
                  </div>
                  <span className="font-bold text-[14px] text-slate-900 dark:text-white">Imagens (Carrossel)</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white">26%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Públicos que mais Engajam</h3>
            <div className="space-y-3">
              {[
                { term: "Mulheres 25-34 anos", pos: 1 },
                { term: "Interesse em Gastronomia", pos: 2 },
                { term: "Raio de 5km do Local", pos: 3 },
              ].map(t => (
                <div key={t.term} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[11px] font-bold">
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
