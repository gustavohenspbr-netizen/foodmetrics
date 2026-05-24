import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardView } from "../views/admin/DashboardView";
import { ClientsView } from "../views/admin/ClientsView";
import { TrafficView } from "../views/admin/TrafficView";
import { CRMView } from "../views/admin/CRMView";
import { ScheduleView } from "../views/admin/ScheduleView";
import { TeamView } from "../views/admin/TeamView";
import { FinanceView } from "../views/admin/FinanceView";
import { ContractsView } from "../views/admin/ContractsView";
import { ReportsView } from "../views/admin/ReportsView";

export function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auth guard relaxado em dev — em prod, descomente:
    // const role = sessionStorage.getItem("fm_role");
    // if (role !== "admin") window.location.href = "/login.html";
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="admin" active={active} setActive={setActive} pendingCount={2} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar type="admin" active={active} pendingCount={2} />

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {active === "dashboard" && <DashboardView />}
            {active === "clients" && <ClientsView />}
            {active === "traffic" && <TrafficView />}
            {active === "crm" && <CRMView />}
            {active === "schedule" && <ScheduleView />}
            {active === "team" && <TeamView />}
            {active === "finance" && <FinanceView />}
            {active === "contracts" && <ContractsView />}
            {active === "reports" && <ReportsView />}
          </div>
        </div>
      </main>

      <CommandPalette type="admin" onNavigate={setActive} />
    </div>
  );
}
