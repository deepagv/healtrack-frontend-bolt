import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Basic check to verify the server is up.
 */
router.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'healtrack-server',
    time: new Date().toISOString()
  });
});

export default router;
