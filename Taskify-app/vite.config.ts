// ============================================================
// ARCHIVO: vite.config.ts (Proxy Nativo Integrado)
// ============================================================
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // CONFIGURAMOS EL SERVIDOR LOCAL PARA ENLAZAR CON VERCEL SERVERLESS
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Redirige las llamadas de la API al motor de Vercel
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
