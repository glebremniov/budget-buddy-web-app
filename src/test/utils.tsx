import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender } from '@testing-library/react';
import type React from 'react';
import { FABProvider } from '@/contexts/fab-context';

export function render(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <FABProvider>{ui}</FABProvider>
    </QueryClientProvider>,
  );
}
