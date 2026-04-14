import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});
