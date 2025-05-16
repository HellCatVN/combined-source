export const SPECIAL_RESOURCES = {
  ALL: 'all',
  WILDCARD: '*'
} as const;

export const SPECIAL_ACTIONS = {
  MANAGE: 'manage',
  ALL: '*'
} as const;

export const SUPERADMIN_ROLE = 'superadmin';

export type SpecialResource = typeof SPECIAL_RESOURCES[keyof typeof SPECIAL_RESOURCES];
export type SpecialAction = typeof SPECIAL_ACTIONS[keyof typeof SPECIAL_ACTIONS];