import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphQLService } from '@/services';
import {
  ActivityProviderGqlSchema,
  CreateActivityProviderInput,
} from '@/graphql/graphql.ts';
import { ACTIVITY_PROVIDERS_QUERY } from '@/queries';

export type CreateActivityProviderMutationProps = {
  createActivityProviderInput: CreateActivityProviderInput;
};

export const useCreateActivityProviderMutation = (
  onSuccess?: (iap: Partial<ActivityProviderGqlSchema>) => void,
  onError?: (e: Error) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateActivityProviderMutationProps) =>
      graphQLService.createActivityProvider(props.createActivityProviderInput),

    onSuccess: (activity) => {
      queryClient
        .invalidateQueries({ queryKey: [ACTIVITY_PROVIDERS_QUERY] })
        .then(() => {
          if (onSuccess) {
            onSuccess(activity);
          }
        });
    },
    onError: (e: Error) => (onError ? onError(e) : null),
  });
};
