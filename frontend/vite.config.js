import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ["recharts"],
    },
    server: {
      host: '0.0.0.0',  // ← AJOUT IMPORTANT : Écoute sur toutes les interfaces
      port: 5173,
      proxy: {
        "/api": {
          target: `http://localhost:${env.PORT || 5001}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});