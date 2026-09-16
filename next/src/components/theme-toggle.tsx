"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <Button variant="outline" size="icon-lg" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={`Use ${dark ? "light" : "dark"} theme`}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

