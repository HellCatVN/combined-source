import { z } from "zod";
import { SPECIAL_RESOURCES, SPECIAL_ACTIONS } from "../../authz/constants";

// Permission validation schema
export const permissionValidatorSchema = z.object({
  resource: z.union([
    z.literal(SPECIAL_RESOURCES.ALL),
    z.literal(SPECIAL_RESOURCES.WILDCARD),
    z.string().min(1)
  ]),
  action: z.union([
    z.literal(SPECIAL_ACTIONS.MANAGE),
    z.literal(SPECIAL_ACTIONS.ALL), 
    z.string().min(1)
  ])
});

// Role validation schema
export const roleValidatorSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(permissionValidatorSchema),
  isSystem: z.boolean().optional()
});

// Updated user info validator schema
export const userInfoValidatorSchema = z.object({
  user: z.object({
    _id: z.string().min(1),
    name: z.string().min(1),
    username: z.string().min(1),
    email: z.string().min(1).email(),
    role: z.union([z.string().min(1), roleValidatorSchema]),
    permissions: z.array(permissionValidatorSchema).optional()
  }).strict()
});

// Login payload validator schema
export const loginValidatorSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

// Registration payload validator schema
export const registerValidatorSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().min(1).email(),
  phone: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type TValidatorUserInfo = typeof userInfoValidatorSchema;
export type TValidatorPermission = typeof permissionValidatorSchema;
export type TValidatorRole = typeof roleValidatorSchema;
export type TValidatorLogin = typeof loginValidatorSchema;
export type TValidatorRegister = typeof registerValidatorSchema;
