import React, { useState, useEffect, useRef } from "react";
import {
  X, Save, Send, Phone, Mail, Calendar, Target, CheckCircle2,
  MessageSquare, Activity, Trash2, User, Building2, Globe,
  AtSign, MapPin, Tag, Percent, DollarSign, Clock,
  AlertCircle, ChevronDown, Plus, FileText, Zap, BarChart,
} from "lucide-react";
import { cn } from "../lib/cn";
import { fmt } from "../lib/format";
import { createLead, updateLead, deleteLead, useLeadActivities, createLeadActivity } from "../lib/api";
import { useToast } from "./ui/Toast";

// ─── TYPES ─────────────────────────────────────────────────────────────
type ActivityType = "note" | "call" | "email" | "meeting" | "whatsapp" | "status_change";

type LeadDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  isNew?: boolean;
  team?: any[];
  onSave?: (lead: any) => void;
};

const STAGES = [
  { id: "Pesquisado",   color: "#3b82f6", icon: "🔍" },
  { id: "Contatado",   color: "#a855f7", icon: "📲" },
  { id: "Respondeu",   color: "#06b6d4", icon: "💬" },
  { id: "Em Cadência", color: "#6366f1", icon: "🔄" },
  { id: "Diagnóstico", color: "#eab308", icon: "🩺" },
  { id: "Proposta",    color: "#f97316", icon: "📄" },
  { id: "Fechamento",  color: "#10b981", icon: "🏆" },
];

const SOURCES = ["Meta Ads", "Google Ads", "Orgânico", "Indicação", "Outro"];

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "note",     label: "Nota",    icon: <FileText size={12} />,    color: "#6366f1" },
  { type: "call",     label: "Ligação", icon: <Phone size={12} />,       color: "#10b981" },
  { type: "email",    label: "E-mail",  icon: <Mail size={12} />,        color: "#3b82f6" },
  { type: "meeting",  label: "Reunião", icon: <Calendar size={12} />,    color: "#f97316" },
  { type: "whatsapp", label: "WhatsApp", icon: <MessageSquare size={12} />, color: "#25D366" },
];

const SPIN_FIELDS = [
  { key: "spin_situation",   label: "Situação",   placeholder: "Qual é o contexto atual do restaurante? Volume de pedidos, canais usados, time de operação...", color: "#3b82f6" },
  { key: "spin_problem",     label: "Problema",   placeholder: "Quais dores e gargalos foram relatados? Qual é o maior problema hoje?", color: "#ef4444" },
  { key: "spin_implication", label: "Implicação", placeholder: "Quais as consequências de não resolver isso? Custo de não agir?", color: "#f97316" },
  { key: "spin_need",        label: "Necessidade", placeholder: "Qual a solução ideal? Como o Food Métricas se encaixa nesse cenário?", color: "#10b981" },
];

