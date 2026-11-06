import { uniqkeyWires } from "../wireframes";
import type { CaseStudy } from "../types";

// Copy from portfolio v2 (src/data/projects.ts), the source of truth for this project's words.
const dir = "/case-studies/uniqkey";

export const uniqkey: CaseStudy = {
  slug: "uniqkey",
  title: "Uniqkey",
  tagline: "Making breach risk feel ==real enough to act on==.",
  theme: { deep: "#0c3a3f", mid: "#56c79a", light: "#9ce9c3", highlight: "#a8eccb" },
  hero: { frame: "screen", picture: { src: `${dir}/uniqkey-screenshot.png`, alt: "The Uniqkey Data Breach Monitoring page" } },
  kind: "Web",
  year: "2026",
  summary:
    "Uniqkey is a European password and access management platform. At Basenine, I designed the landing page for its Data Breach Monitoring feature, so the risk feels real enough for a business to act on, instead of more jargon to tune out.",
  meta: [
    { label: "Role", value: "Web Design" },
    { label: "Studio", value: "Basenine, 2026" },
  ],
  takeaways: [
    "People who decide don't need every technical detail upfront. They need a clear reason the product matters.",
    "Say why a breach matters before how the feature works. The page answers in order: why care, what it costs, what it does, who trusts it.",
    "Plain words up top. The technical detail stays in the feature cards, short and specific.",
  ],
  quick: {
    problem:
      "Data breach monitoring is technical, and the page explaining it overwhelmed the people who decide whether to buy it.",
    approach:
      "One focused landing page, ordered by the buyer's questions: why a breach matters, what it could cost, what the feature does, and who else trusts it.",
    result:
      "One clear path from the problem to booking a demo.",
  },
  status: {
    title: "Uniqkey at Basenine",
    live: false,
    facts: [
      { label: "Client", value: "Uniqkey, a European password and access management platform" },
      { label: "Scope", value: "Data Breach Monitoring landing page" },
    ],
    sections: [
      { label: "Problem", href: "#challenge" },
      { label: "Process", href: "#process" },
      { label: "Redesign", href: "#hero-experience" },
      { label: "Before & after", href: "#shift" },
      { label: "Results", href: "#outcomes" },
    ],
    links: [],
  },
  cover: { src: `${dir}/uniqkey-screenshot.png`, alt: "The Uniqkey Data Breach Monitoring page" },
  closing: [
    "Phew... that was a lot of breach talk.",
    "Thanks for sticking around. Let's move on to something a little less alarming.",
  ],
  blocks: [
    {
      type: "section",
      id: "challenge",
      entry: "rise",
      eyebrow: "The problem",
      title: "A topic people ==tune out==",
      body: [
        "Data breach monitoring is technical, and the old page explained it that way. The people who decide whether to buy it aren't specialists, so the page was losing them before it reached the point.",
        "I followed a visitor down the page and marked every place a non-technical buyer would stop reading. I found five issues, and each one became a goal.",
      ],
    },
    {
      type: "cards",
      quick: true,
      items: [
        { title: "The technical messaging overwhelmed", text: "Goal: make security make sense to non-technical decision makers." },
        { title: "The value wasn't obvious", text: "Goal: say why breach monitoring matters before explaining how it works." },
        { title: "The page had no narrative", text: "Goal: a logical flow that explains the problem first and the solution second." },
        { title: "The benefits were easy to miss", text: "Goal: hierarchy and proof that give the reader confidence." },
        { title: "The calls to action were weak", text: "Goal: a clearer path to trying the feature or booking a demo." },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/vault.html",
      title: "A scan across the keys",
      note: "A sweep runs across the key plate on its own. Move the pointer and you scan it yourself, each key lighting up and fading behind you, the way monitoring checks every credential.",
    },
    {
      type: "section",
      id: "business",
      title: "What Uniqkey ==needed from it==",
      body: [
        "The page sells one feature, Data Breach Monitoring, to the person who signs for it and not the person who configures it. That one fact decided the writing, the order and the design.",
      ],
    },
    {
      type: "alignment",
      items: [
        { goal: "Sell to decision makers, not specialists", design: "Why it matters comes first, in plain words, before how it works.", signal: "Visitors who read on past the hero." },
        { goal: "Urgency without fear", design: "The cost of a breach, shown as structured content and visuals.", signal: "Visitors who reach the features after the risk section." },
        { goal: "Trust for a security vendor", design: "Testimonials and certifications before the call to action.", signal: "Demo requests after the proof." },
      ],
    },
    {
      type: "statement",
      text: "A buyer doesn't need every technical detail upfront. They need ==a clear reason to care==.",
    },
    {
      type: "section",
      id: "constraints",
      title: "One page, ==and no room to waste==",
      body: [
        "Everything had to fit in a single scroll, without losing the technical credibility a security product depends on.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Scope",
          constraint: "One landing page, for one feature.",
          chose: "The problem, the cost, the features, the proof and the action all had to land in one scroll.",
          cost: "Any detail that didn't answer one of the four questions was left out.",
        },
        {
          kind: "Credibility",
          constraint: "Simplify a technical topic without losing technical credibility.",
          chose: "Plain words up top, with the technical detail kept in the feature cards, short and specific.",
          cost: "A specialist has to reach the cards before finding the detail they came for.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Design process",
      title: "Ordered by ==the buyer's questions==",
      body: [
        "The real work was in the order. A buyer asks four questions, so the page answers them one at a time.",
      ],
    },
    {
      type: "process",
      steps: [
        {
          phase: "Audit",
          kind: "notes",
          title: "Follow a visitor down the page",
          text: "I followed a visitor down the old page and marked where a non-technical buyer would stop reading.",
          made: "five issues",
        },
        {
          phase: "Define",
          kind: "cards",
          title: "Turn each issue into a goal",
          text: "Each issue became a goal the page could be checked against.",
          made: "five goals",
        },
        {
          phase: "Wireframe",
          kind: "screen",
          title: "Order the page as four questions",
          text: "One section per question, in the order a buyer asks.",
          made: "four wireframes",
        },
        {
          phase: "Design",
          kind: "box",
          title: "Rebuild each section around its answer",
          text: "I rebuilt each section around its answer, with the proof placed before the ask.",
          made: "the landing page",
        },
      ],
    },
    {
      type: "section",
      id: "wireframes",
      title: "One page, four questions",
      body: [
        "The page runs in four steps, each answering the next question a security buyer asks. Why should I care? What could it cost? What does it do? Who else trusts it?",
      ],
    },
    { type: "wireframes", screens: uniqkeyWires, over: { src: `${dir}/uniqkey-screenshot.png`, alt: "The Uniqkey landing page" } },
    {
      type: "section",
      id: "hero-experience",
      entry: "focus",
      eyebrow: "The redesign",
      title: "Why should I care?",
      body: [
        "The hero leads with why a breach matters, before it says anything about how monitoring works. The person who signs needs a reason before a mechanism.",
      ],
    },
    { type: "media", picture: { src: `${dir}/uk-hero-image.png`, alt: "Uniqkey hero redesign" } },
    {
      type: "section",
      id: "risk",
      title: "What could it cost?",
      body: [
        "This section shows what a breach could cost the business, through structured content and visuals. Putting a cost on it makes the risk real without turning it into a scare.",
      ],
    },
    {
      type: "gallery",
      fit: "contain",
      pictures: [
        { src: `${dir}/uk-risk-frame2.png`, alt: "Detect: continuous monitoring against known breach databases" },
        { src: `${dir}/uk-risk-frame3.png`, alt: "Respond: an alert on a phone that credentials have been compromised" },
        { src: `${dir}/uk-risk-frame1.png`, alt: "Document: breach totals and an audit trail" },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/dominoes.html",
      title: "One push, then the rest",
      note: "Point at a domino and it falls, along with every one after it, the way one exposed credential can lead to the next.",
    },
    {
      type: "section",
      id: "features",
      title: "What does it do?",
      body: [
        "The features used to be buried in long blocks of copy. I rebuilt them as modular cards with icons and short lines, so they can be scanned and compared.",
      ],
    },
    {
      type: "gallery",
      fit: "contain",
      pictures: [
        { src: `${dir}/uk-feature-frame4.png`, alt: "The app's sidebar" },
        { src: `${dir}/uk-feature-frame1.png`, alt: "The table of affected employees" },
        { src: `${dir}/uk-feature-frame3.png`, alt: "An employee's breach details" },
        { src: `${dir}/uk-feature-frame2.png`, alt: "A dialog confirming a domain's removal from monitoring" },
      ],
    },
    {
      type: "section",
      id: "trust",
      title: "Who else ==trusts== it?",
      body: [
        "Testimonials and certifications come before the call to action, so the proof lands before the ask.",
      ],
    },
    {
      type: "gallery",
      fit: "row",
      pictures: [
        { src: `${dir}/uk-trust-image1.png`, alt: "A card on military-grade encryption" },
        { src: `${dir}/uk-trust-image2.png`, alt: "A card on zero-knowledge architecture" },
      ],
    },
    {
      type: "section",
      id: "shift",
      title: "The page, ==before and after==",
      body: [],
    },
    {
      type: "compare",
      before: {
        label: "The old page",
        steps: [
          { text: "Opened on technical detail" },
          { text: "Said how it works before why it matters" },
          { text: "No thread from the problem to the solution" },
          { text: "Features buried in long blocks of copy" },
          { text: "Weak calls to action" },
        ],
        total: "More jargon to tune out",
      },
      after: {
        label: "The redesign",
        steps: [
          { text: "Opens on why a breach matters" },
          { text: "Shows what a breach could cost before what it does" },
          { text: "Four questions, in the order a buyer asks them" },
          { text: "Features as cards to scan and compare" },
          { text: "One path: try the feature or book a demo" },
        ],
        total: "One path, to a demo",
      },
    },
    {
      type: "illustration",
      src: "/illustrations/keybox.html",
      title: "The hook that's empty",
      note: "Point at a key and it swings out on its hook. One hook has no key on it, because monitoring is about noticing what's missing.",
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Results",
      title: "What changed",
      body: [],
    },
    {
      type: "stats",
      quick: true,
      note: "These numbers describe the page itself, not live traffic.",
      items: [
        { label: "Paths through the page", value: "1", note: "From the problem to booking a demo." },
        { label: "Issues, each made a goal", value: "5", note: "Found by following a visitor down the old page." },
        { label: "Questions it answers, in order", value: "4", note: "Why care, what it costs, what it does, who trusts it." },
        { label: "Ways to act at the end", value: "2", note: "Try the feature, or book a demo." },
      ],
    },
    {
      type: "section",
      id: "learned",
      title: "What I learned",
      body: [
        "Designing for cybersecurity taught me that people don't need every technical detail upfront. They need to understand, quickly, why the product matters to them.",
        "This project made me better at simplifying a complex topic while keeping it accurate, and at writing pages that explain first and ask second.",
      ],
    },
  ],
};
