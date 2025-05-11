import { customAPIConfigs } from '@bm/api';
import { ENV } from '@constants/env';

export const projectBaseAPIConfigs = {
  url: ENV.API_HOST + '/v1/en/',
  auth: {
    register: 'auth/register',
    login: 'auth/login',
    logout: 'auth/logout',
    myInfo: 'auth/my-account',
  },

  user: {
    url: '/users',
  },

  upload: {
    url: '/upload',
  },

  logs: {
    url: '/logs',
  },

  systemSettings: {
    url: '/system-settings',
  },

  ...customAPIConfigs,
};
