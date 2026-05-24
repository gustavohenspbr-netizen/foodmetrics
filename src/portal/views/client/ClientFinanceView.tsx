import React from "react";
import { Download, CreditCard, DollarSign, FileText } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { MetricCard } from "../../components/MetricCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { fmt } from "../../lib/format";
import { useMyClient, useInvoices } from "../../lib/api";

export function ClientFinanceView() {
  const { data: client } = useMyClient();
  const { data: invoices = [], loading } = useInvoices(client?.id);

  const totalPaid = invoices.filter((i: any) => i.status === "paid").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const pending = invoices.filter((i: any) => i.status === "pending").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Financeiro</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Suas faturas e comprovantes da Food Métricas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard label="Pago (acumulado)" value={fmt.currencyCompact(totalPaid)} icon={DollarSign} color="#10b981" />
        <MetricCard label="A pagar" value={fmt.currencyCompact(pending)} icon={FileText} color="#f59e0b" />
        <MetricCard label="Método" value="PIX" hint="Forma cadastrada" icon={CreditCard} color="#3b82f6" />
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : invoices.length === 0 ? (
          <EmptyState icon={FileText} title="Sem faturas ainda" />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {invoices.map((inv: any) => {
              const tones: Record<string, "success" | "warning" | "danger"> = { paid: "success", pending: "warning", overdue: "danger" };
              const labels: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };
              return (
                <div key={inv.id} className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors flex items-center gap-4 flex-wrap">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{inv.description}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      Vencimento: {fmt.date(inv.due_date)}
                    </p>
                  </div>
                  <span className="text-[15px] font-extrabold text-slate-900 dark:text-white tabular-nums">{fmt.currency(Number(inv.amount ?? 0))}</span>
                  <Badge tone={tones[inv.status] ?? "neutral"}>{labels[inv.status] ?? inv.status}</Badge>
                  <Button size="sm" variant="outline" icon={Download}>Recibo</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
