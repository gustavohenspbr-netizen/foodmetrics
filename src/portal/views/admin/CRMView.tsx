import React, { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Plus, MoreHorizontal, DollarSign, Phone, Mail, MessageSquare, Filter } from "lucide-react";
import { MOCK_CRM_LEADS } from "../../lib/mockData";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { fmt } from "../../lib/format";
import { cn } from "../../lib/cn";

const COLUMNS = [
  { id: "lead", title: "Lead", color: "#3b82f6", description: "Novos contatos" },
  { id: "contacted", title: "Contatado", color: "#a855f7", description: "Primeira aproximação" },
  { id: "proposal", title: "Proposta", color: "#ff8732", description: "Em análise" },
  { id: "negotiation", title: "Negociação", color: "#f59e0b", description: "Quase fechando" },
  { id: "won", title: "Fechado", color: "#10b981", description: "🎉" },
];

type Lead = (typeof MOCK_CRM_LEADS)[number];

export function CRMView() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_CRM_LEADS);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const groups = useMemo(() => {
    const map = new Map<string, Lead[]>();
    COLUMNS.forEach((c) => map.set(c.id, []));
    leads.forEach((l) => map.get(l.status)?.push(l));
    return map;
  }, [leads]);

  const totalValue = leads.filter((l) => l.status !== "won").reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter((l) => l.status === "won").reduce((s, l) => s + l.value, 0);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id);
    if (!COLUMNS.find((c) => c.id === newStatus)) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === active.id ? { ...l, status: newStatus as Lead["status"] } : l))
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER STATS */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <Stat label="Pipeline" value={fmt.currencyCompact(totalValue)} color="#ff8732" />
          <Stat label="Fechado mês" value={fmt.currencyCompact(wonValue)} color="#10b981" />
          <Stat label="Leads ativos" value={String(leads.filter((l) => l.status !== "won").length)} color="#e01c1c" />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Filter} size="sm">
            Filtros
          </Button>
          <Button variant="primary" icon={Plus} size="sm">
            Novo Lead
          </Button>
        </div>
      </div>

      {/* KANBAN */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const colLeads = groups.get(col.id) ?? [];
            const colValue = colLeads.reduce((s, l) => s + l.value, 0);
            return (
              <KanbanColumn key={col.id} col={col} count={colLeads.length} value={colValue}>
                {colLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-10 rounded-full" style={{ background: color }} />
      <div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[20px] font-extrabold text-slate-900 dark:text-white tabular-nums leading-none mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function KanbanColumn({
  col,
  count,
  value,
  children,
}: {
  col: (typeof COLUMNS)[number];
  count: number;
  value: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border-2 border-dashed border-transparent p-3 min-h-[400px] transition-colors",
        isOver && "border-[#e01c1c]/40 bg-[#e01c1c]/[0.03]"
      )}
    >
      <div className="px-2 pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
              {col.title}
            </h3>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">
              {count}
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <MoreHorizontal size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">
          {fmt.currencyCompact(value)} · {col.description}
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">{children}</div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3.5 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
        {lead.name}
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        <Badge tone="brand" size="sm">
          <DollarSign size={9} className="mr-0.5" />
          {fmt.currencyCompact(lead.value)}
        </Badge>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{lead.source}</span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <Avatar name={lead.owner ?? "?"} size="xs" color="#ff8732" />
        <div className="flex items-center gap-1.5">
          <IconBtn icon={Phone} />
          <IconBtn icon={Mail} />
          <IconBtn icon={MessageSquare} />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon }: { icon: any }) {
  return (
    <button className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-[#e01c1c] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <Icon size={11} />
    </button>
  );
}
