import React, { useState } from "react";
import { X, Trash2, Save, Send, Clock, User, Activity, MessageSquare, Phone, Mail, Calendar, Target, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { createLead, updateLead } from "../../lib/api";

type LeadDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  isNew?: boolean;
  team?: any[];
  onSave?: (lead: any) => void;
};

const STAGES = [
  "Pesquisado",
  "Contatado",
  "Respondeu",
  "Em Cadência",
  "Diagnóstico",
  "Proposta",
  "Fechamento"
];

export function LeadDetailModal({ isOpen, onClose, lead, isNew, team = [], onSave }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"DADOS" | "SPIN">("DADOS");
  const [formData, setFormData] = useState({ ...lead });
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        // Prepare payload, omitting arbitrary frontend fields if necessary
        const payload = {
          name: formData.name,
          company_name: formData.company_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status || "Pesquisado",
          value: Number(formData.value) || 0,
          probability: Number(formData.probability) || 10,
          source: formData.source,
          owner_id: formData.owner_id || null,
          next_action_date: formData.next_action_date || null,
          notes: formData.notes || null,
        };
        const { data, error } = await createLead(payload);
        if (!error && data) {
          onSave?.(data);
        } else {
          console.error("Erro ao criar lead", error);
        }
      } else {
        const payload = {
          name: formData.name,
          company_name: formData.company_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          value: Number(formData.value) || 0,
          probability: Number(formData.probability) || 10,
          source: formData.source,
          owner_id: formData.owner_id || null,
          next_action_date: formData.next_action_date || null,
          notes: formData.notes || null,
        };
        const { data, error } = await updateLead(lead.id, payload);
        if (!error && data) {
          onSave?.(data);
        } else {
          console.error("Erro ao atualizar lead", error);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      {/* ClickUp Style Split Layout: Left Data, Right Activities */}
      <div className="bg-[#111111] w-full max-w-6xl h-full max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: Fields & Data */}
        <div className="flex-1 flex flex-col border-r border-white/10 bg-[#0B0B0B]">
          {/* Left Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <Badge variant="outline" className="text-[#C8FF00] border-[#C8FF00]/30 bg-[#C8FF00]/10 text-[10px]">
                   {formData.status || "Pesquisado"}
                 </Badge>
              </div>
              <input 
                type="text" 
                value={formData.name || ""} 
                onChange={e => handleChange("name", e.target.value)}
                placeholder="Nome do Lead / Negócio"
                className="text-2xl font-bold text-white bg-transparent outline-none w-full placeholder:text-white/20"
              />
            </div>
            {/* Owner Selector */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Responsável</span>
              <select 
                 value={formData.owner_id || ""} 
                 onChange={e => handleChange("owner_id", e.target.value)}
                 className="bg-[#151515] border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#C8FF00]/50"
              >
                <option value="">Nenhum</option>
                {team.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Left Tabs */}
          <div className="flex px-6 border-b border-white/10 bg-[#111111]">
            <button
              onClick={() => setActiveTab("DADOS")}
              className={cn("px-4 py-3 text-[12px] font-bold tracking-wider uppercase border-b-2 transition-colors", activeTab === "DADOS" ? "border-[#C8FF00] text-[#C8FF00]" : "border-transparent text-slate-500 hover:text-slate-300")}
            >
              Campos Principais
            </button>
            <button
              onClick={() => setActiveTab("SPIN")}
              className={cn("px-4 py-3 text-[12px] font-bold tracking-wider uppercase border-b-2 transition-colors", activeTab === "SPIN" ? "border-[#C8FF00] text-[#C8FF00]" : "border-transparent text-slate-500 hover:text-slate-300")}
            >
              SPIN / BANT Notes
            </button>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {activeTab === "DADOS" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Empresa">
                    <Input value={formData.company_name || ""} onChange={e => handleChange("company_name", e.target.value)} placeholder="Nome da empresa" />
                  </FormGroup>
                  <FormGroup label="Origem">
                    <Select value={formData.source || ""} onChange={e => handleChange("source", e.target.value)}>
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Orgânico">Orgânico</option>
                      <option value="Indicação">Indicação</option>
                      <option value="Outro">Outro</option>
                    </Select>
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Telefone / WhatsApp">
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={formData.phone || ""} 
                        onChange={e => handleChange("phone", e.target.value)}
                        className="flex-1 bg-black/50 border border-white/10 rounded-l-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50" 
                        placeholder="Ex: 11 99999-9999"
                      />
                      <button className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-3 py-2 rounded-r-lg font-semibold text-[13px] flex items-center justify-center transition-colors">
                        <Phone size={14} />
                      </button>
                    </div>
                  </FormGroup>
                  <FormGroup label="E-mail">
                    <div className="flex items-center">
                       <input 
                         type="email" 
                         value={formData.email || ""} 
                         onChange={e => handleChange("email", e.target.value)}
                         className="flex-1 bg-black/50 border border-white/10 rounded-l-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50" 
                         placeholder="email@empresa.com"
                       />
                       <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-r-lg font-semibold text-[13px] flex items-center justify-center transition-colors">
                         <Mail size={14} />
                       </button>
                    </div>
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Valor (R$)">
                    <Input type="number" value={formData.value || ""} onChange={e => handleChange("value", e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Probabilidade (%)">
                    <Input type="number" value={formData.probability || ""} onChange={e => handleChange("probability", e.target.value)} />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Próxima Ação (Follow-up)">
                    <Input type="datetime-local" value={formData.next_action_date ? new Date(formData.next_action_date).toISOString().slice(0,16) : ""} onChange={e => handleChange("next_action_date", e.target.value ? new Date(e.target.value).toISOString() : "")} />
                  </FormGroup>
                  <FormGroup label="Status do Funil">
                    <Select value={formData.status || ""} onChange={e => handleChange("status", e.target.value)}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </FormGroup>
                </div>
              </>
            )}

            {activeTab === "SPIN" && (
              <div className="space-y-4">
                <FormGroup label="Situação (Contexto atual)">
                  <textarea rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#C8FF00]/50" placeholder="Qual o cenário do cliente?"></textarea>
                </FormGroup>
                <FormGroup label="Problema (Dores relatadas)">
                  <textarea rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#C8FF00]/50" placeholder="Quais os gargalos e problemas atuais?"></textarea>
                </FormGroup>
                <FormGroup label="Implicação (Consequências)">
                  <textarea rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#C8FF00]/50" placeholder="O que acontece se ele não resolver isso?"></textarea>
                </FormGroup>
                <FormGroup label="Necessidade (Como ajudamos)">
                  <textarea rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#C8FF00]/50" placeholder="Qual a solução ideal e como nos encaixamos?"></textarea>
                </FormGroup>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Activities / Comments */}
        <div className="w-full md:w-[400px] flex flex-col bg-[#111111]">
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
             <div className="flex items-center gap-2">
               <Activity size={16} className="text-[#C8FF00]" />
               <h3 className="text-sm font-bold text-white tracking-widest uppercase">Atividades</h3>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <X size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
             {/* Timeline Mock */}
             {!isNew && (
               <>
                 <div className="relative pl-6 border-l-2 border-white/5 pb-4">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#151515] border-2 border-white/10 flex items-center justify-center">
                     <Target size={10} className="text-blue-400" />
                   </div>
                   <p className="text-xs text-slate-400 mb-1">Ontem, 14:30</p>
                   <p className="text-sm text-white font-medium">Lead movido para <span className="text-[#06b6d4]">Respondeu</span></p>
                 </div>

                 <div className="relative pl-6 border-l-2 border-white/5 pb-4">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#151515] border-2 border-white/10 flex items-center justify-center">
                     <MessageSquare size={10} className="text-slate-400" />
                   </div>
                   <p className="text-xs text-slate-400 mb-1">Hoje, 09:15 - <span className="font-bold text-white">Angelo Garcia</span></p>
                   <div className="bg-white/5 rounded-lg p-3 text-sm text-slate-300">
                     Cliente pediu para retornar amanhã com a proposta final. Está aguardando aprovação do sócio.
                   </div>
                 </div>
               </>
             )}
             {isNew && (
                <div className="text-center text-slate-500 text-sm mt-10">
                   As atividades aparecerão aqui após criar o lead.
                </div>
             )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/10 bg-[#0B0B0B] shrink-0">
            <div className="relative">
              <textarea 
                rows={2}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Adicionar nota ou atualizar lead..."
                className="w-full bg-[#151515] border border-white/10 rounded-xl p-3 pr-10 text-sm text-white focus:outline-none focus:border-[#C8FF00]/50 custom-scrollbar resize-none"
              />
              <button className="absolute right-2 bottom-2 p-1.5 text-slate-400 hover:text-[#C8FF00] hover:bg-white/5 rounded-lg transition-colors">
                 <Send size={16} />
              </button>
            </div>
          </div>
          
          {/* Main Save Action inside right panel footer for ClickUp aesthetic */}
          <div className="p-4 border-t border-white/10 bg-[#151515] flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
               Cancelar
             </button>
             <button 
               onClick={handleSave} 
               disabled={saving}
               className="px-5 py-2 text-xs font-bold text-black bg-[#C8FF00] hover:bg-[#C8FF00]/90 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
             >
               <Save size={14} /> {saving ? "Salvando..." : "Salvar Modificações"}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props}
      className={cn("w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50 transition-colors", props.className)}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      {...props}
      className={cn("w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50 appearance-none transition-colors", props.className)}
    >
      {props.children}
    </select>
  );
}
