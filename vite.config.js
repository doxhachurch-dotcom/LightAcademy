import { defineConfig } from 'vite';

// Application statique : index.html à la racine, sortie dans dist/
export default defineConfig({
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  server: { host: true, port: 5173 },
  publicDir: false,
});
