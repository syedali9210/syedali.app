import { chapters, type CaseStudy } from "../types";

const dir = "/case-studies/kiprun";

export const kiprun: CaseStudy = {
  slug: "kiprun",
  title: "KIPRUN",
  tagline: "A campaign page that had to ==behave like the store==.",
  theme: { deep: "#3643ba", mid: "#7d88ff", light: "#d6e78b", highlight: "#d6e78b" },
  hero: { frame: "phone", picture: { src: `${dir}/hero-phone.webp`, alt: "The KIPRUN hero on a phone" } },
  kind: "Web",
  year: "2026",
  summary:
    "KIPRUN is Decathlon's running brand. I designed and built its campaign page, live on decathlon.in: five shoe series, a range for men and women, a film, and the kit around them.",
  meta: [
    { label: "Role", value: "Web Design, Motion, Development" },
    { label: "Client", value: "Decathlon India" },
    { label: "Timeline", value: "Sep 22 – Sep 28, 2026" },
  ],
  impact: {
    line: "Live on decathlon.in four days after the first build, with about 970,000 page requests in its first month.",
    stats: [
      { label: "page requests in a month, by Vercel's CDN logs", value: "~970K" },
      { label: "from the first build to live on decathlon.in", value: "4 days" },
    ],
  },
  takeaways: [
    "A campaign page has seconds per section: one shoe, big, with the motion coming from the scroll. The floating-shoe stage was gone the day it was built.",
    "Runners buy the shoe they see. A colour choice that shows the shoe itself beat plain squares of colour.",
    "Layers that move apart keep the shoe in one piece on screen. The crossfade I built first made it jump between states.",
    "Logs show where attention really goes: the three colour films were requested more often than the page itself.",
  ],
  quick: {
    problem:
      "KIPRUN's five shoe series needed a campaign page inside decathlon.in itself: exciting enough to stop a runner, and exact enough to send them to the right shoe at the right price.",
    approach:
      "I designed and built a page that runs from the series to the range, a film on the road, a shoe taken apart layer by layer and the kit, with every price and weight read from decathlon.in.",
    result: "Live on decathlon.in since 25 September 2026, with about 970,000 page requests in a month, by Vercel's CDN logs.",
  },
  status: {
    title: "KIPRUN Live",
    live: true,
    facts: [
      { label: "Recent Updates", value: "The range gets a women's row: men and women, five cards each" },
      { label: "Lives at", value: "decathlon.in/page/kiprun-series" },
    ],
    sections: chapters,
    links: [{ label: "Live on decathlon.in", href: "https://www.decathlon.in/page/kiprun-series/" }],
  },
  cover: { src: `${dir}/hero.webp`, alt: "The KIPRUN page's hero" },
  card: { video: `${dir}/card.mp4`, poster: `${dir}/card-poster.webp` },
  closing: ["That's five series, ten cards and a lot of running shoes.", "Thanks for keeping pace. Let's slow down with something more serious: compliance."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "A campaign page ==inside the store==",
      body: ["Decathlon wanted a page that stops a runner mid-scroll. But it lives inside decathlon.in, so it also had to send people to ==the exact shoe, at the real price==."],
    },
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/site-film-poster.webp`, alt: "The page's launch film" },
      video: `${dir}/site-film.mp4`,
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "Pick a colour, ==see that shoe==",
      body: ["Five series, and a runner with a few seconds, most likely on a phone. Every colour shows its own shoe, and the button opens ==that exact product==."],
    },
    {
      type: "steps",
      quick: true,
      phones: true,
      items: [
        { picture: { src: `${dir}/kp-m-hero.webp`, alt: "The KIPRUN hero on a phone: five series in a row of pills, More runs, more life" }, title: "The hero stops the scroll.", text: "Five series in a row of pills, one tap from each." },
        { picture: { src: `${dir}/kp-m-picker.webp`, alt: "The range on a phone: the Kipcore in lime and its six colours" }, title: "Pick a colour.", text: "The swatches are the shoe itself, so the shoe changes with them." },
        { picture: { src: `${dir}/kp-m-product.webp`, alt: "The Kipcore's price and its Explore the product button, over the men's row" }, title: "One button to that shoe.", text: "Its price, then Explore the product, straight to it on decathlon.in." },
        { picture: { src: `${dir}/kp-m-kit.webp`, alt: "Made to Move on a phone: running socks with their prices and ratings" }, title: "Then the kit around it.", text: "Socks and tees, priced from decathlon.in." },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "Shoes first, ==the store last==",
      body: ["I had about a week, so each step did one job, and anything that didn't hold up was cut the same day."],
    },
    {
      type: "timeline",
      items: [
        { when: "Shoes", title: "Built it around the shoes", text: "The hero, the five series, the road film and one shoe taken apart." },
        { when: "Facts", title: "Made every number true", text: "Prices moved from pounds to decathlon.in's rupees, and every weight and rating got checked." },
        { when: "Details", title: "Fixed what sends people right", text: "The colour picker went from plain squares to the shoe itself." },
        { when: "Launch", title: "Moved in to Decathlon's address", text: "The base path kept moving until decathlon.in served it, on 25 September." },
        { when: "After", title: "Added the women's row", text: "Five more cards, each colour linking to its own product." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/hero.webp`, alt: "The KIPRUN page's hero on a laptop: the logo, runners, and Shop the range" }, title: "The shoes, first.", text: "A hero that's all runners and shoes, with the five series one tap away." },
        { picture: { src: `${dir}/kp-road.webp`, alt: "The road film: the Kipride Max on a runner's feet, in the city" }, title: "Then the road.", text: "The Kipride Max filmed where it's worn, in three colourways." },
        { picture: { src: `${dir}/essentials.webp`, alt: "Made to Move: socks and running tees with their prices and ratings from decathlon.in" }, title: "The store, last.", text: "The kit around the shoes, every price read from decathlon.in." },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "I started ==in the store==",
      body: ["Every number on the page had to match decathlon.in, so I went through the store ==before designing anything==."],
    },
    {
      type: "cards",
      items: [
        { title: "decathlon.in's product pages", text: "The source of every price, weight and rating on the page." },
        { title: "Women's fits are their own products", text: "Their own pages, their own prices. So the buy link follows the colour, not the series." },
        { title: "Five series, five jobs", text: "Each does something different, so they sit side by side, one tap apart." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/kp-rows.webp`, alt: "The range's rows: five series for men and five for women, each with its price" }, title: "Men's and women's, side by side.", text: "Five series each, every card its own product at its own price." },
        { picture: { src: `${dir}/range.webp`, alt: "The range: the Kipcore in lime, its colours, what it's for and its price" }, title: "The Kipcore in lime…", text: "What it's for, its three strengths, its price." },
        { picture: { src: `${dir}/kp-black.webp`, alt: "The range: the same Kipcore in black, the whole shoe swapped" }, title: "…and in black.", text: "A different colour is a different shoe, so the whole shoe swaps." },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "A proxy, a week, ==a shoe that jumped==",
      body: [],
    },
    {
      type: "cards",
      items: [
        { tag: "Tech", title: "Living in someone else's proxy", text: "decathlon.in serves the page through its own proxy. A normal redirect looped, so a tiny script puts the trailing slash back." },
        { tag: "Time", title: "One week, start to finish", text: "Anything that didn't hold up was cut the same day, my floating-shoe stage included." },
        { tag: "Design", title: "A shoe that jumped", text: "My first take crossfaded the layers and the shoe jumped between states. Moving them apart kept it in one piece." },
        { tag: "Tech", title: "Bugs only some screens saw", text: "An audit at nine widths caught a sideways scroll at 1920, clipped pills on iPhone and a font falling back to Arial." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/kp-layer-1.webp`, alt: "The Kipstorm Elite, whole: layer 1 of 5" }, title: "Layer 1: the whole shoe.", text: "The Kipstorm Elite at ₹19,999, before the scroll moves it.", wide: false },
        { picture: { src: `${dir}/kp-layer-3.webp`, alt: "The Kipstorm Elite coming apart: layer 3 of 5" }, title: "Layer 3: moving apart.", text: "Each part slides away from the next, never crossfading.", wide: false },
        { picture: { src: `${dir}/kp-layer-5.webp`, alt: "The Kipstorm Elite fully apart: upper, foams and plate, each labelled with what it does" }, title: "Layer 5: every part, labelled.", text: "Fitting comfort, light weight, cushioning, energy return: what each layer does.", wide: true },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "On time, ==at full weight==",
      body: [],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Launch on time, one job at a time", cost: "The photos and the film shipped at full weight." },
        { chose: "A static page on one base path", cost: "Every move of the address meant re-checking every photo and link." },
        { chose: "One big shoe per section, moved by the scroll", cost: "The floating-shoe stage I'd built first." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/kp-max.webp`, alt: "The range on the Kipride Max: one shoe, big, with the series under it" }, title: "One shoe per section, big.", text: "The Kipride Max, with the series it belongs to under it." },
        { picture: { src: `${dir}/film.webp`, alt: "Kipride Max, filmed on the road" }, title: "Moved by the scroll.", text: "No floating stage: the film and the shoes move as you read." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "==~970K requests== in a month",
      body: ["Sales happen on Decathlon's side, so I can't see them. The number I want next is ==clicks from each card== to its product."],
    },
    {
      type: "stats",
      quick: true,
      items: [
        { label: "Page requests in a month", value: "~970K", note: "Vercel's CDN logs, 3 October to 2 November 2026. Requests, not unique people." },
        { label: "Days from first build to live", value: "4", note: "22 to 25 September 2026, counting both ends." },
        { label: "Screen widths audited", value: "9", note: "From a phone to a 1920 monitor, upright and sideways, before launch." },
        { label: "Prices read from decathlon.in", value: "100%", note: "Every price, weight and rating on the page." },
      ],
    },
  ],
};
