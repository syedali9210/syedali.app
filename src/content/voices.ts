/**
 * Every stone's voice. A hammer on it plays its own short tune, one note a blow, and a press lands on the tune's last note.
 *
 * All of it is in one key, D major pentatonic (D E F♯ A B), which has no wrong notes: run the pointer across the stones in any order and it
 * still sounds played. So they differ from one another only slightly: another tune, on another kind of rock.
 *
 * What a stone is made of comes from how it's baked (scripts/stamps/bake.py): strata make sandstone, a rough dark stone is basalt, a smooth
 * veined one is marble and rings longest. Where it sits in the range says what it is: the projects on the first screen highest, an archive
 * piece a little lower (a project's own piece plays its tune an octave down), a page's standing stone lowest of all.
 *
 * Made on the spot with Web Audio (Sound.tsx), so this table is all the sound there is to load. No stone may share a tune; the build checks
 * that every stone has one (content/archive.ts).
 */

/** ring: its partials, as [ratio to the note, loudness, seconds]. knock: the hammer's contact, as [seconds, loudness, Hz from, Hz to, Q]. */
type Body = { ring: [number, number, number][]; knock: [number, number, number, number, number] };

export const BODIES = {
  // The site's first sound, a small hammer on a bronze plaque: partials that don't make a chord.
  bronze: { ring: [[1, 0.05, 0.32], [2.43, 0.022, 0.2], [3.91, 0.012, 0.12]], knock: [0.03, 0.16, 2400, 1500, 2.4] },
  // Coarse and even: a firm knock, a middling ring.
  granite: { ring: [[1, 0.05, 0.26], [2.31, 0.02, 0.16], [4.12, 0.01, 0.09]], knock: [0.028, 0.16, 2700, 1700, 2.2] },
  // Laid down in layers: more knock than ring, and it dies quickly.
  sandstone: { ring: [[1, 0.056, 0.18], [2.76, 0.014, 0.1], [5.4, 0.005, 0.05]], knock: [0.04, 0.2, 1700, 1100, 1.6] },
  // Dark and dense: a deep, rounded note.
  basalt: { ring: [[1, 0.06, 0.3], [1.98, 0.018, 0.2], [3.4, 0.008, 0.1]], knock: [0.032, 0.17, 1400, 900, 3] },
  // Smooth and veined: the longest, cleanest ring, and hardly any knock.
  marble: { ring: [[1, 0.045, 0.46], [3.01, 0.016, 0.26], [5.2, 0.006, 0.12]], knock: [0.02, 0.1, 3400, 2400, 3] },
  // Glassy: a second partial a hair sharp of the first beats against it, a slow shimmer.
  jade: { ring: [[1, 0.04, 0.38], [1.006, 0.02, 0.34], [2.71, 0.015, 0.18], [6.2, 0.004, 0.06]], knock: [0.022, 0.12, 3000, 2000, 3] },
  // Iron-hard: a short, bright clack.
  ironstone: { ring: [[1, 0.054, 0.18], [2.1, 0.024, 0.12], [3.6, 0.012, 0.07]], knock: [0.03, 0.2, 2200, 1400, 2] },
} satisfies Record<string, Body>;

export type Voice = { tune: string[]; body: keyof typeof BODIES };

const v = (tune: string, body: Voice["body"]): Voice => ({ tune: tune.split(" "), body });

/** A note's pitch in Hz: "F#6". */
export const hz = (note: string) => 440 * 2 ** (("C D EF G A B".indexOf(note[0]) + (note[1] === "#" ? 1 : 0) + 12 * (Number(note.at(-1)) - 4) - 9) / 12);

export const VOICES: Record<string, Voice> = {
  // The projects, on the first screen. Lined up in their row (left to right, as here) their first notes climb the scale.
  kiprun: v("A5 B5 D6", "basalt"),
  "animation-engine": v("B5 F#6 E6", "sandstone"),
  uniqkey: v("D6 A5 B5", "jade"),
  trace: v("E6 F#6 A6", "granite"),
  kodex: v("F#6 E6 D6", "marble"),
  "anime-sports-league": v("A6 F#6 A6", "ironstone"),

  // Their pieces in the archive: the same tune, an octave down.
  "piece-kiprun": v("A4 B4 D5", "basalt"),
  "piece-animation-engine": v("B4 F#5 E5", "sandstone"),
  "piece-uniqkey": v("D5 A4 B4", "jade"),
  "piece-trace": v("E5 F#5 A5", "granite"),
  "piece-kodex": v("F#5 E5 D5", "marble"),
  "piece-anime-sports-league": v("A5 F#5 A5", "ironstone"),

  // The archive's animations, light and high.
  "piece-maze-walk": v("E6 D6 A5", "sandstone"),
  "piece-hello": v("B5 D6 F#6", "granite"),
  "piece-tab-hop": v("D6 E6 B5", "basalt"),
  "piece-notch-card": v("A5 D6 F#6", "basalt"),
  "piece-scratch-card": v("F#5 A5 B5", "sandstone"),
  "piece-nav-scrubber": v("F#6 A6 E6", "jade"),
  "piece-chat-quiz": v("A5 E6 D6", "ironstone"),

  // The archive's films, lower.
  "piece-trace-launch": v("D5 A5 F#5", "marble"),
  "piece-engine-launch": v("E5 B5 A5", "granite"),
  "piece-kiprun-film": v("B4 A4 D5", "basalt"),
  "piece-trace-ui": v("F#5 D5 E5", "granite"),

  // The pages' standing stones, the biggest and the lowest.
  "piece-archive": v("A4 D5 A5", "sandstone"),
  "piece-experience": v("B4 D5 E5", "granite"),
  "piece-about": v("D5 F#5 B5", "marble"),

  // The ways round: pressed, never hammered, in the site's first sound.
  "piece-menu": v("E6 A5", "bronze"),
  "piece-back": v("A5 E5", "bronze"),
};

/** The row on the first screen, left to right. */
export const ROW = ["kiprun", "animation-engine", "uniqkey", "trace", "kodex", "anime-sports-league"];
