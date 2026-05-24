import React, { useEffect, useState } from "react";
import { Calendar as CalIcon, Plus, Clock, Video, Trash2, MapPin } from "lucide-react";
import { Calendar, type CalendarEvent } from "../../components/Calendar";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useEventsByMonth, useClients, createEvent, deleteEvent } from "../../lib/api";

const TYPES = [
  { value: "onboarding", label: "Onboarding", color: "#e01c1c" },
  { value: "report", label: "Apresentação de Relatório", color: "#3b82f6" },
  { value: "strategy", label: "Call Estratégica", color: "#10b981" },
  { value: "review", label: "Revisão de Criativos", color: "#f59e0b" },
  { value: "internal", label: "Reunião Interna", color: "#94a3b8" },
];

function toLocalInputValue(d: Date): string {
  // formato yyyy-MM-ddThh:mm pra <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleView() {
  const toast = useToast();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const { data: events = [], refetch } = useEventsByMonth(cursor);
  const { data: clients = [] } = useClients();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "internal",
    client_id: "",
    starts_at: toLocalInputValue(new Date()),
    duration: "60",
  });
  const [saving, setSaving] = useState(false);

  function openNewModal(date?: Date) {
    const baseDate = date ?? new Date();
    if (date) {
      // Se clicou num dia, default 10:00
      baseDate.setHours(10, 0, 0, 0);
    } else if (baseDate.getMinutes() > 0) {
      // arredonda pro próximo 30min
      baseDate.setMinutes(baseDate.getMinutes() > 30 ? 60 : 30, 0, 0);
    }
    setEditing(null);
    setForm({
      title: "",
      description: "",
      type: "internal",
      client_id: "",
      starts_at: toLocalInputValue(baseDate),
      duration: "60",
    });
    setModalOpen(true);
  }

  function openEditModal(evt: CalendarEvent) {
    const startDate = new Date(evt.starts_at);
    const endDate = evt.ends_at ? new Date(evt.ends_at) : new Date(startDate.getTime() + 3600000);
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    setEditing(evt);
    setForm({
      title: evt.title,
      description: (evt as any).description ?? "",
      type: evt.type ?? "internal",
      client_id: (evt as any).client_id ?? "",
      starts_at: toLocalInputValue(startDate),
      duration: String(duration),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.starts_at) {
      toast.error("Preencha título e data");
      return;
    }
    setSaving(true);
    const start = new Date(form.starts_at);
    const end = new Date(start.getTime() + parseInt(form.duration) * 60000);

    if (editing) {
      // Delete + create pra simplificar (sem updateEvent ainda)
      await deleteEvent(editing.id);
    }
    const { error } = await createEvent({
      title: form.title,
      description: form.description,
      type: form.type,
      client_id: form.client_id || null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar", error.message);
      return;
    }
    toast.success(editing ? "Evento atualizado!" : "Evento criado!");
    setModalOpen(false);
    refetch();
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm(`Deletar "${editing.title}"?`)) return;
    const { error } = await deleteEvent(editing.id);
    if (error) toast.error("Erro ao deletar", error.message);
    else {
      toast.success("Evento deletado");
      setModalOpen(false);
      refetch();
    }
  }

  // Lista próximos eventos (lateral)
  const upcomingEvents = (events ?? [])
    .filter((e: any) => new Date(e.starts_at) >= new Date())
    .slice(0, 5);

  const calendarEvents: CalendarEvent[] = (events ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    ends_at: e.ends_at,
    type: e.type,
    client_name: e.client_name,
    ...e,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Agenda</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Calls, reuniões e eventos da equipe — clique num dia pra agendar
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm" onClick={() => openNewModal()}>
          Novo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <Calendar
          events={calendarEvents}
          onDayClick={(d) => openNewModal(d)}
          onEventClick={(e) => openEditModal(e)}
          initialMonth={cursor}
          onMonthChange={setCursor}
        />

        {/* Sidebar de próximos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Próximos eventos</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Eventos a partir de hoje</p>
            </div>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-[13px] text-slate-500 text-center py-8 font-medium">
              Sem eventos futuros neste mês.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((e: any) => {
                const dt = new Date(e.starts_at);
                const tone = TYPES.find((t) => t.value === e.type);
                return (
                  <button
                    key={e.id}
                    onClick={() => openEditModal(e)}
                    className="w-full text-left flex gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="text-center flex-shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </p>
                      <p className="text-[18px] text-slate-900 dark:text-white font-extrabold leading-none mt-0.5 tabular-nums">
                        {dt.getDate()}
                      </p>
                    </div>
                    <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                        {e.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                          {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {e.client_name && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate">
                            · {e.client_name}
                          </span>
                        )}
                      </div>
                      {tone && (
                        <span
                          className="inline-block mt-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: `${tone.color}15`, color: tone.color }}
                        >
                          {tone.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Modal criar/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar evento" : "Novo evento"}
        description={editing ? "Atualize os dados ou delete o evento." : "Preencha os dados e clique em criar."}
        size="lg"
        footer={
          <>
            {editing && (
              <Button variant="ghost" icon={Trash2} onClick={handleDelete} className="text-red-500 mr-auto">
                Deletar
              </Button>
            )}
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing ? "Salvar alterações" : "Criar evento"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Título *"
            placeholder="Ex: Call de Onboarding"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${
                    form.type === t.value
                      ? "border-[#e01c1c] bg-[#e01c1c]/[0.05] text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data e hora *"
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Duração (min)
              </label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e01c1c]/30"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Cliente (opcional)
            </label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e01c1c]/30"
            >
              <option value="">— Reunião interna —</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Descrição
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Pauta, agenda, links..."
              className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
