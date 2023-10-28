import { defineConfig } from "vite";
import path, { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, "index.ts"),
      name: "fsPlayer",
    },
  },
});
