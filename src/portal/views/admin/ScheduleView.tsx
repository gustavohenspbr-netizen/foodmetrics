import React from "react";
import { Calendar, Clock, Video, Plus } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useEvents } from "../../lib/api";

const TYPE_TONE: Record<string, "brand" | "info" | "success" | "warning" | "neutral"> = {
  onboarding: "brand",
  report: "info",
  strategy: "success",
  internal: "neutral",
  review: "warning",
};
const TYPE_LABEL: Record<string, string> = {
  onboarding: "Onboarding",
  report: "Relatório",
  strategy: "Estratégia",
  internal: "Interna",
  review: "Revisão",
};

export function ScheduleView() {
  const { data: events = [], loading } = useEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Agenda</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Calls, reuniões e eventos da equipe
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm">Novo evento</Button>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState icon={Calendar} title="Nada agendado" description="Adicione eventos pra organizar a semana." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {events.map((e: any) => {
              const dt = new Date(e.starts_at);
              return (
                <div key={e.id} className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#e01c1c] mb-1">
                      {dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{dt.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge tone={TYPE_TONE[e.type] ?? "neutral"} size="sm">{TYPE_LABEL[e.type] ?? e.type}</Badge>
                      {e.client_name && <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{e.client_name}</span>}
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-2">{e.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={13} /> {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="flex items-center gap-1.5"><Video size={13} /> Google Meet</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm">Participar</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
