import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeAdminAuth } from './server/auth.js';
import { createApp } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // The Node.js app must listen on port 3000 (or DEFAULT_APP_PORT).
  // In Cloud Run / container, Nginx reverse proxies from 8080 to 3000.
  const PORT = process.env.DEFAULT_APP_PORT
    ? parseInt(process.env.DEFAULT_APP_PORT, 10)
    : 3000;

  // Initialize Admin Authentication in memory
  // Reads ADMIN_EMAIL & ADMIN_PASSWORD, hashes with bcrypt (cost 12), and purges plain text
  const authState = await initializeAdminAuth();

  // Create core Express application with middleware and API routes
  const app = createApp(authState);

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
