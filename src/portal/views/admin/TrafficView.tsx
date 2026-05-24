import React, { useState } from "react";
import { Filter, Pause, Play, AlertTriangle, Settings2 } from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { MetricCard } from "../../components/MetricCard";
import { fmt } from "../../lib/format";
import { MOCK_CLIENTS, MOCK_GOOGLE_CAMPAIGNS, MOCK_META_CAMPAIGNS } from "../../lib/mockData";

type CrossCampaign = {
  id: string;
  client: { name: string; color: string; avatar: string };
  name: string;
  channel: "Google" | "Meta";
  status: string;
  spend: number;
  conversions: number;
  roas?: number;
  cpa: number;
  alert: boolean;
};

const ALL_CAMPAIGNS: CrossCampaign[] = [
  ...MOCK_GOOGLE_CAMPAIGNS.flatMap((c, i) => {
    const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
    return [
      {
        id: `${c.id}-${client.id}`,
        client: { name: client.restaurant, color: client.color, avatar: client.avatar },
        name: c.name,
        channel: "Google" as const,
        status: c.status,
        spend: c.spend,
        conversions: c.conversions,
        roas: c.roas,
        cpa: c.cpa,
        alert: c.cpa > 10,
      },
    ];
  }),
  ...MOCK_META_CAMPAIGNS.flatMap((c, i) => {
    const client = MOCK_CLIENTS[(i + 2) % MOCK_CLIENTS.length];
    return [
      {
        id: `${c.id}-${client.id}`,
        client: { name: client.restaurant, color: client.color, avatar: client.avatar },
        name: c.name,
        channel: "Meta" as const,
        status: c.status,
        spend: c.spend,
        conversions: c.conversions,
        cpa: c.cpa,
        alert: c.cpa > 6,
      },
    ];
  }),
];

export function TrafficView() {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "Todas", count: ALL_CAMPAIGNS.length },
    { id: "google", label: "Google", count: ALL_CAMPAIGNS.filter((c) => c.channel === "Google").length },
    { id: "meta", label: "Meta", count: ALL_CAMPAIGNS.filter((c) => c.channel === "Meta").length },
    { id: "alerts", label: "Atenção", count: ALL_CAMPAIGNS.filter((c) => c.alert).length },
  ];

  const data = ALL_CAMPAIGNS.filter((c) => {
    if (filter === "all") return true;
    if (filter === "alerts") return c.alert;
    return c.channel.toLowerCase() === filter;
  });

  const totalSpend = ALL_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalConv = ALL_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const totalAlerts = ALL_CAMPAIGNS.filter((c) => c.alert).length;
  const avgCpa = totalSpend / totalConv;

  const columns: Column<CrossCampaign>[] = [
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.client.name} color={row.client.color} size="sm" />
          <span className="text-[12px] font-bold text-slate-900 dark:text-white">{row.client.name}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: "Campanha",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge tone={row.channel === "Google" ? "info" : "brand"} size="sm">
            {row.channel}
          </Badge>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{row.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.status === "Ativa" ? "success" : "neutral"} dot={row.status === "Ativa"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "spend",
      header: "Gasto",
      align: "right",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(row.spend)}</span>,
    },
    {
      key: "conversions",
      header: "Conv.",
      align: "right",
      render: (row) => <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{row.conversions}</span>,
    },
    {
      key: "cpa",
      header: "CPA",
      align: "right",
      render: (row) => (
        <span className={`font-bold tabular-nums ${row.alert ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
          {fmt.currency(row.cpa)}
        </span>
      ),
    },
    {
      key: "alert",
      header: "Alerta",
      align: "center",
      render: (row) =>
        row.alert ? (
          <Badge tone="danger" size="sm" dot>
            CPA alto
          </Badge>
        ) : null,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" icon={row.status === "Ativa" ? Pause : Play} />
          <Button size="xs" variant="ghost" icon={Settings2} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
            Operação de Tráfego
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Comando central — todas as campanhas de todos os clientes
          </p>
        </div>
        <Button variant="outline" icon={Filter} size="sm">
          Período
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Verba ativa" value={fmt.currencyCompact(totalSpend)} delta={8.4} icon={Settings2} color="#e01c1c" spark={[14, 16, 17, 18, 19, 20, 22]} />
        <MetricCard label="Conversões" value={fmt.number(totalConv)} delta={12.6} icon={Play} color="#10b981" spark={[2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0]} />
        <MetricCard label="CPA médio" value={fmt.currency(avgCpa)} delta={-3.2} deltaLabel="melhor" icon={Pause} color="#ff8732" spark={[6.2, 6.0, 5.8, 5.6, 5.4, 5.3, 5.2]} />
        <MetricCard label="Alertas ativos" value={String(totalAlerts)} deltaLabel={totalAlerts ? "Precisa atenção" : "Tudo OK"} icon={AlertTriangle} color={totalAlerts ? "#ef4444" : "#10b981"} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      <DataTable
        data={data}
        columns={columns}
        search
        searchKeys={["name"]}
        searchPlaceholder="Buscar campanha..."
        rowKey={(r) => r.id}
        pageSize={10}
      />
    </div>
  );
}
