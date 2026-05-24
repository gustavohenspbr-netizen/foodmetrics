import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

// ============================================================
// HOOK GENÉRICO
// ============================================================
export function useQuery<T>(
  fetcher: () => Promise<{ data: T | null; error: any }>,
  deps: any[] = [],
  initialValue: T | null = null
) {
  const [data, setData] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await fetcher();
      if (error) {
        console.error("[useQuery]", error);
        setError(error);
        // mantém o initialValue em vez de virar null
        setData(initialValue);
      } else {
        setData(data ?? initialValue);
        setError(null);
      }
    } catch (e) {
      console.error("[useQuery] exception", e);
      setError(e);
      setData(initialValue);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}

// Helper: hooks de array sempre retornam [] em vez de null
export function useArrayQuery<T>(
  fetcher: () => Promise<{ data: T[] | null; error: any }>,
  deps: any[] = []
) {
  return useQuery<T[]>(fetcher, deps, [] as T[]);
}

// ============================================================
// CLIENTS
// ============================================================
export type Client = {
  id: string;
  name: string;
  type: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  avatar: string | null;
  color: string;
  status: "active" | "pending" | "paused" | "cancelled";
  plan: string;
  mrr: number;
  health_score: number;
  manager_id: string | null;
  joined_at: string;
};

export function useClients() {
  return useArrayQuery<Client>(
    async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      return { data: data as Client[] | null, error };
    },
    []
  );
}

export function useClientsWithManager() {
  return useArrayQuery<Client & { manager_name: string | null }>(
    async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*, manager:profiles!clients_manager_id_fkey(full_name)")
        .order("name");
      const mapped = (data ?? []).map((c: any) => ({
        ...c,
        manager_name: c.manager?.full_name ?? null,
      }));
      return { data: mapped, error };
    },
    []
  );
}

/** Retorna o primeiro client vinculado ao usuário logado (caso cliente). */
export function useMyClient() {
  return useQuery<Client | null>(
    async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { data: null, error: null };
      const { data, error } = await supabase
        .from("client_users")
        .select("client:clients(*)")
        .eq("user_id", u.user.id)
        .limit(1)
        .maybeSingle();
      return { data: (data?.client as any) ?? null, error };
    },
    []
  );
}

// ============================================================
// PROFILES / TEAM
// ============================================================
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "support" | "client" | "viewer";
  avatar_url: string | null;
  is_active: boolean;
};

export function useTeam() {
  return useArrayQuery<Profile>(
    async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "manager", "support"])
        .eq("is_active", true)
        .order("full_name");
      return { data: data as Profile[] | null, error };
    },
    []
  );
}

// ============================================================
// CAMPAIGNS + METRICS
// ============================================================
export type Campaign = {
  id: string;
  client_id: string;
  channel: "google" | "meta" | "tiktok" | "youtube";
  name: string;
  status: string;
  budget_daily: number | null;
  objective: string | null;
};

export type CampaignWithMetrics = Campaign & {
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  reach: number;
  ctr: number;
  cpa: number;
  roas: number;
};

export function useCampaigns(clientId: string | undefined, channel?: "google" | "meta") {
  return useArrayQuery<CampaignWithMetrics>(
    async () => {
      if (!clientId) return { data: [], error: null };
      let q = supabase.from("campaigns").select("*").eq("client_id", clientId);
      if (channel) q = q.eq("channel", channel);
      const { data: campaigns, error } = await q;
      if (error || !campaigns) return { data: null, error };

      // Pega agregados das métricas
      const ids = campaigns.map((c: any) => c.id);
      if (ids.length === 0) return { data: [], error: null };
      const { data: metrics } = await supabase
        .from("metrics_daily")
        .select("*")
        .in("campaign_id", ids)
        .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));

      const result = campaigns.map((c: any) => {
        const m = (metrics ?? []).filter((x: any) => x.campaign_id === c.id);
        const spend = m.reduce((s, x) => s + Number(x.spend ?? 0), 0);
        const clicks = m.reduce((s, x) => s + Number(x.clicks ?? 0), 0);
        const impressions = m.reduce((s, x) => s + Number(x.impressions ?? 0), 0);
        const conversions = m.reduce((s, x) => s + Number(x.conversions ?? 0), 0);
        const reach = m.reduce((s, x) => s + Number(x.reach ?? 0), 0);
        const revenue = m.reduce((s, x) => s + Number(x.revenue ?? 0), 0);
        return {
          ...c,
          spend, clicks, impressions, conversions, reach,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpa: conversions > 0 ? spend / conversions : 0,
          roas: spend > 0 ? revenue / spend : 0,
        };
      });
      return { data: result, error: null };
    },
    [clientId, channel]
  );
}

