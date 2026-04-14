import { refreshToken as refreshAction } from '@budget-buddy-org/budget-buddy-contracts'
import { client } from '@budget-buddy-org/budget-buddy-contracts/client.gen'
import { useAuthStore } from '@/stores/auth.store'

// Queue of requests waiting for a token refresh to complete
let refreshPromise: Promise<string | null> | null = null
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)))
  pendingQueue = []
}

export function refreshAuth() {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshTokenValue = useAuthStore.getState().refreshToken
  if (!refreshTokenValue) {
    useAuthStore.getState().clearAuth()
    return Promise.resolve(null)
  }

  refreshPromise = (async () => {
    try {
      const { data } = await refreshAction({
        body: { refresh_token: refreshTokenValue },
        _isRefresh: true,
      } as any)

      if (!data) {
        throw new Error('Refresh failed')
      }

      useAuthStore.getState().setAuth(data.access_token, data.refresh_token, data.expires_in)
      flushQueue(null, data.access_token)
      return data.access_token
    } catch (refreshError) {
      flushQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// On 401: attempt refresh → retry; on refresh failure → clear auth + redirect to login
client.interceptors.response.use(async (response: Response, _request: Request, options: any) => {
  if (
    response.status !== 401 ||
    options._retry ||
    options._isRefresh ||
    options.url?.includes('/auth/login') ||
    options.url?.includes('/auth/register')
  ) {
    return response
  }

  if (refreshPromise) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject })
    }).then(async (token) => {
      const newHeaders = new Headers(options.headers)
      newHeaders.set('Authorization', `Bearer ${token}`)
      return client.request({ ...options, headers: newHeaders } as any).then((r: any) => r.response)
    })
  }

  options._retry = true
  const token = await refreshAuth()

  if (!token) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      window.location.href = '/login'
    }
    return response
  }

  const newHeaders = new Headers(options.headers)
  newHeaders.set('Authorization', `Bearer ${token}`)
  return client.request({ ...options, headers: newHeaders } as any).then((r: any) => r.response)
})
