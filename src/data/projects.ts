export type SolutionBlock = {
  label: string;
  leftTitle?: string;
  leftText: string;
  rightTitle?: string;
  rightText: string;
  images: { src: string; alt?: string }[];
  impactTitle?: string;
  impactText?: string;
};

export type CaseStudy = {
  overview: string[];
  challenge: string[];
  researchTitle: string;
  researchIntro: string[];
  researchNotes: { title: string; points?: string[] }[];
  findingsTitle?: string;
  findingsIntro?: string[];
  findings?: { title: string; quotes: string[] }[];
  insightsTitle: string;
  insightsIntro: string[];
  insights: { title: string; description: string }[];
  solutionsTitle: string;
  solutionsIntro: string[];
  solutions: SolutionBlock[];
  outcomesTitle: string;
  outcomesIntro: string[];
  closingNote: string[];
  outcomes: { label: string; metric: string }[];
  learnedTitle: string;
  learned: string[];
  /** Honest scope: what I did on this project, and what I didn't. */
  scope?: { did: string[]; didnt: string[] };
};

export type Project = {
  slug: string;
  title: string;
  meta: string;
  tag: string;
  description: string;
  gradient: string;
  image?: string;
  caseStudy?: CaseStudy;
  /** Live demo, source, and similar — shown as pills on the card and in the case study. */
  links?: { label: string; href: string }[];
  /** Not shippable yet — hero image stays blurred, with a "Coming soon" lock overlay on hover. */
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    slug: "trace",
    title: "TRACE",
    meta: "Personal, 2026",
    tag: "Product Design & Build",
    description:
      "A design memory for people and AI agents. It captures work from Figma, GitHub and folders, writes the changelog itself, and hands that context to every agent, so nobody has to re-explain a project again.",
    gradient: "from-[#2a2a2a] to-[#4a4a4a]",
    image: "/images/case-studies/trace/trace-cover.webp",
    links: [{ label: "GitHub", href: "https://github.com/syedali9210/Trace" }],
    caseStudy: {
      overview: [
        "TRACE is a design context engine. It watches the tools I design and build in, groups raw saves into moments, writes the changelog from what actually changed, and files everything into a project.",
        "That memory goes two ways: to people as a timeline, diffs, a canvas and a case study, and to AI agents like Claude Code, Codex and Cursor through an MCP server.",
      ],
      challenge: [
        "When I hand design work to an AI agent or a teammate, I want them to already know the project's history, decisions and current state. Instead I kept re-explaining it every session and writing changelogs by hand.",
        "The persona is me: a solo design engineer who designs in Figma or Framer and builds with Claude Code. The one action the whole product hangs on is simple. Connect a tool once, then confirm what TRACE captured.",
      ],
      scope: {
        did: [
          "Framed the job, the persona and the one core action, then scoped the product into 15 features.",
          "Designed the whole interface: home feed, project timeline, canvas of blocks, case study, to-do board and Ask.",
          "Built it end to end with Claude Code: a local server, an MCP server for agents, and a React app on shadcn/ui and Fluid Functionalism.",
          "Measured the app walk and made it faster, from 15 min for 28 screens to 2 min 47 s for 37.",
        ],
        didnt: [
          "Run the Figma and GitHub connectors against live accounts yet. They're written to the documented APIs and proven on a sample project.",
          "Ship a hosted version. It runs on your own machine, with no billing, browser extension or email-in.",
          "Use real embeddings. Search similarity is local and offline for now, with an upgrade path in the code.",
          "Test Cursor and Copilot memory reading on real chats. There were none on my machine to test with.",
        ],
      },
      researchTitle: "Where the Context Gets Lost",
      researchIntro: [
        "Before designing anything, I traced where a project's context actually lives during a normal week of work. It was spread across four places, and none of them talked to each other.",
      ],
      researchNotes: [
        { title: "Agents start every session cold.", points: ["Every new chat means re-explaining history and decisions."] },
        { title: "Changelogs are written by hand.", points: ["Or more honestly, not written at all."] },
        { title: "The work is split across tools.", points: ["Design in Figma, code in Git, the reasons buried in chat logs."] },
        { title: "Every AI keeps its own memory.", points: ["What Claude learned never reaches Cursor or Codex."] },
      ],
      insightsTitle: "Design Principles",
      insightsIntro: [
        "A memory tool only works if it's trusted and costs nothing to keep up. These four rules shaped every screen.",
      ],
      insights: [
        {
          title: "Capture, don't ask",
          description: "Connect a tool once. After that, the only job is confirming what TRACE captured in the review inbox, one key per moment.",
        },
        {
          title: "Every claim comes from the diff",
          description: "Changelogs are written by rules from what actually changed, like \"Decreased font size. Changed colours.\", so nothing is made up.",
        },
        {
          title: "Agents are users too",
          description: "The same memory people browse is served to agents over MCP, so the next AI already knows what the last one learned.",
        },
        {
          title: "Code changes should look like design changes",
          description: "When a component file changes, TRACE draws it, so a code change shows up as a picture with a diff, just like a Figma change.",
        },
      ],
      solutionsTitle: "The Product",
      solutionsIntro: ["Screens below are from TRACE running its own sample project."],
      solutions: [
        {
          label: "A Project, Opened",
          leftText: "Seeing what changed between iterations meant scrubbing through Figma versions or git logs.",
          rightText: "Every iteration runs down the middle, newest first, with change cards beside it: one per kind of change, each with its before and after values.",
          images: [{ src: "/images/case-studies/trace/trace-p1.webp", alt: "TRACE project timeline with change cards" }],
          impactTitle: "Why it works",
          impactText: "You read what changed in a sentence, then check the exact values only if you need to.",
        },
        {
          label: "Canvas of Blocks",
          leftText: "Briefs, constraints, references, decisions and reviews all lived in different docs.",
          rightText: "A project canvas with a block for each: overview, iterations, reviews, constraints, references, tasks, decisions and the case study. Link two blocks and TRACE says what one means for the other.",
          images: [{ src: "/images/case-studies/trace/trace-canvas.webp", alt: "TRACE project canvas" }],
          impactTitle: "Why it works",
          impactText: "The whole project fits on one screen, and gaps show up on their own.",
        },
        {
          label: "Case Study and Tasks",
          leftText: "Writing a case study after the fact meant digging through weeks of work from memory.",
          rightText: "TRACE answers the case study questions from the work itself, each with its sources, and marks what's still open. Tasks live on a board you can drag and link.",
          images: [
            { src: "/images/case-studies/trace/trace-case.webp", alt: "TRACE case study view" },
            { src: "/images/case-studies/trace/trace-todo.webp", alt: "TRACE to-do board" },
          ],
          impactTitle: "Impact",
          impactText: "The story of a project assembles itself while you work, instead of after.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: [
        "TRACE is still in progress, but every feature in its PRD is built and it runs end to end on a sample project.",
      ],
      closingNote: ["That was a lot of context.", "Good thing something's keeping track of it now."],
      outcomes: [
        { label: "PRD features built", metric: "15 of 15" },
        { label: "Full app walk", metric: "15 min → 2 min 47 s" },
        { label: "Screens found per walk", metric: "28 → 37" },
        { label: "AI tools it reads memory from", metric: "6" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "The hardest part of working with AI agents isn't the code they write, it's the context they don't have. Building TRACE also taught me to trust claims I can trace back to evidence, which is why its changelogs come from the diff and not from a model's guess.",
      ],
    },
  },
  {
    slug: "swish",
    title: "Swish: When the Kitchen Runs Out",
    meta: "Speculative, 2026",
    tag: "Mobile Product Design",
    description:
      "A working mobile prototype for the one moment Swish still hands a paying customer to a phone call: an item running out mid-cook.",
    gradient: "from-[#0b2a16] to-[#178039]",
    image: "/images/case-studies/swish/swish-cover.webp",
    links: [
      { label: "Live prototype", href: "https://swish-red.vercel.app/" },
      { label: "GitHub", href: "https://github.com/syedali9210/swish" },
    ],
    caseStudy: {
      overview: [
        "Swish is a 10-minute food delivery app in Bengaluru that cooks in its own kitchens. This is an unsolicited case study and working prototype for one gap in its app.",
        "Swish already designs for unavailable items at browse time, where they're greyed out. The gap is after payment, mid-cook, when the only fix today is a phone call.",
      ],
      challenge: [
        "Two App Store reviews a month apart describe the same problem. In July, one customer got three separate calls as three items ran out, one after another. In August, another was talked into receiving the same dish twice.",
        "I checked the app's version history through 2.1.3, and no substitution feature had shipped. The goal was to replace the call with something the customer could settle in seconds.",
      ],
      scope: {
        did: [
          "Found the problem in App Store reviews and confirmed in the version history that nothing had shipped for it.",
          "Sampled Swish's real palette and measured its motion frame by frame from a 60fps screen recording.",
          "Designed the flow, states and copy, from the lock screen notification to the resolved order.",
          "Built it as a working React prototype with Motion, built with Claude, and deployed it live.",
        ],
        didnt: [
          "Work with Swish or use their data. I'm outside their delivery radius, so this is one screen recording, not real orders.",
          "Pick the 40 second window from data. It's a guess, and their numbers would set it.",
          "Use the real tracking screen. The recording stops at address confirmation, so the screen behind the sheet is my reconstruction.",
          "Use real food photos or confirm the typeface. Images come from my Figma file and DM Sans is a close guess.",
        ],
      },
      researchTitle: "Studying the Real App",
      researchIntro: [
        "I wanted the fix to feel like Swish had shipped it, so I studied the real app before designing anything.",
      ],
      researchNotes: [
        { title: "Palette sampled, not invented.", points: ["Brand green #2DB955, surface #FDFDFD, from the recording."] },
        { title: "Motion measured frame by frame.", points: ["Nav push 150ms, bottom sheet 200ms, screen change 300ms."] },
        { title: "Swish doesn't bounce.", points: ["Ease out with no overshoot, so nothing in the prototype springs."] },
        { title: "Their own out-of-stock pattern.", points: ["Greyed out with a disabled control, reused instead of reinvented."] },
      ],
      insightsTitle: "The Calls This Makes",
      insightsIntro: [
        "One decision drives the rest: the kitchen decides, it doesn't ask. In a 10-minute app, a question costs more than a reversible wrong guess.",
      ],
      insights: [
        {
          title: "The notification carries the whole decision",
          description: "What ran out, what the kitchen already did, and that the 9 minutes still holds. If they never open the app, they've still been told everything.",
        },
        {
          title: "It can't happen twice",
          description: "Swaps only come from a small set the kitchen keeps on all day, so the July cascade of three calls is designed out.",
        },
        {
          title: "It reads as an upgrade, because it is one",
          description: "Swaps normally sell for more than you paid, so the copy leads with the good news and gives the reason in the very next line.",
        },
        {
          title: "Dropping it is always one tap",
          description: "\"No thanks, refund\" is never buried, and an item already in the order shows greyed out, so a duplicate can't happen.",
        },
      ],
      solutionsTitle: "The Flow",
      solutionsIntro: ["Four states, one sheet, on a screen Swish already has."],
      solutions: [
        {
          label: "Notification and Swap",
          leftText: "A phone call interrupts the customer and still needs an answer from them.",
          rightText: "The lock screen notification explains everything. Tapping it opens straight onto the swap already in progress, with 40 seconds to keep it, change it or drop it.",
          images: [{ src: "/images/case-studies/swish/swish-notif-sheet.webp", alt: "Lock screen notification and swap sheet" }],
          impactTitle: "Why it works",
          impactText: "The customer is informed before they unlock, and acting takes one tap.",
        },
        {
          label: "Override and Resolve",
          leftText: "In the reviews, the agreed substitute also ran out, and another customer ended up with a duplicate.",
          rightText: "Other options come only from dishes the kitchen always has, each with its price difference. Anything already in the bag is greyed out. Once resolved, the ETA hasn't moved.",
          images: [{ src: "/images/case-studies/swish/swish-override-resolved.webp", alt: "Override list and resolved order" }],
          impactTitle: "Impact",
          impactText: "Same nine minutes, no call, and money is never a surprise.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: [
        "This is a proposal, not a shipped feature, so these are design outcomes rather than measured ones.",
      ],
      closingNote: ["That's the kachori sorted.", "Hopefully nobody gets three calls again."],
      outcomes: [
        { label: "Calls to sort a stockout", metric: "3 → 0" },
        { label: "Change to the ETA", metric: "+0 min" },
        { label: "New screens added", metric: "0, one sheet" },
        { label: "Motion matched to the app", metric: "150 / 200 / 300 ms" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "Matching a product's restraint is harder than out-animating it. Measuring Swish's real timings, and then not adding a single bounce, made the prototype feel like theirs. I also learned to write down my gaps as clearly as my decisions.",
      ],
    },
  },
  {
    slug: "animation-engine",
    title: "Animation Engine",
    meta: "Personal, 2026",
    tag: "Motion & Prototyping",
    description:
      "A motion library and studio where every animation runs live inside exact iPhone, iPad and MacBook frames, gets tuned with real controls, shows its GPU cost, and can be turned into a launch film.",
    gradient: "from-[#1a1a1a] to-[#3a2a1a]",
    image: "/images/case-studies/animation-engine/ae-swiggy-iphone.webp",
    links: [
      { label: "Live demo", href: "https://animation-engine-nine.vercel.app/" },
      { label: "GitHub", href: "https://github.com/syedali9210/animation-engine" },
    ],
    caseStudy: {
      overview: [
        "Animation Engine puts every animation from my projects in one place. Each one runs inside an accurate device frame, can be tuned live, and can be composed into a launch film.",
        "Built with React, TypeScript, Three.js, GSAP and Motion.",
      ],
      challenge: [
        "My animations were scattered across separate Desktop projects. Previewing them in a desktop browser hid how they actually felt on a phone, I had no idea what each one cost the GPU, and making a launch film meant reaching for another tool.",
      ],
      scope: {
        did: [
          "Designed and built the engine: the library, device stage, inspector, Studio and command palette.",
          "Made each animation run in a real iframe at the device's own viewport, so CSS breakpoints behave like they would on the device.",
          "Rebuilt the Swiggy home screen and split it into components you can test on their own.",
          "Added GPU and main-thread cost measurement for every animation.",
        ],
        didnt: [
          "Write every animation from scratch. Most come from my earlier projects, the Swiggy screen started as a Figma Make export, and one is VengeanceUI's, as published.",
          "Test on real hardware. The frames match viewport, pixel ratio and breakpoints in the browser, which is close, but not the same as a real device.",
        ],
      },
      researchTitle: "What Motion Needs to Be Judged Fairly",
      researchIntro: [
        "Before building, I listed what a desktop browser preview gets wrong about mobile motion.",
      ],
      researchNotes: [
        { title: "The wrong size.", points: ["A desktop window never hits the phone's breakpoints."] },
        { title: "The wrong pixel ratio.", points: ["Canvas cost changes at 3x, so performance looked better than it was."] },
        { title: "No reduced-motion check.", points: ["Easy to forget when the OS setting is off."] },
        { title: "Tuning meant editing code.", points: ["Every timing tweak was a save and reload."] },
      ],
      insightsTitle: "Design Principles",
      insightsIntro: ["Four rules for a tool that makes motion easier to judge."],
      insights: [
        {
          title: "Judge motion where it lives",
          description: "Every animation plays inside the device it's meant for, at its true size, and Compare shows them all at relative scale.",
        },
        {
          title: "Tune, don't re-code",
          description: "Timing, easing and behavior are live controls in the inspector, including a cubic-bezier editor.",
        },
        {
          title: "Know the cost",
          description: "Every animation shows what it costs the GPU and main thread on each device, so smooth isn't a guess.",
        },
        {
          title: "Motion is also marketing",
          description: "The same animations become scenes in a launch film, without leaving the tool.",
        },
      ],
      solutionsTitle: "The Tool",
      solutionsIntro: ["Screens from the live demo."],
      solutions: [
        {
          label: "Components in a Device",
          leftText: "Tuning motion in a desktop browser hid how it felt on a phone.",
          rightText: "Pick any animation and it runs in an iPhone 16 Pro frame at 402 by 874, with its timing and easing exposed as live controls beside it.",
          images: [
            { src: "/images/case-studies/animation-engine/ae-swiggy-iphone.webp", alt: "Swiggy home screen in an iPhone frame" },
            { src: "/images/case-studies/animation-engine/ae-component-tuning.webp", alt: "Toast stack with timing controls" },
          ],
          impactTitle: "Why it works",
          impactText: "You feel the motion at the size people will actually see it.",
        },
        {
          label: "Compare Across Devices",
          leftText: "A layout that works on a phone can break on a tablet or a laptop.",
          rightText: "Compare places iPhone, Duo, iPad and MacBook side by side at true relative size, each showing which breakpoint is active.",
          images: [{ src: "/images/case-studies/animation-engine/ae-compare.webp", alt: "Compare view across four devices" }],
          impactTitle: "Why it works",
          impactText: "Responsive problems show up in one glance instead of four window resizes.",
        },
        {
          label: "Studio for Launch Films",
          leftText: "Turning an animation into a launch video meant exporting it into another tool.",
          rightText: "The Studio composes scenes from layers, with devices, camera moves and a timeline, and exports the film.",
          images: [
            { src: "/images/case-studies/animation-engine/ae-studio.webp", alt: "Studio with a launch film timeline" },
            { src: "/images/case-studies/animation-engine/ae-overview.webp", alt: "Product overview with film templates" },
          ],
          impactTitle: "Impact",
          impactText: "One tool from tuning a micro-interaction to shipping the film that shows it off.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: ["The engine is live, and it's where I build and test motion now."],
      closingNote: ["That's a lot of easing curves.", "Thanks for scrolling through them smoothly."],
      outcomes: [
        { label: "Animations in the library", metric: "35" },
        { label: "Device frames", metric: "4" },
        { label: "Swiggy components to test alone", metric: "10" },
        { label: "Film templates", metric: "15" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "Motion only feels right when you judge it at the real size, on the real pixel ratio, with its real cost in view. Building the engine made me a lot more honest about my own animations.",
      ],
    },
  },
  {
    slug: "kodex",
    title: "Kodex",
    meta: "BASENINE, 2026",
    tag: "Web Redesign",
    description:
      "Redesigned Kodex's marketing site so a mature B2B compliance platform finally feels as trustworthy and easy to evaluate as the product actually is.",
    gradient: "from-[#7f5d83] to-[#7c7340]",
    image: "/images/case-studies/kodex/kodex-screenshot.png",
    caseStudy: {
      overview: [
        "Kodex is a B2B compliance platform that helps organizations integrate regulatory workflows into their existing systems.",
        "Redesigning the marketing website to better communicate the product, improve usability, and create a stronger enterprise-first experience.",
      ],
      challenge: [
        "The existing website didn't effectively communicate the value of the product. Technical information was difficult to digest, navigation lacked structure, and the overall experience didn't reflect the maturity of the platform.",
      ],
      researchTitle: "Understanding the Existing Experience",
      researchIntro: ["After reviewing the existing website, I identified several areas that created friction for users."],
      researchNotes: [
        { title: "Product messaging wasn't immediately clear." },
        { title: "Important content lacked visual hierarchy." },
        { title: "Navigation made exploration feel difficult." },
        { title: "Enterprise trust wasn't communicated effectively." },
        { title: "Visual consistency varied across pages." },
      ],
      insightsTitle: "Design Goals",
      insightsIntro: [
        "After identifying the key pain points, I defined a few design goals that guided the entire redesign. The focus wasn't just on improving the UI, but on making the experience clearer, easier to navigate, and more aligned with how enterprise users explore and understand a product like Kodex.",
      ],
      insights: [
        {
          title: "Product Clarity",
          description: "Help visitors understand what Kodex does within the first few seconds.",
        },
        {
          title: "Enterprise Trust",
          description: "Create a premium visual language that reflects the maturity of the platform.",
        },
        {
          title: "Simplify Navigation",
          description: "Reduce friction and make important information easier to discover.",
        },
        {
          title: "Drive Conversions",
          description:
            "Design clear user journeys that naturally lead visitors toward booking a demo or exploring documentation.",
        },
      ],
      solutionsTitle: "The Redesign",
      solutionsIntro: ["The redesign focused on solving the most critical pain points uncovered during research."],
      solutions: [
        {
          label: "Hero Experience",
          leftText: "The hero section didn't clearly communicate Kodex's value proposition.",
          rightTitle: "Why this solution",
          rightText:
            "Redesigned the hero with stronger messaging, supporting visuals, and clear primary actions to immediately explain the platform.",
          images: [{ src: "/images/case-studies/kodex/kx-hero-image.png", alt: "Kodex hero redesign" }],
          impactTitle: "Why it works",
          impactText: "Visitors understand what Kodex does within seconds and know where to go next.",
        },
        {
          label: "Information Architecture & Navigation",
          leftText:
            "Users had difficulty discovering products, industries, and integrations due to an unstructured navigation system.",
          rightText: "Reorganized the navigation around user intent and introduced a clearer information architecture.",
          images: [
            { src: "/images/case-studies/kodex/kx-nav-frame2.png" },
            { src: "/images/case-studies/kodex/kx-nav-frame1.png" },
            { src: "/images/case-studies/kodex/kx-nav-image9.png" },
          ],
          impactTitle: "Why it works",
          impactText: "Makes exploring the platform more intuitive while reducing decision fatigue.",
        },
        {
          label: "Product Storytelling",
          leftText: "Complex compliance workflows were difficult to understand through text-heavy sections.",
          rightText: "Rebuilt product pages using modular layouts, visual storytelling, and clearer content hierarchy.",
          images: [
            { src: "/images/case-studies/kodex/kx-story-image10.png" },
            { src: "/images/case-studies/kodex/kx-story-image11.png" },
          ],
          impactTitle: "Why it works",
          impactText: "Transforms technical information into content that's easier to scan and understand.",
        },
        {
          label: "Enterprise Trust",
          leftText: "The website lacked visual elements that reinforced credibility and trust.",
          rightTitle: "Why it works",
          rightText:
            "Introduced stronger typography, consistent spacing, customer logos, supporting visuals, and enterprise-focused layouts.",
          images: [
            { src: "/images/case-studies/kodex/kx-trust-chart.png" },
            { src: "/images/case-studies/kodex/kx-trust-frame1.png" },
            { src: "/images/case-studies/kodex/kx-trust-frame3.png" },
            { src: "/images/case-studies/kodex/kx-trust-frame2.png" },
          ],
          impactTitle: "Impact",
          impactText: "Creates a more credible and professional experience for enterprise buyers.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: [
        "The redesign transformed Kodex's website into a clearer, more structured experience that better communicates the product while reinforcing trust with enterprise customers.",
      ],
      closingNote: [
        "Phew... that was a lot of compliance.",
        "Thanks for sticking around. Let's move on to something a little less regulated.",
      ],
      outcomes: [
        { label: "Clearer Product Communication", metric: "↓ Learning Curve" },
        { label: "Improved Navigation", metric: "3 → 1 Navigation Path" },
        { label: "Stronger Enterprise Trust", metric: "↑ Brand Trust" },
        { label: "Conversion-Focused Journey", metric: "↑ CTA Visibility" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "Working on Kodex taught me that designing for B2B products goes beyond creating clean interfaces — it's about simplifying complex ideas and communicating them with clarity. I also learned how to balance stakeholder feedback, business goals, and technical constraints while building a scalable experience that feels intuitive, trustworthy, and ready to grow.",
      ],
    },
  },
  {
    slug: "uniqkey",
    title: "Uniqkey",
    meta: "BASENINE, 2026",
    tag: "Web Design",
    description:
      "Designed a landing page that makes data breach risk feel real enough for businesses to actually act on, instead of more jargon to tune out.",
    gradient: "from-[#3a4855] to-[#545b3c]",
    image: "/images/case-studies/uniqkey/uniqkey-screenshot.png",
    caseStudy: {
      overview: [
        "Uniqkey is a European password and access management platform that helps businesses secure employee credentials and manage access across their organization.",
        "Design a focused landing page that explains Data Breach Monitoring in a simple way, builds trust, and encourages businesses to assess their security posture.",
      ],
      challenge: [
        "Data breach monitoring is a technical topic that can easily overwhelm visitors. The challenge was to communicate the value of the feature in a way that felt approachable, trustworthy, and conversion-focused without sacrificing technical credibility.",
      ],
      researchTitle: "Understanding the Existing Experience",
      researchIntro: [
        "I reviewed how information was presented and how users progressed through the page to identify opportunities for improving clarity and conversions.",
      ],
      researchNotes: [
        { title: "Technical messaging felt overwhelming." },
        { title: "Important benefits lacked emphasis." },
        { title: "Value proposition wasn't immediately obvious." },
        { title: "The page needed a stronger narrative flow." },
        { title: "Calls-to-action could be more prominent." },
      ],
      insightsTitle: "Design Goals",
      insightsIntro: [
        "The redesign focused on balancing technical depth with simplicity while guiding visitors toward meaningful action.",
      ],
      insights: [
        {
          title: "Complex Security Concepts",
          description: "Make cybersecurity easier for non-technical decision makers.",
        },
        {
          title: "Enterprise Trust",
          description: "Use visual hierarchy and credibility cues to reinforce confidence.",
        },
        {
          title: "Improve Storytelling",
          description: "Create a logical flow that gradually explains the problem and solution.",
        },
        {
          title: "Drive Conversions",
          description: "Design a clearer path toward trying the feature or booking a demo.",
        },
      ],
      solutionsTitle: "The Redesign",
      solutionsIntro: ["The redesign focused on solving the most critical pain points uncovered during research."],
      solutions: [
        {
          label: "Hero Experience",
          leftText: "The hero didn't immediately explain why data breach monitoring matters.",
          rightTitle: "Why this solution",
          rightText:
            "Redesigned the hero around a stronger value proposition with supporting visuals and clear CTAs.",
          images: [{ src: "/images/case-studies/uniqkey/uk-hero-image.png", alt: "Uniqkey hero redesign" }],
          impactTitle: "Why it works",
          impactText: "Visitors immediately understand the problem and how Uniqkey solves it.",
        },
        {
          label: "Problem & Risk Communication",
          leftText: "The impact of a data breach wasn't clearly communicated.",
          rightText: "Introduced structured content and visual storytelling to explain the risks and their business impact.",
          images: [
            { src: "/images/case-studies/uniqkey/uk-risk-frame2.png" },
            { src: "/images/case-studies/uniqkey/uk-risk-frame3.png" },
            { src: "/images/case-studies/uniqkey/uk-risk-frame1.png" },
          ],
          impactTitle: "Why it works",
          impactText: "Creates urgency without overwhelming users.",
        },
        {
          label: "Feature Breakdown",
          leftText: "Core features were buried within large blocks of content.",
          rightText: "Redesigned feature sections using modular cards, icons, and concise explanations.",
          images: [
            { src: "/images/case-studies/uniqkey/uk-feature-frame4.png" },
            { src: "/images/case-studies/uniqkey/uk-feature-frame2.png" },
            { src: "/images/case-studies/uniqkey/uk-feature-frame1.png" },
            { src: "/images/case-studies/uniqkey/uk-feature-frame3.png" },
          ],
          impactTitle: "Why it works",
          impactText: "Makes capabilities easier to scan and compare.",
        },
        {
          label: "Trust & Credibility",
          leftText: "The page lacked enough proof to reassure enterprise buyers.",
          rightTitle: "Why it works",
          rightText: "Added stronger trust signals through testimonials, certifications, and supporting visuals.",
          images: [
            { src: "/images/case-studies/uniqkey/uk-trust-image1.png" },
            { src: "/images/case-studies/uniqkey/uk-trust-image2.png" },
          ],
          impactTitle: "Impact",
          impactText: "Builds confidence before users reach the CTA.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: [
        "The redesign focused on creating a clearer, more structured experience that better communicates the product while making it easier for enterprise users to explore, understand, and take action.",
      ],
      closingNote: [
        "Phew... that was a lot of breach talk.",
        "Thanks for sticking around. Let's move on to something a little less alarming.",
      ],
      outcomes: [
        { label: "Clearer Security Communication", metric: "↓ Complexity" },
        { label: "Stronger Storytelling", metric: "1 Clear User Journey" },
        { label: "Enterprise-ready Experience", metric: "↑ Brand Trust" },
        { label: "Better Conversion Flow", metric: "↑ CTA Visibility" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "Designing for cybersecurity taught me that users don't need every technical detail upfront — they need clarity, confidence, and a clear understanding of why the product matters. This project strengthened my ability to simplify complex topics while designing experiences that educate, build trust, and encourage action.",
      ],
    },
  },
  {
    slug: "airtribe",
    title: "Airtribe - AI Learning Experience",
    meta: "EduTech, 2026",
    tag: "Product Design",
    description:
      "Designed an AI experience for the users to ease their learning experience through out the site.",
    gradient: "from-[#123600] to-[#005266]",
    image: "/images/case-studies/airtribe/frame-7.png",
    caseStudy: {
      overview: [
        "An AI-powered redesign of Airtribe's learning platform focused on helping learners navigate courses more confidently, reduce friction, and receive contextual AI assistance throughout their learning journey.",
        "Airtribe is a cohort-based edtech platform where professionals learn through live sessions, mentorship, assignments, and community-driven programs.",
      ],
      challenge: [
        "Although Airtribe offered quality learning content, the overall experience made it difficult for learners to understand where they were, what to do next, and how to make the most of the platform.",
        "My goal was to redesign the learning experience while exploring how AI could provide contextual assistance without overwhelming users.",
      ],
      researchTitle: "Breaking Down the Problem",
      researchIntro: [
        "To dig deeper, I broke the problem down into four areas: how learners moved through their course journey, how they navigated the platform, how information was prioritized, and how engaged they felt along the way.",
        "Each area became its own lens for uncovering exactly where the friction was coming from.",
      ],
      researchNotes: [
        {
          title: "Learning Journey",
          points: [
            "Users struggled to understand the overall course flow.",
            "Progress wasn't clearly communicated.",
          ],
        },
        {
          title: "Navigation",
          points: [
            "Finding recordings, assignments, and resources required unnecessary effort.",
            "Core sections felt disconnected.",
          ],
        },
        {
          title: "Information Hierarchy",
          points: [
            "Important actions competed for attention.",
            "Users had difficulty identifying priorities.",
          ],
        },
        {
          title: "Engagement",
          points: [
            "The platform lacked proactive guidance.",
            "Learners often had to search for information instead of receiving timely support.",
          ],
        },
      ],
      findingsTitle: "Research & Findings",
      findingsIntro: [
        "After reviewing the existing platform, studying the user journey, and comparing similar learning platforms, I found that most friction didn't come from the content itself — it came from how learners interacted with the platform.",
        "Users weren't looking for more features. They wanted a learning experience that felt structured, guided, and easy to navigate.",
        "The research highlighted four recurring themes that became the foundation of the redesign.",
      ],
      findings: [
        {
          title: "Learning Flow",
          quotes: [
            "Not sure where to start.",
            "The course journey feels confusing.",
            "I don't know what's coming next.",
          ],
        },
        {
          title: "Navigation",
          quotes: [
            "Finding recordings takes too many clicks.",
            "I keep jumping between different sections.",
            "Assignments and resources feel disconnected.",
          ],
        },
        {
          title: "Info. Hierarchy",
          quotes: ["Everything feels the same.", "Not sure what to do.", "Easy to miss updates."],
        },
        {
          title: "AI",
          quotes: [
            "Need instant answers.",
            "Resources are hard to find.",
            "Need tailored recommendations.",
          ],
        },
      ],
      insightsTitle: "Insights",
      insightsIntro: [
        "The research uncovered recurring patterns in user behavior that revealed where learners experienced the most friction. These insights guided the redesign and shaped every feature that followed.",
      ],
      insights: [
        {
          title: "Reduce cognitive load",
          description:
            "Learning should feel effortless. Surface only what's relevant instead of making learners process everything at once.",
        },
        {
          title: "Guide, don't overwhelm",
          description:
            "Instead of presenting every resource upfront, provide contextual guidance and clear next steps based on where the learner is in their journey.",
        },
        {
          title: "Context beats search",
          description:
            "Learners shouldn't have to remember where information lives. Answers should appear within the context of the task they're already doing.",
        },
        {
          title: "AI should augment, not replace",
          description:
            "AI is most valuable when it supports mentors and learners with summaries, recommendations, and guidance — not when it attempts to replace human teaching.",
        },
      ],
      solutionsTitle: "Solutions",
      solutionsIntro: ["The redesign focused on solving the most critical pain points uncovered during research."],
      solutions: [
        {
          label: "AI Learning Companion",
          leftText:
            "Learners spent too much time searching for answers across recordings, discussions, and resources.",
          rightTitle: "Why this solution",
          rightText:
            "Redesigned the hero around a stronger value proposition with supporting visuals and clear CTAs.",
          images: [{ src: "/images/case-studies/airtribe/cs-image-12.png", alt: "AI learning companion" }],
          impactTitle: "Impact",
          impactText: "Faster access to information, reduced friction, and a more guided learning experience.",
        },
        {
          label: "Redesigned Dashboard",
          leftText: "Users couldn't quickly understand their progress or what required attention.",
          rightText: "Highlights priorities, upcoming sessions, and progress in a single, easy-to-scan view.",
          images: [
            { src: "/images/case-studies/airtribe/cs-screenshot-before.png", alt: "Before" },
            { src: "/images/case-studies/airtribe/cs-image-5-after.png", alt: "After" },
          ],
          impactTitle: "Why it works",
          impactText: "Learners can see exactly what needs attention at a glance, without digging through multiple screens.",
        },
        {
          label: "Simplified Navigation",
          leftText: "Finding recordings, assignments, and resources required unnecessary effort.",
          rightText: "Users can reach core sections faster with a more predictable navigation experience.",
          images: [
            { src: "/images/case-studies/airtribe/cs-ai-curated-section.png", alt: "AI curated section" },
            { src: "/images/case-studies/airtribe/cs-quick-notes.png", alt: "Quick notes" },
            { src: "/images/case-studies/airtribe/cs-container.png", alt: "Workspace container" },
            { src: "/images/case-studies/airtribe/cs-projects-mock.png", alt: "Projects" },
          ],
        },
        {
          label: "Improved Information Hierarchy",
          leftText: "Important information competed equally for attention.",
          rightTitle: "Why it works",
          rightText: "Reorganized content using stronger hierarchy, spacing, and visual emphasis.",
          images: [
            { src: "/images/case-studies/airtribe/cs-image-6.png" },
            { src: "/images/case-studies/airtribe/cs-image-12.png" },
            { src: "/images/case-studies/airtribe/cs-image-7.png" },
          ],
          impactTitle: "Impact",
          impactText: "Users can identify priorities at a glance and make decisions more confidently.",
        },
      ],
      outcomesTitle: "Outcomes",
      outcomesIntro: [
        "The redesign focused on creating a clearer and more guided learning experience by simplifying navigation, improving information hierarchy, and introducing contextual AI support.",
      ],
      closingNote: ["You've officially graduated from this case study.", "Time to enroll in the next one."],
      outcomes: [
        { label: "Clear Learning Journey", metric: "↓ Cognitive Load (Qualitative)" },
        { label: "Faster Navigation", metric: "3 → 1 Clicks" },
        { label: "Contextual AI Support", metric: "24/7 Assistance" },
        { label: "Better Information Hierarchy", metric: "↑ Task Visibility" },
      ],
      learnedTitle: "What I Learned",
      learned: [
        "This project helped me think beyond just designing screens. I learned how small UX decisions can shape the entire learning experience and how AI should solve real user problems instead of being added just because it's trending.",
      ],
    },
  },
  {
    slug: "khaata",
    title: "Khaata",
    meta: "FinTech, 2026",
    tag: "FinTech",
    description: "Your finance, tracked.",
    gradient: "from-[#1f6f4f] to-[#123a5e]",
    image: "/images/case-studies/khaata/khaata-app.png",
    comingSoon: true,
  },
];
