import { useQuery } from '@tanstack/react-query';
import { graphQLService } from '@/services';

export const ACTIVITY_PROVIDERS_QUERY = 'activity-providers';

export const useActivityProvidersQuery = () => {
  return useQuery({
    queryKey: [ACTIVITY_PROVIDERS_QUERY],
    queryFn: async () => graphQLService.getAllActivityProviders(),
  });
};
