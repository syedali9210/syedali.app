"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunMediumIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useClickSound } from "@/hooks/use-click-sound";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  className?: string;
}

/**
 * Icon button that flips light/dark with a click sound and a view
 * transition (crossfade) where supported.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [click] = useClickSound();
  const [mounted, setMounted] = useState(false);

  // next-themes' own documented hydration guard: `resolvedTheme` is
  // undefined during SSR (theme lives in localStorage), so this renders a
  // neutral placeholder server-side and swaps in the real icon only once
  // mounted client-side, avoiding a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const switchTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleClick = () => {
    click();
    if (!document.startViewTransition) switchTheme();
    else {
      const vt = document.startViewTransition(switchTheme);
      // Both reject when a transition is skipped or superseded (rapid
      // toggles, tab hidden mid-flight) — harmless, but unhandled they
      // surface as InvalidStateError unhandledRejections.
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Toggle theme"
      onClick={handleClick}
      className={cn("size-6 rounded-md", className)}
    >
      {mounted ? (
        <>
          <MoonIcon className="hidden [html.dark_&]:block" />
          <SunMediumIcon className="hidden [html.light_&]:block" />
        </>
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
