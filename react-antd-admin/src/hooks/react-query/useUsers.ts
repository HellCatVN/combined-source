import { useMutation, useQuery } from 'react-query';

import { userApi } from '@api';
import type { IPayloadGetUsers, ISelfUpdateForm } from '@interfaces';
import { IEditUserForm } from 'interfaces';

export const useGetUsers = (params: IPayloadGetUsers) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: ({ signal }) => userApi.getUsers(params, signal),
    refetchOnWindowFocus: false,
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: (username: string) => userApi.deleteUser(username),
  });
};

export const useGetUser = (userId?: string) => {
  return useQuery({
    queryKey: ['users', userId],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => userApi.getUser(userId!, signal),
    refetchOnWindowFocus: false,
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ username, payload }: { username: string; payload: IEditUserForm }) =>
      userApi.updateUser(username, payload),
  });
};

export const useSelfUpdateUser = () => {
  return useMutation({
    mutationFn: ({ username, payload }: { username: string; payload: ISelfUpdateForm }) =>
      userApi.selfUpdateUser(username, payload),
  });
};
