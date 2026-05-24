import React, { useState } from "react";
import { Image, Video, FileText, Check, X, Download, Eye, Upload } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { useMyClient, useMaterials, approveMaterial } from "../../lib/api";

const THUMBNAILS: Record<string, string> = {
  image: "📸", video: "🎬", default: "📄",
};

export function MaterialsView() {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const { data: client } = useMyClient();
  const { data: materials = [], loading, refetch } = useMaterials(client?.id);

  const tabs = [
    { id: "all", label: "Todos", count: materials.length },
    { id: "pending", label: "Aguardando aprovação", count: materials.filter((m: any) => m.status === "pending").length },
    { id: "approved", label: "Aprovados", count: materials.filter((m: any) => m.status === "approved").length },
    { id: "draft", label: "Rascunhos", count: materials.filter((m: any) => m.status === "draft").length },
  ];

  const items = materials.filter((m: any) => filter === "all" || m.status === filter);

  const STATUS_TONE: Record<string, "warning" | "success" | "neutral"> = { pending: "warning", approved: "success", draft: "neutral" };
  const STATUS_LABEL: Record<string, string> = { pending: "Aguardando aprovação", approved: "Aprovado", draft: "Rascunho" };

  async function handleApprove(id: string, title: string) {
    const { error } = await approveMaterial(id);
    if (error) toast.error("Erro ao aprovar", error.message);
    else { toast.success("Aprovado!", title); refetch(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Materiais & Criativos</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Fotos, vídeos e peças produzidas pela equipe — aprove antes de ir ao ar
          </p>
        </div>
        <Button variant="primary" icon={Upload} size="sm">Enviar material</Button>
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Image} title="Sem materiais nessa categoria" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m: any) => {
            const TypeIcon = m.type === "video" ? Video : m.type === "image" ? Image : FileText;
            return (
              <Card key={m.id} padded={false} hoverable className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-6xl relative">
                  {THUMBNAILS[m.type] ?? THUMBNAILS.default}
                  <div className="absolute top-3 left-3">
                    <Badge tone={STATUS_TONE[m.status] ?? "neutral"}>{STATUS_LABEL[m.status] ?? m.status}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center">
                    <TypeIcon size={16} className="text-slate-700 dark:text-slate-300" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{m.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{m.size}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      {new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {m.status === "pending" ? (
                      <>
                        <Button size="sm" variant="success" icon={Check} fullWidth onClick={() => handleApprove(m.id, m.title)}>Aprovar</Button>
                        <Button size="sm" variant="danger" icon={X}>Pedir ajuste</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" icon={Eye} fullWidth>Ver</Button>
                        <Button size="sm" variant="ghost" icon={Download} />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
