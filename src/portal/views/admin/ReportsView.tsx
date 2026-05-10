import React from "react";
import { FileText, Download, Send, Plus, Filter } from "lucide-react";
import { MOCK_REPORTS } from "../../lib/mockData";

export function ReportsView() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Central de Relatórios</h2>
        <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
          <Plus size={18} /> Novo Relatório
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de Disparos</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Filter size={18} />
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {MOCK_REPORTS.map(r => (
            <div key={r.id} className="p-8 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">{r.title}</h3>
                  <div className="flex items-center gap-4 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Período: {r.period}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Enviado em: {r.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  r.status === "read" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                }`}>
                  {r.status === "read" ? "Visualizado pelo Cliente" : "Entregue"}
                </span>
                
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                    <Download size={18} />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
