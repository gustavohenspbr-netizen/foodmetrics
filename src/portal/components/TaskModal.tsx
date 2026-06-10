import React, { useState } from "react";
import { X, Save, CheckSquare } from "lucide-react";
import { cn } from "../lib/cn";
import { createProjectTask, updateProjectTask, useTeam, useProjectLists } from "../lib/api";
import { useToast } from "./ui/Toast";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: any;
  preselectedListId?: string;
  preselectedOwnerId?: string;
};

export function TaskModal({ isOpen, onClose, onSave, task, preselectedListId, preselectedOwnerId }: TaskModalProps) {
  const toast = useToast();
  const { data: team = [] } = useTeam();
  const { data: lists = [] } = useProjectLists();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.name || task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    list_id: task?.list_id || preselectedListId || "",
    owner_id: task?.owner_id || preselectedOwnerId || "",
    start_date: task?.start_date ? new Date(task.start_date).toISOString().slice(0, 10) : "",
    due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : "",
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title) return toast.error("Insira o título da tarefa");

    setSaving(true);
    try {
      const payload = {
        name: formData.title, // DB usa "name"
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        list_id: formData.list_id || null,
        owner_id: formData.owner_id || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      };

      if (task?.id) {
        await updateProjectTask(task.id, payload);
        toast.success("Tarefa atualizada!");
      } else {
        await createProjectTask(payload);
        toast.success("Tarefa criada com sucesso!");
      }
      onSave();
    } catch (err: any) {
      console.error("Erro ao salvar tarefa", err);
      alert("Erro ao salvar tarefa: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
               <CheckSquare size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                 {task ? "Editar Tarefa" : "Nova Tarefa"}
               </h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Definir responsáveis, prazos e prioridade</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Título da Tarefa</label>
            <input 
              type="text" 
              placeholder="Ex: Criar campanha no Google Ads"
              value={formData.title} 
              onChange={e => handleChange("title", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
            <textarea 
              rows={3}
              placeholder="Detalhes adicionais..."
              value={formData.description} 
              onChange={e => handleChange("description", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors custom-scrollbar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Responsável</label>
              <select 
                value={formData.owner_id} 
                onChange={e => handleChange("owner_id", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="">Nenhum (Em Aberto)</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lista / Pasta</label>
              <select 
                value={formData.list_id} 
                onChange={e => handleChange("list_id", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="">Geral</option>
                {lists.map((l: any) => <option key={l.id} value={l.id}>{l.folder?.name ? `${l.folder.name} > ` : ''}{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prioridade</label>
              <select 
                value={formData.priority} 
                onChange={e => handleChange("priority", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <select 
                value={formData.status} 
                onChange={e => handleChange("status", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data de Início</label>
              <input 
                type="date" 
                value={formData.start_date} 
                onChange={e => handleChange("start_date", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data de Entrega</label>
              <input 
                type="date" 
                value={formData.due_date} 
                onChange={e => handleChange("due_date", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white dark:text-slate-900 bg-[#EF4444] hover:bg-[#EF4444]/90 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Salvando..." : "Salvar Tarefa"}
          </button>
        </div>

      </div>
    </div>
  );
}