/** Métricas diárias agregadas por mês — pro gráfico */
export function useMonthlyMetrics(clientId: string | undefined) {
  return useArrayQuery<{ month: string; google: number; meta: number; revenue: number }>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("metrics_daily")
        .select("date, channel, spend, revenue")
        .eq("client_id", clientId)
        .gte("date", new Date(Date.now() - 150 * 86400000).toISOString().slice(0, 10));
      if (error || !data) return { data: null, error };

      const byMonth = new Map<string, { google: number; meta: number; revenue: number }>();
      const monthLabel = (d: Date) =>
        ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.getMonth()];

      data.forEach((row: any) => {
        const dt = new Date(row.date);
        const key = `${dt.getFullYear()}-${String(dt.getMonth()).padStart(2, "0")}`;
        if (!byMonth.has(key)) byMonth.set(key, { google: 0, meta: 0, revenue: 0 });
        const m = byMonth.get(key)!;
        if (row.channel === "google") m.google += Number(row.spend ?? 0);
        else if (row.channel === "meta") m.meta += Number(row.spend ?? 0);
        m.revenue += Number(row.revenue ?? 0);
      });

      const result = Array.from(byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-5)
        .map(([key, v]) => ({
          month: monthLabel(new Date(key + "-01")),
          ...v,
        }));
      return { data: result, error: null };
    },
    [clientId]
  );
}

// ============================================================
// iFOOD
// ============================================================
export function useIfoodSummary(clientId: string | undefined) {
  return useQuery<{
    rating: number;
    orders: { today: number; week: number; month: number };
    revenue: { today: number; week: number; month: number };
    avgTicket: number;
    cancellations: number;
  }>(
    async () => {
      if (!clientId) return { data: null, error: null };
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const today = new Date(); today.setHours(0,0,0,0);
      const { data, error } = await supabase
        .from("ifood_orders")
        .select("ordered_at, total, rating, cancelled")
        .eq("client_id", clientId)
        .gte("ordered_at", monthAgo);
      if (error || !data) return { data: null, error };

      const monthOrders = data;
      const weekOrders = data.filter((o: any) => o.ordered_at >= weekAgo);
      const todayOrders = data.filter((o: any) => new Date(o.ordered_at) >= today);
      const sum = (arr: any[]) => arr.reduce((s, x) => s + Number(x.total ?? 0), 0);
      const ratings = data.filter((o: any) => o.rating).map((o: any) => o.rating);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const cancelled = data.filter((o: any) => o.cancelled).length;

      return {
        data: {
          rating: Number(avgRating.toFixed(1)),
          orders: { today: todayOrders.length, week: weekOrders.length, month: monthOrders.length },
          revenue: { today: sum(todayOrders), week: sum(weekOrders), month: sum(monthOrders) },
          avgTicket: monthOrders.length ? sum(monthOrders) / monthOrders.length : 0,
          cancellations: monthOrders.length ? (cancelled / monthOrders.length) * 100 : 0,
        },
        error: null,
      };
    },
    [clientId]
  );
}

export function useIfoodHourly(clientId: string | undefined) {
  return useArrayQuery<{ hour: string; orders: number }>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("v_ifood_hourly")
        .select("*")
        .eq("client_id", clientId)
        .order("hour");
      const result = (data ?? []).map((r: any) => ({
        hour: `${String(r.hour).padStart(2, "0")}h`,
        orders: r.orders,
      }));
      return { data: result, error };
    },
    [clientId]
  );
}

export function useIfoodTopItems(clientId: string | undefined) {
  return useArrayQuery<{ name: string; orders: number; revenue: number }>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("v_ifood_top_items")
        .select("*")
        .eq("client_id", clientId)
        .order("orders", { ascending: false })
        .limit(5);
      return { data: data as any, error };
    },
    [clientId]
  );
}

export function useIfoodByNeighborhood(clientId: string | undefined) {
  return useArrayQuery<{ neighborhood: string; orders: number; revenue: number }>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("v_ifood_by_neighborhood")
        .select("*")
        .eq("client_id", clientId)
        .order("orders", { ascending: false });
      return { data: data as any, error };
    },
    [clientId]
  );
}

