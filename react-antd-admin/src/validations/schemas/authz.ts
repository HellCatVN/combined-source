import { z } from 'zod';
import {
  nameRules,
  descriptionRules,
  permissionRules,
  allowedActionsRules,
  isActiveRules,
  pathRules,
  methodRules
} from '../rules/authz';

export const validatorUpdateRole = z.object({
  name: nameRules,
  description: descriptionRules,
  permissions: permissionRules,
});

export const validatorCreateRole = validatorUpdateRole;

export const validatorResponseUpdateRole = z.object({
  message: z.string(),
  data: z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string(),
    permissions: permissionRules,
    isSystem: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const validatorUpdateResource = z.object({
  name: nameRules,
  description: descriptionRules,
  allowedActions: allowedActionsRules,
  isActive: isActiveRules,
});

export const validatorCreateResource = validatorUpdateResource;

export const validatorResponseUpdateResource = z.object({
  message: z.string(),
  data: z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string(),
    allowedActions: allowedActionsRules,
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const validatorResponseCreateResource = validatorResponseUpdateResource;

export const validatorUpdateEndpointPermission = z.object({
  path: pathRules,
  method: methodRules,
  resource: nameRules,
  action: z.string().min(1, 'Action is required'),
  description: descriptionRules.optional(),
  isActive: isActiveRules,
});

export const validatorCreateEndpointPermission = validatorUpdateEndpointPermission;

export const validatorResponseUpdateEndpointPermission = z.object({
  message: z.string(),
  data: z.object({
    _id: z.string(),
    path: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    resource: z.string(),
    action: z.string(),
    description: z.string().optional(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});