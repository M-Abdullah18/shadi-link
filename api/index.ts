import { Express, Request, Response } from 'express';
import { initializeAdminAuth, AdminAuthState } from '../server/auth';
import { createApp } from '../server/app';

// Cache the Express app and initialized auth across serverless invocations
let cachedAppPromise: Promise<Express> | null = null;

async function getVercelApp(): Promise<Express> {
  if (!cachedAppPromise) {
    cachedAppPromise = (async () => {
      const authState: AdminAuthState = await initializeAdminAuth();
      return createApp(authState);
    })();
  }
  return cachedAppPromise;
}

/**
 * Default serverless function handler for Vercel.
 * Reuses the cached Express app instance across warm serverless invocations.
 */
export default async function handler(req: Request, res: Response) {
  const app = await getVercelApp();
  return app(req, res);
}
