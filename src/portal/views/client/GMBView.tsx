import React from "react";
import { Star, MessageSquare, Phone, MapPin, Camera, Sparkles, Eye } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { MetricCard } from "../../components/MetricCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { fmt } from "../../lib/format";

const REVIEWS = [
  { id: "1", name: "Maria Cristina", rating: 5, text: "Atendimento impecável, comida divina. Voltarei sempre!", time: "Há 3 horas", answered: false },
  { id: "2", name: "Ricardo Mendes", rating: 4, text: "Boa comida, só achei o tempo de espera um pouco longo no horário de pico.", time: "Há 6 horas", answered: false },
  { id: "3", name: "Ana Beatriz", rating: 5, text: "Melhor burger de SP, sem dúvida. O atendimento da Júlia foi 10!", time: "Há 1 dia", answered: true },
  { id: "4", name: "Pedro Lemos", rating: 3, text: "Esperei muito o pedido e veio frio.", time: "Há 2 dias", answered: true },
];

export function GMBView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
          Google Meu Negócio
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Sua presença no Google Maps e Google Search
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Avaliação" value="4.7" delta={2.1} icon={Star} color="#f59e0b" spark={[4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.7]} />
        <MetricCard label="Visualizações" value={fmt.numberCompact(24800)} delta={18.4} icon={Eye} color="#3b82f6" spark={[18, 19, 20, 22, 23, 24, 24.8]} />
        <MetricCard label="Ligações" value="142" delta={12.3} icon={Phone} color="#10b981" spark={[110, 118, 122, 130, 135, 138, 142]} />
        <MetricCard label="Rotas" value="312" delta={8.5} icon={MapPin} color="#e01c1c" spark={[270, 280, 290, 295, 302, 308, 312]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Avaliações Recentes"
            subtitle="Responda em até 6h pra manter sua média alta"
            action={
              <Badge tone="brand" dot>
                2 não respondidas
              </Badge>
            }
          />
          <div className="space-y-4">
            {REVIEWS.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{r.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold">{r.time}</span>
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{r.text}</p>
                <div className="flex items-center justify-between mt-3">
                  {r.answered ? (
                    <Badge tone="success">Respondida</Badge>
                  ) : (
                    <Badge tone="warning" dot>
                      Aguardando resposta
                    </Badge>
                  )}
                  {!r.answered && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" icon={Sparkles}>
                        Sugerir resposta (IA)
                      </Button>
                      <Button size="sm" variant="primary" icon={MessageSquare}>
                        Responder
                      </Button>
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
              { icon: MessageSquare, title: "Responder 2 reviews pendentes", desc: "Mantém SLA de 6h" },
              { icon: Sparkles, title: "Publicar post de novidade", desc: "Lançamento do menu de inverno" },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30"
              >
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
