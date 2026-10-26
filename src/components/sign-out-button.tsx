"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    setPending(true);
    await supabase.auth.signOut();
    router.replace("/sign-in");
    router.refresh();
    setPending(false);
  }

  return (
    <Button
      aria-label="Sign out"
      disabled={pending}
      onClick={handleSignOut}
      size="icon"
      title="Sign out"
      variant="ghost"
    >
      <LogOut aria-hidden="true" size={17} />
    </Button>
  );
}