import { engineWires } from "../wireframes";
import type { CaseStudy } from "../types";

const dir = "/case-studies/animation-engine";

export const animationEngine: CaseStudy = {
  slug: "animation-engine",
  title: "Animation Engine",
  tagline: "I had 45 animations and no easy way to ==show any of them==.",
  theme: { deep: "#2563eb", mid: "#9a8cf2", light: "#ffc2e6", highlight: "#ffcfeb" },
  hero: { frame: "screen", picture: { src: `${dir}/home.webp`, alt: "The Animation Engine's home: What are we making?" } },
  kind: "Product",
  year: "2026",
  summary:
    "Animation Engine is one place for everything I've animated. Each piece runs live in exact iPhone, iPad and MacBook frames, and can become a launch film or an interactive canvas without opening the project it came from.",
  meta: [
    { label: "Role", value: "Product Design, Motion, Development" },
    { label: "Timeline", value: "3 weeks, 29 iterations" },
    { label: "Built with", value: "Vite, React 19, three.js, Motion, GSAP" },
  ],
  takeaways: [
    "An animation that has to be opened in its own project rarely gets shown. 45 of them, from six projects, now run in one place, each as it was built.",
    "Colour belongs to the work. My first pass had iris buttons and toggles competing with it, so the interface went monochrome.",
    "A template is only worth starting from if it's measured off a film I'd actually make. The generic ones made every film read generic.",
    "The device is half of every shot. CSS faces never looked real; three.js models at Apple's dimensions do.",
  ],
  quick: {
    problem:
      "Every animation lived inside the project it was made for, so showing one meant running that project, and every launch film was built by hand.",
    approach:
      "I built one app that runs them all live in exact Apple device frames, and turned my film process into a pipeline that can produce a launch film or a canvas from any codebase.",
    result:
      "45 animations in one library, a launch film from a codebase in about 12 minutes, and a one-scene change re-exported in 12.6 s.",
  },
  status: {
    title: "Animation Engine, live and in daily use",
    live: true,
    facts: [
      { label: "Recent Updates", value: "The Lab now has its own API key, with fallbacks when a model runs out" },
      { label: "Devices", value: "iPhone 16 Pro, iPhone Duo, iPad Pro 11″, MacBook Pro 14″" },
    ],
    sections: [
      { label: "Problem", href: "#opening" },
      { label: "Process", href: "#process" },
      { label: "Product", href: "#one-call" },
      { label: "Decisions", href: "#decisions" },
      { label: "Results", href: "#results" },
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/syedali9210/animation-engine" }],
  },
  cover: { src: `${dir}/home.webp`, alt: "The Animation Engine's home: What are we making?" },
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: [
    "That's enough of my own tools for now.",
    "Next up is a real client, a real deadline and four days to ship.",
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
      title: "Six projects, ==no device==",
      body: [
        "Every animation lived inside the project it was made for. To show one, I had to open that project, start its dev server and shrink the browser down to roughly a phone, with no idea what it cost a real device.",
        "Films were worse. Each launch film was recorded, composed, rendered and spliced by hand, and changing one shot meant rendering the whole thing again.",
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/library.webp`, alt: "The library: 45 animations, each running live in an exact device frame." },
      tall: true,
      caption: "The library: 45 animations, each running live in an exact device frame.",
    },
    {
      type: "section",
      id: "constraints",
      title: "Two rules ==I set for myself==",
      body: [
        "The work already existed, in different stacks, and I wasn't going to rewrite any of it. That one rule decided most of the architecture.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Existing work",
          constraint: "45 animations already built, in different stacks: React, plain HTML, shaders.",
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
      title: "Twenty-nine iterations, ==starting from the device==",
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
          made: "45 animations from six projects, in one library",
        },
        {
          phase: "Define",
          kind: "phone",
          title: "Start from the device",
          text: "Each animation runs at the device's own viewport, so its breakpoints behave as they would on the phone.",
          made: "four exact frames, with a frame-rate estimate per device",
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
          title: "Open it to my other projects",
          text: "Once the pipeline was reliable, I put it behind an MCP server, so any project I'm working on can ask for its own film.",
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
      title: "From a codebase to ==a launch film==",
      body: [
        "A launch film used to start from an empty timeline. Now I point the engine at a project's folder and the address where it runs. It reads the product's screens, words and colours, and drafts a story, an art direction and three takes.",
        "Those drafts follow the rules I wrote from my own reference films, and they are only a starting point. When I use one, it opens in the Studio with every scene, title and cut still editable, so the final call stays with me.",
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
      id: "studio",
      title: "What you preview is ==what you export==",
      body: [
        "Before anything becomes a film, I can rotate a device, compare every device at true size, emulate reduced motion and read the frame-rate estimate. The Studio then turns that into a film, with layered scenes, real 3D devices, titles and cuts.",
        "The export renders the same pages the preview shows, so what I see is what ships, and a scene that didn't change is the same file as before.",
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
      type: "section",
      id: "lab",
      title: "A nightly review, ==with me as the editor==",
      body: [
        "Every night the Lab studies reference films and proposes changes to templates and effects, following a written rulebook. Nothing reaches the engine until I review it. I keep or pass each proposal and give a reason, and those reasons become the rules for the next night.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/lighttable.html",
      title: "Frames on a light table",
      note: "Point at the glass and the frames near the pointer rise, the way the Lab lifts out the frames worth keeping from a film.",
    },
    {
      type: "statement",
      text: "The animations lived in ==six different projects==. Now they run in one place, each in the frame of a real device.",
    },
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
          title: "The colour of the interface",
          chose: "Monochrome: ink buttons, grey selection and Geist neutrals.",
          why: "The colour belongs to the work on the devices.",
          considered: [
            { option: "Iris-filled buttons, toggles and selection", why: "That was my first pass, and the colour competed with the work." },
          ],
        },
        {
          title: "Where the templates come from",
          chose: "Ten templates rebuilt from my own reference films, with their measured cuts, framing and palette.",
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
      title: "The same jobs, ==before and after==",
      body: [],
    },
    {
      type: "compare",
      quick: true,
      before: {
        label: "Before",
        steps: [
          { text: "Find the project an animation was made for", time: "1 of 6" },
          { text: "Install its packages, start its dev server", time: "per project" },
          { text: "Shrink the browser to roughly a phone, guess its cost", time: "by eye" },
          { text: "Record the screens, compose the film shot by shot", time: "by hand" },
          { text: "Render every frame, then encode with ffmpeg", time: "by hand" },
          { text: "Change one shot", time: "render it all again" },
        ],
        total: "One project open for every animation",
      },
      after: {
        label: "With the engine",
        steps: [
          { text: "Open the library", time: "45 in one place" },
          { text: "Nothing to install: each one already runs", time: "0 projects open" },
          { text: "Pick a real device and read its frame cost", time: "4 exact frames" },
          { text: "Ask for a film of a codebase", time: "1 call" },
          { text: "Four gates check every scene, then it renders", time: "about 12 min" },
          { text: "Change one scene and export again", time: "12.6 s" },
        ],
        total: "One place for all of them",
      },
    },
    {
      type: "section",
      id: "system",
      title: "Every part ==feeds a film==",
      body: [
        "Retiming one scene of a six-scene film re-renders only that scene, in 12.6 s, because the same input always gives the same frames.",
      ],
    },
    {
      type: "system",
      title: "How the engine's parts depend on each other",
      note: "Point at a part, or tab to it, and everything a change to it reaches lights up.",
      parts: [
        { id: "animations", label: "Animations", note: "45 folders, each with a meta file, which the library picks up automatically.", moves: ["library", "devices"] },
        { id: "kit", label: "Product kit", note: "A codebase read for its screens, words, colours and logo.", moves: ["templates", "artist", "canvas"] },
        { id: "lab", label: "The Lab", note: "Nightly runs that study films and propose template changes I keep or pass.", moves: ["templates"] },
        { id: "library", label: "Library", note: "Every animation, live, searchable by kind." },
        { id: "devices", label: "Device frames", note: "Each device an isolated iframe at its true viewport, with a bridge for parameters and frame timing.", moves: ["studio", "canvas"] },
        { id: "templates", label: "Templates", note: "15 films that take a product's own device, screens and words.", moves: ["artist", "studio"] },
        { id: "artist", label: "The Artist", note: "Drafts a story, an art direction and three takes for me to choose from.", moves: ["studio"] },
        { id: "studio", label: "Studio", note: "Scenes of layers over a background, real 3D devices, titles and cuts.", moves: ["gates"] },
        { id: "canvas", label: "Canvas", note: "An interactive canvas for a site: solid 3D devices and layers, saved as JSON with two lines to embed it.", moves: ["mcp"] },
        { id: "gates", label: "Gates", note: "Four checks before export: every scene sampled, every word measured, the pixels read.", moves: ["render"] },
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
        { label: "Animations in one library", value: "45", note: "From six projects, and none of them has to be opened to show its work." },
        { label: "A launch film of a codebase", value: "1 call, ~12 min", note: "Trace's first launch film, from the call to a saved MP4." },
        { label: "Retime one scene, export again", value: "12.6 s", note: "5 of its 6 scenes came from the render cache." },
        { label: "Export again, nothing changed", value: "2.3 s", note: "Every scene from the cache, joined without re-encoding." },
        { label: "Nightly Lab runs", value: "42", note: "50 proposals: 8 kept, 8 passed, each with its reason." },
        { label: "Design iterations", value: "29", note: "Each one's decisions written into the engine's rulebook." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      title: "Where it stands",
      body: [
        "The engine now makes its own films. Its launch film came out of its own Studio, and Trace's first launch film came from one make_video call. Any animation in the library can be tuned on a device and exported as code without opening its original project.",
        "Next, I want to add music for films, and local models for private work.",
      ],
    },
  ],
};
