import axios from 'axios';

import type { IClientUser, ISuccessResponse } from '@interfaces';
import { axiosInstance } from '../axiosClient';
import { projectBaseAPIConfigs } from '../configs';

export const handleGetMyInfo = async (signal: any) => {
  const response = await axiosInstance.get<
    ISuccessResponse<{
      user: IClientUser;
    }>
  >(projectBaseAPIConfigs.auth.myInfo, { signal });
  return response.data;
};

export const handleLogout = async () => {
  const response = await axios.post<ISuccessResponse<IClientUser>>(
    projectBaseAPIConfigs.auth.logout
  );
  return response.data;
  // try {
  //   const response = await axios.post<any>(
  //     `${projectBaseAPIConfigs.url}${projectBaseAPIConfigs.auth.logout}`
  //   );

  //   return response.data;
  // } catch (error) {
  //   const axiosError = error as AxiosError<any>;
  //   return axiosError;
  // }
};
