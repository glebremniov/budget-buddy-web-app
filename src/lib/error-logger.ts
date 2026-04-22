import { captureSentryException } from './sentry';

export interface ErrorContext {
  source?: string;
  [key: string]: unknown;
}

export function logError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  if (import.meta.env.DEV) {
    console.error('[ErrorLogger]', { message, stack, context });
  } else {
    console.error('[ErrorLogger]', message, context?.source ?? '');
  }

  captureSentryException(error, context);
}
