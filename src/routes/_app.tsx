import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppErrorComponent } from '@/components/layout/AppErrorComponent';
import { AppLayout } from '@/components/layout/AppLayout';
import { refreshAuth } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    if (accessToken) return;

    if (refreshToken) {
      await refreshAuth();

      const { accessToken: refreshedAccessToken, refreshToken: remainingRefreshToken } =
        useAuthStore.getState();
      if (refreshedAccessToken || remainingRefreshToken) return;
    }

    throw redirect({ to: '/login' });
  },
  component: AppLayout,
  errorComponent: AppErrorComponent,
});
