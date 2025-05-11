import axios from 'axios';

import type { IClientUser, IPayloadLogin, ISuccessResponse } from '@interfaces';
import { projectBaseAPIConfigs } from '../configs';

/* Non Credential */

export const handleLogin = async (payload: IPayloadLogin) => {
  const response = await axios.post<ISuccessResponse<{ user: IClientUser }>>(
    projectBaseAPIConfigs.auth.login,
    payload
  );
  return response.data;
};

export const handleRegister = async (data: any) => {
  const response = await axios.post<any>(
    `${projectBaseAPIConfigs.url}${projectBaseAPIConfigs.auth.register}`,
    data
  );

  return response.data;
};
