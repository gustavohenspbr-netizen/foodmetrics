import React from "react";
import { createRoot } from "react-dom/client";
import { LoginPage } from "../pages/Login";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
