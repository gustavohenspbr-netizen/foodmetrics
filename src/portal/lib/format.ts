const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const NUM = new Intl.NumberFormat("pt-BR");
const NUM_COMPACT = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const fmt = {
  currency: (v: number) => BRL.format(v),
  currencyCompact: (v: number) => BRL_COMPACT.format(v),
  number: (v: number) => NUM.format(v),
  numberCompact: (v: number) => NUM_COMPACT.format(v),
  percent: (v: number) => PCT.format(v),
  delta: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
  date: (iso: string | Date) => {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleDateString("pt-BR");
  },
  dateLong: (iso: string | Date) => {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  },
  time: (iso: string | Date) => {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  },
  initials: (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase(),
};
