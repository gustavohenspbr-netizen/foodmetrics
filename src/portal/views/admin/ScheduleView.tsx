import React from "react";
import { Calendar, Clock, Video, Plus, CheckCircle2 } from "lucide-react";
import { MOCK_SCHEDULE_EVENTS } from "../../lib/mockData";

export function ScheduleView() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agenda de Reuniões</h2>
        <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B1120]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Próximos Compromissos</h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {MOCK_SCHEDULE_EVENTS.map(event => (
                <div key={event.id} className="p-8 hover:bg-[#F8FAFC] dark:hover:bg-[#0B1120]/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-[#e01c1c] dark:text-red-500 mb-1">Maio</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{event.date.split("/")[0]}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        event.type === "onboarding" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" :
                        event.type === "strategy" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white mb-3">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {event.time}</span>
                      <span className="flex items-center gap-1.5"><Video size={16} /> Google Meet</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="h-10 px-4 rounded-xl text-[13px] font-bold bg-[#e01c1c] hover:bg-[#c91818] text-white transition-all shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
                      Participar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Taxa de Presença</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Últimos 30 dias</p>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">94%</p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 mx-auto flex items-center justify-center mb-4">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Integração de Calendário</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-6">Conecte sua conta do Google Calendar para sincronização automática.</p>
            <button className="w-full py-3 rounded-xl text-[14px] font-bold bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4" />
              Conectar Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
