import { ApiClient } from '@hesabdari/api-client';
import { env } from '@/shared/config/env';

export const apiClient = new ApiClient({
  baseUrl: env.apiUrl,
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  },
});
