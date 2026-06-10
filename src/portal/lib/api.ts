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
  phone: string | null;
  whatsapp: string | null;
  contact_name: string | null;
  cnpj: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
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
  notes: string | null;
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



/** Detalhe completo de um cliente: dados + manager + métricas agregadas + integrações */
export function useClientDetail(clientId: string | undefined) {
  return useQuery<any>(
    async () => {
      if (!clientId) return { data: null, error: null };
      const [
        { data: client },
        { data: integrations },
        { data: contract },
        { data: invoices },
        { data: campaigns },
        { data: tasks },
        { data: events },
      ] = await Promise.all([
        supabase.from("clients").select("*, manager:profiles!clients_manager_id_fkey(id, full_name, email)").eq("id", clientId).single(),
        supabase.from("integrations").select("provider, status, account_name, access_token, last_sync_at").eq("client_id", clientId),
        supabase.from("contracts").select("*").eq("client_id", clientId).order("start_date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("invoices").select("*").eq("client_id", clientId).order("due_date", { ascending: false }).limit(10),
        supabase.from("campaigns").select("*").eq("client_id", clientId),
        supabase.from("tasks").select("*").eq("client_id", clientId).order("due_date").limit(10),
        supabase.from("events").select("*").eq("client_id", clientId).gte("starts_at", new Date().toISOString()).order("starts_at").limit(5),
      ]);
      return {
        data: {
          ...client,
          manager_name: client?.manager?.full_name ?? null,
          manager_email: client?.manager?.email ?? null,
          integrations: integrations ?? [],
          contract,
          invoices: invoices ?? [],
          campaigns: campaigns ?? [],
          tasks: tasks ?? [],
          events: events ?? [],
        },
        error: null,
      };
    },
    [clientId]
  );
}

export async function upsertIntegration(payload: { client_id: string; provider: string; account_name?: string; access_token?: string; status?: string }) {
  const { client_id, provider } = payload;
  // Try to find if exists
  const { data: existing } = await supabase.from("integrations").select("id").eq("client_id", client_id).eq("provider", provider).maybeSingle();
  if (existing) {
    return supabase.from("integrations").update(payload).eq("id", existing.id);
  } else {
    return supabase.from("integrations").insert(payload);
  }
}

export async function createClient(opts: Partial<Client> & { name: string }) {
  const payload: any = {
    name: opts.name,
    type: opts.type ?? null,
    email: opts.email ?? null,
    phone: opts.phone ?? null,
    whatsapp: opts.whatsapp ?? null,
    contact_name: opts.contact_name ?? null,
    cnpj: opts.cnpj ?? null,
    address: opts.address ?? null,
    website: opts.website ?? null,
    instagram: opts.instagram ?? null,
    city: opts.city ?? null,
    state: opts.state ?? null,
    avatar: opts.avatar ?? opts.name.slice(0, 2).toUpperCase(),
    color: opts.color ?? "#e01c1c",
    status: opts.status ?? "pending",
    plan: opts.plan ?? "standard",
    mrr: opts.mrr ?? 0,
    health_score: opts.health_score ?? 50,
    manager_id: opts.manager_id ?? null,
    notes: opts.notes ?? null,
  };
  return supabase.from("clients").insert(payload).select().single();
}

export async function updateClient(id: string, patch: Partial<Client>) {
  return supabase.from("clients").update(patch).eq("id", id).select().single();
}

export async function deleteClient(id: string) {
  return supabase.from("clients").delete().eq("id", id);
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
      
      let client = data?.client;
      if (!client) {
        // Fallback for admins testing the UI: try to find CABRONES LOJA 01, otherwise first available
        const { data: cabrones } = await supabase.from("clients").select("*").ilike("name", "%CABRONES%").limit(1).maybeSingle();
        if (cabrones) {
          client = cabrones;
        } else {
          const { data: fallbackClient } = await supabase.from("clients").select("*").limit(1).maybeSingle();
          client = fallbackClient || { id: "e3048bb4-2c85-47fd-b637-c9aa4e4a313a", name: "Mock Client" };
        }
      }
      
      return { data: (client as any) ?? null, error };
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

export function useFoodOrdersSummary(clientId: string | undefined, source: string, period: "7d" | "30d" | "all" | string = "all", startDate?: string, endDate?: string) {
  return useQuery<any>(
    async () => {
      if (!clientId || !source) return { data: null, error: null };

      let query = supabase
        .from("ifood_orders")
        .select("*")
        .eq("client_id", clientId)
        .limit(10000);

      if (period === "7d") {
        query = query.gte("ordered_at", new Date(Date.now() - 7 * 86400000).toISOString());
      } else if (period === "30d") {
        query = query.gte("ordered_at", new Date(Date.now() - 30 * 86400000).toISOString());
      } else if (period === "custom" && startDate && endDate) {
        query = query.gte("ordered_at", new Date(startDate).toISOString()).lte("ordered_at", new Date(endDate + "T23:59:59Z").toISOString());
      }
      
      const { data, error } = await query;
        
      if (error || !data) return { data: null, error };

      const sum = (arr: any[], key: string) => arr.reduce((s, x) => s + Number(x[key] ?? 0), 0);
      const cancelled = data.filter((o: any) => o.cancelled || o.status === "CANCELLED" || o.status === "canceled");

      // Groupings
      const byDay: Record<string, any[]> = {};
      const byHour: Record<string, number> = {};
      const byWeekday: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };
      
      data.forEach((o: any) => {
        const d = new Date(o.ordered_at);
        const dateStr = d.toISOString().slice(0, 10);
        const hourStr = d.getHours().toString().padStart(2, "0") + ":00";
        const weekdayStr = d.getDay().toString();
        
        if (!byDay[dateStr]) byDay[dateStr] = [];
        byDay[dateStr].push(o);
        
        byHour[hourStr] = (byHour[hourStr] || 0) + 1;
        byWeekday[weekdayStr] += 1;
      });

      const dailySales = Object.entries(byDay).map(([date, orders]) => ({
        date,
        revenue: sum(orders, "total"),
        ticket: orders.length ? sum(orders, "total") / orders.length : 0
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        data: {
          totalOrders: data.length,
          totalRevenue: sum(data, "total"),
          avgTicket: data.length ? sum(data, "total") / data.length : 0,
          cancellationsPct: data.length ? (cancelled.length / data.length) * 100 : 0,
          deliveryFeeTotal: sum(data, "delivery_fee"),
          commissionTotal: sum(data, "commission"),
          refundTotal: sum(data, "refund_amount"),
          
          dailySales,
          hourlySales: Object.entries(byHour).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour)),
          weekdaySales: byWeekday,
          
          cancellationReasons: cancelled.reduce((acc: any, o: any) => {
             const r = o.cancellation_reason || "Sem motivo";
             acc[r] = (acc[r] || 0) + 1;
             return acc;
          }, {}),
          
          paymentMethods: data.reduce((acc: any, o: any) => {
             const m = o.payment_method || "Não Informado";
             acc[m] = (acc[m] || 0) + 1;
             return acc;
          }, {}),
        },
        error: null,
      };
    },
    [clientId, source, period]
  );
}

export function useRecentFoodOrders(clientId: string | undefined, source: string) {
  return useArrayQuery<any>(
    async () => {
      if (!clientId || !source) return { data: [], error: null };
      const { data, error } = await supabase
        .from("ifood_orders")
        .select("*")
        .eq("client_id", clientId)
        .order("ordered_at", { ascending: false })
        .limit(10);
      return { data: data as any[], error };
    },
    [clientId, source]
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
        .select("*, owner:profiles!leads_owner_id_fkey(full_name, avatar_url)")
        .order("created_at", { ascending: false });
      const mapped = (data ?? []).map((l: any) => ({
        ...l, 
        owner_name: l.owner?.full_name ?? null,
        owner_avatar: l.owner?.avatar_url ?? null,
      }));
      return { data: mapped, error };
    },
    []
  );
}

