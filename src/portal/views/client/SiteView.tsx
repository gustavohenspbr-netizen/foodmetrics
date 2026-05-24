import React from "react";
import { Globe, Users, MousePointerClick, Clock, Phone, ShoppingBag, Menu } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader } from "../../components/ui/Card";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { fmt } from "../../lib/format";

const TRAFFIC_DATA = [
  { day: "Seg", users: 240 },
  { day: "Ter", users: 312 },
  { day: "Qua", users: 285 },
  { day: "Qui", users: 410 },
  { day: "Sex", users: 528 },
  { day: "Sáb", users: 720 },
  { day: "Dom", users: 612 },
];

const SOURCES = [
  { name: "Orgânico", value: 42, color: "#10b981" },
  { name: "Pago", value: 28, color: "#e01c1c" },
  { name: "Social", value: 18, color: "#ff8732" },
  { name: "Direto", value: 12, color: "#3b82f6" },
];

const TOP_PAGES = [
  { url: "/cardapio", views: 4200, conv: 12.4 },
  { url: "/", views: 3850, conv: 8.2 },
  { url: "/delivery", views: 2410, conv: 18.6 },
  { url: "/contato", views: 1280, conv: 4.1 },
  { url: "/eventos", views: 920, conv: 2.8 },
];

export function SiteView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
          Site & Tráfego
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Performance do seu site no Google Analytics 4
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Visitantes" value={fmt.numberCompact(12450)} delta={14.2} icon={Users} color="#3b82f6" spark={[8, 9, 10, 10.5, 11, 11.8, 12.45]} />
        <MetricCard label="Sessões" value={fmt.numberCompact(18200)} delta={11.8} icon={Globe} color="#10b981" spark={[12, 13, 14, 15, 16, 17, 18.2]} />
        <MetricCard label="Taxa Rejeição" value="32%" delta={-4.2} deltaLabel="melhor" icon={MousePointerClick} color="#f59e0b" spark={[40, 38, 37, 36, 35, 33, 32]} />
        <MetricCard label="Tempo médio" value="2m 18s" delta={6.8} icon={Clock} color="#e01c1c" spark={[1.8, 1.9, 2.0, 2.1, 2.15, 2.17, 2.18]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="Tráfego diário" subtitle="Últimos 7 dias" height={280}>
          <ResponsiveContainer>
            <AreaChart data={TRAFFIC_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sitetraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
              <XAxis dataKey="day" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
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
              <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} fill="url(#sitetraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Origem do tráfego" subtitle="Como te encontram" height={280}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={SOURCES} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {SOURCES.map((s) => (
                  <Cell key={s.name} fill={s.color} stroke="none" />
                ))}
              </Pie>
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
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader title="Páginas mais visitadas" subtitle="Conversão = cliques em pedir, ligar ou ver cardápio" />
        <div className="space-y-2">
          {TOP_PAGES.map((p) => (
            <div
              key={p.url}
              className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Menu size={14} className="text-slate-400 flex-shrink-0" />
              <span className="font-mono text-[13px] font-bold text-slate-900 dark:text-white flex-1">{p.url}</span>
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                  {fmt.number(p.views)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  views
                </p>
              </div>
              <div className="text-right w-20">
                <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {p.conv}%
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  conv.
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
