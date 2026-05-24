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
        description="Cole o Ad Account ID e um Access Token de longa duração com permissão ads_read. O Pixel ID é opcional."
        fields={[
          { key: "account_id", label: "Ad Account ID", hint: "Formato act_NNNNNNNNN", required: true },
          { key: "account_name", label: "Nome da conta de anúncios" },
          { key: "pixel_id", label: "Pixel ID", hint: "Opcional — para eventos de conversão" },
          { key: "access_token", label: "Access Token", type: "password", hint: "Token de longa duração (60d+)" },
        ]}
        quickActions={[
          { url: "https://business.facebook.com/settings/ad-accounts", label: "Abrir Meta Business", description: "Lista de Contas de Anúncios" },
          { url: "https://developers.facebook.com/tools/explorer/", label: "Graph API Explorer", description: "Gerar Access Token aqui" },
        ]}
        tutorial={[
          {
            title: "Pegar o Ad Account ID",
            description: <>Abra o <strong>Meta Business Manager</strong> → Configurações → <strong>Contas de Anúncios</strong>. Cada conta tem um ID no formato <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">act_123456789012</code>. Copie o da conta certa.</>,
            link: { url: "https://business.facebook.com/settings/ad-accounts", label: "Meta Business — Contas" },
          },
          {
            title: "(Opcional) Pegar o Pixel ID",
            description: <>No <strong>Meta Business</strong>, vá em <strong>Gerenciador de Eventos</strong>. Clique no seu Pixel → o ID aparece embaixo do nome (formato numérico de 15 dígitos).</>,
            link: { url: "https://business.facebook.com/events_manager2", label: "Gerenciador de Eventos" },
          },
          {
            title: "Gerar Access Token via Graph API Explorer",
            description: <>Abra o <strong>Graph API Explorer</strong>. No dropdown <strong>"Meta App"</strong>, escolha um app seu (ou crie um novo grátis). Em <strong>"Permissions"</strong> adicione <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">ads_read</code> e <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">ads_management</code>. Clique <strong>"Generate Access Token"</strong> e copie.</>,
            link: { url: "https://developers.facebook.com/tools/explorer/", label: "Graph API Explorer" },
          },
          {
            title: "Estender pra Token Longa Duração",
            description: <>O token do Graph Explorer dura 1h. Pra ter validade de 60 dias, use a ferramenta de extensão (link abaixo): cole seu App ID + App Secret + Token curto → ela retorna um token de longa duração. <strong>Cole esse longo aqui no painel.</strong></>,
            link: { url: "https://developers.facebook.com/tools/debug/accesstoken/", label: "Access Token Debugger" },
          },
        ]}
        oauthNote="Conexão 1-clique via Login do Facebook requer app Meta com revisão de permissões aprovada. Por ora, o método manual via Graph Explorer funciona e é o oficial."
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
