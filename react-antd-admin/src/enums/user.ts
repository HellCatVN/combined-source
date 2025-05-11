import { customUserRole } from '@bm/enums';

export enum userStatus {
  active = 'active',
  lock = 'lock',
}

export enum userGender {
  male = 'male',
  female = 'female',
}

export enum originalUserRole {
  admin = 'admin',
  user = 'user',
  moderator = 'moderator',
}

export type userRole = originalUserRole | customUserRole;
