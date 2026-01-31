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
    base: '/', // Use absolute path to ensure correct asset loading from subpaths
    publicDir: 'public',
    server: {
      host: "::",
      port: 3001, // Use port 3001 to match dashboard links
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
      // Output to 'dist' for static site deployment (Render, Netlify, Vercel, etc.)
      // For combined server deployment, set BUILD_FOR_BACKEND=true to output to ../backend/build
      outDir: process.env.BUILD_FOR_BACKEND === 'true' ? '../backend/build' : 'dist',
      emptyOutDir: true, // Clear the build directory before building
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
    // When served from same server, use empty string for relative URLs
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL || 'http://localhost:5001'),
    },
  };
});
