import React, { useEffect, useState } from "react";
import { Users, Phone, MessageSquare, Calendar, Plus } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { MetricCard } from "../../components/MetricCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { fmt } from "../../lib/format";
import { useMyClient } from "../../lib/api";
import { supabase } from "../../lib/supabase";

export function ClientCRMView() {
  const { data: client } = useMyClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client?.id) return;
    (async () => {
      const { data } = await supabase
        .from("customer_records")
        .select("*")
        .eq("client_id", client.id)
        .order("last_order_at", { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    })();
  }, [client?.id]);

  const vips = customers.filter((c) => c.segment === "vip");
  const inactive = customers.filter((c) => c.segment === "inactive");
  const totalSpent = customers.reduce((s, c) => s + Number(c.total_spent ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">CRM do Restaurante</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Seus clientes do delivery, eventos e fidelidade
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm">Cadastrar cliente</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <MetricCard label="Total de clientes" value={fmt.number(customers.length)} icon={Users} color="#3b82f6" hint="Base ativa" />
        <MetricCard label="VIPs" value={fmt.number(vips.length)} icon={Users} color="#f59e0b" hint="Top compradores" />
        <MetricCard label="Inativos" value={fmt.number(inactive.length)} icon={Users} color="#ef4444" hint=">90 dias sem comprar" />
        <MetricCard label="Faturamento total" value={fmt.currencyCompact(totalSpent)} icon={Users} color="#10b981" />
      </div>

      <Card padded={false}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
          <CardHeader title="Clientes recentes" subtitle="Quem pediu nas últimas semanas" />
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="CRM vazio"
            description="Importe seus clientes do iFood ou cadastre manualmente pra começar campanhas de WhatsApp."
            action={<Button variant="primary" icon={Plus}>Importar do iFood</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {customers.map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{c.phone}</p>
                </div>
                <Badge tone={c.segment === "vip" ? "warning" : c.segment === "inactive" ? "danger" : "info"}>{c.segment}</Badge>
                <span className="text-[12px] font-bold text-slate-900 dark:text-white tabular-nums">{c.total_orders} pedidos</span>
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt.currency(Number(c.total_spent ?? 0))}</span>
                <div className="flex gap-1">
                  <Button size="xs" variant="ghost" icon={Phone} />
                  <Button size="xs" variant="ghost" icon={MessageSquare} />
                  <Button size="xs" variant="ghost" icon={Calendar} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
