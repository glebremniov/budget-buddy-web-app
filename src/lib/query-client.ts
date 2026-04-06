import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { logError } from './error-logger'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => logError(error, { source: 'QueryCache' }),
  }),
  mutationCache: new MutationCache({
    onError: (error) => logError(error, { source: 'MutationCache' }),
  }),
})
