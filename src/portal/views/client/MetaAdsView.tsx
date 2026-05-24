import React from "react";
import { Heart, Eye, Target, DollarSign, Image as ImageIcon, Film } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { DataTable, type Column } from "../../components/DataTable";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useCampaigns } from "../../lib/api";

export function MetaAdsView() {
  const { data: client } = useMyClient();
  const { data: campaigns = [], loading } = useCampaigns(client?.id, "meta");

  const totalSpend = campaigns.reduce((s, c: any) => s + c.spend, 0);
  const totalReach = campaigns.reduce((s, c: any) => s + c.reach, 0);
  const totalConv = campaigns.reduce((s, c: any) => s + c.conversions, 0);
  const avgCtr = campaigns.length ? campaigns.reduce((s, c: any) => s + c.ctr, 0) / campaigns.length : 0;

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Campanha",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.name.toLowerCase().includes("reels") ? (
            <Film size={14} className="text-pink-500" />
          ) : (
            <ImageIcon size={14} className="text-blue-500" />
          )}
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    { key: "status", header: "Status",
      render: (row) => <Badge tone={row.status === "active" ? "success" : "neutral"} dot={row.status === "active"}>{row.status === "active" ? "Ativa" : "Pausada"}</Badge> },
    { key: "spend", header: "Investido", align: "right",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(row.spend)}</span> },
    { key: "reach", header: "Alcance", align: "right",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.numberCompact(row.reach)}</span> },
    { key: "ctr", header: "CTR", align: "right",
      render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{row.ctr.toFixed(2)}%</span> },
    { key: "conversions", header: "Conv.", align: "right",
      render: (row) => <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{row.conversions}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Meta Ads</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Facebook + Instagram — Feed, Stories, Reels
          </p>
        </div>
        <Badge tone="success" dot>Conta sincronizada</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Investimento" value={fmt.currency(totalSpend)} delta={9.5} icon={DollarSign} color="#1877f2" />
        <MetricCard label="Alcance" value={fmt.numberCompact(totalReach)} delta={18.4} icon={Eye} color="#e4405f" />
        <MetricCard label="CTR Médio" value={`${avgCtr.toFixed(1)}%`} delta={4.2} icon={Heart} color="#a855f7" />
        <MetricCard label="Conversões" value={fmt.number(totalConv)} delta={26} icon={Target} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Reels com melhor performance" subtitle="Ordem por CTR" />
          <div className="space-y-3">
            {[
              { title: "Bastidores da cozinha — Whopper sendo montado", views: "220k", ctr: "5.4%" },
              { title: "Cliente reagindo ao Stacker Quádruplo", views: "184k", ctr: "5.1%" },
              { title: "Top 5 combos mais pedidos da semana", views: "142k", ctr: "4.8%" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/60 dark:border-slate-800/60">
                <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Film size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{r.views} views</p>
                </div>
                <Badge tone="success">CTR {r.ctr}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Públicos salvos" />
          <div className="space-y-3">
            {[
              { name: "Compradores Últimos 30d", size: "4.2k" },
              { name: "Visitantes Site Sem Compra", size: "12k" },
              { name: "Lookalike 1% (Top Clientes)", size: "180k" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{a.name}</span>
                <Badge tone="brand">{a.size}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : (
        <DataTable data={campaigns} columns={columns} rowKey={(r) => r.id} emptyTitle="Sem campanhas Meta" />
      )}
    </div>
  );
}
