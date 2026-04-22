import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { AppLayout } from '@/components/layout/AppLayout';
import { clearSentryUser, setSentryUser } from '@/lib/sentry';

export function ProtectedAppLayout() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading || auth.activeNavigator || auth.isAuthenticated) return;

    void auth.signinRedirect();
  }, [auth]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.profile.sub) {
      setSentryUser(auth.user.profile.sub);
    } else {
      clearSentryUser();
    }
  }, [auth.isAuthenticated, auth.user?.profile.sub]);

  if (auth.isLoading || auth.activeNavigator) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Redirecting to sign-in…</p>
      </div>
    );
  }

  // signinRedirect() is in-flight — show a loading state so the user never
  // sees a blank screen between the unauthenticated render and the redirect.
  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Redirecting to sign-in…</p>
      </div>
    );
  }

  return <AppLayout />;
}
