# Syed Ali's portfolio

Six case studies and the site around them, built from one Figma template ("Portfolio case study", the Trace frame, node `22:759`): Trace, Animation Engine, KIPRUN, Kodex, Uniqkey and Anime Sports League.

## What it is

A small Next.js site: a front page, its own pages for the archive (`/archive`), the experience (`/experience`) and the about (`/about`), and each case study a page at `/work/<slug>`, written as data and drawn by one set of components. The front page: a preloader, once a visit, that draws the first screen as dashed scaffolding before the content focuses in; every project a carved rock that floats, and lifts and is hammered when pointed at, with sound and dust (WebGL in a worker); the work as rows of screens on dithered fields inside a dome of colour, with a filter for products and websites. On a phone the rocks lie in an arc that opens from one stone like a folding fan when the page loads, a tap puts one on stage, and the menu is a stone in the corner. A page change carries its stone across a blank sheet to where it lands on the next page (view transitions). Sounds throughout (Web Audio, one switch), and every stone has its own short tune under the hammer, all in one key (`src/content/voices.ts`). A case study is Rachel Chen's layout: a 688 px reading column and 923 px pictures on square plates, the way round it in a carved stone and a bar at the foot of the screen on every size, Bill Guo's chapter rules, centred statements and an Up next card; an entry plate with the product's device, an interactive hairline illustration per project, a design-process section (a hairline flight of steps), a film that grows to the full screen on a landscape screen and stays in the page on a portrait one, a device section over the product's wireframes, and a Quick overview mode (`?view=quick`). Light by default, with a dark switch. The tokens and rules behind all of it are in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## The problem it solves

The template existed for one project, Trace, with placeholder copy in five copies of it. Each case study needed its real words, real screenshots and real numbers, and the site had to stay easy to extend: adding a case study shouldn't mean writing a new page.

## Who it's for

People reviewing Syed's work (hiring managers, design leads, clients), on a laptop or a phone.

## Goals and principles

- **The Figma frame is the spec** at 1440: column widths, the 122:88 gaps, 56 px between blocks, a serif for headings (Libre Baskerville, after Canela Text and Newsreader), Geist text, the grey cards stepping left and right.
- **Real data only.** Copy comes from each project's own docs and code (Trace's README, the Animation Engine's README and PROJECT-CONTEXT, the KIPRUN and Anime Sports League sites and READMEs, portfolio v2's `projects.ts` for Kodex and Uniqkey). Screenshots are captured from the running builds; numbers are counted from the repos (commits, paths, cards).
- **Nothing hard-coded in components.** Words, pictures and numbers live in `src/content/case-studies/*.ts`; colours, type sizes and radii are tokens in `globals.css`; picture sizes come from `src/content/media.json`.
- **Motion that explains, not decorates**: sections fade up as they arrive, films and screenshots open from a clipped card, the fan diagram's lines draw in, the cards step in from their side, the statement lights up word by word, stats rise into their cards. Text cards lift on hover; the status card's links grow a hairline and follow the section you're reading; the ticks bottom-left name each section. Everything is visible without JavaScript and still under reduced motion.

## Constraints

- KIPRUN and Anime Sports League are paid client work for Decathlon India; check with the client before publishing them.
- The Trace Figma frame had no "initial sketch"; that section is "How Trace solves it", with the timeline picture from the frame.

## Research: what was looked at first

- The Figma file holds seven frames: the Trace case study with real copy, and five copies of it (Animation Engine, KIPRUN, Uniqkey, Kodex, Anime Sports League) still carrying Trace's text. The newer copies already set the headings in Canela Text.
- Each project's own sources: Trace's README and screenshots, the Animation Engine's README and PROJECT-CONTEXT, the KIPRUN page's index.html and its 47 commits, the Anime Sports League README (how the poster was cut into layers, how the deck deals) and its footer credit, portfolio v2's copy for Kodex and Uniqkey.
- Trace had already walked the Animation Engine (28 screens) and the Anime Sports League site; the engine's screenshots come from that walk. KIPRUN and Anime Sports League were captured again from their builds, scrolled through at 1440 and 390.

## Key decisions

