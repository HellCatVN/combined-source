import { z } from 'zod';
import { messageRules } from '../rules';

export const validatorSystemSettings = z.object({
  message: messageRules,
});
