import { z } from 'zod';

export const validatorLog = z.object({
  userActionId: z.object({ username: z.string().min(1) }),
  action: z.string().min(1),
  record: z.string().min(1),
  schema: z.string().min(1),
  note: z.optional(z.string()),
});
