"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Sets the theme on <html> and remembers it. layout.tsx applies the remembered one before the first paint. */
function apply(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.dataset.theme = "dark";
  else delete root.dataset.theme;
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
  dispatchEvent(new Event("themechange"));
}

/**
 * Light and dark, cross-faded: the page as it was over the page as it is, on the compositor, so the work of repainting every colour
 * happens once, unseen, before it starts. Both icons are drawn and the CSS shows the right one, so the server's markup never disagrees
 * with the remembered theme.
 */
export function ThemeToggle({ className = "", plain = false }: { className?: string; plain?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync();
    addEventListener("themechange", sync);
    return () => removeEventListener("themechange", sync);
  }, []);

  const toggle = () => {
    const root = document.documentElement, dark = root.dataset.theme !== "dark";
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply(dark);
    root.dataset.vt = "fade";
    document.startViewTransition(() => apply(dark)).finished.finally(() => delete root.dataset.vt);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      onClick={toggle}
      className={`theme-toggle ${plain ? "" : "grid size-11 place-items-center rounded-[12px] bg-surface text-fg shadow-[var(--panel-shadow)] transition-[scale,background-color] duration-200 hover:bg-card active:scale-95"} ${className}`}
    >
      <span className="relative block size-[18px]">
        <Icon name="moon" size={18} className="theme-moon absolute inset-0" />
        <Icon name="sun" size={18} className="theme-sun absolute inset-0" />
      </span>
    </button>
  );
}
