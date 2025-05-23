import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      include: '**/*.svg',
    }),
  ],
  server: {
    port: 3001,
    open: '/',
  },
  preview: {
    port: 3001,
  },
  css: {},
});
