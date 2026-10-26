import { z } from "zod";

export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

export const profileSettingsSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  defaultCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  theme: themePreferenceSchema,
});

export type ProfileSettings = z.infer<typeof profileSettingsSchema>;