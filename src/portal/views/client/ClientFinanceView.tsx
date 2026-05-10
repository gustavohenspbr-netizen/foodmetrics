import React from "react";
import { Download, CreditCard, DollarSign } from "lucide-react";

export function ClientFinanceView() {
  const invoices = [
    { id: "INV-2025-05", date: "10/05/2025", description: "Mensalidade Gestão de Tráfego", amount: 1500, status: "Aberto" },
    { id: "INV-2025-04", date: "10/04/2025", description: "Mensalidade Gestão de Tráfego", amount: 1500, status: "Pago" },
    { id: "INV-2025-03", date: "10/03/2025", description: "Mensalidade Gestão de Tráfego + Setup", amount: 2500, status: "Pago" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financeiro da Agência</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Fatura Atual (Maio)</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Vence em 10/05/2025</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ 1.500<span className="text-lg text-slate-400 font-bold">,00</span></p>
            <button className="px-6 py-2.5 rounded-xl bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
              Pagar Fatura
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de Faturas</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {invoices.map(inv => (
            <div key={inv.id} className="p-6 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{inv.description}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{inv.id} • Vencimento: {inv.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-slate-900 dark:text-white">R$ {inv.amount.toLocaleString('pt-BR')}</span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  inv.status === 'Pago' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                }`}>
                  {inv.status}
                </span>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-[13px] font-bold flex items-center gap-1.5">
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
