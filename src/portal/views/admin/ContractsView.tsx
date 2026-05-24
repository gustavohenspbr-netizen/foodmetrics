import React from "react";
import { FileSignature, Download, Eye, Plus, AlertCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { DataTable, type Column } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useContracts } from "../../lib/api";

export function ContractsView() {
  const { data: contracts = [], loading } = useContracts();

  const totalMRR = contracts.reduce((s, c: any) => s + Number(c.monthly_value ?? 0), 0);
  const today = Date.now();
  const expiringSoon = contracts.filter((c: any) => {
    if (!c.end_date) return false;
    const days = (new Date(c.end_date).getTime() - today) / 86400000;
    return days > 0 && days < 30;
  }).length;
  const pendingSign = contracts.filter((c: any) => !c.signed).length;

  const columns: Column<any>[] = [
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.client?.name ?? "?"} color={row.client?.color ?? "#888"} size="md" />
          <div>
            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{row.client?.name ?? "—"}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{row.scope}</p>
          </div>
        </div>
      ),
    },
    {
      key: "monthly_value",
      header: "Valor mensal",
      align: "right",
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(Number(row.monthly_value ?? 0))}</span>
      ),
    },
    {
      key: "start_date",
      header: "Início",
      render: (row) => <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{fmt.date(row.start_date)}</span>,
    },
    {
      key: "end_date",
      header: "Renovação",
      render: (row) => {
        if (!row.end_date) return <span className="text-slate-400">—</span>;
        const days = Math.round((new Date(row.end_date).getTime() - today) / 86400000);
        return (
          <div>
            <p className="text-[12px] font-bold text-slate-900 dark:text-white">{fmt.date(row.end_date)}</p>
            <p className={`text-[10px] font-bold ${days < 30 ? "text-amber-600" : "text-slate-500"}`}>em {days} dias</p>
          </div>
        );
      },
    },
    {
      key: "signed",
      header: "Assinatura",
      render: (row) => row.signed
        ? <Badge tone="success" dot>Assinado</Badge>
        : <Badge tone="warning" dot>Pendente</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const tone = row.status === "active" ? "success" : row.status === "expiring" ? "warning" : "danger";
        const label = row.status === "active" ? "Ativo" : row.status === "expiring" ? "Renovando" : row.status;
        return <Badge tone={tone}>{label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" icon={Eye} />
          <Button size="xs" variant="ghost" icon={Download} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Contratos</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Documentos, escopo, prazos e assinaturas
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm">Novo Contrato</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard label="MRR Total" value={fmt.currencyCompact(totalMRR)} icon={FileSignature} color="#10b981" hint={`${contracts.length} contratos ativos`} />
        <MetricCard label="Renovando em 30 dias" value={String(expiringSoon)} icon={AlertCircle} color="#f59e0b" hint="Requer atenção" />
        <MetricCard label="Aguardando assinatura" value={String(pendingSign)} icon={FileSignature} color="#3b82f6" hint="Envie pra D4Sign" />
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable
          data={contracts}
          columns={columns}
          search
          searchKeys={["scope"]}
          searchPlaceholder="Buscar contrato..."
          rowKey={(r) => r.id}
        />
      )}
    </div>
  );
}
