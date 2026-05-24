import React, { useState } from "react";
import { UserPlus, Filter, MessageSquare, MoreVertical, Briefcase } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs } from "../../components/ui/Tabs";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { useTeam, useTasks } from "../../lib/api";
import { cn } from "../../lib/cn";

const TASK_COLUMNS = [
  { id: "todo", title: "A fazer", color: "#94a3b8" },
  { id: "in_progress", title: "Em andamento", color: "#f59e0b" },
  { id: "review", title: "Em revisão", color: "#3b82f6" },
  { id: "done", title: "Concluído", color: "#10b981" },
];

export function TeamView() {
  const [view, setView] = useState("team");
  const { data: team = [], loading: lTeam } = useTeam();
  const { data: tasks = [], loading: lTasks } = useTasks();

  const tabs = [
    { id: "team", label: "Equipe", count: team.length },
    { id: "tasks", label: "Tarefas", count: tasks.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Equipe & Tarefas</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {team.length} membros · {tasks.filter((t: any) => t.status !== "done").length} tarefas em aberto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Filter} size="sm">Filtros</Button>
          <Button variant="primary" icon={UserPlus} size="sm">Convidar</Button>
        </div>
      </div>

      <Tabs tabs={tabs} active={view} onChange={setView} variant="pills" />

      {view === "team" ? (
        lTeam ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((m: any) => {
              const myTasks = tasks.filter((t: any) => t.owner_id === m.id && t.status !== "done");
              const load = (myTasks.length / 20) * 100;
              const color = m.role === 'admin' ? '#0F172A' : m.role === 'manager' ? '#e01c1c' : '#10b981';
              return (
                <Card key={m.id} hoverable>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.full_name ?? m.email} color={color} size="lg" status="online" />
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">{m.full_name ?? m.email}</p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold capitalize">{m.role}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Carga</span>
                        <span className="text-[12px] font-bold text-slate-900 dark:text-white">{myTasks.length} tarefas</span>
                      </div>
                      <ProgressBar value={load} tone={load > 80 ? "danger" : load > 60 ? "warning" : "success"} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" icon={MessageSquare} fullWidth>Mensagem</Button>
                    <Button size="sm" variant="ghost" icon={Briefcase} />
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : lTasks ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {TASK_COLUMNS.map(c => <Skeleton key={c.id} className="h-96" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {TASK_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t: any) => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 p-3 min-h-[400px]">
                <div className="px-2 pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">{col.title}</h3>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">{colTasks.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t: any) => (
                    <div key={t.id} className="p-3.5 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-slate-300")} />
                        {t.client_name && <Badge tone="brand" size="sm">{t.client_name}</Badge>}
                      </div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{t.title}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <Avatar name={t.owner_name ?? "?"} size="xs" color="#ff8732" />
                        <span className="text-[11px] text-slate-500 font-bold">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
