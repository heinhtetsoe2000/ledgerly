import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ auth: authMocks }),
}));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.signInWithPassword.mockResolvedValue({ error: null });
  authMocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  authMocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  authMocks.updateUser.mockResolvedValue({ error: null });
});

describe("authentication forms", () => {
  it("renders labeled registration fields", () => {
    render(<AuthForm mode="sign-up" />);

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeTruthy();
    expect(screen.getByLabelText("Display name")).toBeTruthy();
    expect(screen.getByLabelText("Email address")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("does not ask for an email address when setting a new password", () => {
    render(<AuthForm mode="reset-password" />);

    expect(screen.getByRole("heading", { name: "Choose a new password" })).toBeTruthy();
    expect(screen.queryByLabelText("Email address")).toBeNull();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("provides an enumeration-safe password reset prompt", () => {
    render(<AuthForm mode="forgot-password" />);

    expect(screen.getByText("We’ll send instructions if an account matches that email.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send reset link" })).toBeTruthy();
  });

  it("signs in with validated credentials and redirects to the overview", async () => {
    render(<AuthForm mode="sign-in" />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "USER@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    }));
    expect(routerMocks.replace).toHaveBeenCalledWith("/");
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("does not call Supabase when sign-in input is invalid", async () => {
    render(<AuthForm mode="sign-in" />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "invalid" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(authMocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("starts registration and gives the same confirmation message", async () => {
    render(<AuthForm mode="sign-up" />);
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Ada Ledger" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect((await screen.findByRole("status")).textContent).toContain(
      "Check your email to finish creating your account.",
    );
    expect(authMocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "ada@example.com",
      options: expect.objectContaining({ data: { display_name: "Ada Ledger" } }),
    }));
  });

  it("requests password reset without exposing account existence", async () => {
    render(<AuthForm mode="forgot-password" />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect((await screen.findByRole("status")).textContent).toContain(
      "If an account matches that email, password reset instructions are on the way.",
    );
    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "ada@example.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/auth/callback?next=/reset-password") }),
    );
  });

  it("updates a password from the recovery session", async () => {
    render(<AuthForm mode="reset-password" />);
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "new-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(authMocks.updateUser).toHaveBeenCalledWith({ password: "new-password-123" }));
    expect(routerMocks.replace).toHaveBeenCalledWith("/");
  });
});