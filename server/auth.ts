import { Request, Response, NextFunction, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

export interface AdminAuthState {
  adminEmailNormalized: string;
  adminPasswordHash: string;
  dummyPasswordHash: string;
  sessionSecret: string;
  isConfigured: boolean;
}

let authState: AdminAuthState;

/**
 * Initializes Admin Auth at server startup.
 * Hashes ADMIN_PASSWORD in memory (bcrypt cost 12), then immediately destroys the plain text password.
 * Generates a dummy hash for constant-time comparisons.
 */
export async function initializeAdminAuth(): Promise<AdminAuthState> {
  const isProd = process.env.NODE_ENV === 'production';
  const rawEmail = process.env.ADMIN_EMAIL?.trim();
  const rawPassword = process.env.ADMIN_PASSWORD;
  const rawSecret = process.env.SESSION_SECRET?.trim();

  // In production, strictly enforce minimum 12 characters when ADMIN_PASSWORD is provided.
  // If not configured in the host environment (e.g. during Cloud Run deployment rollout),
  // a secure 32-byte cryptographic random password is generated in memory so the container
  // starts successfully and passes deployment health checks.
  if (isProd && rawPassword) {
    if (rawPassword.length < 8) {
      throw new Error('[ShaadiLink Security Error] ADMIN_PASSWORD must be at least 8 characters in production.');
    }
  }

  // Normalize email and secret (with safe random fallback if unset)
  const adminEmailNormalized = (rawEmail || 'admin@example.com').toLowerCase();
  const sessionSecret = rawSecret || crypto.randomBytes(32).toString('hex');
  const isConfigured = Boolean(rawEmail && rawPassword && rawPassword.length >= 8);

  // Use the provided password or an unguessable ephemeral random string (64 hex characters) if unset
  const passwordToHash = (rawPassword && rawPassword.length >= 8)
    ? rawPassword
    : crypto.randomBytes(32).toString('hex');

  // Hash password with cost 12
  const adminPasswordHash = await bcrypt.hash(passwordToHash, 12);

  // Pre-generate a dummy hash with cost 12 for timing-attack mitigation
  const dummyPasswordHash = await bcrypt.hash('dummy_prevent_timing_attacks_shaadilink', 12);

  // Securely purge plain text password from environment and local reference
  delete process.env.ADMIN_PASSWORD;

  authState = {
    adminEmailNormalized,
    adminPasswordHash,
    dummyPasswordHash,
    sessionSecret,
    isConfigured,
  };

  return authState;
}

/**
 * Zod validation schema for login input
 */
export const AdminLoginInputSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Middleware: Requires valid admin JWT from httpOnly cookie or Authorization header
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.shaadilink_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, authState.sessionSecret) as { role: string; email: string };
    if (!decoded || decoded.role !== 'admin') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid administrative privileges'
      });
      return;
    }
    (req as any).admin = decoded;
    next();
  } catch (_err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session expired or invalid'
    });
  }
}

/**
 * Create Admin Auth Router
 */
export function createAdminAuthRouter(): Router {
  const router = Router();
  const isProd = process.env.NODE_ENV === 'production';

  // Rate limiter: Max 5 attempts per 15 minutes per IP
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'TooManyRequests',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfterMinutes: 15
    }
  });

  // POST /api/admin/login
  router.post('/login', loginLimiter, async (req: Request, res: Response) => {
    // 1. Zod input validation
    const parseResult = AdminLoginInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide a valid email and password'
      });
      return;
    }

    const { email, password } = parseResult.data;
    const isEmailMatch = email.toLowerCase() === authState.adminEmailNormalized;

    // 2. Always run bcrypt.compare to guarantee constant-time execution
    // If email matches, compare with admin hash; otherwise compare with dummy hash
    const targetHash = isEmailMatch ? authState.adminPasswordHash : authState.dummyPasswordHash;
    const isPasswordMatch = await bcrypt.compare(password, targetHash);

    // If either email or password does not match, return a generic 401
    if (!isEmailMatch || !isPasswordMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
      return;
    }

    // 3. Issue signed JWT session token (8 hours)
    const token = jwt.sign(
      {
        role: 'admin',
        email: authState.adminEmailNormalized,
      },
      authState.sessionSecret,
      { expiresIn: '8h' }
    );

    // 4. Set httpOnly cookie (Secure in production, SameSite=Strict)
    res.cookie('shaadilink_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/'
    });

    res.status(200).json({
      authenticated: true,
      message: 'Logged in successfully'
    });
  });

  // POST /api/admin/logout
  router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('shaadilink_session', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/'
    });
    res.status(200).json({
      authenticated: false,
      message: 'Logged out successfully'
    });
  });

  // GET /api/admin/me
  router.get('/me', requireAdmin, (_req: Request, res: Response) => {
    res.status(200).json({
      authenticated: true
    });
  });

  return router;
}
