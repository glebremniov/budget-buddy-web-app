import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { useWindowFocusRefresh } from '@/hooks/useWindowFocusRefresh'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  useWindowFocusRefresh()
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
