import React, { useState, useMemo } from "react";
import {
  Search, Filter, X, ChevronUp, ChevronDown, TrendingUp, TrendingDown,
  BarChart3, Users, DollarSign, Activity, ShoppingBag, Star,
  Calendar, Download, RefreshCw, SlidersHorizontal, Eye,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, Legend,
} from "recharts";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { MetricCard } from "../../components/MetricCard";
import { fmt } from "../../lib/format";
import { useClientsWithManager, useTeam, useAdminResults } from "../../lib/api";
import { cn } from "../../lib/cn";
import { ClientDetailDrawer } from "../../components/ClientDetailDrawer";

// ─── Types ───────────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc";
type SortKey =
  | "name" | "status" | "mrr" | "health_score"
  | "google_spend" | "meta_spend" | "tiktok_spend" | "gmb_views" | "gmb_calls" | "tripadvisor_reviews" | "tripadvisor_rating" | "ifood_revenue"
  | "ifood_orders" | "ifood_ticket" | "roi" | "manager_name";

type Filters = {
  search: string;
  period: "today" | "yesterday" | "7d" | "14d" | "30d" | "thisMonth" | "lastMonth" | "3m" | "thisYear" | "custom";
  dateFrom: string;
  dateTo: string;
  clientIds: string[];
  managerIds: string[];
  statuses: string[];
  channels: string[];
  healthRange: "all" | "healthy" | "risk" | "critical";
  mrrMin: string;
  mrrMax: string;
  cities: string[];
  types: string[];
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  period: "30d",
  dateFrom: "",
  dateTo: "",
  clientIds: [],
  managerIds: [],
  statuses: [],
  channels: [],
  healthRange: "all",
  mrrMin: "",
  mrrMax: "",
  cities: [],
  types: [],
};

const PERIOD_LABELS: Record<string, string> = {
  "today": "Hoje",
  "yesterday": "Ontem",
  "7d": "Últimos 7 dias",
  "14d": "Últimos 14 dias",
  "30d": "Últimos 30 dias",
  "thisMonth": "Este mês",
  "lastMonth": "Mês passado",
  "3m": "Últimos 3 meses",
  "thisYear": "Este ano",
  "custom": "Período personalizado",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo", tone: "success" as const },
  { value: "pending", label: "Pendente", tone: "warning" as const },
  { value: "paused", label: "Pausado", tone: "neutral" as const },
  { value: "cancelled", label: "Cancelado", tone: "danger" as const },
];

const CHANNEL_OPTIONS = [
  { value: "google", label: "Google Ads", color: "#4285F4" },
  { value: "meta", label: "Meta Ads", color: "#1877F2" },
  { value: "tiktok", label: "TikTok Ads", color: "#00f2fe" },
  { value: "ifood", label: "iFood", color: "#EA1D2C" },
  { value: "gmb", label: "Google Meu Negócio", color: "#34A853" },
  { value: "tripadvisor", label: "TripAdvisor", color: "#34E0A1" },
];

const HEALTH_OPTIONS = [
  { value: "all", label: "Todos os clientes" },
  { value: "healthy", label: "Saudáveis (≥70)" },
  { value: "risk", label: "Em risco (<70)" },
  { value: "critical", label: "Crítico (<50)" },
];

const RANK_METRIC_OPTIONS = [
  { value: "mrr", label: "MRR" },
  { value: "google_spend", label: "Verba Google" },
  { value: "meta_spend", label: "Verba Meta" },
  { value: "tiktok_spend", label: "Verba TikTok" },
  { value: "gmb_views", label: "Visualizações GMN" },
  { value: "tripadvisor_reviews", label: "Avaliações TripAdvisor" },
  { value: "ifood_revenue", label: "Faturamento iFood" },
  { value: "ifood_orders", label: "Pedidos iFood" },
  { value: "roi", label: "ROI Geral" },
];

// ─── FilterBadge ─────────────────────────────────────────────────────────────
function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e01c1c]/10 text-[#e01c1c] text-[11px] font-bold border border-[#e01c1c]/20">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={10} />
      </button>
    </span>
  );
}

// ─── SortableHeader ──────────────────────────────────────────────────────────
function SortableHeader({
  col, label, sortKey, sortDir, onSort,
}: {
  col: SortKey; label: string; sortKey: SortKey; sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={cn(
        "flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors",
        active ? "text-[#e01c1c]" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      )}
    >
      {label}
      <span className="flex flex-col -space-y-1">
        <ChevronUp size={9} className={cn(active && sortDir === "asc" ? "text-[#e01c1c]" : "opacity-30")} />
        <ChevronDown size={9} className={cn(active && sortDir === "desc" ? "text-[#e01c1c]" : "opacity-30")} />
      </span>
    </button>
  );
}