export async function createLead(payload: any) {
  return supabase.from("leads").insert(payload).select().single();
}

export async function updateLead(id: string, payload: any) {
  return supabase.from("leads").update(payload).eq("id", id).select().single();
}

export async function updateLeadStatus(id: string, status: string) {
  return supabase.from("leads").update({ status }).eq("id", id);
}

export async function deleteLead(id: string) {
  return supabase.from("leads").delete().eq("id", id);
}

// Lead Activities (timeline de atividades por lead)
export function useLeadActivities(leadId: string | undefined) {
  return useArrayQuery<any>(
    async () => {
      if (!leadId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*, author:profiles!lead_activities_author_id_fkey(full_name, avatar_url)")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      const mapped = (data ?? []).map((a: any) => ({
        ...a,
        author_name: a.author?.full_name ?? "Sistema",
        author_avatar: a.author?.avatar_url ?? null,
      }));
      return { data: mapped, error };
    },
    [leadId]
  );
}

export async function createLeadActivity(payload: {
  lead_id: string;
  type: "note" | "call" | "email" | "meeting" | "whatsapp" | "status_change";
  content: string;
  author_id?: string | null;
  metadata?: any;
}) {
  return supabase.from("lead_activities").insert(payload).select().single();
}

// Hook com filtros avançados
export function useLeadsFiltered(filters: {
  search?: string;
  owner_id?: string;
  source?: string;
  status?: string;
  min_value?: number;
  max_value?: number;
}) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("leads")
        .select("*, owner:profiles!leads_owner_id_fkey(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (filters.owner_id) q = q.eq("owner_id", filters.owner_id);
      if (filters.source) q = q.eq("source", filters.source);
      if (filters.status) q = q.eq("status", filters.status);
      if (filters.min_value) q = q.gte("value", filters.min_value);
      if (filters.max_value) q = q.lte("value", filters.max_value);

      const { data, error } = await q;
      const mapped = (data ?? []).map((l: any) => ({
        ...l,
        owner_name: l.owner?.full_name ?? null,
        owner_avatar: l.owner?.avatar_url ?? null,
      }));
      return { data: mapped, error };
    },
    [JSON.stringify(filters)]
  );
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
      
      if (clientId === "e3048bb4-2c85-47fd-b637-c9aa4e4a313a") {
        const stored = localStorage.getItem(`mock_integration_${provider}`);
        if (stored) return { data: JSON.parse(stored), error: null };
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("client_id", clientId)
        .eq("provider", provider)
        .maybeSingle();
      return { data: (data as Integration) ?? null, error };
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
  if (opts.clientId === "e3048bb4-2c85-47fd-b637-c9aa4e4a313a") {
    // Fake success for mock client
    console.log("Mock integration saved:", opts);
    const mockData = {
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
    localStorage.setItem(`mock_integration_${opts.provider}`, JSON.stringify(mockData));
    return { data: {}, error: null };
  }

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
  if (clientId === "e3048bb4-2c85-47fd-b637-c9aa4e4a313a") {
    localStorage.removeItem(`mock_integration_${provider}`);
    return { data: {}, error: null };
  }
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

// ============================================================
// CLICKUP: SPACES, FOLDERS, LISTS & EXTENDED TASKS
// ============================================================

export function useProjectSpaces() {
  return useArrayQuery<any>(
    async () => {
      const { data, error } = await supabase
        .from("project_spaces")
        .select("*, client:clients(name, avatar, color)")
        .order("name");
      return { data: data as any, error };
    },
    []
  );
}

export function useProjectFolders(spaceId?: string) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("project_folders")
        .select("*, space:project_spaces(name), client:clients(name)")
        .order("name");
      if (spaceId) q = q.eq("space_id", spaceId);
      const { data, error } = await q;
      return { data: data as any, error };
    },
    [spaceId]
  );
}

