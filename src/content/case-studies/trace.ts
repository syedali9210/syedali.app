import { chapters, type CaseStudy } from "../types";

const dir = "/case-studies/trace";

/**
 * A screen captured in both of Trace's themes, the same size: the page shows the one matching its own (Picture.dark).
 * Each half has a name of its own that no earlier capture used: /case-studies/ is cached for a day (next.config.ts), and a browser
 * still holding last round's dark ve-artist.webp showed it in the light theme.
 */
const both = (name: string, alt: string) => ({ src: `${dir}/${name}-light.webp`, dark: `${dir}/${name}-dark.webp`, alt });

export const trace: CaseStudy = {
  slug: "trace",
  title: "Trace",
  tagline: "I kept explaining ==the same project==, every single session.",
  theme: { deep: "#2f5bea", mid: "#8db0ff", light: "#d9cffd", highlight: "#dff35a" },
  hero: { frame: "screen", picture: both("tr-hero", "Trace's home: where you left off, and what changed in your last project") },
  kind: "Product",
  year: "2026",
  summary:
    "Trace is a design memory. It catches changes from Figma, GitHub and project folders, writes down what changed, and keeps the why next to the work.",
  meta: [
    { label: "Role", value: "Product Design, UI/UX, Development" },
    { label: "Made for", value: "Designers who build with AI" },
    { label: "Built with", value: "Node 22, node:sqlite, React, Vite, Tailwind v4, MCP" },
  ],
  impact: {
    line: "A design memory in daily use: every session starts with the history, the decisions and the reasons already in hand.",
    stats: [
      { label: "for a full walk of an app, down from 15 minutes", value: "2:47" },
      { label: "to re-walk after a one-file change", value: "32 s" },
    ],
  },
  takeaways: [
    "A memory people can't trust is worse than none. So the changelog is written by rules from the diff: one wrong AI-written line would make every line suspect.",
    "A change in code is a change in design, so it should arrive as a picture. Trace walks the running app and shows the screens, not a card of code.",
    "Designers already know what history and rolling back mean. Git came across as moments and a version tree; branches and merge conflicts stayed out.",
    "Every AI keeps its own memory, so what one learns on Monday never reaches the next on Tuesday. Trace reads from six and serves one.",
  ],
  quick: {
    problem:
      "Every new session and every new teammate started cold. The project's history, decisions and reasons were spread across Figma, Git and chat logs, and an agent got little more than a screenshot and a prompt.",
    approach:
      "I built Trace to capture work from those tools, write the changelog by rules from what actually changed, walk the running app, and serve one memory to people and to agents.",
    result:
      "A design memory in daily use. Agents start with the history, the decisions and the reasons already in hand, and a full walk of a running app dropped from 15 minutes to under 3.",
  },
  status: {
    title: "Trace, in daily use",
    live: true,
    facts: [
      { label: "Recent Updates", value: "Each change now carries its explanation, and a check re-walks what it touched" },
      { label: "Integrations", value: "Figma, GitHub, local folders and links. Memory from Claude Code, Codex, Cursor, Antigravity, Copilot, and Claude and ChatGPT exports." },
    ],
    sections: chapters,
    links: [{ label: "Source on GitHub", href: "https://github.com/syedali9210/Trace" }],
  },
  cover: both("tr-home", "Trace's homepage"),
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: ["That's a lot of memory for one tool.", "Thanks for reading this far. Next up is the tool that made Trace's launch film."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "Every session ==started cold==",
      body: ["I design in Figma and build with Claude Code and Cursor. Every new session forgot the project, ==what I'd decided==, and what I'd already thrown out."],
    },
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/launch-poster.webp`, alt: "Trace's launch film" },
      video: `${dir}/launch.mp4`,
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "One memory that ==people and agents== both read",
      body: ["Catch the work from the tools I already use, and hand the history to the next session ==before it touches anything==."],
    },
    {
      type: "steps",
      quick: true,
      items: [
        {
          picture: both("tr-home", "Trace's Home: where you left off, current portfolio, added 118 code files and 157 images"),
          title: "Open it where you left off.",
          text: "The last project, what changed in it, and one button back in.",
        },
        {
          picture: both("tr-project", "A project in Trace: where it stands, its 99 versions, and its latest changes"),
          title: "Every project, as it stands.",
          text: "Where it is, its versions and decisions, written from the work.",
        },
        {
          picture: both("tr-why", "Thinking: your reasons, in your words, for each change"),
          title: "The why, in your own words.",
          text: "Reasons you drop in become the story its case study tells.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "Write it down, then ==live in it==",
      body: ["I wrote the PRD first, then used Trace on my own work every day and fixed whatever broke."],
    },
    {
      type: "timeline",
      items: [
        { when: "First", title: "A PRD before any screen", text: "What it had to do, how I'd know it worked, and what it would never try to be." },
        { when: "Next", title: "Checked the nearest tools", text: "Each one got part of it right. None of them had agents in the loop." },
        { when: "Built", title: "Capture first, screens second", text: "The timeline came first, because it's where every tool's changes meet." },
        { when: "Since", title: "Real work, round after round", text: "Every fix came from using it: dialogs the walk missed, a folder that wouldn't import." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("tr-screens", "Screens: the running app's states as a map, grouped and linked by the clicks between them"),
          title: "It walks the running app.",
          text: "It clicks through like a person would, and every state it reaches becomes a screen on a map.",
        },
        {
          picture: both("tr-checks", "Checks: nothing needs you, and 183 states in the code no walk has seen"),
          title: "Then checks it by rule.",
          text: "States nobody has seen, values that flip back, changes outside the ask.",
        },
        {
          picture: both("tr-system", "Design system: the app's colours, read from its CSS, with their contrast"),
          title: "Reads the design system from what runs.",
          text: "The colours, type and components the app actually draws, contrast included.",
        },
        {
          picture: both("tr-canvas", "The design canvas: the headline picked on the running app, with its file, line and properties"),
          title: "And lets you change it like in Figma.",
          text: "Pick anything on the running app. Each change keeps its file and line.",
        },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "Other tools ==guess==, or speak in files",
      body: ["I looked at what designers already use to keep history and hand work over, and where each one ==stops short==."],
    },
    {
      type: "compare",
      items: [
        { name: "New Craft Society", kind: "Design workspace", good: "Sorts dropped files and writes the changelog with AI.", short: "No agents, no review, and no way to check what it wrote." },
        { name: "Abstract", kind: "Version control for design", good: "Brought Git's history and branches to design files.", short: "Branches and merge conflicts were too heavy for designers." },
        { name: "Git", kind: "Version control", good: "The exact history of every change.", short: "It speaks in files and diffs. A designer needs to see the screen." },
        { name: "Each AI's memory", kind: "Claude, Cursor, Codex", good: "Each one remembers what you told it.", short: "Alone. Monday's lesson in one tool never reaches Tuesday's in another." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("tr-history", "History: every version on its branch, the files it touched, and Run it to see it"),
          title: "Git's idea, not Git's mechanics.",
          text: "Every version on its branch, the files it touched, and a way to run it.",
        },
        {
          picture: both("tr-case", "A project's case study: every question answered from the docs and the work, with its sources"),
          title: "AI that shows its sources.",
          text: "The case study answers from the docs and the work, and says where each answer came from.",
        },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "A slow walk, ==123-file changes==, a pulled Home",
      body: [],
    },
    {
      type: "cards",
      items: [
        { tag: "Tech", title: "Walking an app took 15 minutes", text: "Too slow to use. Exploring first, then capturing screens in parallel, got it under 3." },
        { tag: "Design", title: "One change touched 123 files", text: "A chip per file buried the change. Now it's one entry, titled by what moved." },
        { tag: "Feedback", title: "A Home I pulled the same day", text: "I redesigned Home as a desk of cards and reverted it on sight. The feed stayed." },
        { tag: "Design", title: "Trusting the changelog", text: "One wrong AI-written line makes every line suspect, so rules write it from the diff." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("tr-walk", "The walk: every state it reached, linked by the click that gets there"),
          title: "The walk, under 3 minutes.",
          text: "Every state it reached, linked by the click that gets there. Exploring first, then capturing in parallel, made it five times faster.",
        },
        {
          picture: both("tr-change", "A change in Trace: one entry, added 4 files, with the why beside it"),
          title: "One change, one entry.",
          text: "Titled by what moved, with the why beside it, not a chip per file.",
        },
        {
          picture: both("tr-home-kept", "The Home that stayed: each project's newest work, big, with what changed under it"),
          title: "The feed I kept.",
          text: "Each project's newest work, big, with what changed under it, after the desk of cards went the same day.",
        },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "Facts over ==guesses==",
      body: [],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Rules write each change up from the diff", cost: "A sentence built from a diff can say what changed, but never why." },
        { chose: "One entry per change, titled by what moved", cost: "Reaching a single file takes one more click." },
        { chose: "One reference for the whole interface, the NCS app", cost: "At a glance, Trace looks like NCS." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "From 15 minutes ==to under 3==",
      body: ["It runs every day on my own work. Next, I want to open it up to teams."],
    },
    {
      type: "stats",
      quick: true,
      items: [
        { label: "A full walk of an app", value: "15 min → 2:47", note: "And it found more: 37 screens instead of 28." },
        { label: "Re-walk after a one-file change", value: "32 s", note: "Only the 4 of 17 screens that file touches. With nothing changed, 1 s." },
        { label: "AI tools it reads memory from", value: "6", note: "Claude Code, Codex, Antigravity, Cursor, Copilot, and exported Claude and ChatGPT chats." },
        { label: "Features in the PRD, built", value: "15 / 15", note: "Every one, running end to end." },
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/trace-ui-poster.webp`, alt: "Trace in daily use" },
      video: `${dir}/trace-ui.mp4`,
      caption: "Trace in daily use: a project's timeline, its screens and the checks waiting for review.",
    },
  ],
};
