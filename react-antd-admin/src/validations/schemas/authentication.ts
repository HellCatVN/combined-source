import { z } from 'zod';

import { emailRules, nameRules, passwordRules, phoneRules, usernameRules } from '../rules';

export const validatorRegisterAccount = z
  .object({
    name: nameRules,
    username: usernameRules,
    email: emailRules,
    phone: phoneRules,
    password: passwordRules,
    confirmPassword: passwordRules,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const validatorLoginAccount = z.object({
  username: usernameRules,
  password: passwordRules,
});
