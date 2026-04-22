import * as Sentry from '@sentry/react';

let _initialised = false;

export function initSentry(dsn: string | undefined): void {
  if (!dsn || _initialised) return;

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 0,
    environment: import.meta.env.MODE,
    // Avoid sending error noise from browser extensions and unrelated origins
    allowUrls: [window.location.origin],
  });

  _initialised = true;
}

export function setSentryUser(sub: string): void {
  if (!_initialised) return;
  Sentry.setUser({ id: sub });
}

export function clearSentryUser(): void {
  if (!_initialised) return;
  Sentry.setUser(null);
}

export function captureSentryException(error: unknown, context?: Record<string, unknown>): void {
  if (!_initialised) return;
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}
