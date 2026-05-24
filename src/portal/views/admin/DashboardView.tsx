import React from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Sparkles,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { fmt } from "../../lib/format";
import {
  MOCK_ADMIN_OVERVIEW,
  MOCK_CLIENTS,
  MOCK_MONTHLY_SPEND,
  MOCK_CLIENTS_BY_STATE,
  MOCK_TEAM,
  MOCK_SCHEDULE_EVENTS,
} from "../../lib/mockData";

export function DashboardView() {
  const o = MOCK_ADMIN_OVERVIEW;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const atRisk = MOCK_CLIENTS.filter((c) => c.health < 70);

  const stateHistory = MOCK_MONTHLY_SPEND.map((m) => ({
    month: m.month,
    spend: m.google + m.meta,
  }));

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
            <h2 className="text-white text-4xl font-extrabold tracking-tight mt-4 leading-tight">
              MRR de{" "}
              <span className="bg-gradient-to-r from-[#ff8732] to-[#ffba8c] bg-clip-text text-transparent">
                {fmt.currencyCompact(o.mrr * 1000)}
              </span>{" "}
              <span className="text-emerald-400 text-2xl ml-2">+{o.mrrGrowth}%</span>
            </h2>
            <p className="text-slate-300 text-base font-medium mt-2 max-w-2xl">
              <span className="text-white font-bold">{o.activeClients} clientes ativos</span> · churn em{" "}
              <span className="text-emerald-400 font-bold">{o.churnRate}%</span> · você gerencia{" "}
              <span className="text-white font-bold">{fmt.currencyCompact(o.totalManaged * 1000)}</span> em
              investimento mensal para seus clientes.
            </p>
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
        <MetricCard
          label="MRR"
          value={fmt.currencyCompact(o.mrr * 1000)}
          delta={o.mrrGrowth}
          icon={DollarSign}
          color="#10b981"
          spark={o.mrrHistory}
        />
        <MetricCard
          label="Clientes Ativos"
          value={o.activeClients}
          delta={4.2}
          icon={Users}
          color="#e01c1c"
          spark={o.clientsHistory}
        />
        <MetricCard
          label="Verba Gerenciada"
          value={fmt.currencyCompact(o.totalManaged * 1000)}
          delta={6.5}
          icon={Activity}
          color="#ff8732"
          spark={o.spendHistory}
        />
        <MetricCard
          label="Churn"
          value={`${o.churnRate}%`}
          delta={-0.4}
          deltaLabel="vs trimestre"
          icon={TrendingDown}
          color="#3b82f6"
          spark={[3.2, 2.9, 2.7, 2.5, 2.3, 2.2, 2.1]}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          className="lg:col-span-2"
          title="Verba gerenciada mensal"
          subtitle="Soma do investimento de todos os clientes (Google + Meta)"
          height={300}
        >
          <ResponsiveContainer>
            <AreaChart data={stateHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="admin-spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01c1c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01c1c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-slate-500 text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-slate-500 text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(v: number) => fmt.currency(v)}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#e01c1c"
                strokeWidth={2.5}
                fill="url(#admin-spend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Clientes por Estado"
          subtitle="Distribuição geográfica"
          height={300}
        >
          <ResponsiveContainer>
            <BarChart data={MOCK_CLIENTS_BY_STATE} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="currentColor"
                className="text-slate-500 text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="state"
                type="category"
                stroke="currentColor"
                className="text-slate-500 text-xs font-bold"
                tickLine={false}
                axisLine={false}
              />
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
              <Bar dataKey="count" fill="#ff8732" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* HEALTH SCORE + EQUIPE + AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Clientes em risco"
            subtitle="Health Score abaixo de 70"
            action={
              <Badge tone="danger" dot>
                {atRisk.length}
              </Badge>
            }
          />
          <div className="space-y-3.5">
            {atRisk.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar name={c.restaurant} color={c.color} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                    {c.restaurant}
                  </p>
                  <div className="mt-1.5">
                    <ProgressBar
                      value={c.health}
                      tone={c.health < 50 ? "danger" : c.health < 70 ? "warning" : "success"}
                      size="sm"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        Health {c.health}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        {c.manager}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {atRisk.length === 0 && (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center py-6 font-medium">
                Todos os clientes saudáveis 🎉
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Equipe"
            subtitle={`${MOCK_TEAM.filter((t) => t.online).length} online agora`}
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowUpRight}>
                Ver tudo
              </Button>
            }
          />
          <div className="space-y-3">
            {MOCK_TEAM.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar name={m.name} color={m.color} size="md" status={m.online ? "online" : "offline"} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{m.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-bold text-slate-900 dark:text-white">
                    {m.clients} clientes
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {m.tasksOpen} tarefas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Próximos eventos"
            subtitle="Hoje e amanhã"
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowUpRight}>
                Agenda
              </Button>
            }
          />
          <div className="space-y-3">
            {MOCK_SCHEDULE_EVENTS.slice(0, 4).map((e) => {
              const tones: Record<string, "brand" | "info" | "success" | "warning" | "neutral"> = {
                onboarding: "brand",
                report: "info",
                strategy: "success",
                internal: "neutral",
                review: "warning",
              };
              return (
                <div
                  key={e.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <div className="text-center flex-shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {e.date.split("/")[0]}/{e.date.split("/")[1]}
                    </p>
                    <p className="text-[14px] text-slate-900 dark:text-white font-bold leading-none mt-1">
                      {e.time.split(" - ")[0]}
                    </p>
                  </div>
                  <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">
                      {e.title}
                    </p>
                    <Badge tone={tones[e.type] ?? "neutral"} size="sm" className="mt-1.5">
                      {e.client}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
