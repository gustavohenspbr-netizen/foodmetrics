import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Users, FileText, Calendar, CreditCard, BarChart2, ShoppingBag, Briefcase, Settings, Target, MessageSquare } from "lucide-react";
import { MOCK_CLIENTS, MOCK_REPORTS, MOCK_CRM_LEADS } from "../lib/mockData";

interface CommandPaletteProps {
  type: "admin" | "client";
  onNavigate: (id: string) => void;
}

export function CommandPalette({ type, onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(id: string) {
    onNavigate(id);
    setOpen(false);
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <Command
            className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
            loop
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
              <Search size={18} className="text-slate-400" />
              <Command.Input
                placeholder="Buscar clientes, campanhas, relatórios..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <kbd className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[420px] overflow-y-auto p-2">
              <Command.Empty className="py-12 text-center text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                Nenhum resultado encontrado
              </Command.Empty>

              <Command.Group heading="Navegação" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400">
                {type === "admin" ? (
                  <>
                    <CmdItem icon={Users} label="Clientes" onSelect={() => go("clients")} />
                    <CmdItem icon={Briefcase} label="CRM" onSelect={() => go("crm")} />
                    <CmdItem icon={CreditCard} label="Financeiro" onSelect={() => go("finance")} />
                    <CmdItem icon={FileText} label="Relatórios" onSelect={() => go("reports")} />
                    <CmdItem icon={Calendar} label="Agenda" onSelect={() => go("schedule")} />
                  </>
                ) : (
                  <>
                    <CmdItem icon={BarChart2} label="Google Ads" onSelect={() => go("google-ads")} />
                    <CmdItem icon={ShoppingBag} label="iFood" onSelect={() => go("ifood")} />
                    <CmdItem icon={Target} label="Estratégia" onSelect={() => go("strategy")} />
                    <CmdItem icon={MessageSquare} label="Mensagens" onSelect={() => go("messages")} />
                    <CmdItem icon={FileText} label="Relatórios" onSelect={() => go("reports")} />
                  </>
                )}
                <CmdItem icon={Settings} label="Configurações" onSelect={() => go("settings")} />
              </Command.Group>

              {type === "admin" && (
                <>
                  <Command.Group heading="Clientes" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400">
                    {MOCK_CLIENTS.slice(0, 5).map((c) => (
                      <CmdResultItem
                        key={c.id}
                        label={c.restaurant}
                        sublabel={c.type}
                        color={c.color}
                        initials={c.avatar}
                        onSelect={() => go("clients")}
                      />
                    ))}
                  </Command.Group>

                  <Command.Group heading="Leads recentes" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400">
                    {MOCK_CRM_LEADS.slice(0, 3).map((l) => (
                      <CmdResultItem
                        key={l.id}
                        label={l.name}
                        sublabel={`R$ ${l.value.toLocaleString("pt-BR")} · ${l.status}`}
                        color="#ff8732"
                        initials="L"
                        onSelect={() => go("crm")}
                      />
                    ))}
                  </Command.Group>
                </>
              )}

              <Command.Group heading="Relatórios" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400">
                {MOCK_REPORTS.slice(0, 3).map((r) => (
                  <CmdItem
                    key={r.id}
                    icon={FileText}
                    label={r.title}
                    sublabel={r.period}
                    onSelect={() => go("reports")}
                  />
                ))}
              </Command.Group>
            </Command.List>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↑↓</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↵</kbd>
                  Selecionar
                </span>
              </div>
              <span>FoodMetrics · Cmd+K</span>
            </div>
          </Command>
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
          `}</style>
        </div>
      )}
    </>
  );
}

function CmdItem({ icon: Icon, label, sublabel, onSelect }: { icon: any; label: string; sublabel?: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/60 transition-colors"
    >
      <Icon size={16} className="text-slate-400" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sublabel}</p>}
      </div>
    </Command.Item>
  );
}

function CmdResultItem({ label, sublabel, color, initials, onSelect }: { label: string; sublabel?: string; color: string; initials: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/60 transition-colors"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sublabel}</p>}
      </div>
    </Command.Item>
  );
}
