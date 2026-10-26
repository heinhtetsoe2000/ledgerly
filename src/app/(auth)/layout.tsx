import type { ReactNode } from "react";

export default function AuthenticationLayout({ children }: { children: ReactNode }) {
  return <main className="auth-layout">{children}</main>;
}