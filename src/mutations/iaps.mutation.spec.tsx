import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IAPS_QUERY } from '@/queries';
import { graphQLService } from '@/services';
import {
  useCreateIAPMutation,
  useDeployIAPMutation,
} from '@/mutations/iaps.mutation.ts';

describe('useCreateIAPMutation', () => {
  let queryClient: QueryClient;

  // Create a fresh QueryClient for each test.
  beforeEach(() => {
    queryClient = new QueryClient({
      // Optionally disable retries to speed up tests.
      defaultOptions: { queries: { retry: false } },
    });
  });

  // Clean up mocks after each test.
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Wrapper component for providing the QueryClient context.
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call onSuccess and invalidateQueries on a successful mutation', async () => {
    // Arrange: Setup the fake response and spy on the service call.
    const fakeResponse = { _id: '1', name: 'Test', description: 'Desc' };
    vi.spyOn(graphQLService, 'createIap').mockResolvedValueOnce(fakeResponse);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Spy on the queryClient.invalidateQueries method.
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Render the hook.
    const { result } = renderHook(
      () => useCreateIAPMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({ name: 'Test', description: 'Desc' });

    // Assert: Wait for the onSuccess callback to be called with the fake response.
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeResponse);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [IAPS_QUERY] });
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError on a mutation error', async () => {
    // Arrange: Setup the service to throw an error.
    const fakeError = new Error('Test error');
    vi.spyOn(graphQLService, 'createIap').mockRejectedValueOnce(fakeError);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Render the hook.
    const { result } = renderHook(
      () => useCreateIAPMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({ name: 'Test', description: 'Desc' });

    // Assert: Wait for the onError callback to be called.
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('useDeployIAPMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call onSuccess and invalidateQueries on a successful deployment', async () => {
    vi.spyOn(graphQLService, 'deployIap').mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useDeployIAPMutation(onSuccess, onError),
      { wrapper },
    );

    result.current.mutate({ id: '123' });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [IAPS_QUERY] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [`iap-123`] });
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError on deployment failure', async () => {
    const fakeError = new Error('Deployment error');
    vi.spyOn(graphQLService, 'deployIap').mockRejectedValueOnce(fakeError);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(
      () => useDeployIAPMutation(onSuccess, onError),
      { wrapper },
    );

    result.current.mutate({ id: '123' });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(fakeError);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('mutateAsync should resolve with the given id on success', async () => {
    vi.spyOn(graphQLService, 'deployIap').mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeployIAPMutation(), { wrapper });

    const returnedId = await result.current.mutateAsync({ id: '456' });
    expect(returnedId).toBe('456');
  });
});
