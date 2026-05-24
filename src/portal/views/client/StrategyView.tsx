import React from "react";
import { Lightbulb, Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useGoals, useInitiatives, useRecommendations } from "../../lib/api";

export function StrategyView() {
  const { data: client } = useMyClient();
  const cid = client?.id;
  const { data: goals = [], loading: lGoals } = useGoals(cid);
  const { data: initiatives = [], loading: lInit } = useInitiatives(cid);
  const { data: recommendations = [] } = useRecommendations(cid);

  const monthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Plano Estratégico</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 capitalize">
            {monthLabel} · O que sua equipe vai entregar este mês
          </p>
        </div>
        <Button variant="outline" icon={Calendar} size="sm">Histórico</Button>
      </div>

      <div>
        <h3 className="text-[14px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Metas do Mês</h3>
        {lGoals ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((g: any) => {
              const pct = (Number(g.current) / Number(g.target)) * 100;
              const tone = pct >= 100 ? "success" : pct >= 70 ? "warning" : "danger";
              return (
                <Card key={g.id} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl" style={{ background: pct >= 100 ? "#10b981" : "#e01c1c" }} />
                  <div className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{g.label}</p>
                    <div className="flex items-end gap-2 mt-2">
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
                        {g.format === "currency" ? fmt.currencyCompact(Number(g.current)) : Number(g.current).toFixed(g.label.includes("Avaliação") ? 1 : 0)}
                      </p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 font-bold pb-0.5">
                        / {g.format === "currency" ? fmt.currencyCompact(Number(g.target)) : Number(g.target)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={Number(g.current)} max={Number(g.target)} tone={tone === "danger" ? "danger" : tone === "warning" ? "warning" : "success"} size="md" />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">{pct.toFixed(0)}% da meta</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Iniciativas em execução" subtitle="O que a equipe está fazendo agora" />
          {lInit ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {initiatives.map((init: any) => {
                const Icon = init.status === "in_progress" ? Clock : init.status === "scheduled" ? Calendar : AlertCircle;
                const tones: Record<string, "warning" | "info" | "neutral"> = { in_progress: "warning", scheduled: "info", pending: "neutral" };
                const labels: Record<string, string> = { in_progress: "Em andamento", scheduled: "Agendado", pending: "Pendente" };
                return (
                  <div key={init.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{init.title}</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        Responsável: {init.owner_name ?? "—"} · Prazo {init.deadline ? fmt.date(init.deadline) : "—"}
                      </p>
                    </div>
                    <Badge tone={tones[init.status] ?? "neutral"}>{labels[init.status] ?? init.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recomendações" subtitle="Da sua equipe pra você" action={<Lightbulb size={18} className="text-amber-500" />} />
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <p className="text-slate-400 text-[12px] py-4 text-center">Nenhuma recomendação ativa.</p>
            ) : recommendations.map((r: any, i: number) => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#e01c1c] to-[#ff8732] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{r.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
