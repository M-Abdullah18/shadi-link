import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AdminAuthState, createAdminAuthRouter } from './auth.js';
import { pingDb } from './db.js';
import { createPublicImageRouter, createAdminImageRouter } from './routes/images.js';
import { createAdminWeddingsRouter } from './routes/weddings.js';
import { createAdminDesignsRouter } from './routes/designs.js';

/**
 * Creates and configures the Express API application with all security middleware,
 * database-backed wedding/image routes, admin auth, and health checks WITHOUT
 * starting the HTTP listener or Vite.
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
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Cookie parser using session secret
  app.use(cookieParser(authState.sessionSecret));

  // Mount raw body parser specifically for image upload route (max 1 MB) before standard JSON parser
  app.use(
    '/api/admin/images',
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'],
      limit: '1mb',
    })
  );

  // Standard JSON and URL-encoded body parsers for all other routes
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API router
  const apiRouter = express.Router();

  // Mount Public image route (/api/images/:id)
  apiRouter.use('/images', createPublicImageRouter());

  // Mount Admin Authentication routes (/api/admin/login, /api/admin/logout, /api/admin/me)
  apiRouter.use('/admin', createAdminAuthRouter());

  // Mount Admin Image routes (/api/admin/images)
  apiRouter.use('/admin/images', createAdminImageRouter());

  // Mount Admin Wedding CRUD routes (/api/admin/weddings)
  apiRouter.use('/admin/weddings', createAdminWeddingsRouter());

  // Mount Admin Design Registry route (/api/admin/designs)
  apiRouter.use('/admin/designs', createAdminDesignsRouter());

  // Health check endpoint with real MongoDB ping
  apiRouter.get('/health', async (_req: Request, res: Response) => {
    const dbStatus = await pingDb();

    res.status(200).json({
      status: 'ok',
      service: 'ShaadiLink Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      supportedLanguages: ['en', 'ur'],
      database: {
        configured: Boolean(process.env.MONGODB_URI),
        type: 'MongoDB',
        status: dbStatus,
      },
    });
  });

  app.use('/api', apiRouter);

  // Error handling middleware for API routes (never leaks stack or sensitive details in prod)
  app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    if (isProd) {
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Something went wrong',
      });
    } else {
      res.status(500).json({
        error: 'InternalServerError',
        message: err.message || 'An unexpected server error occurred',
      });
    }
  });

  return app;
}
