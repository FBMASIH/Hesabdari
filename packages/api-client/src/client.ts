import { ApiError } from './errors';

export interface ApiClientConfig {
  /** Absolute URL or empty string for same-origin (relative) requests */
  baseUrl: string;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onUnauthorized?: () => void;
}

/**
 * Base API client for communicating with the Hesabdari backend.
 *
 * When `baseUrl` is empty, all requests are relative to the current origin
 * (ideal for Next.js rewrite proxies — works from any machine).
 *
 * Handles automatic token refresh: when a 401 response is received, the client
 * attempts to refresh the access token using the stored refresh token before
 * calling onUnauthorized. Each request is retried at most once.
 */
export class ApiClient {
  private config: ApiClientConfig;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /** Resolve a path against the base URL. Supports both absolute and relative base. */
  private resolveUrl(path: string, params?: Record<string, string>): string {
    const base = this.config.baseUrl;
    if (base) {
      const url = new URL(path, base);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }
      return url.toString();
    }
    // Same-origin: path is already relative (e.g. "/api/v1/auth/login")
    if (params) {
      const sp = new URLSearchParams(params);
      return `${path}?${sp.toString()}`;
    }
    return path;
  }

  private getHeaders(includeContentType = true): HeadersInit {
    const headers: Record<string, string> = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.config.getAccessToken?.();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * Returns true if refresh succeeded, false otherwise.
   * Deduplicates concurrent refresh attempts.
   */
  private async attemptRefresh(): Promise<boolean> {
    // Deduplicate: if a refresh is already in flight, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.config.getRefreshToken?.();
    if (!refreshToken) {
      return false;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(this.resolveUrl('/api/v1/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          !('accessToken' in data) ||
          !('refreshToken' in data) ||
          typeof (data as Record<string, unknown>).accessToken !== 'string' ||
          typeof (data as Record<string, unknown>).refreshToken !== 'string'
        ) {
          return false;
        }
        const tokens = data as { accessToken: string; refreshToken: string };
        this.config.onTokenRefreshed?.(tokens.accessToken, tokens.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async handleResponse<T>(
    response: Response,
    retryFn?: () => Promise<Response>,
  ): Promise<T> {
    // On 401, attempt token refresh before giving up
    if (response.status === 401 && retryFn) {
      const refreshed = await this.attemptRefresh();
      if (refreshed) {
        // Retry the original request with the new token
        const retryResponse = await retryFn();
        // Process retry without another refresh attempt (pass no retryFn)
        return this.handleResponse<T>(retryResponse);
      }
      // Refresh failed — notify the app and throw immediately
      this.config.onUnauthorized?.();
      const body = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        body.error?.code ?? 'SESSION_EXPIRED',
        body.error?.message ?? 'Session expired',
        body.error?.details,
      );
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        body.error?.code ?? 'UNKNOWN',
        body.error?.message ?? 'An error occurred',
        body.error?.details,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.resolveUrl(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<T>(response, () =>
      fetch(url, { method: 'GET', headers: this.getHeaders(false) }),
    );
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.resolveUrl(path);
    const jsonBody = body ? JSON.stringify(body) : undefined;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: jsonBody,
    });
    return this.handleResponse<T>(response, () =>
      fetch(url, { method: 'POST', headers: this.getHeaders(), body: jsonBody }),
    );
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.resolveUrl(path);
    const jsonBody = body ? JSON.stringify(body) : undefined;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: jsonBody,
    });
    return this.handleResponse<T>(response, () =>
      fetch(url, { method: 'PUT', headers: this.getHeaders(), body: jsonBody }),
    );
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = this.resolveUrl(path);
    const jsonBody = body ? JSON.stringify(body) : undefined;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: jsonBody,
    });
    return this.handleResponse<T>(response, () =>
      fetch(url, { method: 'PATCH', headers: this.getHeaders(), body: jsonBody }),
    );
  }

  async delete<T>(path: string): Promise<T> {
    const url = this.resolveUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<T>(response, () =>
      fetch(url, { method: 'DELETE', headers: this.getHeaders(false) }),
    );
  }
}
