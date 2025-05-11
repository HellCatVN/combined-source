export * from './payloadRules';
export * from './rules';
import { z } from 'zod';
import { balanceRules } from './rules';
import { originUpdateUserPayloadSchema } from '@plugins/users/rules/payload.rule';

export const customUserPayloadRules = (userRoles: { [role: string]: string }) => {
  const roleRules = z.string().refine(
    value => {
      const roles = Object.keys(userRoles).map(key => userRoles[key]);
      return roles.includes(value);
    },
    {
      message: 'Invalid user role',
    }
  );

  return z
    .object({
      ...originUpdateUserPayloadSchema,
      balance: balanceRules,
      role: roleRules,
    })
    .partial();
};
