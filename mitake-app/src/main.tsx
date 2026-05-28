// ============================================================
// ARCHIVO: src/main.tsx
// ¿Para qué sirve? Punto de entrada de la aplicación.
// Agregamos AlertProvider para que toda la app pueda
// disparar alertas desde cualquier componente.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AlertProvider } from "./context/AlertContext";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* AlertProvider envuelve toda la app — las alertas
        funcionan en cualquier componente hijo */}
    <AlertProvider>
      <App />
    </AlertProvider>
  </StrictMode>
);