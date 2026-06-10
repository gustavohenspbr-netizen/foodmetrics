import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable, useDraggable,
} from "@dnd-kit/core";
import {
  Plus, Search, LayoutGrid, List, Calendar, TrendingUp, User,
  Clock, ChevronUp, ChevronDown, Trash2, UserCheck, ArrowRight,
  Filter, X, DollarSign, Target, Zap, AlertCircle, CheckCircle,
  Phone, Mail, MessageCircle, ChevronLeft, ChevronRight, BarChart3,
  Flame, Timer, Building2, Tag,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { fmt } from "../../lib/format";
import { useLeads, updateLeadStatus, deleteLead, useTeam } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { LeadDetailModal } from "../../components/LeadDetailModal";

// ─── PIPELINE STAGES ───────────────────────────────────────────────────
const COLUMNS = [
  { id: "Pesquisado",  title: "PESQUISADO",  color: "#3b82f6", icon: "🔍" },
  { id: "Contatado",  title: "CONTATADO",   color: "#a855f7", icon: "📲" },
  { id: "Respondeu",  title: "RESPONDEU",   color: "#06b6d4", icon: "💬" },
  { id: "Em Cadência", title: "EM CADÊNCIA", color: "#6366f1", icon: "🔄" },
  { id: "Diagnóstico", title: "DIAGNÓSTICO", color: "#eab308", icon: "🩺" },
  { id: "Proposta",   title: "PROPOSTA",    color: "#f97316", icon: "📄" },
  { id: "Fechamento", title: "FECHAMENTO",  color: "#10b981", icon: "🏆" },
];

const SOURCES = ["Meta Ads", "Google Ads", "Orgânico", "Indicação", "Outro"];

type SortKey = "name" | "value" | "status" | "created_at" | "next_action_date";
type SortDir = "asc" | "desc";

// ─── HELPERS ───────────────────────────────────────────────────────────
function daysSince(dateStr: string | null) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
function probColor(p: number) {
  if (p >= 70) return "#10b981";
  if (p >= 40) return "#f97316";
  return "#ef4444";
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export function CRMView() {
  const toast = useToast();
  const { data: dbLeads = [], loading, refetch } = useLeads();
  const { data: team = [] } = useTeam();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST" | "CALENDAR" | "METRICS">("BOARD");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Filters
  const [filterOwner, setFilterOwner] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Sorting (list view)
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Map db leads to local status labels
  useEffect(() => {
    const mapped = dbLeads.map((l: any) => {
      let status = l.status;
      if (status === "lead") status = "Pesquisado";
      if (status === "contacted") status = "Contatado";
      if (status === "proposal") status = "Proposta";
      if (status === "negotiation") status = "Diagnóstico";
      if (status === "won") status = "Fechamento";
      return { ...l, status: status || "Pesquisado" };
    });
    setLeads(mapped);
  }, [dbLeads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── FILTERED + SORTED LEADS ──
  const filteredLeads = useMemo(() => {
    let list = leads.filter(l => {
      const matchSearch = !search
        || l.name?.toLowerCase().includes(search.toLowerCase())
        || l.company_name?.toLowerCase().includes(search.toLowerCase())
        || l.phone?.includes(search);
      const matchOwner = !filterOwner || l.owner_id === filterOwner;
      const matchSource = !filterSource || l.source === filterSource;
      const matchStatus = !filterStatus || l.status === filterStatus;
      return matchSearch && matchOwner && matchSource && matchStatus;
    });

    if (viewMode === "LIST") {
      list = [...list].sort((a, b) => {
        let va: any = a[sortKey] ?? "";
        let vb: any = b[sortKey] ?? "";
        if (sortKey === "value") { va = Number(va); vb = Number(vb); }
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [leads, search, filterOwner, filterSource, filterStatus, sortKey, sortDir, viewMode]);

  // ── KANBAN GROUPS ──
  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    COLUMNS.forEach(c => map.set(c.id, []));
    filteredLeads.forEach(l => map.get(l.status)?.push(l));
    return map;
  }, [filteredLeads]);

  // ── KPIs ──
  const totalLeads = leads.length;
  const ativos = leads.filter(l => l.status !== "Fechamento").length;
  const fechados = leads.filter(l => l.status === "Fechamento").length;
  const conversao = totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
  const pipeline = leads.filter(l => l.status !== "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);
  const receita = leads.filter(l => l.status === "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);
  const leadsSemAcao = leads.filter(l => !l.next_action_date && l.status !== "Fechamento").length;
  const leadsVencidos = leads.filter(l => isOverdue(l.next_action_date) && l.status !== "Fechamento").length;

  // ── DRAG END ──
  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id);
    if (!COLUMNS.find(c => c.id === newStatus)) return;
    const leadId = String(active.id);
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    const { error } = await updateLeadStatus(leadId, newStatus);
    if (error) {
      toast.error("Falha ao mover", error.message);
      refetch();
    } else {
      toast.success("Lead movido", `${lead.name} → ${COLUMNS.find(c => c.id === newStatus)?.title}`);
    }
  }

  // ── SORT TOGGLE ──
  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  // ── BULK ACTIONS ──
  async function bulkDelete() {
    if (!window.confirm(`Deletar ${selectedLeads.size} lead(s)?`)) return;
    for (const id of selectedLeads) {
      await deleteLead(id);
    }
    setSelectedLeads(new Set());
    refetch();
    toast.success("Leads deletados");
  }

  async function bulkChangeStatus(status: string) {
    for (const id of selectedLeads) {
      await updateLeadStatus(id, status);
    }
    setSelectedLeads(new Set());
    refetch();
    toast.success("Status atualizado em lote");
  }

  // ── SELECT ALL ──
  function toggleSelectAll() {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  }

  const hasFilters = filterOwner || filterSource || filterStatus;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#0A0F1A] text-slate-900 dark:text-white -mx-10 -my-10 p-6 font-inter flex flex-col h-screen overflow-hidden" style={{ maxHeight: '100vh' }}>

      {/* ── KPI HEADER ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5 shrink-0">
        <KpiChip label="Total Leads" value={totalLeads} icon={<Target size={14} />} />
        <KpiChip label="Ativos" value={ativos} icon={<Zap size={14} />} color="#3b82f6" />
        <KpiChip label="Fechados" value={fechados} icon={<CheckCircle size={14} />} color="#10b981" />
        <KpiChip label="Conversão" value={`${conversao.toFixed(1)}%`} icon={<TrendingUp size={14} />} color={conversao > 10 ? "#10b981" : "#ef4444"} />
        <KpiChip label="Pipeline" value={fmt.currencyCompact(pipeline)} icon={<DollarSign size={14} />} color="#6366f1" />
        <KpiChip label="Receita" value={fmt.currencyCompact(receita)} icon={<BarChart3 size={14} />} color="#ef4444" />
        <KpiChip label="Vencidos" value={leadsVencidos} icon={<AlertCircle size={14} />} color={leadsVencidos > 0 ? "#ef4444" : "#10b981"} />
      </div>

      {/* ── TOOLBAR ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight">CRM Comercial</h1>
            <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />
            {/* View Switcher */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-[#151B2D] p-1 rounded-lg border border-slate-200 dark:border-white/5">
              <ViewTab active={viewMode === "BOARD"} onClick={() => setViewMode("BOARD")} icon={<LayoutGrid size={13} />} label="Board" />
              <ViewTab active={viewMode === "LIST"} onClick={() => setViewMode("LIST")} icon={<List size={13} />} label="Lista" />
              <ViewTab active={viewMode === "CALENDAR"} onClick={() => setViewMode("CALENDAR")} icon={<Calendar size={13} />} label="Agenda" />
              <ViewTab active={viewMode === "METRICS"} onClick={() => setViewMode("METRICS")} icon={<TrendingUp size={13} />} label="Métricas" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar leads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white dark:bg-[#151B2D] border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#EF4444]/50 w-56 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              )}
            </div>
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border transition-all",
                showFilters || hasFilters
                  ? "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
                  : "bg-white dark:bg-[#151B2D] border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-white"
              )}
            >
              <Filter size={13} />
              Filtros
              {hasFilters && <span className="bg-[#EF4444] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
            </button>
            {/* New Lead */}
            <button
              onClick={() => setIsNewOpen(true)}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              <Plus size={15} /> Novo Negócio
            </button>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#151B2D] rounded-xl border border-slate-200 dark:border-white/5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filtrar:</span>
            <FilterSelect
              value={filterOwner}
              onChange={setFilterOwner}
              label="Responsável"
              options={[{ value: "", label: "Todos" }, ...team.map(t => ({ value: t.id, label: t.full_name || "—" }))]}
            />
            <FilterSelect
              value={filterSource}
              onChange={setFilterSource}
              label="Origem"
              options={[{ value: "", label: "Todas" }, ...SOURCES.map(s => ({ value: s, label: s }))]}
            />
            <FilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              label="Estágio"
              options={[{ value: "", label: "Todos" }, ...COLUMNS.map(c => ({ value: c.id, label: c.title }))]}
            />
            {hasFilters && (
              <button
                onClick={() => { setFilterOwner(""); setFilterSource(""); setFilterStatus(""); }}
                className="flex items-center gap-1 text-[#EF4444] hover:underline text-xs font-bold"
              >
                <X size={12} /> Limpar
              </button>
            )}
            <div className="ml-auto text-xs text-slate-400">
              {filteredLeads.length} resultado{filteredLeads.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* ── BULK ACTIONS BAR ── */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="font-bold text-[#6366f1]">{selectedLeads.size} selecionado(s)</span>
            <div className="h-4 w-px bg-[#6366f1]/30" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mover para:</span>
            {COLUMNS.filter(c => c.id !== "Fechamento").slice(0, 4).map(c => (
              <button key={c.id} onClick={() => bulkChangeStatus(c.id)} className="text-xs px-2 py-1 rounded font-bold border transition-all hover:scale-105" style={{ color: c.color, borderColor: `${c.color}40`, backgroundColor: `${c.color}10` }}>
                {c.title}
              </button>
            ))}
            <button onClick={bulkDelete} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold ml-auto">
              <Trash2 size={13} /> Deletar
            </button>
            <button onClick={() => setSelectedLeads(new Set())} className="text-slate-400 hover:text-slate-300">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#EF4444] border-t-transparent animate-spin" />
            <span className="text-sm text-slate-500">Carregando CRM...</span>
          </div>
        ) : (
          <>
            {/* ── BOARD ── */}
            {viewMode === "BOARD" && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start" style={{ scrollbarWidth: "thin" }}>
                  {COLUMNS.map(col => {
                    const colLeads = groups.get(col.id) ?? [];
                    const colValue = colLeads.reduce((s, l) => s + Number(l.value ?? 0), 0);
                    return (
                      <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        icon={col.icon}
                        count={colLeads.length}
                        totalValue={colValue}
                        onAddNew={() => { setSelectedLead({ status: col.id }); setIsNewOpen(true); }}
                      >
                        {colLeads.map(lead => (
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

            {/* ── LIST ── */}
            {viewMode === "LIST" && (
              <div className="h-full overflow-auto bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/5">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#151B2D] border-b border-slate-200 dark:border-white/5">
                    <tr>
                      <th className="p-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                          onChange={toggleSelectAll}
                          className="accent-[#EF4444]"
                        />
                      </th>
                      <SortTh label="Nome / Empresa" field="name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                      <SortTh label="Estágio" field="status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Responsável</th>
                      <SortTh label="Valor" field="value" active={sortKey === "value"} dir={sortDir} onClick={() => toggleSort("value")} />
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Origem</th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Prob.</th>
                      <SortTh label="Follow-up" field="next_action_date" active={sortKey === "next_action_date"} dir={sortDir} onClick={() => toggleSort("next_action_date")} />
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredLeads.map(lead => {
                      const col = COLUMNS.find(c => c.id === lead.status);
                      const overdue = isOverdue(lead.next_action_date);
                      const days = daysSince(lead.created_at);
                      const isSelected = selectedLeads.has(lead.id);
                      return (
                        <tr
                          key={lead.id}
                          className={cn(
                            "group hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors",
                            isSelected && "bg-[#6366f1]/5 dark:bg-[#6366f1]/10"
                          )}
                        >
                          <td className="p-3" onClick={e => { e.stopPropagation(); const s = new Set(selectedLeads); isSelected ? s.delete(lead.id) : s.add(lead.id); setSelectedLeads(s); }}>
                            <input type="checkbox" checked={isSelected} onChange={() => {}} className="accent-[#EF4444]" />
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            <div className="font-bold group-hover:text-[#EF4444] transition-colors line-clamp-1">{lead.name || "Sem Nome"}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 size={10} />
                              {lead.company_name || "—"}
                            </div>
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
                              style={{ color: col?.color, borderColor: `${col?.color}30`, backgroundColor: `${col?.color}10` }}>
                              {col?.icon} {lead.status}
                            </span>
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            <div className="flex items-center gap-1.5">
                              {lead.owner_avatar ? (
                                <img src={lead.owner_avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                  <User size={11} className="text-slate-400" />
                                </div>
                              )}
                              <span className="text-xs text-slate-500">{lead.owner_name || "—"}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#EF4444]" onClick={() => setSelectedLead(lead)}>
                            {fmt.currencyCompact(Number(lead.value ?? 0))}
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            {lead.source ? (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Tag size={10} /> {lead.source}
                              </span>
                            ) : <span className="text-slate-600 text-xs">—</span>}
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${lead.probability || 10}%`, backgroundColor: probColor(lead.probability || 10) }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: probColor(lead.probability || 10) }}>{lead.probability || 10}%</span>
                            </div>
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            {lead.next_action_date ? (
                              <span className={cn("flex items-center gap-1 text-xs font-bold", overdue ? "text-red-400" : "text-slate-400")}>
                                {overdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                                {new Date(lead.next_action_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                              </span>
                            ) : <span className="text-slate-600 text-xs">Sem data</span>}
                          </td>
                          <td className="p-3" onClick={() => setSelectedLead(lead)}>
                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full", days > 30 ? "bg-red-500/10 text-red-400" : days > 14 ? "bg-yellow-500/10 text-yellow-400" : "bg-slate-100 dark:bg-white/5 text-slate-400")}>
                              {days}d
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-500">
                          <Target size={40} className="mx-auto mb-3 opacity-30" />
                          Nenhum lead encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CALENDAR ── */}
            {viewMode === "CALENDAR" && (
              <CalendarView leads={filteredLeads} onLeadClick={setSelectedLead} />
            )}

            {/* ── METRICS ── */}
            {viewMode === "METRICS" && (
              <MetricsView leads={leads} team={team} />
            )}
          </>
        )}
      </div>

      {/* ── LEAD MODAL ── */}
      {(selectedLead || isNewOpen) && (
        <LeadDetailModal
          isOpen={!!selectedLead || isNewOpen}
          onClose={() => { setSelectedLead(null); setIsNewOpen(false); }}
          lead={selectedLead || { status: "Pesquisado" }}
          isNew={isNewOpen}
          team={team}
          onSave={async (updatedLead) => {
            if (isNewOpen) {
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

// ─── KPI CHIP ──────────────────────────────────────────────────────────
function KpiChip({ label, value, icon, color = "#94a3b8" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:border-slate-300 dark:hover:border-white/10 transition-all group">
      <div className="shrink-0 p-1.5 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
        <div className="text-base font-black tracking-tight" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

// ─── VIEW TAB ──────────────────────────────────────────────────────────
function ViewTab({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all",
        active ? "bg-[#EF4444] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
      )}
    >
      {icon} {label}
    </button>
  );
}

// ─── FILTER SELECT ─────────────────────────────────────────────────────
function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#EF4444]/50 text-slate-700 dark:text-slate-300"
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── SORT TH ───────────────────────────────────────────────────────────
function SortTh({ label, field, active, dir, onClick }: { label: string; field: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <th
      className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-white select-none"
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={cn("transition-colors", active ? "text-[#EF4444]" : "text-slate-600")}>
          {active && dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </div>
    </th>
  );
}

// ─── KANBAN COLUMN ─────────────────────────────────────────────────────
function KanbanColumn({ id, title, color, icon, count, totalValue, onAddNew, children }: any) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[300px] shrink-0 transition-all duration-200 rounded-xl",
        isOver && "ring-2 ring-offset-2 ring-offset-transparent scale-[1.01]"
      )}
      style={isOver ? { ringColor: color } : {}}
    >
      {/* Column Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <h3 className="text-[11px] font-black tracking-widest text-slate-900 dark:text-white">{title}</h3>
            <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color }}>
              {count}
            </span>
          </div>
          <button
            onClick={onAddNew}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#EF4444] transition-all"
          >
            <Plus size={12} />
          </button>
        </div>
        {totalValue > 0 && (
          <div className="text-[10px] font-bold text-slate-400 mb-2 pl-7">
            {fmt.currencyCompact(totalValue)} no pipeline
          </div>
        )}
        <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: `${color}60` }}>
          <div className="h-full rounded-full transition-all" style={{ width: count > 0 ? "100%" : "0%", backgroundColor: color }} />
        </div>
      </div>

      {/* Cards */}
      <div className={cn(
        "flex-1 space-y-2.5 overflow-y-auto pb-20 pr-0.5 min-h-[200px] rounded-lg transition-all",
        isOver && "bg-white/5"
      )} style={{ scrollbarWidth: "thin" }}>
        {children}
        {count === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 text-xs gap-1">
            <Target size={18} className="opacity-30" />
            <span>Arraste um lead aqui</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LEAD CARD ─────────────────────────────────────────────────────────
function LeadCard({ lead, onClick }: { lead: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const overdue = isOverdue(lead.next_action_date);
  const prob = lead.probability || 10;
  const days = daysSince(lead.created_at);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => { if (!isDragging) onClick(); }}
      className={cn(
        "p-3.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-xl cursor-pointer",
        "hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-black/10",
        "transition-all duration-150 group select-none",
        isDragging && "opacity-40 shadow-2xl rotate-1 scale-105 z-50 border-[#EF4444]/50"
      )}
    >
      {/* Card top */}
      <div className="flex items-start justify-between mb-2.5">
        <h4 className="text-[13px] font-bold group-hover:text-[#EF4444] transition-colors line-clamp-1 pr-2 leading-tight">
          {lead.name || "Sem Nome"}
        </h4>
        <div
          className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full"
          style={{ color: probColor(prob), backgroundColor: `${probColor(prob)}15` }}
        >
          {prob}%
        </div>
      </div>

      {/* Company */}
      {lead.company_name && (
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
          <Building2 size={9} className="shrink-0" />
          <span className="line-clamp-1">{lead.company_name}</span>
        </div>
      )}

      {/* Value */}
      {Number(lead.value) > 0 && (
        <div className="text-sm font-black text-[#EF4444] mb-3">
          {fmt.currencyCompact(Number(lead.value))}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          {lead.owner_avatar ? (
            <img src={lead.owner_avatar} className="w-5 h-5 rounded-full object-cover" title={lead.owner_name} alt="" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center" title={lead.owner_name || "Sem responsável"}>
              <User size={9} className="text-slate-400" />
            </div>
          )}
          {lead.source && (
            <span className="text-[9px] font-bold text-slate-400 uppercase">{lead.source}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Days badge */}
          <span className={cn(
            "text-[9px] font-bold px-1 py-0.5 rounded",
            days > 30 ? "bg-red-500/10 text-red-400" : days > 14 ? "bg-yellow-500/10 text-yellow-400" : "bg-slate-100 dark:bg-white/5 text-slate-500"
          )}>
            {days}d
          </span>
          {/* Action date */}
          {lead.next_action_date ? (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold",
              overdue ? "bg-red-500/10 text-red-400" : "bg-slate-100 dark:bg-white/5 text-slate-400"
            )}>
              {overdue ? <AlertCircle size={9} /> : <Clock size={9} />}
              {new Date(lead.next_action_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </div>
          ) : (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400">
              <Flame size={9} /> Sem ação
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ─────────────────────────────────────────────────────
function CalendarView({ leads, onLeadClick }: { leads: any[]; onLeadClick: (l: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Group leads by date
  const byDay = useMemo(() => {
    const map = new Map<string, any[]>();
    leads.forEach(lead => {
      if (!lead.next_action_date) return;
      const d = new Date(lead.next_action_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate().toString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(lead);
      }
    });
    return map;
  }, [leads, year, month]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 shrink-0">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h2 className="font-black capitalize text-lg tracking-tight">{monthName}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/5 shrink-0">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
          <div key={d} className="text-center py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 overflow-auto" style={{ gridAutoRows: "minmax(90px, 1fr)" }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20" />;
          const dayLeads = byDay.get(day.toString()) ?? [];
          return (
            <div
              key={day}
              className={cn(
                "border-b border-r border-slate-100 dark:border-white/5 p-1.5 overflow-hidden",
                isToday(day) && "bg-[#EF4444]/5"
              )}
            >
              <div className={cn(
                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                isToday(day) ? "bg-[#EF4444] text-white" : "text-slate-500"
              )}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayLeads.slice(0, 3).map(lead => {
                  const col = COLUMNS.find(c => c.id === lead.status);
                  return (
                    <button
                      key={lead.id}
                      onClick={() => onLeadClick(lead)}
                      className="w-full text-left text-[9px] font-bold px-1.5 py-0.5 rounded truncate transition-opacity hover:opacity-80"
                      style={{ backgroundColor: `${col?.color}20`, color: col?.color }}
                    >
                      {lead.name}
                    </button>
                  );
                })}
                {dayLeads.length > 3 && (
                  <div className="text-[9px] text-slate-400 pl-1">+{dayLeads.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 dark:border-white/5 p-3 flex gap-3 flex-wrap shrink-0">
        {COLUMNS.map(c => (
          <div key={c.id} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[9px] text-slate-400">{c.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── METRICS VIEW ──────────────────────────────────────────────────────
function MetricsView({ leads, team }: { leads: any[]; team: any[] }) {
  const totalLeads = leads.length;
  const fechados = leads.filter(l => l.status === "Fechamento").length;
  const receita = leads.filter(l => l.status === "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);
  const pipeline = leads.filter(l => l.status !== "Fechamento").reduce((s, l) => s + Number(l.value ?? 0), 0);
  const avgDays = useMemo(() => {
    const ds = leads.map(l => daysSince(l.created_at));
    return ds.length ? Math.round(ds.reduce((a, b) => a + b, 0) / ds.length) : 0;
  }, [leads]);

  // Performance por responsável
  const byOwner = useMemo(() => {
    const map = new Map<string, { name: string; total: number; fechados: number; pipeline: number }>();
    leads.forEach(l => {
      const key = l.owner_id || "unassigned";
      const name = l.owner_name || "Sem responsável";
      if (!map.has(key)) map.set(key, { name, total: 0, fechados: 0, pipeline: 0 });
      const m = map.get(key)!;
      m.total += 1;
      if (l.status === "Fechamento") { m.fechados += 1; m.pipeline += Number(l.value ?? 0); }
      else { m.pipeline += Number(l.value ?? 0); }
    });
    return Array.from(map.values()).sort((a, b) => b.fechados - a.fechados);
  }, [leads]);

  // Por fonte
  const bySource = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { const s = l.source || "Outros"; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  // Por semana (últimas 8 semanas)
  const byWeek = useMemo(() => {
    const weeks: { week: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(Date.now() - i * 7 * 86400000);
      const end = new Date(Date.now() - (i - 1) * 7 * 86400000);
      const label = `S${8 - i}`;
      const count = leads.filter(l => {
        const d = new Date(l.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({ week: label, count });
    }
    return weeks;
  }, [leads]);

  const maxWeekCount = Math.max(...byWeek.map(w => w.count), 1);
  const maxSourceCount = Math.max(...bySource.map(s => s[1]), 1);

  return (
    <div className="h-full overflow-auto p-1 space-y-4" style={{ scrollbarWidth: "thin" }}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Leads", value: totalLeads, sub: "no pipeline", color: "#3b82f6" },
          { label: "Conversão Geral", value: `${totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : 0}%`, sub: `${fechados} fechados`, color: "#10b981" },
          { label: "Receita Gerada", value: fmt.currencyCompact(receita), sub: "leads fechados", color: "#EF4444" },
          { label: "Ciclo Médio", value: `${avgDays}d`, sub: "dias no funil", color: "#f97316" },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{m.label}</div>
            <div className="text-3xl font-black tracking-tight mb-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-slate-500">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Funil de conversão */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Funil de Conversão</h3>
          <div className="space-y-3">
            {COLUMNS.map((col, idx) => {
              const count = leads.filter(l => l.status === col.id).length;
              const pct = totalLeads ? (count / totalLeads) * 100 : 0;
              const prev = idx > 0 ? leads.filter(l => l.status === COLUMNS[idx - 1].id).length : null;
              const convRate = prev && prev > 0 ? `${((count / prev) * 100).toFixed(0)}%` : null;
              return (
                <div key={col.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{col.icon}</span>
                    <span className="text-[11px] font-bold text-slate-500 flex-1 truncate">{col.title}</span>
                    <span className="text-xs font-black" style={{ color: col.color }}>{count}</span>
                    {convRate && <span className="text-[9px] text-slate-400">({convRate})</span>}
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: col.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leads por semana */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Leads por Semana</h3>
          <div className="flex items-end gap-1.5 h-32">
            {byWeek.map(w => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-slate-500">{w.count > 0 ? w.count : ""}</span>
                <div
                  className="w-full rounded-t-sm bg-[#EF4444] transition-all hover:opacity-80"
                  style={{ height: `${(w.count / maxWeekCount) * 100}%`, minHeight: w.count > 0 ? "4px" : "0" }}
                />
                <span className="text-[9px] text-slate-400">{w.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por origem */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Origem dos Leads</h3>
          <div className="space-y-3">
            {bySource.map(([source, count]) => (
              <div key={source}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 font-bold">{source}</span>
                  <span className="font-black text-slate-400">{count} <span className="font-normal text-slate-500">({((count / totalLeads) * 100).toFixed(0)}%)</span></span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#f97316]" style={{ width: `${(count / maxSourceCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking por responsável */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl p-5">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Ranking do Time</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                {["#", "Responsável", "Total", "Fechados", "Taxa", "Pipeline"].map(h => (
                  <th key={h} className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {byOwner.map((o, i) => (
                <tr key={o.name} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                      i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-400 text-orange-900" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                    )}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{o.name}</td>
                  <td className="py-3 text-slate-500">{o.total}</td>
                  <td className="py-3">
                    <span className="font-bold text-[#10b981]">{o.fechados}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold" style={{ color: o.total > 0 && o.fechados / o.total > 0.2 ? "#10b981" : "#f97316" }}>
                      {o.total > 0 ? ((o.fechados / o.total) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[#EF4444] font-bold">{fmt.currencyCompact(o.pipeline)}</td>
                </tr>
              ))}
              {byOwner.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500 text-sm">Nenhum dado disponível</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
