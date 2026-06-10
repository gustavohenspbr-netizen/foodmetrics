import React, { useState } from "react";
import { X, Save, DollarSign } from "lucide-react";
import { cn } from "../lib/cn";
import { supabase } from "../lib/supabase";
import { useClients } from "../lib/api";
import { useToast } from "./ui/Toast";

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function InvoiceModal({ isOpen, onClose, onSave }: InvoiceModalProps) {
  const toast = useToast();
  const { data: clients = [] } = useClients();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "",
    description: "",
    amount: "",
    due_date: new Date().toISOString().slice(0, 10),
    status: "pending",
    payment_method: "pix",
    payment_link: "",
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.client_id) return toast.error("Selecione um cliente");
    if (!formData.description) return toast.error("Insira uma descrição");
    if (!formData.amount) return toast.error("Insira um valor");

    setSaving(true);
    try {
      const payload = {
        client_id: formData.client_id,
        description: formData.description,
        amount: Number(formData.amount),
        due_date: formData.due_date,
        status: formData.status,
        payment_method: formData.payment_method,
        url: formData.payment_link || null,
      };

      const { error } = await supabase.from("invoices").insert(payload);
      
      if (error) {
        console.error("Erro ao criar fatura", error);
        alert("Erro ao criar fatura: " + (error.message || "Erro desconhecido"));
      } else {
        toast.success("Cobrança criada com sucesso!");
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
             <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
               <DollarSign size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nova Cobrança</h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Criar fatura ou registro manual</p>
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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descrição / Serviço</label>
            <input 
              type="text" 
              placeholder="Ex: Mensalidade Google Ads"
              value={formData.description} 
              onChange={e => handleChange("description", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valor (R$)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.amount} 
                onChange={e => handleChange("amount", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data de Vencimento</label>
              <input 
                type="date" 
                value={formData.due_date} 
                onChange={e => handleChange("due_date", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Método de Pagamento</label>
              <select 
                value={formData.payment_method} 
                onChange={e => handleChange("payment_method", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
                <option value="transfer">Transferência / Ted</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Inicial</label>
              <select 
                value={formData.status} 
                onChange={e => handleChange("status", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 appearance-none transition-colors"
              >
                <option value="pending">Pendente (A Receber)</option>
                <option value="paid">Pago (Recebido)</option>
                <option value="overdue">Atrasado (Inadimplente)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Link de Pagamento (Opcional)</label>
            <input 
              type="url" 
              placeholder="https://mpago.la/..."
              value={formData.payment_link} 
              onChange={e => handleChange("payment_link", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-[13px] focus:outline-none focus:border-[#EF4444]/50 transition-colors"
            />
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
            <Save size={16} /> {saving ? "Salvando..." : "Criar Cobrança"}
          </button>
        </div>

      </div>
    </div>
  );
}
