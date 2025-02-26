import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTIVITY_PROVIDERS_QUERY } from '@/queries';
import { graphQLService } from '@/services';
import { useCreateActivityProviderMutation } from '@/mutations/activity-providers.mutation.ts';

const sampleCreateActivityProviderInput = {
  name: 'Activity Provider Name',
  description: 'Description of the activity provider',
  url: 'localhost',
};

describe('useCreateActivityProviderMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Wrapper component for providing the QueryClient context.
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call onSuccess and invalidate queries on a successful mutation', async () => {
    // Arrange: Set up a fake successful response.
    const fakeResponse = {
      id: 'provider1',
      name: 'Activity Provider Name',
      description: 'Description of the activity provider',
    };
    vi.spyOn(graphQLService, 'createActivityProvider').mockResolvedValueOnce(
      fakeResponse,
    );

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Spy on the invalidateQueries method.
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Render the hook.
    const { result } = renderHook(
      () => useCreateActivityProviderMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      createActivityProviderInput: sampleCreateActivityProviderInput,
    });

    // Assert: Wait for the onSuccess callback to be invoked with the fake response.
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeResponse);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [ACTIVITY_PROVIDERS_QUERY],
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError on a mutation error', async () => {
    // Arrange: Set up the service to throw an error.
    const fakeError = new Error('Mutation failed');
    vi.spyOn(graphQLService, 'createActivityProvider').mockRejectedValueOnce(
      fakeError,
    );

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Render the hook.
    const { result } = renderHook(
      () => useCreateActivityProviderMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      createActivityProviderInput: sampleCreateActivityProviderInput,
    });

    // Assert: Wait for the onError callback to be invoked.
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
