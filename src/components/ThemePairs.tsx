"use client";

import { useEffect } from "react";

/**
 * A product screen captured in both themes (Pic: .pic-light / .pic-dark) is lazy in the markup, since the server can't know the
 * reader's theme. Here the half on show loads with the page, the way every other picture does (EARLY), instead of only when it
 * nears the screen. The hidden half stays unfetched until the theme switches to it, and then that whole set loads at once.
 */
export function ThemePairs() {
  useEffect(() => {
    const load = () =>
      document
        .querySelectorAll<HTMLImageElement>(document.documentElement.dataset.theme === "dark" ? "img.pic-dark" : "img.pic-light")
        .forEach((i) => (i.loading = "eager"));
    load();
    const watch = new MutationObserver(load);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watch.disconnect();
  }, []);
  return null;
}
