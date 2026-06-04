import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable, useDraggable,
} from "@dnd-kit/core";
import { Plus, Search, Filter, Phone, Activity, LayoutGrid, List, Calendar, TrendingUp, User, Clock } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { fmt } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useLeads, updateLeadStatus, useTeam } from "../../lib/api";
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
  const { data: team = [] } = useTeam();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST" | "CALENDAR" | "METRICS">("BOARD");
  const [groupBy, setGroupBy] = useState<"status" | "owner">("status");
  const [search, setSearch] = useState("");

  useEffect(() => { 
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

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      !search || 
      l.name?.toLowerCase().includes(search.toLowerCase()) || 
      l.company_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [leads, search]);

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    if (groupBy === "status") {
      COLUMNS.forEach((c) => map.set(c.id, []));
      filteredLeads.forEach((l) => map.get(l.status)?.push(l));
    } else if (groupBy === "owner") {
      map.set("unassigned", []);
      team.forEach(t => map.set(t.id, []));
      filteredLeads.forEach((l) => {
        if (l.owner_id && map.has(l.owner_id)) {
          map.get(l.owner_id)?.push(l);
        } else {
          map.get("unassigned")?.push(l);
        }
      });
    }
    return map;
  }, [filteredLeads, groupBy, team]);

  const totalLeads = leads.length;
  const ativos = leads.filter((l) => l.status !== "Fechamento").length;
  const conversao = totalLeads > 0 ? (leads.filter(l => l.status === "Fechamento").length / totalLeads) * 100 : 0;
  const receita = leads.filter((l) => l.status === "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const newGroupId = String(over.id);
    
    // Only support drag drop for status grouping right now
    if (groupBy !== "status") {
      toast.error("Arraste e solte apenas disponível no agrupamento por Status no momento.");
      return;
    }

    if (!COLUMNS.find((c) => c.id === newGroupId)) return;
    const leadId = String(active.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newGroupId) return;
    
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newGroupId } : l)));
    const { error } = await updateLeadStatus(leadId, newGroupId);
    if (error) {
      toast.error("Falha ao mover", error.message);
      refetch();
    } else {
      toast.success("Lead movido", `${lead.name} → ${COLUMNS.find(c => c.id === newGroupId)?.title}`);
    }
  }

  return (
    <div className="min-h-full bg-[#0B0B0B] text-white -mx-6 -my-6 p-6 font-inter flex flex-col h-screen overflow-hidden">
      
      {/* Top Header - ClickUp Style */}
      <div className="flex flex-col gap-4 mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight text-white">CRM Comercial</h1>
            <div className="h-6 w-px bg-white/10" />
            
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-[#151515] p-1 rounded-lg border border-white/5">
              <ViewTab active={viewMode === "BOARD"} onClick={() => setViewMode("BOARD")} icon={<LayoutGrid size={14} />} label="Board" />
              <ViewTab active={viewMode === "LIST"} onClick={() => setViewMode("LIST")} icon={<List size={14} />} label="Lista" />
              <ViewTab active={viewMode === "CALENDAR"} onClick={() => setViewMode("CALENDAR")} icon={<Calendar size={14} />} label="Calendário" />
              <ViewTab active={viewMode === "METRICS"} onClick={() => setViewMode("METRICS")} icon={<TrendingUp size={14} />} label="Métricas" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar leads..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#151515] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#C8FF00]/50 w-64 transition-colors"
              />
            </div>
            <button 
              onClick={() => setIsNewOpen(true)}
              className="bg-[#C8FF00] hover:bg-[#C8FF00]/90 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Novo Negócio
            </button>
          </div>
        </div>

        {/* Filters bar */}
        {viewMode === "BOARD" && (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Agrupar por:</span>
            <select 
              value={groupBy} 
              onChange={(e: any) => setGroupBy(e.target.value)}
              className="bg-transparent border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-[#C8FF00]/50"
            >
              <option value="status" className="bg-black">Status (Funil)</option>
              <option value="owner" className="bg-black">Responsável</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/50">Carregando CRM...</div>
        ) : (
          <>
            {viewMode === "BOARD" && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar items-start">
                  {groupBy === "status" ? (
                    COLUMNS.map((col) => {
                      const colLeads = groups.get(col.id) ?? [];
                      return (
                        <KanbanColumn key={col.id} id={col.id} title={col.title} color={col.color} count={colLeads.length}>
                          {colLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />)}
                        </KanbanColumn>
                      );
                    })
                  ) : (
                    <>
                      {team.map(t => {
                        const colLeads = groups.get(t.id) ?? [];
                        return (
                          <KanbanColumn key={t.id} id={t.id} title={t.full_name || "Membro"} color="#C8FF00" count={colLeads.length}>
                            {colLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />)}
                          </KanbanColumn>
                        );
                      })}
                      <KanbanColumn id="unassigned" title="SEM RESPONSÁVEL" color="#64748b" count={(groups.get("unassigned") ?? []).length}>
                         {(groups.get("unassigned") ?? []).map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />)}
                      </KanbanColumn>
                    </>
                  )}
                </div>
              </DndContext>
            )}

            {viewMode === "LIST" && (
              <div className="h-full overflow-auto custom-scrollbar bg-[#111111] rounded-xl border border-white/5">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#151515] sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="p-4 font-semibold">Nome / Empresa</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Responsável</th>
                      <th className="p-4 font-semibold">Valor</th>
                      <th className="p-4 font-semibold">Origem</th>
                      <th className="p-4 font-semibold">Próxima Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-white/[0.02] cursor-pointer transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-white group-hover:text-[#C8FF00] transition-colors">{lead.name || "Sem Nome"}</div>
                          <div className="text-xs text-slate-500">{lead.company_name || "Empresa não informada"}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border" style={{
                            color: COLUMNS.find(c => c.id === lead.status)?.color || "#fff",
                            borderColor: `${COLUMNS.find(c => c.id === lead.status)?.color || "#fff"}30`,
                            backgroundColor: `${COLUMNS.find(c => c.id === lead.status)?.color || "#fff"}10`,
                          }}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {lead.owner_avatar ? (
                              <img src={lead.owner_avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                <User size={12} className="text-slate-400" />
                              </div>
                            )}
                            <span className="text-slate-300">{lead.owner_name || "Não atribuído"}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#C8FF00]">{fmt.currencyCompact(Number(lead.value ?? 0))}</td>
                        <td className="p-4 text-slate-400">{lead.source || "N/A"}</td>
                        <td className="p-4">
                          {lead.next_action_date ? (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Calendar size={14} className="text-slate-500" />
                              <span>{new Date(lead.next_action_date).toLocaleDateString()}</span>
                            </div>
                          ) : <span className="text-slate-600">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === "CALENDAR" && (
              <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                <Calendar size={48} className="text-slate-700" />
                <p>Visualização de Calendário (Próximas Ações) em desenvolvimento.</p>
              </div>
            )}

            {viewMode === "METRICS" && (
              <div className="h-full overflow-auto custom-scrollbar p-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <MetricCard label="TOTAL LEADS" value={String(totalLeads)} />
                  <MetricCard label="ATIVOS NO FUNIL" value={String(ativos)} valueColor="#3b82f6" />
                  <MetricCard label="CONVERSÃO" value={`${conversao.toFixed(1)}%`} valueColor="#C8FF00" />
                  <MetricCard label="RECEITA GERADA" value={fmt.currencyCompact(receita)} valueColor="#C8FF00" />
                </div>
                <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Distribuição do Funil</h3>
                   <div className="space-y-4">
                     {COLUMNS.map(col => {
                       const count = leads.filter(l => l.status === col.id).length;
                       const pct = totalLeads ? (count / totalLeads) * 100 : 0;
                       return (
                         <div key={col.id} className="flex items-center gap-4">
                           <div className="w-32 text-xs font-bold text-slate-300 text-right">{col.title}</div>
                           <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col.color }} />
                           </div>
                           <div className="w-12 text-xs text-slate-500">{count}</div>
                         </div>
                       )
                     })}
                   </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(selectedLead || isNewOpen) && (
        <LeadDetailModal 
          isOpen={!!selectedLead || isNewOpen} 
          onClose={() => { setSelectedLead(null); setIsNewOpen(false); }} 
          lead={selectedLead || { status: "Pesquisado" }}
          isNew={isNewOpen}
          team={team}
          onSave={async (updatedLead) => {
            if (isNewOpen) {
              // Create Lead API call will be handled in Modal or here
              toast.success("Lead criado com sucesso!");
            } else {
              setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l));
              toast.success("Lead salvo com sucesso!");
            }
            setSelectedLead(null);
            setIsNewOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function ViewTab({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
        active ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      {icon} {label}
    </button>
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

function KanbanColumn({ id, title, color, count, children }: any) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[320px] shrink-0 transition-colors h-full",
        isOver && "bg-white/[0.02] rounded-xl"
      )}
    >
      <div className="mb-4 sticky top-0 bg-[#0B0B0B] z-10 pt-1 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-black text-white tracking-widest">{title}</h3>
          </div>
          <span className="text-[11px] font-bold text-white/50 px-2 py-0.5 rounded-full bg-white/10">{count}</span>
        </div>
        <div className="h-0.5 w-full mt-2 rounded-full opacity-50" style={{ background: color }} />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pb-20 pr-1">
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
        if (!isDragging) onClick();
      }}
      className={cn(
        "p-4 bg-[#111111] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-[#151515] transition-all group",
        isDragging && "opacity-50 border-[#C8FF00]/50 shadow-2xl z-50 scale-105"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[14px] font-bold text-white group-hover:text-[#C8FF00] transition-colors line-clamp-1 pr-2">{lead.name || "Sem Nome"}</h4>
        <div className="shrink-0 bg-white/5 text-white/70 px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10">
          {lead.probability || 10}%
        </div>
      </div>
      
      <p className="text-xs text-slate-400 mb-4 line-clamp-1">{lead.company_name}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {lead.owner_avatar ? (
             <img src={lead.owner_avatar} className="w-5 h-5 rounded-full" title={lead.owner_name} alt="avatar" />
          ) : (
             <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center" title={lead.owner_name}>
                <User size={10} className="text-slate-400" />
             </div>
          )}
          <span className="text-[10px] text-slate-500 font-bold uppercase">{lead.source || "ORGÂNICO"}</span>
        </div>
        <p className="text-[#C8FF00] font-black text-sm">
          {fmt.currencyCompact(Number(lead.value ?? 0))}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        {lead.next_action_date ? (
          <div className="flex items-center gap-1.5 text-slate-400 bg-white/5 px-2 py-1 rounded">
             <Clock size={10} />
             <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(lead.next_action_date).toLocaleDateString()}</span>
          </div>
        ) : (
           <div className="flex items-center gap-1.5 text-red-400/80 bg-red-500/10 px-2 py-1 rounded">
             <Activity size={10} />
             <span className="text-[9px] font-bold uppercase tracking-wider">Sem Ação</span>
          </div>
        )}
        
        {lead.phone && (
          <div className="flex items-center gap-1 text-slate-500">
            <Phone size={10} />
            <span className="text-[10px] font-mono">{String(lead.phone).slice(-4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
