import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const srcPath = decodeURIComponent(new URL('./src', import.meta.url).pathname).replace(
  /^\/([A-Za-z]:)/,
  '$1'
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
});
