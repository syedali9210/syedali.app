"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL, GITHUB, LINKEDIN } from "@/content/contact";
import { Icon } from "./Icon";

const PROFILES = [
  { label: "GitHub", href: GITHUB },
  { label: "LinkedIn", href: LINKEDIN },
];

/** The address, a link that opens a new mail, and a button that copies it. "Copied" takes the address's place for a moment, so nothing moves. */
function Mail({ linkClass }: { linkClass: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // No clipboard to ask, or no leave to use it: the old way.
      const field = Object.assign(document.createElement("textarea"), { value: EMAIL });
      field.style.cssText = "position:fixed;opacity:0";
      document.body.append(field);
      field.select();
      const done = document.execCommand("copy");
      field.remove();
      if (!done) return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <span className="contact-mail" data-copied={copied || undefined}>
      <a href={`mailto:${EMAIL}`} className={`${linkClass} contact-address`}>
        {EMAIL}
      </a>
      <span role="status" className="contact-copied">
        {copied && "Copied"}
      </span>
      <button type="button" onClick={copy} aria-label="Copy email address" className="contact-copy">
        <Icon name={copied ? "check" : "copy"} size={13} />
      </button>
    </span>
  );
}

/** The ways to reach Syed: on the first screen, and on a phone in the menu stone. */
export function Contact({ className, linkClass }: { className?: string; linkClass: string }) {
  return (
    <div className={className}>
      {PROFILES.map((p) => (
        <a key={p.label} href={p.href} target="_blank" rel="noopener" className={linkClass}>
          {p.label} <Icon name="arrow-up-right" size={11} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
      <Mail linkClass={linkClass} />
    </div>
  );
}
