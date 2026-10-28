export interface LoginResponse {
  authenticated: boolean;
  message?: string;
  error?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  error?: string;
}

export class AuthApiError extends Error {
  status: number;
  code: 'UNAUTHORIZED' | 'RATE_LIMITED' | 'SERVER_ERROR';

  constructor(message: string, status: number, code: 'UNAUTHORIZED' | 'RATE_LIMITED' | 'SERVER_ERROR') {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Log in admin via POST /api/admin/login
 */
export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  } catch (_networkErr) {
    throw new AuthApiError('The server is not responding. Please try again later.', 0, 'SERVER_ERROR');
  }

  // Check if response is valid JSON
  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  // Non-JSON responses (e.g. HTML error pages from Vercel / reverse proxies)
  if (data === null) {
    throw new AuthApiError('The server is not responding. Please try again later.', response.status, 'SERVER_ERROR');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthApiError(data.message || 'Invalid email or password', 401, 'UNAUTHORIZED');
    }
    if (response.status === 429) {
      throw new AuthApiError(data.message || 'Too many login attempts. Please try again in 15 minutes.', 429, 'RATE_LIMITED');
    }
    // 5xx or other server failure
    throw new AuthApiError('The server is not responding. Please try again later.', response.status, 'SERVER_ERROR');
  }

  return data;
}

/**
 * Log out admin via POST /api/admin/logout
 */
export async function logoutAdmin(): Promise<void> {
  await fetch('/api/admin/logout', {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  }).catch(() => {});
}

/**
 * Check if admin is currently authenticated via GET /api/admin/me
 */
export async function checkAdminAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/me', {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}
