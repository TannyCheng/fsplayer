import { defineConfig } from "vite";
import path from "path";

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
  build: {
    target: "es2015",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "fsplayer",
      fileName: (format) => `fs-player.${format}.js`,
    },
    outDir: path.resolve(__dirname, "dist"),
    sourcemap: true,
  },
});
