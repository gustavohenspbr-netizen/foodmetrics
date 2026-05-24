import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable, useDraggable,
} from "@dnd-kit/core";
import { Plus, Search, Filter, Phone, Activity } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { fmt } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useLeads, updateLeadStatus } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { LeadDetailModal } from "../../components/LeadDetailModal";

const COLUMNS = [
  { id: "Pesquisado", title: "PESQUISADO", color: "#3b82f6" },
  { id: "Contatado", title: "CONTATADO", color: "#a855f7" },
  { id: "Respondeu", title: "RESPONDEU", color: "#06b6d4" },
  { id: "Em Cadência", title: "EM CADÊNCIA", color: "#6366f1" },
  { id: "Diagnóstico", title: "DIAGNÓSTICO", color: "#eab308" },
  { id: "Proposta", title: "PROPOSTA", color: "#f97316" },
  { id: "Fechamento", title: "FECHAMENTO", color: "#10b981" },
];

export function CRMView() {
  const toast = useToast();
  const { data: dbLeads = [], loading, refetch } = useLeads();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("PIPELINE");

  useEffect(() => { 
    // Mapeamento automático dos status antigos para os novos se necessário
    const mappedLeads = dbLeads.map(l => {
      let status = l.status;
      if (status === "lead") status = "Pesquisado";
      if (status === "contacted") status = "Contatado";
      if (status === "proposal") status = "Proposta";
      if (status === "negotiation") status = "Diagnóstico";
      if (status === "won") status = "Fechamento";
      return { ...l, status: status || "Pesquisado" };
    });
    setLeads(mappedLeads); 
  }, [dbLeads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    COLUMNS.forEach((c) => map.set(c.id, []));
    leads.forEach((l) => map.get(l.status)?.push(l));
    return map;
  }, [leads]);

  const totalLeads = leads.length;
  const ativos = leads.filter((l) => l.status !== "Fechamento").length;
  const conversao = totalLeads > 0 ? (leads.filter(l => l.status === "Fechamento").length / totalLeads) * 100 : 0;
  const receita = leads.filter((l) => l.status === "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id);
    if (!COLUMNS.find((c) => c.id === newStatus)) return;
    const leadId = String(active.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    const { error } = await updateLeadStatus(leadId, newStatus);
    if (error) {
      toast.error("Falha ao mover", error.message);
      refetch();
    } else {
      toast.success("Lead movido", `${lead.name} → ${COLUMNS.find(c => c.id === newStatus)?.title}`);
    }
  }

  return (
    <div className="min-h-full bg-[#0B0B0B] text-white -mx-6 -my-6 p-6 font-inter overflow-hidden flex flex-col">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="TOTAL LEADS" value={String(totalLeads)} />
        <MetricCard label="ATIVOS NO FUNIL" value={String(ativos)} valueColor="#3b82f6" />
        <MetricCard label="CONVERSÃO" value={`${conversao.toFixed(1)}%`} valueColor="#C8FF00" />
        <MetricCard label="RECEITA GERADA" value={fmt.currencyCompact(receita)} valueColor="#C8FF00" />
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto custom-scrollbar">
        {["PIPELINE", "LEADS", "MENSAGENS", "MÉTRICAS", "DADOS DA EMPRESA"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 px-1 py-4 text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab ? "border-[#C8FF00] text-[#C8FF00]" : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            {tab === "PIPELINE" && <div className="flex gap-0.5"><div className="w-1 h-3 bg-current"/><div className="w-1 h-4 bg-current"/><div className="w-1 h-2 bg-current"/></div>}
            {tab}
          </button>
        ))}
      </div>

      {/* Board */}
      {activeTab === "PIPELINE" && (
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex gap-4 h-full">
              {COLUMNS.map(c => <div key={c.id} className="w-[320px] shrink-0 h-full bg-white/5 animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
                {COLUMNS.map((col) => {
                  const colLeads = groups.get(col.id) ?? [];
                  return (
                    <KanbanColumn key={col.id} col={col} count={colLeads.length}>
                      {colLeads.map((lead) => (
                        <LeadCard 
                          key={lead.id} 
                          lead={lead} 
                          onClick={() => setSelectedLead(lead)} 
                        />
                      ))}
                    </KanbanColumn>
                  );
                })}
              </div>
            </DndContext>
          )}
        </div>
      )}

      {selectedLead && (
        <LeadDetailModal 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
          lead={selectedLead}
          onSave={(updatedLead) => {
            // Save logic here
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l));
            setSelectedLead(null);
            toast.success("Lead salvo com sucesso!");
          }}
        />
      )}
    </div>
  );
}

function MetricCard({ label, value, valueColor = "white" }: { label: string, value: string, valueColor?: string }) {
  return (
    <div className="bg-[#151515] border border-white/5 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
        <Activity size={14} />
        <h3 className="text-[11px] font-bold tracking-widest uppercase">{label}</h3>
      </div>
      <p className="text-3xl font-black tracking-tight" style={{ color: valueColor }}>{value}</p>
    </div>
  );
}

function KanbanColumn({ col, count, children }: any) {
  const { isOver, setNodeRef } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[320px] shrink-0 transition-colors",
        isOver && "bg-white/[0.02] rounded-lg"
      )}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-white/40" />
            <h3 className="text-[13px] font-black text-white tracking-widest">{col.title}</h3>
          </div>
          <span className="text-[11px] font-bold text-white/50 px-2 py-0.5 rounded-full bg-white/10">{count}</span>
        </div>
        <div className="h-0.5 w-full mt-2 rounded-full opacity-50" style={{ background: col.color }} />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pb-10">
        {children}
      </div>
    </div>
  );
}

function LeadCard({ lead, onClick }: { lead: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent drag click from firing when we just want to drag
        // but if it's a real click, open modal
        if (!isDragging) onClick();
      }}
      className={cn(
        "p-4 bg-[#111111] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-[#151515] transition-all",
        isDragging && "opacity-50 border-[#C8FF00]/50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[14px] font-bold text-white">{lead.name || "Sem Nome"}</h4>
        <div className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded text-[10px] font-bold">
          {lead.probability || 10}%
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border border-[#3b82f6]/30">
          {lead.source || "META ADS"}
        </span>
        <span className="bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border border-[#a855f7]/30">
          {lead.touch || "T#1"}
        </span>
      </div>

      <p className="text-[#C8FF00] font-black text-lg mb-4">
        {fmt.currencyCompact(Number(lead.value ?? 0))}
      </p>

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5 text-[#f97316]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
          <span className="text-[10px] font-bold uppercase">Parado +24h</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Phone size={12} />
          <span className="text-[10px] font-mono">{lead.phone ? String(lead.phone).slice(-4) : "0000"}</span>
        </div>
      </div>
    </div>
  );
}
