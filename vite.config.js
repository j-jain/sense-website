import { defineConfig } from 'vite';

// Plain static site (vanilla HTML + GSAP). No framework.
// `index.html` at the project root is the entry point.
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
