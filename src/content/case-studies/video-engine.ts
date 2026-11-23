import { chapters, type CaseStudy } from "../types";

const dir = "/case-studies/video-engine";

/**
 * A screen captured in both of the engine's themes, the same size: the page shows the one matching its own (Picture.dark).
 * Each half has a name of its own that no earlier capture used: /case-studies/ is cached for a day (next.config.ts), and a browser
 * still holding last round's dark ve-artist.webp showed it in the light theme.
 */
const both = (name: string, alt: string) => ({ src: `${dir}/${name}-light.webp`, dark: `${dir}/${name}-dark.webp`, alt });

export const videoEngine: CaseStudy = {
  slug: "video-engine",
  title: "Video Engine",
  tagline: "A launch film of your product, ==made from its own code==.",
  theme: { deep: "#2563eb", mid: "#9a8cf2", light: "#ffc2e6", highlight: "#ffcfeb" },
  hero: { frame: "screen", picture: both("ve-hero", "Video Engine's home: What are we making today?") },
  kind: "Product",
  year: "2026",
  summary:
    "Video Engine makes a product's launch film from the product itself. Ask in one sentence, and it opens your running app and directs the film out of the real interface.",
  meta: [
    { label: "Role", value: "Product Design, Motion, Development" },
    { label: "Made for", value: "Product teams with no motion designer" },
    { label: "Built with", value: "Vite, React 19, three.js, Motion, GSAP" },
  ],
  impact: {
    line: "A production-quality launch film from one sentence, with the AI writing only the words and the code doing the directing.",
    stats: [
      { label: "to render the latest 31 s film at 1080p, 60 fps", value: "238 s" },
      { label: "AI tokens a film, read from the engine's own logs", value: "~14K" },
    ],
  },
  takeaways: [
    "A film made from the product's own code can't drift from the product. A screen recording starts going stale the day it's made.",
    "AI on its own doesn't know what makes a film good. Rules it can't skip, and films it has studied, do.",
    "Generic templates make generic films, so every template is cut from a real launch film.",
    "A tool that does everything is hard to read. One job, done well, is what people come back to.",
  ],
  quick: {
    problem:
      "A launch film meant hours hunting a template thousands had already used, or learning motion from zero. And AI on its own doesn't know what makes a film good.",
    approach: "I built an engine that directs the film in code, inside guardrails, from real launch films I took apart. The AI only writes the words.",
    result: "Its latest 31-second film rendered in 238 seconds and exported in 114, at 1080p and 60 fps, for about 14K AI tokens.",
  },
  status: {
    title: "Video Engine, in daily use",
    live: true,
    facts: [
      { label: "The idea", value: "A launch film made from your product's own code" },
      { label: "Makes", value: "Launch films, product demos, teasers, brand films and social cuts" },
    ],
    sections: [...chapters.slice(0, 6), { label: "Iterations", href: "#iterations" }, ...chapters.slice(6)],
    links: [
      { label: "Visit the site", href: "https://video-engine-tau.vercel.app", site: true },
      { label: "Source on GitHub", href: "https://github.com/syedali9210/video-engine" },
    ],
  },
  cover: both("ve-hero", "Video Engine's home: What are we making today?"),
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: ["That's enough of my own tools for now.", "Next up is a real client and a real deadline."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "I needed a launch film, and ==none of them were mine==",
      body: [
        "For my first portfolio I wanted a launch film. Hours of browsing found one decent template: ==used by thousands already==, and watermarked on the free plan. And I had never made one myself.",
      ],
    },
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/film-v4.webp`, alt: "Video Engine's latest film, made by the engine itself" },
      video: `${dir}/film-v4.mp4`,
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "Production-quality films, ==minus the AI guesswork==",
      body: ["Make a launch film of your own product or feature with AI, at production quality, in ==less time and fewer tokens==."],
    },
    {
      type: "cards",
      items: [
        { tag: "Quality", title: "Good enough to launch with", text: "A film of your own product or feature, not a stock template with your logo on it." },
        { tag: "Taste", title: "AI doesn't know what works", text: "On its own it can't tell a strong hook from a weak one, or a good cut from a bad one." },
        { tag: "Cost", title: "Good or bad, every try costs", text: "Each attempt burns time and tokens, and none of them comes with a guarantee." },
        { tag: "Goal", title: "Less time, fewer tokens", text: "So the engine directs the film in code, and the AI only writes the words." },
      ],
    },
    {
      type: "steps",
      quick: true,
      items: [
        {
          picture: both("ve-artist", "The Artist: three takes on a product launch, Neon, Gradient pop and Editorial, each scored"),
          title: "Ask for a film, get three takes.",
          text: "Each a different art direction, storyboarded and scored, with the real product in every shot.",
        },
        {
          picture: both("ve-studio", "The Studio: the real product on a 3D iPhone, with the scene's camera and devices beside it"),
          title: "Change anything.",
          text: "The real product on a 3D phone. Every scene, title and cut is still yours.",
        },
        {
          picture: both("ve-export-panel", "The export panel beside the stage: 16:9 at 1920 by 1080, 30 or 60 fps, then Export video"),
          title: "Export it.",
          text: "Its size, length, song and frame rate, then one button.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "From a ==watermarked template== to an engine of my own",
      body: ["It didn't start as a product. It started with me needing one film, and ==not wanting to need it again==."],
    },
    {
      type: "timeline",
      items: [
        { when: "Portfolio v1", title: "I needed a launch film", text: "Hours of browsing for one decent template, already used by thousands, with a watermark on the free plan." },
        { when: "Day one", title: "I'd never made one", text: "So I learned it from zero: the timeline, camera angles, easing, cuts." },
        { when: "The itch", title: "I wanted it to be mine", text: "Original, and made to my own taste, not a template thousands had already used." },
        { when: "The idea", title: "A tool, not another template", text: "Something that saves me time and tokens every time I need a film." },
        { when: "Months later", title: "Portfolio, round two", text: "Redesigning again, and this time the product needed a film of its own." },
        { when: "Foundation", title: "I tore good launch films apart", text: "Shot by shot, so the engine starts from what already works." },
        { when: "Pipeline", title: "My own renderer and generator", text: "Inside guardrails the AI can't skip, so it stops guessing." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("ve-templates", "Start from a template: 25 films by kind, from product launches to social cuts"),
          title: "Cut real films into templates.",
          text: "25 of them, sorted by the kind of film they make.",
          wide: false,
        },
        {
          picture: both("ve-rulebook", "The Lab's Guidelines: the rulebook every proposal is judged by"),
          title: "Wrote the rules down.",
          text: "A rulebook the AI reads before every proposal, and a checker that enforces it.",
          wide: false,
        },
        {
          picture: both("ve-new-films", "The Lab's New films: eight films the Artist made, waiting for a keep or a pass"),
          title: "Then let it make films on its own.",
          text: "Four at a time. I keep or pass each one and say why, and the next batch follows what I said.",
          wide: true,
        },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "Great renderers, ==no director==",
      body: ["I tried what was out there first. Each one could make a video. None of them knew ==what makes a film good==, so I measured that myself."],
    },
    {
      type: "compare",
      items: [
        {
          name: "Raylight",
          kind: "Video editor",
          good: "Product films on a canvas and a timeline, with camera moves, transitions and AI help.",
          short: "I'd still direct every shot by hand, on a timeline I didn't know yet.",
        },
        {
          name: "HyperFrames",
          kind: "Open source · HTML to MP4",
          good: "HeyGen's renderer for AI agents: HTML and animation in, the same MP4 out every time.",
          short: "It renders what the agent writes. It can't tell a good film from a bad one, so the agent still guesses.",
        },
        {
          name: "Remotion",
          kind: "React framework",
          good: "Videos as React code, every frame a function of time.",
          short: "Every shot is code you write, or tokens an agent spends writing it. Teams of four or more need a company licence.",
        },
        {
          name: "Agent skills",
          kind: "Open source",
          good: "Teach an agent a tool's API: how to animate, render and export.",
          short: "They teach the API, not taste: when to cut, how long to hold, what the hook is. Every retry still costs tokens.",
        },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("ve-studied", "The Lab's Studied films: nine launch films, each torn down into shots, titles and grounds"),
          title: "Nine launch films, taken apart.",
          text: "From Linear, Raycast, Figma, Framer and more: 119 shots, about ten minutes of film.",
        },
        {
          picture: both("ve-teardown", "Linear Agent's teardown: 11 shots in 54 seconds, its cuts, camera, pacing, type and palette"),
          title: "Each one measured.",
          text: "Linear Agent: 11 shots in 54 s, eight hard cuts, the camera panning most.",
        },
        {
          picture: both("ve-copy", "Linear Agent shot by shot: each shot's camera values and easing, and what a template should copy"),
          title: "Down to every shot.",
          text: "Its camera values and easing, and what a template should copy.",
        },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "Keeping the AI ==on the rails==",
      body: ["Four problems, one answer: a pipeline, guardrails and a generator that ==lean on each other==, so the AI can't lose the track."],
    },
    {
      type: "cards",
      items: [
        { tag: "Foundation", title: "A foundation worth building on", text: "The scene language, the renderer, the templates. Every film inherits whatever they get wrong." },
        { tag: "System", title: "Three parts, one loop", text: "Guardrails, pipeline and generator, all used by AI agents. If an agent can walk around one, the other two don't matter." },
        { tag: "AI", title: "I caught the AI debugging videos", text: "What does debugging a video even mean? Whatever it was, it wasn't making a film." },
        { tag: "AI", title: "Bad motion, even inside the rules", text: "Animations and interactions still came out wrong. The AI was fighting the guardrails, not following them." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("ve-check", "Check the film: readability 14 to fix, story 1 to look at, fidelity and brand pass"),
          title: "Every film is checked before export.",
          text: "Readability, story, fidelity and brand, on the frames that will render. This one had 14 things to fix.",
        },
        {
          picture: both("ve-frames", "What the check looked at: frames sampled from every scene"),
          title: "It reads the frames, not the plan.",
          text: "Each scene sampled coming in, in the middle and going out.",
        },
        {
          picture: both("ve-learned", "What it learned: what eleven of my decisions taught the engine's taste"),
          title: "And it learns from my verdicts.",
          text: "Every keep or pass, with a reason, becomes a rule for the next batch.",
        },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "A super app, ==cut back to one job==",
      body: [
        "I wanted it to do everything: films, web animation for every breakpoint, creatives, component properties. It did, and it stopped being ==clear what it was for==.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Scope down to one job: launch films", cost: "The component library, screen builder and website check moved to an app of their own. Two apps to keep in step." },
        { chose: "Cut features that weren't the job", cost: "Less to show off. In return, a clearer mental model, less cognitive load, and a reason to come back." },
        { chose: "Render in batches, side by side", cost: "One browser per part, all feeding one encoder: heavier on the machine, and parts split on cuts so nothing jumps." },
        { chose: "Ship what works, then make it good", cost: "A working film came early. A good one took four versions and a lot of iteration." },
      ],
    },
    {
      type: "steps",
      items: [
        {
          picture: both("ve-library", "The component library, now an app of its own: 31 animations, each running live in a real device"),
          title: "Before: a component library…",
          text: "Every animation live in a real device frame, each with its own settings.",
          wide: false,
        },
        {
          picture: both("ve-builder", "The screen builder, now in the component app: Maze Walk on an iPhone, with its motion and look properties"),
          title: "…and a screen builder.",
          text: "Motion and look for every component: a second product inside the first.",
          wide: false,
        },
        {
          picture: both("ve-films", "After: Films, one place to direct a film, continue one, or start from 25 templates"),
          title: "After: one place for the one job.",
          text: "Direct a film, carry on with one, or start from a template.",
          wide: true,
        },
      ],
    },
    {
      type: "section",
      id: "iterations",
      eyebrow: "Iterations",
      title: "Four films, from ==told to shown==",
      body: ["Same engine, four versions of its own film. Something that works and something that's good are ==a lot of iterations apart==."],
    },
    {
      type: "versions",
      items: [
        {
          label: "Told, not shown",
          meta: "v1 · 30 fps",
          note: "A terminal, progress bars and boxed numbers did the talking.",
          video: `${dir}/film-v1.mp4`,
          poster: { src: `${dir}/film-v1.webp`, alt: "The first film: a studio made for launch films, on a dark gradient" },
        },
        {
          label: "One thing at a time",
          meta: "v2 · 60 fps",
          note: "Type that moves, one card on screen at a time. But the cards were stand-ins.",
          video: `${dir}/film-v2.mp4`,
          poster: { src: `${dir}/film-v2.webp`, alt: "The second film: one card on screen, What needs your attention" },
        },
        {
          label: "The real interface",
          meta: "v3 · 60 fps",
          note: "The actual app, shot in 3D, from the first prompt to the export.",
          video: `${dir}/film-v3.mp4`,
          poster: { src: `${dir}/film-v3.webp`, alt: "The third film: the real app, What are we making today?" },
        },
        {
          label: "A story first",
          meta: "v4 · latest",
          note: "The hook, launching takes weeks, then the export panel, then the payoff.",
          video: `${dir}/film-v4.mp4`,
          poster: { src: `${dir}/film-v4.webp`, alt: "The latest film: the Video Engine mark on blue" },
        },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "A 31-second film in ==under 6 minutes==",
      body: ["Two AI calls a film: one writes the story, one checks the stills. Everything else is code. Next: music for films, and local models for private work."],
    },
    {
      type: "stats",
      quick: true,
      items: [
        { label: "To render the latest film", value: "238 s", note: "31 seconds of film: 1,864 frames at 1080p and 60 fps." },
        { label: "To encode and export it", value: "114 s", note: "From rendered frames to a finished MP4." },
        { label: "AI tokens a film", value: "~14K", note: "One call writes the story, one reads the stills. Averaged over five directed films in the engine's logs." },
        { label: "Templates to start from", value: "25", note: "Each one cut from a real launch ad." },
      ],
    },
  ],
};
