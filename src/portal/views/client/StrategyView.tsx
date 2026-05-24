import React from "react";
import { Target, Lightbulb, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { fmt } from "../../lib/format";
import { MOCK_STRATEGY } from "../../lib/mockData";

export function StrategyView() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
            Plano Estratégico
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {MOCK_STRATEGY.month} · O que sua equipe vai entregar este mês
          </p>
        </div>
        <Button variant="outline" icon={Calendar} size="sm">
          Histórico
        </Button>
      </div>

      {/* GOALS */}
      <div>
        <h3 className="text-[14px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Metas do Mês
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_STRATEGY.goals.map((g) => {
            const pct = (g.current / g.target) * 100;
            const tone = pct >= 100 ? "success" : pct >= 70 ? "warning" : "danger";
            return (
              <Card key={g.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl"
                  style={{ background: pct >= 100 ? "#10b981" : "#e01c1c" }}
                />
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {g.label}
                  </p>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
                      {g.format === "currency"
                        ? fmt.currencyCompact(g.current)
                        : g.current.toFixed(g.label.includes("Avaliação") ? 1 : 0)}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-bold pb-0.5">
                      / {g.format === "currency" ? fmt.currencyCompact(g.target) : g.target}
                    </p>
                  </div>
                  <div className="mt-4">
                    <ProgressBar
                      value={g.current}
                      max={g.target}
                      tone={tone === "danger" ? "danger" : tone === "warning" ? "warning" : "success"}
                      size="md"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">
                      {pct.toFixed(0)}% da meta
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INICIATIVAS */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Iniciativas em execução"
            subtitle="O que a equipe está fazendo agora"
          />
          <div className="space-y-3">
            {MOCK_STRATEGY.initiatives.map((init) => {
              const Icon =
                init.status === "in_progress"
                  ? Clock
                  : init.status === "scheduled"
                  ? Calendar
                  : AlertCircle;
              const tones: Record<string, "warning" | "info" | "neutral"> = {
                in_progress: "warning",
                scheduled: "info",
                pending: "neutral",
              };
              const labels: Record<string, string> = {
                in_progress: "Em andamento",
                scheduled: "Agendado",
                pending: "Pendente",
              };
              return (
                <div
                  key={init.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                      {init.title}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      Responsável: {init.owner} · Prazo {init.deadline}
                    </p>
                  </div>
                  <Badge tone={tones[init.status]}>{labels[init.status]}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RECOMENDAÇÕES */}
        <Card>
          <CardHeader
            title="Recomendações"
            subtitle="Da sua equipe pra você"
            action={<Lightbulb size={18} className="text-amber-500" />}
          />
          <div className="space-y-4">
            {MOCK_STRATEGY.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#e01c1c] to-[#ff8732] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-snug">
                  {r}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
