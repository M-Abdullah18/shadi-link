export interface LoginResponse {
  authenticated: boolean;
  message?: string;
  error?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  error?: string;
}

/**
 * Log in admin via POST /api/admin/login
 */
export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(data.message || 'Too many login attempts. Please try again in 15 minutes.');
    }
    throw new Error(data.message || 'Invalid email or password');
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
