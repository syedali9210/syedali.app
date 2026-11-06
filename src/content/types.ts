/** A picture in public/. Its size comes from media.json (npm run media). */
export type Picture = { src: string; alt: string };

export type Fact = { label: string; value: string };

/** A grey text card: a small label over one or two lines. With no text, the title is the line. */
export type Card = { title: string; text?: string };

/**
 * One part of a wireframe, in the frame's own units (phone 100 × 200, desktop 160 × 100).
 * box: a dashed container · img: a dashed picture with its diagonal · text: a line of copy (t = its words, else a bar)
 * btn: a pill · dot: a circle (w = diameter) · rule: a hairline
 */
export type WireItem = { k: "box" | "img" | "text" | "btn" | "dot" | "rule"; x: number; y: number; w: number; h?: number; t?: string };
export type Wire = { title: string; note: string; frame: "phone" | "desktop"; items: WireItem[] };

/** A way of working, step by step: each step's time when it was measured (or a count, like "4 tools"). */
export type Flow = { label: string; steps: { text: string; time?: string }[]; total?: string };

/** An option and the reason it lost (or was never on the table). */
export type Option = { option: string; why: string };
export type Decision = { title: string; chose: string; why: string; considered: Option[] };

/** One part of a system. `moves` lists the parts a change to it reaches directly; the figure follows them all the way down. */
export type Part = { id: string; label: string; note: string; moves?: string[] };

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
    /** Starts a new section: a serif headline and its paragraphs. The left ticks and the status card jump to these. */
    /**
     * The four main sections (the problem, the process, the product, the results) carry an eyebrow and an `entry`:
     * each arrives a different way. Every other section simply reads.
     */
    | { type: "section"; id: string; title: string; body: string[]; eyebrow?: string; entry?: "rise" | "draw" | "focus" | "wipe" }
    /** A screenshot or a film. `tall` pictures pan to their foot on hover. */
    | { type: "media"; picture: Picture; video?: string; tall?: boolean; caption?: string }
    /** Leaves the cards: grows from the column to the whole screen as you scroll, holds, then settles back. */
    | { type: "immersive"; picture: Picture; video?: string }
    /** A desktop screenshot with the phone version standing in front of it. */
    /**
     * Pictures together. With `tabs` (one label per picture) it's one at a time under a pill switch. Without, they share one plate: "contain" keeps
     * each picture's shape in rows that fill the plate's width, in the order given; "row" is for small pictures, at their own size and centred.
     */
    | { type: "gallery"; pictures: Picture[]; caption?: string; fit?: "cover" | "contain" | "row"; tabs?: string[] }
    /** A serif headline over a screenshot, with a serif caption under it: live text, sharp at any size. */
    | { type: "showcase"; title: string; picture: Picture; caption: string }
    /** A full-width picture with no card around it. */
    | { type: "image"; picture: Picture }
    /** The product's screens as hairline wireframes, each with what it's for; a real screen can stand over them. */
    | { type: "wireframes"; screens: Wire[]; over?: Picture }
    /** An interactive hairline figure (public/illustrations/<name>.html) that answers the pointer. */
    | { type: "illustration"; src: string; title: string; note: string }
    /** Grey cards stepping down left, right, left, right. */
    | { type: "cards"; items: Card[] }
    /** One big line in Geist Medium. */
    | { type: "statement"; id?: string; text: string }
    /** The closing line and the numbers; each number can say how it was measured. */
    | { type: "stats"; note?: string; items: (Fact & { note?: string })[] }
    /**
     * The design process: one phase per step (Discover, Define, Build…), what it was for, and what it left behind.
     * `kind` is the object that phase leaves on its step in the stairs figure (notes, cards, screen, phone, box).
     */
    | { type: "process"; steps: { phase: string; kind: ProcessKind; title: string; text: string; made?: string }[] }
    /** The old way beside the new one, step for step: step n of each side share a row. */
    | { type: "compare"; before: Flow; after: Flow }
    /** Decisions: what I went with and why, what else was weighed and why it lost, what was ruled out from the start. */
    | { type: "decisions"; items: Decision[] }
    /** What the business needed, what the design does for it, and the signal that shows whether it works. */
    | { type: "alignment"; items: { goal: string; design: string; signal: string }[] }
    /** The parts of the system and what a change to each one moves: point at a part to light its reach. */
    | { type: "system"; title: string; note: string; parts: Part[] }
    /** What limited me while making it (time, budget, brand, tech…), how that shaped the work, and what it cost. */
    | { type: "tradeoffs"; items: { kind: string; constraint: string; chose: string; cost: string }[] }
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
    /** Live links, drawn with ↗. Only ones that are public. */
    links: { label: string; href: string }[];
  };
  cover: Picture;
  /** A short silent loop for the work card on the front page (cut from the launch film), and its first frame. */
  card?: { video: string; poster: string };
  /** The sign-off above Up next: a line in the serif, then a line that hands the reader to the next case study. */
  closing?: [string, string];
  blocks: Block[];
};
