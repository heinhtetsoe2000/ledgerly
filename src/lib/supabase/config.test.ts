import { describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

describe("getSupabasePublicConfig", () => {
  it("returns null when configuration is missing", () => {
    expect(getSupabasePublicConfig({})).toBeNull();
  });

  it("accepts a valid HTTPS endpoint and publishable key", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-key",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      anonKey: "public-publishable-key",
    });
  });

  it("accepts HTTP only for loopback development endpoints", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
      })?.url,
    ).toBe("http://127.0.0.1:54321");
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://example.com",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-key",
      }),
    ).toBeNull();
  });

  it("accepts the legacy anon key variable", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("rejects an invalid endpoint", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      }),
    ).toBeNull();
  });
});