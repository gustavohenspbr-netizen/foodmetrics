import React from "react";
import { Users, Phone, MessageCircle, Calendar, Plus, Filter, Mail } from "lucide-react";

export function ClientCRMView() {
  const leads = [
    { id: 1, name: "Confraternização Empresa X", source: "Meta Ads (Lead Form)", status: "Novo", date: "Hoje, 14:30", phone: "(11) 99999-9999" },
    { id: 2, name: "Reserva Aniversário (20 pessoas)", source: "Google Ads (Site)", status: "Em Contato", date: "Ontem, 18:45", phone: "(11) 98888-8888" },
    { id: 3, name: "Evento Corporativo - 50 pessoas", source: "Link Árvore (Instagram)", status: "Fechado", date: "08/05/2025", phone: "(11) 97777-7777" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leads e Reservas (Eventos)</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Contatos captados pelas campanhas de tráfego pago
          </p>
        </div>
        <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
          <Plus size={18} /> Cadastrar Manualmente
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Últimos Contatos Recebidos</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Filter size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0B1120]/50 border-b border-slate-100 dark:border-slate-800/50">
                <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lead / Solicitação</th>
                <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Origem</th>
                <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">{lead.name}</p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[14px] text-slate-600 dark:text-slate-300 font-medium">{lead.source}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      lead.status === "Novo" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" :
                      lead.status === "Em Contato" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" :
                      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[14px] font-bold text-slate-900 dark:text-white">{lead.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors" title="WhatsApp">
                        <MessageCircle size={16} />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors" title="Ligar">
                        <Phone size={16} />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Agendar">
                        <Calendar size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
