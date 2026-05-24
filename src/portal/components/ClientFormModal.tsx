import React, { useEffect, useState } from "react";
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  client?: Client | null; // se passado, modo edição
}

export function ClientFormModal({ open, onClose, onSaved, client }: Props) {
  const toast = useToast();
  const { data: team = [] } = useTeam();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    email: "",
    city: "",
    state: "",
    color: "#e01c1c",
    status: "pending" as Client["status"],
    plan: "standard",
    mrr: "0",
    health_score: "50",
    manager_id: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        type: client.type ?? "",
        email: client.email ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        color: client.color ?? "#e01c1c",
        status: client.status,
        plan: client.plan ?? "standard",
        mrr: String(client.mrr ?? 0),
        health_score: String(client.health_score ?? 50),
        manager_id: client.manager_id ?? "",
      });
    } else {
      setForm({
        name: "", type: "", email: "", city: "", state: "",
        color: "#e01c1c", status: "pending", plan: "standard",
        mrr: "0", health_score: "50", manager_id: "",
      });
    }
  }, [client, open]);

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nome obrigatório");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type || null,
      email: form.email || null,
      city: form.city || null,
      state: form.state || null,
      color: form.color,
      status: form.status,
      plan: form.plan,
      mrr: parseFloat(form.mrr) || 0,
      health_score: parseInt(form.health_score) || 50,
      manager_id: form.manager_id || null,
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
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {client ? "Salvar alterações" : "Criar cliente"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nome do restaurante *"
          placeholder="Ex: Burger King (Vila Madalena)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Tipo" placeholder="Fast Food, Pizzaria..." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input label="Email de contato" type="email" placeholder="contato@restaurante.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="UF" placeholder="SP" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} />
          <Input label="MRR (R$)" type="number" value={form.mrr} onChange={(e) => setForm({ ...form, mrr: e.target.value })} />
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
          <Input label="Health Score (0-100)" type="number" min="0" max="100" value={form.health_score} onChange={(e) => setForm({ ...form, health_score: e.target.value })} />
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
    </Modal>
  );
}
