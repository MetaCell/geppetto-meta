import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const PORT = 9000;

export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      sourcemap: true,
    },
    server: {
      compress: true,
      port: Number(PORT),
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/resources": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
