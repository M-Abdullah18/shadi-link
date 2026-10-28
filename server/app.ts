import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AdminAuthState, createAdminAuthRouter } from './auth';

/**
 * Creates and configures the Express API application with all security middleware,
 * authentication routes, and health checks WITHOUT starting the HTTP listener or Vite.
 *
 * Used by:
 * - server.ts (for local development and AI Studio full-stack server)
 * - api/index.ts (for Vercel serverless function entrypoint)
 */
export function createApp(authState: AdminAuthState): Express {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  // Trust proxy for rate-limiting behind reverse proxies (Vercel, Cloud Run, Nginx)
  app.set('trust proxy', 1);

  // Security headers via Helmet (disable CSP to prevent blocking Vite client/HMR scripts in dev)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Cookie parser using session secret
  app.use(cookieParser(authState.sessionSecret));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API router
  const apiRouter = express.Router();

  // Mount Admin Authentication routes (/api/admin/login, /api/admin/logout, /api/admin/me)
  apiRouter.use('/admin', createAdminAuthRouter());

  // Health check endpoint
  apiRouter.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'ShaadiLink Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      supportedLanguages: ['en', 'ur'],
      database: {
        configured: !!process.env.MONGODB_URI,
        type: 'MongoDB',
        // Remains "not_configured" while there is no real DB connection, even if MONGODB_URI is set.
        // It will become "connected" only after a real connection check in Step 3.
        status: 'not_configured'
      }
    });
  });

  app.use('/api', apiRouter);

  // Error handling middleware for API routes
  app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Log full error details on the server only, never leaking to client
    console.error('API Error:', err);
    if (isProd) {
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Something went wrong'
      });
    } else {
      res.status(500).json({
        error: 'InternalServerError',
        message: err.message || 'An unexpected server error occurred'
      });
    }
  });

  return app;
}
