import React, { useState } from "react";
import {
  MapPin, Mail, Calendar, CreditCard, FileSignature, Link2,
  Edit, Trash2, Pause, Play, MessageSquare, Phone, Camera, Globe,
  CheckCircle2, ExternalLink, Activity, MessageCircle, Building2, Copy,
} from "lucide-react";
import { Drawer } from "./ui/Drawer";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { ProgressBar } from "./ui/ProgressBar";
import { Tabs } from "./ui/Tabs";
import { Card, CardHeader } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { useToast } from "./ui/Toast";
import { ClientFormModal } from "./ClientFormModal";
import { useClientDetail, updateClient, deleteClient } from "../lib/api";
import { fmt } from "../lib/format";
import { buildWhatsAppUrl, formatPhoneDisplay, waTemplates } from "../lib/whatsapp";

interface Props {
  clientId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  ifood: "iFood",
  gmb: "Google Meu Negócio",
  ga4: "Google Analytics 4",
  menu_anota_ai: "Anota AI",
  menu_goomer: "Goomer",
  menu_saipos: "Saipos",
  menu_cardapio_web: "Cardápio Web",
  menu_menu_dino: "MenuDino",
  menu_custom_web: "Cardápio Próprio",
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success", pending: "warning", paused: "neutral", cancelled: "danger",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Ativo", pending: "Pendente", paused: "Pausado", cancelled: "Cancelado",
};

