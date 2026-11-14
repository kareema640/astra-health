/**
 * ASTRA HEALTH auth API client (Login / Sign Up module).
 * Talks to the backend in /backend. The base URL comes from VITE_API_URL
 * (Lovable environment setting in production); it falls back to the local dev API.
 * No secrets live here — the browser only ever holds short-lived tokens.
 */

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  astronautId: string;
  createdAt: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const BASE: string = (
  (import.meta as { env?: Record<string, string | undefined> }).env?.["VITE_API_URL"] ||
  "http://localhost:3001"
).replace(/\/+$/, "");

const STORAGE_KEY = "astra-session-v1";

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
    const init: RequestInit = {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers,
      credentials: "omit",
    };
    if (options.body !== undefined) init.body = JSON.stringify(options.body);
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, "OFFLINE", "Cannot reach the mission server. Check your connection.");
  }

  if (res.status === 204) return undefined as T;

  let json: ApiErrorBody & Record<string, unknown> = {};
  try {
    json = (await res.json()) as ApiErrorBody & Record<string, unknown>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const e = json.error ?? {};
    throw new ApiError(
      res.status,
      e.code ?? "UNKNOWN",
      e.message ?? "Something went wrong. Try again.",
      e.fields ?? {},
    );
  }
  return json as unknown as T;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  astronautId: string;
}

export interface LoginInput {
  astronautId: string;
  password: string;
}

type AuthResult = { user: PublicUser } & SessionTokens;

function saveSession(tokens: SessionTokens) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function loadSession(): SessionTokens | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionTokens>;
    return parsed.accessToken && parsed.refreshToken
      ? { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
      : null;
  } catch {
    return null;
  }
}

export const authApi = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const res = await request<AuthResult>("/api/auth/register", { body: input });
    saveSession({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    return res;
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const res = await request<AuthResult>("/api/auth/login", { body: input });
    saveSession({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    return res;
  },

  /** Rotate the refresh token if the access token lapsed; null when signed out. */
  async refresh(): Promise<SessionTokens | null> {
    const session = loadSession();
    if (!session) return null;
    try {
      const res = await request<SessionTokens>("/api/auth/refresh", {
        body: { refreshToken: session.refreshToken },
      });
      saveSession(res);
      return res;
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  /** Best-effort server revocation, always clears the local session. */
  async logout(): Promise<void> {
    const session = loadSession();
    if (session) {
      try {
        await request("/api/auth/logout", { body: { refreshToken: session.refreshToken } });
      } catch {
        /* the local session is cleared regardless */
      }
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  },

  /** The signed-in account, refreshing the access token once on 401. */
  async me(): Promise<PublicUser> {
    const session = loadSession();
    if (!session) throw new ApiError(401, "UNAUTHORIZED", "Sign in required");
    try {
      const res = await request<{ user: PublicUser }>("/api/auth/me", {
        token: session.accessToken,
      });
      return res.user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const fresh = await this.refresh();
        if (fresh) {
          const res = await request<{ user: PublicUser }>("/api/auth/me", {
            token: fresh.accessToken,
          });
          return res.user;
        }
      }
      throw err;
    }
  },

  getSession: loadSession,
};

// Development convenience only: lets you drive auth from the browser console
// during preview testing, e.g. `await __astraAuth.me()` or `__astraAuth.logout()`.
// Never exposed in production builds.
const env = (import.meta as { env?: Record<string, string | boolean | undefined> }).env;
if (env?.["DEV"] === true && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>)["__astraAuth"] = authApi;
}
