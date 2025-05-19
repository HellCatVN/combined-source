import { z } from 'zod';

export const nameRules = z.string().min(1, 'Name is required');
export const descriptionRules = z.string().min(1, 'Description is required');
export const permissionRules = z.array(
  z.object({
    resource: z.string().min(1, 'Resource is required'),
    action: z.string().min(1, 'Action is required'),
  })
);
export const allowedActionsRules = z.array(z.string().min(1, 'Action is required'));
export const isActiveRules = z.boolean();

export const pathRules = z.string().min(1, 'Path is required');
export const methodRules = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], {
  required_error: 'Method is required',
  invalid_type_error: 'Invalid HTTP method',
});