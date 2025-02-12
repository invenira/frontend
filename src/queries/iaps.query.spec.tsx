import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../e2e/util/graphql-server.ts';
import axios from 'axios';
import { baseUrl } from '../../e2e/util/graphql-mocks.ts';
import { useIAPQuery, useIAPsQuery } from '@/queries/iaps.query.ts';
import { ReactNode } from 'react';

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

describe('useIAPsQuery', () => {
  beforeAll(() => {
    server.listen();
    axios.defaults.baseURL = baseUrl;
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
  });

  it('fetches and returns data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useIAPsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});

describe('useIAPQuery', () => {
  beforeAll(() => {
    server.listen();
    axios.defaults.baseURL = baseUrl;
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
  });

  it('fetches and returns data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useIAPQuery('67acd13b2bd1ccd28300b78d'),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});
