import React from "react";
import { Users, DollarSign, TrendingDown, Activity, ArrowUpRight, Sparkles, Plus } from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import {
  useAdminOverview,
  useClientsWithManager,
  useClientsByState,
  useTeam,
  useEvents,
} from "../../lib/api";

export function DashboardView() {
  const { data: overview, loading: lOverview } = useAdminOverview();
  const { data: clients = [], loading: lClients } = useClientsWithManager();
  const { data: byState = [], loading: lByState } = useClientsByState();
  const { data: team = [], loading: lTeam } = useTeam();
  const { data: events = [], loading: lEvents } = useEvents();

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const atRisk = (clients ?? []).filter((c: any) => c.health_score < 70);
  const hasClients = (clients?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1a2238] dark:from-[#0F172A] dark:to-[#0a0f1c] border-slate-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e01c1c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-[#ff8732]/10 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[280px]">
            <Badge tone="orange" size="md" dot>
              <Sparkles size={11} className="mr-0.5" />
              {today}
            </Badge>
            {hasClients ? (
              <>
                <h2 className="text-white text-4xl font-extrabold tracking-tight mt-4 leading-tight">
                  MRR de{" "}
                  {lOverview ? <Skeleton className="inline-block w-32 h-10" /> : (
                    <span className="bg-gradient-to-r from-[#ff8732] to-[#ffba8c] bg-clip-text text-transparent">
                      {fmt.currencyCompact(overview?.mrr ?? 0)}
                    </span>
                  )}
                </h2>
                <p className="text-slate-300 text-base font-medium mt-2 max-w-2xl">
                  <span className="text-white font-bold">{overview?.activeClients ?? 0} clientes ativos</span> · você gerencia{" "}
                  <span className="text-white font-bold">{fmt.currencyCompact(overview?.totalManaged ?? 0)}</span> em
                  investimento mensal para seus clientes.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white text-4xl font-extrabold tracking-tight mt-4 leading-tight">
                  Bem-vindo ao painel{" "}
                  <span className="bg-gradient-to-r from-[#ff8732] to-[#ffba8c] bg-clip-text text-transparent">FoodMetrics</span>
                </h2>
                <p className="text-slate-300 text-base font-medium mt-2 max-w-2xl">
                  Comece adicionando seu primeiro cliente. Daqui você acompanha MRR, churn, equipe, financeiro e a operação de tráfego de todos os restaurantes.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" icon={Plus}>
              Adicionar cliente
            </Button>
            <Button
              variant="outline"
              iconRight={ArrowUpRight}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Ver pipeline
            </Button>
          </div>
        </div>
      </Card>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="MRR" value={fmt.currencyCompact(overview?.mrr ?? 0)} icon={DollarSign} color="#10b981" hint="Receita mensal recorrente" />
        <MetricCard label="Clientes Ativos" value={overview?.activeClients ?? 0} icon={Users} color="#e01c1c" hint={`${overview?.pendingClients ?? 0} pendentes`} />
        <MetricCard label="Verba Gerenciada" value={fmt.currencyCompact(overview?.totalManaged ?? 0)} icon={Activity} color="#ff8732" hint="Soma Google + Meta (mês)" />
        <MetricCard label="Em risco" value={String(atRisk.length)} icon={TrendingDown} color={atRisk.length > 0 ? "#ef4444" : "#10b981"} hint="Health < 70" />
      </div>

      {/* CHART — só Clientes por Estado quando há dados reais */}
      {hasClients && (
        <ChartCard title="Clientes por Estado" subtitle="Distribuição geográfica" height={300}>
          {lByState ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={byState ?? []} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" horizontal={false} />
                <XAxis type="number" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
                <YAxis dataKey="state" type="category" stroke="currentColor" className="text-slate-500 text-xs font-bold" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 12, fontWeight: 600 }} />
                <Bar dataKey="count" fill="#ff8732" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* HEALTH SCORE + EQUIPE + AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Clientes em risco"
            subtitle="Health Score abaixo de 70"
            action={<Badge tone="danger" dot>{atRisk.length}</Badge>}
          />
          <div className="space-y-3.5">
            {lClients ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)
            ) : atRisk.length === 0 ? (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center py-6 font-medium">
                Todos os clientes saudáveis 🎉
              </p>
            ) : (
              atRisk.map((c: any) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar name={c.name} color={c.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={c.health_score}
                        tone={c.health_score < 50 ? "danger" : c.health_score < 70 ? "warning" : "success"}
                        size="sm"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Health {c.health_score}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{c.manager_name ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Equipe"
            subtitle={lTeam ? "..." : `${team.length} membros`}
            action={<Button variant="ghost" size="sm" iconRight={ArrowUpRight}>Ver tudo</Button>}
          />
          <div className="space-y-3">
            {lTeam ? (
              [1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              team.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.full_name ?? m.email} color={m.role === 'admin' ? '#0F172A' : m.role === 'manager' ? '#e01c1c' : '#10b981'} size="md" status="online" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{m.full_name ?? m.email}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold capitalize">{m.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Próximos eventos"
            subtitle="Hoje e amanhã"
            action={<Button variant="ghost" size="sm" iconRight={ArrowUpRight}>Agenda</Button>}
          />
          <div className="space-y-3">
            {lEvents ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)
            ) : events.length === 0 ? (
              <p className="text-[13px] text-slate-500 text-center py-4 font-medium">Sem eventos agendados.</p>
            ) : (
              events.slice(0, 4).map((e: any) => {
                const tones: Record<string, "brand" | "info" | "success" | "warning" | "neutral"> = {
                  onboarding: "brand", report: "info", strategy: "success", internal: "neutral", review: "warning",
                };
                const date = new Date(e.starts_at);
                return (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <div className="text-center flex-shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {String(date.getDate()).padStart(2, '0')}/{String(date.getMonth() + 1).padStart(2, '0')}
                      </p>
                      <p className="text-[14px] text-slate-900 dark:text-white font-bold leading-none mt-1">
                        {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{e.title}</p>
                      <Badge tone={tones[e.type] ?? "neutral"} size="sm" className="mt-1.5">
                        {e.client_name ?? "Interno"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
