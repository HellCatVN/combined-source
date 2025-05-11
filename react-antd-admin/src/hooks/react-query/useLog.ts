import { useQuery } from 'react-query';

import { logApi } from '@api';

export const useGetLogs = (params: any) => {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: ({ signal }) => logApi.getLogs(params, signal),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
