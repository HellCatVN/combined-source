import { z } from "zod";

export const userInfoValidatorSchema = z.object({
  user: z.object({
    _id: z.string().min(1),
    name: z.string().min(1),
    username: z.string().min(1),
    email: z.string().min(1).email(),
    role: z.string().min(1),
  }),
});

export type TValidatorUserInfo = typeof userInfoValidatorSchema;
