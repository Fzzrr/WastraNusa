import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type RenderOptions,
  render as rtlRender,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

/**
 * A QueryClient configured for tests: no retries so failures surface
 * immediately instead of being retried with backoff.
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

/**
 * Render a component wrapped in the providers used across the app.
 * Use this instead of RTL's `render` for components that consume React Query.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
