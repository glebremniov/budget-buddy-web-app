import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'
import { client } from '@budget-buddy-org/budget-buddy-contracts/client.gen'
import { loadConfig } from './lib/config'
import { refreshAuth } from './lib/api'
import { useAuthStore } from './stores/auth.store'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

// Bootstrapping: Load runtime config, update the API client, then render the app.
loadConfig().then(async (config) => {
  client.setConfig({
    baseUrl: config.VITE_API_URL,
  })

  // Try to refresh the token on app load if we have a refresh token but no access token.
  // This avoids unnecessary redirects to the login page on page reload.
  const { accessToken, refreshToken } = useAuthStore.getState()
  if (!accessToken && refreshToken) {
    await refreshAuth()
  }

  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
