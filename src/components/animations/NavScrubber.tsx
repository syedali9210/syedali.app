"use client";

import { useState } from "react";
import ScrubberTabBar from "./ScrubberTabBar";

const PLACES = ["Home", "Work", "Archive", "Experience", "About"].map((label) => ({ key: label, label }));

/** The scrubber on its own, with the place it's on written over it. Press it, hold and slide, let go. */
export default function NavScrubber() {
  const [at, setAt] = useState("Archive");
  return (
    <div className="flex w-full flex-col items-center gap-lead text-center">
      <p className="font-serif text-headline text-ink">{at}</p>
      <ScrubberTabBar items={PLACES} activeKey={at} onSelect={setAt} aria-label="Places to go" />
      <p className="max-w-xs text-small text-label">Press it, then hold and drag left or right.</p>
    </div>
  );
}
