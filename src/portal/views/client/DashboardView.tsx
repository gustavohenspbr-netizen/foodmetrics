import React from "react";
import {
  TrendingUp,
  DollarSign,
  Target,
  Star,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { fmt } from "../../lib/format";
import {
  MOCK_MONTHLY_SPEND,
  MOCK_IFOOD_DATA,
  MOCK_STRATEGY,
  MOCK_GOOGLE_CAMPAIGNS,
} from "../../lib/mockData";

export function DashboardView() {
  const totalRevenue = MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1].revenue;
  const totalSpend =
    MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1].google +
    MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1].meta;
  const avgRoas = (totalRevenue / totalSpend).toFixed(1);
  const monthGoal = MOCK_STRATEGY.goals[0];

  return (
    <div className="space-y-8">
      {/* HERO */}
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1a2238] dark:from-[#0F172A] dark:to-[#0a0f1c] border-slate-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e01c1c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-[#ff8732]/10 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[280px]">
            <Badge tone="orange" size="md" dot>
              <Sparkles size={11} className="mr-0.5" /> Maio 2025
            </Badge>
            <h2 className="text-white text-4xl font-extrabold tracking-tight mt-4 leading-tight">
              Você faturou{" "}
              <span className="bg-gradient-to-r from-[#ff8732] to-[#ffba8c] bg-clip-text text-transparent">
                {fmt.currency(totalRevenue)}
              </span>
            </h2>
            <p className="text-slate-300 text-base font-medium mt-2 max-w-xl">
              via marketing este mês — <span className="text-emerald-400 font-bold">+23.7%</span> em relação a
              abril. Sua média de retorno está em <span className="text-white font-bold">{avgRoas}x</span> cada R$
              investido.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Meta do mês</span>
                <span className="text-[13px] text-white font-bold">
                  {fmt.currencyCompact(monthGoal.current)} / {fmt.currencyCompact(monthGoal.target)}
                </span>
              </div>
              <ProgressBar value={monthGoal.current} max={monthGoal.target} tone="brand" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" icon={Calendar} size="md">
              Agendar call estratégica
            </Button>
            <Button
              variant="outline"
              iconRight={ArrowUpRight}
              size="md"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Ver último relatório
            </Button>
          </div>
        </div>
      </Card>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Faturamento iFood"
          value={fmt.currencyCompact(MOCK_IFOOD_DATA.revenue.month)}
          delta={18.4}
          icon={DollarSign}
          color="#e01c1c"
          spark={[180, 195, 210, 198, 225, 232, 245]}
        />
        <MetricCard
          label="Investimento em Ads"
          value={fmt.currencyCompact(totalSpend)}
          delta={8.2}
          icon={Target}
          color="#ff8732"
          spark={[20, 22, 19, 26, 28, 30, 32.7]}
        />
        <MetricCard
          label="ROAS Médio"
          value={`${avgRoas}x`}
          delta={5.1}
          icon={TrendingUp}
          color="#10b981"
          spark={[6.8, 7.2, 7.5, 7.1, 7.4, 7.3, 7.5]}
        />
        <MetricCard
          label="Avaliação iFood"
          value={MOCK_IFOOD_DATA.rating.toFixed(1)}
          deltaLabel="estável"
          delta={0.1}
          icon={Star}
          color="#f59e0b"
          spark={[4.7, 4.8, 4.8, 4.7, 4.8, 4.8, 4.8]}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          className="lg:col-span-2"
          title="Investimento vs Faturamento"
          subtitle="Últimos 5 meses"
          height={300}
        >
          <ResponsiveContainer>
            <AreaChart data={MOCK_MONTHLY_SPEND} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 10 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke="#e01c1c"
                strokeWidth={2.5}
                fill="url(#revenue)"
              />
              <Area
                type="monotone"
                dataKey="google"
                name="Google + Meta"
                stroke="#ff8732"
                strokeWidth={2.5}
                fill="url(#spend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader
            title="Alertas Inteligentes"
            subtitle="Coisas que requerem sua atenção"
            action={
              <Badge tone="danger" dot>
                3 ativos
              </Badge>
            }
          />
          <div className="space-y-3">
            <AlertItem
              tone="warning"
              icon={AlertTriangle}
              title="Avaliação iFood caiu de 4.9 → 4.8"
              description="Última hora — 1 review 3⭐ não respondido"
            />
            <AlertItem
              tone="success"
              icon={CheckCircle2}
              title="Campanha Reels superou meta"
              description="CTR de 5.4% (meta era 4%) — recomendamos +30% budget"
            />
            <AlertItem
              tone="info"
              icon={Sparkles}
              title="Oportunidade: Bairro Pinheiros"
              description="287 pedidos esta semana — sugerimos ad geo-segmentado"
            />
          </div>
        </Card>
      </div>

      {/* CAMPANHAS DESTAQUE + NEXT ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Top Campanhas"
            subtitle="Melhor performance esta semana"
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowUpRight}>
                Ver todas
              </Button>
            }
          />
          <div className="space-y-3">
            {MOCK_GOOGLE_CAMPAIGNS.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4285f4]/20 to-[#34a853]/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={16} className="text-[#4285f4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge tone={c.status === "Ativa" ? "success" : "neutral"} size="sm">
                        {c.status}
                      </Badge>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        ROAS {c.roas}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                    {fmt.currency(c.spend)}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {c.conversions} conv.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Próximas ações da equipe"
            subtitle="O que a FoodMetrics está fazendo por você"
          />
          <div className="space-y-4">
            {MOCK_STRATEGY.initiatives.slice(0, 4).map((init) => (
              <div key={init.id} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    init.status === "in_progress"
                      ? "bg-amber-500 animate-pulse"
                      : init.status === "scheduled"
                      ? "bg-blue-500"
                      : "bg-slate-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{init.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      {init.owner}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Prazo {init.deadline}
                    </span>
                  </div>
                </div>
                <Badge
                  tone={
                    init.status === "in_progress"
                      ? "warning"
                      : init.status === "scheduled"
                      ? "info"
                      : "neutral"
                  }
                  size="sm"
                >
                  {init.status === "in_progress"
                    ? "Em andamento"
                    : init.status === "scheduled"
                    ? "Agendado"
                    : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AlertItem({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: any;
  title: string;
  description: string;
  tone: "warning" | "success" | "info";
}) {
  const tones = {
    warning:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
    success:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20",
    info: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${tones[tone]}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[13px] font-bold leading-tight">{title}</p>
        <p className="text-[12px] opacity-80 mt-1 leading-snug">{description}</p>
      </div>
    </div>
  );
}
