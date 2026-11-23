/**
 * A picture in public/. Its size comes from media.json (npm run media). Pictures are whole screens (or a part of one with its
 * surroundings), shown on the page as themselves, with no plate around them.
 * `w`: the width it shows at in CSS px, never wider than the column; without it, it fills the column.
 * `open`: it has no outline of its own (cards on a transparent ground, or a region that fades out), so it gets no rounding or shadow.
 * `dark`: the same screen captured in the product's dark theme, the same size; it shows while the site is dark (Syed: "when we
 * switch the theme as well the product screenshot should also change"). `src` is then the light one.
 */
export type Picture = { src: string; alt: string; w?: number; open?: boolean; dark?: string };

/**
 * One step of a chapter, told through its screen (Niklas Peterson's case studies): the screen, then a numbered line under it.
 * `wide` spans the column; otherwise steps pair up two to a row. Left out, a chapter of four runs wide, two, wide; of three, wide
 * then two; of two, a pair.
 */
export type Step = { picture: Picture; video?: string; title: string; text?: string; wide?: boolean };

export type Fact = { label: string; value: string };

/** A point: a name over one line. `tag` is a small label above it (a challenge's kind: Design, Tech, Feedback…). */
export type Card = { title: string; text?: string; tag?: string };

/**
 * One part of a wireframe, in the frame's own units (phone 100 × 200, desktop 160 × 100).
 * box: a dashed container · img: a dashed picture with its diagonal · text: a line of copy (t = its words, else a bar)
 * btn: a pill · dot: a circle (w = diameter) · rule: a hairline
 */
export type WireItem = { k: "box" | "img" | "text" | "btn" | "dot" | "rule"; x: number; y: number; w: number; h?: number; t?: string };
export type Wire = { title: string; note: string; frame: "phone" | "desktop"; items: WireItem[] };

/** Every case study tells its story in these seven chapters, in this order; each is a section with this id. */
export const chapters = [
  { label: "Problem", href: "#problem" },
  { label: "Objective", href: "#objective" },
  { label: "Process", href: "#process" },
  { label: "Research", href: "#research" },
  { label: "Challenges", href: "#challenges" },
  { label: "Trade-offs", href: "#tradeoffs" },
  { label: "Outcomes", href: "#outcomes" },
];

export type ProcessKind = "notes" | "cards" | "screen" | "phone" | "box";

/** Every block can be kept in the quick overview with `quick: true`; the rest only shows in the full story. */
type Q = { quick?: boolean };

/**
 * A case study's colours, sampled from its own screens: deep (buttons, the vivid panel), mid and light (the sky, the
 * panel's glow), and the highlighter behind ==marked== words.
 */
export type Theme = { deep: string; mid: string; light: string; highlight: string };

export type Block = Q &
  (
    /**
     * Starts a chapter: an eyebrow (Problem, Objective, Process, Research, Challenges, Trade-offs, Outcomes), a serif
     * headline and at most a couple of short lines (index.ts stops the build past 45 words). The contents jump to these.
     * Four chapters arrive with motion, each a different way (`entry`); the rest simply read.
     */
    | { type: "section"; id: string; title: string; body: string[]; eyebrow?: string; entry?: "rise" | "draw" | "focus" | "wipe" }
    /** One component, or a film, with a line under it saying what it shows. */
    | { type: "media"; picture: Picture; video?: string; caption?: string }
    /** Leaves the cards: grows from the column to the whole screen as you scroll, holds, then settles back. */
    | { type: "immersive"; picture: Picture; video?: string }
    /**
     * Components side by side. "contain" keeps each picture's shape in rows that fill the column, in the order given; "row" is
     * for small pictures, at their own size and centred.
     */
    | { type: "gallery"; pictures: Picture[]; caption?: string; fit?: "contain" | "row" }
    /** A film's versions, oldest first: the chosen one plays big, and every version sits under it with what changed. */
    | { type: "versions"; items: { label: string; meta: string; note: string; video: string; poster: Picture }[] }
    /** The product's screens as hairline wireframes, each with what it's for; a real screen can stand over them. */
    | { type: "wireframes"; screens: Wire[]; over?: Picture }
    /** Points side by side, a name over one line each: research findings, competitors, challenges (with a tag). */
    | { type: "cards"; items: Card[] }
    /** The numbers; each one says how it was measured. */
    | { type: "stats"; note?: string; items: (Fact & { note?: string })[] }
    /**
     * How I worked: one step each, in plain words, what it was for, and what it left behind.
     * `kind` is the object that step leaves on its stair in the figure (notes, cards, screen, phone, box).
     */
    | { type: "process"; steps: { phase: string; kind: ProcessKind; title: string; text: string; made?: string }[] }
    /** Trade-offs: what I went with, and what that cost me. */
    | { type: "tradeoffs"; items: { chose: string; cost: string }[] }
    /**
     * A chapter told in screens: two to four, each with its step's line. Never a lone component. `phones`: phone screens, side by side
     * in one row, a journey through the page on a phone.
     */
    | { type: "steps"; items: Step[]; phones?: boolean }
    /**
     * Real code from the project, as it is in its repository: a short excerpt, its file, and a line on why it's here. `from` is the
     * excerpt's first line number in that file, so the numbers match the repository.
     */
    /** What else was out there, a row each: the tool, what it is, what it does well, and where it fell short. */
    | { type: "compare"; items: { name: string; kind: string; good: string; short: string }[] }
    /** The story in order, a moment each: when, what happened, one line. */
    | { type: "timeline"; items: { when: string; title: string; text: string }[] }
  );

export type CaseStudy = {
  slug: string;
  title: string;
  /** The entry card's headline: one line from the summary, ==marked== words get the highlighter. */
  tagline: string;
  theme: Theme;
  /** The device standing in the entry card's sky. */
  hero: { frame: "phone" | "screen"; picture: Picture };
  /** "Product" or "Web", as the Figma frames name them. */
  kind: string;
  year: string;
  summary: string;
  meta: Fact[];
  /** The result in one line and two numbers, under the title, for someone scanning (Niklas Peterson's Impact card). */
  impact?: { line: string; stats: Fact[] };
  /** The quick overview, for someone with a minute: three lines. */
  /** What to take from it, a line each. Not on the page at the moment: the board that showed these was removed. */
  takeaways: string[];
  quick: { problem: string; approach: string; result: string };
  /** The panel at the top right. */
  status: {
    title: string;
    /** A green dot when the thing is live or being worked on. */
    live: boolean;
    facts: Fact[];
    /** Section anchors, drawn with the growing hairline. */
    sections: { label: string; href: string }[];
    /** Live links, drawn with ↗. Only ones that are public. `site`: the product itself, drawn as a button in the hero. */
    links: { label: string; href: string; site?: boolean }[];
  };
  cover: Picture;
  /** A short silent loop for the work card on the front page (cut from the launch film), and its first frame. */
  card?: { video: string; poster: string };
  /** The sign-off above Up next: a line in the serif, then a line that hands the reader to the next case study. */
  closing?: [string, string];
  blocks: Block[];
};
