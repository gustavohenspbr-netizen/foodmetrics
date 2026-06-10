import React, { useState } from "react";
import { UserPlus, Filter, MessageSquare, MoreVertical, Briefcase, Plus, Folder, LayoutList, ChevronRight, ChevronDown } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs } from "../../components/ui/Tabs";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { useTeam, useTasks, useProjectSpaces, useProjectFolders, useProjectLists } from "../../lib/api";
import { cn } from "../../lib/cn";
import { TaskModal } from "../../components/TaskModal";
import { MemberModal } from "../../components/MemberModal";

const TASK_COLUMNS = [
  { id: "todo", title: "A fazer", color: "#94a3b8" },
  { id: "in_progress", title: "Em andamento", color: "#f59e0b" },
  { id: "review", title: "Em revisão", color: "#3b82f6" },
  { id: "done", title: "Concluído", color: "#10b981" },
];

export function TeamView() {
  const [view, setView] = useState("team");
  
  const { data: team = [], loading: lTeam } = useTeam();
  const { data: tasks = [], loading: lTasks, refetch: refetchTasks } = useTasks();
  const { data: spaces = [] } = useProjectSpaces();
  const { data: folders = [] } = useProjectFolders();
  const { data: lists = [] } = useProjectLists();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const tabs = [
    { id: "team", label: "Equipe", count: team.length },
    { id: "tasks", label: "Tarefas (Projetos)", count: tasks.length },
  ];

  const handleOpenTask = (task?: any) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const handleOpenMember = (member: any) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  const displayedTasks = selectedListId ? tasks.filter((t: any) => t.list_id === selectedListId) : tasks;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Projetos & Equipe</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {team.length} membros · {tasks.filter((t: any) => t.status !== "done").length} tarefas pendentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Filter} size="sm">Filtros</Button>
          <Button variant="outline" icon={UserPlus} size="sm" onClick={() => setIsInviteModalOpen(true)}>Convidar</Button>
          <Button variant="primary" icon={Plus} size="sm" onClick={() => handleOpenTask()}>Nova Tarefa</Button>
        </div>
      </div>

      <Tabs tabs={tabs} active={view} onChange={setView} variant="pills" />

      {view === "team" ? (
        lTeam ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto custom-scrollbar pb-10">
            {team.map((m: any) => {
              const myTasks = tasks.filter((t: any) => t.owner_id === m.id && t.status !== "done");
              const load = (myTasks.length / 20) * 100;
              const color = m.role === 'admin' ? '#0F172A' : m.role === 'manager' ? '#e01c1c' : '#10b981';
              return (
                <Card key={m.id} hoverable onClick={() => handleOpenMember(m)} className="cursor-pointer border border-transparent hover:border-[#EF4444]/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.full_name ?? m.email} color={color} size="lg" status="online" />
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">{m.full_name ?? m.email}</p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold capitalize">{m.role}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); handleOpenMember(m); }}><Briefcase size={16} /></button>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Carga de Trabalho</span>
                        <span className="text-[12px] font-bold text-slate-900 dark:text-white">{myTasks.length} tarefas</span>
                      </div>
                      <ProgressBar value={load} tone={load > 80 ? "danger" : load > 60 ? "warning" : "success"} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" icon={MessageSquare} fullWidth onClick={(e) => { e.stopPropagation(); alert('Em breve'); }}>Mensagem</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex flex-1 gap-4 overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          
          {/* ClickUp Sidebar */}
          <div className="w-64 shrink-0 bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#0B0B0B]">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Spaces & Pastas</span>
              <button className="text-slate-400 hover:text-[#EF4444]"><Plus size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <button 
                 onClick={() => setSelectedListId(null)}
                 className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors", !selectedListId ? "bg-[#EF4444]/10 text-[#EF4444]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5")}
              >
                <LayoutList size={16} /> Tudo
              </button>
              
              <div className="mt-4 space-y-4">
                {spaces.length === 0 && (
                   <p className="text-xs text-center text-slate-400 px-4">Sem spaces criados. Crie via banco de dados ou painel em breve.</p>
                )}
                {spaces.map((s: any) => (
                  <div key={s.id}>
                    <div className="flex items-center gap-2 px-2 py-1 text-slate-900 dark:text-white font-bold text-sm">
                      <ChevronDown size={14} className="text-slate-400" />
                      {s.name}
                    </div>
                    {/* Folders in Space */}
                    <div className="pl-4 mt-1 space-y-2">
                      {folders.filter((f: any) => f.space_id === s.id).map((f: any) => (
                        <div key={f.id}>
                          <div className="flex items-center gap-2 px-2 py-1 text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                            <Folder size={14} className="text-slate-400" />
                            {f.name}
                          </div>
                          {/* Lists in Folder */}
                          <div className="pl-5 mt-1 space-y-0.5">
                            {lists.filter((l: any) => l.folder_id === f.id).map((l: any) => (
                              <button
                                key={l.id}
                                onClick={() => setSelectedListId(l.id)}
                                className={cn("w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] font-medium transition-colors", selectedListId === l.id ? "bg-[#EF4444]/10 text-[#EF4444]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5")}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color || '#94a3b8' }} />
                                {l.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-4 pb-4">
            {lTasks ? (
               TASK_COLUMNS.map(c => <Skeleton key={c.id} className="min-w-[280px] h-full rounded-2xl" />)
            ) : (
              TASK_COLUMNS.map((col) => {
                const colTasks = displayedTasks.filter((t: any) => t.status === col.id);
                return (
                  <div key={col.id} className="flex flex-col min-w-[280px] w-[300px] rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 p-3 h-full">
                    <div className="px-2 pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">{col.title}</h3>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">{colTasks.length}</span>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {colTasks.map((t: any) => (
                        <div 
                           key={t.id} 
                           onClick={() => handleOpenTask(t)}
                           className="p-3.5 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className={cn("w-1.5 h-1.5 rounded-full", t.priority === "urgent" ? "bg-red-600" : t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-amber-500" : "bg-slate-300")} />
                            {lists.find((l:any)=>l.id === t.list_id) && (
                              <Badge tone="neutral" size="sm">{lists.find((l:any)=>l.id === t.list_id)?.name}</Badge>
                            )}
                          </div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{t.title}</p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                            {t.owner_id ? (
                               <Avatar name={team.find((m:any)=>m.id === t.owner_id)?.full_name || "?"} size="xs" color="#3b82f6" />
                            ) : (
                               <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-400 flex items-center justify-center">
                                  <UserPlus size={10} className="text-slate-500" />
                               </div>
                            )}
                            <span className="text-[11px] text-slate-500 font-bold">
                              {t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        preselectedListId={selectedListId || undefined}
        onSave={() => {
          setIsTaskModalOpen(false);
          refetchTasks();
        }}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        member={selectedMember}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
