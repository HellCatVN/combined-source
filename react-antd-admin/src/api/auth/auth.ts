import { IPayloadLogin } from '@interfaces';
import { getError } from '@utils';
import { axiosInstance } from '../axiosClient';
import { projectBaseAPIConfigs } from '../configs';

export const initAuth = async () => {
  try {
    const response = await axiosInstance.get(projectBaseAPIConfigs.auth.myInfo);
    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
};

export const login = async (payload: IPayloadLogin) => {
  try {
    const response = await axiosInstance.post(projectBaseAPIConfigs.auth.login, payload);
    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post(projectBaseAPIConfigs.auth.logout);
    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
};
