import { emailRules, passwordRules, phoneRules, roleRules } from "./user.rule";
import { z } from "zod";

export const originUpdateUserPayloadSchema = {
  role: roleRules,
  phone: phoneRules,
  email: emailRules,
  password: passwordRules,
};

export const originUpdateUserPayloadRules = z
  .object({
    ...originUpdateUserPayloadSchema,
  })
  .partial();
