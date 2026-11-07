import { aslWires } from "../wireframes";
import type { CaseStudy } from "../types";

const dir = "/case-studies/anime-sports-league";

export const animeSportsLeague: CaseStudy = {
  slug: "anime-sports-league",
  title: "Anime Sports League",
  tagline: "The brief said step inside the poster. ==The poster was flat==.",
  theme: { deep: "#042c85", mid: "#fc4b6c", light: "#f0a60f", highlight: "#ffd36b" },
  hero: { frame: "phone", picture: { src: `${dir}/hero-phone.webp`, alt: "The poster on a phone" } },
  kind: "Web",
  year: "2026",
  summary:
    "Decathlon India turned five sports into five anime leagues, each with its own tee. I designed and built the campaign site that lets you step inside Jolly Yun Shann's poster, meet the leagues and find your tee.",
  meta: [
    { label: "Role", value: "Web Design, Motion, Development" },
    { label: "Client", value: "Decathlon India" },
    { label: "Timeline", value: "Aug 24 – Sep 2, 2026" },
  ],
  takeaways: [
    "Traced art breaks when half of something moves, and a broken detail reads worse than a still one. So the football stays still.",
    "A campaign site has to feel like a world and still sell the tee. So every league ends on its own garment page.",
    "A page's motion should come from the scroll and the deck, so the flames hold still.",
  ],
  quick: {
    problem:
      "Decathlon's campaign turns five sports into five anime leagues, and it needed a site people would want to stay in. But the art arrived as one flat traced poster, and a poster with a scroll bar sells nothing.",
    approach:
      "I cut the poster into layers that part as you scroll, built a deck of league cards that deals itself, and ended every league on its own tee.",
    result:
      "A campaign site where the poster opens up around you and every league leads to its tee, built for Decathlon India.",
  },
  status: {
    title: "Built for Decathlon India",
    live: false,
    facts: [
      { label: "Artwork", value: "Jolly Yun Shann, illustrator and NFT artist" },
      { label: "Built with", value: "Vite, React 19, GSAP ScrollTrigger, Lenis, plain CSS" },
    ],
    sections: [
      { label: "Problem", href: "#opening" },
      { label: "Process", href: "#process" },
      { label: "The site", href: "#deck" },
      { label: "Decisions", href: "#decisions" },
      { label: "Results", href: "#results" },
    ],
    links: [],
  },
  cover: { src: `${dir}/hero.webp`, alt: "The Anime Sports League poster" },
  closing: [
    "That's all six.",
    "Thank you for reading this far. The next card takes you back to where it started.",
  ],
  blocks: [
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/hero.webp`, alt: "The framed Anime Sports League poster" },
    },
    {
      type: "section",
      id: "opening",
      entry: "rise",
      eyebrow: "The problem",
      title: "A poster with ==a scroll bar==",
      body: [
        "Decathlon India's campaign turns five sports into five anime leagues, each with its own tee. The brief wanted a world you scroll into, where the scene parts, the leagues deal themselves out like cards, and every tee leads to its product. A sports campaign only gets a few seconds of anyone's attention, so the site had to earn those seconds and still end on something to buy.",
        "The art is by Jolly Yun Shann, and it arrived as one flat traced picture, with no layers and no names. Left like that, the site would only be a poster with a scroll bar. So before anything else, I had to work out how to make a flat picture move without redrawing it.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/theatre.html",
      title: "A picture, cut into layers",
      note: "Move along it. The layers part as you go and the nearest one lights up, the way the poster was cut into layers that move on their own.",
    },
    {
      type: "section",
      id: "business",
      title: "What Decathlon ==needed from it==",
      body: [
        "Under all the motion, the site still had three plain commercial jobs.",
      ],
    },
    {
      type: "alignment",
      items: [
        { goal: "Turn the campaign into tee and cap sales", design: "Every poster leads to its own tee, EXPLORE opens the garment's own page, and the caps got pages of their own.", signal: "Visits to the tee and cap pages from the campaign." },
        { goal: "Know the visits came from the campaign", design: "Every product link, across the tees, the catalogue and the line-up, carries the campaign's UTM tags.", signal: "Campaign-tagged visits in Decathlon's analytics." },
        { goal: "Credit the collaboration", design: "Decathlon x Jolly Yun Shann sits on the footer boards, and the art moves without being redrawn.", signal: "The credit appears on every footer." },
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/ground.webp`, alt: "From the first step to the final whistle, the ground is yours" },
      caption: "The ground: from the first step to the final whistle, the ground is yours.",
    },
    {
      type: "section",
      id: "constraints",
      title: "Someone else's art, ==on a mid-range phone==",
      body: [
        "I couldn't redraw the art, and all of it had to run on the phones people actually own.",
      ],
    },
    {
      type: "tradeoffs",
      items: [
        {
          kind: "Content",
          constraint: "The art is Jolly Yun Shann's, and it arrived flat.",
          chose: "I cut it by paint order into layers, and worked out which shapes were which before moving any.",
          cost: "Whatever can't move cleanly stays still.",
        },
        {
          kind: "Performance",
          constraint: "Moving traced art on a mid-range phone.",
          chose: "Layers sit on the GPU only while they move, and only the art that moves goes into the page.",
          cost: "The hero is still the heaviest part of the page.",
        },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Design process",
      title: "The poster ==came first==",
      body: [
        "The first question was whether the poster could move at all, so that came before any section.",
      ],
    },
    {
      type: "process",
      steps: [
        {
          phase: "Prototype",
          kind: "phone",
          title: "Make the poster move",
          text: "Before any section, the poster had to come apart and move.",
          made: "the hero, the deck and the cursor",
        },
        {
          phase: "Build",
          kind: "screen",
          title: "Build the world around it",
          text: "The ground, the footer boards, a page-long gradient and the line-up.",
          made: "every section of the page",
        },
        {
          phase: "Refine",
          kind: "notes",
          title: "Take out what didn't hold",
          text: "The burst, the hotspots and the spinning shuttlecock came out, so the deal had room to be smooth.",
          made: "a calmer, lighter page",
        },
        {
          phase: "Connect",
          kind: "cards",
          title: "Send people to the right product",
          text: "Every tee, cap and poster links to its own garment page, tagged with the campaign's UTM parameters.",
          made: "product links, prices and web analytics",
        },
        {
          phase: "Ship",
          kind: "box",
          title: "Hand it over",
          text: "Page views and Web Vitals were wired in, then the site went to Decathlon's test address.",
          made: "served from Decathlon's test address",
        },
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/episodes.webp`, alt: "Welcome to the anime world: the five league cards, dealt" },
    },
    {
      type: "section",
      id: "deck",
      entry: "focus",
      eyebrow: "The site",
      title: "The ==episode deck==",
      body: [
        "Five leagues are a lot to introduce at once, so they arrive as a deck. The cards start as a pile and deal themselves into a row, each turning over to reveal its league as it lands.",
        "The section holds still while the deck deals. With reduced motion, it's simply dealt, face up.",
      ],
    },
    {
      type: "illustration",
      src: "/illustrations/deck.html",
      title: "Five cards, one in hand",
      note: "Point at a card and it rises out of the fan while the others lean away, the way the site deals its five leagues.",
    },
    {
      type: "section",
      id: "timing",
      title: "Timing, ==measured==",
      body: [
        "I didn't guess the scroll-out. I timed it off yesnowww.com, the site the frame was modelled on. It starts on the first pixel of scroll, runs linear, and plays as three overlapping beats.",
      ],
    },
    {
      type: "media",
      picture: { src: `${dir}/lineup.webp`, alt: "The line-up, stepped by scroll" },
      caption: "The line-up: the leagues and their caps, stepped by the scroll.",
    },
    {
      type: "section",
      id: "wireframes",
      title: "The poster, on a phone",
      body: [
        "On a phone the poster keeps its frame, the deck becomes a row you swipe, and the line-up stacks the league names large enough to read.",
      ],
    },
    { type: "wireframes", screens: aslWires, over: { src: `${dir}/hero-phone.webp`, alt: "The poster on a phone" } },
    {
      type: "section",
      id: "decisions",
      title: "Three decisions about ==what moves==",
      body: [
        "Traced art is unforgiving. The hardest decisions on this project were about what to leave still.",
      ],
    },
    {
      type: "decisions",
      items: [
        {
          title: "What goes into the code",
          chose: "Only the art that moves, the hero's layers, goes in as live paths. The episode cards load as pictures.",
          why: "Animating a path means it has to be in the page. Art that never moves doesn't.",
          considered: [
            { option: "Inlining all the art", why: "Simpler, but every visitor would pay for art that never moves." },
          ],
        },
        {
          title: "What moves",
          chose: "Only what moves cleanly. The football stays still.",
          why: "Traced art breaks when half of something moves, and a broken detail reads worse than a still one.",
          considered: [
            { option: "Moving the football with the kick", why: "Its panels are merged with the leg in the trace, so half a ball would move." },
          ],
        },
        {
          title: "The flames",
          chose: "Flames that hold still, so the scroll does the moving.",
          why: "The motion should come from the scroll and the deck, not from a flicker the phone pays for on every frame.",
          considered: [
            { option: "Flickering flames on every prop", why: "They looked lively, but they kept the phone busy on every single frame." },
          ],
        },
      ],
    },
    {
      type: "section",
      id: "system",
      title: "The art is ==the architecture==",
      body: [
        "The artwork decides everything downstream. Its split decides the layers, and the layers decide how the page loads and how it scrolls.",
      ],
    },
    {
      type: "system",
      title: "How the site's parts depend on each other",
      note: "Point at a part, or tab to it, and what a change to it reaches lights up.",
      parts: [
        { id: "art", label: "Traced artwork", note: "The poster as one flat traced frame, and the card art beside it.", moves: ["assets"] },
        { id: "products", label: "Prices and links", note: "Tees at 799, caps at 699; every link tagged with the campaign's UTM parameters.", moves: ["tees", "lineup"] },
        { id: "assets", label: "Asset build", note: "Splits the art by paint order and cleans it up before it reaches the page.", moves: ["layers", "chrome"] },
        { id: "layers", label: "Layers", note: "Stacked SVG layers on one viewBox, each with its own depth, inlined because they move.", moves: ["scroll", "bundle"] },
        { id: "chrome", label: "Card chrome", note: "One shared frame for all the cards, with the photos kept out of it.", moves: ["deck"] },
        { id: "scroll", label: "Scroll-out", note: "A linear relay of three overlapping beats, timed off yesnowww.com.", moves: ["runway", "ball"] },
        { id: "bundle", label: "Page weight", note: "Nearly all of it is the hero's paths." },
        { id: "deck", label: "Episode deck", note: "Five cards that deal from a real pile and turn over as they land." },
        { id: "runway", label: "Pinned window", note: "The pinned stretch of scroll that the scroll-out is measured over." },
        { id: "ball", label: "Flaming ball", note: "The cricket ball that crosses the frame before the next section." },
        { id: "tees", label: "Tees", note: "One per league, each linking to its garment's own page." },
        { id: "lineup", label: "Line-up", note: "The leagues and caps, opening on where the reader is." },
      ],
    },
    {
      type: "section",
      id: "shift",
      title: "From the first pass to ==what shipped==",
      body: [],
    },
    {
      type: "compare",
      before: {
        label: "The first pass",
        steps: [
          { text: "The poster as one flat frame" },
          { text: "Hotspots pinned across the hero" },
          { text: "Flames flickering on every prop" },
          { text: "A burst and a spinning shuttlecock around the deal" },
          { text: "Card art that took its time to arrive" },
        ],
        total: "Busy, and heavy on a phone",
      },
      after: {
        label: "What shipped",
        steps: [
          { text: "Layers that part as you scroll, each with its own depth" },
          { text: "No hotspots: the poster is the hero" },
          { text: "Flames that hold still, so the scroll does the moving" },
          { text: "A deal with room to be smooth" },
          { text: "Light card art, ready when the deck deals" },
        ],
        total: "Calm enough to feel like a world",
      },
    },
    {
      type: "gallery",
      pictures: [
        { src: `${dir}/tees.webp`, alt: "The tees, one per league" },
        { src: `${dir}/footer.webp`, alt: "Decathlon x Jolly Yun Shann" },
      ],
      tabs: ["Tees", "Footer"],
    },
    {
      type: "illustration",
      src: "/illustrations/rail.html",
      title: "A tee for every league",
      note: "Point at a tee and it hangs straight and lifts, while the others lean away. Each of the five leagues has its own.",
    },
    {
      type: "section",
      id: "results",
      entry: "wipe",
      eyebrow: "Results",
      title: "What the site ==gives Decathlon==",
      body: [],
    },
    {
      type: "stats",
      quick: true,
      note: "The site is still on Decathlon's test address, so this describes what it does, not live traffic.",
      items: [
        { label: "The poster", value: "Opens as you scroll", note: "The same art, moving without being redrawn." },
        { label: "The leagues", value: "Dealt like a deck", note: "Five cards that turn over as they land." },
        { label: "Every league", value: "Ends on its tee", note: "Each one links to its own garment page, tagged for the campaign." },
        { label: "The credit", value: "On every footer", note: "Decathlon x Jolly Yun Shann, on the footer boards." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      title: "Where it stands",
      body: [
        "I built the site for Decathlon India. It's served from Decathlon's test address, with page views, Web Vitals and campaign-tagged links to every product.",
        "Next, the hero needs to get lighter before the public launch.",
      ],
    },
  ],
};
