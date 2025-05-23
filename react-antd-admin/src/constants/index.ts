export * from './env';

export const DEFAULT_PAGINATION_DATA = {
  data: [],
  pagination: {
    current_page: 0,
    limit: 0,
    skip: 0,
    total: 0,
  },
};


export const USER_STATUS = {
    active: 'active',
    lock: 'lock',
};
