import React, { useState } from "react";
import { X, Save, FileSignature } from "lucide-react";
import { cn } from "../lib/cn";
import { supabase } from "../lib/supabase";
import { useClients } from "../lib/api";
import { useToast } from "./ui/Toast";

type ContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function ContractModal({ isOpen, onClose, onSave }: ContractModalProps) {
  const toast = useToast();
  const { data: clients = [] } = useClients();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "",
    scope: "",
    monthly_value: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    status: "active",
    signed: false,
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.client_id) return toast.error("Selecione um cliente");
    if (!formData.scope) return toast.error("Insira o escopo do contrato");
    if (!formData.monthly_value) return toast.error("Insira o valor mensal");

    setSaving(true);
    try {
      const payload = {
        client_id: formData.client_id,
        scope: formData.scope,
        monthly_value: Number(formData.monthly_value),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        signed: formData.signed,
      };

      const { error } = await supabase.from("contracts").insert(payload);
      
      if (error) {
        console.error("Erro ao criar contrato", error);
        alert("Erro ao criar contrato: " + (error.message || "Erro desconhecido"));
      } else {
        toast.success("Contrato criado com sucesso!");
        onSave();
      }
    } catch (err: any) {
      console.error("Exceção", err);
      alert("Erro inesperado: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
               <FileSignature size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Contrato</h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Criar e registrar contrato com cliente</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cliente</label>
            <select 
              value={formData.client_id} 
              onChange={e => handleChange("client_id", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Escopo / Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Gestão de Tráfego + CRM"
              value={formData.scope} 
              onChange={e => handleChange("scope", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valor Mensal (MRR)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.monthly_value} 
                onChange={e => handleChange("monthly_value", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <select 
                value={formData.status} 
                onChange={e => handleChange("status", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="active">Ativo</option>
                <option value="expiring">Renovando</option>
                <option value="canceled">Cancelado</option>
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
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vencimento (Fim)</label>
              <input 
                type="date" 
                value={formData.end_date} 
                onChange={e => handleChange("end_date", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="signed_checkbox"
              checked={formData.signed}
              onChange={e => handleChange("signed", e.target.checked)}
              className="w-4 h-4 text-[#EF4444] border-slate-300 rounded focus:ring-[#EF4444]"
            />
            <label htmlFor="signed_checkbox" className="text-[13px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Contrato já foi assinado pelo cliente
            </label>
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
            <Save size={16} /> {saving ? "Salvando..." : "Criar Contrato"}
          </button>
        </div>

      </div>
    </div>
  );
}
