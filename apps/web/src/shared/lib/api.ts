import { ApiClient, ApiError } from '@hesabdari/api-client';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/hooks/use-auth';

export { ApiError };

export const apiClient = new ApiClient({
  baseUrl: env.apiUrl,
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },
  onTokenRefreshed: (accessToken, refreshToken) => {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      // Don't redirect if already on login — avoids killing the login form's error state
      if (window.location.pathname === '/login') return;
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
  },
});
