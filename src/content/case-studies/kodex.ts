import { chapters, type CaseStudy } from "../types";

// Copy from portfolio v2 (src/data/projects.ts), the source of truth for this project's words.
const dir = "/case-studies/kodex";

export const kodex: CaseStudy = {
  slug: "kodex",
  title: "Kodex",
  tagline: "The product was ready for enterprise. ==The website wasn't==.",
  theme: { deep: "#3550c8", mid: "#87abff", light: "#bcd38a", highlight: "#d3e6a2" },
  hero: { frame: "screen", picture: { src: `${dir}/kodex-screenshot.webp`, alt: "The redesigned Kodex website" } },
  kind: "Web",
  year: "2026",
  summary:
    "Kodex is a B2B compliance platform. At Basenine, I redesigned its marketing site so it looks as ready, and is as easy to evaluate, as the product already was.",
  meta: [
    { label: "Role", value: "Web Design, Motion, Front-end" },
    { label: "Studio", value: "Basenine, 2026" },
  ],
  impact: {
    line: "A compliance platform's site, redesigned so an enterprise buyer gets it in seconds and always knows the next step.",
    stats: [
      { label: "ways into the products, in one menu", value: "3 → 1" },
      { label: "frictions from the audit, designed out", value: "5 / 5" },
    ],
  },
  takeaways: [
    "A mature product can still look unready. Kodex's maturity had to come through the site alone: its hierarchy, its proof and its paths.",
    "A workflow is easier to believe when you can watch it work. So the integration flow runs on the site as a working product mockup, built in code.",
    "Products, industries and integrations were three ways in. They became one navigation built around what a visitor came for.",
    "Every journey needs an end. Here there are two: a demo for the buyer, the documentation for the evaluator.",
  ],
  quick: {
    problem: "A mature B2B compliance platform had a website that buried its value in technical text and an unstructured menu.",
    approach:
      "I redesigned it around one buyer's path: a hero that says what Kodex does, a menu built around what people came for, product pages in modules, and proof before the call to action.",
    result: "One way into the products instead of three, and a site that finally looks as ready as the product.",
  },
  status: {
    title: "Kodex at Basenine",
    live: false,
    facts: [
      { label: "Client", value: "Kodex, a B2B compliance platform" },
      { label: "Scope", value: "Marketing website redesign" },
    ],
    sections: chapters,
    links: [],
  },
  cover: { src: `${dir}/kodex-screenshot.webp`, alt: "The redesigned Kodex website" },
  closing: ["Phew... that was a lot of compliance.", "Thanks for sticking around. Let's move on to something a little less regulated."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "A ready product, ==an unready website==",
      body: ["Enterprise buyers judge a compliance vendor by its site long before they book a demo. Kodex's had ==dense copy, a messy menu and no proof==."],
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "Make it ==easy to evaluate==",
      body: ["Get what Kodex does in seconds, find your way ==without a sitemap==, and always know the next step."],
    },
    {
      type: "steps",
      quick: true,
      items: [
        {
          picture: { src: `${dir}/kodex-screenshot.webp`, alt: "The redesigned Kodex site's first screen: requests from Jira and other tools flowing into the Kodex API" },
          title: "Say what it does, first.",
          text: "The first screen shows requests flowing from the tools a company already runs into Kodex.",
        },
        {
          picture: { src: `${dir}/kx-nav-image9.webp`, alt: "The new menu: products, platform and a featured product, in one panel" },
          title: "One menu, grouped by job.",
          text: "Products, platform and a featured product, in one panel.",
        },
        {
          picture: { src: `${dir}/kx-story-image11.webp`, alt: "Where Kodex connects with the rest of your stack" },
          title: "Show where it fits.",
          text: "How Kodex connects with the rest of a company's stack.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "Audit first, ==then draw==",
      body: ["Nothing got designed until I knew exactly where the old site lost people."],
    },
    {
      type: "timeline",
      items: [
        { when: "Read it", title: "Went through every page as a buyer", text: "Marked every place the story broke: five frictions." },
        { when: "Goals", title: "Turned each friction into a goal", text: "So every design call had something to answer to." },
        { when: "Sketched", title: "Mapped one buyer's path", text: "One page per question a buyer asks, in the order they ask it." },
        { when: "Designed", title: "Built it in that order", text: "Hero, menu, product modules, then proof, checked against stakeholder feedback and what we could build." },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "==Five places== the old site lost people",
      body: ["I read the old site the way a buyer would, and marked every place ==the story broke==."],
    },
    {
      type: "cards",
      items: [
        { title: "No clear message", text: "The hero never said what Kodex does." },
        { title: "No hierarchy", text: "The important stuff was as loud as everything else." },
        { title: "A menu you had to decode", text: "Products, industries and integrations were three separate ways in." },
        { title: "Trust didn't land", text: "Nothing showed it was built for enterprise." },
        { title: "No next step", text: "Pages just ended." },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "Two readers, ==one site==",
      body: [],
    },
    {
      type: "steps",
      items: [
        {
          picture: { src: `${dir}/kx-hero-image.webp`, alt: "The integration flow: Jira, Hummingbird and a custom integration feeding the Kodex API" },
          title: "The integration, shown moving.",
          text: "Jira, Hummingbird and a custom integration feeding the Kodex API, built as a working mockup in code.",
        },
        {
          picture: { src: `${dir}/kx-story-image10.webp`, alt: "A product module: verify any requester from your own surface, with the request flow beside it" },
          title: "One module at a time.",
          text: "Words beside the flow, so a long workflow reads in steps.",
        },
      ],
    },
    {
      type: "cards",
      items: [
        { tag: "Stakeholder", title: "Two readers, one site", text: "The enterprise buyer and the technical evaluator want different things. So every path ends in two places: a demo, or the docs." },
        { tag: "Scope", title: "The product was off limits", text: "Marketing site only. Kodex's maturity had to come through the site alone." },
        { tag: "Design", title: "Explaining the integration", text: "A diagram asks you to imagine the flow. As a working mockup, you watch a request move through Kodex." },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "Two next steps, ==not one==",
      body: [],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Two next steps on every page, a demo and the docs", cost: "No single, louder call to action." },
        { chose: "The integration flow built in code, motion included", cost: "A static diagram would have been quicker to make, but it asks the buyer to imagine it." },
        { chose: "The product's maturity shown through the site alone", cost: "None of the product's own screens could change to help the story." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "One way in, ==instead of three==",
      body: ["And proof now comes ==before every ask==."],
    },
    {
      type: "stats",
      quick: true,
      note: "Counted from the redesign itself, not live traffic.",
      items: [
        { label: "Ways into the products", value: "3 → 1", note: "Products, industries and integrations, in one menu grouped by why people came." },
        { label: "Frictions found and designed out", value: "5 / 5", note: "Each one turned into a goal the redesign was checked against." },
        { label: "Pages carrying the buyer's path", value: "4", note: "What it is, where to go, how it works, why trust it." },
        { label: "Next steps on every page", value: "2", note: "A demo for the buyer, the docs for the evaluator." },
      ],
    },
  ],
};
