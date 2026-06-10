import React from "react";
import { X, User, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { useTasks, useClients } from "../lib/api";

type MemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: any;
};

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { data: tasks = [] } = useTasks();
  const { data: clients = [] } = useClients();

  if (!isOpen || !member) return null;

  const memberTasks = tasks.filter((t: any) => t.owner_id === member.id);
  const openTasks = memberTasks.filter((t: any) => t.status !== "done");
  const doneTasks = memberTasks.filter((t: any) => t.status === "done");
  
  // Supondo que os clientes têm um account_manager_id ou podemos filtrar por clientes ativos.
  // Por simplicidade se não houver dono de cliente claro, mostramos apenas a quantidade ou um placeholder.
  // Para fins do ClickUp clone, focamos muito nas tarefas.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0B0B] shrink-0">
          <div className="flex items-center gap-4">
             <Avatar name={member.full_name || member.email} size="xl" status="online" />
             <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">{member.full_name || member.email}</h3>
               <p className="text-sm text-slate-500 font-medium capitalize mt-0.5">{member.role}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-[#151515] rounded-xl p-4 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Tarefas Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{openTasks.length}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#151515] rounded-xl p-4 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Tarefas Concluídas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{doneTasks.length}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-3">Lista de Tarefas</h4>
            {memberTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 dark:bg-[#151515] rounded-lg border border-slate-200 dark:border-white/10">
                Nenhuma tarefa associada a este membro.
              </p>
            ) : (
              <div className="space-y-2">
                {openTasks.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name || t.title}</p>
                    </div>
                    <Badge tone="warning">Em Aberto</Badge>
                  </div>
                ))}
                {doneTasks.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white line-through">{t.name || t.title}</p>
                    </div>
                    <Badge tone="success">Concluído</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
