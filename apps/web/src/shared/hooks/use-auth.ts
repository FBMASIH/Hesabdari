import { create } from 'zustand';

/** localStorage key constants — single source of truth to prevent typo bugs. */
const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  organizationId: 'organization_id',
} as const;

/** Cookie name used to signal auth state to Next.js middleware. */
const AUTH_COOKIE = 'auth_session';

/** Set a cookie accessible to Next.js middleware. SameSite=Strict, Secure in production. */
function setAuthCookie(name: string, value: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict${secure}; max-age=86400`;
}

function deleteAuthCookie(name: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; path=/; SameSite=Strict${secure}; max-age=0`;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  organizationId: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setOrganizationId: (orgId: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem(KEYS.accessToken) : false,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem(KEYS.accessToken) : null,
  organizationId: typeof window !== 'undefined' ? localStorage.getItem(KEYS.organizationId) : null,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(KEYS.accessToken, accessToken);
    localStorage.setItem(KEYS.refreshToken, refreshToken);
    setAuthCookie(AUTH_COOKIE, '1');
    set({ isAuthenticated: true, accessToken });
  },
  setOrganizationId: (orgId) => {
    localStorage.setItem(KEYS.organizationId, orgId);
    set({ organizationId: orgId });
  },
  clearAuth: () => {
    localStorage.removeItem(KEYS.accessToken);
    localStorage.removeItem(KEYS.refreshToken);
    localStorage.removeItem(KEYS.organizationId);
    deleteAuthCookie(AUTH_COOKIE);
    set({ isAuthenticated: false, accessToken: null, organizationId: null });
  },
  logout: async () => {
    const refreshToken = localStorage.getItem(KEYS.refreshToken);
    const accessToken = localStorage.getItem(KEYS.accessToken);

    // Clear local state immediately — don't block on server response
    localStorage.removeItem(KEYS.accessToken);
    localStorage.removeItem(KEYS.refreshToken);
    localStorage.removeItem(KEYS.organizationId);
    deleteAuthCookie(AUTH_COOKIE);
    set({ isAuthenticated: false, accessToken: null, organizationId: null });

    // Best-effort server-side session invalidation
    if (refreshToken && accessToken) {
      try {
        // Raw fetch to avoid circular dependency with apiClient
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (_err) {
        // Logout is best-effort — local state is already cleared
      }
    }
  },
}));
