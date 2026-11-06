"use client";

import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

/** Each loads only when it's opened: none of them, nor what they're built on, weighs on the archive. */
const DEMOS: Record<string, ComponentType> = {
  "maze-walk": dynamic(() => import("./PetBuddyPathHero").then((m) => () => <m.default interactive />), { ssr: false }),
  hello: dynamic(() => import("./PetBuddyGreeting"), { ssr: false }),
  "tab-hop": dynamic(() => import("./TabHop"), { ssr: false }),
  "notch-card": dynamic(() => import("./NotchCard"), { ssr: false }),
  "scratch-card": dynamic(() => import("./ScratchCardDemo"), { ssr: false }),
  "nav-scrubber": dynamic(() => import("./NavScrubber"), { ssr: false }),
  "chat-quiz": dynamic(() => import("./chat-quiz/ChatQuiz"), { ssr: false }),
};

/** Chat Quiz has a replay of its own. */
const OWN_REPLAY = new Set(["chat-quiz"]);

/**
 * An archive animation on a page of its own, which the archive's stage opens in a frame (Archive.tsx). The restart remounts it rather than
 * asking each one to reset: they range from a canvas to a custom element, and starting fresh works for all of them.
 * Keys go to the frame once it's in use, so Esc is passed up to shut the stage.
 */
export function Figure({ id }: { id: string }) {
  const [run, setRun] = useState(0);
  const Demo = DEMOS[id];

  useEffect(() => {
    if (window.parent === window) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) window.parent.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  return (
    // Centred while it fits; taller than a phone's frame, it scrolls from its top rather than losing it.
    <main className="relative flex h-svh w-full justify-center overflow-x-hidden overflow-y-auto bg-sheet p-lead [align-items:safe_center]">
      {!OWN_REPLAY.has(id) && (
        <button type="button" onClick={() => setRun(run + 1)} aria-label="Restart the animation" className="absolute right-3 bottom-3 z-40 grid size-9 place-items-center rounded-full bg-surface text-label shadow-[var(--media-shadow)] transition-colors hover:text-ink">
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      )}
      <Demo key={run} />
    </main>
  );
}
