import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GOALS_QUERY } from '@/queries';
import { graphQLService } from '@/services';
import { useCreateGoalMutation } from '@/mutations/goals.mutation.ts';

const sampleCreateGoalInput = {
  name: 'Goal Title',
  description: 'Goal Description',
  formula: '1+1',
  targetValue: 0,
};

describe('useCreateGoalMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // A wrapper to provide the QueryClient context
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call onSuccess and invalidateQueries on a successful mutation', async () => {
    // Arrange: Set up a fake response and spy on the service method.
    const fakeResponse = {
      id: 'goal1',
      title: 'Goal Title',
      description: 'Goal Description',
    };
    vi.spyOn(graphQLService, 'createGoal').mockResolvedValueOnce(fakeResponse);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Spy on invalidateQueries to assert it gets called with the proper query key.
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Render the hook.
    const { result } = renderHook(
      () => useCreateGoalMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      iapId: 'iap1',
      createGoalInput: sampleCreateGoalInput,
    });

    // Assert: Wait for onSuccess to be called with the fake response.
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeResponse);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [GOALS_QUERY] });
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError on a mutation error', async () => {
    // Arrange: Set up the service to throw an error.
    const fakeError = new Error('Mutation failed');
    vi.spyOn(graphQLService, 'createGoal').mockRejectedValueOnce(fakeError);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Render the hook.
    const { result } = renderHook(
      () => useCreateGoalMutation(onSuccess, onError),
      { wrapper },
    );

    // Act: Trigger the mutation.
    result.current.mutate({
      iapId: 'iap1',
      createGoalInput: sampleCreateGoalInput,
    });

    // Assert: Wait for onError to be called.
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
