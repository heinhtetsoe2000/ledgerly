import { z } from "zod";

export const categoryTypeSchema = z.enum(["income", "expense"]);

export const categoryIconSchema = z.enum([
  "utensils",
  "car-front",
  "shopping-bag",
  "house",
  "receipt",
  "heart-pulse",
  "clapperboard",
  "briefcase-business",
  "laptop",
  "building-2",
  "gift",
  "circle",
  "tag",
]);

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1).max(80),
  type: categoryTypeSchema,
  icon: categoryIconSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export type CategoryInput = z.infer<typeof categorySchema>;