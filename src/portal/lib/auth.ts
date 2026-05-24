import { useEffect, useState } from "react";
import { supabase, type Profile } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useProfile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("[useProfile]", error);
        setProfile((data as Profile) ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  return { profile, loading };
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? email, role: "client" } },
  });
}

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + "/login.html",
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/login.html",
  });
}

/**
 * Redireciona automaticamente o usuário pra dashboard ou admin
 * baseado no role do profile.
 */
export function redirectByRole(role: Profile["role"] | undefined) {
  if (!role) return;
  if (role === "admin" || role === "manager" || role === "support") {
    window.location.href = "/admin.html";
  } else {
    window.location.href = "/dashboard.html";
  }
}

/**
 * Cria um usuário no auth + um restaurante vinculado.
 * Apenas admin pode rodar isso (RLS).
 */
export async function inviteClientUser(opts: {
  email: string;
  fullName: string;
  clientId: string;
}) {
  // Usa signUp com magic link (sem senha) — cliente recebe convite por email
  return supabase.auth.signUp({
    email: opts.email,
    password: crypto.randomUUID(),
    options: { data: { full_name: opts.fullName, role: "client" } },
  });
}
