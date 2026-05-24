import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = Boolean(url && key);

if (!SUPABASE_CONFIGURED) {
  console.error(
    "[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados.\n" +
    "Configure essas variáveis no .env.local (dev) ou no painel Environment Variables da Vercel (prod)."
  );
}

// Cliente sempre é criado, mesmo sem env, pra não crashar o módulo na import.
// As queries vão falhar com erro tratável (vs tela branca).
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "fm-auth",
    },
  }
);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "manager" | "support" | "client" | "viewer";
  phone: string | null;
  is_active: boolean;
};
