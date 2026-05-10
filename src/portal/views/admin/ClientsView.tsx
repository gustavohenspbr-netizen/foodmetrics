import React, { useState } from "react";
import { Search, Plus, Filter, MoreVertical, Star, Mail, MapPin, Edit, Trash2 } from "lucide-react";
import { MOCK_CLIENTS } from "../../lib/mockData";

export function ClientsView() {
  const [search, setSearch] = useState("");

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.restaurant.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou e-mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e01c1c]/20 focus:border-[#e01c1c] transition-all"
            />
          </div>
          <button className="h-[46px] px-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center">
            <Filter size={18} />
          </button>
        </div>
        
        <button className="h-[46px] px-6 bg-[#e01c1c] hover:bg-[#c91818] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all p-6 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[15px] font-bold shadow-sm"
                  style={{ background: client.color + "15", color: client.color, border: `1px solid ${client.color}30` }}>
                  {client.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight">{client.restaurant}</h3>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    client.status === "active" 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                      : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                  }`}>
                    {client.status === "active" ? "Ativo" : "Pendente"}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                <Mail size={16} className="text-slate-400" /> {client.email}
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                <MapPin size={16} className="text-slate-400" /> São Paulo, SP
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                <Star size={16} className="text-amber-500 fill-amber-500" /> {client.ifoodRating} Rating iFood
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Google Ads</p>
                <p className="text-[14px] font-bold text-slate-900 dark:text-white">R$ {client.googleSpend.toLocaleString("pt-BR")}</p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Meta Ads</p>
                <p className="text-[14px] font-bold text-slate-900 dark:text-white">R$ {client.metaSpend.toLocaleString("pt-BR")}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Edit size={16} /> Editar
              </button>
              <button className="w-11 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
