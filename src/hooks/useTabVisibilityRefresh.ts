import { useEffect } from 'react'
import { refreshAuth } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000

/**
 * Proactively refreshes the auth token when the tab becomes visible if the
 * refresh token is older than 6 days, catching token expiry before the next
 * user action. Covers both tab-switching and window-focus scenarios.
 *
 * Mount once inside the authenticated layout.
 */
export function useTabVisibilityRefresh() {
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return

      const { refreshToken, refreshTokenObtainedAt } = useAuthStore.getState()

      if (!refreshToken || refreshTokenObtainedAt === null) return

      const ageMs = Date.now() - refreshTokenObtainedAt
      if (ageMs < SIX_DAYS_MS) return

      try {
        await refreshAuth()
      } catch {
        // Network/transient errors are silently ignored so the user is not interrupted.
        // If the refresh token is expired (server returns 401), the response interceptor
        // in api.ts takes over: it attempts another refresh, fails, calls clearAuth(),
        // and redirects to /login — which is the correct UX for an expired session.
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
}