// ─── HELPERS ───────────────────────────────────────────────────────────
function activityIcon(type: ActivityType) {
  return ACTIVITY_TYPES.find(a => a.type === type) ?? ACTIVITY_TYPES[0];
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
function probColor(p: number) {
  if (p >= 70) return "#10b981";
  if (p >= 40) return "#f97316";
  return "#ef4444";
}

// ─── MAIN MODAL ────────────────────────────────────────────────────────
export function LeadDetailModal({ isOpen, onClose, lead, isNew, team = [], onSave }: LeadDetailModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"DADOS" | "SPIN" | "QUALIF">("DADOS");
  const [formData, setFormData] = useState<any>({ ...lead });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Activity input
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [activityContent, setActivityContent] = useState("");
  const [sendingActivity, setSendingActivity] = useState(false);

  // Activities from API
  const { data: activities = [], loading: loadingActivities, refetch: refetchActivities } = useLeadActivities(isNew ? undefined : lead?.id);

  // Mock activities for visual richness when DB table may not exist
  const [localActivities, setLocalActivities] = useState<any[]>([]);

  useEffect(() => {
    setFormData({ ...lead });
    setActiveTab("DADOS");
    setActivityContent("");
    setConfirmDelete(false);
    setLocalActivities([]);
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const currentStage = STAGES.find(s => s.id === formData.status) || STAGES[0];

  // ── SAVE ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        company_name: formData.company_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        status: formData.status || "Pesquisado",
        value: Number(formData.value) || 0,
        probability: Number(formData.probability) || 10,
        source: formData.source || null,
        owner_id: formData.owner_id || null,
        next_action_date: formData.next_action_date || null,
        notes: formData.notes || null,
        instagram: formData.instagram || null,
        city: formData.city || null,
        website: formData.website || null,
        // SPIN
        spin_situation: formData.spin_situation || null,
        spin_problem: formData.spin_problem || null,
        spin_implication: formData.spin_implication || null,
        spin_need: formData.spin_need || null,
        // BANT
        bant_budget: formData.bant_budget || null,
        bant_authority: formData.bant_authority || null,
        bant_need: formData.bant_need || null,
        bant_timeline: formData.bant_timeline || null,
      };

      if (isNew) {
        const { data, error } = await createLead(payload);
        if (error) throw error;
        onSave?.(data);
      } else {
        const { data, error } = await updateLead(lead.id, payload);
        if (error) throw error;
        onSave?.(data || { ...lead, ...payload });
      }
    } catch (err: any) {
      toast.error("Erro ao salvar", err?.message || "Verifique o console");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteLead(lead.id);
      toast.success("Lead deletado");
      onClose();
      onSave?.({ id: lead.id, _deleted: true });
    } catch (err: any) {
      toast.error("Erro ao deletar", err?.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── ADD ACTIVITY ──
  const handleAddActivity = async () => {
    if (!activityContent.trim()) return;
    setSendingActivity(true);
    try {
      if (!isNew && lead?.id) {
        const { error } = await createLeadActivity({
          lead_id: lead.id,
          type: activityType,
          content: activityContent.trim(),
        });
        if (!error) {
          refetchActivities();
        }
      }
      // Add locally regardless (graceful fallback)
      const newAct = {
        id: Date.now().toString(),
        type: activityType,
        content: activityContent.trim(),
        created_at: new Date().toISOString(),
        author_name: "Você",
        author_avatar: null,
        _local: true,
      };
      setLocalActivities(prev => [newAct, ...prev]);
      setActivityContent("");
      toast.success("Atividade registrada");
    } catch (err: any) {
      toast.error("Erro ao registrar atividade");
    } finally {
      setSendingActivity(false);
    }
  };

  // Combine DB + local activities
  const allActivities = [
    ...localActivities,
    ...activities.filter((a: any) => !localActivities.find((la: any) => la.id === a.id)),
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // ── QUICK ACTIONS ──
  const handleWhatsApp = () => {
    const phone = formData.phone?.replace(/\D/g, "");
    if (!phone) { toast.error("Telefone não cadastrado"); return; }
    window.open(`https://wa.me/55${phone}`, "_blank");
  };
  const handleEmail = () => {
    if (!formData.email) { toast.error("E-mail não cadastrado"); return; }
    window.open(`mailto:${formData.email}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#0F1623] w-full max-w-6xl max-h-[95vh] rounded-2xl border border-slate-200 dark:border-white/8 shadow-[0_25px_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden">

        {/* ═══════════════════════════════════════════════════════════
            LEFT PANEL — Data & Forms
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/8 min-w-0">

          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/8 shrink-0 bg-slate-50 dark:bg-[#111827]">
            {/* Stage pill + Quick actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StageSelector
                  value={formData.status || "Pesquisado"}
                  onChange={v => handleChange("status", v)}
                  stages={STAGES}
                />
              </div>
              {!isNew && (
                <div className="flex items-center gap-1.5">
                  <QuickActionBtn onClick={handleWhatsApp} icon={<MessageSquare size={13} />} label="WhatsApp" color="#25D366" />
                  <QuickActionBtn onClick={handleEmail} icon={<Mail size={13} />} label="E-mail" color="#3b82f6" />
                  <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
                  {!confirmDelete ? (
                    <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Deletar lead">
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button onClick={handleDelete} disabled={deleting} className="px-2 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all animate-pulse">
                      {deleting ? "..." : "Confirmar?"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lead name (editable big input) */}
            <input
              type="text"
              value={formData.name || ""}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Nome do Lead / Decisor..."
              className="text-xl font-black bg-transparent outline-none w-full placeholder:text-slate-300 dark:placeholder:text-white/20 text-slate-900 dark:text-white mb-1"
            />

            {/* Company + location row */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-slate-400">
                <Building2 size={12} />
                <input
                  type="text"
                  value={formData.company_name || ""}
                  onChange={e => handleChange("company_name", e.target.value)}
                  placeholder="Nome do restaurante..."
                  className="bg-transparent outline-none text-slate-500 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-white/20 w-40"
                />
              </div>
              {formData.city && (
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <MapPin size={10} /> {formData.city}
                </div>
              )}
            </div>

            {/* Pipeline value preview */}
            {Number(formData.value) > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-black text-[#EF4444]">{fmt.currencyCompact(Number(formData.value))}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${formData.probability || 10}%`, backgroundColor: probColor(formData.probability || 10) }} />
                </div>
                <span className="text-xs font-bold" style={{ color: probColor(formData.probability || 10) }}>{formData.probability || 10}%</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-white/8 shrink-0 bg-white dark:bg-[#0F1623]">
            {(["DADOS", "SPIN", "QUALIF"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3 text-[11px] font-black tracking-widest uppercase border-b-2 transition-all",
                  activeTab === tab
                    ? "border-[#EF4444] text-[#EF4444]"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {tab === "DADOS" ? "📋 Dados" : tab === "SPIN" ? "🧠 SPIN" : "⚡ BANT"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: "thin" }}>

            {/* ── DADOS TAB ── */}
            {activeTab === "DADOS" && (
              <>
                {/* Contact */}
                <Section title="Contato" icon={<Phone size={12} />}>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Telefone / WhatsApp">
                      <div className="flex">
                        <Input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={e => handleChange("phone", e.target.value)}
                          placeholder="11 99999-9999"
                          className="rounded-r-none border-r-0"
                        />
                        <button
                          onClick={handleWhatsApp}
                          className="bg-[#25D366] hover:bg-[#22c55e] text-white px-3 rounded-r-lg transition-colors flex items-center"
                          title="Abrir WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    </FormGroup>
                    <FormGroup label="E-mail">
                      <div className="flex">
                        <Input
                          type="email"
                          value={formData.email || ""}
                          onChange={e => handleChange("email", e.target.value)}
                          placeholder="email@restaurante.com"
                          className="rounded-r-none border-r-0"
                        />
                        <button
                          onClick={handleEmail}
                          className="bg-[#3b82f6] hover:bg-blue-500 text-white px-3 rounded-r-lg transition-colors flex items-center"
                        >
                          <Mail size={13} />
                        </button>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Instagram">
                      <div className="flex items-center">
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 border-r-0 rounded-l-lg px-2 py-2 text-slate-400">
                          <AtSign size={13} />
                        </span>
                        <Input
                          value={formData.instagram || ""}
                          onChange={e => handleChange("instagram", e.target.value)}
                          placeholder="@restaurante"
                          className="rounded-l-none"
                        />
                      </div>
                    </FormGroup>
                    <FormGroup label="Website">
                      <div className="flex items-center">
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 border-r-0 rounded-l-lg px-2 py-2 text-slate-400">
                          <Globe size={13} />
                        </span>
                        <Input
                          value={formData.website || ""}
                          onChange={e => handleChange("website", e.target.value)}
                          placeholder="www.restaurante.com"
                          className="rounded-l-none"
                        />
                      </div>
                    </FormGroup>
                  </div>
                </Section>

                {/* Deal */}
                <Section title="Negócio" icon={<DollarSign size={12} />}>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Valor do Contrato (R$)">
                      <Input
                        type="number"
                        value={formData.value || ""}
                        onChange={e => handleChange("value", e.target.value)}
                        placeholder="0"
                      />
                    </FormGroup>
                    <FormGroup label="Probabilidade (%)">
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={formData.probability || ""}
                          onChange={e => handleChange("probability", Math.min(100, Math.max(0, Number(e.target.value))))}
                        />
                        <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${formData.probability || 0}%`, backgroundColor: probColor(formData.probability || 0) }} />
                        </div>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Estágio do Funil">
                      <select
                        value={formData.status || "Pesquisado"}
                        onChange={e => handleChange("status", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#EF4444]/50 text-slate-900 dark:text-white"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.icon} {s.id}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Origem">
                      <select
                        value={formData.source || ""}
                        onChange={e => handleChange("source", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#EF4444]/50 text-slate-900 dark:text-white"
                      >
                        <option value="" className="bg-slate-900">Selecionar...</option>
                        {SOURCES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Responsável">
                      <select
                        value={formData.owner_id || ""}
                        onChange={e => handleChange("owner_id", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#EF4444]/50 text-slate-900 dark:text-white"
                      >
                        <option value="" className="bg-slate-900">Nenhum</option>
                        {team.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.full_name}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Próximo Follow-up">
                      <Input
                        type="datetime-local"
                        value={formData.next_action_date ? new Date(formData.next_action_date).toISOString().slice(0, 16) : ""}
                        onChange={e => handleChange("next_action_date", e.target.value ? new Date(e.target.value).toISOString() : "")}
                      />
                    </FormGroup>
                  </div>
                </Section>

                {/* Location */}
                <Section title="Localização" icon={<MapPin size={12} />}>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="Cidade">
                      <Input value={formData.city || ""} onChange={e => handleChange("city", e.target.value)} placeholder="São Paulo" />
                    </FormGroup>
                    <FormGroup label="Estado">
                      <Input value={formData.state || ""} onChange={e => handleChange("state", e.target.value)} placeholder="SP" />
                    </FormGroup>
                  </div>
                </Section>

                {/* Notes */}
                <Section title="Observações" icon={<FileText size={12} />}>
                  <textarea
                    rows={3}
                    value={formData.notes || ""}
                    onChange={e => handleChange("notes", e.target.value)}
                    placeholder="Observações gerais sobre este lead..."
                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444]/50 resize-none"
                    style={{ scrollbarWidth: "thin" }}
                  />
                </Section>
              </>
            )}

            {/* ── SPIN TAB ── */}
            {activeTab === "SPIN" && (
              <>
                <div className="flex items-start gap-3 p-3 bg-[#6366f1]/5 border border-[#6366f1]/20 rounded-xl text-sm text-[#6366f1] mb-2">
                  <Zap size={14} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Use a metodologia <strong>SPIN Selling</strong> para estruturar sua abordagem comercial. Documente cada etapa da conversa para escalar o processo.
                  </p>
                </div>
                {SPIN_FIELDS.map(field => (
                  <FormGroup key={field.key} label={field.label}>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: field.color }} />
                      <textarea
                        rows={4}
                        value={formData[field.key] || ""}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-r-lg rounded-l-sm pl-4 pr-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444]/50 resize-none"
                        style={{ scrollbarWidth: "thin" }}
                      />
                    </div>
                  </FormGroup>
                ))}
              </>
            )}

            {/* ── BANT TAB ── */}
            {activeTab === "QUALIF" && (
              <>
                <div className="flex items-start gap-3 p-3 bg-[#f97316]/5 border border-[#f97316]/20 rounded-xl mb-2">
                  <BarChart size={14} className="text-[#f97316] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#f97316] leading-relaxed">
                    Use o framework <strong>BANT</strong> para qualificar rapidamente se o lead está pronto para avançar no funil.
                  </p>
                </div>
                {[
                  { key: "bant_budget", label: "Budget (Orçamento)", placeholder: "O lead tem orçamento definido? Qual o valor que está disposto a investir?", color: "#10b981" },
                  { key: "bant_authority", label: "Authority (Autoridade)", placeholder: "Quem é o decisor? O contato tem poder de decisão ou precisa validar com alguém?", color: "#3b82f6" },
                  { key: "bant_need", label: "Need (Necessidade)", placeholder: "A necessidade está claramente identificada? Qual o nível de urgência?", color: "#ef4444" },
                  { key: "bant_timeline", label: "Timeline (Prazo)", placeholder: "Quando pretende contratar? Há uma data ou evento específico?", color: "#f97316" },
                ].map(field => (
                  <FormGroup key={field.key} label={field.label}>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: field.color }} />
                      <textarea
                        rows={3}
                        value={formData[field.key] || ""}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-r-lg rounded-l-sm pl-4 pr-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444]/50 resize-none"
                        style={{ scrollbarWidth: "thin" }}
                      />
                    </div>
                  </FormGroup>
                ))}
              </>
            )}
          </div>

          {/* Footer Save */}
          <div className="p-4 border-t border-slate-200 dark:border-white/8 bg-white dark:bg-[#0F1623] flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-white bg-[#EF4444] hover:bg-[#EF4444]/90 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Salvando..." : isNew ? "Criar Lead" : "Salvar"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT PANEL — Activities / Timeline
        ═══════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-[380px] flex flex-col bg-white dark:bg-[#111827] shrink-0">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/8 shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#EF4444]" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Atividades</h3>
              {allActivities.length > 0 && (
                <span className="text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444] px-1.5 py-0.5 rounded-full">
                  {allActivities.length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Activity Input */}
          <div className="p-4 border-b border-slate-200 dark:border-white/8 shrink-0 bg-slate-50 dark:bg-[#0F1623]">
            {/* Type selector */}
            <div className="flex gap-1.5 mb-2.5">
              {ACTIVITY_TYPES.map(at => (
                <button
                  key={at.type}
                  onClick={() => setActivityType(at.type)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                    activityType === at.type
                      ? "text-white"
                      : "text-slate-400 bg-slate-100 dark:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                  style={activityType === at.type ? { backgroundColor: at.color } : {}}
                >
                  {at.icon} {at.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                rows={2}
                value={activityContent}
                onChange={e => setActivityContent(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddActivity(); }}
                placeholder={`Registrar ${ACTIVITY_TYPES.find(a => a.type === activityType)?.label.toLowerCase()}... (Ctrl+Enter para enviar)`}
                className="w-full bg-white dark:bg-[#151B2D] border border-slate-200 dark:border-white/10 rounded-xl p-3 pr-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444]/50 resize-none"
                style={{ scrollbarWidth: "thin" }}
              />
              <button
                onClick={handleAddActivity}
                disabled={!activityContent.trim() || sendingActivity}
                className={cn(
                  "absolute right-2 bottom-2 p-1.5 rounded-lg transition-all",
                  activityContent.trim()
                    ? "text-[#EF4444] hover:bg-[#EF4444]/10"
                    : "text-slate-300 dark:text-slate-600"
                )}
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-0" style={{ scrollbarWidth: "thin" }}>
            {isNew ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 text-center">
                <Activity size={36} className="opacity-20" />
                <p className="text-sm">Atividades aparecerão aqui<br />após criar o lead.</p>
              </div>
            ) : (allActivities.length === 0 && !loadingActivities) ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 text-center">
                <MessageSquare size={36} className="opacity-20" />
                <p className="text-sm">Nenhuma atividade registrada<br />para este lead ainda.</p>
                <p className="text-xs text-slate-500">Use o campo acima para começar.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-white/5" />
                <div className="space-y-4">
                  {allActivities.map((act: any) => {
                    const at = activityIcon(act.type as ActivityType);
                    return (
                      <div key={act.id} className="relative pl-10">
                        {/* Icon dot */}
                        <div
                          className="absolute left-[10px] top-0 w-[18px] h-[18px] rounded-full flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#111827]"
                          style={{ backgroundColor: `${at.color}20`, color: at.color }}
                        >
                          {React.cloneElement(at.icon as React.ReactElement, { size: 9 })}
                        </div>

                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold" style={{ color: at.color }}>{at.label}</span>
                            <span className="text-[10px] text-slate-400">{timeAgo(act.created_at)}</span>
                            {act.author_name && (
                              <>
                                <span className="text-[10px] text-slate-500">·</span>
                                <span className="text-[10px] font-bold text-slate-500">{act.author_name}</span>
                              </>
                            )}
                          </div>
                          <div className={cn(
                            "text-xs rounded-xl p-3 leading-relaxed border",
                            act._local ? "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5" : "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5"
                          )}>
                            {act.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Creation event */}
                  {!isNew && (
                    <div className="relative pl-10">
                      <div className="absolute left-[10px] top-0 w-[18px] h-[18px] rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#111827]">
                        <Target size={9} className="text-slate-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 mb-0.5">Lead criado</div>
                        <div className="text-xs text-slate-500 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-2.5">
                          Lead adicionado ao funil em estágio <span className="font-bold">{lead?.status || "Pesquisado"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STAGE SELECTOR ────────────────────────────────────────────────────
function StageSelector({ value, onChange, stages }: { value: string; onChange: (v: string) => void; stages: typeof STAGES }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = stages.find(s => s.id === value) || stages[0];

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all hover:opacity-90"
        style={{ color: current.color, borderColor: `${current.color}40`, backgroundColor: `${current.color}10` }}
      >
        <span>{current.icon}</span>
        {current.id}
        <ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1a2236] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]">
          {stages.map(s => (
            <button
              key={s.id}
              onClick={() => { onChange(s.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5",
                s.id === value && "bg-slate-50 dark:bg-white/5"
              )}
              style={{ color: s.color }}
            >
              <span>{s.icon}</span> {s.id}
              {s.id === value && <CheckCircle2 size={11} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QUICK ACTION BUTTON ───────────────────────────────────────────────
function QuickActionBtn({ onClick, icon, label, color }: { onClick: () => void; icon: React.ReactNode; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border transition-all hover:opacity-90"
      style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── SECTION ───────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── FORM GROUP ────────────────────────────────────────────────────────
function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ─── INPUT ─────────────────────────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444]/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-white/20",
        props.className
      )}
    />
  );
}
