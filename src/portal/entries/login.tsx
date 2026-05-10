import React from "react";
import { createRoot } from "react-dom/client";
import { LoginPage } from "../pages/Login";
import { ThemeProvider } from "../context/ThemeContext";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  </React.StrictMode>
);
