# HealTrack Server (Node + Express + TypeScript)

A backend API server for the HealTrack health tracking application.

## Requirements
- Node.js 18+ (20+ recommended)
- npm 9+
- Supabase project with service role key

## Quick Start

### 1. Environment Setup
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration:
# - Set PORT (default: 3001)
# - Set CORS_ORIGIN for production (optional for dev)
# - Add your Supabase URL and service role key
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Start Development Server
```bash
npm run dev
# → Server listens on http://localhost:3001
```

## Environment Variables

### Required
- `SUPABASE_URL`: Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in Project Settings > API)

### Optional
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Comma-separated list of allowed origins for CORS (leave empty for development)

## API Endpoints

### Health Check
- `GET /` - Basic server status
- `GET /api/ping` - Simple ping/pong response
- `GET /api/health` - Detailed health check

### Account Management
- `DELETE /api/account/delete` - Permanently delete user account and all data
  - Requires: `Authorization: Bearer <access_token>` header
  - Deletes all user data from database tables
  - Removes user from Supabase Auth

## Running with Web App

### Terminal 1: Start API Server
```bash
cd server
npm ci
npm run dev
# → API server runs on http://localhost:3001
```

### Terminal 2: Start Web App
```bash
cd web
npm ci
npm run dev
# → Web app runs on http://localhost:5173
```

The web app will automatically connect to the API server for account management operations.

## Security Notes

- The service role key has admin privileges - keep it secure
- Never expose the service role key in client-side code
- Account deletion is permanent and cannot be undone
- All user data is deleted when an account is removed

## Production Deployment

1. Set environment variables in your hosting platform
2. Update `CORS_ORIGIN` to include your production domain
3. Ensure Supabase project is configured for production use
4. Consider implementing rate limiting for the delete endpoint