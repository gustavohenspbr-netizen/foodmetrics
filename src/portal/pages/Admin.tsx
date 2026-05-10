import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { DashboardView } from "./views/admin/DashboardView";
import { ClientsView } from "./views/admin/ClientsView";
import { CRMView } from "./views/admin/CRMView";
import { FinanceView } from "./views/admin/FinanceView";
import { ReportsView } from "./views/admin/ReportsView";
import { ScheduleView } from "./views/admin/ScheduleView";

export function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("fm_role");
    if (role !== "admin") window.location.href = "/login.html";
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
            {active === "crm" && <CRMView />}
            {active === "finance" && <FinanceView />}
            {active === "reports" && <ReportsView />}
            {active === "schedule" && <ScheduleView />}
          </div>
        </div>
      </main>
    </div>
  );
}
