import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphQLService } from '@/services';
import { CreateGoalInput } from '@/graphql/graphql.ts';
import { GOALS_QUERY } from '@/queries';

export type CreateGoalMutationProps = {
  iapId: string;
  createGoalInput: CreateGoalInput;
};

export const useCreateGoalMutation = (
  onSuccess?: () => void,
  onError?: (e: Error) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateGoalMutationProps) => {
      await graphQLService.createGoal(props.iapId, props.createGoalInput);
      return props.iapId;
    },

    onSuccess: (iapId) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [GOALS_QUERY] }),
        queryClient.invalidateQueries({ queryKey: [`iap-${iapId}`] }),
      ]).then(() => {
        if (onSuccess) {
          onSuccess();
        }
      });
    },
    onError: (e: Error) => (onError ? onError(e) : null),
  });
};
