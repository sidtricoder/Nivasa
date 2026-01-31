import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy Replicate API calls to bypass CORS
      '/api/replicate': {
        target: 'https://api.replicate.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
        headers: {
          'Origin': 'https://api.replicate.com',
        },
      },
      // Proxy Hugging Face API calls to bypass CORS (FREE tier!)
      '/api/huggingface': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/huggingface/, ''),
        headers: {
          'Origin': 'https://huggingface.co',
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunking for better caching and faster loads
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase in its own chunk (large library)
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // UI components chunk
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
          ],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Charts library
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Enable minification and tree-shaking
    minify: 'esbuild',
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
}));
