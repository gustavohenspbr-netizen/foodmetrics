import React from "react";
import { FileText, Download, Calendar } from "lucide-react";

export function ClientReportsView() {
  const reports = [
    { id: 1, title: "Relatório de Desempenho Mensal (Abril)", type: "Mensal", date: "02/05/2025" },
    { id: 2, title: "Análise de Campanhas e Ações (Março)", type: "Mensal", date: "03/04/2025" },
    { id: 3, title: "Estudo de Concorrentes - Região Pinheiros", type: "Especial", date: "15/03/2025" },
    { id: 4, title: "Relatório de Desempenho Mensal (Fevereiro)", type: "Mensal", date: "02/03/2025" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Central de Documentos</h2>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Relatórios Disponíveis</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {reports.map(r => (
            <div key={r.id} className="p-6 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{r.title}</h3>
                  <div className="flex items-center gap-3 text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12}/> Enviado em {r.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  r.type === 'Especial' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#0B1120] dark:text-slate-400 dark:border-slate-800'
                }`}>
                  {r.type}
                </span>
                <button className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
