import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Note: changed from @vitejs/plugin-react-swc
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  
  optimizeDeps: {
    exclude: ["@mlc-ai/web-llm"],
  },
  
  build: {
    target: "es2020",
  },
  
  server: {
    port: 3000,
    host: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
