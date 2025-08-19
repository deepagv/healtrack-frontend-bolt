import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow specific origins if set, otherwise allow all (easy dev)
const origins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
if (origins && origins.length) {
  app.use(cors({ origin: origins }));
} else {
  app.use(cors());
}

// Routes
app.use('/api/health', healthRouter);

// Simple ping
app.get('/api/ping', (_req, res) => res.json({ pong: true }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`HealTrack server listening on http://localhost:${PORT}`);
});
