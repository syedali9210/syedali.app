# Design system

The rules behind the site, and where each one lives. The tokens themselves are in [`src/app/globals.css`](src/app/globals.css). If a value isn't here, it shouldn't be in a component.

## Principles

1. **The same relationship is the same distance.** A heading and its text sit 16 px apart on every page, on every screen. Spacing is named by what it separates, never picked by eye.
2. **The work is the colour.** The page stays quiet in greys and slate, so the projects carry the colour.
3. **No dead space.** Empty space has to be doing something: separating, or giving a moment room. A plate bigger than its picture, or a gap nobody reads, is a bug.
4. **Motion goes with the reader.** Things move with the scroll, never against it. If a finger drives it, it runs on the compositor.
5. **One way of doing each thing.** One nav, one plate, one label style.

## Space

Everything sits on a 4 px grid. Each token also makes Tailwind utilities, so `--spacing-text` gives `mt-text`, `gap-text`, `py-text` and so on.

| Token | Phone → desktop | What it separates |
| --- | --- | --- |
| `label` | 4 | A label and its value |
| `note` | 8 | A title and the line under it |
| `caption` | 12 | A picture and its caption, rows inside a card |
| `text` | 16 | A heading and its text, paragraph and paragraph |
| `lead` | 24 | A chapter label and its heading, items in a grid |
| `group` | 32 | Groups inside one block |
| `block` | 32 → 48 | Block and block inside a section |
| `section` | 64 → 104 | Section and section, project and project |

How to choose: start from what the two things are to each other. If you're reaching for a number, the relationship hasn't been decided yet.

Widths and page edges:

| Token | Value | Use |
| --- | --- | --- |
| `--measure` | 688 px | Everything you read, tables included |
| `--wide` | 923 px | Pictures, films and figures |
| `--gutter` | 20 → 32 px | The side margin |
| `--page-top` | 12 → 32 px | Over the first thing on a page |
| `--page-end` | 104 px | Under the last thing, clearing the bar at the foot |

Rules:

- A story is a run of `.part`s. Each has half a `section` above and below, so any two sit exactly one `section` apart.
- Lay out siblings with `gap`. Margins are for the odd one out.
- Inside a control (a button's padding, a tick's size) use the plain grid: `p-3`, `gap-2`.
- No `mt-[13px]`. If a value is off the grid, it's a mistake.

## Type

Two faces: Libre Baskerville for what you look at, Geist for what you read. Geist Mono is only for small labels.

| Token | Size | Line | Use |
| --- | --- | --- | --- |
| `text-display` | 30 → 38 | 1.15 | A page's title |
| `text-headline` | 24 → 28 | 1.2 | Section headings |
| `text-statement` | 22 → 28 | 1.32 | Centred statements, numbers |
| `text-lead` | 16 → 18 | 1.55 | The summary under a title |
| `text-copy` | 15 | 1.6 | Reading text |
| `text-small` | 14 | 21 px | Captions and notes |
| `text-tag` | 12 | 16 px | Labels over a value |
| `--type-label` | 11 | 16 px | Mono labels, in capitals, tracked 0.08em |

Headings balance (`text-wrap: balance`), paragraphs stay pretty (`text-wrap: pretty`). Reading text keeps to `--measure`.

## Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `sheet` | `#f5f5f5` | `#131315` | The page |
| `ink` | `#32404f` | `#f5f5f7` | Headings and names |
| `body` | `#596470` | `#c3c3c8` | Reading text |
| `label` | `#636d78` | `#9a9aa1` | Labels and captions |
| `card` | `#ebedef` | `#1d1d20` | Plates under figures |
| `surface` | `#ffffff` | `#1c1c1f` | Anything that floats |
| `line` | ink at 12% | white at 10% | Hairlines |
| `accent` | `#c2410c` | `#fb923c` | Small labels, the current item |
| `live` | `#42d000` | same | The live dot |

Each case study adds its own `--deep`, `--mid`, `--light` and `--hl`, sampled from its screens. They tint plates and the entry sky, nothing else. Text keeps AA contrast or better in both themes.

## Shape

Pictures are square-cornered (`--radius-media`). Cards use 8 px, panels 4 px, and the bar at the foot is a full pill. Depth comes from a hairline first, a soft shadow only on things that float.

## Motion

| Token | Use |
| --- | --- |
| `--ease-out` | Almost everything: things arriving |
| `--ease-in-out` | Lines drawing, a clip opening |
| `--ease-glide` | Something big travelling across the screen |

- Animate only transform, opacity and clip, so it stays on the compositor.
- Tied to scroll on a phone? Use a scroll-driven animation (`animation-timeline`), because a script runs a frame behind the finger. The dome and the portrait film work this way.
- A reveal's resting state must be plain: `[data-in]` clears every transform and filter. A start state that never clears shifts the layout for good.
- Everything still works with reduced motion, and without JavaScript.

## Sound

Quiet, made on the spot with Web Audio (no files to load), and one switch turns all of it off.

- **Every stone has its own voice** (`src/content/voices.ts`): a short tune, one note a blow of the hammer, and a press lands on its last note. It's the same stone wherever it appears, and a word or row that goes to a stone's page speaks with that stone's voice.
- **One key, D major pentatonic**, so any order of stones still sounds played. Stones differ only slightly: another tune, on another kind of rock.
- **The rock decides the body**, from how it's baked: strata are sandstone (short and dull), a rough dark stone is basalt (deep), a smooth veined one is marble (the longest ring).
- **The register says what it is**: projects highest, an archive piece lower (a project's own piece plays its tune an octave down), a page's standing stone lowest.
- No two stones share a tune, and every stone has one. The build checks both.

## Speed

- **Nothing heavy under a flight.** Work that can wait, such as starting a WebGL context, waits for `landed()` (`PageLink.tsx`), since a flight is the GPU's.
- **Built once.** A stone's GL and the workers outlive the page. Build new ones one at a time, never in a burst.
- **Ahead of the pointer, behind the page.** What's loaded in advance asks for low priority, and on a slow or metered connection a stone's maps wait until it's pointed at.
- **A client component gets only what it needs.** Whatever it's given goes down the wire a second time.

## Components

- **Plate** (`.plate`): a picture inset on a soft field of the project's colour.
- **Picture rows** (`.bento`): pictures that are cards in their own right share one plate. Each keeps its shape, and a row's pictures grow by aspect ratio so the row fills the plate. Use `fit: "row"` for small files, which stay at their own size. A picture is never drawn wider than its file.
- **Film** (`Immersive`): pinned and growing to the full screen on a landscape screen. On a portrait screen it stays in the page, edge to edge, and grows out to the edges as it rises.
- **Archive animation** (`animations/Figure.tsx`): a live piece on its own page, opened in the stage's frame, 5:4 on a wide screen and 4:5 on a phone. Its own colours where it has a character of its own, such as the pet or the notch, and the site's tokens for everything round it.
- **Case nav** (`Panels.tsx`): a carved stone to go back and a black bar that names your section, the same on every screen. Press the current section for the full list and the switches.
- **Tables** (`Table`): three columns at 5:6:5. Below `sm` the rows stack and each cell carries its column's name.
- **Dome** (`.dome`): the colour passage. `--bell` is the height the picture is drawn at, and `--crop` is how much shows, because the rest of the picture is plain core.

## Writing

First person, plain, a little formal. Say what happened, then why it mattered. Admit the awkward part flatly. Keep real numbers with what they measured, and never credit a tool for a decision. Open each case study on a tension, not a description.
