import React from "react";
import { FileSignature, Download, Eye, Plus, AlertCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { DataTable, type Column } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { fmt } from "../../lib/format";
import { MOCK_CLIENTS } from "../../lib/mockData";

type Contract = {
  id: string;
  client: { name: string; avatar: string; color: string };
  scope: string;
  value: number;
  startDate: string;
  endDate: string;
  daysToRenew: number;
  status: "active" | "expiring" | "expired" | "draft";
  signed: boolean;
};

const CONTRACTS: Contract[] = MOCK_CLIENTS.slice(0, 6).map((c, i) => ({
  id: `ctr${i + 1}`,
  client: { name: c.restaurant, avatar: c.avatar, color: c.color },
  scope: ["Gestão de Tráfego + CRM", "Gestão de Tráfego", "Premium (Tráfego + CRM + Design)", "Setup + Consultoria"][i % 4],
  value: c.mrr,
  startDate: ["01/03/2025", "15/01/2025", "10/12/2024", "20/04/2025", "05/06/2024", "12/02/2025"][i],
  endDate: ["28/02/2026", "14/01/2026", "09/12/2025", "19/04/2026", "04/06/2025", "11/02/2026"][i],
  daysToRenew: [280, 235, 195, 332, 12, 256][i],
  status: i === 4 ? "expiring" : "active",
  signed: i !== 5,
}));

export function ContractsView() {
  const totalMRR = CONTRACTS.reduce((s, c) => s + c.value, 0);
  const expiringSoon = CONTRACTS.filter((c) => c.daysToRenew < 30).length;

  const columns: Column<Contract>[] = [
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.client.name} color={row.client.color} size="md" />
          <div>
            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{row.client.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{row.scope}</p>
          </div>
        </div>
      ),
    },
    {
      key: "value",
      header: "Valor mensal",
      align: "right",
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(row.value)}</span>
      ),
    },
    {
      key: "startDate",
      header: "Início",
      render: (row) => <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.startDate}</span>,
    },
    {
      key: "endDate",
      header: "Renovação",
      render: (row) => (
        <div>
          <p className="text-[12px] font-bold text-slate-900 dark:text-white">{row.endDate}</p>
          <p className={`text-[10px] font-bold ${row.daysToRenew < 30 ? "text-amber-600" : "text-slate-500"}`}>
            em {row.daysToRenew} dias
          </p>
        </div>
      ),
    },
    {
      key: "signed",
      header: "Assinatura",
      render: (row) =>
        row.signed ? (
          <Badge tone="success" dot>
            Assinado
          </Badge>
        ) : (
          <Badge tone="warning" dot>
            Pendente
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const tone = row.status === "active" ? "success" : row.status === "expiring" ? "warning" : "danger";
        const label =
          row.status === "active" ? "Ativo" : row.status === "expiring" ? "Renovando" : "Expirado";
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
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
            Contratos
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Documentos, escopo, prazos e assinaturas
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm">
          Novo Contrato
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          label="MRR Total"
          value={fmt.currencyCompact(totalMRR)}
          icon={FileSignature}
          color="#10b981"
          hint={`${CONTRACTS.length} contratos ativos`}
        />
        <MetricCard
          label="Renovando em 30 dias"
          value={String(expiringSoon)}
          icon={AlertCircle}
          color="#f59e0b"
          hint="Requer atenção"
        />
        <MetricCard
          label="Aguardando assinatura"
          value={String(CONTRACTS.filter((c) => !c.signed).length)}
          icon={FileSignature}
          color="#3b82f6"
          hint="Envie pra D4Sign"
        />
      </div>

      <DataTable
        data={CONTRACTS}
        columns={columns}
        search
        searchKeys={["scope"]}
        searchPlaceholder="Buscar contrato..."
        rowKey={(r) => r.id}
      />
    </div>
  );
}
