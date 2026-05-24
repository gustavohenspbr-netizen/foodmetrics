import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { EmptyState } from "./ui/EmptyState";

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  search?: boolean;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  rowKey?: (row: T, idx: number) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  search,
  searchKeys,
  searchPlaceholder = "Buscar...",
  onRowClick,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
  pageSize = 10,
  rowKey,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    const keys = searchKeys ?? (Object.keys(data[0] ?? {}) as (keyof T)[]);
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = col.accessor ? col.accessor(a) : a[sortKey];
      const bv = col.accessor ? col.accessor(b) : b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {search && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-10 pr-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/20 focus:border-[#e01c1c]/40"
            />
          </div>
        </div>
      )}

      {pageData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30">
                  {columns.map((col) => {
                    const sortable = col.sortable !== false;
                    const isActive = sortKey === col.key;
                    return (
                      <th
                        key={String(col.key)}
                        style={{ width: col.width }}
                        className={cn(
                          "px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          !col.align && "text-left"
                        )}
                      >
                        {sortable ? (
                          <button
                            onClick={() => toggleSort(String(col.key))}
                            className={cn(
                              "inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors",
                              isActive && "text-slate-900 dark:text-white"
                            )}
                          >
                            {col.header}
                            {isActive ? (
                              sortDir === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )
                            ) : (
                              <ChevronsUpDown size={12} className="opacity-40" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr
                    key={rowKey ? rowKey(row, i) : i}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 transition-colors",
                      onRowClick && "hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-5 py-4 text-[13px] text-slate-700 dark:text-slate-300 font-medium",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} de{" "}
                {sorted.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 text-[12px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 text-[12px] font-bold text-slate-900 dark:text-white">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 text-[12px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
