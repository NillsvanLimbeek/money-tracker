const API_URL = import.meta.env.VITE_API_URL;

interface ApiError {
  message: string;
}

interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

interface Session {
  session: { id: string; expiresAt: string };
  user: SessionUser;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  }
  catch {
    return { data: null, error: { message: 'Could not reach the server. Please try again.' } };
  }

  const body = await response.json().catch(() => null);

  if (!response.ok)
    return { data: null, error: { message: body?.message ?? 'Something went wrong. Please try again.' } };

  return { data: body as T, error: null };
}

export const authClient = {
  signUp: {
    email: (body: { email: string; password: string; name: string }) =>
      request<Session>('/api/sign-up', { method: 'POST', body: JSON.stringify(body) }),
  },
  signIn: {
    email: (body: { email: string; password: string; rememberMe?: boolean }) =>
      request<Session>('/api/sign-in', { method: 'POST', body: JSON.stringify(body) }),
  },
  signOut: () => request<null>('/api/sign-out', { method: 'POST' }),
  getSession: () => request<Session | null>('/api/session'),
};
