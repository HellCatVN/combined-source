import type { ISuccessResponse } from '@interfaces';
import type { IEditSystemSettingsForm, ISystemSettings } from 'interfaces/systemSettings.interface';
import { axiosInstance } from '../axiosClient';
import { projectBaseAPIConfigs } from '../configs';

export const fetchSystemSettings = async (signal?: AbortSignal) => {
  const response = await axiosInstance.get<ISuccessResponse<ISystemSettings>>(
    `${projectBaseAPIConfigs.url}${projectBaseAPIConfigs.systemSettings.url}`,
    { signal }
  );
  return response.data;
};

export const updateSystemSettings = async (data: IEditSystemSettingsForm, signal?: AbortSignal) => {
  const response = await axiosInstance.patch<ISuccessResponse<ISystemSettings>>(
    `${projectBaseAPIConfigs.url}${projectBaseAPIConfigs.systemSettings.url}`,
    data,
    { signal }
  );
  return response.data;
};