// ============================================================
// REVIEWS
// ============================================================
export function useReviews(clientId: string | undefined, source?: "ifood" | "gmb") {
  return useArrayQuery<any>(
    async () => {
      if (!clientId) return { data: [], error: null };
      let q = supabase.from("reviews").select("*").eq("client_id", clientId).order("posted_at", { ascending: false });
      if (source) q = q.eq("source", source);
      const { data, error } = await q;
      return { data: data as any, error };
    },
    [clientId, source]
  );
}

// ============================================================
// GMB
// ============================================================
export function useGmbStats(clientId: string | undefined) {
  return useQuery<any>(
    async () => {
      if (!clientId) return { data: null, error: null };
      const { data, error } = await supabase
        .from("gmb_stats")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(30);
      if (error || !data) return { data: null, error };
      const sum = (k: string) => data.reduce((s, x: any) => s + Number(x[k] ?? 0), 0);
      const last7 = data.slice(0, 7);
      const prev7 = data.slice(7, 14);
      const sumLast = (k: string, arr: any[]) => arr.reduce((s, x: any) => s + Number(x[k] ?? 0), 0);
      const delta = (k: string) => {
        const a = sumLast(k, last7);
        const b = sumLast(k, prev7);
        return b > 0 ? ((a - b) / b) * 100 : 0;
      };
      return {
        data: {
          rating: data[0]?.rating ?? 4.7,
          views: sum("views"),
          calls: sum("calls"),
          directions: sum("directions"),
          deltaViews: delta("views"),
          deltaCalls: delta("calls"),
          deltaDirections: delta("directions"),
          deltaRating: 0.1,
        },
        error: null,
      };
    },
    [clientId]
  );
}

// ============================================================
// SITE ANALYTICS
// ============================================================
export function useSiteAnalytics(clientId: string | undefined) {
  return useQuery<any>(
    async () => {
      if (!clientId) return { data: null, error: null };
      const { data, error } = await supabase
        .from("site_analytics")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(30);
      if (error || !data) return { data: null, error };
      const sum = (k: string) => data.reduce((s, x: any) => s + Number(x[k] ?? 0), 0);
      const avg = (k: string) => data.length ? sum(k) / data.length : 0;
      const last7 = data.slice(0, 7).reverse();
      return {
        data: {
          totalUsers: sum("users"),
          totalSessions: sum("sessions"),
          avgBounceRate: avg("bounce_rate"),
          avgSessionSeconds: avg("avg_session_seconds"),
          totalConversions: sum("conversions"),
          last7Days: last7.map((r: any) => ({
            day: new Date(r.date).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
            users: r.users,
          })),
          sources: data[0]?.source_breakdown ?? {},
          topPages: data[0]?.top_pages ?? [],
        },
        error: null,
      };
    },
    [clientId]
  );
}

// ============================================================
// STRATEGY
// ============================================================
export function useGoals(clientId: string | undefined) {
  return useArrayQuery<any>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at");
      return { data: data as any, error };
    },
    [clientId]
  );
}

export function useInitiatives(clientId: string | undefined) {
  return useArrayQuery<any>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, owner:profiles!initiatives_owner_id_fkey(full_name)")
        .eq("client_id", clientId)
        .order("deadline");
      const mapped = (data ?? []).map((i: any) => ({
        ...i, owner_name: i.owner?.full_name ?? null,
      }));
      return { data: mapped, error };
    },
    [clientId]
  );
}

export function useRecommendations(clientId: string | undefined) {
  return useArrayQuery<any>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("client_id", clientId)
        .eq("resolved", false)
        .order("created_at", { ascending: false });
      return { data: data as any, error };
    },
    [clientId]
  );
}

// ============================================================
// CRM (LEADS)
// ============================================================
export function useLeads() {
  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, owner:profiles!leads_owner_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      const mapped = (data ?? []).map((l: any) => ({
        ...l, owner_name: l.owner?.full_name ?? null,
      }));
      return { data: mapped, error };
    },
    []
  );
}

export async function updateLeadStatus(id: string, status: string) {
  return supabase.from("leads").update({ status }).eq("id", id);
}

