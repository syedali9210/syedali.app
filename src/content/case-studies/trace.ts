import { traceWires } from "../wireframes";
import type { CaseStudy } from "../types";

const dir = "/case-studies/trace";

export const trace: CaseStudy = {
  slug: "trace",
  title: "Trace",
  tagline: "I kept explaining ==the same project==, every single session.",
  theme: { deep: "#2f5bea", mid: "#8db0ff", light: "#d9cffd", highlight: "#dff35a" },
  hero: { frame: "screen", picture: { src: `${dir}/home.webp`, alt: "Trace's homepage: the latest change in every project" } },
  kind: "Product",
  year: "2026",
  summary:
    "Trace is the design memory I built for my own work. It captures changes from Figma, GitHub and project folders, writes the changelog from what actually changed, and keeps the reasons next to the work. A teammate or a coding agent can then pick up a project without me explaining it all over again.",
  meta: [
    { label: "Role", value: "Product Design, UI/UX, Development" },
    { label: "Timeline", value: "One week to the PRD's last feature, then 20 iterations" },
    { label: "Built with", value: "Node 22, node:sqlite, React, Vite, Tailwind v4, MCP" },
  ],
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
      "I built Trace to capture work from those tools, write the changelog by rules from what actually changed, walk the running app, and serve one memory to people and to agents through 31 MCP tools.",
    result:
      "A working design memory. All 15 PRD features run end to end, and a full walk of an app dropped from 15 minutes to 2 min 47 s.",
  },
  status: {
    title: "Trace, live and in daily use",
    live: true,
    facts: [
      { label: "Recent Updates", value: "Each change now carries its explanation, and a check re-walks what it touched" },
      { label: "Integrations", value: "Figma, Claude, GitHub, Local file, Cursor, Claude Code." },
    ],
    sections: [
      { label: "Problem", href: "#opening" },
      { label: "Process", href: "#process" },
      { label: "Product", href: "#loop" },
      { label: "Decisions", href: "#decisions" },
      { label: "Results", href: "#results" },
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/syedali9210/Trace" }],
  },
  cover: { src: `${dir}/home-cover.webp`, alt: "Trace's homepage" },
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: [
    "That's a lot of memory for one tool.",
    "Thanks for reading this far. Next up is the tool that made Trace's launch film.",
  ],
  blocks: [
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/launch-poster.webp`, alt: "Trace's launch film" },
      video: `${dir}/launch.mp4`,
    },
    {
      type: "section",
      id: "opening",
      entry: "rise",
      eyebrow: "The problem",
      title: "Every session started ==cold==",
      body: [
        "I design in Figma and build in code, with Claude Code and Cursor beside me. For a while that worked well. Then one thing started to wear me down: every new session began from nothing. The agent didn't know the project, didn't know what I had decided, and kept bringing back ideas I had already rejected.",
        "A handover like that loses most of the project. The agent gets a screenshot and a prompt. The references, the constraints and the reasons behind each decision stay behind in Figma, in Git and in old chats, and I was the only thing connecting them.",
      ],
    },
    {
      type: "cards",
      quick: true,
      items: [
        { title: "Context resets every session", text: "Every new chat meant explaining the history and the decisions all over again, by hand." },
        { title: "Changelogs are written by hand", text: "Or, more honestly, not written at all. Documenting took as long as designing." },
        { title: "The work is split across tools", text: "Design sits in Figma, code in Git and references in folders, and the reasons get buried in chat logs." },
        { title: "Every AI keeps its own memory", text: "What Claude learned on Monday never reached Cursor or Codex on Tuesday." },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/memory.html",
      title: "A project, taken apart",
      note: "Pull it open. The same project is a timeline, its diffs, a canvas and a case study, all layered over one memory.",
    },
    {
      type: "section",
      id: "constraints",
      title: "Three limits that ==shaped the design==",
      body: [
        "Trace had to feel simple even though the data behind it isn't. Three limits did most of the shaping.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Reference",
          constraint: "One reference for the whole interface: the NCS app.",
          chose: "I took its patterns and left its pixels: the Latest feed, the tick scrubber and the floating + button.",
          cost: "At a glance, Trace looks like NCS.",
        },
        {
          kind: "Scale",
          constraint: "One change can touch 123 files.",
          chose: "A change is one entry, titled by what moved, instead of a chip for every file.",
          cost: "Reaching a single file takes one more click.",
        },
        {
          kind: "Readers",
          constraint: "The same record has to work as a sentence for a person and as data for an agent.",
          chose: "One plain sentence per change, with the exact before and after values one click away.",
          cost: "A sentence built from a diff can say what changed, but never why.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Design process",
      title: "From a PRD to ==twenty iterations==",
      body: [
        "I started with a PRD: 15 features, success metrics and a list of non-goals. The first full build took a week. Everything after that came from using Trace on real work and seeing where it failed.",
      ],
    },
    {
      type: "process",
      steps: [
        {
          phase: "Discover",
          kind: "notes",
          title: "Who it's for, and what they need done",
          text: "The first user is the solo design engineer who builds with AI, so I could test every idea on my own work.",
          made: "the PRD, with 15 features, success metrics and non-goals",
        },
        {
          phase: "Research",
          kind: "cards",
          title: "What the nearest tools miss",
          text: "New Craft Society sorts dropped files and writes a changelog, but it has no agents and no review.",
          made: "the rule to use the Git metaphor, never Git's mechanics",
        },
        {
          phase: "Build",
          kind: "screen",
          title: "Capture first, screens second",
          text: "The timeline came before any other screen, because it's where every tool's changes meet.",
          made: "the PRD's features, built and running end to end in a week",
        },
        {
          phase: "Iterate",
          kind: "box",
          title: "Real use, then twenty rounds of fixes",
          text: "Each round came from real use: dialogs the walk missed, a folder that wouldn't import, and a Home redesign I reverted the same day.",
          made: "20 iterations, each with what changed and why",
        },
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/trace-ui-poster.webp`, alt: "A walk through Trace's interface" },
      video: `${dir}/trace-ui.mp4`,
      caption: "A recording of Trace in use: a project's timeline, its screens and the checks waiting for review.",
    },
    {
      type: "section",
      id: "loop",
      entry: "focus",
      eyebrow: "The product",
      title: "Agents are ==users too==",
      body: [
        "The design changed once I stopped treating agents as a feature and started treating them as a second kind of user, with their own way in and their own way out.",
        "Before an agent changes anything, it reads the project from Trace: the brief, the decisions, the open comments, and what was already tried and undone. After the change, it leaves its reasoning beside the change on the timeline. I review it there, and my reply reaches the next session.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/volumes.html",
      title: "One shelf, every AI's memory",
      note: "Point at a book and it comes off the shelf. Trace can read the memory of six AI tools, read-only and only if you opt in.",
    },
    {
      type: "section",
      id: "timeline",
      title: "Raw saves become moments",
      body: [
        "A burst of small saves is really one change. Trace groups them into a moment, files it under its project and writes it up from the diff, with a line like \"Decreased font size.\" It isn't poetry, but every word can be checked.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/spike.html",
      title: "Moments on a spike",
      note: "Point at a slip and that moment squares up and rises, carrying the newer ones with it. Newest on top, as on the timeline.",
    },
    {
      type: "section",
      id: "walk",
      title: "The app, walked while it runs",
      body: [
        "A change in code is a change in design too, but a diff can't show you that. So Trace opens the running app in headless Edge and walks it: tabs, sheets, menus and the theme, up to two clicks deep.",
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/screens.webp`, alt: "Trace's screens map: an app's states, linked by the clicks between them" },
      caption: "The screens map: every state the walk reached, linked by the clicks between them.",
    },
    {
      type: "section",
      id: "wireframes",
      title: "Four screens, four questions",
      body: [
        "Stripped down to structure, four screens carry the product. Each one answers a single question before it shows anything else: which project, what changed, what was decided, and what is known.",
      ],
    },
    { type: "wireframes", screens: traceWires, over: { src: `${dir}/projects.webp`, alt: "Trace's projects page" } },
    {
      type: "statement",
      id: "designs",
      text: "Briefs, constraints, references, decisions and reviews all lived in ==different docs==.",
    },
    {
      type: "gallery",
      pictures: [
        { src: `${dir}/canvas-board.webp`, alt: "A project as a canvas of blocks: overview, iterations, reviews, constraints, references, tasks" },
        { src: `${dir}/case-study.webp`, alt: "The case study, written from the project's own evidence" },
        { src: `${dir}/todo.webp`, alt: "The to-do board" },
      ],
      tabs: ["Canvas", "Case study", "To-do"],
      caption: "So I brought them into one canvas of blocks, with the case study written from the project's own evidence and the to-dos beside it.",
    },
    {
      type: "section",
      id: "decisions",
      title: "Three decisions that ==defined Trace==",
      body: [
        "Each of these had a faster option. I turned them down for reasons that still hold.",
      ],
    },
    {
      type: "decisions",
      items: [
        {
          title: "How a change gets written up",
          chose: "Rules that read the diff and state what changed, like \"Decreased font size. Changed colours.\"",
          why: "A memory people can't trust is worse than having none.",
          considered: [
            { option: "An AI-written changelog, as NCS does", why: "A model's guess can't be checked, and one wrong line makes every line suspect." },
          ],
        },
        {
          title: "How versions work",
          chose: "The Git metaphor: moments, a version tree, and rollback as a new version.",
          why: "Designers already understand history and rolling back, so nobody has to learn Git.",
          considered: [
            { option: "Real branches and merge conflicts", why: "Abstract brought these to design, and designers found them too heavy." },
          ],
        },
        {
          title: "How a code change looks",
          chose: "The running app, walked in headless Edge, with every state shown as a screen and joined by the click that reaches it.",
          why: "A change in code is a change in design, so it should arrive as a picture.",
          considered: [
            { option: "A card of code text", why: "A designer reviewing a change needs to see it, and code text can't show that." },
          ],
        },
      ],
    },
    {
      type: "showcase",
      quick: true,
      title: "What changed, in a sentence",
      picture: { src: `${dir}/timeline.webp`, alt: "A project's timeline in Trace: what needs you, where it stands, and the changes beside it" },
      caption: "A project opens on what needs you and where it stands, with each change beside it, written from the diff.",
    },
    {
      type: "section",
      id: "shift",
      title: "A design change, ==before and after==",
      body: [
        "The clearest way to show the difference is one ordinary design change, from start to finish.",
      ],
    },
    {
      type: "compare",
      before: {
        label: "A design change, before Trace",
        steps: [
          { text: "Open a new agent session and paste the history back in", time: "every session" },
          { text: "Re-explain what I'd already rejected", time: "every session" },
          { text: "Write the changelog", time: "skipped" },
          { text: "Find why something was decided, in old chats", time: "4 places" },
          { text: "Screenshot the app so the agent can see it", time: "by hand" },
          { text: "Click through the app to check nothing else moved", time: "by hand" },
        ],
        total: "Context rebuilt every time",
      },
      after: {
        label: "The same change, with Trace",
        steps: [
          { text: "The agent reads the brief, decisions and open comments", time: "1 call" },
          { text: "It reads what was tried here and undone", time: "1 call" },
          { text: "Saves become moments, written up from the diff", time: "automatic" },
          { text: "The agent leaves its reasons beside the change", time: "1 call" },
          { text: "The running app is walked into screens", time: "automatic" },
          { text: "A check re-walks what the change touched", time: "by rule" },
        ],
        total: "Context kept, and read before every change",
      },
    },
    {
      type: "section",
      id: "system",
      title: "One change, ==many readers==",
      body: [
        "When the walk learned that a dialog is a screen too, Animation Engine's Studio went from 5 screens to 9, and everything after the walk picked up those four with no extra work. That only works because of how the parts depend on each other.",
      ],
    },
    {
      type: "system",
      title: "How Trace's parts depend on each other",
      note: "Point at a part, or tab to it, and everything a change to it reaches lights up, all the way down to the agents.",
      parts: [
        { id: "capture", label: "Capture", note: "Watchers on Figma, GitHub and folders save every change as it happens.", moves: ["moments"] },
        { id: "walk", label: "App walk", note: "Headless Edge walks the running app over DevTools: every state and the click that reaches it.", moves: ["screens"] },
        { id: "memory", label: "AI memory", note: "Read-only, opt-in readers for six AIs' own memory, with keys and tokens blanked.", moves: ["mcp"] },
        { id: "moments", label: "Moments", note: "Raw saves grouped into one change each and filed into a project.", moves: ["changelog", "canvas"] },
        { id: "screens", label: "Screens", note: "Every state as a picture, joined by the clicks between them.", moves: ["system", "timeline", "checks"] },
        { id: "changelog", label: "Changelog", note: "Written by rules from the diff, so every sentence traces back to a value.", moves: ["timeline", "casestudy", "mcp"] },
        { id: "canvas", label: "Canvas", note: "The project as blocks: brief, constraints, references, decisions, reviews, tasks.", moves: ["casestudy", "mcp"] },
        { id: "system", label: "Design system", note: "Tokens, text styles and components, read from the walked screens and the CSS.", moves: ["checks"] },
        { id: "timeline", label: "Timeline", note: "Where people read it: newest first, each change before and after." },
        { id: "casestudy", label: "Case study", note: "Answered only from the project's own evidence." },
        { id: "checks", label: "check_change", note: "Re-walks what a change touched and checks it by rule against the app's own values.", moves: ["mcp"] },
        { id: "mcp", label: "MCP server", note: "31 tools: agents read the same memory people browse, and write their reasoning back." },
      ],
    },
    {
      type: "section",
      id: "results",
      entry: "wipe",
      eyebrow: "Results",
      title: "What changed ==once it ran on real work==",
      body: [],
    },
    {
      type: "stats",
      quick: true,
      items: [
        { label: "Full app walk", value: "15 min → 2 min 47 s", note: "A full walk of the same app, before and after the walk was rebuilt." },
        { label: "Screens found per walk", value: "28 → 37", note: "The same app: more of its states reached in one walk." },
        { label: "MCP tools agents can call", value: "31", note: "Read the context, check a change, explain it, answer comments." },
        { label: "AI tools it reads memory from", value: "6", note: "Claude Code, Codex, Antigravity, Cursor, Copilot, exported chats." },
        { label: "A real app, walked", value: "9 screens in 22 s", note: "The engine's Studio, walked in three tabs at once." },
        { label: "PRD features built", value: "15 of 15", note: "Running end to end on my own projects." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      title: "Where it stands",
      body: [
        "Trace now runs every day on my own projects. Each change is captured, written up from its diff and filed with the reasoning behind it, and agents read that history before they touch the work.",
        "Next, I want to open it up to teams.",
      ],
    },
  ],
};
