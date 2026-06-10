import React, { useState, useEffect, useRef } from "react";
import { User, Lock, Bell, Shield, Smartphone, Globe, Upload } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useProfile } from "../../lib/auth";
import { useToast } from "../../components/ui/Toast";
import { supabase } from "../../lib/supabase";

export function SettingsView() {
  const { profile } = useProfile();
  const toast = useToast();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone })
      .eq("id", profile.id);
      
    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar", error.message);
    } else {
      toast.success("Configurações salvas", "Suas preferências foram atualizadas com sucesso.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !profile) return;
    const file = e.target.files[0];
    
    setUploading(true);
    // Simulating upload since storage buckets might not be configured
    // In a real scenario, we'd use supabase.storage.from("avatars").upload(...)
    // For now, we'll just mock it and show a success message or handle it if bucket exists.
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Se o bucket não existir, vamos dar um erro elegante
        toast.error("Erro no upload", "O bucket de storage 'avatars' pode não estar configurado.");
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
        toast.success("Foto atualizada", "Sua foto de perfil foi atualizada.");
        // We'd ideally refresh the profile here or just let the user know
      }
    } catch (err: any) {
      toast.error("Erro", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Gerencie seu perfil, preferências e segurança da conta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#e01c1c]/10 text-[#e01c1c] font-bold text-[13px] transition-colors text-left">
            <User size={16} /> Meu Perfil
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium text-[13px] transition-colors text-left">
            <Lock size={16} /> Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium text-[13px] transition-colors text-left">
            <Bell size={16} /> Notificações
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium text-[13px] transition-colors text-left">
            <Globe size={16} /> Idioma e Região
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader 
              title="Informações Pessoais" 
              subtitle="Atualize sua foto e detalhes de contato."
            />
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-4 pb-4">
                {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleUploadClick} disabled={uploading}>
                  {uploading ? "Enviando..." : "Alterar foto"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Nome completo" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
                <Input 
                  label="Email" 
                  type="email" 
                  defaultValue={profile?.email || ""} 
                  disabled 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
                <Input 
                  label="Cargo / Função" 
                  defaultValue={profile?.role === "admin" ? "Administrador" : profile?.role === "manager" ? "Gerente" : "Usuário"} 
                  disabled 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader 
              title="Sessões Ativas" 
              subtitle="Dispositivos que estão conectados à sua conta."
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Sessão Atual</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {navigator.userAgent.includes("Mac") ? "Mac OS" : "Windows"} • {navigator.userAgent.includes("Chrome") ? "Google Chrome" : "Browser"}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-green-600 dark:text-green-400">Ativo agora</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