// ============================================================
// CONTRACTS + INVOICES
// ============================================================
export function useInvoices(clientId?: string) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("invoices")
        .select("*, client:clients(name, avatar, color)")
        .order("due_date", { ascending: false });
      if (clientId) q = q.eq("client_id", clientId);
      const { data, error } = await q;
      return { data: data as any, error };
    },
    [clientId]
  );
}

export function useContracts() {
  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, client:clients(name, avatar, color)")
        .order("end_date");
      return { data: data as any, error };
    },
    []
  );
}

// ============================================================
// TASKS + EVENTS + TEAM
// ============================================================
export function useTasks() {
  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, client:clients(name), owner:profiles!tasks_owner_id_fkey(full_name)")
        .order("due_date");
      const mapped = (data ?? []).map((t: any) => ({
        ...t,
        client_name: t.client?.name ?? null,
        owner_name: t.owner?.full_name ?? null,
      }));
      return { data: mapped, error };
    },
    []
  );
}

export function useEvents() {
  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, client:clients(name)")
        .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
        .order("starts_at")
        .limit(20);
      const mapped = (data ?? []).map((e: any) => ({
        ...e, client_name: e.client?.name ?? null,
      }));
      return { data: mapped, error };
    },
    []
  );
}

/** Eventos de um mês específico — pro calendário */
export function useEventsByMonth(monthDate: Date) {
  const start = new Date(monthDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  // pega 1 mês antes e 1 depois pra cobrir os "dias de outros meses" no grid
  const rangeStart = new Date(start);
  rangeStart.setDate(rangeStart.getDate() - 7);
  const rangeEnd = new Date(start);
  rangeEnd.setMonth(rangeEnd.getMonth() + 1);
  rangeEnd.setDate(rangeEnd.getDate() + 14);

  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, client:clients(name)")
        .gte("starts_at", rangeStart.toISOString())
        .lte("starts_at", rangeEnd.toISOString())
        .order("starts_at");
      const mapped = (data ?? []).map((e: any) => ({
        ...e, client_name: e.client?.name ?? null,
      }));
      return { data: mapped, error };
    },
    [start.getTime()]
  );
}

export async function createEvent(opts: {
  title: string;
  description?: string;
  type?: string;
  client_id?: string | null;
  starts_at: string;
  ends_at: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  return supabase.from("events").insert({
    title: opts.title,
    description: opts.description ?? null,
    type: opts.type ?? "internal",
    client_id: opts.client_id ?? null,
    starts_at: opts.starts_at,
    ends_at: opts.ends_at,
    created_by: u.user?.id ?? null,
  });
}

export async function deleteEvent(id: string) {
  return supabase.from("events").delete().eq("id", id);
}

// ============================================================
// MATERIALS
// ============================================================
export function useMaterials(clientId: string | undefined) {
  return useArrayQuery<any>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      return { data: data as any, error };
    },
    [clientId]
  );
}

export async function approveMaterial(id: string) {
  const { data: u } = await supabase.auth.getUser();
  return supabase.from("materials").update({
    status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: u.user?.id,
  }).eq("id", id);
}

// ============================================================
// REPORTS
// ============================================================
export function useReports(clientId?: string) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("reports")
        .select("*, client:clients(name)")
        .order("period_end", { ascending: false });
      if (clientId) q = q.eq("client_id", clientId);
      const { data, error } = await q;
      const mapped = (data ?? []).map((r: any) => ({
        ...r, client_name: r.client?.name ?? null,
      }));
      return { data: mapped, error };
    },
    [clientId]
  );
}

// ============================================================
// MESSAGES (chat) — com realtime
// ============================================================

/**
 * Marca como lida todas as mensagens da conversa que NÃO foram enviadas pelo user atual.
 */
export async function markMessagesRead(conversationId: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null)
    .neq("sender_id", u.user.id);
}

/**
 * Lista todas as conversations (pra inbox admin) OU filtradas por client_id (pra cliente).
 * Retorna conversation + cliente + última mensagem + contagem de não lidas.
 */
