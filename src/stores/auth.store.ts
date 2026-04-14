import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  /** In-memory only — not persisted. Re-obtained via refresh on page load. */
  accessToken: string | null
  /** Persisted to localStorage — required since the API expects it in the request body. */
  refreshToken: string | null
  /** Unix timestamp (ms) of when the refresh token was last obtained. Used for staleness checks. */
  refreshTokenObtainedAt: number | null
  accessTokenExpiresAt: number | null
  setAuth: (accessToken: string, refreshToken: string, expiresIn: number) => void
  setAccessToken: (token: string, expiresIn?: number) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      refreshTokenObtainedAt: null,
      accessTokenExpiresAt: null,
      setAuth: (accessToken, refreshToken, expiresIn) =>
        set({ 
          accessToken, 
          refreshToken, 
          refreshTokenObtainedAt: Date.now(),
          accessTokenExpiresAt: Date.now() + (expiresIn * 1000)
        }),
      setAccessToken: (token, expiresIn) => 
        set({ 
          accessToken: token,
          accessTokenExpiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : null
        }),
      clearAuth: () => set({ 
        accessToken: null, 
        refreshToken: null, 
        refreshTokenObtainedAt: null,
        accessTokenExpiresAt: null
      }),
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
