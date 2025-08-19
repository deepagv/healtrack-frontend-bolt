# HealTrack Frontend (Design Export)

This repo contains the Figma-exported frontend code and assets.

## Structure
- `src/` – code (components, styles, utils, supabase client, App.tsx)
- `public/assets/` – images, icons, fonts (add later as needed)
- `docs/` – design docs (ATTRIBUTIONS.md, guidelines)

> Note: This is a design export. It may need a build tool (like React/Vite) to run as a site.

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
