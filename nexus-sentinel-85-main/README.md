# CyberResearch‑X — NEXSUS SOC Command Center

An AI cybersecurity operations command center: CEO orchestrator agent ("Archon"), an 8‑specialist agent hierarchy, live case/IOC management, event streaming, and a customizable dashboard — served by an Express backend with a Vite/React frontend.

## Prerequisites

- Node.js 20+ (Node 22 recommended)

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and fill in real secrets:
   ```bash
   cp .env.example .env.local
   ```
   - `GEMINI_API_KEY` — optional. Without it the AI endpoints run in a deterministic fallback mode instead of calling Gemini.
   - `JWT_SECRET` / `CSRF_SECRET` — set these to long random strings in any real deployment. If left blank, the server generates a fresh random secret on every boot (fine for local dev, but it means sessions won't survive a restart).
   - `ADMIN_INITIAL_PASSWORD` / `ANALYST_INITIAL_PASSWORD` / `VIEWER_INITIAL_PASSWORD` — override the built‑in demo passwords for the seeded operator accounts before deploying anywhere public.
3. Start the dev server (Express + Vite middleware, with HMR):
   ```bash
   npm run dev
   ```
   The app is served at http://localhost:3000.

## Production build

```bash
npm run build   # builds the client (dist/) and bundles the server (dist/server.cjs)
npm start       # runs the built server with NODE_ENV=production
```

## Deploy with Docker

```bash
docker build -t nexsus-soc .
docker run -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -e CSRF_SECRET="$(openssl rand -hex 32)" \
  -e GEMINI_API_KEY="your-key-here" \
  nexsus-soc
```

The container listens on port 3000 and serves both the API (`/api/*`) and the built static frontend.

## Notes for a real production rollout

- The seeded operator accounts (Admin/Analyst/Viewer) use demo passwords by default — override them via env vars as shown above before exposing the app publicly.
- Set `ALLOWED_ORIGINS` (comma‑separated) if the frontend and API will ever be served from different origins; otherwise same‑origin requests are allowed automatically.
- `GEMINI_API_KEY` is only read server‑side (`server/aiService.ts`) and is never exposed to the browser.
