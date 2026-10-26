import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

import { proxy } from "../proxy";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-publishable-key");
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mocks.createServerClient.mockImplementation((_url, _key, options) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([
          { name: "sb-access-token", value: "refreshed-token", options: { path: "/" } },
        ]);
        return mocks.getUser();
      },
    },
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Supabase session proxy", () => {
  it("writes refreshed cookies to the request and response", async () => {
    const request = new NextRequest("http://localhost:3000/transactions");
    const response = await proxy(request);

    expect(mocks.getUser).toHaveBeenCalled();
    expect(request.cookies.get("sb-access-token")?.value).toBe("refreshed-token");
    expect(response.cookies.get("sb-access-token")?.value).toBe("refreshed-token");
  });
});