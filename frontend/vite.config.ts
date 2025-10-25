/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(async ({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  const { default: dyadComponentTagger } = await import("@dyad-sh/react-vite-component-tagger");
  return {
    root: './', // Explicitly set root to the frontend directory
    base: '/', // Use absolute paths for better routing support
    publicDir: 'public',
    server: {
      host: "::",
      port: 3000, // Use standard port 3000
      strictPort: false, // Allow fallback to another port if needed
    },
    plugins: [
      dyadComponentTagger(),
      react(),
      viteStaticCopy({
        targets: [
          {
            src: "public/_redirects",
            dest: "",
          },
        ],
      }),
    ],
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
      sourcemap: mode === 'development', // Source maps only in dev
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
    // Define environment variables with fallbacks to prevent blank screens
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:5001'),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL || 'http://localhost:3000'),
    },
  };
});
