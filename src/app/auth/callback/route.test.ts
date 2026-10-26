import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/auth/callback/route";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  });
});

describe("Supabase auth callback", () => {
  it("exchanges the code and redirects to the requested local path", async () => {
    const response = await GET(new Request(
      "http://localhost:3000/auth/callback?code=exchange-code&next=%2Freset-password",
    ));

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("exchange-code");
    expect(response.headers.get("location")).toBe("http://localhost:3000/reset-password");
  });

  it("rejects external redirect destinations", async () => {
    const response = await GET(new Request(
      "http://localhost:3000/auth/callback?code=exchange-code&next=%2F%2Fevil.example",
    ));

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("returns to sign-in when code exchange fails", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid code") });
    const response = await GET(new Request("http://localhost:3000/auth/callback?code=bad"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/sign-in?error=callback");
  });
});