import { Express, Request, Response } from 'express';
import { initializeAdminAuth, AdminAuthState } from '../server/auth.js';
import { createApp } from '../server/app.js';

// Cache the Express app and initialized auth across serverless invocations
let cachedAppPromise: Promise<Express> | null = null;

async function getVercelApp(): Promise<Express> {
  if (!cachedAppPromise) {
    cachedAppPromise = (async () => {
      try {
        const authState: AdminAuthState = await initializeAdminAuth();
        return createApp(authState);
      } catch (err: any) {
        // Reset cached promise so the next request retries
        cachedAppPromise = null;
        throw err;
      }
    })();
  }
  return cachedAppPromise;
}

/**
 * Default serverless function handler for Vercel.
 * Reuses the cached Express app instance across warm serverless invocations.
 */
export default async function handler(req: Request, res: Response) {
  try {
    const app = await getVercelApp();
    return app(req, res);
  } catch (err: any) {
    // Check which required environment variable is missing without ever logging secrets
    const missing: string[] = [];
    if (!process.env.ADMIN_EMAIL?.trim()) missing.push('ADMIN_EMAIL');
    if (!process.env.ADMIN_PASSWORD) {
      missing.push('ADMIN_PASSWORD');
    } else if (process.env.ADMIN_PASSWORD.length < 12) {
      missing.push('ADMIN_PASSWORD (minimum 12 characters required in production)');
    }
    if (!process.env.SESSION_SECRET?.trim()) missing.push('SESSION_SECRET');

    console.error(
      `[ShaadiLink Server Error] Vercel Serverless Function initialization failed. Missing or invalid required environment variable(s): ${
        missing.length > 0 ? missing.join(', ') : err?.message || 'Configuration error'
      }`
    );

    res.status(500).json({
      error: 'ServerNotConfigured',
      message: 'Service is temporarily unavailable'
    });
  }
}
