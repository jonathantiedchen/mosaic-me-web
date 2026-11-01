const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/** Fired when the session cannot be renewed, so the app can show the login page. */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

let refreshInFlight: Promise<boolean> | null = null;

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exchange the refresh token for a new token pair. Concurrent callers share one
 * request: the server rotates refresh tokens, so a second parallel refresh with
 * the same token would be rejected.
 */
export function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh()
      .then((ok) => {
        if (!ok) {
          clearTokens();
          window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        return ok;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** fetch() for admin endpoints: sends the access token and renews it once on a 401. */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = localStorage.getItem('access_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };

  const response = await send();
  if (response.status !== 401 || !localStorage.getItem('refresh_token')) {
    return response;
  }
  return (await refreshTokens()) ? send() : response;
}
