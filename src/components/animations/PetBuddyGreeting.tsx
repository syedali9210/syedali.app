"use client";

import Script from "next/script";

// The pet-buddy-greeting custom element (same character/rig as the maze
// hero, idling-by-the-sign variant instead of the path-walk) is a
// self-contained vanilla web component — registering it via customElements
// isn't something a React component tree can do declaratively, so it's
// loaded as a plain script and used as a native custom element.
// React 19's JSX.IntrinsicElements now lives inside the "react" module
// itself (re-exported as React.JSX) rather than the old global JSX
// namespace, so the augmentation has to target that module directly.
declare module "react" {
  // This is TS's declaration-merging syntax for augmenting
  // JSX.IntrinsicElements, not a namespace used as a code-organization
  // construct — required here, can't be rewritten as an ES module.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "pet-buddy-greeting": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        text?: string;
        size?: string;
        autoplay?: string;
      };
    }
  }
}

interface PetBuddyGreetingProps {
  text?: string;
  size?: number;
  className?: string;
}

export default function PetBuddyGreeting({
  text = "Hii! 👋",
  size = 120,
  className,
}: PetBuddyGreetingProps) {
  return (
    <>
      <Script src="/animations/pet-buddy.js" strategy="afterInteractive" />
      <pet-buddy-greeting text={text} size={String(size)} className={className} />
    </>
  );
}
