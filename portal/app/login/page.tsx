"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock credentials — substituir por Supabase Auth
const MOCK_USERS = [
  { email: "admin@foodmetricas.com.br", password: "admin123", role: "admin" },
  { email: "cliente@burgerkings.com.br", password: "cliente123", role: "client" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Salva role no sessionStorage (em produção: JWT/Supabase session)
    sessionStorage.setItem("fm_role", user.role);
    sessionStorage.setItem("fm_email", user.email);

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#080810" }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(224,28,28,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-10 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Acesse sua área exclusiva
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}
          className="glass rounded-2xl p-8 space-y-5"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

          <div>
            <label className="block text-xs font-medium mb-2"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com.br"
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(224,28,28,0.5)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(224,28,28,0.5)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-center"
              style={{ background: "rgba(224,28,28,0.1)", border: "1px solid rgba(224,28,28,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{
              background: loading ? "rgba(224,28,28,0.5)" : "linear-gradient(135deg, #e01c1c, #c01010)",
              boxShadow: loading ? "none" : "0 0 24px rgba(224,28,28,0.35)",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Demo hint */}
          <div className="rounded-xl px-4 py-3 text-xs space-y-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
            <p><strong style={{ color: "rgba(255,255,255,0.5)" }}>Admin:</strong> admin@foodmetricas.com.br / admin123</p>
            <p><strong style={{ color: "rgba(255,255,255,0.5)" }}>Cliente:</strong> cliente@burgerkings.com.br / cliente123</p>
          </div>
        </form>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          © 2025 Food Métricas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
