import React, { useState } from "react";
import { Key, Eye, EyeOff, Plus, Trash2, Edit2, Copy, ExternalLink, Save, X, Lock, User, Globe, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { useClientCredentials, createClientCredential, updateClientCredential, deleteClientCredential, type ClientCredential } from "../lib/api";

interface Props {
  clientId: string;
}

export function CredentialsManager({ clientId }: Props) {
  const toast = useToast();
  const { data: credentials = [], refetch, loading } = useClientCredentials(clientId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle("");
    setUsername("");
    setPassword("");
    setUrl("");
    setNotes("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Título é obrigatório");
    
    setSaving(true);
    try {
      const { error } = await createClientCredential({
        client_id: clientId,
        title,
        username,
        password,
        url,
        notes,
      });

      if (error) {
        toast.error("Erro ao adicionar credencial", error.message);
      } else {
        toast.success("Credencial adicionada com sucesso!");
        resetForm();
        setIsAdding(false);
        refetch();
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cred: ClientCredential) => {
    setEditingId(cred.id);
    setTitle(cred.title);
    setUsername(cred.username || "");
    setPassword(cred.password || "");
    setUrl(cred.url || "");
    setNotes(cred.notes || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!title.trim()) return toast.error("Título é obrigatório");

    setSaving(true);
    try {
      const { error } = await updateClientCredential(editingId, {
        title,
        username,
        password,
        url,
        notes,
      });

      if (error) {
        toast.error("Erro ao atualizar credencial", error.message);
      } else {
        toast.success("Credencial atualizada!");
        setEditingId(null);
        resetForm();
        refetch();
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir as credenciais de "${name}"?`)) return;

    try {
      const { error } = await deleteClientCredential(id);
      if (error) {
        toast.error("Erro ao deletar", error.message);
      } else {
        toast.success("Credencial removida!");
        refetch();
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock size={16} className="text-[#e01c1c]" /> Senhas e Acessos Salvos
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Apenas administradores e o próprio cliente podem acessar esta área.</p>
        </div>
        {!isAdding && !editingId && (
          <Button type="button" size="sm" variant="primary" icon={Plus} onClick={() => setIsAdding(true)}>
            Novo Acesso
          </Button>
        )}
      </div>

      {/* Add Credential Form */}
      {isAdding && (
        <Card className="border border-red-500/20 bg-slate-50/50 dark:bg-[#111] p-5">
          <CardHeader title="Adicionar Novo Acesso" action={<Button type="button" size="xs" variant="ghost" onClick={() => { setIsAdding(false); resetForm(); }} icon={X} />} />
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Identificação / Plataforma" placeholder="Ex: Instagram, Google, iFood..." value={title} onChange={e => setTitle(e.target.value)} required />
              <Input label="Link de Acesso (URL)" placeholder="Ex: https://instagram.com..." value={url} onChange={e => setUrl(e.target.value)} icon={Globe} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Usuário / Login / Email" placeholder="Ex: email@empresa.com" value={username} onChange={e => setUsername(e.target.value)} icon={User} />
              <Input label="Senha" type="text" placeholder="Senha de acesso" value={password} onChange={e => setPassword(e.target.value)} icon={Key} />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Observações / Instruções</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Detalhes adicionais, como perguntas de segurança, backup codes, etc..."
                className="w-full min-h-[80px] bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); resetForm(); }}>Cancelar</Button>
              <Button type="submit" variant="primary" icon={Save} loading={saving}>Salvar Credencial</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Credential Form */}
      {editingId && (
        <Card className="border border-red-500/20 bg-slate-50/50 dark:bg-[#111] p-5">
          <CardHeader title="Editar Acesso" action={<Button type="button" size="xs" variant="ghost" onClick={() => { setEditingId(null); resetForm(); }} icon={X} />} />
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Identificação / Plataforma" placeholder="Ex: Instagram" value={title} onChange={e => setTitle(e.target.value)} required />
              <Input label="Link de Acesso (URL)" placeholder="Ex: https://instagram.com" value={url} onChange={e => setUrl(e.target.value)} icon={Globe} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Usuário / Login / Email" placeholder="Ex: login" value={username} onChange={e => setUsername(e.target.value)} icon={User} />
              <Input label="Senha" type="text" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} icon={Key} />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Observações</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anotações"
                className="w-full min-h-[80px] bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); resetForm(); }}>Cancelar</Button>
              <Button type="submit" variant="primary" icon={Save} loading={saving}>Atualizar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Credentials List */}
      {loading ? (
        <div className="space-y-2">
          <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-[#111]/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma senha cadastrada</p>
          <p className="text-[11px] text-slate-500 mt-1">Cadastre as senhas de redes sociais ou ferramentas do cliente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map(cred => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              onEdit={() => startEdit(cred)}
              onDelete={() => handleDelete(cred.id, cred.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CredentialCard({ cred, onEdit, onDelete }: { cred: ClientCredential; onEdit: () => void; onDelete: () => void }) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const copyVal = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copiado!", `${label} copiado com sucesso.`);
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0B1120] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e01c1c]" /> {cred.title}
          </h4>
          {cred.url && (
            <a
              href={cred.url.startsWith("http") ? cred.url : `https://${cred.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-500 hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
            >
              <Globe size={10} /> Link de Acesso <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-800/50">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Usuário / Login</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200 truncate font-mono">
              {cred.username || "—"}
            </span>
            {cred.username && (
              <button onClick={() => copyVal(cred.username!, "Login")} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <Copy size={12} />
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Senha</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200 font-mono">
              {showPassword ? cred.password || "—" : "••••••••"}
            </span>
            <div className="flex items-center gap-1.5">
              {cred.password && (
                <>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => copyVal(cred.password!, "Senha")} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    <Copy size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {cred.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notas Observação</p>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug whitespace-pre-wrap">{cred.notes}</p>
        </div>
      )}
    </div>
  );
}
