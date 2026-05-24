import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { CommandPalette } from "../components/CommandPalette";
import { MOCK_CLIENT_USER } from "../lib/mockData";
import { useSession, useProfile, redirectByRole } from "../lib/auth";
import { DashboardView } from "../views/client/DashboardView";
import { GoogleAdsView } from "../views/client/GoogleAdsView";
import { MetaAdsView } from "../views/client/MetaAdsView";
import { IfoodView } from "../views/client/IfoodView";
import { GMBView } from "../views/client/GMBView";
import { SiteView } from "../views/client/SiteView";
import { StrategyView } from "../views/client/StrategyView";
import { ClientCRMView } from "../views/client/ClientCRMView";
import { MaterialsView } from "../views/client/MaterialsView";
import { MessagesView } from "../views/client/MessagesView";
import { ClientReportsView } from "../views/client/ClientReportsView";
import { ClientFinanceView } from "../views/client/ClientFinanceView";

export function ClientDashboard() {
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
    // Se for staff, manda pro painel admin
    if (profile && ["admin", "manager", "support"].includes(profile.role)) {
      redirectByRole(profile.role);
    }
  }, [user, profile, loading]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="w-12 h-12 rounded-full border-4 border-[#e01c1c]/20 border-t-[#e01c1c] animate-spin" />
      </div>
    );
  }

  const client = {
    ...MOCK_CLIENT_USER,
    ownerName: profile?.full_name ?? MOCK_CLIENT_USER.ownerName,
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="client" active={active} setActive={setActive} clientInfo={client} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          type="client"
          active={active}
          clientName={client.restaurant}
          currentUser={profile ? { name: profile.full_name ?? profile.email, email: profile.email, role: "Cliente" } : undefined}
        />

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {active === "dashboard" && <DashboardView />}
            {active === "google-ads" && <GoogleAdsView />}
            {active === "meta-ads" && <MetaAdsView />}
            {active === "ifood" && <IfoodView />}
            {active === "gmb" && <GMBView />}
            {active === "site" && <SiteView />}
            {active === "strategy" && <StrategyView />}
            {active === "crm" && <ClientCRMView />}
            {active === "materials" && <MaterialsView />}
            {active === "messages" && <MessagesView />}
            {active === "reports" && <ClientReportsView />}
            {active === "finance" && <ClientFinanceView />}
          </div>
        </div>
      </main>

      <CommandPalette type="client" onNavigate={setActive} />
    </div>
  );
}
