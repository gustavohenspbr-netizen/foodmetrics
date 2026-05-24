import React, { useEffect, useState } from "react";
import { Filter, Pause, Play, AlertTriangle, Settings2 } from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs } from "../../components/ui/Tabs";
import { Skeleton } from "../../components/ui/Skeleton";
import { MetricCard } from "../../components/MetricCard";
import { fmt } from "../../lib/format";
import { supabase } from "../../lib/supabase";

type Row = {
  id: string;
  client: { name: string; color: string; avatar: string };
  name: string;
  channel: "google" | "meta";
  status: string;
  spend: number;
  conversions: number;
  cpa: number;
  alert: boolean;
};

export function TrafficView() {
  const [filter, setFilter] = useState("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: campaigns }, { data: metrics }] = await Promise.all([
        supabase.from("campaigns").select("*, client:clients(name, color, avatar)"),
        supabase.from("metrics_daily")
          .select("campaign_id, spend, conversions")
          .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
      ]);
      const result: Row[] = (campaigns ?? []).map((c: any) => {
        const m = (metrics ?? []).filter((x: any) => x.campaign_id === c.id);
        const spend = m.reduce((s, x: any) => s + Number(x.spend ?? 0), 0);
        const conversions = m.reduce((s, x: any) => s + Number(x.conversions ?? 0), 0);
        const cpa = conversions > 0 ? spend / conversions : 0;
        return {
          id: c.id,
          client: c.client ?? { name: "—", color: "#888", avatar: "?" },
          name: c.name,
          channel: c.channel,
          status: c.status === "active" ? "Ativa" : c.status === "paused" ? "Pausada" : c.status,
          spend, conversions, cpa,
          alert: cpa > (c.channel === "google" ? 10 : 6),
        };
      });
      setRows(result);
      setLoading(false);
    })();
  }, []);

  const tabs = [
    { id: "all", label: "Todas", count: rows.length },
    { id: "google", label: "Google", count: rows.filter((r) => r.channel === "google").length },
    { id: "meta", label: "Meta", count: rows.filter((r) => r.channel === "meta").length },
    { id: "alerts", label: "Atenção", count: rows.filter((r) => r.alert).length },
  ];

  const data = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "alerts") return r.alert;
    return r.channel === filter;
  });

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalConv = rows.reduce((s, r) => s + r.conversions, 0);
  const totalAlerts = rows.filter((r) => r.alert).length;
  const avgCpa = totalConv > 0 ? totalSpend / totalConv : 0;

  const columns: Column<Row>[] = [
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
          <Badge tone={row.channel === "google" ? "info" : "brand"} size="sm">
            {row.channel === "google" ? "Google" : "Meta"}
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
      render: (row) => row.alert ? <Badge tone="danger" size="sm" dot>CPA alto</Badge> : null,
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
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Operação de Tráfego</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Comando central — todas as campanhas de todos os clientes
          </p>
        </div>
        <Button variant="outline" icon={Filter} size="sm">Período</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Verba ativa" value={fmt.currencyCompact(totalSpend)} delta={8.4} icon={Settings2} color="#e01c1c" />
        <MetricCard label="Conversões" value={fmt.number(totalConv)} delta={12.6} icon={Play} color="#10b981" />
        <MetricCard label="CPA médio" value={fmt.currency(avgCpa)} delta={-3.2} deltaLabel="melhor" icon={Pause} color="#ff8732" />
        <MetricCard label="Alertas ativos" value={String(totalAlerts)} deltaLabel={totalAlerts ? "Precisa atenção" : "Tudo OK"} icon={AlertTriangle} color={totalAlerts ? "#ef4444" : "#10b981"} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          search
          searchKeys={["name"]}
          searchPlaceholder="Buscar campanha..."
          rowKey={(r) => r.id}
          pageSize={10}
        />
      )}
    </div>
  );
}
