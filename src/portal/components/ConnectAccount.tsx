import React, { useEffect, useState } from "react";
import {
  Link2, CheckCircle2, AlertCircle, RefreshCw, Trash2, KeyRound,
  ExternalLink, ChevronDown, BookOpen, Sparkles,
} from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";
import { useToast } from "./ui/Toast";
import { useIntegration, saveIntegration, removeIntegration } from "../lib/api";
import { fmt } from "../lib/format";
import { cn } from "../lib/cn";

type Field = {
  key: "customer_id" | "account_id" | "pixel_id" | "access_token" | "account_name";
  label: string;
  hint?: string;
  type?: "text" | "password";
  required?: boolean;
};

export type TutorialStep = {
  title: string;
  description: React.ReactNode;
  link?: { url: string; label: string };
};

export type QuickAction = {
  url: string;
  label: string;
  description?: string;
};

interface ConnectAccountProps {
  clientId: string | undefined;
  provider: "google_ads" | "meta_ads" | "ifood" | "gmb" | "ga4";
  title: string;
  description: string;
  fields: Field[];
  brandColor?: string;
  tutorial?: TutorialStep[];
  quickActions?: QuickAction[];
  oauthNote?: string;
}

export function ConnectAccount({
  clientId,
  provider,
  title,
  description,
  fields,
  brandColor = "#e01c1c",
  tutorial,
  quickActions,
  oauthNote,
}: ConnectAccountProps) {
  const toast = useToast();
  const { data: integration, loading, refetch } = useIntegration(clientId, provider);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    if (integration) {
      setValues({
        customer_id: integration.customer_id ?? "",
        account_id: integration.account_id ?? "",
        pixel_id: integration.pixel_id ?? "",
        access_token: integration.access_token ?? "",
        account_name: integration.account_name ?? "",
      });
    }
  }, [integration]);

  async function handleSave() {
    if (!clientId) return;
    setSaving(true);
    const { error } = await saveIntegration({ clientId, provider, ...values });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar", error.message);
      return;
    }
    toast.success("Conta conectada!", `${title} pronta pra sincronizar`);
    setEditing(false);
    refetch();
  }

  async function handleDisconnect() {
    if (!clientId || !confirm("Desconectar essa conta?")) return;
    const { error } = await removeIntegration(clientId, provider);
    if (error) toast.error("Erro", error.message);
    else {
      toast.success("Conta desconectada");
      setEditing(false);
      setValues({});
      refetch();
    }
  }

  if (loading) return <Skeleton className="h-48 w-full" />;

  const isConnected = integration?.status === "connected";

  // Modo "Conectado" (resumido)
  if (isConnected && !editing) {
    return (
      <Card className="border-l-4" style={{ borderLeftColor: brandColor }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brandColor}15`, color: brandColor, border: `1px solid ${brandColor}30` }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</h3>
                <Badge tone="success" dot size="sm">Conectado</Badge>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                {integration.account_name ?? integration.customer_id ?? integration.account_id ?? "Conta vinculada"}
                {integration.last_sync_at && ` · última sync ${fmt.date(integration.last_sync_at)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => toast.info("Sincronização", "Sincronização automática em breve. Por ora, dados são populados pelo gestor de tráfego.")}>
              Sincronizar
            </Button>
            <Button size="sm" variant="ghost" icon={KeyRound} onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button size="sm" variant="ghost" icon={Trash2} onClick={handleDisconnect} className="text-red-500" />
          </div>
        </div>
      </Card>
    );
  }

  // Modo "Conectar" ou "Editar"
  return (
    <Card>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brandColor}15`, color: brandColor, border: `1px solid ${brandColor}30` }}>
          {isConnected ? <KeyRound size={22} /> : <Link2 size={22} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
              {isConnected ? `Editar credenciais — ${title}` : `Conectar ${title}`}
            </h3>
            {!isConnected && <Badge tone="warning" dot size="sm">Sem conexão</Badge>}
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-snug">{description}</p>
        </div>
      </div>

      {/* Quick Actions — botões grandes pra abrir o lugar de cada credencial */}
      {quickActions && quickActions.length > 0 && (
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((qa, i) => (
            <a
              key={i}
              href={qa.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#e01c1c] hover:bg-[#e01c1c]/[0.02] dark:hover:bg-[#e01c1c]/[0.04] transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${brandColor}15`, color: brandColor }}>
                <ExternalLink size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{qa.label}</p>
                {qa.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{qa.description}</p>}
              </div>
              <ExternalLink size={14} className="text-slate-400 group-hover:text-[#e01c1c]" />
            </a>
          ))}
        </div>
      )}

      {/* Tutorial expansível */}
      {tutorial && tutorial.length > 0 && (
        <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => setTutorialOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-4 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BookOpen size={15} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Como pegar essas credenciais?</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Passo-a-passo · {tutorial.length} etapas</p>
              </div>
            </div>
            <ChevronDown size={16} className={cn("text-slate-400 transition-transform", tutorialOpen && "rotate-180")} />
          </button>

          {tutorialOpen && (
            <div className="p-5 space-y-4 bg-white dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-slate-800">
              {tutorial.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e01c1c] to-[#ff8732] text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{step.title}</p>
                    <div className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{step.description}</div>
                    {step.link && (
                      <a
                        href={step.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#e01c1c] hover:underline mt-1.5"
                      >
                        <ExternalLink size={11} /> {step.link.label}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {oauthNote && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-start gap-2">
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-blue-700 dark:text-blue-300 leading-snug">{oauthNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <Input
            key={f.key}
            label={f.label + (f.required ? " *" : "")}
            type={f.type === "password" ? "password" : "text"}
            hint={f.hint}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/60">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          {isConnected ? "Salvar alterações" : "Conectar"}
        </Button>
        {editing && (
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
        )}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <AlertCircle size={12} />
          Credenciais armazenadas com criptografia
        </div>
      </div>
    </Card>
  );
}
