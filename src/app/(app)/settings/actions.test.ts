import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateProfileSettings } from "@/app/(app)/settings/actions";

const mocks = vi.hoisted(() => {
  const profiles = { upsert: vi.fn() };
  const authGetUser = vi.fn();
  const from = vi.fn(() => profiles);
  const createSupabaseServerClient = vi.fn(async () => ({
    auth: { getUser: authGetUser },
    from,
  }));

  return { authGetUser, createSupabaseServerClient, from, profiles };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const userId = "10000000-0000-4000-8000-000000000001";

function settingsFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    displayName: "Ada Ledger",
    defaultCurrency: "EUR",
    theme: "dark",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mocks.profiles.upsert.mockResolvedValue({ error: null });
});

describe("profile settings action", () => {
  it("saves preferences for the authenticated user and returns the theme", async () => {
    const result = await updateProfileSettings({ status: "idle" }, settingsFormData());

    expect(result).toEqual({ status: "success", message: "Settings saved.", theme: "dark" });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.profiles.upsert).toHaveBeenCalledWith({
      id: userId,
      display_name: "Ada Ledger",
      default_currency: "EUR",
      theme: "dark",
    }, { onConflict: "id" });
  });

  it("rejects an invalid currency before database access", async () => {
    const result = await updateProfileSettings(
      { status: "idle" },
      settingsFormData({ defaultCurrency: "EURO" }),
    );

    expect(result.status).toBe("error");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects writes without a verified user", async () => {
    mocks.authGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await updateProfileSettings({ status: "idle" }, settingsFormData());

    expect(result.status).toBe("error");
    expect(mocks.profiles.upsert).not.toHaveBeenCalled();
  });
});