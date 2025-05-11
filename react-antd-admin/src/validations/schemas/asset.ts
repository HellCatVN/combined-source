import { z } from 'zod';

export const validatorAsset = z.object({
  _id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1).url(),
});
