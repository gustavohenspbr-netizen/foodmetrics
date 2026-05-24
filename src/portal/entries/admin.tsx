import React from "react";
import { createRoot } from "react-dom/client";
import { AdminPage } from "../pages/Admin";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AdminPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
