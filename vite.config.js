import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

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
    rollupOptions: {
      // Multi-page: the live site plus the standalone Scene-5 prototypes.
      // proto-a = Fleet Console, proto-b = Holographic HUD (each a complete
      // 5a/5b/5c flow under src/proto-a|b/). proto-5a/5b/5c are the newer
      // per-scene prototypes built sideways (cinematic horizontal auto-pan);
      // 5a is the detailed X-ray-scan build, 5b/5c are placeholders for now.
      // The old Scene 1→2 morph prototype (proto-morph.html) has been removed.
      input: {
        main: path.resolve(root, 'index.html'),
        protoA: path.resolve(root, 'proto-a.html'),
        protoB: path.resolve(root, 'proto-b.html'),
        proto5a: path.resolve(root, 'proto-5a.html'),
        proto5b: path.resolve(root, 'proto-5b.html'),
        proto5c: path.resolve(root, 'proto-5c.html'),
      },
    },
  },
});
