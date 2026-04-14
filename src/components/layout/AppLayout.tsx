import { Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { useTabVisibilityRefresh } from '@/hooks/useTabVisibilityRefresh';

export function AppLayout() {
  useTabVisibilityRefresh();
  return (
    <AppShell>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppShell>
  );
}
