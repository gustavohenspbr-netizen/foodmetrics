import React from "react";
import { Star, ShoppingBag, DollarSign, TrendingDown, Sparkles, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MetricCard } from "../../components/MetricCard";
import { ChartCard } from "../../components/ChartCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConnectAccount } from "../../components/ConnectAccount";
import { fmt } from "../../lib/format";
import {
  useMyClient, useIfoodSummary, useIfoodHourly,
  useIfoodTopItems, useIfoodByNeighborhood, useReviews, useIntegration,
} from "../../lib/api";

export function IfoodView() {
  const { data: client } = useMyClient();
  const cid = client?.id;
  const { data: integration } = useIntegration(cid, "ifood");
  const { data: summary, loading: lSum } = useIfoodSummary(cid);
  const { data: hourly = [] } = useIfoodHourly(cid);
  const { data: topItems = [] } = useIfoodTopItems(cid);
  const { data: byHood = [] } = useIfoodByNeighborhood(cid);
  const { data: reviews = [] } = useReviews(cid, "ifood");

  const hasData = (summary?.orders.month ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">iFood</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Pedidos, faturamento e avaliações do seu delivery
        </p>
      </div>

      <ConnectAccount
        clientId={cid}
        provider="ifood"
        brandColor="#ea1d2c"
        title="iFood Partner"
        description="Cole o Merchant ID e Client Secret gerados no Portal do Parceiro iFood."
        fields={[
          { key: "account_id", label: "Merchant ID", required: true },
          { key: "account_name", label: "Nome da loja" },
          { key: "access_token", label: "Client Secret", type: "password", required: true },
        ]}
        quickActions={[
          { url: "https://portal.ifood.com.br", label: "Portal do Parceiro iFood", description: "Login com sua conta de operador" },
          { url: "https://developer.ifood.com.br/pt-BR/docs/getting-started", label: "Documentação iFood Developer" },
        ]}
        tutorial={[
          {
            title: "Solicitar acesso de API ao iFood",
            description: <>O iFood libera API só pra parceiros aprovados. Entre no <strong>Portal do Parceiro</strong> → <strong>Configurações</strong> → <strong>Integrações</strong> → <strong>"Solicitar acesso à API"</strong>. Aprovação leva de 1 a 5 dias úteis.</>,
            link: { url: "https://portal.ifood.com.br", label: "Portal do Parceiro" },
          },
          {
            title: "Pegar Merchant ID",
            description: <>Após aprovado, na seção de Integrações você vê o <strong>Merchant ID</strong> da sua loja (UUID longo). Cada loja tem 1 ID. Copie o da loja que quer sincronizar.</>,
          },
          {
            title: "Gerar Client Secret",
            description: <>Na mesma tela, clique em <strong>"Gerar credenciais"</strong>. O sistema mostra um <strong>Client ID</strong> + <strong>Client Secret</strong> — o Secret só é mostrado uma vez. Copie e guarde em local seguro.</>,
          },
          {
            title: "Colar aqui",
            description: <>Cole o Merchant ID e o Client Secret. O sync diário trará pedidos, avaliações, cardápio e cancelamentos automaticamente.</>,
          },
        ]}
        oauthNote="iFood não tem OAuth público — credenciais sempre são geradas manualmente no Portal do Parceiro."
      />

      {!integration && (
        <EmptyState icon={ShoppingBag} title="Conecte o iFood para ver os pedidos" description="Sem conexão, não conseguimos sincronizar pedidos, avaliações e métricas do delivery." />
      )}

      {integration && !hasData && (
        <EmptyState icon={ShoppingBag} title="Aguardando primeira sincronização" description="A conexão está ativa. Os pedidos aparecerão aqui assim que o sync rodar pela primeira vez." />
      )}

      {integration && hasData && (
        <>
          {lSum ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard label="Faturamento Mês" value={fmt.currencyCompact(summary?.revenue.month ?? 0)} icon={DollarSign} color="#e01c1c" />
              <MetricCard label="Pedidos Mês" value={fmt.number(summary?.orders.month ?? 0)} icon={ShoppingBag} color="#ff8732" />
              <MetricCard label="Avaliação" value={(summary?.rating ?? 0).toFixed(1)} icon={Star} color="#f59e0b" />
              <MetricCard label="Cancelamentos" value={`${(summary?.cancellations ?? 0).toFixed(1)}%`} icon={TrendingDown} color="#10b981" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard className="lg:col-span-2" title="Pedidos por hora" subtitle="Últimos 7 dias — identifica horários de pico" height={300}>
              {hourly.length === 0 ? <EmptyState title="Sem dados de pedidos" /> : (
                <ResponsiveContainer>
                  <BarChart data={hourly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                    <XAxis dataKey="hour" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 12, fontWeight: 600 }} />
                    <Bar dataKey="orders" fill="#ea1d2c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <Card>
              <CardHeader title="Top 5 pratos" subtitle="Mais pedidos este mês" />
              <div className="space-y-3">
                {topItems.length === 0 ? <p className="text-slate-400 text-[12px] py-4 text-center">Sem dados ainda.</p> : topItems.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold">#{i + 1}</div>
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-900 dark:text-white tabular-nums flex-shrink-0">{item.orders}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Pedidos por bairro" subtitle="Onde seus clientes estão (últimos 30 dias)" />
              <div className="space-y-2">
                {byHood.length === 0 ? <p className="text-slate-400 text-[12px] py-4 text-center">Sem dados ainda.</p> : byHood.slice(0, 8).map((h: any) => {
                  const max = byHood[0]?.orders ?? 1;
                  const pct = (h.orders / max) * 100;
                  return (
                    <div key={h.neighborhood} className="flex items-center gap-3">
                      <span className="w-32 text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate flex-shrink-0">{h.neighborhood}</span>
                      <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                        <div className="h-full rounded-md bg-gradient-to-r from-[#e01c1c] to-[#ff8732] flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                          <span className="text-[10px] font-bold text-white">{h.orders}</span>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900 dark:text-white tabular-nums w-16 text-right flex-shrink-0">{fmt.currencyCompact(Number(h.revenue))}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHeader title="Reviews recentes" subtitle="Responda em até 6h pra manter sua média" />
              <div className="space-y-3">
                {reviews.length === 0 ? <p className="text-slate-400 text-[12px] py-4 text-center">Sem reviews recentes.</p> : reviews.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-slate-900 dark:text-white">{r.customer_name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                          ))}
                        </div>
                      </div>
                      {r.reply ? <Badge tone="success" size="sm">Respondida</Badge> : <Badge tone="warning" size="sm" dot>Pendente</Badge>}
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug">{r.comment}</p>
                    {!r.reply && (
                      <div className="flex gap-2 mt-2">
                        <Button size="xs" variant="outline" icon={Sparkles}>Sugerir resposta (IA)</Button>
                        <Button size="xs" variant="primary" icon={MessageSquare}>Responder</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
