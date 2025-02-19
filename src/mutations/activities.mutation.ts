import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphQLService } from '@/services';
import { ActivityGqlSchema, CreateActivityInput } from '@/graphql/graphql.ts';
import { ACTIVITIES_QUERY } from '@/queries';

export type CreateActivityMutationProps = {
  apId: string;
  createActivityInput: CreateActivityInput;
};

export const useCreateActivityMutation = (
  onSuccess?: (iap: Partial<ActivityGqlSchema>) => void,
  onError?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateActivityMutationProps) =>
      graphQLService.createActivity(props.apId, props.createActivityInput),

    onSuccess: (activity) => {
      if (onSuccess) {
        queryClient
          .invalidateQueries({ queryKey: [ACTIVITIES_QUERY] })
          .then(() => onSuccess(activity));
      }
    },
    onError: () => (onError ? onError() : null),
  });
};
