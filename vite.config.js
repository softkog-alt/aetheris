import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  root: '.',
  // GitHub Pages sub-path: https://<user>.github.io/aetheris/
  // Use conditional base so local `npm run dev` continues to work cleanly at /
  // Production builds get /aetheris/ prefix for correct asset loading (JS, CSS, PNGs)
  base: mode === 'production' ? '/aetheris/' : '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  }
}));
