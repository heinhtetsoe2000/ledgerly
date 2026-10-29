"use client";

import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  Settings,
  Tags,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";

const navigationItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/reports", label: "Financial Analysis", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="primary-nav">
      {navigationItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link aria-current={isActive ? "page" : undefined} aria-label={label} href={href} key={href}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="Ledgerly overview" className="brand-lockup" href="/">
      <span className="brand-mark"><WalletCards aria-hidden="true" size={21} /></span>
      {!compact && (
        <span>
          <span className="brand-name">Ledgerly</span>
          <span className="brand-caption">Personal finance</span>
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  const pathname = usePathname();
  const currentPageLabel = navigationItems.find(({ href }) => (
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
  ))?.label ?? "Overview";

  return (
    <div className="app-shell">
      <aside aria-label="Application sidebar" className="sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-note">A clearer view of your money</div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand"><Brand compact /></div>
          <span className="topbar-label">{currentPageLabel}</span>
          <div className="topbar-actions">
            <ThemeToggle />
            <div className="account-chip">
              <span>{userEmail}</span>
              <SignOutButton />
            </div>
          </div>
        </header>
        <div className="mobile-nav"><Navigation /></div>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}