- **Blocks, not pages.** One `CaseStudy` type with a list of blocks, so six case studies share every component and a seventh is a data file.
- **Geist for body text.** The Figma used Inter for paragraphs; the brief named Geist and Canela Text as the two faces, so Inter became Geist. Canela was later replaced by Newsreader, then by Libre Baskerville, the serif of the case studies Syed pointed at (Rachel Chen's), picked from a rendered specimen.
- **The status card's icon opens the live thing.** In Figma it was Trace's "write the changes again" refresh icon, which does nothing on a portfolio; it links to the live page or repo where there is one, and is absent otherwise.
- **Every section indented the same.** The Figma indents most sections 33.5 px inside the 614 column but not all; all are indented here so the left edge doesn't jump.
- **Sticky columns only where they fit.** The intro and status card stay put from 1280; at 1024 they scroll with the page, because together they're taller than a laptop screen.
- **Real pictures in the diagrams.** The fan diagram's grey squares hold tool icons for Trace, folders for the engine, the shoes for KIPRUN and the league cards for Anime Sports League.

## Validation: how it was checked

- Full-page screenshots in headless Edge at 1440, 1024 and 390, light and dark, compared with the Figma frame.
- No sideways scroll at any of those widths (`scrollWidth` equals the viewport).
- Real pointer input: a card lifts 2 px and darkens on hover; a status-card link's hairline grows from 18% to full on hover and lights up for the section on screen; ticks show their name on hover and jump on click; the film plays on screen, pauses on click, and stays paused when you scroll back.
- Reduced motion: every block visible, no autoplay.
- Contrast: the lowest text pair is 4.73:1 (grey label on a hovered card); body text is 5.34:1 light, 7.8:1 dark.
- `npm run build` checks every picture, id and status link, then prerenders all six pages.

## Reflection

Tokens need names that can't collide: `text-body` and `text-label` were both a colour and a font size in Tailwind, and the page quietly rendered at the wrong sizes until the screenshots showed it. And a reveal effect has to be scoped: a rounded clip-path on every revealed element shaved the first letter off each paragraph and hid the films' shadows.

## How it's built

- **Next.js 16** (App Router, static pages from `generateStaticParams`), **React 19**, **TypeScript**, **Tailwind CSS v4**. The site's own motion is CSS transitions driven by one `IntersectionObserver` (`src/components/motion.tsx`). The archive's animations are the exception: they use Motion and lucide-react, and run in frames of their own, so neither loads anywhere else.
- Fonts: Geist, Geist Mono and Libre Baskerville through `next/font/google`.
- Layout: text in a 688 px measure, pictures in a 923 px column, and one bar at the foot of the screen as the way round a case study on every size (`Panels.tsx`); a progressive blur runs along the bottom edge; headlines rise word by word as sections arrive. Type is one fluid scale of seven steps, and every gap is a named token on a 4 px grid (`globals.css`, explained in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)).
- Speed: `public/` keeps for a day and then refreshes behind the old copy (`next.config.ts`). A stone's WebGL outlives its page: the workers stay and a stone leaving is parked, so coming back costs nothing, and new ones are built one at a time, after the flight has landed (`useStones` in `Stamps.tsx`). A client component is only given what it needs, because everything it's given goes down the wire a second time.
- Motion: one rAF scroll loop (`src/components/scroll.ts`) drives the pinned film (`Immersive.tsx`), the full-frame section (`FullFrame.tsx`) and the active section; the dome and the film on a portrait screen are scroll-driven CSS, so on a phone they keep up with the finger; smooth wheel scrolling is `SmoothScroll.tsx`. Everything animates transform, opacity or a clip, so it stays on the compositor.
- Light by default, with a dark switch.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # checks every picture, id and link, then prerenders all six pages
npm run media      # after adding pictures to public/: records their sizes
npm run illustrations   # after changing a figure in illustrations/: rebuilds public/illustrations/<name>.html
```

Illustrations are hairline figures (`illustrations/<name>.js`), checked on the hairline skill's bench with its `look.mjs` before they ship; `illustrations/kernel.js` is the skill's kernel, copied unchanged. The Trace launch film's full-quality master is in `films/` (kept out of the site and git); the site plays a 1600 px copy.

## Adding a case study

1. Put its pictures in `public/case-studies/<slug>/` and run `npm run media`.
2. Copy one of `src/content/case-studies/*.ts`, change the words and blocks. Block types are in `src/content/types.ts`: `section` (starts a card), `media` (picture or film, `tall` pans on hover), `immersive` (goes full screen as you scroll), `tradeoffs`, `decisions` and `alignment` (one three-column table each), `process` (the design process: phases with `phase`, `kind`, one line and an output, climbed by the stairs figure), `gallery` (one plate of pictures in rows that fill it, or with `tabs` one at a time), `image`, `wireframes` (the device section: `over` is the screen on the device, the screens from `src/content/wireframes.ts` are the field under it; the section right before it becomes its heading), `illustration`, `cards` (an even grid of points), `statement`, `stats`. Each case study also has a `tagline`, a `theme` (colours sampled from its screens), a `hero` device, an optional `card` film for its front-page card and an optional `closing`, the two-line sign-off above Up next; the four main sections take an `eyebrow` and an `entry` (rise, draw, focus, wipe), and a `gallery` with `tabs` shows one picture at a time. Mark a block `quick: true` to keep it in the quick overview, and fill `quick` with the three lines.
3. Add it to the list in `src/content/index.ts`. The build fails if a picture is missing, an id repeats, or a status-card link points at nothing.

## Adding an animation to the archive

The archive's animations came from [syedali.app](https://github.com/syedali9210/syedali.app) and live in `src/components/animations/`.

1. Put the component there and add it to `DEMOS` in `Figure.tsx`. It runs on its own page at `/archive/<id>`, which the stage opens in a frame, so what it's built on only loads when it's opened. In a frame a width says nothing about the screen: ask the device (`pointer`, `hover`), not a breakpoint.
2. Add it to `src/content/archive.ts` with `fig(id, title, note)`.
3. Give it a still, `public/archive/<id>.webp` at 1000 x 800, which its dust takes its colours from, and run `npm run media`.
4. Give it a stone: a carving in `MOTIFS` (`scripts/stamps/motifs.js`), an entry in `PIECES` (`bake.py`) and a voice in `src/content/voices.ts`. Then `npm run stamps -- pieces`, because the number on every stone after it moves, and the archive's own stone keeps a tally of them all.

## What's next

- Get Decathlon's OK for the two client pages.
- Sections still missing, which need Syed's facts: research and insights, validation or usability testing, role and collaboration, and real outcome numbers for Kodex and Uniqkey (their stats describe the designs, not live traffic).
- KIPRUN's problem statement still needs Decathlon's own brief; the page describes what was built instead.

## The hero's rocks and the work's fields

`npm run stamps` (with the site running on localhost:3418) bakes each project's rock and the maps its hover is lit from into `public/stamps/`, from `scripts/stamps/bake.py` and `motifs.js`. It needs numpy, scipy, Pillow and Playwright, and drives Edge unless told otherwise: `STAMPS_BROWSER=chromium`, and `STAMPS_SITE` for another address.

`npm run fields` bakes the work section's dithered fields (`scripts/stamps/fields.py`).

`python scripts/stamps/soft.py` bakes the hero rocks' shadows, and the dome and the paper's noise in both themes: small pictures, so a phone only ever has to move them. Change the dome's colours there.

`npm run stamps -- pieces` bakes the archive's stones (`PIECES` in `bake.py`: each piece's colour, outline, chips and carving), or `npm run stamps -- pieces vault deck` only those. A new archive piece in `content/archive.ts` needs an entry there and a voice in `content/voices.ts`; the build stops without one. The phone's menu stone is one of these too: `npm run stamps -- pieces menu`.

The pages' own stones are pieces too: `npm run stamps -- pieces archive experience about`, and so is the way back from a case study on a phone: `pieces back`. Each also leaves a small `-icon` picture, which sits beside its word in the menu and flies to its page when pressed.

A new project needs a rock (a motif in `motifs.js`, a stone in `bake.py`, a place in `Stamps.tsx`, a material in `stamp.worker.ts`, a voice in `voices.ts`), a field in `fields.py` and a row in `ROWS` in `Home.tsx`.

## Search engines and AI agents

- `src/content/seo.ts` holds where the site lives (`SITE`: www.syedali.app, which the bare syedali.app redirects to), each page's title, canonical address and share card (`pageMeta`), and the schema.org structured data: who Syed is on every page, a profile on About, and what each case study is and who made it.
- `/robots.txt` (`src/app/robots.ts`) lets every crawler in, AI agents included, and points at `/sitemap.xml` (`src/app/sitemap.ts`), which lists every page.
- `/llms.txt` (`src/app/llms.txt/route.ts`) is the site in plain words for AI agents, written at build time from the case studies, the experience and `src/content/about.ts`, which the About page reads too. It also says the site before November 2026 was a different portfolio.
- After a deploy that changes pages, `npm run indexnow` asks Bing (which ChatGPT search and Copilot read from) and the other IndexNow engines to fetch them again. The key file in `public/` proves the site is ours; it isn't a secret.
- Google and Bing need the sitemap once, by hand: add `https://www.syedali.app/sitemap.xml` in Google Search Console and in Bing Webmaster Tools.

