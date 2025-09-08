import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'index.html',
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          papaparse: ['papaparse']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['papaparse']
  },
  define: {
    global: 'globalThis',
  }
});
