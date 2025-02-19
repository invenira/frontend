import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { graphQLService } from '@/services';

export const IAPS_QUERY = 'iaps';

export const useIAPsQuery = () => {
  return useQuery({
    queryKey: [IAPS_QUERY],
    queryFn: async () => graphQLService.getAll(),
  });
};

export const useIAPQuery = (id: string) => {
  z.string()
    .nonempty()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid IAP Id',
    })
    .parse(id);

  return useQuery({
    queryKey: [`iap-${id}`, id],
    queryFn: async () => graphQLService.getOne(id),
  });
};
