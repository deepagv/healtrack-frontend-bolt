# HealTrack Frontend (Design Export)

This repo contains the Figma-exported frontend code and assets.

## Structure
- `src/` – code (components, styles, utils, supabase client, App.tsx)
- `web/` – new Vite React app that imports and uses the design export
- `public/assets/` – images, icons, fonts (add later as needed)
- `docs/` – design docs (ATTRIBUTIONS.md, guidelines)

> Note: This is a design export. It may need a build tool (like React/Vite) to run as a site.

## How to Run

### 1. Start the API Server
```bash
cd server
npm ci
npm run dev
# → API server runs on http://localhost:3001
```

### 2. Start the Web App
```bash
cd web

# copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials if different

npm ci
npm run dev
# → Web app runs on http://localhost:5173
```

The web app imports components from the design export via the `@design` alias and provides routing between different screens.

---

## HealTrack Server (Node + Express + TypeScript)

A small API lives in `server/` to support the app.

### Requirements
- Node.js 18+ (20+ recommended)
- npm 9+

### Quick start (local)
```bash
# from repo root
cd server

# copy example env and edit if needed
cp .env.example .env

# install exact deps (uses package-lock.json)
npm ci

# run in dev mode (auto restarts)
npm run dev
# → Server listens on http://localhost:3001

# Port for the API server
PORT=3001

# Optional: comma separated list of allowed origins for CORS
# Leave empty during local dev to allow all
# CORS_ORIGIN=http://localhost:5173,https://your-domain.com
