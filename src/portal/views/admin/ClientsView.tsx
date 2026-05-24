import React, { useState } from "react";
import { Plus, Filter, Eye, MapPin, MoreVertical, Edit, Pause, Play, Trash2 } from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Tabs } from "../../components/ui/Tabs";
import { Skeleton } from "../../components/ui/Skeleton";
import { Dropdown, DropdownItem, DropdownSection } from "../../components/ui/Dropdown";
import { ClientFormModal } from "../../components/ClientFormModal";
import { ClientDetailDrawer } from "../../components/ClientDetailDrawer";
import { useToast } from "../../components/ui/Toast";
import { fmt } from "../../lib/format";
import { useClientsWithManager, updateClient, deleteClient } from "../../lib/api";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo", pending: "Pendente", paused: "Pausado", cancelled: "Cancelado",
};
const STATUS_TONE: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  active: "success", pending: "warning", paused: "neutral", cancelled: "danger",
};

export function ClientsView() {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const { data: clients = [], loading, refetch } = useClientsWithManager();

  const tabs = [
    { id: "all", label: "Todos", count: clients.length },
    { id: "active", label: "Ativos", count: clients.filter((c: any) => c.status === "active").length },
    { id: "pending", label: "Pendentes", count: clients.filter((c: any) => c.status === "pending").length },
    { id: "paused", label: "Pausados", count: clients.filter((c: any) => c.status === "paused").length },
    { id: "risk", label: "Em risco", count: clients.filter((c: any) => c.health_score < 70).length },
  ];

  const data = clients.filter((c: any) => {
    if (filter === "all") return true;
    if (filter === "risk") return c.health_score < 70;
    return c.status === filter;
  });

  async function togglePause(c: any) {
    const newStatus = c.status === "paused" ? "active" : "paused";
    const { error } = await updateClient(c.id, { status: newStatus });
    if (error) toast.error("Erro", error.message);
    else { toast.success(newStatus === "paused" ? "Pausado" : "Reativado"); refetch(); }
  }

  async function handleDelete(c: any) {
    if (!confirm(`Excluir "${c.name}"? Remove TODOS os dados vinculados (faturas, campanhas, mensagens, etc).`)) return;
    const { error } = await deleteClient(c.id);
    if (error) toast.error("Erro", error.message);
    else { toast.success("Cliente excluído"); refetch(); }
  }

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Restaurante",
      render: (row) => (
        <button onClick={() => setDetailId(row.id)} className="flex items-center gap-3 text-left group">
          <Avatar name={row.name} color={row.color} size="md" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#e01c1c] transition-colors">{row.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{row.type}</p>
          </div>
        </button>
      ),
    },
    {
      key: "city", header: "Local",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
          <MapPin size={11} className="text-slate-400" />
          {row.city ?? "—"}{row.state && `/${row.state}`}
        </span>
      ),
    },
    {
      key: "mrr", header: "MRR", align: "right",
      render: (row) => (
        <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
          {fmt.currency(Number(row.mrr ?? 0))}
        </span>
      ),
    },
    {
      key: "health_score", header: "Health Score", width: "180px",
      render: (row) => (
        <div className="w-32">
          <ProgressBar
            value={row.health_score}
            tone={row.health_score >= 80 ? "success" : row.health_score >= 60 ? "warning" : "danger"}
            size="sm"
          />
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">{row.health_score}/100</p>
        </div>
      ),
    },
    {
      key: "manager_name", header: "Gestor",
      render: (row) => (
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.manager_name ?? "—"}</span>
      ),
    },
    {
      key: "status", header: "Status",
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status] ?? "neutral"} dot={row.status === "active"}>
          {STATUS_LABEL[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: "actions", header: "", sortable: false, align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailId(row.id)}>
            Ver ficha
          </Button>
          <Dropdown
            align="right"
            width="w-48"
            trigger={
              <button className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical size={14} />
              </button>
            }
          >
            <DropdownSection>
              <DropdownItem icon={<Edit size={14} />} onClick={() => setEditClient(row)}>Editar</DropdownItem>
              <DropdownItem
                icon={row.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
                onClick={() => togglePause(row)}
              >
                {row.status === "paused" ? "Reativar" : "Pausar"}
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem icon={<Trash2 size={14} />} destructive onClick={() => handleDelete(row)}>
                Excluir
              </DropdownItem>
            </DropdownSection>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Clientes</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {loading
              ? "..."
              : `${clients.length} restaurantes — ${clients.filter((c: any) => c.status === "active").length} ativos`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Filter} size="sm" onClick={() => toast.info("Filtros avançados", "Em breve — por ora use as tabs e o campo de busca")}>
            Filtros
          </Button>
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
            Adicionar Cliente
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          search
          searchKeys={["name", "email", "city", "manager_name"]}
          searchPlaceholder="Buscar por restaurante, email, cidade, gestor..."
          rowKey={(r) => r.id}
          pageSize={10}
          onRowClick={(row) => setDetailId(row.id)}
        />
      )}

      {/* Modal de criar */}
      <ClientFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={refetch}
      />

      {/* Modal de editar (acionado pelo dropdown) */}
      <ClientFormModal
        open={!!editClient}
        onClose={() => setEditClient(null)}
        client={editClient}
        onSaved={refetch}
      />

      {/* Drawer com ficha completa */}
      <ClientDetailDrawer
        clientId={detailId}
        onClose={() => setDetailId(null)}
        onChanged={refetch}
      />
    </div>
  );
}
