import { z } from "zod";
import { passwordRules, emailRules, nameRules, usernameRules, phoneRules } from "./rules";

export const loginPayloadRules = z.object({
  username: usernameRules,
  password: passwordRules,
});

export const registerPayloadRules = z.object({
  name: nameRules,
  username: usernameRules,
  phone: phoneRules,
  email: emailRules,
  password: passwordRules,
  confirmPassword: passwordRules
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})