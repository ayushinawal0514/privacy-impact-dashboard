import { Router, Response } from 'express';

const router = Router();

router.get('/', (_req, res: Response) => {
  return res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

router.get('/status', (_req, res: Response) => {
  return res.json({
    success: true,
    service: 'Healthcare Privacy Compliance API',
    version: '1.0.0',
    status: 'operational'
  });
});

export default router;
