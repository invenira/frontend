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
  onError?: (e: Error) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateIAPMutationProps) =>
      graphQLService.createIap(props.name, props.description),

    onSuccess: (iap) => {
      queryClient.invalidateQueries({ queryKey: [IAPS_QUERY] }).then(() => {
        if (onSuccess) {
          onSuccess(iap);
        }
      });
    },
    onError: (e) => (onError ? onError(e) : null),
  });
};

export type DeployIAPMutationProps = {
  id: string;
};

export const useDeployIAPMutation = (
  onSuccess?: () => void,
  onError?: (e: Error) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: DeployIAPMutationProps) => {
      await graphQLService.deployIap(props.id);
      return props.id;
    },

    onSuccess: (iapId) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [IAPS_QUERY] }),
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
