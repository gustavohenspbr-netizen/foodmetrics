import React from "react";
import { createRoot } from "react-dom/client";
import { ClientDashboard } from "../pages/Dashboard";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ClientDashboard />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
