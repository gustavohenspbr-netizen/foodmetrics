import React, { useState } from "react";

const MOCK_USERS = [
  { email: "admin@foodmetricas.com.br", password: "admin123", role: "admin" },
  { email: "cliente@burgerkings.com.br", password: "cliente123", role: "client" },
];

export function LoginPage() {
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

    sessionStorage.setItem("fm_role", user.role);
    sessionStorage.setItem("fm_email", user.email);

    if (user.role === "admin") {
      window.location.href = "/admin.html";
    } else {
      window.location.href = "/dashboard.html";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-10">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-10 mx-auto mb-8 drop-shadow-sm" />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">Bem-vindo de volta</h1>
          <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400">
            Acesse seu painel exclusivo
          </p>
        </div>

        <form onSubmit={handleLogin}
          className="bg-white dark:bg-[#0F172A] rounded-3xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-slate-200/60 dark:border-slate-800/60 space-y-7">

          <div className="space-y-2.5">
            <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com.br"
              required
              className="w-full rounded-xl px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e01c1c]/20 focus:border-[#e01c1c] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e01c1c]/20 focus:border-[#e01c1c] transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="rounded-xl px-5 py-4 text-[14px] text-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-[15px] text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-[0_4px_14px_rgba(224,28,28,0.3)] mt-2"
            style={{ backgroundColor: "#e01c1c" }}>
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>

          <div className="rounded-xl px-5 py-4 mt-8 space-y-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 font-medium text-[13px]">
            <p className="flex justify-between items-center">
              <span><span className="font-bold text-slate-700 dark:text-slate-300">Admin:</span> admin@...</span>
              <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">admin123</span>
            </p>
            <p className="flex justify-between items-center">
              <span><span className="font-bold text-slate-700 dark:text-slate-300">Cliente:</span> cliente@...</span>
              <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">cliente123</span>
            </p>
          </div>
        </form>

        <p className="text-center mt-10 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          © 2025 Food Métricas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
