import React from "react";
import { Utensils, Star, AlertTriangle, TrendingUp, Sparkles, Flame } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";

export function MenuView() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Engenharia de Cardápio Mágica</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Matriz BCG (Estrelas, Cavalos de Batalha, Quebra-Cabeças e Cães)
          </p>
        </div>
        <button className="h-[46px] px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-lg">
          <Sparkles size={18} className="text-amber-400 dark:text-amber-500" /> Otimizar Cardápio com IA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star size={20} className="fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Pratos Estrela</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">Alta Lucratividade + Alta Popularidade</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-[14px] text-slate-900 dark:text-white">1. Combo Família Premium</span>
              <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">+ R$ 42,00 Lucro</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-[14px] text-slate-900 dark:text-white">2. Smash Burger Duplo</span>
              <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">+ R$ 28,50 Lucro</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Cães (Atenção)</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">Baixa Lucratividade + Baixa Popularidade</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30">
              <span className="font-bold text-[14px] text-slate-900 dark:text-white">Salada Tropical Média</span>
              <button className="text-[12px] font-bold text-red-600 dark:text-red-400 underline">Ação Recomendada: Remover</button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30">
              <span className="font-bold text-[14px] text-slate-900 dark:text-white">Suco de Laranja 300ml</span>
              <button className="text-[12px] font-bold text-amber-600 dark:text-amber-400 underline">Ação Recomendada: Aumentar Preço</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row items-center gap-6 p-8">
         <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
            <Flame size={32} />
         </div>
         <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Insight do Algoritmo</h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 font-medium">
              Notamos que "Batata Frita com Cheddar" é o item mais adicionado como *upsell* (Cavalo de Batalha). Sugerimos criar um <strong>Combo com o Smash Burger Duplo (Prato Estrela)</strong> para aumentar o Ticket Médio em até 14% nesta semana.
            </p>
         </div>
         <button className="whitespace-nowrap h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)] mt-4 sm:mt-0">
           Aplicar no iFood
         </button>
      </div>
    </div>
  );
}
