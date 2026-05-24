import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./ui/Button";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string; // ISO
  ends_at?: string;
  type?: string;
  client_name?: string | null;
};

interface CalendarProps {
  events: CalendarEvent[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  initialMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

const TYPE_COLOR: Record<string, string> = {
  onboarding: "#e01c1c",
  report: "#3b82f6",
  strategy: "#10b981",
  internal: "#94a3b8",
  review: "#f59e0b",
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({ events, onDayClick, onEventClick, initialMonth, onMonthChange }: CalendarProps) {
  const [cursor, setCursor] = useState<Date>(() => {
    const d = initialMonth ?? new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  function changeMonth(delta: number) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
    onMonthChange?.(next);
  }

  function goToday() {
    const t = new Date();
    t.setDate(1);
    t.setHours(0, 0, 0, 0);
    setCursor(t);
    onMonthChange?.(t);
  }

  // Constrói grid de 6 semanas × 7 dias
  const grid = useMemo(() => {
    const firstDayOfMonth = new Date(cursor);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Dom
    const start = new Date(firstDayOfMonth);
    start.setDate(start.getDate() - startDayOfWeek);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  // Map de eventos por dia
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.starts_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const today = new Date();
  const currentMonth = cursor.getMonth();

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight capitalize tabular-nums min-w-[180px] text-center">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/60">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",
              (i === 0 || i === 6) && "text-slate-400"
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 grid-rows-6">
        {grid.map((d, i) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayEvents = eventsByDay.get(key) ?? [];
          const isOtherMonth = d.getMonth() !== currentMonth;
          const isToday = sameDay(d, today);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;

          return (
            <button
              key={i}
              onClick={() => onDayClick?.(d)}
              className={cn(
                "group relative min-h-[100px] p-2 text-left border-r border-b border-slate-100 dark:border-slate-800/60 transition-colors",
                "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
                isOtherMonth && "bg-slate-50/30 dark:bg-slate-900/30",
                (i + 1) % 7 === 0 && "border-r-0",
                i >= 35 && "border-b-0"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold tabular-nums",
                    isOtherMonth ? "text-slate-300 dark:text-slate-700" : isWeekend ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300",
                    isToday && "bg-[#e01c1c] text-white shadow-[0_4px_10px_rgba(224,28,28,0.3)]"
                  )}
                >
                  {d.getDate()}
                </span>
                <Plus
                  size={12}
                  className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => {
                  const dt = new Date(e.starts_at);
                  const color = TYPE_COLOR[e.type ?? "internal"] ?? "#94a3b8";
                  return (
                    <div
                      key={e.id}
                      onClick={(ev) => { ev.stopPropagation(); onEventClick?.(e); }}
                      className="flex items-center gap-1.5 text-left rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight truncate transition-colors hover:opacity-80"
                      style={{ background: `${color}18`, color, borderLeft: `2px solid ${color}` }}
                    >
                      <span className="font-bold tabular-nums">
                        {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="truncate">{e.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] font-bold text-slate-400">+{dayEvents.length - 3} mais</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
