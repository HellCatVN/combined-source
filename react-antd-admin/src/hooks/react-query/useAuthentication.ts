import { useMutation, useQuery } from 'react-query';

import { handleGetMyInfo, handleLogin, handleLogout } from '@api/auth';
import type { IClientUser, IPayloadLogin, ISuccessResponse } from '@interfaces';

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: IPayloadLogin) => handleLogin(payload),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: handleLogout,
  });
};

export const useInitAuth = (
  enabled: boolean,
  nextSuccess?: (
    response: ISuccessResponse<{
      user: IClientUser;
    }>
  ) => void,
  nextError?: (error: unknown) => void
) => {
  return useQuery({
    retry: 0,
    enabled: enabled,
    refetchOnWindowFocus: false,
    queryKey: ['my-account'],
    queryFn: ({ signal }) => handleGetMyInfo(signal),
    onSuccess: nextSuccess,
    onError: nextError,
  });
};
