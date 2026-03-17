import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router') || id.includes('@emotion')) {
              return 'vendor-react';
            }
            if (id.includes('@mui/icons-material')) {
              return 'vendor-mui-icons';
            }
            if (id.includes('@mui')) {
              return 'vendor-mui';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf';
            }
          }
        },
      },
    },
  },
});
