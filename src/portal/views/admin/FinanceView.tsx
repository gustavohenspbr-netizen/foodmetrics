import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Download, Filter, FileText } from "lucide-react";
import { MOCK_FINANCE_INVOICES } from "../../lib/mockData";
import { MetricCard } from "../../components/MetricCard";

export function FinanceView() {
  const mrr = 85400;
  const growth = 12.5;
  const overdue = MOCK_FINANCE_INVOICES.filter(i => i.status === "overdue").reduce((a, b) => a + b.amount, 0);
  const pending = MOCK_FINANCE_INVOICES.filter(i => i.status === "pending").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visão Financeira (Agência)</h2>
        <div className="flex gap-3">
          <button className="h-[46px] px-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-bold text-[13px]">
            <Download size={16} /> Exportar
          </button>
          <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
            Nova Cobrança
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="MRR (Receita Mensal)" value={`R$ ${mrr.toLocaleString("pt-BR")}`} sub={`+${growth}% vs mês ant.`} up icon={DollarSign} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <MetricCard label="Inadimplência" value={`R$ ${overdue.toLocaleString("pt-BR")}`} sub="-2% vs mês ant." up icon={ArrowDownRight} color="text-red-600 dark:text-red-400" bg="bg-red-50 dark:bg-red-500/10" />
        <MetricCard label="A Receber (Mês)" value={`R$ ${pending.toLocaleString("pt-BR")}`} icon={FileText} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
        <MetricCard label="Ticket Médio" value="R$ 4.520" sub="+R$ 350 vs mês ant." up icon={ArrowUpRight} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Controle de Faturas</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Filter size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0B1120]/50 border-b border-slate-100 dark:border-slate-800/50">
                {["Cliente", "Descrição", "Vencimento", "Valor", "Status", "Ações"].map(h => (
                  <th key={h} className="px-8 py-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {MOCK_FINANCE_INVOICES.map(inv => (
                <tr key={inv.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{inv.client}</p>
                  </td>
                  <td className="px-8 py-5 text-[14px] text-slate-600 dark:text-slate-300 font-medium">{inv.description}</td>
                  <td className="px-8 py-5 text-[14px] font-bold text-slate-900 dark:text-white">{inv.dueDate}</td>
                  <td className="px-8 py-5 text-[15px] font-bold text-slate-900 dark:text-white">R$ {inv.amount.toLocaleString("pt-BR")}</td>
                  <td className="px-8 py-5">
                    {inv.status === "paid" && <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Pago</span>}
                    {inv.status === "pending" && <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">Pendente</span>}
                    {inv.status === "overdue" && <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">Atrasado</span>}
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-[13px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Ver Recibo
                    </button>
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
