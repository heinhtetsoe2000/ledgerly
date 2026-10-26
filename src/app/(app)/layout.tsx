import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ApplicationLayout({ children }: { children: ReactNode }) {
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/sign-in");
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/sign-in");
  }

  return <AppShell userEmail={user.email ?? ""}>{children}</AppShell>;
}