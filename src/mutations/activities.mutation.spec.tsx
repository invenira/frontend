import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTIVITIES_QUERY } from '@/queries';
import { graphQLService } from '@/services';
import { useCreateActivityMutation } from '@/mutations/activities.mutation.ts';

const sampleCreateActivityInput = {
  name: 'Test Activity',
  description: 'Test description',
  activityProviderId: '',
  parameters: {},
};

describe('useCreateActivityMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      // Disable retries for faster tests
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Wrapper component to provide QueryClient context.
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call onSuccess and invalidate queries on a successful mutation', async () => {
    // Arrange: Setup a fake successful response.
    const fakeResponse = {
      id: 'activity1',
      title: 'Test Activity',
      description: 'Test description',
    };

    // Spy on the service method to resolve with the fake response.
    vi.spyOn(graphQLService, 'createActivity').mockResolvedValueOnce(
      fakeResponse,
    );

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Spy on invalidateQueries to ensure it is called with the correct query key.
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Render the hook.
    const { result } = renderHook(
      () => useCreateActivityMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      iapId: 'iap1',
      createActivityInput: sampleCreateActivityInput,
    });

    // Assert: Wait for onSuccess to be called with the fake response.
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeResponse);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [ACTIVITIES_QUERY],
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError on a mutation error', async () => {
    // Arrange: Setup the service to throw an error.
    const fakeError = new Error('Mutation failed');
    vi.spyOn(graphQLService, 'createActivity').mockRejectedValueOnce(fakeError);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Render the hook.
    const { result } = renderHook(
      () => useCreateActivityMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      iapId: 'iap1',
      createActivityInput: sampleCreateActivityInput,
    });

    // Assert: Wait for onError to be called.
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
