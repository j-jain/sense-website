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

- **Node.js 20.19+** (Node 20 LTS recommended; required by Vite 8). Pinned via `engines` in `package.json` so the Azure build uses Node 20.x.
- npm (ships with Node)

## Install, run, build

```bash
npm install        # install dependencies
npm run dev        # dev server with HMR → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Environment variables

The **frontend** needs none to build or run. The **demo-form API** (`/api`) needs a
storage connection string — see [`.env.example`](.env.example) and "Demo form / API" below.

## Demo form / API

The "Request a Demo" CTA opens a modal (`src/shared/demo-form.js` + `src/styles/demo-form.css`,
loaded via `setup.js`) that POSTs to an **Azure Static Web Apps managed Function** at
`POST /api/demo-request` (`api/src/functions/demo-request.js`, Functions v4 / Node 20). The
Function validates the payload (+ a honeypot field) and writes each lead to an **Azure Table**
(`demosubmissions`) in the storage account named by the connection string.

**Required app setting** (Portal → Static Web App → Settings → Configuration → Application
settings): `STORAGE_CONNECTION_STRING` = the storage account's connection string. Optional
`DEMO_TABLE_NAME` (defaults to `demosubmissions`). The table is auto-created on first submit.
For local function dev, place these in `api/local.settings.json` (git-ignored).

## Project structure

```
index.html              thin shell: <head>, nav, scroll indicator, the module <script>,
                        and <!-- include: ... --> markers for each scene
vite.config.js          Vite config + a small built-in HTML-include helper
staticwebapp.config.json  (in public/) Azure SWA headers (CSP, HSTS, etc.) + SPA fallback
public/                 static assets served as-is (poster image, robots.txt, sitemap.xml)
api/                    Azure SWA managed Function — POST /api/demo-request → Azure Table
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