export function useProjectLists(folderId?: string) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("project_lists")
        .select("*, folder:project_folders(name)")
        .order("name");
      if (folderId) q = q.eq("folder_id", folderId);
      const { data, error } = await q;
      return { data: data as any, error };
    },
    [folderId]
  );
}

export function useProjectTasks(listId?: string) {
  return useArrayQuery<any>(
    async () => {
      let q = supabase
        .from("tasks")
        .select("*, owner:profiles!tasks_owner_id_fkey(full_name, avatar_url), client:clients(name)")
        .order("order_index");
      if (listId) q = q.eq("list_id", listId);
      else q = q.not("list_id", "is", null);
      
      const { data, error } = await q;
      return { data: data as any, error };
    },
    [listId]
  );
}

export async function createProjectSpace(payload: any) {
  return supabase.from("project_spaces").insert(payload).select().single();
}

export async function createProjectFolder(payload: any) {
  return supabase.from("project_folders").insert(payload).select().single();
}

export async function createProjectList(payload: any) {
  return supabase.from("project_lists").insert(payload).select().single();
}

export async function createProjectTask(payload: any) {
  return supabase.from("tasks").insert(payload).select().single();
}

export async function updateProjectTask(id: string, payload: any) {
  return supabase.from("tasks").update(payload).eq("id", id).select().single();
}

