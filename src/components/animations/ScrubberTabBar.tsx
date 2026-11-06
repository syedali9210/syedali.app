"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "./cn";

const ACCENT = "var(--color-accent)";
const SPRING = { type: "spring" as const, bounce: 0.2, duration: 0.35 };
// Distance you have to drag, from wherever the *last* step landed, to
// trigger the next one — re-anchors to the current finger position after
// each step so small wobbles near a boundary don't flip-flop the selection.
const THRESHOLD_PX = 40;

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
}

export interface ScrubberTabBarItem {
  key: string;
  label: string;
}

interface ScrubberTabBarProps {
  items: ScrubberTabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Tailwind gap class between labels in the scrolling strip. */
  gapClassName?: string;
  "aria-label"?: string;
}

/**
 * The one mobile/tablet nav bar mechanic, shared by the portfolio's own
 * MobileNav and the animations showcase's AnimationsMobileNav — same look,
 * same drag physics, regardless of whether onSelect scrolls to a same-page
 * section or pushes a route.
 *
 * A horizontally scrolling name strip instead of a row of icons, so the
 * destination is always legible. Press it and it grows slightly (the
 * "picked up" cue); hold and slide left/right and it steps between entries
 * every THRESHOLD_PX of travel, re-anchoring after each step, with a short
 * haptic buzz per step. Release to commit via onSelect. Neighbors fade
 * toward the pill's edges via a mask-image so the strip reads as a
 * continuous scrub, not a page of buttons.
 *
 * While pressed, a second round pill fades in just above the strip
 * mirroring the current label in the accent color — your thumb covers the
 * strip itself during the drag, so without this there'd be no way to tell
 * which entry you're scrubbing toward until you let go.
 */
export default function ScrubberTabBar({
  items,
  activeKey,
  onSelect,
  gapClassName = "gap-6",
  "aria-label": ariaLabel,
}: ScrubberTabBarProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [pressing, setPressing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const anchorX = useRef(0);
  const currentIndex = useRef(0);
  const pointerId = useRef<number | null>(null);

  const activeIndex = Math.max(0, items.findIndex((it) => it.key === activeKey));
  const shownIndex = previewIndex ?? activeIndex;
  const shownItem = items[shownIndex];

  useLayoutEffect(() => {
    function measure() {
      const pill = pillRef.current;
      const item = itemRefs.current.get(shownItem?.key ?? "");
      if (!pill || !item) return;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      setOffset(pill.clientWidth / 2 - itemCenter);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [shownItem?.key]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setPressing(true);
    currentIndex.current = activeIndex;
    anchorX.current = e.clientX;
    setPreviewIndex(activeIndex);
    pointerId.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic/unsupported pointer id — dragging still works via move events.
    }
  }

  // Horizontal delta only — e.clientY is never read, so vertical finger
  // drift can't change the selection.
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - anchorX.current;
    if (dx > THRESHOLD_PX && currentIndex.current < items.length - 1) {
      currentIndex.current += 1;
      anchorX.current = e.clientX;
      setPreviewIndex(currentIndex.current);
      vibrate();
    } else if (dx < -THRESHOLD_PX && currentIndex.current > 0) {
      currentIndex.current -= 1;
      anchorX.current = e.clientX;
      setPreviewIndex(currentIndex.current);
      vibrate();
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setPressing(false);
    const item = items[previewIndex ?? activeIndex];
    if (item && item.key !== activeKey) onSelect(item.key);
    setPreviewIndex(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // No-op if capture was never established.
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {pressing && shownItem && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={SPRING}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2"
          >
            <div className="rounded-full bg-surface px-4 py-2 shadow-[var(--panel-shadow)]">
              <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: ACCENT }}>
                {shownItem.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl bg-surface shadow-[var(--panel-shadow)]">
        <motion.div
          ref={pillRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          animate={{ scale: pressing ? 1.05 : 1 }}
          transition={SPRING}
          role="tablist"
          aria-label={ariaLabel}
          className="relative h-11 w-52 shrink-0 cursor-pointer touch-none overflow-hidden rounded-3xl select-none"
        >
          {/* Fixed-size frame matching the pill exactly, holding the mask —
              the gradient's stops need to be relative to the *visible* pill
              width, not the much-wider scrolling track, so the mask lives
              here and the track (which does the actual moving) nests
              inside it. */}
          <div
            className="absolute inset-0"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
            }}
          >
            <motion.div
              className={cn("absolute top-1/2 left-0 flex items-center whitespace-nowrap", gapClassName)}
              animate={{ x: offset, y: "-50%" }}
              transition={SPRING}
            >
              {items.map((item, i) => (
                <motion.span
                  key={item.key}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.key, el);
                  }}
                  animate={{ color: i === shownIndex ? ACCENT : "var(--color-label)" }}
                  transition={SPRING}
                  className="shrink-0 text-[13px] font-medium"
                >
                  {item.label}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
