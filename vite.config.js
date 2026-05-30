import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Tiny built-in HTML include (no third-party plugin).
// Replaces `<!-- include: relative/path.html -->` in index.html with the file's
// contents at dev-serve and build time, so each scene's markup lives in its own
// partial. Runs 'pre' so Vite still processes assets/scripts inside the partials.
function htmlIncludes() {
  return {
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const re = /<!--\s*include:\s*(.+?)\s*-->/g;
        let out = html, prev;
        do {
          prev = out;
          out = out.replace(re, (_, rel) =>
            fs.readFileSync(path.resolve(process.cwd(), rel.trim()), 'utf8')
          );
        } while (out !== prev); // resolve any nested includes
        return out;
      },
    },
    // reload the page when a partial changes during dev
    handleHotUpdate({ file, server }) {
      if (file.includes(`${path.sep}scenes${path.sep}`) && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

// Plain static site (vanilla HTML + GSAP). No framework.
export default defineConfig({
  plugins: [htmlIncludes()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
