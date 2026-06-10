import React, { useState, useEffect } from "react";
import { X, User, Briefcase, CheckCircle2, Clock, Settings, Save, Shield, Phone, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { useTasks } from "../lib/api";
import { useToast } from "./ui/Toast";
import { supabase } from "../lib/supabase";

type MemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  onSave?: () => void;
};

export function MemberModal({ isOpen, onClose, member, onSave }: MemberModalProps) {
  const toast = useToast();
  const { data: tasks = [] } = useTasks();

  const [activeTab, setActiveTab] = useState<"overview" | "config">("overview");
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("manager");
  const [isActive, setIsActive] = useState(true);

  // Load member info into form state when member changes
  useEffect(() => {
    if (member) {
      setFullName(member.full_name || "");
      setPhone(member.phone || "");
      setRole(member.role || "manager");
      setIsActive(member.is_active !== false);
      setActiveTab("overview"); // reset to overview tab
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const memberTasks = tasks.filter((t: any) => t.owner_id === member.id);
  const openTasks = memberTasks.filter((t: any) => t.status !== "done");
  const doneTasks = memberTasks.filter((t: any) => t.status === "done");

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      return toast.error("O nome completo não pode ficar vazio.");
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          role: role,
          is_active: isActive,
        })
        .eq("id", member.id);

      if (error) {
        toast.error("Erro ao salvar configurações", error.message);
      } else {
        toast.success("Membro atualizado com sucesso!");
        if (onSave) onSave();
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<string, string> = {
    admin: "#0F172A",
    manager: "#e01c1c",
    support: "#3b82f6",
    viewer: "#64748b",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0B0B] shrink-0">
          <div className="flex items-center gap-4">
            <Avatar name={fullName || member.email} size="xl" status={isActive ? "online" : "offline"} color={roleColors[role] || "#10b981"} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {fullName || member.email}
                </h3>
                {!isActive && (
                  <Badge tone="danger" size="sm">Inativo</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold capitalize mt-0.5 flex items-center gap-1.5">
                <Shield size={12} className="text-slate-400" />
                {role} · {member.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 px-6 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#EF4444] text-[#EF4444]"
                : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            Visão Geral & Tarefas
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "config"
                ? "border-[#EF4444] text-[#EF4444]"
                : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <Settings size={14} /> Configurações
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-[#151515] rounded-xl p-4 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tarefas Pendentes</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{openTasks.length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#151515] rounded-xl p-4 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tarefas Concluídas</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{doneTasks.length}</p>
                </div>
              </div>

              {/* Task list */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Lista de Tarefas</h4>
                {memberTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 dark:bg-[#151515] rounded-lg border border-slate-200 dark:border-white/10">
                    Nenhuma tarefa associada a este membro.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {openTasks.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name || t.title}</p>
                        </div>
                        <Badge tone="warning" size="sm">Em Aberto</Badge>
                      </div>
                    ))}
                    {doneTasks.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 rounded-xl opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-through">{t.name || t.title}</p>
                        </div>
                        <Badge tone="success" size="sm">Concluído</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Config Form */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nome do funcionário"
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail de Cadastro</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={member.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-slate-500 dark:text-slate-400 text-[13px] cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">O e-mail é vinculado à conta de login e não pode ser alterado.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(99) 99999-9999"
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nível de Acesso (Cargo)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
                  >
                    <option value="admin">Admin (Acesso Total)</option>
                    <option value="manager">Manager (Gerente de Contas)</option>
                    <option value="support">Suporte</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status do Membro</label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="flex items-center justify-between w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold">{isActive ? "Acesso Habilitado" : "Acesso Bloqueado"}</span>
                    {isActive ? (
                      <ToggleRight size={22} className="text-[#10b981]" />
                    ) : (
                      <ToggleLeft size={22} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "config" && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] flex justify-end gap-3 shrink-0">
            <button
              onClick={() => {
                setFullName(member.full_name || "");
                setPhone(member.phone || "");
                setRole(member.role || "manager");
                setIsActive(member.is_active !== false);
                setActiveTab("overview");
              }}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-white dark:text-slate-900 bg-[#EF4444] hover:bg-[#EF4444]/90 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
