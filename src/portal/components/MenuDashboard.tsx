import React from "react";
import { ShoppingBag, DollarSign, TrendingDown, Clock, CheckCircle, XCircle, Truck, RefreshCw, CreditCard, CalendarDays, BarChart2 } from "lucide-react";
import { useFoodOrdersSummary, useRecentFoodOrders } from "../lib/api";
import { MetricCard } from "./MetricCard";
import { Card, CardHeader } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { Badge } from "./ui/Badge";
import { fmt } from "../lib/format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export function MenuDashboard({ clientId, source }: { clientId: string | undefined; source: string }) {
  const { data: summary, loading: loadingSum } = useFoodOrdersSummary(clientId, source);
  const { data: recent, loading: loadingRecent } = useRecentFoodOrders(clientId, source);

  if (loadingSum || loadingRecent) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const hasData = (summary?.totalOrders ?? 0) > 0 || (recent && recent.length > 0);

  if (!hasData) {
    return (
      <div className="mt-6">
        <EmptyState 
          icon={ShoppingBag} 
          title="Nenhum pedido ainda" 
          description="Os pedidos recebidos aparecerão aqui e as métricas serão geradas automaticamente."
        />
      </div>
    );
  }

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const segQuiData = [1,2,3,4].map(d => ({ name: weekdays[d], vendas: summary?.weekdaySales[d.toString()] || 0 }));
  const sexDomData = [5,6,0].map(d => ({ name: weekdays[d], vendas: summary?.weekdaySales[d.toString()] || 0 }));

  return (
    <div className="space-y-6 mt-6 pb-20">
      
      {/* 1. Cards Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summary?.acessos !== undefined && (
          <MetricCard label="Acessos ao Cardápio" value={fmt.number(summary.acessos)} icon={ShoppingBag} color="#0ea5e9" />
        )}
        {summary?.whatsappContacts !== undefined && (
          <MetricCard label="Contatos via WhatsApp" value={fmt.number(summary.whatsappContacts)} icon={ShoppingBag} color="#22c55e" />
        )}
        <MetricCard label="Vendas Finalizadas" value={fmt.number(summary?.totalOrders ?? 0)} icon={ShoppingBag} color="#3b82f6" />
        <MetricCard label="Faturamento Total" value={fmt.currencyCompact(summary?.totalRevenue ?? 0)} icon={DollarSign} color="#10b981" />
        <MetricCard label="Ticket Médio" value={fmt.currency(summary?.avgTicket ?? 0)} icon={BarChart2} color="#8b5cf6" />
        <MetricCard label="Taxa de Cancelamento" value={`${(summary?.cancellationsPct ?? 0).toFixed(1)}%`} icon={TrendingDown} color="#ef4444" />
        <MetricCard label="Taxa de Entrega" value={fmt.currencyCompact(summary?.deliveryFeeTotal ?? 0)} icon={Truck} color="#f59e0b" />
        <MetricCard label="Reembolso" value={fmt.currencyCompact(summary?.refundTotal ?? 0)} icon={RefreshCw} color="#ec4899" />
        <MetricCard label="Comissão do App" value={fmt.currencyCompact(summary?.commissionTotal ?? 0)} icon={DollarSign} color="#6366f1" />
      </div>

      {/* 2. Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Vendas por dia */}
        <Card>
          <CardHeader title="Valor das vendas por dia" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.dailySales || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(v) => v.slice(5).replace('-','/')} stroke="#cbd5e1" />
                <YAxis tick={{fontSize: 10}} stroke="#cbd5e1" tickFormatter={(v) => fmt.currencyCompact(v)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(v: number) => fmt.currency(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ticket Médio por dia */}
        <Card>
          <CardHeader title="Ticket Médio por dia" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.dailySales || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTicket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(v) => v.slice(5).replace('-','/')} stroke="#cbd5e1" />
                <YAxis tick={{fontSize: 10}} stroke="#cbd5e1" tickFormatter={(v) => fmt.currencyCompact(v)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#8b5cf6' }}
                  formatter={(v: number) => fmt.currency(v)}
                />
                <Area type="monotone" dataKey="ticket" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTicket)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Horários de Maior Venda */}
        <Card>
          <CardHeader title="Horários de Maior Venda" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.hourlySales || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{fontSize: 10}} stroke="#cbd5e1" />
                <YAxis tick={{fontSize: 10}} stroke="#cbd5e1" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Melhores Dias (Seg-Qui) */}
        <Card>
          <CardHeader title="Melhores Dias (Seg - Qui)" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segQuiData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#cbd5e1" />
                <YAxis tick={{fontSize: 10}} stroke="#cbd5e1" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Melhores Dias (Sex-Dom) */}
        <Card>
          <CardHeader title="Melhores Dias (Sex - Dom)" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sexDomData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#cbd5e1" />
                <YAxis tick={{fontSize: 10}} stroke="#cbd5e1" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="vendas" fill="#ec4899" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 3. Tabelas Complementares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cancelamentos por Código */}
        <Card>
          <CardHeader title="Cancelamentos" subtitle="Por código/motivo" />
          <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {Object.keys(summary?.cancellationReasons || {}).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum cancelamento registrado.</p>
            ) : (
              <ul className="space-y-3">
                {Object.entries(summary?.cancellationReasons || {}).map(([reason, count]: [string, any]) => (
                  <li key={reason} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 dark:text-slate-300 truncate pr-4">{reason}</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Pagamentos por Método */}
        <Card>
          <CardHeader title="Pagamentos" subtitle="Por método de pagamento" />
          <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {Object.keys(summary?.paymentMethods || {}).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum pagamento registrado.</p>
            ) : (
              <ul className="space-y-3">
                {Object.entries(summary?.paymentMethods || {}).map(([method, count]: [string, any]) => (
                  <li key={method} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      {method}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Reembolsos */}
        <Card>
          <CardHeader title="Reembolsos e Estornos" subtitle="Valor total devolvido" />
          <div className="p-4 flex flex-col items-center justify-center h-[200px]">
            <RefreshCw size={32} className="text-pink-500 mb-3" />
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {fmt.currency(summary?.refundTotal ?? 0)}
            </span>
            <p className="text-sm text-slate-500 mt-2 text-center">
              Total de estornos e devoluções no período selecionado.
            </p>
          </div>
        </Card>
      </div>

    </div>
  );
}
