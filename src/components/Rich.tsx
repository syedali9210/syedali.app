import type { CSSProperties } from "react";

/** Text with ==marked== words: the marked ones get the highlighter stroke (.hl in globals.css). */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/==(.+?)==/).map((part, n) => (n % 2 ? <mark key={n} className="hl">{part}</mark> : part))}</>;
}

/** The same, word by word, for lines that light up one word at a time (--w is each word's place). */
export function RichWords({ text }: { text: string }) {
  let w = 0;
  // A word keeps the space after it only where the text has one, so "==docs==." stays "docs." and not "docs .".
  const words = (s: string) =>
    s.split(" ").map((word, k, list) => {
      const space = k < list.length - 1 ? " " : "";
      if (!word) return space; // a segment that starts with a space keeps it as plain text
      return (
        <span key={w} className="word" style={{ "--w": w++ } as CSSProperties}>
          {word}
          {space}
        </span>
      );
    });
  return <>{text.split(/==(.+?)==/).map((part, n) => (n % 2 ? <mark key={`m${n}`} className="hl">{words(part)}</mark> : words(part)))}</>;
}

/** A headline that rises into place word by word, each word out of its own mask (.rise in globals.css). */
export function RiseWords({ text }: { text: string }) {
  let w = 0;
  const words = (s: string) =>
    s.split(" ").map((word, k, list) => {
      const space = k < list.length - 1 ? " " : "";
      if (!word) return space;
      // The space stays outside the mask: inside an inline-block a trailing space collapses and the words run together.
      return [
        <span key={w} className="rise">
          <span className="rise-in" style={{ "--w": w++ } as CSSProperties}>
            {word}
          </span>
        </span>,
        space,
      ];
    });
  return <>{text.split(/==(.+?)==/).map((part, n) => (n % 2 ? <mark key={`m${n}`} className="hl">{words(part)}</mark> : words(part)))}</>;
}

export const plain = (text: string) => text.replace(/==/g, "");
