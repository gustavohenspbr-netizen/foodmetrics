import React from "react";
import { Heart, Eye, Target, DollarSign, Image as ImageIcon, Film } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConnectAccount } from "../../components/ConnectAccount";
import { fmt } from "../../lib/format";
import { useMyClient, useCampaigns, useIntegration } from "../../lib/api";

export function MetaAdsView() {
  const { data: client } = useMyClient();
  const { data: integration } = useIntegration(client?.id, "meta_ads");
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
          {row.name.toLowerCase().includes("reels") ? <Film size={14} className="text-pink-500" /> : <ImageIcon size={14} className="text-blue-500" />}
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
            Performance no Facebook + Instagram (Feed, Stories, Reels)
          </p>
        </div>
      </div>

      <ConnectAccount
        clientId={client?.id}
        provider="meta_ads"
        brandColor="#1877f2"
        title="Meta Ads (Facebook + Instagram)"
        description="Cole o Ad Account ID (ex: act_123456789) e um Access Token de longa duração com permissão ads_read. O Pixel ID é opcional mas recomendado para tracking de conversões."
        fields={[
          { key: "account_id", label: "Ad Account ID", hint: "Formato act_NNNNNNNNN", required: true },
          { key: "account_name", label: "Nome da conta de anúncios" },
          { key: "pixel_id", label: "Pixel ID", hint: "Opcional — para eventos de conversão" },
          { key: "access_token", label: "Access Token", type: "password", hint: "Token de longa duração (60d+)" },
        ]}
      />

      {!integration && (
        <EmptyState
          icon={Heart}
          title="Conecte sua conta para ver os dados"
          description="Depois de conectar acima, suas campanhas e métricas aparecerão automaticamente."
        />
      )}

      {integration && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard label="Investimento" value={fmt.currency(totalSpend)} icon={DollarSign} color="#1877f2" hint="Últimos 30 dias" />
            <MetricCard label="Alcance" value={fmt.numberCompact(totalReach)} icon={Eye} color="#e4405f" hint="Pessoas únicas" />
            <MetricCard label="CTR Médio" value={`${avgCtr.toFixed(1)}%`} icon={Heart} color="#a855f7" />
            <MetricCard label="Conversões" value={fmt.number(totalConv)} icon={Target} color="#10b981" />
          </div>

          {loading ? <Skeleton className="h-64 w-full" /> : (
            <DataTable
              data={campaigns}
              columns={columns}
              rowKey={(r) => r.id}
              emptyTitle="Nenhuma campanha sincronizada ainda"
              emptyDescription="As campanhas Meta aparecerão aqui após o próximo sync."
            />
          )}
        </>
      )}
    </div>
  );
}
