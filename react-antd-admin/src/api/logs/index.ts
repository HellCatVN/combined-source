import { projectBaseAPIConfigs } from '@api/configs';
import type { ILog, IPaginationSuccessResponse, IPayloadGetLogs } from '@interfaces';
import { axiosInstance } from '../axiosClient';

export const getLogs = async (params: IPayloadGetLogs, signal?: AbortSignal) => {
  const response = await axiosInstance.get<IPaginationSuccessResponse<ILog[]>>(
    projectBaseAPIConfigs.logs.url,
    { signal, params }
  );
  return response.data;
};
