import { useEffect, useRef } from 'react'
import type { AuthToken } from '@glebremniov/budget-buddy-contracts'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000

/**
 * Proactively refreshes the auth token on window focus if the refresh token
 * is older than 6 days, catching token expiry before the next user action.
 *
 * Mount once inside the authenticated layout.
 */
export function useWindowFocusRefresh() {
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    async function handleFocus() {
      const { refreshToken, refreshTokenObtainedAt, setAuth } = useAuthStore.getState()

      if (!refreshToken || refreshTokenObtainedAt === null) return
      if (isRefreshingRef.current) return

      const ageMs = Date.now() - refreshTokenObtainedAt
      if (ageMs < SIX_DAYS_MS) return

      isRefreshingRef.current = true
      try {
        const { data } = await apiClient.post<AuthToken>('/v1/auth/refresh', {
          refresh_token: refreshToken,
        })
        setAuth(data.access_token, data.refresh_token)
      } catch {
        // Silently ignore — reactive 401 handling in api.ts will catch actual expiry
      } finally {
        isRefreshingRef.current = false
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])
}
