import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { themePreferenceSchema } from "@/lib/validation/settings";

export const instant = false;

export default async function SettingsPage() {
  await connection();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  const { data: profile, error } = await supabase!
    .from("profiles")
    .select("display_name, default_currency, theme")
    .eq("id", user!.id)
    .maybeSingle();
  const theme = themePreferenceSchema.safeParse(profile?.theme);

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Settings</h1>
          <p className="page-description">Manage the preferences used across your workspace.</p>
        </div>
      </header>
      {error && (
        <p className="config-notice" role="status">
          Profile settings are unavailable until the database migrations are applied.
        </p>
      )}
      <section aria-label="Profile preferences" className="settings-section">
        <SettingsForm
          defaultCurrency={profile?.default_currency ?? "USD"}
          displayName={profile?.display_name ?? String(user!.user_metadata.display_name ?? "")}
          theme={theme.success ? theme.data : "system"}
        />
      </section>
    </div>
  );
}