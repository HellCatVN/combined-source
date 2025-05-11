import type {
  IClientUser,
  IPaginationSuccessResponse,
  IPayloadGetUsers,
  ISelfUpdateForm,
  ISuccessResponse,
} from '@interfaces';
import { IEditUserForm } from 'interfaces';
import { axiosInstance } from '../axiosClient';
import { projectBaseAPIConfigs } from '../configs';

export const getUsers = async (params: IPayloadGetUsers, signal?: AbortSignal) => {
  const response = await axiosInstance.get<IPaginationSuccessResponse<IClientUser[]>>(
    projectBaseAPIConfigs.user.url,
    { signal, params }
  );
  return response.data;
};

export const deleteUser = async (username: string, signal?: AbortSignal) => {
  const response = await axiosInstance.delete<ISuccessResponse<IClientUser>>(
    `${projectBaseAPIConfigs.user.url}/${username}`,
    { signal }
  );
  return response.data;
};

export const getUser = async (username: string, signal?: AbortSignal) => {
  const response = await axiosInstance.get<ISuccessResponse<IClientUser>>(
    `${projectBaseAPIConfigs.user.url}/${username}`,
    {
      signal,
    }
  );
  return response.data;
};

export const updateUser = async (
  username: string,
  payload: IEditUserForm,
  signal?: AbortSignal
) => {
  const response = await axiosInstance.patch<ISuccessResponse<IClientUser>>(
    `${projectBaseAPIConfigs.user.url}/${username}`,
    payload,
    { signal }
  );
  return response.data;
};

export const selfUpdateUser = async (
  username: string,
  payload: ISelfUpdateForm,
  signal?: AbortSignal
) => {
  const response = await axiosInstance.post<ISuccessResponse<IClientUser>>(
    `${projectBaseAPIConfigs.user.url}/${username}`,
    {
      ...payload,
    },
    { signal }
  );
  return response.data;
};
