import React, { useState } from "react";
import { DollarSign, ArrowDownRight, FileText, ArrowUpRight, Download, Filter, Plus } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useInvoices } from "../../lib/api";
import { InvoiceModal } from "../../components/InvoiceModal";

export function FinanceView() {
  const { data: invoices = [], loading, refetch } = useInvoices();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const paid = invoices.filter((i: any) => i.status === "paid").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const overdue = invoices.filter((i: any) => i.status === "overdue").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const pending = invoices.filter((i: any) => i.status === "pending").reduce((s, i: any) => s + Number(i.amount ?? 0), 0);
  const avgTicket = invoices.length ? (paid + pending + overdue) / invoices.length : 0;

  const columns: Column<any>[] = [
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.client?.name ?? "?"} color={row.client?.color ?? "#888"} size="sm" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">{row.client?.name ?? "—"}</span>
        </div>
      ),
    },
    { key: "description", header: "Descrição",
      render: (row) => <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{row.description}</span> },
    { key: "due_date", header: "Vencimento",
      render: (row) => <span className="text-[12px] font-bold text-slate-900 dark:text-white">{fmt.date(row.due_date)}</span> },
    { key: "amount", header: "Valor", align: "right",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(Number(row.amount ?? 0))}</span> },
    { key: "payment_method", header: "Forma de PG",
      render: (row) => <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 capitalize">{row.payment_method?.replace("_", " ") || "PIX"}</span> },
    { key: "status", header: "Status",
      render: (row) => {
        const map: Record<string, "success" | "warning" | "danger"> = { paid: "success", pending: "warning", overdue: "danger" };
        const label: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };
        return <Badge tone={map[row.status] ?? "neutral"}>{label[row.status] ?? row.status}</Badge>;
      } },
    { key: "actions", header: "", sortable: false, align: "right",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          {row.url && <Button size="xs" variant="ghost" onClick={() => window.open(row.url, "_blank")}>Pagar</Button>}
          <Button size="xs" variant="ghost" icon={Download} />
        </div>
      ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Financeiro</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Receita, inadimplência e cobranças</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Filter} size="sm">Filtros</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>Nova Cobrança</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Recebido (mês)" value={fmt.currencyCompact(paid)} delta={12.5} icon={DollarSign} color="#10b981" />
        <MetricCard label="A Receber" value={fmt.currencyCompact(pending)} icon={FileText} color="#f59e0b" />
        <MetricCard label="Inadimplência" value={fmt.currencyCompact(overdue)} delta={-2.0} deltaLabel="melhor" icon={ArrowDownRight} color="#ef4444" />
        <MetricCard label="Ticket médio" value={fmt.currency(avgTicket)} delta={3.4} icon={ArrowUpRight} color="#3b82f6" />
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable
          data={invoices}
          columns={columns}
          search
          searchKeys={["description"]}
          searchPlaceholder="Buscar fatura..."
          rowKey={(r) => r.id}
        />
      )}

      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => {
          setIsModalOpen(false);
          refetch();
        }} 
      />
    </div>
  );
}
