/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async () => {
  const { default: dyadComponentTagger } = await import("@dyad-sh/react-vite-component-tagger");
  return {
    root: './', // Explicitly set root to the frontend directory
    base: './', // Use relative paths for assets
    publicDir: 'public',
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react()],
    test: {
      globals: true,
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist', // Output to a 'dist' directory within frontend
    },
  };
});
