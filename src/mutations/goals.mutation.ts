import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphQLService } from '@/services';
import { CreateGoalInput, GoalGqlSchema } from '@/graphql/graphql.ts';
import { GOALS_QUERY } from '@/queries';

export type CreateGoalMutationProps = {
  iapId: string;
  createGoalInput: CreateGoalInput;
};

export const useCreateGoalMutation = (
  onSuccess?: (iap: Partial<GoalGqlSchema>) => void,
  onError?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateGoalMutationProps) =>
      graphQLService.createGoal(props.iapId, props.createGoalInput),

    onSuccess: (iap) => {
      if (onSuccess) {
        queryClient
          .invalidateQueries({ queryKey: [GOALS_QUERY] })
          .then(() => onSuccess(iap));
      }
    },
    onError: () => (onError ? onError() : null),
  });
};
