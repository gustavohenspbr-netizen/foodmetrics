import React from "react";
import { Star, MessageSquare, Phone, MapPin, Camera, Sparkles, Eye } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { MetricCard } from "../../components/MetricCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useGmbStats, useReviews } from "../../lib/api";

export function GMBView() {
  const { data: client } = useMyClient();
  const cid = client?.id;
  const { data: stats, loading: lStats } = useGmbStats(cid);
  const { data: reviews = [] } = useReviews(cid, "gmb");
  const pendingCount = reviews.filter((r: any) => !r.reply).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Google Meu Negócio</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Sua presença no Google Maps e Google Search
        </p>
      </div>

      {lStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard label="Avaliação" value={(stats?.rating ?? 0).toFixed(1)} delta={stats?.deltaRating} icon={Star} color="#f59e0b" />
          <MetricCard label="Visualizações" value={fmt.numberCompact(stats?.views ?? 0)} delta={stats?.deltaViews} icon={Eye} color="#3b82f6" />
          <MetricCard label="Ligações" value={fmt.number(stats?.calls ?? 0)} delta={stats?.deltaCalls} icon={Phone} color="#10b981" />
          <MetricCard label="Rotas" value={fmt.number(stats?.directions ?? 0)} delta={stats?.deltaDirections} icon={MapPin} color="#e01c1c" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Avaliações Recentes"
            subtitle="Responda em até 6h pra manter sua média alta"
            action={pendingCount > 0 ? <Badge tone="brand" dot>{pendingCount} pendentes</Badge> : <Badge tone="success">Em dia</Badge>}
          />
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-[13px] py-6 text-center font-medium">Sem reviews recentes.</p>
            ) : reviews.map((r: any) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{r.customer_name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {new Date(r.posted_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                <div className="flex items-center justify-between mt-3">
                  {r.reply ? <Badge tone="success">Respondida</Badge> : <Badge tone="warning" dot>Aguardando resposta</Badge>}
                  {!r.reply && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" icon={Sparkles}>Sugerir resposta (IA)</Button>
                      <Button size="sm" variant="primary" icon={MessageSquare}>Responder</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Próximas ações" subtitle="O que recomendamos esta semana" />
          <div className="space-y-3">
            {[
              { icon: Camera, title: "Adicionar 5 fotos novas", desc: "Aumenta visualizações em ~12%" },
              { icon: MessageSquare, title: `Responder ${pendingCount} reviews pendentes`, desc: "Mantém SLA de 6h" },
              { icon: Sparkles, title: "Publicar post de novidade", desc: "Lançamento do menu de inverno" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e01c1c] to-[#ff8732] text-white flex items-center justify-center flex-shrink-0">
                  <a.icon size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{a.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
