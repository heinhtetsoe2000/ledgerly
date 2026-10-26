import { z } from "zod";

export const emailSchema = z.email().trim().toLowerCase();

export const passwordSchema = z.string().min(8).max(72);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
});