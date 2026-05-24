import React from "react";
import { createRoot } from "react-dom/client";
import { ClientDashboard } from "../pages/Dashboard";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <ClientDashboard />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
