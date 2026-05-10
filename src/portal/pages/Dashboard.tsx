import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { MOCK_CLIENT_USER } from "../lib/mockData";
import { DashboardView } from "../views/client/DashboardView";
import { GoogleAdsView } from "../views/client/GoogleAdsView";
import { MetaAdsView } from "../views/client/MetaAdsView";
import { IfoodView } from "../views/client/IfoodView";
import { ClientCRMView } from "../views/client/ClientCRMView";
import { ClientFinanceView } from "../views/client/ClientFinanceView";
import { ClientReportsView } from "../views/client/ClientReportsView";

export function ClientDashboard() {
  const [active, setActive] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const client = MOCK_CLIENT_USER;

  useEffect(() => {
    setMounted(true);
    const role = sessionStorage.getItem("fm_role");
    if (!role) window.location.href = "/login.html";
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <Sidebar type="client" active={active} setActive={setActive} clientInfo={client} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar type="client" active={active} clientName={client.restaurant} />

        <div className="flex-1 overflow-y-auto p-10 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {active === "dashboard" && <DashboardView />}
            {active === "google-ads" && <GoogleAdsView />}
            {active === "meta-ads" && <MetaAdsView />}
            {active === "ifood" && <IfoodView />}
            {active === "crm" && <ClientCRMView />}
            {active === "finance" && <ClientFinanceView />}
            {active === "reports" && <ClientReportsView />}
          </div>
        </div>
      </main>
    </div>
  );
}