export function useConversationsList(clientId?: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }

    let q = supabase
      .from("conversations")
      .select("*, client:clients(id, name, avatar, color)")
      .order("last_message_at", { ascending: false });
    if (clientId) q = q.eq("client_id", clientId);
    const { data: convs } = await q;
    if (!convs) { setConversations([]); setLoading(false); return; }

    // Pra cada conv, busca última mensagem + count de não lidas
    const enriched = await Promise.all(
      convs.map(async (c: any) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .is("read_at", null)
          .neq("sender_id", u.user!.id);
        return { ...c, lastMessage: lastMsg, unreadCount: count ?? 0 };
      })
    );
    setConversations(enriched);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
    // Realtime: novas mensagens em qualquer conversation atualizam a lista
    const channel = supabase
      .channel("conv-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        refetch();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { conversations, loading, refetch };
}

/**
 * Hook único — abre uma conversation pelo ID (admin escolhendo da inbox).
 * Carrega mensagens, marca como lidas e escuta realtime.
 */
export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url, role)")
        .eq("conversation_id", conversationId)
        .order("created_at");
      if (!cancelled) {
        setMessages(msgs ?? []);
        setLoading(false);
        // Marca como lidas ao abrir
        markMessagesRead(conversationId);
      }
    })();

    const channel = supabase
      .channel(`msgs:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          // Busca a mensagem completa com info do sender
          const { data: full } = await supabase
            .from("messages")
            .select("*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url, role)")
            .eq("id", (payload.new as any).id)
            .single();
          if (full) setMessages((prev) => [...prev, full]);
          // Auto-marca como lida se for de outra pessoa
          markMessagesRead(conversationId);
        }
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [conversationId]);

  return { messages, loading };
}

/**
 * Envia mensagem na conversation. Detecta automaticamente sender_type pelo role.
 */
export async function sendMessage(conversationId: string, content: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: { message: "Não autenticado" } };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", u.user.id).single();
  const isStaff = ["admin", "manager", "support"].includes((profile as any)?.role);
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: u.user.id,
    sender_type: isStaff ? "agency" : "client",
    content,
  });
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
  return { error };
}

/**
 * Pra cliente: pega ou cria a conversation default do client.
 */
export function useClientConversation(clientId: string | undefined) {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("client_id", clientId)
        .order("last_message_at", { ascending: false })
        .limit(1);
      let convId = convs?.[0]?.id;
      if (!convId) {
        const { data: created } = await supabase
          .from("conversations")
          .insert({ client_id: clientId, subject: "Atendimento" })
          .select("id")
          .single();
        convId = created?.id;
      }
      setConversationId(convId ?? null);
    })();
  }, [clientId]);

  return conversationId;
}

/**
 * Conta mensagens não lidas pro user atual em TODAS as conversations que tem acesso.
 * Usado pelo badge do sidebar.
 */
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { count: n } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", u.user.id);
    setCount(n ?? 0);
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel("unread-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return count;
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const markAllRead = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("recipient_id", u.user.id);
    refetch();
  }, [refetch]);

  return { notifications, loading, refetch, markAllRead };
}

// ============================================================
// INTEGRATIONS (Google Ads, Meta Ads, iFood, GMB, GA4)
// ============================================================
export type Integration = {
  id: string;
  client_id: string;
  provider: string;
  account_id: string | null;
  account_name: string | null;
  customer_id: string | null;
  pixel_id: string | null;
  access_token: string | null;
  status: string;
  last_sync_at: string | null;
  notes: string | null;
};

export function useIntegration(clientId: string | undefined, provider: string) {
  return useQuery<Integration | null>(
    async () => {
      if (!clientId) return { data: null, error: null };
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("client_id", clientId)
        .eq("provider", provider)
        .maybeSingle();
      return { data: data as any, error };
    },
    [clientId, provider]
  );
}

export async function saveIntegration(opts: {
  clientId: string;
  provider: string;
  account_id?: string;
  account_name?: string;
  customer_id?: string;
  pixel_id?: string;
  access_token?: string;
}) {
  const payload = {
    client_id: opts.clientId,
    provider: opts.provider,
    account_id: opts.account_id ?? null,
    account_name: opts.account_name ?? null,
    customer_id: opts.customer_id ?? null,
    pixel_id: opts.pixel_id ?? null,
    access_token: opts.access_token ?? null,
    status: "connected",
    connected_at: new Date().toISOString(),
  };
  return supabase.from("integrations").upsert(payload, { onConflict: "client_id,provider" });
}

export async function removeIntegration(clientId: string, provider: string) {
  return supabase.from("integrations").delete().eq("client_id", clientId).eq("provider", provider);
}

// ============================================================
// ADMIN OVERVIEW (agregados)
// ============================================================

/** monthOffset: 0 = este mês, -1 = mês passado, -3 = 3 meses atrás, etc */
export function useAdminOverview(monthOffset: number = 0) {
  return useQuery<any>(
    async () => {
      // Calcula janela: mês atual baseado em monthOffset
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() + monthOffset - 1, 1);

      const [{ data: clients }, { data: metrics }, { data: prevMetrics }, { data: invoicesPeriod }] = await Promise.all([
        supabase.from("clients").select("status, mrr, created_at"),
        supabase.from("metrics_daily").select("spend, date")
          .gte("date", periodStart.toISOString().slice(0, 10))
          .lt("date", periodEnd.toISOString().slice(0, 10)),
        supabase.from("metrics_daily").select("spend, date")
          .gte("date", prevStart.toISOString().slice(0, 10))
          .lt("date", periodStart.toISOString().slice(0, 10)),
        supabase.from("invoices").select("amount, status, paid_at")
          .gte("due_date", periodStart.toISOString().slice(0, 10))
          .lt("due_date", periodEnd.toISOString().slice(0, 10)),
      ]);

      const allClients = clients ?? [];
      const activeClients = allClients.filter((c: any) => c.status === "active");
      const mrr = activeClients.reduce((s, c: any) => s + Number(c.mrr ?? 0), 0);

      const totalManaged = (metrics ?? []).reduce((s: number, m: any) => s + Number(m.spend ?? 0), 0);
      const prevManaged = (prevMetrics ?? []).reduce((s: number, m: any) => s + Number(m.spend ?? 0), 0);
      const managedGrowth = prevManaged > 0 ? ((totalManaged - prevManaged) / prevManaged) * 100 : 0;

      // Faturamento do período (faturas pagas)
      const periodRevenue = (invoicesPeriod ?? [])
        .filter((i: any) => i.status === "paid")
        .reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0);

      // Novos clientes no período
      const newClientsInPeriod = allClients.filter((c: any) => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d >= periodStart && d < periodEnd;
      }).length;

      return {
        data: {
          mrr,
          mrrGrowth: 0, // (requer histórico mensal de MRR pra calcular real)
          activeClients: activeClients.length,
          pendingClients: allClients.filter((c: any) => c.status === "pending").length,
          newClientsInPeriod,
          totalManaged,
          managedGrowth,
          periodRevenue,
          periodLabel: periodStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        },
        error: null,
      };
    },
    [monthOffset]
  );
}

/** Histórico mensal — pra gráfico de evolução de N meses */
export function useMonthlyHistory(months: number = 6) {
  return useArrayQuery<{ month: string; spend: number; clients: number; revenue: number }>(
    async () => {
      const result: any[] = [];
      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const [{ data: m }, { data: inv }, { data: cs }] = await Promise.all([
          supabase.from("metrics_daily").select("spend").gte("date", start.toISOString().slice(0, 10)).lt("date", end.toISOString().slice(0, 10)),
          supabase.from("invoices").select("amount, status, paid_at").gte("due_date", start.toISOString().slice(0, 10)).lt("due_date", end.toISOString().slice(0, 10)),
          supabase.from("clients").select("created_at").lt("created_at", end.toISOString()),
        ]);
        const spend = (m ?? []).reduce((s: number, r: any) => s + Number(r.spend ?? 0), 0);
        const revenue = (inv ?? []).filter((i: any) => i.status === "paid").reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
        result.push({
          month: start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
          spend, revenue,
          clients: (cs ?? []).length,
        });
      }
      return { data: result, error: null };
    },
    [months]
  );
}

export function useClientsByState() {
  return useArrayQuery<{ state: string; count: number; revenue: number }>(
    async () => {
      const { data, error } = await supabase
        .from("clients").select("state, mrr").not("state", "is", null);
      if (error || !data) return { data: null, error };
      const map = new Map<string, { count: number; revenue: number }>();
      data.forEach((c: any) => {
        if (!map.has(c.state)) map.set(c.state, { count: 0, revenue: 0 });
        const v = map.get(c.state)!;
        v.count++;
        v.revenue += Number(c.mrr ?? 0);
      });
      return {
        data: Array.from(map.entries())
          .map(([state, v]) => ({ state, ...v }))
          .sort((a, b) => b.count - a.count),
        error: null,
      };
    },
    []
  );
}
