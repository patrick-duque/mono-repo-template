import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      src: path.resolve('src'),
      utils: path.resolve('src/utils'),
      ui: path.resolve('src/ui'),
      modules: path.resolve('src/modules'),
      assets: path.resolve('src/assets'),
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
