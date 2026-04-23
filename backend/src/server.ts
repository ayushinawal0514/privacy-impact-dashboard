import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler, requestLogger, authMiddleware } from './middleware/middlewares';

import risksRouter from './routes/risks';
import accessLogsRouter from './routes/access-logs';
import complianceRouter from './routes/compliance';
import auditReportsRouter from './routes/audit-reports';
import alertsRouter from './routes/alerts';
import dashboardRouter from './routes/dashboard';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import reportRouter from './routes/report';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = '/api';

// ==================
// GLOBAL MIDDLEWARE
// ==================
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, curl, Postman, health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// ==================
// PUBLIC ROUTES
// ==================
app.get('/', (_req: Request, res: Response) => {
  return res.json({
    message: 'Healthcare Privacy Compliance API',
    version: '1.0.0',
    healthCheck: '/api/health',
  });
});

app.use(`${API_PREFIX}/health`, healthRouter);
app.use(`${API_PREFIX}/auth`, authRouter);

// ==================
// AUTHENTICATED ROUTES
// ==================
app.use(authMiddleware);

// Role-based access is enforced inside individual route files
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);
app.use(`${API_PREFIX}/upload`, uploadRouter);
app.use(`${API_PREFIX}/risks`, risksRouter);
app.use(`${API_PREFIX}/access-logs`, accessLogsRouter);
app.use(`${API_PREFIX}/compliance`, complianceRouter);
app.use(`${API_PREFIX}/audit-reports`, auditReportsRouter);
app.use(`${API_PREFIX}/alerts`, alertsRouter);
app.use(`${API_PREFIX}/report`, reportRouter);

// ==================
// 404 HANDLER
// ==================
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ==================
// ERROR HANDLER
// ==================
app.use(errorHandler);

// ==================
// START SERVER
// ==================
const startServer = async () => {
  try {
    await connectDB();
    console.log('✓ Database connected successfully');
    console.log('✓ Allowed CORS origins:', allowedOrigins);

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API prefix: ${API_PREFIX}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;