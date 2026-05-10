import React from "react";
import { Plus, MoreHorizontal, DollarSign } from "lucide-react";
import { MOCK_CRM_LEADS } from "../../lib/mockData";

const COLUMNS = [
  { id: "lead", title: "Novos Leads", color: "bg-blue-500" },
  { id: "contacted", title: "Em Contato", color: "bg-amber-500" },
  { id: "proposal", title: "Proposta Enviada", color: "bg-purple-500" },
  { id: "negotiation", title: "Em Negociação", color: "bg-pink-500" },
  { id: "won", title: "Fechado (Ganho)", color: "bg-emerald-500" },
];

export function CRMView() {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pipeline de Vendas</h2>
        <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
          <Plus size={18} /> Novo Negócio
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map(col => {
          const colLeads = MOCK_CRM_LEADS.filter(l => l.status === col.id);
          const colValue = colLeads.reduce((acc, l) => acc + l.value, 0);

          return (
            <div key={col.id} className="min-w-[320px] w-[320px] max-h-full flex flex-col bg-[#F1F5F9] dark:bg-[#0B1120] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 snap-start">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between sticky top-0 bg-[#F1F5F9] dark:bg-[#0B1120] rounded-t-2xl z-10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                  <h3 className="font-bold text-[14px] text-slate-900 dark:text-white">{col.title}</h3>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="px-4 py-2 bg-slate-50 dark:bg-[#0F172A]/50 border-b border-slate-200 dark:border-slate-800/60">
                <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
                  Est. R$ {colValue.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {colLeads.map(lead => (
                  <div key={lead.id} className="bg-white dark:bg-[#0F172A] rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {lead.date}
                      </span>
                      <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold text-[14px] text-slate-900 dark:text-white leading-tight mb-3">
                      {lead.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                      <DollarSign size={14} /> {lead.value.toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
