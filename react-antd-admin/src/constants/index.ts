import { CUSTOM_USER_ROLES } from '@bm/constants';

export * from '@bm/constants';
export * from './env';

export const USER_ROLES = {
  admin: 'admin',
  user: 'user',
  moderator: 'moderator',
  ...CUSTOM_USER_ROLES,
};

export const USER_STATUS = {
  active: 'active',
  lock: 'lock',
};

export const DEFAULT_PAGINATION_DATA = {
  data: [],
  pagination: {
    current_page: 0,
    limit: 0,
    skip: 0,
    total: 0,
  },
};
