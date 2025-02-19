import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import axios from 'axios';
import { server } from '../../e2e/util/graphql-server';
import { baseUrl } from '../../e2e/util/graphql-mocks';
import { useActivityProvidersQuery } from '@/queries';
import { graphql, HttpResponse } from 'msw';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useActivityProvidersQuery', () => {
  beforeAll(() => {
    server.listen();
    axios.defaults.baseURL = baseUrl;
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('fetches and returns activity providers data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivityProvidersQuery(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('handles error when fetching activity providers', async () => {
    server.use(
      graphql.link(baseUrl).query('getActivityProviders', () =>
        HttpResponse.json({
          errors: [{ message: 'Server Error' }],
        }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivityProvidersQuery(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
