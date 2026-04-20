import { Router, Request, Response } from 'express';
import logger from '../config/logger';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Healthcare Privacy Compliance API',
    version: '1.0.0',
    status: 'operational'
  });
});

export default router;
