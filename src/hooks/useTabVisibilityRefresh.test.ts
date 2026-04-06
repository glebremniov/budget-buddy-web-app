import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSetAuth = vi.fn()
const mockPost = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: { post: mockPost },
}))

let mockStoreState = {
  refreshToken: null as string | null,
  refreshTokenObtainedAt: null as number | null,
  setAuth: mockSetAuth,
}

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: () => mockStoreState,
  },
}))

const { useTabVisibilityRefresh } = await import('./useTabVisibilityRefresh')

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000
const STALE_TIMESTAMP = Date.now() - SIX_DAYS_MS - 1000
const FRESH_TIMESTAMP = Date.now() - 1000

function setVisibilityState(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
}

function fireVisibilityChange(state: 'visible' | 'hidden') {
  setVisibilityState(state)
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useTabVisibilityRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreState = {
      refreshToken: null,
      refreshTokenObtainedAt: null,
      setAuth: mockSetAuth,
    }
    setVisibilityState('visible')
  })

  it('does nothing if there is no refresh token', async () => {
    mockStoreState.refreshToken = null
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    await Promise.resolve()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('does nothing if refreshTokenObtainedAt is null', async () => {
    mockStoreState.refreshToken = 'rt_token'
    mockStoreState.refreshTokenObtainedAt = null

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    await Promise.resolve()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('does not refresh when token is fresh (< 6 days old)', async () => {
    mockStoreState.refreshToken = 'rt_token'
    mockStoreState.refreshTokenObtainedAt = FRESH_TIMESTAMP

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    await Promise.resolve()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('does not refresh when tab becomes hidden', async () => {
    mockStoreState.refreshToken = 'rt_old'
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('hidden')

    await Promise.resolve()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('refreshes and updates auth when tab becomes visible and token is stale (≥ 6 days old)', async () => {
    mockStoreState.refreshToken = 'rt_old'
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    mockPost.mockResolvedValue({
      data: { access_token: 'at_new', refresh_token: 'rt_new' },
    })

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    await vi.waitFor(() => expect(mockPost).toHaveBeenCalledOnce())
    expect(mockPost).toHaveBeenCalledWith('/v1/auth/refresh', { refresh_token: 'rt_old' })
    expect(mockSetAuth).toHaveBeenCalledWith('at_new', 'rt_new')
  })

  it('silently catches refresh errors', async () => {
    mockStoreState.refreshToken = 'rt_old'
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    mockPost.mockRejectedValue(new Error('network error'))

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    // Should not throw
    await vi.waitFor(() => expect(mockPost).toHaveBeenCalledOnce())
    expect(mockSetAuth).not.toHaveBeenCalled()
  })

  it('does not double-refresh on rapid visibility events', async () => {
    mockStoreState.refreshToken = 'rt_old'
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    let resolveRefresh!: () => void
    mockPost.mockReturnValue(
      new Promise<{ data: { access_token: string; refresh_token: string } }>((resolve) => {
        resolveRefresh = () => resolve({ data: { access_token: 'at_new', refresh_token: 'rt_new' } })
      }),
    )

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')
    fireVisibilityChange('visible')
    fireVisibilityChange('visible')

    resolveRefresh()
    await vi.waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1))
  })

  it('does not re-refresh on sequential visibility event after token was just refreshed', async () => {
    mockStoreState.refreshToken = 'rt_old'
    mockStoreState.refreshTokenObtainedAt = STALE_TIMESTAMP

    mockPost.mockResolvedValue({
      data: { access_token: 'at_new', refresh_token: 'rt_new' },
    })
    // Simulate setAuth updating the store so the next staleness check sees a fresh token
    mockSetAuth.mockImplementation(() => {
      mockStoreState.refreshTokenObtainedAt = Date.now()
    })

    renderHook(() => useTabVisibilityRefresh())
    fireVisibilityChange('visible')

    await vi.waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1))

    // Second visibility event — token is now fresh, staleness check should block refresh
    fireVisibilityChange('visible')
    await Promise.resolve()

    expect(mockPost).toHaveBeenCalledTimes(1)
  })

  it('removes the visibilitychange listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useTabVisibilityRefresh())
    unmount()

    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
