import type { IClientAsset, ISuccessResponse } from '@interfaces';
import { axiosInstance } from '../axiosClient';

export const uploadFile = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('file', file));
  const response = await axiosInstance.post<ISuccessResponse<IClientAsset[]>>('/upload', formData);

  return response.data;
};
