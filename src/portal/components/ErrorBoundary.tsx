import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { SUPABASE_CONFIGURED } from "../lib/supabase";

interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      const isEnvIssue = !SUPABASE_CONFIGURED;
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-5">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-[20px] font-bold text-slate-900 dark:text-white mb-2">
              {isEnvIssue ? "Configuração incompleta" : "Algo deu errado"}
            </h1>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              {isEnvIssue ? (
                <>
                  As variáveis <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[12px] font-mono font-bold">VITE_SUPABASE_URL</code> e{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[12px] font-mono font-bold">VITE_SUPABASE_ANON_KEY</code> não estão configuradas.
                  Adicione essas variáveis no painel da Vercel (Settings → Environment Variables) e redeploy.
                </>
              ) : (
                <>
                  Encontramos um erro inesperado ao carregar a página. Tente recarregar.
                  Se persistir, contate o suporte.
                </>
              )}
            </p>
            {this.state.error?.message && (
              <pre className="text-[11px] font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg p-3 mb-5 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full h-12 rounded-xl bg-[#e01c1c] hover:bg-[#c81717] text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(224,28,28,0.3)]"
            >
              <RefreshCw size={18} /> Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
