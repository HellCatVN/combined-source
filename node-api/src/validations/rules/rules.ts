import { z } from "zod";

export const passwordRules = z.string().min(5).max(32);

export const emailRules = z.string().email();
export const usernameRules = z.string().min(3).max(15);
export const nameRules = z.string().min(3).max(15);
export const phoneRules = z.string().regex(/^\d{10}$/, { message: 'Invalid phone number' });
export const balanceRules = z.number().int().min(0);