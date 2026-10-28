import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { initializeAdminAuth, createAdminAuthRouter } from './server/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  // The Node.js app must listen on port 3000 (or DEFAULT_APP_PORT).
  // In Cloud Run / container, Nginx reverse proxies from 8080 to 3000.
  const PORT = process.env.DEFAULT_APP_PORT
    ? parseInt(process.env.DEFAULT_APP_PORT, 10)
    : 3000;

  // Trust proxy for rate-limiting behind reverse proxies/Cloud Run
  app.set('trust proxy', 1);

  // Security headers via Helmet (disable CSP to prevent blocking Vite client/HMR scripts in dev)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Initialize Admin Authentication in memory
  // Reads ADMIN_EMAIL & ADMIN_PASSWORD, hashes with bcrypt (cost 12), and purges plain text
  const authState = await initializeAdminAuth();

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

  // Frontend integration: Vite middleware in dev, static files in prod
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[ShaadiLink] dist directory not found in production. Fallback to basic operational page.');
      app.get('*', (_req: Request, res: Response) => {
        res.status(200).send('<!doctype html><html><body><h1>ShaadiLink</h1><p>Application is operational.</p></body></html>');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShaadiLink] Server listening on port ${PORT} (dev: ${!isProd})`);
  });
}

startServer().catch((error) => {
  console.error('[ShaadiLink] Failed to start server:', error);
  process.exit(1);
});
