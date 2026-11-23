import { chapters, type CaseStudy } from "../types";

// Copy from portfolio v2 (src/data/projects.ts), the source of truth for this project's words.
const dir = "/case-studies/uniqkey";

export const uniqkey: CaseStudy = {
  slug: "uniqkey",
  title: "Uniqkey",
  tagline: "Making breach risk feel ==real enough to act on==.",
  theme: { deep: "#0c3a3f", mid: "#56c79a", light: "#9ce9c3", highlight: "#a8eccb" },
  hero: { frame: "screen", picture: { src: `${dir}/uniqkey-screenshot.webp`, alt: "The Uniqkey Data Breach Monitoring page" } },
  kind: "Web",
  year: "2026",
  summary:
    "Uniqkey is a European password and access management platform. At Basenine, I designed the landing page for its Data Breach Monitoring, so the risk feels real enough for a business to act on.",
  meta: [
    { label: "Role", value: "Web Design" },
    { label: "Studio", value: "Basenine, 2026" },
  ],
  impact: {
    line: "A security page a non-specialist reads to the end: why it matters, what it costs, what it does, then one path to a demo.",
    stats: [
      { label: "questions answered, in the order buyers ask", value: "4" },
      { label: "problems from the audit, designed out", value: "5 / 5" },
    ],
  },
  takeaways: [
    "People who decide don't need every technical detail upfront. They need a clear reason the product matters.",
    "Say why a breach matters before how the feature works. The page answers in order: why care, what it costs, what it does, who trusts it.",
    "Plain words up top. The technical detail stays in the feature cards, short and specific.",
  ],
  quick: {
    problem: "Data breach monitoring is technical, and the page explaining it overwhelmed the people who decide whether to buy it.",
    approach:
      "One focused landing page, ordered by the buyer's questions: why a breach matters, what it could cost, what the feature does, and who else trusts it.",
    result: "One clear path from the problem to booking a demo.",
  },
  status: {
    title: "Uniqkey at Basenine",
    live: false,
    facts: [
      { label: "Client", value: "Uniqkey, a European password and access management platform" },
      { label: "Scope", value: "Data Breach Monitoring landing page" },
    ],
    sections: chapters,
    links: [],
  },
  cover: { src: `${dir}/uniqkey-screenshot.webp`, alt: "The Uniqkey Data Breach Monitoring page" },
  closing: ["Phew... that was a lot of breach talk.", "Thanks for sticking around. Let's move on to something a little less alarming."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "A risk people ==tune out==",
      body: ["Everyone agrees a breach would be bad, and most businesses still put it off. The old page read like a spec sheet, to people who ==aren't specialists==."],
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "Make the risk ==real enough to act on==",
      body: ["In one scroll, a buyer should get why it matters, what it could cost, and ==what to do next==."],
    },
    {
      type: "steps",
      quick: true,
      items: [
        {
          picture: { src: `${dir}/uniqkey-screenshot.webp`, alt: "The new Uniqkey page's first screen: Data Breach Monitoring, with the breach dashboard under it" },
          title: "Why it matters, first.",
          text: "Data breach monitoring, and the dashboard that shows it, before any of how it works.",
        },
        {
          picture: { src: `${dir}/uk-feature-frame1.webp`, alt: "The table of affected employees: each login, what leaked, and its status" },
          title: "Who's affected.",
          text: "Every exposed login, what leaked and whether it's fixed.",
        },
        {
          picture: { src: `${dir}/uk-breach-details.webp`, alt: "Employee breach details: total breaches, resolved, unresolved and actions, then the affected logins" },
          title: "What to do about it.",
          text: "One person's breaches, what's resolved, and the next action.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "The real work was ==the order==",
      body: ["A buyer asks four questions. The page answers them one at a time, in the order they come up."],
    },
    {
      type: "timeline",
      items: [
        { when: "Read it", title: "Followed a visitor down the page", text: "Marked every spot a non-specialist would stop reading: five issues." },
        { when: "Goals", title: "Turned each issue into a goal", text: "Something every section could be checked against." },
        { when: "Sketched", title: "Ordered the page as four questions", text: "Why care, what it costs, what it does, who trusts it." },
        { when: "Designed", title: "Rebuilt each section around its answer", text: "With the proof placed before the ask." },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "==Five problems== on the old page",
      body: ["Following a visitor down the old page turned up five places a non-specialist would ==stop reading==."],
    },
    {
      type: "cards",
      items: [
        { title: "Too technical", text: "It spoke to specialists, not the person who signs." },
        { title: "Value buried", text: "How it works came before why it matters." },
        { title: "No story", text: "Nothing led from the problem to the fix." },
        { title: "Benefits hidden", text: "The features sat in long blocks of copy." },
        { title: "A weak ask", text: "The calls to action were easy to miss." },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "Simple words, ==no scare tactics==",
      body: [],
    },
    {
      type: "steps",
      items: [
        {
          picture: { src: `${dir}/uk-hero-image.webp`, alt: "The hero's dashboard: breaches counted calmly, with no red warnings" },
          title: "Urgency without fear.",
          text: "The risk shows up as numbers to act on, not red warnings.",
        },
        {
          picture: { src: `${dir}/uk-risk-frame1.webp`, alt: "Document: breach totals and an audit trail" },
          title: "Detail, short and specific.",
          text: "Breach totals and an audit trail, for the buyer who needs the detail.",
        },
      ],
    },
    {
      type: "cards",
      items: [
        { tag: "Design", title: "Simple, without sounding vague", text: "A security buyer still needs the detail. It lives in the feature cards, short and specific." },
        { tag: "Design", title: "Urgency without fear", text: "Red warnings read as a scare tactic, and a security vendor can't look like one. So the risk shows up as a cost." },
        { tag: "Scope", title: "One page for everything", text: "The problem, the cost, the features, the proof and the ask, all in one scroll." },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "Plain words ==up top==",
      body: [],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Plain words up top", cost: "A specialist has to reach the cards before finding the detail they came for." },
        { chose: "Only what answers the four questions", cost: "Every other detail was left off the page." },
        { chose: "Show the risk as a cost", cost: "No alarming numbers or red warnings, the easy way to grab attention." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "==One path== to a demo",
      body: [],
    },
    {
      type: "stats",
      quick: true,
      note: "Counted from the page itself, not live traffic.",
      items: [
        { label: "Questions the page answers, in order", value: "4", note: "Why care, what it costs, what it does, who trusts it." },
        { label: "Problems from the audit, designed out", value: "5 / 5", note: "Each one turned into a goal the page was checked against." },
        { label: "Proof cards before the ask", value: "2", note: "Encryption and zero-knowledge architecture, in plain words." },
        { label: "Paths to a demo", value: "1", note: "From the problem straight to trying the feature or booking a demo." },
      ],
    },
  ],
};
