# DENSO sense — Platform Website

A cinematic, scroll-driven single-page website for **DENSO sense**, positioning the
commercial-vehicle diagnostics product as an *Intelligent Uptime Ecosystem*. The
experience follows one truck's journey across India, introducing the platform through
scene-by-scene motion design.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Build tool | **Vite** | `vite build` → static `dist/` |
| Markup/styles/logic | **Vanilla HTML / CSS / JS** | No framework, no Tailwind — hand-coded for precise scroll control |
| Animation | **GSAP 3.12.5** + **ScrollTrigger** | self-hosted via npm |
| Smooth scroll | **Lenis 1.1.14** | self-hosted via npm |
| Fonts | **@fontsource** (Outfit, Inter, Barlow, JetBrains Mono, Bebas Neue) | self-hosted via npm — no Google Fonts CDN |

All runtime dependencies are bundled — the site loads **no third-party CDNs**. (The hero
video is currently served from Cloudflare R2; migration to Azure Blob Storage is planned.)

## Prerequisites

- **Node.js 18+** (Node 20 LTS recommended)
- npm (ships with Node)

## Install, run, build

```bash
npm install        # install dependencies
npm run dev        # dev server with HMR → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Environment variables

None required to build or run. See [`.env.example`](.env.example) — a placeholder is
reserved for the future demo-form submission destination.

## Project structure

```
index.html              thin shell: <head>, nav, scroll indicator, the module <script>,
                        and <!-- include: ... --> markers for each scene
vite.config.js          Vite config + a small built-in HTML-include helper
staticwebapp.config.json  Azure Static Web Apps headers (CSP, HSTS, etc.) + SPA fallback
public/                 static assets served as-is (poster image, robots.txt, sitemap.xml)
src/
  main.js               imports shared setup, then each scene's JS — in scroll order
  main.css              @imports fonts, tokens, base, then each scene's CSS — in cascade order
  shared/
    setup.js            GSAP register + Lenis init; exposes gsap/ScrollTrigger/Lenis on window
    scene5-autoplay.js  Scene 5 autoplay sequencer + handoff
    transitions.css     shared blackout beat + running timer
  styles/
    fonts.css           self-hosted @fontsource @font-face imports
    tokens.css          brand colors / spacing tokens
    base.css            reset, type, nav, buttons
    responsive.css      shared @media block
  scenes/<scene>/       one folder per scene: <scene>.html + .css + .js
```

**One scene = one folder.** To change a scene, edit its three files under
`src/scenes/<scene>/`. An element's `id` ties its HTML, CSS, and JS together — rename it
in all three. Scene order is mirrored in three places that must stay in sync:
`index.html` includes, `src/main.js` imports, and `src/main.css` `@import`s.

## Deployment

Static build (`dist/`). Targets Azure Static Web Apps — `staticwebapp.config.json` pins
the security headers and navigation fallback. The CSP must be re-validated at the Azure
cutover and tightened once media moves off Cloudflare R2 to Azure Blob Storage.
