"use client";

import { useActionState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { updateProfileSettings, type SettingsActionState } from "@/app/(app)/settings/actions";

const initialState: SettingsActionState = { status: "idle" };

export function SettingsForm({
  displayName,
  defaultCurrency,
  theme,
}: {
  displayName: string;
  defaultCurrency: string;
  theme: "light" | "dark" | "system";
}) {
  const [state, action, pending] = useActionState(updateProfileSettings, initialState);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (state.status === "success" && state.theme) {
      setTheme(state.theme);
    }
  }, [setTheme, state]);

  return (
    <form action={action} className="settings-form">
      <label className="field-label" htmlFor="settings-name">
        Display name
        <input
          autoComplete="name"
          defaultValue={displayName}
          id="settings-name"
          maxLength={80}
          minLength={2}
          name="displayName"
          required
        />
      </label>
      <label className="field-label" htmlFor="settings-currency">
        Default currency
        <input
          autoCapitalize="characters"
          defaultValue={defaultCurrency}
          id="settings-currency"
          maxLength={3}
          minLength={3}
          name="defaultCurrency"
          pattern="[A-Za-z]{3}"
          required
        />
      </label>
      <label className="field-label" htmlFor="settings-theme">
        Theme
        <select defaultValue={theme} id="settings-theme" name="theme">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      {state.message && (
        <p className={state.status === "error" ? "auth-feedback auth-error" : "auth-feedback auth-success"}
          role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}