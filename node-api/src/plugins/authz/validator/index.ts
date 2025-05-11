import { z } from 'zod';

export const abacConditionSchema = z.object({
  attribute: z.string().min(1),
  operator: z.enum([
    'equals',
    'notEquals',
    'contains',
    'greaterThan',
    'lessThan',
    'in',
    'notIn'
  ]),
  value: z.any()
}).required();

export const abacPolicySchema = z.object({
  resource: z.string().min(1),
  action: z.string().min(1),
  conditions: z.array(abacConditionSchema)
}).required();

export const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  abacPolicies: z.array(abacPolicySchema)
}).required();

export const editRoleAbacSchema = z.object({
  abacPolicies: z.array(abacPolicySchema)
}).required();

export const addAbacPolicySchema = z.object({
  policy: abacPolicySchema
}).required();

export const validateAccessSchema = z.object({
  roleId: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  context: z.record(z.any())
}).required();