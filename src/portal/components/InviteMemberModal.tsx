import React, { useState } from "react";
import { X, Send, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/Toast";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "manager", // admin, manager
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.email) return toast.error("Insira o e-mail");
    if (!formData.full_name) return toast.error("Insira o nome");

    setSaving(true);
    try {
      // In a real app we'd call Supabase auth.admin.inviteUserByEmail 
      // or Edge Function to invite.
      // For demo, we just create a profile directly so they appear in the UI.
      const payload = {
        // use a random UUID for demo
        id: crypto.randomUUID(),
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
      };

      const { error } = await supabase.from("profiles").insert(payload);
      
      if (error) {
        toast.error("Erro ao convidar", error.message);
      } else {
        toast.success("Convite enviado!", `Um e-mail foi enviado para ${formData.email}`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
               <UserPlus size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convidar Membro</h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Adicionar à equipe</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Ex: João Silva"
              value={formData.full_name} 
              onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              placeholder="joao@empresa.com"
              value={formData.email} 
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nível de Acesso</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500/50 appearance-none transition-colors"
            >
              <option value="manager">Manager (Gerente de Contas)</option>
              <option value="admin">Admin (Acesso Total)</option>
            </select>
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
            className="px-5 py-2 text-sm font-bold text-white dark:text-slate-900 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send size={16} /> {saving ? "Enviando..." : "Enviar Convite"}
          </button>
        </div>

      </div>
    </div>
  );
}
