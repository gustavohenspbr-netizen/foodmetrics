import React from "react";
import { createRoot } from "react-dom/client";
import { AdminPage } from "../pages/Admin";
import { ThemeProvider } from "../context/ThemeContext";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AdminPage />
    </ThemeProvider>
  </React.StrictMode>
);
