import React from "react";
import { FileText, Download, Send, Plus, Filter } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useReports } from "../../lib/api";

export function ReportsView() {
  const { data: reports = [], loading } = useReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Central de Relatórios</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {reports.length} relatórios entregues
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Filter} size="sm">Filtros</Button>
          <Button variant="primary" icon={Plus} size="sm">Novo Relatório</Button>
        </div>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FileText} title="Sem relatórios ainda" description="Crie o primeiro relatório mensal pra um cliente." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {reports.map((r: any) => (
              <div key={r.id} className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">{r.title}</p>
                    <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      <span>{r.client_name}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>{fmt.date(r.period_start)} – {fmt.date(r.period_end)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={r.read_at ? "success" : r.sent_at ? "info" : "neutral"}>
                    {r.read_at ? "Visualizado" : r.sent_at ? "Entregue" : "Rascunho"}
                  </Badge>
                  <Button size="xs" variant="outline" icon={Download} />
                  <Button size="xs" variant="ghost" icon={Send} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
