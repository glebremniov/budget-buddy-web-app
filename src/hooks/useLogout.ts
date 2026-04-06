import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => authApi.logoutUser(),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })
}
