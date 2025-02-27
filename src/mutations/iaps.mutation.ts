import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphQLService } from '@/services';
import { IapgqlSchema } from '@/graphql/graphql.ts';
import { IAPS_QUERY } from '@/queries';

export type CreateIAPMutationProps = {
  name: string;
  description: string;
};

export const useCreateIAPMutation = (
  onSuccess?: (iap: Partial<IapgqlSchema>) => void,
  onError?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateIAPMutationProps) =>
      graphQLService.createIap(props.name, props.description),

    onSuccess: (iap) => {
      if (onSuccess) {
        queryClient
          .invalidateQueries({ queryKey: [IAPS_QUERY] })
          .then(() => onSuccess(iap));
      }
    },
    onError: () => (onError ? onError() : null),
  });
};
