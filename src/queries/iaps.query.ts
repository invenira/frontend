import { useQuery } from '@tanstack/react-query';
import { IapService } from '@/services';
import { z } from 'zod';

const iapService = new IapService();

export const useIAPsQuery = () => {
  return useQuery({
    queryKey: ['iaps'],
    queryFn: async () => iapService.getAll(),
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
    queryFn: async () => iapService.getOne(id),
  });
};
