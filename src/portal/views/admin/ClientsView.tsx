import React, { useState } from "react";
import { Plus, Filter, Eye, MapPin, Mail } from "lucide-react";
import { MOCK_CLIENTS } from "../../lib/mockData";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Tabs } from "../../components/ui/Tabs";
import { fmt } from "../../lib/format";

type Client = (typeof MOCK_CLIENTS)[number];

export function ClientsView() {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "Todos", count: MOCK_CLIENTS.length },
    { id: "active", label: "Ativos", count: MOCK_CLIENTS.filter((c) => c.status === "active").length },
    { id: "pending", label: "Pendentes", count: MOCK_CLIENTS.filter((c) => c.status === "pending").length },
    { id: "risk", label: "Em risco", count: MOCK_CLIENTS.filter((c) => c.health < 70).length },
  ];

  const data = MOCK_CLIENTS.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "active";
    if (filter === "pending") return c.status === "pending";
    if (filter === "risk") return c.health < 70;
    return true;
  });

  const columns: Column<Client>[] = [
    {
      key: "restaurant",
      header: "Restaurante",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.restaurant} color={row.color} size="md" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{row.restaurant}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{row.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "Local",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
          <MapPin size={11} className="text-slate-400" />
          {row.city}
        </span>
      ),
    },
    {
      key: "mrr",
      header: "MRR",
      align: "right",
      render: (row) => (
        <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
          {fmt.currency(row.mrr)}
        </span>
      ),
    },
    {
      key: "health",
      header: "Health Score",
      width: "180px",
      render: (row) => (
        <div className="w-32">
          <ProgressBar
            value={row.health}
            tone={row.health >= 80 ? "success" : row.health >= 60 ? "warning" : "danger"}
            size="sm"
          />
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">{row.health}/100</p>
        </div>
      ),
    },
    {
      key: "manager",
      header: "Gestor",
      render: (row) => (
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.manager}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.status === "active" ? "success" : "warning"} dot>
          {row.status === "active" ? "Ativo" : "Pendente"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: () => (
        <Button size="xs" variant="ghost" icon={Eye}>
          Ver portal
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
            Clientes
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {MOCK_CLIENTS.length} restaurantes — {MOCK_CLIENTS.filter((c) => c.status === "active").length} ativos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Filter} size="sm">
            Filtros
          </Button>
          <Button variant="primary" icon={Plus} size="sm">
            Adicionar Cliente
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      <DataTable
        data={data}
        columns={columns}
        search
        searchKeys={["restaurant", "email", "city", "manager"]}
        searchPlaceholder="Buscar por restaurante, email, cidade..."
        rowKey={(r) => r.id}
        pageSize={8}
      />
    </div>
  );
}
