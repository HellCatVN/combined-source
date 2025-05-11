import { z } from "zod";
import {
  balanceRules,
  emailRules,
  nameRules,
  passwordRules,
  phoneRules,
  roleRules,
  usernameRules,
  statusRules,
} from "../rules";

export const validatorUser = z.object({
  _id: z.string().min(1),
  name: nameRules,
  username: usernameRules,
  email: emailRules,
  role: roleRules,
});

export const validatorUpdateUser = z
  .object({
    role: roleRules,
    phone: phoneRules,
    email: emailRules,
    balance: balanceRules,
    password: passwordRules,
    status: statusRules,
  })
  .partial();
