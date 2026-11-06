import { engineWires } from "../wireframes";
import type { CaseStudy } from "../types";

const dir = "/case-studies/animation-engine";

export const animationEngine: CaseStudy = {
  slug: "animation-engine",
  title: "Animation Engine",
  tagline: "Why go to someone else for a film of ==your own product==?",
  theme: { deep: "#2563eb", mid: "#9a8cf2", light: "#ffc2e6", highlight: "#ffcfeb" },
  hero: { frame: "screen", picture: { src: `${dir}/home.webp`, alt: "The Animation Engine's home: What are we making?" } },
  kind: "Product",
  year: "2026",
  summary:
    "Animation Engine makes the whole product film for you. Ask for one in a sentence and it reads your screens, words and colours, then writes, directs and renders the film. The fun part is the taste: every film you keep or pass teaches it what you like, so it evolves with you.",
  meta: [
    { label: "Role", value: "Product Design, Motion, Development" },
    { label: "Made for", value: "Anyone with a product and no motion team" },
    { label: "Built with", value: "Vite, React 19, three.js, Motion, GSAP" },
  ],
  takeaways: [
    "A product film shouldn't depend on someone else's calendar. One sentence should be enough to get a first cut.",
    "Generic films come from missing decisions. The engine fills them with your taste instead of a safe default.",
    "A template is only worth starting from if it's measured off a film I'd actually make. The generic ones made every film read generic.",
    "The device is half of every shot. CSS faces never looked real; three.js models at Apple's dimensions do.",
  ],
  quick: {
    problem:
      "A product film used to mean paying someone else, doing it all by hand, or accepting the look everyone gets from AI tools. I wanted the idea to stay mine and the slow part to go away.",
    approach:
      "I built a studio that reads a product, then writes, directs and renders its film from one sentence. Every film you keep or pass teaches it your taste.",
    result:
      "A launch film of any codebase in one call, every scene still editable, from a studio that learns your taste.",
  },
  status: {
    title: "Animation Engine, live and in daily use",
    live: true,
    facts: [
      { label: "The idea", value: "The taste that evolves with you" },
      { label: "Makes", value: "Launch films, product demos, teasers, brand films and social cuts" },
    ],
    sections: [
      { label: "Problem", href: "#opening" },
      { label: "Process", href: "#process" },
      { label: "Product", href: "#one-call" },
      { label: "Taste", href: "#taste" },
      { label: "Decisions", href: "#decisions" },
      { label: "Results", href: "#results" },
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/syedali9210/animation-engine" }],
  },
  cover: { src: `${dir}/home.webp`, alt: "The Animation Engine's home: What are we making?" },
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: [
    "That's enough of my own tools for now.",
    "Next up is a real client and a real deadline.",
  ],
  blocks: [
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/engine-launch-poster.webp`, alt: "The engine's launch film" },
      video: `${dir}/engine-launch.mp4`,
    },
    {
      type: "section",
      id: "opening",
      entry: "rise",
      eyebrow: "The problem",
      title: "Why do I need ==someone else== for this?",
      body: [
        "Every product needs a film, and there have only been a few ways to get one. You pay someone to make it, you make it yourself by hand, or you ask an AI tool and get what everyone else gets.",
        "I've made launch films the slow way, recording, composing, rendering and splicing each one myself. So the same question kept coming back. If I already know what a good film of my product looks like, why can't I just make it, and why does every new film start from an empty timeline?",
      ],
    },
    {
      type: "cards",
      quick: true,
      items: [
        { title: "Hire someone", text: "You brief them, wait, and go back to them for every change. Slowly the idea stops being yours." },
        { title: "Do it by hand", text: "Record, crop, mock up, keyframe, export, and again. Changing one shot can mean rendering the whole film." },
        { title: "Ask a generic AI tool", text: "It fills every decision you didn't make with a safe default: big centred text, a gradient, the logo at the end." },
        { title: "Start over every time", text: "Whichever you choose, the next film begins from nothing, because nothing remembers what you liked." },
      ],
    },
    {
      type: "section",
      id: "why",
      title: "Why ==I made it==",
      body: [
        "I wanted two things that usually fight each other. I wanted the original idea of a film to stay mine, and I wanted the whole process of making it automated.",
        "So the engine takes the slow parts: reading the product, writing the story, directing the shots and rendering the film. The idea, the taste and the final call stay with the person whose product it is. And like a good collaborator, it should get better at this the longer you work together.",
      ],
    },
    {
      type: "statement",
      text: "Your product's film shouldn't have to wait for ==someone else's calendar==.",
    },
    {
      type: "section",
      id: "constraints",
      title: "Two rules ==I set for myself==",
      body: [
        "The engine grew out of animations I had already made, in different stacks, and I wasn't going to rewrite any of them. That one rule decided most of the architecture.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Existing work",
          constraint: "My animations were already built, in different stacks: React, plain HTML, shaders.",
          chose: "Each one runs as it was built, in its own iframe at the device's viewport, with nothing rewritten.",
          cost: "Every device frame is a whole page, and parameters have to cross into it through a bridge.",
        },
        {
          kind: "Focus",
          constraint: "Tuning a shot needs the controls for that shot, and nothing else.",
          chose: "Only the controls for the current shot stay open. The rest fold away.",
          cost: "Rare controls are a click deeper.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Design process",
      title: "From a folder of animations to ==a studio==",
      body: [
        "I brought the work home first, then solved how it should look on a real screen. The film tools came after that, because the device is half of every shot.",
      ],
    },
    {
      type: "process",
      steps: [
        {
          phase: "Audit",
          kind: "cards",
          title: "Bring the work home",
          text: "Each animation became a folder with a small meta file, and the library finds them on its own.",
          made: "everything I'd animated, in one library",
        },
        {
          phase: "Define",
          kind: "phone",
          title: "Start from the device",
          text: "Each animation runs at the device's own viewport, so its breakpoints behave as they would on the phone.",
          made: "exact device frames, with a frame-rate estimate for each",
        },
        {
          phase: "Build",
          kind: "screen",
          title: "Turn the launch-film kit into a Studio",
          text: "My hand-built film pipeline worked because every frame was a pure function of time. That idea became the Studio.",
          made: "the Studio, exporting PNG, MP4 or ProRes",
        },
        {
          phase: "Refine",
          kind: "notes",
          title: "Let taste set the rules",
          text: "Every review I gave became a written rule, so the same mistake couldn't come back.",
          made: "DESIGN-SYSTEM.md, the engine's rulebook",
        },
        {
          phase: "Ship",
          kind: "box",
          title: "Make it one call",
          text: "Once the pipeline was reliable, I put it behind an MCP server, so any project can ask for its own film.",
          made: "make_video and make_interactive",
        },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/devices.html",
      title: "The four devices it renders on",
      note: "Point at a device and it stands up straight and lifts off the plinth. Every animation runs inside one of these, at that device's own viewport.",
    },
    {
      type: "section",
      id: "one-call",
      entry: "focus",
      eyebrow: "The product",
      title: "Ask for a film in ==one sentence==",
      body: [
        "You tell it what you want, from Claude or from the app: \"Make an intro video for this codebase.\" The engine reads the project, captures the running app and picks up its name, words and colours. Then it writes the story, sets the art direction and cuts the film to a beat.",
        "What comes back is a starting point. In the Studio you get three takes to choose from, and every scene, title and cut stays editable, so the final call stays with you.",
      ],
    },
    {
      type: "gallery",
      pictures: [
        { src: `${dir}/artist.webp`, alt: "Three takes on a film, each a different art direction" },
        { src: `${dir}/templates.webp`, alt: "Start from a template, sorted by kind of film" },
      ],
      tabs: ["Three takes", "Templates"],
      caption: "Three takes on one film, and the templates they start from.",
    },
    {
      type: "section",
      id: "taste",
      title: "The fun part: it ==learns your taste==",
      body: [
        "Most tools treat every film as the first one. The engine keeps track. The take you use, the ones you pass over and every film you export all teach it what you like, and it leans that way next time while still trying new things.",
        "You can also tell it why. Say a film has too much going on, and that reason becomes a rule for the next one. Show it a film you love, and it takes that film apart into moves it can reuse. Over time the defaults stop being anyone else's and start being yours.",
      ],
    },
    {
      type: "section",
      id: "lab",
      title: "It studies ==while you sleep==",
      body: [
        "Every night the Lab studies reference films and proposes new templates and effects, following a written rulebook. Nothing reaches the engine until you review it. You keep or pass each proposal and give a reason, and those reasons shape the next night's work.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/lighttable.html",
      title: "Frames on a light table",
      note: "Point at the glass and the frames near the pointer rise, the way the Lab lifts out the frames worth keeping from a film.",
    },
    {
      type: "section",
      id: "library",
      title: "Your own work, ==on real devices==",
      body: [
        "The engine started as a home for everything I'd animated, and that's still its heart. Each animation runs live in an exact iPhone, iPad or MacBook frame, so it can go straight into a film without opening the project it came from.",
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/library.webp`, alt: "The library: every animation, running live in an exact device frame." },
      tall: true,
      caption: "The library: every animation, running live in an exact device frame.",
    },
    {
      type: "section",
      id: "studio",
      title: "What you preview is ==what you export==",
      body: [
        "Before anything becomes a film, you can rotate a device, compare every device at true size, emulate reduced motion and read the frame-rate estimate. The Studio then turns that into a film, with layered scenes, real 3D devices, titles and cuts.",
        "The export renders the same pages the preview shows, so what you see is what ships, and a scene that didn't change is the same file as before.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/platter.html",
      title: "A device on a turntable",
      note: "Give it a push. The phone turns on its platter and settles on a face, the way the Studio turns a device to frame a shot.",
    },
    {
      type: "section",
      id: "wireframes",
      title: "Four places, ==one rule==",
      body: [
        "The app has four places, and they all follow one rule. Each gallery shows the work drawn as itself, and opening anything goes full screen into the place that makes it.",
      ],
    },
    { type: "wireframes", screens: engineWires, over: { src: `${dir}/studio.webp`, alt: "The Studio, where a film is made" } },
    {
      type: "gallery",
      pictures: [
        { src: `${dir}/screen-builder.webp`, alt: "The screen builder: animations placed on a device" },
        { src: `${dir}/search.webp`, alt: "Search: products, films, places and actions in one field" },
      ],
      tabs: ["Screen builder", "Search"],
    },
    {
      type: "section",
      id: "decisions",
      title: "Three first ideas ==I had to drop==",
      body: [
        "In all three cases, the first version was the easy one. Here is what replaced it, and why.",
      ],
    },
    {
      type: "decisions",
      items: [
        {
          title: "Where the templates come from",
          chose: "Templates rebuilt from my own reference films, with their measured cuts, framing and palette.",
          why: "A template is only worth starting from if it's measured off a film I would actually make.",
          considered: [
            { option: "The generic built-in templates", why: "They read as generic, so every film made from them did too." },
          ],
        },
        {
          title: "How a device is drawn",
          chose: "three.js models at Apple's dimensions, with real materials and a photography set.",
          why: "The device is half of every shot.",
          considered: [
            { option: "Devices built from CSS faces", why: "Quick to make, but they never looked like real devices." },
          ],
        },
        {
          title: "The colour of the interface",
          chose: "Monochrome: ink buttons, grey selection and Geist neutrals.",
          why: "The colour belongs to the work on the devices.",
          considered: [
            { option: "Iris-filled buttons, toggles and selection", why: "That was my first pass, and the colour competed with the work." },
          ],
        },
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/films.webp`, alt: "Films: launch films of a product, live on every screen" },
      caption: "Films: every launch film I've made of a product, playing live.",
    },
    {
      type: "section",
      id: "shift",
      title: "The same film, ==before and after==",
      body: [],
    },
    {
      type: "compare",
      quick: true,
      before: {
        label: "Getting a film made",
        steps: [
          { text: "Find someone to make it, or clear your calendar" },
          { text: "Explain the product, the look and the idea from scratch" },
          { text: "Record, crop and mock up every screen", time: "by hand" },
          { text: "Keyframe each shot, then render every frame", time: "by hand" },
          { text: "Change one shot", time: "render it all again" },
          { text: "Make the next film", time: "start from nothing" },
        ],
        total: "Every film starts from nothing",
      },
      after: {
        label: "With the engine",
        steps: [
          { text: "Ask for the film in one sentence", time: "1 call" },
          { text: "It reads the product's screens, words and colours", time: "automatic" },
          { text: "It captures the running app at device size", time: "automatic" },
          { text: "It writes the story, cuts to a beat and renders", time: "automatic" },
          { text: "Change one scene", time: "only that scene renders" },
          { text: "Make the next film", time: "start from your taste" },
        ],
        total: "Every film starts from what it learned",
      },
    },
    {
      type: "section",
      id: "system",
      title: "Every part ==feeds a film==",
      body: [
        "Change one scene and only that scene renders again, because the same input always gives the same frames. And everything you keep or pass flows back into the next draft.",
      ],
    },
    {
      type: "system",
      title: "How the engine's parts depend on each other",
      note: "Point at a part, or tab to it, and everything a change to it reaches lights up.",
      parts: [
        { id: "animations", label: "Animations", note: "A folder each, with a meta file, which the library picks up automatically.", moves: ["library", "devices"] },
        { id: "kit", label: "Product kit", note: "A codebase read for its screens, words, colours and logo.", moves: ["templates", "artist", "canvas"] },
        { id: "taste", label: "Your taste", note: "The takes you use, the ones you pass and your reasons, weighed into every next draft.", moves: ["templates", "artist"] },
        { id: "lab", label: "The Lab", note: "Nightly runs that study films and propose template changes you keep or pass.", moves: ["templates"] },
        { id: "library", label: "Library", note: "Every animation, live, searchable by kind." },
        { id: "devices", label: "Device frames", note: "Each device an isolated iframe at its true viewport, with a bridge for parameters and frame timing.", moves: ["studio", "canvas"] },
        { id: "templates", label: "Templates", note: "Films that take a product's own device, screens and words.", moves: ["artist", "studio"] },
        { id: "artist", label: "The Artist", note: "Drafts a story, an art direction and three takes to choose from.", moves: ["studio"] },
        { id: "studio", label: "Studio", note: "Scenes of layers over a background, real 3D devices, titles and cuts.", moves: ["gates"] },
        { id: "canvas", label: "Canvas", note: "An interactive canvas for a site: solid 3D devices and layers, saved as JSON with two lines to embed it.", moves: ["mcp"] },
        { id: "gates", label: "Gates", note: "Checks before export: every scene sampled, every word measured, the pixels read.", moves: ["render"] },
        { id: "render", label: "Render", note: "Headless Chrome and ffmpeg, scene by scene, re-rendering only what changed.", moves: ["films", "mcp"] },
        { id: "films", label: "Films", note: "MP4 or ProRes, with review links that pin notes to a moment and a spot." },
        { id: "mcp", label: "MCP server", note: "make_video and make_interactive: a film or a canvas of any codebase, in one call." },
      ],
    },
    {
      type: "section",
      id: "results",
      entry: "wipe",
      eyebrow: "Results",
      title: "What the engine ==does now==",
      body: [],
    },
    {
      type: "stats",
      quick: true,
      items: [
        { label: "To get a film of a product", value: "One sentence", note: "Trace's first launch film came from a single make_video call." },
        { label: "Who has the final call", value: "You", note: "Every scene, title and cut stays editable after the draft." },
        { label: "To change one scene", value: "One re-render", note: "Scenes that didn't change come straight from the cache." },
        { label: "What each new film starts from", value: "Your taste", note: "The takes you used, the ones you passed and the reasons you gave." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      title: "Where it stands",
      body: [
        "The engine now makes its own films. Its launch film came out of its own Studio, and Trace's first launch film came from one call. Each film it drafts for me now starts from what I've already kept and passed.",
        "Next, I want to add music for films, and local models for private work.",
      ],
    },
  ],
};
