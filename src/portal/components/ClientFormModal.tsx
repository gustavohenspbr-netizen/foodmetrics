import React, { useEffect, useState } from "react";
import { User, Phone, Briefcase, Settings, MessageCircle, Building2, Globe, AtSign } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";
import { createClient, updateClient, useTeam, type Client } from "../lib/api";

const COLORS = ["#e01c1c", "#ff8732", "#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#0F172A", "#bfa15f"];
const PLANS = ["standard", "premium", "enterprise"];
const STATUSES: { value: Client["status"]; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "pending", label: "Pendente" },
  { value: "paused", label: "Pausado" },
  { value: "cancelled", label: "Cancelado" },
];

function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskCnpj(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  client?: Client | null;
}

const SECTIONS = [
  { id: "identification", label: "Identificação", icon: Briefcase },
  { id: "contact", label: "Contato", icon: Phone },
  { id: "business", label: "Negócio", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function ClientFormModal({ open, onClose, onSaved, client }: Props) {
  const toast = useToast();
  const { data: team = [] } = useTeam();
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState("identification");

  const [form, setForm] = useState({
    name: "",
    type: "",
    color: "#e01c1c",
    contact_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    website: "",
    cnpj: "",
    city: "",
    state: "",
    address: "",
    status: "pending" as Client["status"],
    plan: "standard",
    mrr: "0",
    health_score: "50",
    manager_id: "",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        type: client.type ?? "",
        color: client.color ?? "#e01c1c",
        contact_name: client.contact_name ?? "",
        email: client.email ?? "",
        phone: maskPhone(client.phone ?? ""),
        whatsapp: maskPhone(client.whatsapp ?? ""),
        instagram: client.instagram ?? "",
        website: client.website ?? "",
        cnpj: maskCnpj(client.cnpj ?? ""),
        city: client.city ?? "",
        state: client.state ?? "",
        address: client.address ?? "",
        status: client.status,
        plan: client.plan ?? "standard",
        mrr: String(client.mrr ?? 0),
        health_score: String(client.health_score ?? 50),
        manager_id: client.manager_id ?? "",
        notes: client.notes ?? "",
      });
    } else {
      setForm({
        name: "", type: "", color: "#e01c1c", contact_name: "", email: "",
        phone: "", whatsapp: "", instagram: "", website: "", cnpj: "",
        city: "", state: "", address: "",
        status: "pending", plan: "standard", mrr: "0", health_score: "50",
        manager_id: "", notes: "",
      });
    }
    if (open) setSection("identification");
  }, [client, open]);

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nome obrigatório");
      setSection("identification");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type || null,
      color: form.color,
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone.replace(/\D/g, "") || null,
      whatsapp: form.whatsapp.replace(/\D/g, "") || null,
      instagram: form.instagram.replace(/^@/, "") || null,
      website: form.website || null,
      cnpj: form.cnpj.replace(/\D/g, "") || null,
      city: form.city || null,
      state: form.state || null,
      address: form.address || null,
      status: form.status,
      plan: form.plan,
      mrr: parseFloat(form.mrr) || 0,
      health_score: parseInt(form.health_score) || 50,
      manager_id: form.manager_id || null,
      notes: form.notes || null,
      avatar: form.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase(),
    };

    const { error } = client
      ? await updateClient(client.id, payload as any)
      : await createClient(payload as any);

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar", error.message);
      return;
    }
    toast.success(client ? "Cliente atualizado!" : "Cliente criado!");
    onSaved?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? "Editar cliente" : "Novo cliente"}
      description={client ? "Atualize os dados do restaurante." : "Cadastre um novo restaurante no sistema."}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {client ? "Salvar alterações" : "Criar cliente"}
          </Button>
        </>
      }
    >
      {/* Seções */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
              section === s.id
                ? "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <s.icon size={13} />
            {s.label}
          </button>
        ))}
      </div>

      {/* IDENTIFICAÇÃO */}
      {section === "identification" && (
        <div className="space-y-4">
          <Input
            label="Nome do restaurante *"
            placeholder="Ex: Burger King (Vila Madalena)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tipo / Segmento" placeholder="Fast Food, Pizzaria, Bistrô..." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Input label="CNPJ" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })} />
          </div>
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Cor do avatar</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${form.color === c ? "border-white shadow-[0_0_0_3px_rgba(224,28,28,0.4)] scale-110" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTATO */}
      {section === "contact" && (
        <div className="space-y-4">
          <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-start gap-2.5">
            <MessageCircle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-emerald-800 dark:text-emerald-200 font-medium leading-snug">
              Preencha o WhatsApp pra ativar o botão de contato direto na ficha — facilita cobranças e follow-ups.
            </p>
          </div>

          <Input
            label="Nome do responsável"
            placeholder="Ex: Carlos Mendes"
            icon={User}
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              icon={AtSign}
              placeholder="contato@restaurante.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Telefone fixo"
              icon={Phone}
              placeholder="(11) 3000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp (com DDD)"
              icon={MessageCircle}
              placeholder="(11) 98765-4321"
              hint="Será usado pro botão de contato direto"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
            />
            <Input
              label="Instagram"
              placeholder="@restaurante"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            />
          </div>
          <Input
            label="Site"
            icon={Globe}
            placeholder="https://restaurante.com.br"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
      )}

      {/* NEGÓCIO */}
      {section === "business" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="UF" placeholder="SP" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} />
            <Input label="MRR (R$)" type="number" icon={Briefcase} value={form.mrr} onChange={(e) => setForm({ ...form, mrr: e.target.value })} />
          </div>
          <Input
            label="Endereço completo"
            icon={Building2}
            placeholder="Rua, número, bairro"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Notas internas
            </label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Histórico, particularidades, preferências do cliente..."
              className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 resize-none"
            />
          </div>
        </div>
      )}

      {/* CONFIGURAÇÕES */}
      {section === "settings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Client["status"] })}
                className="w-full h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e01c1c]/30"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Plano</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e01c1c]/30 capitalize"
              >
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Input label="Health Score" type="number" min="0" max="100" value={form.health_score} onChange={(e) => setForm({ ...form, health_score: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Gestor responsável</label>
            <select
              value={form.manager_id}
              onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e01c1c]/30"
            >
              <option value="">— Não atribuído —</option>
              {team.map((m: any) => <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>)}
            </select>
          </div>
        </div>
      )}
    </Modal>
  );
}
