import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { fmt } from "../../lib/format";
import { useMyClient, useReports } from "../../lib/api";

export function ClientReportsView() {
  const { data: client } = useMyClient();
  const { data: reports = [], loading } = useReports(client?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Meus Relatórios</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {reports.length} relatórios mensais gerados pela equipe
        </p>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum relatório ainda" description="Quando sua equipe gerar relatórios, eles aparecerão aqui." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {reports.map((r: any) => (
              <div key={r.id} className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {fmt.date(r.period_start)} – {fmt.date(r.period_end)}
                  </p>
                </div>
                <Badge tone={r.read_at ? "success" : "info"}>{r.read_at ? "Lido" : "Novo"}</Badge>
                <Button size="sm" variant="outline" icon={Eye}>Ver</Button>
                <Button size="sm" variant="ghost" icon={Download} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