// ─── SparkMini ────────────────────────────────────────────────────────────────
function SparkMini({ values, color = "#e01c1c" }: { values: number[]; color?: string }) {
  if (!values || values.length < 2) return <span className="text-slate-300 text-xs">—</span>;
  const max = Math.max(...values, 1);
  const h = 28;
  const w = 60;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const up = last >= prev;
  return (
    <div className="flex items-center gap-1.5">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {up ? <TrendingUp size={11} className="text-emerald-500" /> : <TrendingDown size={11} className="text-red-500" />}
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  if (!opt) return <Badge tone="neutral">{status}</Badge>;
  return <Badge tone={opt.tone}>{opt.label}</Badge>;
}

// ─── HealthDot ────────────────────────────────────────────────────────────────
function HealthDot({ score }: { score: number }) {
  const tone = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500")} />
      <span className={cn("text-[12px] font-bold tabular-nums", tone)}>{score}</span>
    </div>
  );
}

// ─── MultiSelect ─────────────────────────────────────────────────────────────
function MultiSelect<T extends string>({
  label, options, value, onChange, placeholder,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-semibold transition-all whitespace-nowrap",
          value.length > 0
            ? "border-[#e01c1c]/40 bg-[#e01c1c]/5 text-[#e01c1c]"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:border-slate-300"
        )}
      >
        {label}
        {value.length > 0 && (
          <span className="bg-[#e01c1c] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {value.length}
          </span>
        )}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 top-11 left-0 w-52 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 space-y-0.5">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-left transition-colors",
                  value.includes(opt.value)
                    ? "bg-[#e01c1c]/10 text-[#e01c1c]"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <span className={cn("w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0", value.includes(opt.value) ? "border-[#e01c1c] bg-[#e01c1c]" : "border-slate-300 dark:border-slate-600")}>
                  {value.includes(opt.value) && <svg viewBox="0 0 10 8" className="w-2 h-2 text-white fill-current"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────
export function ResultsView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("mrr");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [rankMetric, setRankMetric] = useState("ifood_revenue");
  const [drawerClientId, setDrawerClientId] = useState<string | null>(null);

  const { data: clients = [], loading: lClients } = useClientsWithManager();
  const { data: team = [] } = useTeam();
  const { data: results = [], loading: lResults } = useAdminResults(filters);

  const typeOptions = useMemo(() => {
    const typesSet = new Set(clients.map(c => c.type).filter(Boolean));
    return Array.from(typesSet).map(t => ({ value: t as string, label: t as string }));
  }, [clients]);

  const cityOptions = useMemo(() => {
    const citiesSet = new Set(clients.map(c => c.city).filter(Boolean));
    return Array.from(citiesSet).map(c => ({ value: c as string, label: c as string }));
  }, [clients]);

  // ── Active filter count ──────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.search) c++;
    if (filters.period !== "30d") c++;
    if (filters.clientIds.length) c++;
    if (filters.managerIds.length) c++;
    if (filters.statuses.length) c++;
    if (filters.channels.length) c++;
    if (filters.healthRange !== "all") c++;
    if (filters.mrrMin || filters.mrrMax) c++;
    if (filters.cities.length) c++;
    if (filters.types.length) c++;
    return c;
  }, [filters]);

  const setF = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  // ── Sort & filter the result list ────────────────────────────────────────
  const sorted = useMemo(() => {
    const list = [...results];
    list.sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [results, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // ── KPI aggregates ───────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const sum = (k: string) => results.reduce((s: number, r: any) => s + Number(r[k] ?? 0), 0);
    const count = results.length;
    const avgHealth = count ? results.reduce((s: any, r: any) => s + (r.health_score ?? 0), 0) / count : 0;
    const atRisk = results.filter((r: any) => r.health_score < 70).length;
    const googleSpend = sum("google_spend");
    const metaSpend = sum("meta_spend");
    const tiktokSpend = sum("tiktok_spend");
    const ifoodRev = sum("ifood_revenue");
    const totalSpend = googleSpend + metaSpend + tiktokSpend;
    const roi = totalSpend > 0 ? ifoodRev / totalSpend : 0;
    const gmbViews = sum("gmb_views");
    const tripReviews = sum("tripadvisor_reviews");
    const avgTripRating = tripReviews > 0
      ? results.reduce((s: number, r: any) => s + (r.tripadvisor_rating ?? 0) * (r.tripadvisor_reviews ?? 0), 0) / tripReviews
      : 0;

    return {
      totalMrr: sum("mrr"),
      totalSpend,
      googleSpend,
      metaSpend,
      tiktokSpend,
      ifoodRevenue: ifoodRev,
      avgHealth: Math.round(avgHealth),
      atRisk,
      ifoodOrders: sum("ifood_orders"),
      avgTicket: sum("ifood_orders") > 0 ? ifoodRev / sum("ifood_orders") : 0,
      roi,
      gmbViews,
      tripReviews,
      avgTripRating: Number(avgTripRating.toFixed(1)),
    };
  }, [results]);

  // ── Ranking data for chart ───────────────────────────────────────────────
  const rankData = useMemo(() => {
    return [...results]
      .sort((a: any, b: any) => (b[rankMetric] ?? 0) - (a[rankMetric] ?? 0))
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name?.length > 18 ? r.name.slice(0, 18) + "…" : r.name,
        value: r[rankMetric] ?? 0,
        color: r.color ?? "#e01c1c",
      }));
  }, [results, rankMetric]);

  // ── Active filter pills ──────────────────────────────────────────────────
  const filterPills: { label: string; clear: () => void }[] = [];
  if (filters.search) filterPills.push({ label: `"${filters.search}"`, clear: () => setF("search", "") });
  if (filters.period !== "30d") filterPills.push({ label: PERIOD_LABELS[filters.period], clear: () => setF("period", "30d") });
  filters.statuses.forEach(s => filterPills.push({ label: STATUS_OPTIONS.find(o => o.value === s)?.label ?? s, clear: () => setF("statuses", filters.statuses.filter(x => x !== s)) }));
  filters.channels.forEach(c => filterPills.push({ label: CHANNEL_OPTIONS.find(o => o.value === c)?.label ?? c, clear: () => setF("channels", filters.channels.filter(x => x !== c)) }));
  if (filters.healthRange !== "all") filterPills.push({ label: HEALTH_OPTIONS.find(o => o.value === filters.healthRange)?.label ?? "", clear: () => setF("healthRange", "all") });
  if (filters.mrrMin || filters.mrrMax) filterPills.push({ label: `MRR: ${filters.mrrMin || "0"} – ${filters.mrrMax || "∞"}`, clear: () => { setF("mrrMin", ""); setF("mrrMax", ""); } });
  filters.clientIds.forEach(id => filterPills.push({ label: clients.find(c => c.id === id)?.name ?? id, clear: () => setF("clientIds", filters.clientIds.filter(x => x !== id)) }));
  filters.managerIds.forEach(id => filterPills.push({ label: team.find(m => m.id === id)?.full_name ?? id, clear: () => setF("managerIds", filters.managerIds.filter(x => x !== id)) }));
  filters.cities.forEach(city => filterPills.push({ label: `Cidade: ${city}`, clear: () => setF("cities", filters.cities.filter(x => x !== city)) }));
  filters.types.forEach(t => filterPills.push({ label: `Segmento: ${t}`, clear: () => setF("types", filters.types.filter(x => x !== t)) }));

  const managersOptions = team.map((m: any) => ({ value: m.id, label: m.full_name ?? m.email }));
  const clientsOptions = clients.map((c: any) => ({ value: c.id, label: c.name }));

  const rankMetricLabel = RANK_METRIC_OPTIONS.find(o => o.value === rankMetric)?.label ?? "";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Resultados dos Clientes</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Visão consolidada de performance · {results.length} cliente{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setFilters({ ...DEFAULT_FILTERS })}>Limpar filtros</Button>
          <Button variant="outline" size="sm" icon={Download}>Exportar CSV</Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filters.search}
              onChange={e => setF("search", e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#e01c1c]/40 focus:ring-2 focus:ring-[#e01c1c]/10 transition-all"
            />
          </div>

          {/* Client Filter (promoted to main bar!) */}
          <MultiSelect
            label={filters.clientIds.length ? `${filters.clientIds.length} clientes` : "Todos os Clientes"}
            options={clientsOptions}
            value={filters.clientIds as any}
            onChange={v => setF("clientIds", v)}
          />

          {/* Period */}
          <select
            value={filters.period}
            onChange={e => setF("period", e.target.value as Filters["period"])}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[12px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            {Object.entries(PERIOD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Custom date range */}
          {filters.period === "custom" && (
            <>
              <input type="date" value={filters.dateFrom} onChange={e => setF("dateFrom", e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[12px] font-semibold outline-none cursor-pointer" />
              <span className="text-slate-400 text-xs font-bold">até</span>
              <input type="date" value={filters.dateTo} onChange={e => setF("dateTo", e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[12px] font-semibold outline-none cursor-pointer" />
            </>
          )}

          {/* Status multi */}
          <MultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.statuses as any}
            onChange={v => setF("statuses", v)}
          />

          {/* Channel multi */}
          <MultiSelect
            label="Canal"
            options={CHANNEL_OPTIONS}
            value={filters.channels as any}
            onChange={v => setF("channels", v)}
          />

          {/* Health */}
          <select
            value={filters.healthRange}
            onChange={e => setF("healthRange", e.target.value as Filters["healthRange"])}
            className={cn(
              "h-9 px-3 rounded-xl border text-[12px] font-semibold outline-none cursor-pointer transition-colors",
              filters.healthRange !== "all"
                ? "border-[#e01c1c]/40 bg-[#e01c1c]/5 text-[#e01c1c]"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:border-slate-300"
            )}
          >
            {HEALTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-semibold transition-all",
              showFilters || filters.managerIds.length || filters.cities.length || filters.types.length || filters.mrrMin || filters.mrrMax
                ? "border-[#e01c1c]/40 bg-[#e01c1c]/5 text-[#e01c1c]"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:border-slate-300"
            )}
          >
            <SlidersHorizontal size={13} />
            Mais filtros
            {(filters.managerIds.length + filters.cities.length + filters.types.length + (filters.mrrMin || filters.mrrMax ? 1 : 0)) > 0 && (
              <span className="bg-[#e01c1c] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {filters.managerIds.length + filters.cities.length + filters.types.length + (filters.mrrMin || filters.mrrMax ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* City selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cidade</label>
              <MultiSelect
                label={filters.cities.length ? `${filters.cities.length} selecionadas` : "Todas as cidades"}
                options={cityOptions}
                value={filters.cities as any}
                onChange={v => setF("cities", v)}
              />
            </div>
            {/* Segment/Type selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Segmento</label>
              <MultiSelect
                label={filters.types.length ? `${filters.types.length} selecionados` : "Todos os segmentos"}
                options={typeOptions}
                value={filters.types as any}
                onChange={v => setF("types", v)}
              />
            </div>
            {/* Manager */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gestor responsável</label>
              <MultiSelect
                label={filters.managerIds.length ? `${filters.managerIds.length} gestores` : "Todos os gestores"}
                options={managersOptions}
                value={filters.managerIds as any}
                onChange={v => setF("managerIds", v)}
              />
            </div>
            {/* MRR range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MRR mínimo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 500"
                value={filters.mrrMin}
                onChange={e => setF("mrrMin", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[12px] font-semibold outline-none focus:border-[#e01c1c]/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MRR máximo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 5000"
                value={filters.mrrMax}
                onChange={e => setF("mrrMax", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[12px] font-semibold outline-none focus:border-[#e01c1c]/40"
              />
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {filterPills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filterPills.map((p, i) => (
              <FilterBadge key={i} label={p.label} onRemove={p.clear} />
            ))}
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-1"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
        {[
          { label: "MRR Total", value: fmt.currencyCompact(kpis.totalMrr), icon: DollarSign, color: "#10b981" },
          { label: "Verba Ads", value: fmt.currencyCompact(kpis.totalSpend), icon: Activity, color: "#ff8732" },
          { label: "Receita iFood", value: fmt.currencyCompact(kpis.ifoodRevenue), icon: ShoppingBag, color: "#EA1D2C" },
          { label: "Pedidos iFood", value: fmt.number(kpis.ifoodOrders), icon: ShoppingBag, color: "#f97316" },
          { label: "Ticket Médio", value: fmt.currencyCompact(kpis.avgTicket), icon: DollarSign, color: "#8b5cf6" },
          { label: "Visualizações GMN", value: fmt.number(kpis.gmbViews), icon: Eye, color: "#34A853" },
          { label: "Avaliações Trip", value: `${fmt.number(kpis.tripReviews)} (${kpis.avgTripRating} ★)`, icon: Star, color: "#34E0A1" },
          { label: "ROI Geral", value: `${kpis.roi.toFixed(1)}x`, icon: TrendingUp, color: kpis.roi >= 2 ? "#10b981" : "#8b5cf6" },
          { label: "Health Médio", value: String(kpis.avgHealth), icon: Star, color: kpis.avgHealth >= 70 ? "#10b981" : kpis.avgHealth >= 50 ? "#f59e0b" : "#ef4444" },
          { label: "Em Risco", value: String(kpis.atRisk), icon: Users, color: kpis.atRisk === 0 ? "#10b981" : "#ef4444", hint: "Health < 70" },
        ].map(k => (
          <div key={k.label} className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-[0.08] blur-xl" style={{ background: k.color }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{k.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}18`, border: `1px solid ${k.color}25` }}>
                <k.icon size={13} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[16px] font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
              {lResults ? "…" : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Ranking Chart + Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ranking Chart */}
        <Card>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Ranking de Clientes</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Top 10 por {rankMetricLabel}</p>
            </div>
            <select
              value={rankMetric}
              onChange={e => setRankMetric(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              {RANK_METRIC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {lResults ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : rankData.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-[13px] font-medium">Nenhum dado disponível</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rankData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" horizontal={false} />
                <XAxis type="number" stroke="currentColor" className="text-slate-500 text-xs" tickLine={false} axisLine={false}
                  tickFormatter={v => rankMetric.includes("spend") || rankMetric.includes("revenue") || rankMetric === "mrr" ? fmt.currencyCompact(v) : fmt.numberCompact(v)} />
                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-slate-500 text-xs font-semibold" tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 12, fontWeight: 600 }}
                  formatter={(v: number) => [
                    rankMetric.includes("spend") || rankMetric.includes("revenue") || rankMetric === "mrr" ? fmt.currency(v) : fmt.number(v),
                    rankMetricLabel,
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {rankData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader title="Health Score por Cliente" subtitle="Distribuição de saúde da carteira" />
          <div className="space-y-2.5 mt-1">
            {lResults ? (
              [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-8 w-full" />)
            ) : sorted.slice(0, 8).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 group">
                <Avatar name={r.name} color={r.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => setDrawerClientId(r.id)}
                      className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate hover:text-[#e01c1c] transition-colors"
                    >
                      {r.name}
                    </button>
                    <span className={cn(
                      "text-[11px] font-bold ml-2",
                      r.health_score >= 70 ? "text-emerald-600" : r.health_score >= 50 ? "text-amber-600" : "text-red-600"
                    )}>
                      {r.health_score}
                    </span>
                  </div>
                  <ProgressBar
                    value={r.health_score}
                    tone={r.health_score >= 70 ? "success" : r.health_score >= 50 ? "warning" : "danger"}
                    size="sm"
                  />
                </div>
              </div>
            ))}
            {sorted.length > 8 && (
              <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                +{sorted.length - 8} mais na tabela abaixo
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Main Data Table ── */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Tabela de Resultados</h3>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                {sorted.length} cliente{sorted.length !== 1 ? "s" : ""} · Período: {PERIOD_LABELS[filters.period]}
              </p>
            </div>
            <Badge tone="brand">{PERIOD_LABELS[filters.period]}</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-5 py-3">
                  <SortableHeader col="name" label="Cliente" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="manager_name" label="Gestor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="mrr" label="MRR" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="health_score" label="Health" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="google_spend" label="Google" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="meta_spend" label="Meta" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="tiktok_spend" label="TikTok" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="gmb_views" label="GMN (Views)" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="tripadvisor_reviews" label="TripAdvisor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="ifood_revenue" label="iFood Rev." sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="ifood_orders" label="Pedidos" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="ifood_ticket" label="Ticket" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3">
                  <SortableHeader col="roi" label="ROI" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tendência</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {lResults ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 16 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Filter size={24} className="text-slate-400" />
                      </div>
                      <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400">Nenhum cliente encontrado</p>
                      <p className="text-[12px] text-slate-400">Ajuste os filtros para ver resultados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((r: any) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDrawerClientId(r.id)}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <Avatar name={r.name} color={r.color} size="md" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[160px] group-hover:text-[#e01c1c] transition-colors">
                            {r.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">
                            {r.city ?? r.type ?? "—"}
                          </p>
                        </div>
                      </button>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    {/* Manager */}
                    <td className="px-4 py-4">
                      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                        {r.manager_name ?? "—"}
                      </span>
                    </td>
                    {/* MRR */}
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {fmt.currencyCompact(r.mrr ?? 0)}
                      </span>
                    </td>
                    {/* Health */}
                    <td className="px-4 py-4">
                      <HealthDot score={r.health_score ?? 50} />
                    </td>
                    {/* Google */}
                    <td className="px-4 py-4">
                      <span className={cn("text-[12px] font-bold tabular-nums", (r.google_spend ?? 0) > 0 ? "text-[#4285F4]" : "text-slate-300 dark:text-slate-600")}>
                        {(r.google_spend ?? 0) > 0 ? fmt.currencyCompact(r.google_spend) : "—"}
                      </span>
                    </td>
                    {/* Meta */}
                    <td className="px-4 py-4">
                      <span className={cn("text-[12px] font-bold tabular-nums", (r.meta_spend ?? 0) > 0 ? "text-[#1877F2]" : "text-slate-300 dark:text-slate-600")}>
                        {(r.meta_spend ?? 0) > 0 ? fmt.currencyCompact(r.meta_spend) : "—"}
                      </span>
                    </td>
                    {/* TikTok */}
                    <td className="px-4 py-4">
                      <span className={cn("text-[12px] font-bold tabular-nums", (r.tiktok_spend ?? 0) > 0 ? "text-[#00f2fe]" : "text-slate-300 dark:text-slate-600")}>
                        {(r.tiktok_spend ?? 0) > 0 ? fmt.currencyCompact(r.tiktok_spend) : "—"}
                      </span>
                    </td>
                    {/* GMN */}
                    <td className="px-4 py-4">
                      <span className={cn("text-[12px] font-bold tabular-nums", (r.gmb_views ?? 0) > 0 ? "text-[#34A853]" : "text-slate-300 dark:text-slate-600")}>
                        {(r.gmb_views ?? 0) > 0 ? fmt.numberCompact(r.gmb_views) : "—"}
                      </span>
                    </td>
                    {/* TripAdvisor */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={cn("text-[12px] font-bold tabular-nums", (r.tripadvisor_reviews ?? 0) > 0 ? "text-[#34E0A1]" : "text-slate-300 dark:text-slate-600")}>
                          {(r.tripadvisor_reviews ?? 0) > 0 ? `${r.tripadvisor_reviews} aval.` : "—"}
                        </span>
                        {(r.tripadvisor_reviews ?? 0) > 0 && (
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {r.tripadvisor_rating.toFixed(1)} ★
                          </span>
                        )}
                      </div>
                    </td>
                    {/* iFood Rev */}
                    <td className="px-4 py-4">
                      <span className={cn("text-[12px] font-bold tabular-nums", (r.ifood_revenue ?? 0) > 0 ? "text-[#EA1D2C]" : "text-slate-300 dark:text-slate-600")}>
                        {(r.ifood_revenue ?? 0) > 0 ? fmt.currencyCompact(r.ifood_revenue) : "—"}
                      </span>
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-4">
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {(r.ifood_orders ?? 0) > 0 ? fmt.number(r.ifood_orders) : "—"}
                      </span>
                    </td>
                    {/* Ticket */}
                    <td className="px-4 py-4">
                      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                        {(r.ifood_ticket ?? 0) > 0 ? fmt.currencyCompact(r.ifood_ticket) : "—"}
                      </span>
                    </td>
                    {/* ROI */}
                    <td className="px-4 py-4">
                      {(r.roi ?? 0) > 0 ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold",
                          r.roi >= 2 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : r.roi >= 1 ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        )}>
                          {r.roi >= 1 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {r.roi.toFixed(1)}x
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[12px]">—</span>
                      )}
                    </td>
                    {/* Trend sparkline */}
                    <td className="px-4 py-4">
                      <SparkMini values={r.spark ?? []} color={r.color ?? "#e01c1c"} />
                    </td>
                    {/* View */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDrawerClientId(r.id)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {sorted.length > 0 && !lResults && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[12px] text-slate-400 font-medium">
              {sorted.length} resultado{sorted.length !== 1 ? "s" : ""}
              {activeFilterCount > 0 && ` · ${activeFilterCount} filtro${activeFilterCount !== 1 ? "s" : ""} ativo${activeFilterCount !== 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-slate-400">
                MRR total: <span className="font-bold text-slate-700 dark:text-slate-300">{fmt.currency(kpis.totalMrr)}</span>
              </span>
              <span className="text-[12px] text-slate-400">
                Verba: <span className="font-bold text-slate-700 dark:text-slate-300">{fmt.currency(kpis.totalSpend)}</span>
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* ── Client Drawer ── */}
      {drawerClientId && (
        <ClientDetailDrawer
          clientId={drawerClientId}
          onClose={() => setDrawerClientId(null)}
        />
      )}
    </div>
  );
}
