import { chapters, type CaseStudy } from "../types";

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
  impact: {
    line: "A flat poster turned into a world you scroll into, without redrawing a line of the artist's work, and every league ends on its tee.",
    stats: [
      { label: "visitors on Decathlon's test address", value: "1,734" },
      { label: "of them on a phone", value: "89%" },
    ],
  },
  takeaways: [
    "Traced art breaks when half of something moves, and a broken detail reads worse than a still one. So the football stays still.",
    "A campaign site has to feel like a world and still sell the tee. So every league ends on its own garment page.",
    "A page's motion should come from the scroll and the deck, so the flames hold still.",
  ],
  quick: {
    problem:
      "Decathlon's campaign turns five sports into five anime leagues, and it needed a site people would want to stay in. But the art arrived as one flat traced poster, and a poster with a scroll bar sells nothing.",
    approach: "I cut the poster into layers that part as you scroll, built a deck of league cards that deals itself, and ended every league on its own tee.",
    result: "A campaign site where the poster opens up around you and every league leads to its tee: 1,734 visitors so far, 89% of them on a phone.",
  },
  status: {
    title: "Built for Decathlon India",
    live: false,
    facts: [
      { label: "Artwork", value: "Jolly Yun Shann, illustrator and NFT artist" },
      { label: "Built with", value: "Vite, React 19, GSAP ScrollTrigger, Lenis, plain CSS" },
    ],
    sections: chapters,
    links: [],
  },
  cover: { src: `${dir}/hero.webp`, alt: "The Anime Sports League poster" },
  closing: ["That's all six.", "Thank you for reading this far. The next card takes you back to where it started."],
  blocks: [
    {
      type: "section",
      id: "problem",
      entry: "rise",
      eyebrow: "Problem",
      title: "A poster ==with a scroll bar==",
      body: ["Decathlon turned five sports into five anime leagues, each with a tee. The art arrived as ==one flat traced picture==: no layers, no names."],
    },
    {
      type: "immersive",
      quick: true,
      picture: { src: `${dir}/hero.webp`, alt: "The framed Anime Sports League poster" },
    },
    {
      type: "section",
      id: "objective",
      eyebrow: "Objective",
      title: "Step inside, ==leave with a tee==",
      body: ["Make the poster a world you scroll into, deal the five leagues like cards, and ==end every league on its tee==."],
    },
    {
      type: "steps",
      quick: true,
      phones: true,
      items: [
        { picture: { src: `${dir}/asl-m-poster.webp`, alt: "The poster on a phone, full screen, with The drop under it" }, title: "The poster opens the page.", text: "Jolly Yun Shann's art, full screen." },
        { picture: { src: `${dir}/asl-m-deal.webp`, alt: "Welcome to the anime world: the league cards on a phone" }, title: "Pick your sport.", text: "Five leagues, dealt as cards." },
        { picture: { src: `${dir}/asl-m-tees.webp`, alt: "The tees on a phone: Sky-Smash and Spin-Ignite black, at ₹799" }, title: "Then its tee.", text: "₹799, linked to its own page." },
        { picture: { src: `${dir}/asl-m-caps.webp`, alt: "The line-up on a phone: Crick-Stryke caps" }, title: "And the rest of the kit.", text: "Caps and the line-up, stepped in by the scroll." },
      ],
    },
    {
      type: "section",
      id: "process",
      entry: "draw",
      eyebrow: "Process",
      title: "The poster ==came first==",
      body: ["If the poster couldn't move, nothing else mattered. So that came before any section."],
    },
    {
      type: "timeline",
      items: [
        { when: "Prototype", title: "Made the poster move", text: "Cut the flat art into layers before building anything else." },
        { when: "Built", title: "Built the world around it", text: "The ground, the footer boards, a page-long gradient and the line-up." },
        { when: "Cut", title: "Took out what didn't hold", text: "The burst, the hotspots and the spinning shuttlecock went, so the deal had room to be smooth." },
        { when: "Connected", title: "Sent people to the right tee", text: "Every tee, cap and poster links to its own page, tagged for the campaign." },
        { when: "Shipped", title: "Handed it over", text: "With page views and Web Vitals wired in, on Decathlon's test address." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/asl-ground.webp`, alt: "The ground: From the first step to the final whistle, the ground is yours, with the Sky-Smash art beside its tee" }, title: "The world around the poster.", text: "The ground: the art beside the tee it's printed on." },
        { picture: { src: `${dir}/asl-rimcrush.webp`, alt: "The line-up: the Rim-Crush tee, stepped in by the scroll" }, title: "The line-up, one league at a time.", text: "Rim-Crush, stepped in by the scroll." },
        { picture: { src: `${dir}/asl-footer.webp`, alt: "The footer board: Decathlon x Jolly Yun Shann" }, title: "Down to the last board.", text: "Decathlon and the artist, side by side." },
      ],
    },
    {
      type: "section",
      id: "research",
      entry: "focus",
      eyebrow: "Research",
      title: "I ==measured== the reference",
      body: ["The frame was modelled on yesnowww.com, so I timed its scroll instead of guessing, and took the art apart ==before moving any of it==."],
    },
    {
      type: "cards",
      items: [
        { title: "yesnowww.com's scroll-out", text: "It starts on the first pixel, runs linear, and plays as three overlapping beats. I matched it." },
        { title: "The art, by paint order", text: "I split it into layers and worked out which shape was which before moving anything." },
        { title: "The phones people own", text: "Traced art is heavy, and it had to move on a mid-range phone, not a dev laptop." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/asl-parting.webp`, alt: "The poster parting as the scroll starts: the flags swinging out, the art dimming" }, title: "From the first pixel.", text: "The poster parts the moment you scroll, as the reference does.", wide: false },
        { picture: { src: `${dir}/asl-dealing.webp`, alt: "The league cards being dealt from a pile: Spin-Ignite and Sky-Smash down, the rest falling in" }, title: "Dealt from a pile.", text: "The leagues land one by one, on timing taken from the reference.", wide: false },
        { picture: { src: `${dir}/asl-dealt.webp`, alt: "Welcome to the anime world: five league cards dealt, Spin-Ignite, Sky-Smash, Crick-Stryke, Apex-Kick, Rim-Crush" }, title: "Five sports, five leagues.", text: "Spin-Ignite, Sky-Smash, Crick-Stryke, Apex-Kick, Rim-Crush.", wide: true },
      ],
    },
    {
      type: "section",
      id: "challenges",
      eyebrow: "Challenges",
      title: "Someone else's art, ==on a mid-range phone==",
      body: [],
    },
    {
      type: "cards",
      items: [
        { tag: "Stakeholder", title: "Someone else's art", text: "It's Jolly Yun Shann's work, so nothing could be redrawn. Only cut and moved." },
        { tag: "Design", title: "Half a football", text: "The ball's panels were merged with the leg in the trace, so a kick would move half a ball. It stays still." },
        { tag: "Tech", title: "Heavy art on a phone", text: "Layers sit on the GPU only while they move, and only the art that moves goes into the page." },
        { tag: "Design", title: "Title cards at the reader's speed", text: "Tied to the scroll, a flick threw them past in a frame. Now the scroll starts them, and they play in about seven seconds." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/asl-titles.webp`, alt: "The line-up's title cards: Crick-Stryke, Apex-Kick, Sky-Smash" }, title: "Title cards at reading speed.", text: "The scroll starts them; they play in about seven seconds." },
        { picture: { src: `${dir}/asl-caps.webp`, alt: "Caps: Crick-Stryke, with a flaming ball and a racket traced from the art" }, title: "Traced art, still light.", text: "Only the art that moves goes into the page as code." },
      ],
    },
    {
      type: "section",
      id: "tradeoffs",
      eyebrow: "Trade-offs",
      title: "Still flames, ==smooth scroll==",
      body: [],
    },
    {
      type: "tradeoffs",
      items: [
        { chose: "Only what moves cleanly gets to move", cost: "Whatever can't, the football included, stays still." },
        { chose: "Flames that hold still, so the scroll does the moving", cost: "Flickering flames looked lively, but kept the phone busy every frame." },
        { chose: "Only the moving art goes into the page as code", cost: "The hero is still the heaviest part of the page." },
      ],
    },
    {
      type: "steps",
      items: [
        { picture: { src: `${dir}/asl-flames.webp`, alt: "The tees, with a flaming cricket ball and shuttlecock held still between them" }, title: "The flames hold still…", text: "The ball and the shuttlecock sit between the tees." },
        { picture: { src: `${dir}/asl-prices.webp`, alt: "The tees and the cap at their prices, ₹699 and ₹799" }, title: "…so the scroll stays smooth.", text: "Every tee and cap, at its price, one tap from its page." },
      ],
    },
    {
      type: "section",
      id: "outcomes",
      entry: "wipe",
      eyebrow: "Outcomes",
      title: "==1,734 visitors==, nine in ten on a phone",
      body: ["The mobile score was 54 in early November, on a small sample, so the hero gets ==lighter before the public launch==."],
    },
    {
      type: "stats",
      quick: true,
      note: "From Vercel Web Analytics on Decathlon's test address, over the three months to 4 November 2026.",
      items: [
        { label: "Visitors", value: "1,734", note: "2,554 page views, 98% of them from India." },
        { label: "On a phone", value: "89%", note: "62% on Android, which is why the art had to stay light." },
        { label: "Sent from decathlon.in", value: "196", note: "Visitors who arrived from Decathlon's own site." },
        { label: "Leagues that end on their own tee", value: "5 / 5", note: "Each links to its garment page, tagged for the campaign." },
      ],
    },
  ],
};
