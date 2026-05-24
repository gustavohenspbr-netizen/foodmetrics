import React, { useEffect, useState } from "react";
import { Link2, CheckCircle2, AlertCircle, RefreshCw, Trash2, KeyRound } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";
import { useToast } from "./ui/Toast";
import { useIntegration, saveIntegration, removeIntegration, type Integration } from "../lib/api";
import { fmt } from "../lib/format";

type Field = {
  key: "customer_id" | "account_id" | "pixel_id" | "access_token" | "account_name";
  label: string;
  hint?: string;
  type?: "text" | "password";
  required?: boolean;
};

interface ConnectAccountProps {
  clientId: string | undefined;
  provider: "google_ads" | "meta_ads" | "ifood" | "gmb" | "ga4";
  title: string;
  description: string;
  fields: Field[];
  brandColor?: string;
}

export function ConnectAccount({
  clientId,
  provider,
  title,
  description,
  fields,
  brandColor = "#e01c1c",
}: ConnectAccountProps) {
  const toast = useToast();
  const { data: integration, loading, refetch } = useIntegration(clientId, provider);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