export function ClientDetailDrawer({ clientId, onClose, onChanged }: Props) {
  const toast = useToast();
  const { data, loading, refetch } = useClientDetail(clientId ?? undefined);
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  async function togglePause() {
    if (!data) return;
    const newStatus = data.status === "paused" ? "active" : "paused";
    const { error } = await updateClient(data.id, { status: newStatus });
    if (error) toast.error("Erro", error.message);
    else {
      toast.success(newStatus === "paused" ? "Cliente pausado" : "Cliente reativado");
      refetch();
      onChanged?.();
    }
  }

  async function handleDelete() {
    if (!data) return;
    if (!confirm(`Excluir "${data.name}"? Essa ação não pode ser desfeita e remove TODOS os dados vinculados (campanhas, faturas, mensagens, etc).`)) return;
    const { error } = await deleteClient(data.id);
    if (error) toast.error("Erro ao excluir", error.message);
    else {
      toast.success("Cliente excluído");
      onChanged?.();
      onClose();
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!", label);
  }

  const open = !!clientId;
  const tabs = [
    { id: "overview", label: "Visão Geral" },
    { id: "contact", label: "Contato" },
    { id: "finance", label: "Financeiro", count: data?.invoices?.length },
    { id: "marketing", label: "Marketing", count: data?.integrations?.length },
    { id: "ops", label: "Operação", count: (data?.tasks?.length ?? 0) + (data?.events?.length ?? 0) },
  ];

  // URL do WhatsApp principal (com saudação)
  const waMainUrl = data ? buildWhatsAppUrl(data.whatsapp, waTemplates.greeting(data.contact_name)) : null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width="lg"
        title={loading ? "Carregando..." : data?.name ?? "Cliente"}
        description={data?.type ?? ""}
      >
        {loading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* HEADER CARD */}
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1a2238] border-slate-800/50">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ background: `${data.color}22` }} />
              <div className="relative flex items-start gap-4">
                <Avatar name={data.name} color={data.color} size="xl" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-extrabold tracking-tight">{data.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge tone={STATUS_TONE[data.status]} dot>{STATUS_LABEL[data.status]}</Badge>
                    <Badge tone="brand" size="sm">Plano {data.plan}</Badge>
                    {data.city && (
                      <span className="inline-flex items-center gap-1 text-[12px] text-slate-300 font-bold">
                        <MapPin size={11} /> {data.city}{data.state && `/${data.state}`}
                      </span>
                    )}
                  </div>
                  {data.email && (
                    <p className="text-[12px] text-slate-400 font-semibold mt-2 inline-flex items-center gap-1.5">
                      <Mail size={11} /> {data.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex items-center gap-2 mt-5 pt-5 border-t border-white/10 flex-wrap">
                {waMainUrl && (
                  <a
                    href={waMainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebb59] text-white font-bold text-[13px] shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                <Button size="sm" variant="primary" icon={Edit} onClick={() => setEditOpen(true)}>Editar</Button>
                <Button size="sm" variant="outline" icon={data.status === "paused" ? Play : Pause} onClick={togglePause} className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                  {data.status === "paused" ? "Reativar" : "Pausar"}
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={handleDelete} className="text-red-300 hover:bg-red-500/20 ml-auto">
                  Excluir
                </Button>
              </div>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KPI label="MRR" value={fmt.currency(Number(data.mrr ?? 0))} color="#10b981" icon={CreditCard} />
              <KPI label="Health" value={`${data.health_score}/100`} color={data.health_score >= 80 ? "#10b981" : data.health_score >= 60 ? "#f59e0b" : "#ef4444"} icon={Activity} />
              <KPI label="Integrações" value={String(data.integrations.length)} color="#3b82f6" icon={Link2} />
              <KPI label="Cliente desde" value={fmt.date(data.joined_at)} color="#a855f7" icon={Calendar} />
            </div>

            {/* Health bar */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Health Score</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{data.health_score}/100</span>
              </div>
              <ProgressBar value={data.health_score} tone={data.health_score >= 80 ? "success" : data.health_score >= 60 ? "warning" : "danger"} size="lg" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                {data.health_score >= 80
                  ? "Cliente saudável e engajado."
                  : data.health_score >= 60
                  ? "Atenção: relação requer cuidado."
                  : "RISCO: cliente em zona crítica — agir agora."}
              </p>
            </Card>

            {/* Manager */}
            {data.manager_name && (
              <Card padded>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Gestor responsável</p>
                <div className="flex items-center gap-3">
                  <Avatar name={data.manager_name} color="#e01c1c" size="md" status="online" />
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">{data.manager_name}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{data.manager_email}</p>
                  </div>
                  <Button size="sm" variant="ghost" icon={MessageSquare} className="ml-auto">Mensagem</Button>
                </div>
              </Card>
            )}

            {/* Tabs */}
            <Tabs tabs={tabs} active={tab} onChange={setTab} variant="underline" />

            {/* Tab content */}
            {tab === "overview" && (
              <div className="space-y-4">
                {/* Quick contact summary */}
                {(data.contact_name || data.whatsapp || data.email) && (
                  <Card>
                    <CardHeader title="Contato rápido" action={<Button size="xs" variant="ghost" onClick={() => setTab("contact")}>Ver tudo →</Button>} />
                    <div className="space-y-2">
                      {data.contact_name && <Row label="Responsável" value={data.contact_name} />}
                      {data.whatsapp && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0">
                          <span className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold">WhatsApp</span>
                          <a
                            href={buildWhatsAppUrl(data.whatsapp, waTemplates.greeting(data.contact_name)) ?? "#"}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#25D366] hover:underline"
                          >
                            <MessageCircle size={13} /> {formatPhoneDisplay(data.whatsapp)}
                          </a>
                        </div>
                      )}
                      {data.email && <Row label="Email" value={data.email} />}
                    </div>
                  </Card>
                )}

                {data.contract ? (
                  <Card>
                    <CardHeader title="Contrato vigente" action={<FileSignature size={16} className="text-slate-400" />} />
                    <div className="space-y-2">
                      <Row label="Escopo" value={data.contract.scope ?? "—"} />
                      <Row label="Valor mensal" value={fmt.currency(Number(data.contract.monthly_value))} />
                      <Row label="Início" value={fmt.date(data.contract.start_date)} />
                      <Row label="Renovação" value={data.contract.end_date ? fmt.date(data.contract.end_date) : "—"} />
                      <Row label="Assinatura" value={data.contract.signed ? "✓ Assinado" : "⚠ Pendente"} />
                    </div>
                  </Card>
                ) : (
                  <EmptyState icon={FileSignature} title="Sem contrato cadastrado" description="Adicione um contrato em Contratos pra registrar escopo e valor." />
                )}

                {data.notes && (
                  <Card>
                    <CardHeader title="Notas internas" />
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                  </Card>
                )}
              </div>
            )}

            {tab === "contact" && (
              <div className="space-y-4">
                {/* Card de Responsável */}
                <Card>
                  <CardHeader title="Pessoa de contato" />
                  {!data.contact_name && !data.email && !data.phone && !data.whatsapp ? (
                    <EmptyState
                      icon={Phone}
                      title="Sem contato cadastrado"
                      description="Adicione os dados de contato em Editar."
                      action={<Button size="sm" variant="primary" icon={Edit} onClick={() => setEditOpen(true)}>Editar cliente</Button>}
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.contact_name && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                          <Avatar name={data.contact_name} color={data.color} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white">{data.contact_name}</p>
                            <p className="text-[11px] text-slate-500 font-semibold">Responsável</p>
                          </div>
                        </div>
                      )}

                      {data.whatsapp && (
                        <ContactRow
                          icon={MessageCircle}
                          iconColor="#25D366"
                          label="WhatsApp"
                          value={formatPhoneDisplay(data.whatsapp)}
                          action={
                            <a
                              href={buildWhatsAppUrl(data.whatsapp, waTemplates.greeting(data.contact_name)) ?? "#"}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366] hover:bg-[#1ebb59] text-white text-[12px] font-bold transition-colors"
                            >
                              <MessageCircle size={12} /> Conversar
                            </a>
                          }
                          onCopy={() => copyToClipboard(data.whatsapp, "WhatsApp")}
                        />
                      )}

                      {data.phone && (
                        <ContactRow
                          icon={Phone}
                          iconColor="#3b82f6"
                          label="Telefone fixo"
                          value={formatPhoneDisplay(data.phone)}
                          action={
                            <a
                              href={`tel:${data.phone.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[12px] font-bold transition-colors"
                            >
                              <Phone size={12} /> Ligar
                            </a>
                          }
                          onCopy={() => copyToClipboard(data.phone, "Telefone")}
                        />
                      )}

                      {data.email && (
                        <ContactRow
                          icon={Mail}
                          iconColor="#a855f7"
                          label="Email"
                          value={data.email}
                          action={
                            <a
                              href={`mailto:${data.email}`}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[12px] font-bold transition-colors"
                            >
                              <Mail size={12} /> Enviar
                            </a>
                          }
                          onCopy={() => copyToClipboard(data.email, "Email")}
                        />
                      )}

                      {data.instagram && (
                        <ContactRow
                          icon={Camera}
                          iconColor="#e4405f"
                          label="Camera"
                          value={`@${data.instagram}`}
                          action={
                            <a
                              href={`https://instagram.com/${data.instagram}`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[12px] font-bold transition-colors"
                            >
                              <ExternalLink size={12} /> Abrir
                            </a>
                          }
                        />
                      )}

                      {data.website && (
                        <ContactRow
                          icon={Globe}
                          iconColor="#10b981"
                          label="Site"
                          value={data.website}
                          action={
                            <a
                              href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[12px] font-bold transition-colors"
                            >
                              <ExternalLink size={12} /> Abrir
                            </a>
                          }
                        />
                      )}
                    </div>
                  )}
                </Card>

                {/* Card de Empresa */}
                {(data.cnpj || data.address) && (
                  <Card>
                    <CardHeader title="Dados da empresa" action={<Building2 size={16} className="text-slate-400" />} />
                    <div className="space-y-2">
                      {data.cnpj && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0">
                          <span className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold">CNPJ</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white font-mono">{data.cnpj}</span>
                            <button onClick={() => copyToClipboard(data.cnpj, "CNPJ")} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      {(data.city || data.address) && (
                        <Row
                          label="Endereço"
                          value={[data.address, data.city, data.state].filter(Boolean).join(", ") || "—"}
                        />
                      )}
                    </div>
                  </Card>
                )}

                {/* Templates de WhatsApp pra contato rápido */}
                {data.whatsapp && (
                  <Card>
                    <CardHeader title="Mensagens rápidas" subtitle="Templates pré-prontos pro WhatsApp" />
                    <div className="space-y-2">
                      <WhatsAppTemplate
                        label="Cumprimento"
                        message={waTemplates.greeting(data.contact_name)}
                        whatsapp={data.whatsapp}
                      />
                      <WhatsAppTemplate
                        label="Follow-up"
                        message={waTemplates.followUp(data.contact_name)}
                        whatsapp={data.whatsapp}
                      />
                      <WhatsAppTemplate
                        label="Relatório pronto"
                        message={waTemplates.reportReady(data.contact_name, new Date().toLocaleDateString("pt-BR", { month: "long" }))}
                        whatsapp={data.whatsapp}
                      />
                    </div>
                  </Card>
                )}
              </div>
            )}

            {tab === "finance" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Últimas faturas" subtitle="Mais recentes primeiro" />
                  {data.invoices.length === 0 ? (
                    <EmptyState icon={CreditCard} title="Sem faturas" />
                  ) : (
                    <div className="space-y-2">
                      {data.invoices.map((inv: any) => {
                        const tone: Record<string, "success" | "warning" | "danger"> = { paid: "success", pending: "warning", overdue: "danger" };
                        const isUnpaid = inv.status === "pending" || inv.status === "overdue";
                        const billingUrl = data.whatsapp && isUnpaid
                          ? buildWhatsAppUrl(data.whatsapp, waTemplates.billing({
                              contactName: data.contact_name,
                              restaurantName: data.name,
                              invoiceDescription: inv.description,
                              amount: Number(inv.amount),
                              dueDate: inv.due_date,
                            }))
                          : null;
                        return (
                          <div key={inv.id} className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{inv.description}</p>
                                <p className="text-[11px] text-slate-500 font-semibold">Vence em {fmt.date(inv.due_date)}</p>
                              </div>
                              <span className="text-[14px] font-extrabold text-slate-900 dark:text-white tabular-nums">{fmt.currency(Number(inv.amount))}</span>
                              <Badge tone={tone[inv.status] ?? "neutral"} size="sm">
                                {inv.status === "paid" ? "Pago" : inv.status === "pending" ? "Pendente" : "Atrasado"}
                              </Badge>
                            </div>
                            {billingUrl && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                <a
                                  href={billingUrl}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#25D366] hover:underline"
                                >
                                  <MessageCircle size={12} /> Cobrar via WhatsApp
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {tab === "marketing" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Integrações conectadas" subtitle={`${data.integrations.length} ativas`} />
                  {data.integrations.length === 0 ? (
                    <EmptyState icon={Link2} title="Sem integrações" description="O cliente ainda não conectou nenhuma plataforma." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.integrations.map((i: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/60 dark:border-slate-800/60">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{PROVIDER_LABELS[i.provider] ?? i.provider}</p>
                            <p className="text-[10px] text-slate-500 font-semibold truncate">{i.account_name ?? "Conectado"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Campanhas" subtitle={`${data.campaigns.length} cadastradas`} />
                  {data.campaigns.length === 0 ? (
                    <p className="text-[12px] text-slate-400 text-center py-4 font-medium">Sem campanhas ainda.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.campaigns.slice(0, 5).map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1120]">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge tone={c.channel === "google" ? "info" : "brand"} size="sm">{c.channel}</Badge>
                            <span className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{c.name}</span>
                          </div>
                          <Badge tone={c.status === "active" ? "success" : "neutral"} size="sm" dot={c.status === "active"}>
                            {c.status === "active" ? "Ativa" : "Pausada"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {tab === "ops" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Tarefas" subtitle={`${data.tasks.length} no total`} />
                  {data.tasks.length === 0 ? (
                    <p className="text-[12px] text-slate-400 text-center py-4 font-medium">Sem tarefas vinculadas.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.tasks.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1120]">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "done" ? "bg-emerald-500" : t.status === "in_progress" ? "bg-amber-500" : "bg-slate-400"}`} />
                          <span className="text-[12px] font-bold text-slate-900 dark:text-white flex-1 truncate">{t.title}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Próximos eventos" subtitle="Calls e reuniões" />
                  {data.events.length === 0 ? (
                    <p className="text-[12px] text-slate-400 text-center py-4 font-medium">Nada agendado.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.events.map((e: any) => {
                        const dt = new Date(e.starts_at);
                        return (
                          <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1120]">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-[12px] font-bold text-slate-900 dark:text-white flex-1 truncate">{e.title}</span>
                            <span className="text-[11px] text-slate-500 font-bold tabular-nums">
                              {fmt.date(dt)} {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ClientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={data}
        onSaved={() => {
          refetch();
          onChanged?.();
        }}
      />
    </>
  );
}

function KPI({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon size={12} />
        </div>
      </div>
      <p className="text-[15px] font-extrabold text-slate-900 dark:text-white tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0">
      <span className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold">{label}</span>
      <span className="text-[13px] font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function ContactRow({
  icon: Icon, iconColor, label, value, action, onCopy,
}: {
  icon: any; iconColor: string; label: string; value: string; action?: React.ReactNode; onCopy?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${iconColor}15`, color: iconColor, border: `1px solid ${iconColor}30` }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate font-mono">{value}</p>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5">
          <Copy size={13} />
        </button>
      )}
      {action}
    </div>
  );
}

function WhatsAppTemplate({ label, message, whatsapp }: { label: string; message: string; whatsapp: string }) {
  const url = buildWhatsAppUrl(whatsapp, message);
  return (
    <a
      href={url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.04] transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#25D366]">{label}</span>
        <MessageCircle size={13} className="text-slate-400 group-hover:text-[#25D366] flex-shrink-0" />
      </div>
      <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{message}</p>
    </a>
  );
}
