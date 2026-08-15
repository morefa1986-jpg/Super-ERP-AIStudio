import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: {
        ignored: ['**/sturgeon_database.json', '**/sturgeon_database.json**', '**/node_modules/**', '**/dist/**']
      },
    },
    build: {
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('motion')) return 'vendor-motion';
              return 'vendor-core';
            }
            if (id.includes('/src/components/PoolQuickLogger')) return 'pool-logger';
            if (id.includes('/src/components/SidebarDashboard')) return 'sidebar';
            if (id.includes('/src/components/DashboardStats')) return 'dashboard-stats';
            return undefined;
          },
        },
      },
    },
  };
});
