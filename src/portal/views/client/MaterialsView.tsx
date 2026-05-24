import React, { useState } from "react";
import { Image, Video, FileText, Check, X, Download, Eye, Upload } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { MOCK_MATERIALS } from "../../lib/mockData";
import { cn } from "../../lib/cn";

export function MaterialsView() {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "Todos", count: MOCK_MATERIALS.length },
    { id: "pending", label: "Aguardando aprovação", count: MOCK_MATERIALS.filter((m) => m.status === "pending").length },
    { id: "approved", label: "Aprovados", count: MOCK_MATERIALS.filter((m) => m.status === "approved").length },
    { id: "draft", label: "Rascunhos", count: MOCK_MATERIALS.filter((m) => m.status === "draft").length },
  ];

  const items = MOCK_MATERIALS.filter((m) => filter === "all" || m.status === filter);

  const STATUS_TONE: Record<string, "warning" | "success" | "neutral"> = {
    pending: "warning",
    approved: "success",
    draft: "neutral",
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: "Aguardando aprovação",
    approved: "Aprovado",
    draft: "Rascunho",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
            Materiais & Criativos
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Fotos, vídeos e peças produzidas pela equipe — aprove antes de ir ao ar
          </p>
        </div>
        <Button variant="primary" icon={Upload} size="sm">
          Enviar material
        </Button>
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} variant="pills" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m) => {
          const TypeIcon = m.type === "video" ? Video : m.type === "image" ? Image : FileText;
          return (
            <Card key={m.id} padded={false} hoverable className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-6xl relative">
                {m.thumbnail}
                <div className="absolute top-3 left-3">
                  <Badge tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                </div>
                <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center">
                  <TypeIcon size={16} className="text-slate-700 dark:text-slate-300" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                  {m.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{m.size}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{m.date}</p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {m.status === "pending" ? (
                    <>
                      <Button size="sm" variant="success" icon={Check} fullWidth>
                        Aprovar
                      </Button>
                      <Button size="sm" variant="danger" icon={X}>
                        Pedir ajuste
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" icon={Eye} fullWidth>
                        Ver
                      </Button>
                      <Button size="sm" variant="ghost" icon={Download} />
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
