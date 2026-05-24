import React, { useEffect, useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { sendMagicLink, signInWithPassword, useSession, redirectByRole } from "../lib/auth";
import { supabase } from "../lib/supabase";

type Mode = "password" | "magic";

export function LoginPage() {
  const toast = useToast();
  const { user, loading: sessionLoading } = useSession();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Se já está logado, redireciona pela role do profile
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => redirectByRole((data as any)?.role));
  }, [user, sessionLoading]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signInWithPassword(email, password);
    setLoading(false);

    if (error) {
      toast.error("Não foi possível entrar", error.message);
      return;
    }
    if (!data.user) {
      toast.error("Erro inesperado", "Tente novamente em alguns segundos.");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    redirectByRole((profile as any)?.role);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await sendMagicLink(email);
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar", error.message);
      return;
    }
    setMagicSent(true);
    toast.success("Link enviado!", "Confira sua caixa de entrada.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6 font-sans relative overflow-hidden">
      {/* BG ORBS */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#e01c1c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#ff8732]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <img
            src="/images/imgi_56_Ativo-1.svg"
            alt="Food Métricas"
            className="h-10 mx-auto mb-6 drop-shadow-sm"
          />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">
            Acesse o portal Food Métricas
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200/60 dark:border-slate-800/60">
          {/* MODE TOGGLE */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-6">
            <button
              onClick={() => {
                setMode("password");
                setMagicSent(false);
              }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${
                mode === "password"
                  ? "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Senha
            </button>
            <button
              onClick={() => {
                setMode("magic");
                setMagicSent(false);
              }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "magic"
                  ? "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Sparkles size={12} />
              Magic Link
            </button>
          </div>

          {magicSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">
                Email enviado!
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Mandamos um link mágico pra <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
                <br />
                Clique no link pra entrar.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMagicSent(false);
                  setMode("password");
                }}
                className="mt-6"
              >
                Voltar
              </Button>
            </div>
          ) : (
            <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
                autoComplete="email"
              />

              {mode === "password" && (
                <Input
                  label="Senha"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
                iconRight={mode === "magic" ? Send : ArrowRight}
              >
                {mode === "password" ? "Acessar Painel" : "Enviar Link Mágico"}
              </Button>

              {mode === "password" && (
                <button
                  type="button"
                  onClick={() => setMode("magic")}
                  className="block w-full text-center text-[12px] font-bold text-slate-500 hover:text-[#e01c1c] transition-colors"
                >
                  Esqueceu a senha? Entre com link mágico
                </button>
              )}
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-[12px] font-medium text-slate-400 dark:text-slate-500">
          © 2026 Food Métricas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