export function useTaskComments(taskId?: string) {
  return useArrayQuery<any>(
    async () => {
      if (!taskId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("task_comments")
        .select("*, author:profiles(full_name, avatar_url)")
        .eq("task_id", taskId)
        .order("created_at");
      return { data: data as any, error };
    },
    [taskId]
  );
}

export async function createTaskComment(payload: any) {
  return supabase.from("task_comments").insert(payload).select().single();
}

// ============================================================
// ADMIN RESULTS — Consolidated per-client metrics with filters
// ============================================================
export type AdminResultsFilters = {
  search?: string;
  period?: "today" | "yesterday" | "7d" | "14d" | "30d" | "thisMonth" | "lastMonth" | "3m" | "thisYear" | "custom";
  dateFrom?: string;
  dateTo?: string;
  clientIds?: string[];
  managerIds?: string[];
  statuses?: string[];
  channels?: string[];
  healthRange?: "all" | "healthy" | "risk" | "critical";
  mrrMin?: string;
  mrrMax?: string;
  cities?: string[];
  types?: string[];
};

function getPeriodDates(period: string, dateFrom?: string, dateTo?: string) {
  const now = new Date();
  if (period === "custom" && dateFrom && dateTo) {
    return {
      start: new Date(dateFrom).toISOString().slice(0, 10),
      end: dateTo,
    };
  }
  if (period === "today") {
    return {
      start: now.toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  if (period === "yesterday") {
    const yesterday = new Date(now.getTime() - 86400000);
    return {
      start: yesterday.toISOString().slice(0, 10),
      end: yesterday.toISOString().slice(0, 10),
    };
  }
  if (period === "7d") {
    return {
      start: new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  if (period === "14d") {
    return {
      start: new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  if (period === "thisMonth") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  if (period === "lastMonth") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: s.toISOString().slice(0, 10),
      end: e.toISOString().slice(0, 10),
    };
  }
  if (period === "3m") {
    return {
      start: new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  if (period === "thisYear") {
    return {
      start: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    };
  }
  // default: 30d
  return {
    start: new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

export function useAdminResults(filters: AdminResultsFilters) {
  const {
    period = "30d", search, clientIds, managerIds, statuses, channels,
    healthRange, mrrMin, mrrMax, dateFrom, dateTo, cities, types
  } = filters;

  const deps = [
    period, search, JSON.stringify(clientIds), JSON.stringify(managerIds),
    JSON.stringify(statuses), JSON.stringify(channels), healthRange, mrrMin, mrrMax,
    dateFrom, dateTo, JSON.stringify(cities), JSON.stringify(types),
  ];

  return useArrayQuery<any>(
    async () => {
      const { start, end } = getPeriodDates(period, dateFrom, dateTo);

      // 1. Fetch all clients with manager
      let clientQ = supabase
        .from("clients")
        .select("*, manager:profiles!clients_manager_id_fkey(id, full_name)");

      if (clientIds && clientIds.length > 0) clientQ = clientQ.in("id", clientIds);
      if (managerIds && managerIds.length > 0) clientQ = clientQ.in("manager_id", managerIds);
      if (statuses && statuses.length > 0) clientQ = clientQ.in("status", statuses);
      if (mrrMin) clientQ = clientQ.gte("mrr", Number(mrrMin));
      if (mrrMax) clientQ = clientQ.lte("mrr", Number(mrrMax));
      if (healthRange === "healthy") clientQ = clientQ.gte("health_score", 70);
      else if (healthRange === "risk") clientQ = clientQ.lt("health_score", 70);
      else if (healthRange === "critical") clientQ = clientQ.lt("health_score", 50);
      if (cities && cities.length > 0) clientQ = clientQ.in("city", cities);
      if (types && types.length > 0) clientQ = clientQ.in("type", types);

      const { data: allClients, error: clientErr } = await clientQ.order("name");
      if (clientErr || !allClients) return { data: [], error: clientErr };

      // Filter by search
      const filtered = search
        ? allClients.filter((c: any) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.city?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
          )
        : allClients;

      if (filtered.length === 0) return { data: [], error: null };

      const ids = filtered.map((c: any) => c.id);

      // 2. Fetch metrics_daily for period
      let metricsQ = supabase
        .from("metrics_daily")
        .select("client_id, campaign_id, channel, spend, revenue, clicks, impressions, conversions, date")
        .in("client_id", ids)
        .gte("date", start)
        .lte("date", end);

      if (channels && channels.length > 0) {
        const adChannels = channels.filter(c => c === "google" || c === "meta" || c === "tiktok");
        if (adChannels.length > 0) metricsQ = metricsQ.in("channel", adChannels);
      }

      const { data: metrics } = await metricsQ;

      // 3. Fetch ifood orders for period (only if ifood in channels or no channel filter)
      const includeIfood = !channels || channels.length === 0 || channels.includes("ifood");
      let ifoodData: any[] = [];
      if (includeIfood) {
        const { data: ifoodRaw } = await supabase
          .from("ifood_orders")
          .select("client_id, total, cancelled")
          .in("client_id", ids)
          .gte("ordered_at", `${start}T00:00:00`)
          .lte("ordered_at", `${end}T23:59:59`);
        ifoodData = ifoodRaw ?? [];
      }

      // 4. Fetch GMB stats for period (only if gmb in channels or no channel filter)
      const includeGmb = !channels || channels.length === 0 || channels.includes("gmb");
      let gmbData: any[] = [];
      if (includeGmb) {
        const { data: gmbRaw } = await supabase
          .from("gmb_stats")
          .select("client_id, views, calls, directions, rating, date")
          .in("client_id", ids)
          .gte("date", start)
          .lte("date", end);
        gmbData = gmbRaw ?? [];
      }

      // 5. Fetch TripAdvisor reviews (source = 'tripadvisor') (only if tripadvisor in channels or no channel filter)
      const includeTrip = !channels || channels.length === 0 || channels.includes("tripadvisor");
      let reviewsData: any[] = [];
      if (includeTrip) {
        const { data: reviewsRaw } = await supabase
          .from("reviews")
          .select("client_id, rating, source, posted_at")
          .in("client_id", ids)
          .eq("source", "tripadvisor");
        reviewsData = reviewsRaw ?? [];
      }

      // 6. Fetch last 6 days of ifood revenue per client for sparkline
      const sparkStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
      const { data: sparkRaw } = await supabase
        .from("ifood_orders")
        .select("client_id, total, ordered_at")
        .in("client_id", ids)
        .gte("ordered_at", `${sparkStart}T00:00:00`);

      // 7. Aggregate per client
      const result = filtered.map((c: any) => {
        const clientMetrics = (metrics ?? []).filter((m: any) => m.client_id === c.id);
        const googleMetrics = clientMetrics.filter((m: any) => m.channel === "google");
        const metaMetrics = clientMetrics.filter((m: any) => m.channel === "meta");
        const tiktokMetrics = clientMetrics.filter((m: any) => m.channel === "tiktok");

        const google_spend = googleMetrics.reduce((s: number, m: any) => s + Number(m.spend ?? 0), 0);
        const meta_spend = metaMetrics.reduce((s: number, m: any) => s + Number(m.spend ?? 0), 0);
        const tiktok_spend = tiktokMetrics.reduce((s: number, m: any) => s + Number(m.spend ?? 0), 0);
        const total_spend = google_spend + meta_spend + tiktok_spend;

        // GMB stats
        const clientGmb = gmbData.filter((g: any) => g.client_id === c.id);
        const gmb_views = clientGmb.reduce((s: number, g: any) => s + Number(g.views ?? 0), 0);
        const gmb_calls = clientGmb.reduce((s: number, g: any) => s + Number(g.calls ?? 0), 0);

        // Tripadvisor reviews
        const clientTrip = reviewsData.filter((r: any) => r.client_id === c.id);
        const tripadvisor_reviews = clientTrip.length;
        const tripadvisor_rating = tripadvisor_reviews > 0
          ? clientTrip.reduce((s: number, r: any) => s + Number(r.rating ?? 0), 0) / tripadvisor_reviews
          : 0;

        const clientIfood = ifoodData.filter((o: any) => o.client_id === c.id && !o.cancelled);
        const ifood_revenue = clientIfood.reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
        const ifood_orders = clientIfood.length;
        const ifood_ticket = ifood_orders > 0 ? ifood_revenue / ifood_orders : 0;
        const roi = total_spend > 0 ? ifood_revenue / total_spend : 0;

        // Sparkline: daily ifood revenue for last 6 days
        const clientSpark = (sparkRaw ?? []).filter((o: any) => o.client_id === c.id);
        const sparkByDay: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
          sparkByDay[d] = 0;
        }
        clientSpark.forEach((o: any) => {
          const d = new Date(o.ordered_at).toISOString().slice(0, 10);
          if (d in sparkByDay) sparkByDay[d] += Number(o.total ?? 0);
        });
        const spark = Object.values(sparkByDay);

        return {
          ...c,
          manager_name: c.manager?.full_name ?? null,
          google_spend,
          meta_spend,
          tiktok_spend,
          total_spend,
          gmb_views,
          gmb_calls,
          tripadvisor_reviews,
          tripadvisor_rating,
          ifood_revenue,
          ifood_orders,
          ifood_ticket,
          roi,
          spark,
        };
      });

      return { data: result, error: null };
    },
    deps
  );
}

// ============================================================
// CLIENT CREDENTIALS
// ============================================================
export type ClientCredential = {
  id: string;
  client_id: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  created_at: string;
};

export function useClientCredentials(clientId: string | undefined) {
  return useArrayQuery<ClientCredential>(
    async () => {
      if (!clientId) return { data: [], error: null };
      const { data, error } = await supabase
        .from("client_credentials")
        .select("*")
        .eq("client_id", clientId)
        .order("title");
      return { data: data as ClientCredential[] | null, error };
    },
    [clientId]
  );
}

export async function createClientCredential(payload: Partial<ClientCredential> & { client_id: string; title: string }) {
  return supabase.from("client_credentials").insert(payload).select().single();
}

export async function updateClientCredential(id: string, payload: Partial<ClientCredential>) {
  return supabase.from("client_credentials").update(payload).eq("id", id).select().single();
}

export async function deleteClientCredential(id: string) {
  return supabase.from("client_credentials").delete().eq("id", id);
}
