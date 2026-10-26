import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function SupabaseConfigStatus() {
  if (getSupabasePublicConfig()) {
    return null;
  }

  return (
    <p className="config-notice" role="status">
      Account and data services are not configured. Set the Supabase URL and anon key in your
      local environment to enable them.
    </p>
  );
}