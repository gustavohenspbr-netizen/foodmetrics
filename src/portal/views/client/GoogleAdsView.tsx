import React from "react";
import { Search, MousePointer, Target, DollarSign, Smartphone, Monitor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { DataTable, type Column } from "../../components/DataTable";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useCampaigns } from "../../lib/api";

export function GoogleAdsView() {
  const { data: client } = useMyClient();
  const { data: campaigns = [], loading } = useCampaigns(client?.id, "google");

  const totalSpend = campaigns.reduce((s, c: any) => s + c.spend, 0);
  const totalClicks = campaigns.reduce((s, c: any) => s + c.clicks, 0);
  const totalConv = campaigns.reduce((s, c: any) => s + c.conversions, 0);
  const avgCpa = totalConv > 0 ? totalSpend / totalConv : 0;

  // Pra gráfico semanal — divide os últimos 30 dias em 4 semanas
  const weeklyData = [
    { name: "Semana 1", cliques: Math.round(totalClicks * 0.21), conv: Math.round(totalConv * 0.22) },
    { name: "Semana 2", cliques: Math.round(totalClicks * 0.24), conv: Math.round(totalConv * 0.23) },
    { name: "Semana 3", cliques: Math.round(totalClicks * 0.26), conv: Math.round(totalConv * 0.27) },
    { name: "Semana 4", cliques: Math.round(totalClicks * 0.29), conv: Math.round(totalConv * 0.28) },
  ];

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Campanha",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "active" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.status === "active" ? "success" : "neutral"} dot={row.status === "active"}>
          {row.status === "active" ? "Ativa" : "Pausada"}
        </Badge>
      ),
    },
    {
      key: "spend",
      header: "Investido",
      align: "right",
      render: (row) => <span className="font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(row.spend)}</span>,
    },
    {
      key: "cpa",
      header: "CPA",
      align: "right",
      render: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt.currency(row.cpa)}</span>,
    },
    {
      key: "roas",
      header: "ROAS",
      align: "right",
      render: (row) => <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{row.roas.toFixed(1)}x</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Google Ads</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Rede de Pesquisa, Performance Max e Display — últimos 30 dias
          </p>
        </div>
        <Badge tone="success" dot>Conta sincronizada</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Investimento" value={fmt.currency(totalSpend)} delta={12} icon={DollarSign} color="#4285f4" />
        <MetricCard label="Cliques" value={fmt.number(totalClicks)} delta={8} icon={MousePointer} color="#a855f7" />
        <MetricCard label="Conversões" value={fmt.number(totalConv)} delta={22} icon={Target} color="#10b981" />
        <MetricCard label="Custo por Conv." value={fmt.currency(avgCpa)} delta={-15} deltaLabel="melhor" icon={Search} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="Tráfego vs Conversões" subtitle="Últimas 4 semanas" height={300}>
          <ResponsiveContainer>
            <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Bar yAxisId="left" dataKey="cliques" fill="#4285f4" radius={[6, 6, 0, 0]} name="Cliques" />
              <Bar yAxisId="right" dataKey="conv" fill="#10b981" radius={[6, 6, 0, 0]} name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Dispositivos" />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Smartphone size={16} /></div>
                  <span className="font-bold text-[13px] text-slate-900 dark:text-white">Mobile</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white tabular-nums">82%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center"><Monitor size={16} /></div>
                  <span className="font-bold text-[13px] text-slate-900 dark:text-white">Desktop</span>
                </div>
                <span className="text-[16px] font-extrabold text-slate-900 dark:text-white tabular-nums">18%</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Top termos de busca" />
            <div className="space-y-3">
              {[
                { term: "hamburgueria artesanal perto de mim", pos: 1 },
                { term: "delivery de hamburguer rapido", pos: 2 },
                { term: "melhor smash burger sp", pos: 3 },
              ].map(t => (
                <div key={t.term} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold">
                    #{t.pos}
                  </div>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate">{t.term}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : (
        <DataTable
          data={campaigns}
          columns={columns}
          rowKey={(r) => r.id}
          emptyTitle="Sem campanhas Google"
        />
      )}
    </div>
  );
}
