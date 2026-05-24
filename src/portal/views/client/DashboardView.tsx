import React from "react";
import {
  TrendingUp, DollarSign, Target, Star, ShoppingBag,
  AlertTriangle, ArrowUpRight, Sparkles, Calendar, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import {
  useMyClient, useMonthlyMetrics, useIfoodSummary,
  useCampaigns, useGoals, useInitiatives, useRecommendations,
} from "../../lib/api";

export function DashboardView() {
  const { data: client } = useMyClient();
  const cid = client?.id;
  const { data: monthly = [], loading: lMonthly } = useMonthlyMetrics(cid);
  const { data: ifoodSummary } = useIfoodSummary(cid);
  const { data: googleCampaigns = [] } = useCampaigns(cid, "google");
  const { data: goals = [] } = useGoals(cid);
  const { data: initiatives = [] } = useInitiatives(cid);
  const { data: recommendations = [] } = useRecommendations(cid);

  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const totalRevenue = last?.revenue ?? 0;
  const totalSpend = (last?.google ?? 0) + (last?.meta ?? 0);
  const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : "0";
  const revenueGrowth = prev?.revenue ? (((last?.revenue ?? 0) - prev.revenue) / prev.revenue) * 100 : 0;
  const monthGoal = goals[0];
  const topCampaigns = [...googleCampaigns].sort((a, b) => b.roas - a.roas).slice(0, 3);

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1a2238] dark:from-[#0F172A] dark:to-[#0a0f1c] border-slate-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e01c1c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-[#ff8732]/10 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[280px]">
            <Badge tone="orange" size="md" dot>
              <Sparkles size={11} className="mr-0.5" /> {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </Badge>
            <h2 className="text-white text-4xl font-extrabold tracking-tight mt-4 leading-tight">
              Você faturou{" "}
              {lMonthly ? <Skeleton className="inline-block w-40 h-10" /> : (
                <span className="bg-gradient-to-r from-[#ff8732] to-[#ffba8c] bg-clip-text text-transparent">
                  {fmt.currency(totalRevenue)}
                </span>
              )}
            </h2>
            <p className="text-slate-300 text-base font-medium mt-2 max-w-xl">
              via marketing este mês — <span className={`font-bold ${revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>{revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</span> em relação ao mês anterior. ROAS médio em <span className="text-white font-bold">{avgRoas}x</span>.
            </p>
            {monthGoal && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Meta do mês</span>
                  <span className="text-[13px] text-white font-bold">
                    {fmt.currencyCompact(Number(monthGoal.current))} / {fmt.currencyCompact(Number(monthGoal.target))}
                  </span>
                </div>
                <ProgressBar value={Number(monthGoal.current)} max={Number(monthGoal.target)} tone="brand" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" icon={Calendar}>Agendar call</Button>
            <Button variant="outline" iconRight={ArrowUpRight} className="bg-white/5 border-white/20 text-white hover:bg-white/10">Último relatório</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Faturamento iFood" value={fmt.currencyCompact(ifoodSummary?.revenue.month ?? 0)} delta={18.4} icon={DollarSign} color="#e01c1c" />
        <MetricCard label="Investimento em Ads" value={fmt.currencyCompact(totalSpend)} delta={8.2} icon={Target} color="#ff8732" />
        <MetricCard label="ROAS Médio" value={`${avgRoas}x`} delta={5.1} icon={TrendingUp} color="#10b981" />
        <MetricCard label="Avaliação iFood" value={(ifoodSummary?.rating ?? 0).toFixed(1)} delta={0.1} deltaLabel="estável" icon={Star} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="Investimento vs Faturamento" subtitle="Últimos 5 meses" height={300}>
          <ResponsiveContainer>
            <AreaChart data={monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01c1c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01c1c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8732" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff8732" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
              <XAxis dataKey="month" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 12, fontWeight: 600 }} formatter={(v: number) => fmt.currency(v)} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 10 }} />
              <Area type="monotone" dataKey="revenue" name="Faturamento" stroke="#e01c1c" strokeWidth={2.5} fill="url(#revenue)" />
              <Area type="monotone" dataKey="google" name="Google" stroke="#ff8732" strokeWidth={2.5} fill="url(#spend)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader title="Recomendações" subtitle="Da sua equipe pra você" action={<Badge tone="brand" dot>{recommendations.length} ativas</Badge>} />
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-slate-400 text-[13px] text-center py-4 font-medium">Tudo certo por aqui!</p>
            ) : recommendations.slice(0, 3).map((r: any) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  r.priority === "high" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  {r.priority === "high" ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
                </div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug font-medium">{r.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Top Campanhas" subtitle="Melhor performance esta semana" action={<Button variant="ghost" size="sm" iconRight={ArrowUpRight}>Ver todas</Button>} />
          <div className="space-y-3">
            {topCampaigns.length === 0 ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-medium">Sem campanhas ainda.</p>
            ) : topCampaigns.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4285f4]/20 to-[#34a853]/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={16} className="text-[#4285f4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge tone={c.status === "active" ? "success" : "neutral"} size="sm">{c.status === "active" ? "Ativa" : "Pausada"}</Badge>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ROAS {c.roas.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{fmt.currency(c.spend)}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{c.conversions} conv.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Próximas ações da equipe" subtitle="O que a FoodMetrics está fazendo por você" />
          <div className="space-y-4">
            {initiatives.length === 0 ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-medium">Sem iniciativas ativas.</p>
            ) : initiatives.slice(0, 4).map((init: any) => (
              <div key={init.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  init.status === "in_progress" ? "bg-amber-500 animate-pulse" :
                  init.status === "scheduled" ? "bg-blue-500" : "bg-slate-300"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{init.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{init.owner_name ?? "—"}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Prazo {init.deadline ? fmt.date(init.deadline) : "—"}</span>
                  </div>
                </div>
                <Badge tone={init.status === "in_progress" ? "warning" : init.status === "scheduled" ? "info" : "neutral"} size="sm">
                  {init.status === "in_progress" ? "Em andamento" : init.status === "scheduled" ? "Agendado" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
