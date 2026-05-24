import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { CommandPalette } from "../components/CommandPalette";
import { useSession, useProfile } from "../lib/auth";
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
  const { user, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();
  const loading = sessionLoading || profileLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login.html";
      return;
    }
    // Bloqueia clientes — só staff entra aqui
    if (profile && !["admin", "manager", "support"].includes(profile.role)) {
      window.location.href = "/dashboard.html";
    }
  }, [user, profile, loading]);

  if (loading || !user || (profile && !["admin", "manager", "support"].includes(profile.role))) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="w-12 h-12 rounded-full border-4 border-[#e01c1c]/20 border-t-[#e01c1c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="admin" active={active} setActive={setActive} pendingCount={2} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          type="admin"
          active={active}
          pendingCount={2}
          currentUser={
            profile
              ? {
                  name: profile.full_name ?? profile.email,
                  email: profile.email,
                  role: profile.role === "admin" ? "Founder / CEO" : profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
                }
              : undefined
          }
        />

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
