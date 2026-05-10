"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock credentials
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

    sessionStorage.setItem("fm_role", user.role);
    sessionStorage.setItem("fm_email", user.email);

    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">

      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/images/imgi_56_Ativo-1.svg" alt="Food Métricas" className="h-12 mx-auto mb-6 drop-shadow-sm" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Acesse seu painel exclusivo
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleLogin}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 space-y-6">

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com.br"
              required
              className="w-full rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-center bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md shadow-red-500/20"
            style={{ backgroundColor: "#e01c1c" }}>
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>

          {/* Demo hint */}
          <div className="rounded-xl px-4 py-4 mt-6 text-xs space-y-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
            <p className="flex justify-between">
              <span><span className="font-bold text-slate-700 dark:text-slate-300">Admin:</span> admin@...</span>
              <span>admin123</span>
            </p>
            <p className="flex justify-between">
              <span><span className="font-bold text-slate-700 dark:text-slate-300">Cliente:</span> cliente@...</span>
              <span>cliente123</span>
            </p>
          </div>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400 dark:text-slate-500">
          © 2025 Food Métricas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
