import React from "react";
import { createRoot } from "react-dom/client";
import { LoginPage } from "../pages/Login";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
