import React from "react";
import { Clock, TrendingDown, Map, ShieldAlert, Award, Star } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";

export function IfoodView() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-[#EA1D2C] w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[12px]">iF</div>
            Dashboard iFood
          </h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Métricas de Desempenho e Operação no App
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-50 text-[#EA1D2C] dark:bg-red-500/10 rounded-lg text-[12px] font-bold border border-red-200 dark:border-red-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EA1D2C]"></span>
            Loja Aberta
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Despacho Médio" value="12m 45s" sub="-1m 30s vs semana" up icon={Clock} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <MetricCard label="Taxa de Cancelamento" value="1.2%" sub="Abaixo da média (3%)" up icon={TrendingDown} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
        <MetricCard label="Foco de Atraso" value="Jd. Paulista" sub="Chuva na região" icon={ShieldAlert} color="text-red-600 dark:text-red-400" bg="bg-red-50 dark:bg-red-500/10" />
        <MetricCard label="Super Restaurante" value="Garantido" sub="Próxima avaliação: 10/06" up icon={Award} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pedidos em Andamento (Tempo Real)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#0B1120]/50 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pedido</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tempo Total</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Motoboy iFood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  <tr className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">#1042</td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">18m 22s</td>
                    <td className="px-8 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Em Preparo</span>
                    </td>
                    <td className="px-8 py-5 text-[14px] text-slate-500 font-medium">Aguardando...</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">#1043</td>
                    <td className="px-8 py-5 font-bold text-amber-600 dark:text-amber-500">32m 10s</td>
                    <td className="px-8 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">Despachado</span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-bold text-slate-900 dark:text-white">Carlos Silva</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star size={20} className="fill-amber-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Avaliação Média</h3>
            </div>
            <p className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">4.9</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">+12 avaliações nesta semana</p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Map size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Heatmap de Vendas</h3>
            </div>
            <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative">
              <img src="https://assets.website-files.com/5e832e12eb7ca02ee9064d42/5f7db426b676b95755fb2844_Group%20805.jpg" alt="Mapa" className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Zona Quente Atual</p>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">Pinheiros & Itaim Bibi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
