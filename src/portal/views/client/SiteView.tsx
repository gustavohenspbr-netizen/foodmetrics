import React from "react";
import { Globe, Users, MousePointerClick, Clock, Menu } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardHeader } from "../../components/ui/Card";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useSiteAnalytics } from "../../lib/api";

const COLORS = ["#10b981", "#e01c1c", "#ff8732", "#3b82f6"];

export function SiteView() {
  const { data: client } = useMyClient();
  const { data: site, loading } = useSiteAnalytics(client?.id);

  const sources = site
    ? Object.entries(site.sources ?? {}).map(([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Number(value),
        color: COLORS[i % COLORS.length],
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Site & Tráfego</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Performance do seu site no Google Analytics 4
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard label="Visitantes (30d)" value={fmt.numberCompact(site?.totalUsers ?? 0)} delta={14.2} icon={Users} color="#3b82f6" />
          <MetricCard label="Sessões" value={fmt.numberCompact(site?.totalSessions ?? 0)} delta={11.8} icon={Globe} color="#10b981" />
          <MetricCard label="Taxa Rejeição" value={`${(site?.avgBounceRate ?? 0).toFixed(0)}%`} delta={-4.2} deltaLabel="melhor" icon={MousePointerClick} color="#f59e0b" />
          <MetricCard
            label="Tempo médio"
            value={`${Math.floor((site?.avgSessionSeconds ?? 0) / 60)}m ${Math.round((site?.avgSessionSeconds ?? 0) % 60)}s`}
            delta={6.8} icon={Clock} color="#e01c1c"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="Tráfego diário" subtitle="Últimos 7 dias" height={280}>
          <ResponsiveContainer>
            <AreaChart data={site?.last7Days ?? []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sitetraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
              <XAxis dataKey="day" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 12, fontWeight: 600 }} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} fill="url(#sitetraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Origem do tráfego" subtitle="Como te encontram" height={280}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={sources} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {sources.map((s) => <Cell key={s.name} fill={s.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 12, fontWeight: 600 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader title="Páginas mais visitadas" subtitle="Conversão = cliques em pedir, ligar ou ver cardápio" />
        <div className="space-y-2">
          {(site?.topPages ?? []).map((p: any) => (
            <div key={p.url} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors">
              <Menu size={14} className="text-slate-400 flex-shrink-0" />
              <span className="font-mono text-[13px] font-bold text-slate-900 dark:text-white flex-1">{p.url}</span>
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{fmt.number(p.views)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">views</p>
              </div>
              <div className="text-right w-20">
                <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{p.conv}%</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">conv.</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
