import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { SPECIAL_RESOURCES, SPECIAL_ACTIONS, SUPERADMIN_ROLE } from '../constants/permissions';

export type Actions = 'read' | 'write' | 'list' | 'create' | 'update' | 'delete' | 'manage' | '*';
export type Subjects = 'resources' | 'users' | 'logs' | 'plugins' | 'settings' | 'all' | '*' | string;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface Permission {
  action: string;
  resource: string;
}

interface UserRole {
  permissions?: Permission[];
  role?: string;
}

export function defineAbilityFor(user: UserRole) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  
  // Check for superadmin role
  if (user.role === SUPERADMIN_ROLE) {
    can('manage', 'all');
    return build();
  }

  // Map role permissions
  user.permissions?.forEach((permission: Permission) => {
    const { action, resource } = permission;

    // Handle special resources
    if (resource === SPECIAL_RESOURCES.ALL || resource === SPECIAL_RESOURCES.WILDCARD) {
      if (action === SPECIAL_ACTIONS.ALL || action === SPECIAL_ACTIONS.MANAGE) {
        can('manage', 'all');
      } else {
        can(action as Actions, 'all');
      }
      return;
    }

    // Handle special actions
    if (action === SPECIAL_ACTIONS.ALL || action === SPECIAL_ACTIONS.MANAGE) {
      can('manage', resource as Subjects);
      return;
    }

    // Regular resource/action matching
    can(action as Actions, resource as Subjects);
  });

  return build();
}

// Create initial ability instance
export const initialAbility = defineAbilityFor({ permissions: [] });

// Create ability context
export const AbilityContext = createContext<AppAbility>(initialAbility);

// Create Can component that will be used to check permissions
export const Can = createContextualCan(AbilityContext.Consumer);