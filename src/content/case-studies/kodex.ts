import { kodexWires } from "../wireframes";
import type { CaseStudy } from "../types";

// Copy from portfolio v2 (src/data/projects.ts), the source of truth for this project's words.
const dir = "/case-studies/kodex";

export const kodex: CaseStudy = {
  slug: "kodex",
  title: "Kodex",
  tagline: "The product was ready for enterprise. ==The website wasn't==.",
  theme: { deep: "#3550c8", mid: "#87abff", light: "#bcd38a", highlight: "#d3e6a2" },
  hero: { frame: "screen", picture: { src: `${dir}/kodex-screenshot.png`, alt: "The redesigned Kodex website" } },
  kind: "Web",
  year: "2026",
  summary:
    "Kodex is a B2B compliance platform that helps organisations build regulatory workflows into the systems they already use. At Basenine, I redesigned its marketing site so it feels as trustworthy and as easy to evaluate as the product actually is.",
  meta: [
    { label: "Role", value: "Web Design" },
    { label: "Studio", value: "Basenine, 2026" },
  ],
  takeaways: [
    "A mature product can still look unready. Kodex's maturity had to come through the site alone: its hierarchy, its proof and its paths.",
    "Products, industries and integrations were three ways in. They became one navigation built around what a visitor came for.",
    "Every journey needs an end. Here there are two: a demo for the buyer, the documentation for the evaluator.",
  ],
  quick: {
    problem:
      "A mature B2B compliance platform had a website that buried its value in technical text and an unstructured menu.",
    approach:
      "I redesigned it around one buyer's path: a hero that says what Kodex does, a menu built around what people came for, product pages in modules, and proof before the call to action.",
    result:
      "One way into the products instead of three, and a site that finally looks as ready as the product.",
  },
  status: {
    title: "Kodex at Basenine",
    live: false,
    facts: [
      { label: "Client", value: "Kodex, a B2B compliance platform" },
      { label: "Scope", value: "Marketing website redesign" },
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
  cover: { src: `${dir}/kodex-screenshot.png`, alt: "The redesigned Kodex website" },
  closing: [
    "Phew... that was a lot of compliance.",
    "Thanks for sticking around. Let's move on to something a little less regulated.",
  ],
  blocks: [
    {
      type: "section",
      id: "challenge",
      entry: "rise",
      eyebrow: "The problem",
      title: "Where the old site ==lost people==",
      body: [
        "Kodex was a mature product with a site that didn't show it. Technical information was hard to digest, the navigation had no structure, and nothing on the page reflected how far the platform had come.",
        "I went through the old site page by page, reading it the way a buyer would, and marked every place the thread broke. There were five, and each one became a goal for the redesign.",
      ],
    },
    {
      type: "cards",
      quick: true,
      items: [
        { title: "The message wasn't clear", text: "Goal: a visitor should understand what Kodex does within the first few seconds." },
        { title: "Content had no hierarchy", text: "Goal: the most important information should be the easiest to see." },
        { title: "The navigation was hard to explore", text: "Goal: finding products, industries and integrations should feel obvious." },
        { title: "Trust didn't come through", text: "Goal: one consistent visual language that reflects the platform's maturity." },
        { title: "The next step was unclear", text: "Goal: every path should end on booking a demo or reading the documentation." },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/cabinet.html",
      title: "Records, kept in order",
      note: "Run the pointer down the cabinet. The drawer at your height slides out and its neighbours follow a little, the way the redesign opens one topic at a time.",
    },
    {
      type: "section",
      id: "business",
      title: "What Kodex ==needed from it==",
      body: [
        "A redesign is easy to judge on taste alone. I wanted every change tied to something the business needed, and to a signal Kodex could watch after launch.",
      ],
    },
    {
      type: "alignment",
      items: [
        { goal: "Win enterprise buyers evaluating vendors", design: "A hero that says what Kodex does within seconds, with clear primary actions.", signal: "Fewer visitors leaving from the first screen." },
        { goal: "More demo bookings", design: "Every path ends on booking a demo, placed after the proof.", signal: "Demo requests from the site." },
        { goal: "Look as mature as the product", design: "One visual language, with customer logos and compliance badges on every page.", signal: "Demo requests from product pages as well as the home page." },
      ],
    },
    {
      type: "statement",
      text: "Nobody books a compliance demo from ==a site they can't follow==.",
    },
    {
      type: "section",
      id: "constraints",
      title: "Two limits on ==the redesign==",
      body: [
        "I could only touch the marketing site, and it had to satisfy two very different readers.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Scope",
          constraint: "The marketing site only, not the product.",
          chose: "The product's maturity had to come through the site alone: its hierarchy, its proof and its paths.",
          cost: "None of the product's own screens could change to help the story.",
        },
        {
          kind: "Audience",
          constraint: "Two readers at once: the enterprise buyer and the technical evaluator.",
          chose: "Two ends to every path: a demo for the buyer, and the documentation for the evaluator.",
          cost: "Every page carries two next steps instead of one.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Design process",
      title: "From five frictions to ==one path==",
      body: [
        "The order mattered here. I audited before I drew anything, and every design decision had to answer to one of the five goals.",
      ],
    },
    {
      type: "process",
      steps: [
        {
          phase: "Audit",
          kind: "notes",
          title: "Review the site page by page",
          text: "I read the old site as a buyer would and marked each place the thread broke.",
          made: "five frictions",
        },
        {
          phase: "Define",
          kind: "cards",
          title: "Turn each friction into a goal",
          text: "Each friction became a goal the redesign could be checked against.",
          made: "five goals, one per friction",
        },
        {
          phase: "Wireframe",
          kind: "screen",
          title: "Map one buyer's path",
          text: "One page for each question a buyer asks, in the order they ask it.",
          made: "four wireframes",
        },
        {
          phase: "Design",
          kind: "box",
          title: "Redesign in that order, and review it",
          text: "Hero, navigation, product modules, then trust cues, weighed against stakeholder feedback and what could actually be built.",
          made: "the redesigned site",
        },
      ],
    },
    {
      type: "section",
      id: "wireframes",
      title: "Four pages, one buyer's path",
      body: [
        "Four pages carry the redesign. Each one opens with the single thing an enterprise buyer needs at that point: what it is, where to go, how it works and why to trust it.",
      ],
    },
    { type: "wireframes", screens: kodexWires, over: { src: `${dir}/kodex-screenshot.png`, alt: "The redesigned Kodex site" } },
    {
      type: "section",
      id: "hero-experience",
      entry: "focus",
      eyebrow: "The redesign",
      title: "A hero that explains the platform",
      body: [
        "The old hero never said what Kodex does. I rewrote the message, added supporting visuals and gave it clear primary actions, so a visitor knows what this is and where to go next within seconds.",
      ],
    },
    { type: "media", picture: { src: `${dir}/kx-hero-image.png`, alt: "Kodex hero redesign" } },
    {
      type: "section",
      id: "navigation",
      title: "A menu built around ==why people came==",
      body: [
        "Products, industries and integrations sat in an unstructured menu, so exploring the platform felt like work. I reorganised them into one menu built around what a visitor came to do. People arrive with a question, and they shouldn't need a sitemap to answer it.",
      ],
    },
    {
      type: "gallery",
      fit: "contain",
      pictures: [
        { src: `${dir}/kx-nav-frame2.png`, alt: "Navigation menu, products" },
        { src: `${dir}/kx-nav-frame1.png`, alt: "Navigation menu, industries" },
        { src: `${dir}/kx-nav-image9.png`, alt: "The navigation bar" },
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/signpost.html",
      title: "Three ways, one post",
      note: "Point at an arm and it turns to show the way. The menus were rebuilt the same way, around products, industries and integrations.",
    },
    {
      type: "section",
      id: "storytelling",
      title: "Long workflows, ==one piece at a time==",
      body: [
        "Compliance workflows are complicated, and long text-heavy sections made them harder to follow. I rebuilt the product pages as modules with a clear hierarchy, so a long workflow can be read one piece at a time.",
      ],
    },
    {
      type: "gallery",
      fit: "contain",
      pictures: [
        { src: `${dir}/kx-story-image10.png`, alt: "A product page section" },
        { src: `${dir}/kx-story-image11.png`, alt: "A modular product layout" },
      ],
      tabs: ["Product section", "Modular layout"],
    },
    {
      type: "illustration",
      src: "/illustrations/modules.html",
      title: "A page, rebuilt in modules",
      note: "Point at the plate and the modules near the pointer rise towards it, so one piece can be read at a time.",
    },
    {
      type: "section",
      id: "trust",
      title: "Proof before ==the ask==",
      body: [
        "A buyer decides to trust a vendor before deciding to talk to it. So customer logos and compliance badges, along with stronger type and steady spacing, appear on every page before the call to action.",
      ],
    },
    {
      type: "gallery",
      fit: "row",
      pictures: [
        { src: `${dir}/kx-trust-chart.png`, alt: "A compliance chart" },
        { src: `${dir}/kx-trust-frame1.png`, alt: "A trust badge row" },
        { src: `${dir}/kx-trust-frame3.png`, alt: "A trust badge row" },
        { src: `${dir}/kx-trust-frame2.png`, alt: "A trust badge" },
      ],
    },
    {
      type: "section",
      id: "shift",
      title: "The site, ==before and after==",
      body: [],
    },
    {
      type: "compare",
      before: {
        label: "The old site",
        steps: [
          { text: "A hero that didn't say what Kodex does" },
          { text: "Products, industries and integrations in an unstructured menu", time: "3 paths" },
          { text: "Compliance workflows in long, text-heavy sections" },
          { text: "Little that showed it was built for enterprise" },
          { text: "No clear next step" },
        ],
        total: "A mature product, undersold",
      },
      after: {
        label: "The redesign",
        steps: [
          { text: "A hero that says what it does, with clear actions" },
          { text: "One navigation, organised by what a visitor came to do", time: "1 path" },
          { text: "Product pages in modules, read one piece at a time" },
          { text: "Customer logos and one visual language on every page" },
          { text: "Every path ends on a demo or the documentation" },
        ],
        total: "A site that matches the product",
      },
    },
    {
      type: "section",
      id: "system",
      title: "Where every page ==leads==",
      body: [
        "The navigation decides which pages a buyer reaches, and every page hands them to the same next step.",
      ],
    },
    {
      type: "system",
      title: "How the redesigned site fits together",
      note: "Point at a part, or tab to it, and what a change to it reaches lights up.",
      parts: [
        { id: "type", label: "Type and spacing", note: "One scale and one spacing system on every page.", moves: ["hero", "modules", "trust"] },
        { id: "nav", label: "Navigation", note: "Grouped by what a visitor came to do.", moves: ["products", "industries", "integrations"] },
        { id: "hero", label: "Hero", note: "What Kodex does, in a line, with the primary actions.", moves: ["demo"] },
        { id: "products", label: "Products", note: "The platform's products, reached from one menu.", moves: ["modules"] },
        { id: "industries", label: "Industries", note: "The sectors Kodex serves, in the same menu.", moves: ["modules"] },
        { id: "integrations", label: "Integrations", note: "The systems it plugs into, for the technical evaluator.", moves: ["docs"] },
        { id: "modules", label: "Modules", note: "Product content in blocks that can be read one at a time.", moves: ["demo", "docs"] },
        { id: "trust", label: "Trust cues", note: "Customer logos, compliance badges and enterprise layouts.", moves: ["demo"] },
        { id: "docs", label: "Documentation", note: "Where the technical evaluator goes next." },
        { id: "demo", label: "Book a demo", note: "Where every buyer's path ends." },
      ],
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
      note: "These numbers describe the redesign itself, not live traffic.",
      items: [
        { label: "Ways into the products", value: "3 → 1", note: "Products, industries and integrations, from one navigation." },
        { label: "Frictions, each made a goal", value: "5", note: "Found by reviewing the old site page by page." },
        { label: "Pages in the buyer's path", value: "4", note: "What it is, where to go, how it works, why to trust it." },
        { label: "Where every path ends", value: "2", note: "Booking a demo, or the documentation." },
      ],
    },
    {
      type: "section",
      id: "learned",
      title: "What I learned",
      body: [
        "Working on Kodex taught me that designing for B2B goes beyond clean interfaces. The real work is simplifying complex ideas and saying them clearly.",
        "I also learned how to balance stakeholder feedback, business goals and technical constraints, and still end up with something that feels simple to use.",
      ],
    },
  ],
};
