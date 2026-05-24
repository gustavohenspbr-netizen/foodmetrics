import React, { useState } from "react";
import { X, Trash2, Save, Send } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./ui/Button";

type LeadDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
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

export function LeadDetailModal({ isOpen, onClose, lead, onSave }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"DADOS" | "SPIN NOTES" | "ATIVIDADES">("DADOS");
  // Assume form state would be here
  const [formData, setFormData] = useState({ ...lead });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111111] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {lead?.name || "Novo Lead"}
          </h2>
          <div className="flex items-center gap-2">
            <button className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar (Stages) */}
        <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {STAGES.map((stage, idx) => {
            const isActive = lead?.status === stage || (idx === 0 && !lead?.status);
            const isPast = STAGES.indexOf(lead?.status) > idx;
            return (
              <div key={stage} className="flex items-center flex-shrink-0">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                  isActive ? "border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/10" 
                  : isPast ? "border-white/20 text-white bg-white/5" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
                )}>
                  {/* Icon placeholder or dynamic based on stage could go here */}
                  <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#C8FF00]" : isPast ? "bg-white" : "bg-slate-600")} />
                  {stage}
                </div>
                {idx < STAGES.length - 1 && (
                  <div className="w-4 h-[1px] bg-white/10 mx-1" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="px-6 mb-4">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C8FF00]/50 to-[#C8FF00] rounded-full" style={{ width: '15%' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-white/10">
          {["DADOS", "SPIN NOTES", "ATIVIDADES (0)"].map((tab) => {
            const val = tab.split(" ")[0]; // Just a hack to match "ATIVIDADES"
            const realTab = val === "ATIVIDADES" ? "ATIVIDADES" : tab as any;
            const active = activeTab === realTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(realTab)}
                className={cn(
                  "px-4 py-3 text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors",
                  active ? "border-[#C8FF00] text-[#C8FF00]" : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === "DADOS" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="NOME DO DECISOR *">
                  <Input defaultValue={lead?.name || ""} placeholder="Nome" />
                </FormGroup>
                <FormGroup label="EMPRESA">
                  <Input defaultValue={lead?.company_name || ""} placeholder="Nome da empresa" />
                </FormGroup>
              </div>

              <FormGroup label="VENDEDOR RESPONSÁVEL">
                <Select defaultValue={lead?.owner_id || ""}>
                  <option value="">Sem vendedor atribuído</option>
                  <option value="user1">Angelo Garcia</option>
                </Select>
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="TELEFONE / WHATSAPP">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      className="flex-1 bg-black/50 border border-white/10 rounded-l-lg px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50" 
                      defaultValue={lead?.phone || ""}
                      placeholder="Ex: 11 99999-9999"
                    />
                    <button className="bg-[#10b981] hover:bg-[#10b981]/90 text-white px-4 py-2.5 rounded-r-lg font-semibold text-[13px] flex items-center gap-1.5 transition-colors h-full">
                      <Send size={14} /> Enviar
                    </button>
                  </div>
                </FormGroup>
                <FormGroup label="EMAIL">
                  <Input defaultValue={lead?.email || ""} placeholder="email@empresa.com" />
                </FormGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="INSTAGRAM">
                  <Input defaultValue={lead?.instagram || ""} placeholder="@empresa" />
                </FormGroup>
                <FormGroup label="LINKEDIN">
                  <Input defaultValue={lead?.linkedin || ""} placeholder="linkedin.com/in/..." />
                </FormGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="ORIGEM *">
                  <Select defaultValue={lead?.source || "Meta Ads"}>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="Indicação">Indicação</option>
                  </Select>
                </FormGroup>
                <FormGroup label="CANAL PREFERIDO">
                  <Select defaultValue={lead?.preferred_channel || "WhatsApp"}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Telefone">Telefone</option>
                  </Select>
                </FormGroup>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">DADOS COMERCIAIS</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormGroup label="VALOR ESTIMADO (R$)">
                    <Input type="number" defaultValue={lead?.value || 0} />
                  </FormGroup>
                  <FormGroup label="CUSTO LEAD (R$)">
                    <Input type="number" defaultValue={lead?.cost || 0} />
                  </FormGroup>
                  <FormGroup label="PROBABILIDADE (%)">
                    <Input type="number" defaultValue={lead?.probability || 10} />
                  </FormGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormGroup label="DATA DESEJADA">
                  <Input type="date" />
                </FormGroup>
                <FormGroup label="TOQUE CADÊNCIA">
                  <Select>
                    <option value="T#1">Toque #1</option>
                    <option value="T#2">Toque #2</option>
                    <option value="T#3">Toque #3</option>
                  </Select>
                </FormGroup>
                <FormGroup label="PRÓXIMA AÇÃO">
                  <Input type="datetime-local" />
                </FormGroup>
              </div>

              <FormGroup label="DESCRIÇÃO PRÓXIMA AÇÃO">
                <Input placeholder="Ex: Ligar para apresentar o diagnóstico" />
              </FormGroup>

            </div>
          )}
          
          {activeTab === "SPIN NOTES" && (
            <div className="text-slate-400 text-sm">
              Implementação futura das SPIN Notes.
            </div>
          )}

          {activeTab === "ATIVIDADES" && (
            <div className="text-slate-400 text-sm">
              Implementação futura do histórico de atividades.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20">
          <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-white hover:text-slate-300 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave?.(formData)} className="px-5 py-2.5 text-[13px] font-bold text-black bg-[#C8FF00] hover:bg-[#C8FF00]/90 rounded-lg flex items-center gap-2 transition-colors">
            <Save size={16} /> Salvar Lead
          </button>
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
      className={cn("w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50 transition-colors", props.className)}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      {...props}
      className={cn("w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#C8FF00]/50 appearance-none transition-colors", props.className)}
    >
      {props.children}
    </select>
  );
}
