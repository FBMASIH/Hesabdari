import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ isAuthenticated: true, accessToken });
  },
  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ isAuthenticated: false, accessToken: null });
  },
}));
