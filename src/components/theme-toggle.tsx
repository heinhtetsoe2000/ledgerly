"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon"
      title="Toggle color theme"
      variant="ghost"
    >
      <Moon aria-hidden="true" className="dark:hidden" size={18} />
      <Sun aria-hidden="true" className="hidden dark:block" size={18} />
    </Button>
  );
}