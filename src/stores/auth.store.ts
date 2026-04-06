import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  /** In-memory only — not persisted. Re-obtained via refresh on page load. */
  accessToken: string | null
  /** Persisted to localStorage — required since the API expects it in the request body. */
  refreshToken: string | null
  /** Unix timestamp (ms) of when the refresh token was last obtained. Used for staleness checks. */
  refreshTokenObtainedAt: number | null
  setAuth: (accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      refreshTokenObtainedAt: null,
      setAuth: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, refreshTokenObtainedAt: Date.now() }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, refreshTokenObtainedAt: null }),
      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: 'budget-buddy-auth',
      // Only persist the refresh token and its timestamp — access token lives in memory
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        refreshTokenObtainedAt: state.refreshTokenObtainedAt,
      }),
    },
  ),
)
