import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import accountRouter from './routes/account';
import accountRouter from './routes/account';

const app = express();

/* ---------- Middleware ---------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allowlist via CORS_ORIGIN="http://a.com,http://b.com"
// If not set, allow all (easy for development).
const allowlist = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .concat(['http://localhost:5173']); // Always allow Vite dev server
  .concat(['http://localhost:5173']); // Always allow Vite dev server

if (allowlist.length > 0) {
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true); // non-browser or same-origin
        if (allowlist.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

/* ---------- Routes ---------- */
// Root
app.get('/', (_req: Request, res: Response) => {
  res.send('HealTrack API is up. Try /api/health or /api/ping');
});

// Simple ping
app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({ pong: true });
});

// Health sub-router
app.use('/api/health', healthRouter);

// Account management sub-router
app.use('/api/account', accountRouter);

// Account management sub-router
app.use('/api/account', accountRouter);

/* ---------- 404 + Error handling ---------- */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  const status = (err as any)?.status ?? 500;
  console.error(err);
  res.status(status).json({ error: message });
});

/* ---------- Start server ---------- */
const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`HealTrack server listening on http://localhost:${PORT}`);
});
