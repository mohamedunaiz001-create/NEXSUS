/**
 * Secure API Client Helper
 * Handles CSRF token caching, HTTP-only cookie credentials, and error wrapping.
 */

let cachedCsrfToken: string | null = null;

/**
 * Retrieves the current anti-CSRF token from the server or cookie.
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;

  // Try reading from document.cookie
  const match = document.cookie.match(/(?:^|; )nexsus_csrf=([^;]*)/);
  if (match && match[1]) {
    cachedCsrfToken = decodeURIComponent(match[1]);
    return cachedCsrfToken;
  }

  try {
    const res = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch CSRF token from server', err);
  }

  return '';
}

/**
 * Initializes the SOC operator session via cookie-based authentication.
 */
export async function initializeSession(): Promise<void> {
  try {
    // Check if current session is active
    const meRes = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (!meRes.ok) {
      // Bootstrap session
      await fetch('/api/auth/bootstrap', {
        method: 'POST',
        credentials: 'include'
      });
    }
    // Prime CSRF token
    await getCsrfToken();
  } catch (e) {
    console.warn('Session initialization notice:', e);
  }
}

/**
 * Authenticated & CSRF-protected fetch wrapper.
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  // Attach CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });
}
