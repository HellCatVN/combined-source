import store from '@stores';
import { appendRequest, removeRequest } from '@stores/global.store';
import { setAuthState } from '@stores/user.store';
import { generateId, getError } from '@utils';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { projectBaseAPIConfigs } from './configs';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  requestId?: string;
}

interface CustomAxiosResponseConfig extends AxiosResponse {
  requestId?: string;
}

export const axiosInstance = axios.create({
  timeout: 6000,
});

axiosInstance.defaults.baseURL = projectBaseAPIConfigs.url;
axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(
  config => {
    const requestId = generateId();
    (config as CustomAxiosRequestConfig).requestId = requestId;
    store.dispatch(appendRequest(requestId));

    return config;
  },
  error => {
    const requestId = (error.config as CustomAxiosRequestConfig).requestId;
    if (requestId) {
      store.dispatch(removeRequest(requestId));
    }
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    const requestId = (response.config as CustomAxiosResponseConfig).requestId;
    if (requestId) {
      store.dispatch(removeRequest(requestId));
    }
    return response;
  },
  async error => {
    const requestId = (error.config as CustomAxiosRequestConfig).requestId;
    if (requestId) {
      store.dispatch(removeRequest(requestId));
    }
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status !== 404) {
      try {
        if (axiosError!.response!.status === 401 || error.response.forceLogout === true) {
          store.dispatch(
            setAuthState({
              error: getError(axiosError.message),
              isAuthenticated: false,
              user: null,
            })
          );
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
