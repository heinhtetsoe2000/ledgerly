"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSettingsSchema, type ProfileSettings } from "@/lib/validation/settings";

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  theme?: ProfileSettings["theme"];
};

export async function updateProfileSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = profileSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    defaultCurrency: formData.get("defaultCurrency"),
    theme: formData.get("theme"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Check the name, currency code, and theme." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Account settings are not configured." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sign in again to update your settings." };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: parsed.data.displayName,
      default_currency: parsed.data.defaultCurrency,
      theme: parsed.data.theme,
    }, { onConflict: "id" });

  if (error) {
    return { status: "error", message: "Could not save settings. Try again later." };
  }

  revalidatePath("/settings");
  return { status: "success", message: "Settings saved.", theme: parsed.data.theme };
}