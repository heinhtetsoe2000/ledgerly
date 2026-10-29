"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

const modeContent: Record<AuthMode, { title: string; subtitle: string; button: string }> = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to continue to your finances.",
    button: "Sign in",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Start keeping your financial life in view.",
    button: "Create account",
  },
  "forgot-password": {
    title: "Reset your password",
    subtitle: "We’ll send instructions if an account matches that email.",
    button: "Send reset link",
  },
  "reset-password": {
    title: "Choose a new password",
    subtitle: "Use at least eight characters for your new password.",
    button: "Update password",
  },
};

function getAuthRedirectBaseUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configuredSiteUrl?.replace(/\/+$/, "") || window.location.origin;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const content = modeContent[mode];
  const isSignIn = mode === "sign-in";
  const isSignUp = mode === "sign-up";
  const isForgotPassword = mode === "forgot-password";
  const isResetPassword = mode === "reset-password";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Account access is not configured. Check your Supabase environment settings.");
      return;
    }

    setPending(true);
    try {
      if (isSignIn) {
        const parsed = signInSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
        });
        if (!parsed.success) {
          setError("Enter a valid email and a password with at least eight characters.");
          return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
        if (authError) {
          setError("Email or password is incorrect.");
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }

      if (isSignUp) {
        const parsed = signUpSchema.safeParse({
          displayName: formData.get("displayName"),
          email: formData.get("email"),
          password: formData.get("password"),
        });
        if (!parsed.success) {
          setError("Enter your name, a valid email, and a password with at least eight characters.");
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${getAuthRedirectBaseUrl()}/auth/callback`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (authError) {
          setError("Could not create the account. Check your details and try again.");
          return;
        }
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }
        setMessage("Check your email to finish creating your account.");
        return;
      }

      if (isForgotPassword) {
        const email = String(formData.get("email") ?? "");
        if (!email || !signInSchema.shape.email.safeParse(email).success) {
          setError("Enter a valid email address.");
          return;
        }
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${getAuthRedirectBaseUrl()}/auth/callback?next=/reset-password`,
        });
        setMessage("If an account matches that email, password reset instructions are on the way.");
        return;
      }

      if (isResetPassword) {
        const password = String(formData.get("password") ?? "");
        const parsed = signInSchema.shape.password.safeParse(password);
        if (!parsed.success) {
          setError("Use a password with at least eight characters.");
          return;
        }
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) {
          setError("The reset link may have expired. Request a new one and try again.");
          return;
        }
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="auth-title" className="auth-card">
      <header className="auth-card-header">
        <Link aria-label="Ledgerly home" className="auth-brand" href="/sign-in">
          <span className="brand-mark">L</span>
          <span>Ledgerly</span>
        </Link>
        <h1 id="auth-title">{content.title}</h1>
        <p className="auth-subtitle">{content.subtitle}</p>
      </header>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignUp && (
          <label className="field-label" htmlFor="displayName">
            Display name
            <input autoComplete="name" id="displayName" maxLength={80} name="displayName" required />
          </label>
        )}
        {!isResetPassword && (
          <label className="field-label" htmlFor="email">
            Email address
            <input autoComplete="email" id="email" name="email" required type="email" />
          </label>
        )}
        {!isForgotPassword && (
          <label className="field-label" htmlFor="password">
            Password
            <input
              autoComplete={isResetPassword ? "new-password" : isSignUp ? "new-password" : "current-password"}
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
        )}
        {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
        {message && <p className="auth-feedback auth-success" role="status">{message}</p>}
        <Button className="auth-submit" disabled={pending} type="submit">
          {pending ? "Please wait…" : content.button}
        </Button>
      </form>
      <div className="auth-links">
        {isSignIn && (
          <>
            <Link href="/forgot-password">Forgot password?</Link>
            <span>New to Ledgerly? <Link href="/sign-up">Create an account</Link></span>
          </>
        )}
        {isSignUp && <span>Already have an account? <Link href="/sign-in">Sign in</Link></span>}
        {isForgotPassword && <Link href="/sign-in">Back to sign in</Link>}
      </div>
    </section>
  );
}