import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* The hero's records: every project pressed as a CD in a jewel case, a series on one label (SA–001 to SA–006).
   Each sleeve is painted at runtime on a canvas, in two layers: the print, and its finish (paper, gloss varnish, foil,
   embossing) packed into one map as height, roughness and metal. Point at a case and it comes forward, the clear lid
   lifts on its hinge, and the disc slides out spinning; its silver catches the light in the rainbow a CD's grooves
   throw (the diffraction from Syed's "Coins & Notes" shader). The key light follows the pointer. Nothing moves by
   itself; a frame is drawn only while something is settling. */

export type Disc = { slug: string; title: string; kind: string; year: string; tagline: string; theme: { deep: string; mid: string; light: string; highlight: string }; shot?: string };
type Ctx = CanvasRenderingContext2D;
type Fonts = { serif: string; sans: string; mono: string };
type Art = { c: Ctx; f: Ctx; print: HTMLCanvasElement; finish: HTMLCanvasElement };

const N = 1024;
const TAU = Math.PI * 2;
// The finish map: red = height, green = roughness, blue = metal.
const PAPER = "rgb(128,178,0)", GLOSS = "rgb(128,40,0)";
const SILVER = "#e9ecef", GOLD = "#f3d27e", CHROME = "#f4f6f8";
// A jewel case, in centimetres: 142 × 125 mm, a 12 cm booklet and disc.
const W = 14.2, H = 12.5, TRAY = 0.55, LID = 0.47, BOOK = 12, DX = 0.9;

const sheet = (w: number, h = w) => Object.assign(document.createElement("canvas"), { width: w, height: h });
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const circle = (c: Ctx, r: number, x = 0, y = 0) => {
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
};

function art(): Art {
  const print = sheet(N), finish = sheet(N);
  const c = print.getContext("2d")!, f = finish.getContext("2d")!;
  f.fillStyle = PAPER;
  f.fillRect(0, 0, N, N);
  return { c, f, print, finish };
}
// Hot foil: the shape in metal, polished, pressed a little into the paper.
function foil(a: Art, shape: (x: Ctx) => void, tint = SILVER) {
  for (const [x, style] of [[a.c, tint], [a.f, "rgb(104,46,255)"]] as const) {
    x.save();
    x.fillStyle = x.strokeStyle = style;
    shape(x);
    x.restore();
  }
}
// Spot gloss: varnish over the print, same colour, shinier.
function gloss(a: Art, shape: (x: Ctx) => void) {
  a.f.save();
  a.f.fillStyle = a.f.strokeStyle = GLOSS;
  shape(a.f);
  a.f.restore();
}
// Embossing: the paper raised, finish unchanged.
function emboss(a: Art, shape: (x: Ctx) => void, up = 168) {
  a.f.save();
  a.f.fillStyle = a.f.strokeStyle = `rgb(${up},178,0)`;
  shape(a.f);
  a.f.restore();
}
// Film grain in the print and a tooth in the paper.
function grain(a: Art, amt: number, seed: number) {
  const t = sheet(256), x = t.getContext("2d")!, d = x.createImageData(256, 256), r = rng(seed);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = r() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  a.c.save();
  a.c.globalAlpha = amt;
  a.c.globalCompositeOperation = "overlay";
  a.c.fillStyle = a.c.createPattern(t, "repeat")!;
  a.c.fillRect(0, 0, N, N);
  a.c.restore();
  // The tooth: the same noise in the height channel only, so roughness and metal stay as painted.
  x.globalCompositeOperation = "multiply";
  x.fillStyle = "#f00";
  x.fillRect(0, 0, 256, 256);
  a.f.save();
  a.f.globalAlpha = 0.08;
  a.f.globalCompositeOperation = "lighter";
  a.f.fillStyle = a.f.createPattern(t, "repeat")!;
  a.f.fillRect(0, 0, N, N);
  a.f.restore();
}
function text(c: Ctx, s: string, x: number, y: number, font: string, fill: string, align: CanvasTextAlign = "left", spacing = 0) {
  c.save();
  c.font = font;
  c.fillStyle = fill;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  c.letterSpacing = `${spacing}px`;
  c.fillText(s, x, y);
  c.restore();
}
function vgrad(c: Ctx, top: string, bottom: string) {
  const g = c.createLinearGradient(0, 0, 0, N);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, N, N);
}
// The label's mark on every sleeve: a hallmark ring with SA, and the catalogue number.
function series(a: Art, n: number, F: Fonts, ink: string, x = 64, y = 74) {
  const c = a.c;
  c.save();
  c.strokeStyle = ink;
  c.lineWidth = 2.5;
  circle(c, 24, x, y);
  c.stroke();
  c.lineWidth = 1;
  circle(c, 19, x, y);
  c.stroke();
  c.restore();
  text(c, "SA", x, y + 6, `700 16px ${F.serif}`, ink, "center");
  emboss(a, (f) => {
    f.lineWidth = 3;
    circle(f, 24, x, y);
    f.stroke();
  });
  text(c, `SA–00${n + 1}`, x + 40, y + 7, `500 19px ${F.mono}`, ink, "left", 3);
}
function arcText(c: Ctx, s: string, r: number, font: string, fill: string, start: number) {
  c.save();
  c.font = font;
  c.fillStyle = fill;
  c.textAlign = "center";
  c.textBaseline = "middle";
  let a = start;
  for (const ch of s) {
    const w = c.measureText(ch).width;
    a += w / r / 2;
    c.save();
    c.rotate(a);
    c.translate(0, -r);
    c.fillText(ch, 0, 0);
    c.restore();
    a += w / r / 2;
  }
  c.restore();
}
// A seven-segment digit, for KIPRUN's clock.
function digit(x: Ctx, ch: string, ox: number, oy: number, w: number, h: number, t: number) {
  const on: Record<string, number[]> = { "0": [0, 1, 2, 4, 5, 6], "4": [1, 2, 3, 5], "8": [0, 1, 2, 3, 4, 5, 6] };
  const S = [[t, 0, w - 2 * t, t], [w - t, t, t, h / 2 - 1.5 * t], [w - t, h / 2 + t / 2, t, h / 2 - 1.5 * t], [t, h / 2 - t / 2, w - 2 * t, t], [0, h / 2 + t / 2, t, h / 2 - 1.5 * t], [0, t, t, h / 2 - 1.5 * t], [t, h - t, w - 2 * t, t]];
  for (const i of on[ch] ?? []) {
    const [sx, sy, sw, sh] = S[i];
    x.beginPath();
    x.roundRect(ox + sx, oy + sy, sw, sh, t / 2);
    x.fill();
  }
}

/* ── The sleeves ───────────────────────────────────────────────────────────────────────────────────────────────── */

const COVERS: Record<string, (a: Art, d: Disc, F: Fonts) => void> = {
  // SA–001 Trace: a memory, mapped. One contour per version, wavering where the work changed; the latest change
  // marked in the highlight. Silver foil on cobalt.
  trace(a, d, F) {
    const c = a.c;
    vgrad(c, "#1c2d92", "#0a1350");
    const cx = 650, cy = 430;
    foil(a, (x) => {
      x.lineWidth = 2.2;
      for (let k = 0; k < 30; k++) {
        x.beginPath();
        for (let s = 0; s <= 220; s++) {
          const t = (s / 220) * TAU;
          const r = 24 + k * 15 + (k / 30) * (Math.sin(t * 3 + k * 0.6) * 14 + Math.sin(t * 5 - k * 0.35) * 7 + Math.sin(t * 2 + k * 1.1) * 22);
          x.lineTo(cx + Math.cos(t) * r * 1.1, cy + Math.sin(t) * r * 0.86);
        }
        x.closePath();
        x.stroke();
      }
    });
    const nx = cx + 150, ny = cy - 96;
    c.fillStyle = d.theme.highlight;
    circle(c, 15, nx, ny);
    c.fill();
    gloss(a, (x) => {
      circle(x, 15, nx, ny);
      x.fill();
    });
    c.strokeStyle = d.theme.highlight;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(nx + 12, ny - 10);
    c.lineTo(892, 226);
    c.lineTo(968, 226);
    c.stroke();
    text(c, "LATEST CHANGE", 968, 210, `500 17px ${F.mono}`, d.theme.highlight, "right", 2);
    text(c, "Trace", 50, 912, `italic 400 214px ${F.serif}`, "#eef1ff");
    emboss(a, (x) => {
      x.font = `italic 400 214px ${F.serif}`;
      x.fillText("Trace", 50, 912);
    });
    text(c, "A DESIGN MEMORY FOR PEOPLE AND AI AGENTS", 58, 972, `500 17px ${F.mono}`, "rgba(238,241,255,.72)", "left", 3);
    series(a, 0, F, "#eef1ff");
    grain(a, 0.08, 11);
  },
  // SA–002 Animation Engine: a play mark built out of speed, between two strips of film; caught mid-move in a
  // chromatic echo, its edge in chrome foil.
  "animation-engine"(a, d, F) {
    const c = a.c, r = rng(23);
    c.fillStyle = "#0d0c17";
    c.fillRect(0, 0, N, N);
    c.fillStyle = "#17151f";
    c.fillRect(0, 0, N, 88);
    c.fillRect(0, N - 88, N, 88);
    c.fillStyle = "#f3efe6";
    for (let x = 18; x < N; x += 62) {
      c.beginPath();
      c.roundRect(x, 32, 34, 24, 5);
      c.roundRect(x, N - 56, 34, 24, 5);
      c.fill();
    }
    const tri = new Path2D();
    tri.moveTo(300, 330);
    tri.lineTo(800, 600);
    tri.lineTo(300, 870);
    tri.closePath();
    c.save();
    c.clip(tri);
    const g = c.createLinearGradient(300, 0, 800, 0);
    g.addColorStop(0, d.theme.light);
    g.addColorStop(0.5, d.theme.mid);
    g.addColorStop(1, d.theme.deep);
    c.fillStyle = g;
    for (let y = 330; y < 870; y += 7) {
      c.globalAlpha = 0.5 + r() * 0.5;
      c.fillRect(300 + r() * 170, y, 140 + r() * 540, 3 + r() * 3);
    }
    c.restore();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.lineWidth = 3;
    for (const [dx, col] of [[-16, "rgba(255,70,140,.75)"], [16, "rgba(70,150,255,.75)"]] as const) {
      c.strokeStyle = col;
      c.translate(dx, 0);
      c.stroke(tri);
      c.translate(-dx, 0);
    }
    c.restore();
    foil(a, (x) => {
      x.lineWidth = 5;
      x.lineJoin = "round";
      x.stroke(tri);
    }, CHROME);
    text(c, "ANIMATION", 52, 196, `800 92px ${F.sans}`, "#ffffff", "left", -3);
    text(c, "ENGINE", 52, 282, `800 92px ${F.sans}`, d.theme.light, "left", -3);
    text(c, "SIDE A  STUDIO", 968, 860, `500 18px ${F.mono}`, "rgba(255,255,255,.75)", "right", 3);
    text(c, "SIDE B  FILMS", 968, 890, `500 18px ${F.mono}`, "rgba(255,255,255,.75)", "right", 3);
    series(a, 1, F, "#ffffff", 830, 166);
    grain(a, 0.1, 23);
  },
  // SA–003 KIPRUN: the track from above, its bend sweeping out of the frame; the name at full sprint and the film's
  // running time in foil.
  kiprun(a, d, F) {
    const c = a.c, r = rng(37);
    vgrad(c, "#3240b6", "#1a2272");
    const lane = (k: number) => {
      c.beginPath();
      c.ellipse(760, 760, 330 + k * 44, 250 + k * 44, -0.2, 0, TAU);
    };
    lane(7);
    c.fillStyle = "#4553d2";
    c.fill();
    lane(0);
    c.fillStyle = d.theme.light;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.9)";
    c.lineWidth = 3;
    for (let k = 0; k <= 7; k++) {
      lane(k);
      c.stroke();
    }
    c.save();
    c.strokeStyle = d.theme.light;
    for (let i = 0; i < 26; i++) {
      c.globalAlpha = 0.25 + r() * 0.6;
      c.lineWidth = 2 + r() * 5;
      const y = 300 + r() * 250, x0 = r() * 200;
      c.beginPath();
      c.moveTo(x0, y);
      c.lineTo(x0 + 120 + r() * 300, y);
      c.stroke();
    }
    c.restore();
    c.save();
    c.translate(70, 520);
    c.transform(1, 0, -0.24, 1, 0, 0);
    text(c, "KIPRUN", 10, 10, `900 226px ${F.sans}`, d.theme.light, "left", -8);
    text(c, "KIPRUN", 0, 0, `900 226px ${F.sans}`, "#ffffff", "left", -8);
    c.restore();
    foil(a, (x) => {
      for (const [i, ch] of [..."0048"].entries()) digit(x, ch, 96 + i * 92 + (i > 1 ? 40 : 0), 640, 68, 120, 13);
      circle(x, 7, 96 + 2 * 92 + 16, 675);
      x.fill();
      circle(x, 7, 96 + 2 * 92 + 16, 725);
      x.fill();
    });
    text(c, "SECONDS, MADE FOR THE PAGE", 98, 806, `500 18px ${F.mono}`, "rgba(255,255,255,.8)", "left", 3);
    series(a, 2, F, "#ffffff");
    grain(a, 0.08, 37);
  },
  // SA–004 Kodex: a shield set in code, every character inside it inked, under a sealed check in foil. Swiss grid.
  kodex(a, d, F) {
    const c = a.c, r = rng(41);
    c.fillStyle = "#e9eedc";
    c.fillRect(0, 0, N, N);
    c.strokeStyle = "rgba(53,80,200,.16)";
    c.lineWidth = 1;
    for (let x = 64; x < N; x += 112) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, N);
      c.stroke();
    }
    const sh = new Path2D();
    sh.moveTo(262, 160);
    sh.lineTo(762, 160);
    sh.lineTo(762, 460);
    sh.bezierCurveTo(762, 640, 622, 750, 512, 812);
    sh.bezierCurveTo(402, 750, 262, 640, 262, 460);
    sh.closePath();
    const glyphs = "{}[]();=<>/01:#";
    c.font = `500 19px ${F.mono}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (let y = 110; y < 860; y += 24)
      for (let x = 30; x < N - 16; x += 16) {
        const inside = c.isPointInPath(sh, x, y);
        c.fillStyle = inside ? d.theme.deep : "rgba(53,80,200,.13)";
        c.fillText(glyphs[(r() * glyphs.length) | 0], x, y);
      }
    c.fillStyle = "#e9eedc";
    circle(c, 112, 512, 450);
    c.fill();
    emboss(a, (x) => {
      circle(x, 104, 512, 450);
      x.fill();
    }, 160);
    foil(a, (x) => {
      x.lineWidth = 6;
      circle(x, 96, 512, 450);
      x.stroke();
      x.lineWidth = 26;
      x.lineCap = "round";
      x.lineJoin = "round";
      x.beginPath();
      x.moveTo(462, 452);
      x.lineTo(500, 492);
      x.lineTo(570, 410);
      x.stroke();
    });
    text(c, "Kodex", 512, 948, `400 132px ${F.serif}`, d.theme.deep, "center", -2);
    text(c, "TRUST, COMPILED", 512, 996, `500 17px ${F.mono}`, d.theme.deep, "center", 6);
    series(a, 3, F, d.theme.deep);
    grain(a, 0.05, 41);
  },
  // SA–005 Uniqkey: a field of keys under a radar sweep; the keys it has crossed are lit, one is found in foil, and the
  // breaches show in coral.
  uniqkey(a, d, F) {
    const c = a.c, r = rng(53);
    vgrad(c, "#0e3c42", "#04181b");
    const key = (x: Ctx, kx: number, ky: number, s: number) => {
      x.beginPath();
      x.arc(kx - 12 * s, ky, 8 * s, 0, TAU);
      x.moveTo(kx - 4 * s, ky);
      x.lineTo(kx + 18 * s, ky);
      x.moveTo(kx + 11 * s, ky);
      x.lineTo(kx + 11 * s, ky + 7 * s);
      x.moveTo(kx + 17 * s, ky);
      x.lineTo(kx + 17 * s, ky + 5 * s);
      x.stroke();
    };
    const sweep = (x: number, y: number) => {
      const t = (Math.atan2(y - 520, x - 512) + 1.2 + TAU) % TAU;
      return t < 1.3 ? 1 - t / 1.3 : 0;
    };
    c.lineWidth = 2;
    c.lineCap = "round";
    for (let j = 0; j < 9; j++)
      for (let i = 0; i < 9; i++) {
        const kx = 120 + i * 98, ky = 150 + j * 82, lit = sweep(kx, ky);
        c.strokeStyle = `rgba(86,199,154,${0.22 + lit * 0.7})`;
        key(c, kx, ky, 1);
      }
    const g = c.createConicGradient(-1.2 - 1.3, 512, 520);
    g.addColorStop(0, "rgba(86,199,154,0)");
    g.addColorStop(1.3 / TAU, "rgba(86,199,154,.34)");
    g.addColorStop(1.3 / TAU + 0.001, "rgba(86,199,154,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, N, N);
    c.strokeStyle = "rgba(156,233,195,.25)";
    c.lineWidth = 1.5;
    for (const rr of [150, 300, 450]) {
      circle(c, rr, 512, 520);
      c.stroke();
    }
    c.fillStyle = "#ff6b5e";
    for (let i = 0; i < 7; i++) {
      circle(c, 5, 120 + ((r() * 9) | 0) * 98 - 12, 150 + ((r() * 9) | 0) * 82);
      c.fill();
    }
    foil(a, (x) => {
      x.lineWidth = 7;
      x.lineCap = "round";
      key(x, 650, 400, 3.4);
    });
    text(c, "UNIQKEY", 512, 930, `500 104px ${F.mono}`, d.theme.light, "center", 16);
    text(c, "BREACH RISK THAT FEELS REAL", 512, 982, `500 17px ${F.mono}`, "rgba(156,233,195,.75)", "center", 5);
    series(a, 4, F, d.theme.light);
    grain(a, 0.09, 53);
  },
  // SA–006 Anime Sports League: a manga splash. Focus lines, a halftone sun, the league count in a gold-foil burst,
  // the name in katakana down the side, and an obi strip round the left edge, as Japanese pressings have.
  "anime-sports-league"(a, d, F) {
    const c = a.c, r = rng(67);
    c.fillStyle = "#fff3d6";
    c.fillRect(0, 0, N, N);
    c.fillStyle = d.theme.mid;
    for (let y = 0; y < N; y += 18)
      for (let x = 150; x < N; x += 18) {
        const rad = 8.5 - Math.hypot(x - 610, y - 450) / 64;
        if (rad > 0.4) {
          circle(c, rad, x + ((y / 18) % 2) * 9, y);
          c.fill();
        }
      }
    c.fillStyle = "#16120f";
    for (let i = 0; i < 120; i++) {
      const t = r() * TAU, w = 0.002 + r() * 0.007, r0 = 290 + r() * 170;
      c.beginPath();
      c.moveTo(610 + Math.cos(t - w) * 1100, 450 + Math.sin(t - w) * 1100);
      c.lineTo(610 + Math.cos(t) * r0, 450 + Math.sin(t) * r0);
      c.lineTo(610 + Math.cos(t + w) * 1100, 450 + Math.sin(t + w) * 1100);
      c.fill();
    }
    const burst = (x: Ctx) => {
      x.beginPath();
      for (let i = 0; i < 36; i++) {
        const rr = i % 2 ? 176 : 238, t = (i / 36) * TAU;
        x.lineTo(610 + Math.cos(t) * rr, 450 + Math.sin(t) * rr);
      }
      x.closePath();
      x.fill();
    };
    foil(a, burst, GOLD);
    text(c, "5", 610, 536, `900 270px ${F.sans}`, d.theme.deep, "center");
    const leagues = ["#fc4b6c", "#f0a60f", "#2fb5ff", "#36c56b", "#9a5cff"];
    leagues.forEach((col, i) => {
      c.fillStyle = col;
      circle(c, 20, 470 + i * 70, 760);
      c.fill();
      c.strokeStyle = "#16120f";
      c.lineWidth = 4;
      c.stroke();
    });
    c.save();
    c.font = `900 58px "Yu Gothic", "Hiragino Sans", "Noto Sans JP", ${F.sans}`;
    c.fillStyle = "#16120f";
    c.textAlign = "center";
    [..."アニメスポーツリーグ"].forEach((ch, i) => c.fillText(ch, 950, 120 + i * 64));
    c.restore();
    c.save();
    c.font = `italic 900 84px ${F.sans}`;
    c.textAlign = "left";
    c.lineJoin = "round";
    c.lineWidth = 14;
    c.strokeStyle = "#ffffff";
    c.fillStyle = "#e8233f";
    for (const [s, y] of [["ANIME SPORTS", 896], ["LEAGUE", 978]] as const) {
      c.strokeText(s, 190, y);
      c.fillText(s, 190, y);
    }
    c.restore();
    c.fillStyle = d.theme.deep;
    c.fillRect(0, 0, 150, N);
    c.save();
    c.translate(75, N / 2);
    c.rotate(-Math.PI / 2);
    text(c, "5 LEAGUES  ·  FIRST PRESSING", 0, 8, `600 24px ${F.mono}`, "#ffffff", "center", 6);
    c.restore();
    text(c, "初回盤", 75, 110, `900 34px "Yu Gothic", "Hiragino Sans", ${F.sans}`, d.theme.highlight, "center");
    c.save();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2.5;
    circle(c, 24, 75, N - 128);
    c.stroke();
    c.lineWidth = 1;
    circle(c, 19, 75, N - 128);
    c.stroke();
    c.restore();
    text(c, "SA", 75, N - 122, `700 16px ${F.serif}`, "#ffffff", "center");
    text(c, "SA–006", 75, N - 70, `500 17px ${F.mono}`, "#ffffff", "center", 2);
    grain(a, 0.06, 67);
  },
};

// The disc's printed face, 512 px across 12 cm. Where it's left clear (alpha 0), the silver and its rainbow show.
function paintLabel(d: Disc, n: number, F: Fonts) {
  const cv = sheet(512), c = cv.getContext("2d")!;
  c.translate(256, 256);
  const cm = 256 / 6, R0 = 2.3 * cm, R1 = 5.86 * cm;
  const ring = (r0: number, r1: number, fill: string | CanvasGradient) => {
    c.beginPath();
    c.arc(0, 0, r1, 0, TAU);
    c.arc(0, 0, r0, 0, TAU, true);
    c.fillStyle = fill;
    c.fill();
  };
  const clear = (r0: number, r1: number) => {
    c.save();
    c.globalCompositeOperation = "destination-out";
    ring(r0, r1, "#000");
    c.restore();
  };
  const t = d.theme, legend = `SA–00${n + 1}  ·  ${d.title.toUpperCase()}  ·  ${d.year}  ·  SYED ALI  ·  `;
  let ink = "#ffffff";
  if (d.slug === "trace") {
    ring(R0, R1, "#1c2d92");
    clear(3.7 * cm, 4.5 * cm);
  } else if (d.slug === "animation-engine") {
    const g = c.createConicGradient(0, 0, 0);
    g.addColorStop(0, t.light);
    g.addColorStop(0.5, t.mid);
    g.addColorStop(1, t.light);
    ring(R0, R1, g);
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.moveTo(-0.5 * cm, -3.4 * cm);
    c.lineTo(0.75 * cm, -2.75 * cm);
    c.lineTo(-0.5 * cm, -2.1 * cm);
    c.fill();
    ink = "#0d0c17";
  } else if (d.slug === "kiprun") {
    ring(R0, R1, t.light);
    c.strokeStyle = t.deep;
    c.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      circle(c, (2.9 + k * 0.42) * cm);
      c.stroke();
    }
    ink = t.deep;
  } else if (d.slug === "kodex") {
    ring(R0, 4.9 * cm, "#f4f6ee");
    ink = t.deep;
  } else if (d.slug === "uniqkey") {
    ring(R0, R1, "#0b3237");
    c.strokeStyle = "rgba(86,199,154,.5)";
    for (const rr of [3, 3.8, 4.6]) {
      circle(c, rr * cm);
      c.stroke();
    }
    ink = t.light;
  } else {
    ring(R0, R1, "#fff3d6");
    c.fillStyle = t.mid;
    for (let y = -256; y < 256; y += 9)
      for (let x = -256; x < 256; x += 9) {
        const rad = 3.6 - Math.hypot(x, y + 60) / 50;
        if (rad > 0.3) {
          circle(c, rad, x, y);
          c.fill();
        }
      }
    clear(0, R0);
    clear(R1, 6.2 * cm);
    ink = t.deep;
  }
  const out = d.slug === "kodex" ? 5.4 : 5.25;
  arcText(c, legend.repeat(2), out * cm, `600 13px ${F.mono}`, d.slug === "kodex" ? "#1b1f2a" : ink, 0);
  return cv;
}

// The spine's paper, read up the left edge: catalogue number, title, the label.
function paintSpine(d: Disc, n: number, F: Fonts) {
  const cv = sheet(64, 1024), c = cv.getContext("2d")!;
  const ground = { trace: "#1c2d92", "animation-engine": "#0d0c17", kiprun: "#2a36a8", kodex: "#e9eedc", uniqkey: "#0b3237", "anime-sports-league": d.theme.deep }[d.slug] ?? d.theme.deep;
  const ink = d.slug === "kodex" ? d.theme.deep : "#ffffff";
  c.fillStyle = ground;
  c.fillRect(0, 0, 64, 1024);
  c.translate(32, 512);
  c.rotate(Math.PI / 2);
  text(c, `SA–00${n + 1}`, -470, 8, `500 20px ${F.mono}`, ink, "left", 3);
  text(c, d.title, 0, 12, `400 34px ${F.serif}`, ink, "center");
  text(c, "SYED ALI", 470, 8, `500 20px ${F.mono}`, ink, "right", 3);
  return cv;
}

// The black tray the disc sits in: a dished bed and the toothed rosette that grips the hole.
function paintTray() {
  const cv = sheet(512), c = cv.getContext("2d")!;
  c.fillStyle = "#151517";
  c.fillRect(0, 0, 512, 512);
  const cx = 256 + (DX / W) * 512 * 0.5, cy = 256, k = 512 / W;
  c.strokeStyle = "rgba(255,255,255,.06)";
  c.lineWidth = 2;
  circle(c, 6.05 * k, cx, cy);
  c.stroke();
  c.fillStyle = "#1d1d20";
  circle(c, 1.5 * k, cx, cy);
  c.fill();
  c.fillStyle = "#2a2a2e";
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * TAU;
    c.beginPath();
    c.moveTo(cx + Math.cos(t - 0.12) * 0.45 * k, cy + Math.sin(t - 0.12) * 0.45 * k);
    c.lineTo(cx + Math.cos(t) * 0.78 * k, cy + Math.sin(t) * 0.78 * k);
    c.lineTo(cx + Math.cos(t + 0.12) * 0.45 * k, cy + Math.sin(t + 0.12) * 0.45 * k);
    c.fill();
  }
  return cv;
}

// Hairlines and dust for the clear plastic: a black sheet with a few hundred faint strokes, most of them in two
// directions as wiping leaves them, some long arcs, and specks. Only seen where something bright is reflected.
function paintScratches() {
  const S = 1024, cv = sheet(S), c = cv.getContext("2d")!, r = rng(23);
  c.fillStyle = "#000";
  c.fillRect(0, 0, S, S);
  c.lineCap = "round";
  for (let i = 0; i < 120; i++) {
    const x = r() * S, y = r() * S, len = 12 + r() ** 2 * 170, a = (r() < 0.6 ? -0.5 : 0.95) + (r() - 0.5) * 0.35;
    c.strokeStyle = `rgba(255,255,255,${(0.05 + r() * 0.17).toFixed(3)})`;
    c.lineWidth = 0.5 + r() * 0.9;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    c.stroke();
  }
  for (let i = 0; i < 14; i++) {
    const rad = 120 + r() * 420, t = r() * TAU;
    c.strokeStyle = `rgba(255,255,255,${(0.05 + r() * 0.1).toFixed(3)})`;
    c.lineWidth = 0.6;
    c.beginPath();
    c.arc(r() * S, r() * S, rad, t, t + 0.25 + r() * 0.5);
    c.stroke();
  }
  for (let i = 0; i < 260; i++) {
    c.fillStyle = `rgba(255,255,255,${(0.08 + r() * 0.27).toFixed(3)})`;
    circle(c, 0.4 + r() * 1.1, r() * S, r() * S);
    c.fill();
  }
  return cv;
}

/* ── Shaders ───────────────────────────────────────────────────────────────────────────────────────────────────── */

const STUDIO = /* glsl */ `
const float PI = 3.14159265;
float softbox(vec3 r, vec3 d, float size, float blur) { return smoothstep(cos(size + blur), cos(max(size - blur * .3, 0.)), dot(r, d)); }
vec3 studio(vec3 r, vec3 L, float rough) {
  float b = .03 + rough * .9;
  vec3 c = mix(vec3(.18), vec3(.86, .87, .9), smoothstep(-.6, .9, r.y));
  c += 2.2 * softbox(normalize(r * vec3(1., .28, 1.)), normalize(vec3(-.85, 0., .55)), .16, b);
  c += 1.4 * softbox(normalize(r * vec3(.3, 1., 1.)), normalize(vec3(0., .9, .45)), .12, b);
  c += 1.1 * softbox(normalize(r * vec3(1., .28, 1.)), normalize(vec3(.9, 0., .45)), .08, b);
  c += 6. * softbox(r, L, .06, b * .7);
  return c;
}`;

// Clear polystyrene: it only adds what it reflects, never darkens. Made real the way a jewel case in a rack looks (the
// photo Syed sent): the room in its faces, a window with its glazing bars sliding across the lid, a bright line where
// the moulded bevel runs round each pane, the thick clear edges lit from inside, and hairline scratches and dust that
// only show inside the glare. The pointer's light is a pin-point with a soft sheen round it.
const plasticVertex = /* glsl */ `
varying vec3 vN, vViewPos, vNo; varying vec2 vUv;
void main() { vUv = uv; vNo = normal; vec4 mv = modelViewMatrix * vec4(position, 1.); vViewPos = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }`;
const plasticFragment = /* glsl */ `
uniform vec3 uLight; uniform float uFade; uniform sampler2D uScratch;
varying vec3 vN, vViewPos, vNo; varying vec2 vUv;
${STUDIO}
float pane(vec3 r, vec3 L) {
  vec3 w = normalize(vec3(-.42, .5, .76) + (L - normalize(vec3(-.5, .6, 1.))) * .3);
  vec3 t1 = normalize(cross(vec3(0., 1., 0.), w)), t2 = cross(w, t1);
  float a = dot(r, t1), b = dot(r, t2);
  float inside = step(0., dot(r, w)) * smoothstep(.34, .3, abs(a)) * smoothstep(.25, .21, abs(b));
  float bars = clamp(smoothstep(.014, .004, abs(a)) + smoothstep(.014, .004, abs(b)), 0., 1.);
  return inside * (1. - .9 * bars);
}
void main() {
  vec3 n = normalize(vN), v = normalize(-vViewPos), L = normalize(uLight), rf = reflect(-v, n);
  float F = .05 + .95 * pow(1. - abs(dot(n, v)), 5.);
  float k = max(dot(rf, L), 0.);
  float face = step(.5, abs(vNo.z));
  float e = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
  float bevel = face * (1. - smoothstep(0., .014, e));
  float glare = pane(rf, L);
  float scr = texture2D(uScratch, vUv * vec2(1.136, 1.)).r;
  vec3 c = studio(rf, L, .02) * (F * .7 + .006) + glare * (F * 1.1 + .05) * face + pow(k, 700.) * 2.4 + pow(k, 16.) * .1;
  // The long glare a lid always carries: a soft diagonal band and a thin one beside it, sliding as the pointer moves.
  float d = vUv.x * .82 + vUv.y * .57, o = .62 + (L.x + .5) * .32;
  float streak = face * (exp(-pow((d - o) * 7., 2.)) * .2 + exp(-pow((d - o - .21) * 26., 2.)) * .11) * (.55 + F);
  c += vec3(.97, .98, 1.) * streak;
  c += scr * (pow(k, 5.) * 1.1 + glare * .22 + streak * 1.4) * face;
  c += vec3(.94, .96, 1.) * ((1. - face) * (.07 + .55 * F) + bevel * (.12 + .9 * pow(k, 3.)));
  gl_FragColor = vec4(c * uFade, 0.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// Bill Guo's hover morph, on a cover: the print breaks into ink grain along a ragged front and comes back as the
// project's own screen. The front is a blotchy noise with grain in it, so it eats the print unevenly, and the specks
// flicker as it passes. Spliced into the cover's standard material (onBeforeCompile).
const MORPH = /* glsl */ `
uniform float uMorph; uniform sampler2D uShot; uniform vec4 uShotRect;
float mh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float mn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(mh(i), mh(i + vec2(1., 0.)), f.x), mix(mh(i + vec2(0., 1.)), mh(i + vec2(1.)), f.x), f.y); }
float morphInk(inout vec3 col, vec2 uv) {
  if (uMorph <= 0.) return 0.;
  float g = .55 * mn(uv * 6.) + .3 * mn(uv * 23.) + .15 * mh(floor(uv * 420.));
  float front = uMorph * 1.24 - .12;
  float reveal = 1. - smoothstep(front - .05, front + .01, g);
  vec3 shot = pow(texture2D(uShot, uShotRect.xy + uv * uShotRect.zw).rgb, vec3(1.15)) * .86;
  float band = 1. - smoothstep(0., .12, abs(g - front));
  vec3 base = mix(col, shot, reveal);
  float lum = dot(base, vec3(.299, .587, .114));
  float speck = step(lum + (mh(floor(uv * 300.) + floor(uMorph * 24.)) - .5) * .9, .55);
  col = mix(base, mix(vec3(.93, .92, .9), vec3(.05), speck), band * .92);
  return reveal;
}`;

// The disc's face: printed ink where the label has it; elsewhere the silver, and in the silver the rainbow the
// grooves throw (spectral() and grating() from "Coins & Notes"; a CD's track pitch is 1.6 µm).
const discVertex = /* glsl */ `
varying vec3 vObjPos, vViewPos, vN, vRad; varying vec2 vUv;
void main() {
  vObjPos = position; vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vViewPos = mv.xyz; vN = normalMatrix * normal; vRad = normalMatrix * vec3(position.xy, 0.);
  gl_Position = projectionMatrix * mv;
}`;
const discFragment = /* glsl */ `
uniform sampler2D uLabel; uniform vec3 uLight, uGround; uniform float uFog;
varying vec3 vObjPos, vViewPos, vN, vRad; varying vec2 vUv;
${STUDIO}
vec3 spectral(float w) {
  float x = clamp((w - 400.) / 300., 0., 1.);
  vec3 y = vec3(3.54541723, 2.86670055, 2.29421995) * (x - vec3(.69548916, .49416934, .28269708));
  return max(1. - y * y - vec3(.02320775, .15936245, .53520021), 0.) * step(400., w) * step(w, 700.);
}
vec3 grating(vec3 t, vec3 n, vec3 V, vec3 L, float d) {
  vec3 H = normalize(L + V);
  float u = abs(dot(t, L + V));
  float lobe = exp(-pow(dot(H, normalize(cross(n, t))), 2.) * 10.) * smoothstep(-.1, .25, dot(n, L));
  vec3 c = vec3(0.);
  for (int m = 1; m <= 3; m++) c += spectral(d * u / float(m)) / float(m);
  return c * lobe;
}
void main() {
  float r = length(vObjPos.xy);
  vec3 n = normalize(vN) * (gl_FrontFacing ? 1. : -1.);
  vec3 v = normalize(-vViewPos), L = normalize(uLight), rf = reflect(-v, n);
  vec3 radial = vRad / max(length(vRad), 1e-4);
  float NoV = clamp(dot(n, v), 1e-3, 1.);
  vec3 env = studio(rf, L, .05);
  vec3 bow = grating(radial, n, v, L, 1600.) * 2.4 + grating(radial, n, v, normalize(vec3(-.8, .3, .6)), 1600.) * 1.2 + grating(radial, n, v, normalize(vec3(.7, .5, .5)), 1600.) * .8;
  vec3 silver = env * vec3(.84, .85, .88) * .8 + bow;
  vec3 clear = vec3(.66, .68, .7) * (.62 + .25 * env.g) + env * .3 * pow(1. - NoV, 3.);
  vec3 col = mix(clear, silver, smoothstep(1.96, 2.02, r));
  col = mix(col, clear * 1.06, smoothstep(1.62, 1.66, r) * (1. - smoothstep(1.9, 1.94, r)) * .6); // the stacking ring
  vec4 ink = texture2D(uLabel, vUv);
  vec3 lit = ink.rgb * (.66 + .42 * max(dot(n, L), 0.)) + env * .035;
  col = mix(col, lit, ink.a * smoothstep(2.26, 2.3, r));
  col += pow(max(dot(rf, L), 0.), 500.) * 1.2;
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uGround, uFog);
}`;

const shadowVertex = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const shadowFragment = /* glsl */ `
uniform vec2 uOff; uniform float uAlpha; varying vec2 vUv;
void main() { vec2 q = (vUv - .5) * 2. - uOff; float a = pow(smoothstep(1., 0., length(q * vec2(.92, 1.))), 1.8); gl_FragColor = vec4(0., 0., 0., a * uAlpha); }`;

/* ── The scene ─────────────────────────────────────────────────────────────────────────────────────────────────── */

// Where each case hangs (x, y, z in cm) and how it's turned, and the half-size of the frame it fits. Wide: the frame is
// the first screen beside the side column with the name on its left, so the cases float to the right of the name and
// low beneath it, the far ones in the haze and cut by the edges, as Ethan Chng's photos are. Compact (a phone): a loose
// cluster under the name.
type Layout = { places: number[][]; half: number[] };
const WIDE: Layout = {
  places: [
    [8, 6, -9, 0.08, 0.4, -0.04],
    [19, 11, 1, -0.06, -0.42, 0.04],
    [37, 21, -20, -0.12, -0.3, 0.06],
    [29, -4, -4, 0.06, -0.34, 0.03],
    [-25, -19, -10, 0.12, 0.45, 0.05],
    [-13, -22, -16, -0.08, 0.3, -0.05],
  ],
  half: [36, 26.5],
};
const COMPACT: Layout = {
  places: [
    [-13, 7, 4, 0.1, 0.42, -0.05],
    [12, 10, -7, -0.08, -0.48, 0.05],
    [17, -8, 1, 0.08, -0.36, 0.04],
    [-1, -5, 9, -0.05, 0.22, -0.03],
    [-17, -12, -4, 0.14, 0.52, 0.06],
    [3, 17, -15, -0.16, -0.14, 0.07],
  ],
  half: [28, 22.5],
};
const TAN = Math.tan(Math.PI / 12); // the camera's half field of view, 15°

function pageColour() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--color-sheet").trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : "#f5f5f5";
}
const font = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

export function mount(canvas: HTMLCanvasElement, box: HTMLElement, discs: Disc[], links: (HTMLElement | null)[]) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  const fog = new THREE.Fog(pageColour(), 90, 210);
  scene.fog = fog;
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  scene.add(key, key.target);

  const light = new THREE.Vector3(-0.5, 0.6, 1), lightAim = light.clone();
  const lean = new THREE.Vector2(), leanAim = new THREE.Vector2();
  const shared = { uLight: { value: light }, uGround: { value: new THREE.Vector3() } };
  const made: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (made.push(x), x);
  const theme = () => {
    const hex = pageColour();
    (scene.fog as THREE.Fog).color.set(hex);
    const n = parseInt(hex.slice(1), 16);
    shared.uGround.value.set(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };
  theme();

  const box3 = (w: number, h: number, d: number) => keep(new THREE.BoxGeometry(w, h, d));
  const trayGeo = box3(W - 0.24, H - 0.24, TRAY - 0.08), shellGeo = box3(W, H, TRAY), lidGeo = box3(W, H, LID);
  const bookGeo = keep(new THREE.PlaneGeometry(BOOK, BOOK)), trayFaceGeo = keep(new THREE.PlaneGeometry(W - 0.4, H - 0.4)), spineGeo = keep(new THREE.PlaneGeometry(TRAY - 0.12, H - 0.3));
  const discGeo = keep(new THREE.RingGeometry(0.75, 6, 160, 1)), rimGeo = keep(new THREE.CylinderGeometry(6, 6, 0.12, 160, 1, true).rotateX(Math.PI / 2));
  const shadowGeo = keep(new THREE.PlaneGeometry(20, 18));
  const trayTex = keep(new THREE.CanvasTexture(paintTray()));
  trayTex.colorSpace = THREE.SRGBColorSpace;
  const trayMat = keep(new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.38 }));
  const trayFaceMat = keep(new THREE.MeshStandardMaterial({ map: trayTex, roughness: 0.42 }));
  const rimMat = keep(new THREE.MeshStandardMaterial({ color: 0xcfd3d9, metalness: 1, roughness: 0.28 }));
  const scratch = { value: keep(new THREE.CanvasTexture(paintScratches())) };
  scratch.value.wrapS = scratch.value.wrapT = THREE.RepeatWrapping;
  scratch.value.anisotropy = maxAniso;

  const hitGeo = box3(W, H, TRAY + LID), hitMat = keep(new THREE.MeshBasicMaterial({ visible: false }));
  const targets: THREE.Object3D[] = [];

  const cases = discs.map((d, i) => {
    const [x, y, z, rx, ry, rz] = COMPACT.places[i % COMPACT.places.length];
    const root = new THREE.Group(), lid = new THREE.Group(), disc = new THREE.Group(), spin = new THREE.Group();
    const fade = { value: 1 };
    const plastic = keep(new THREE.ShaderMaterial({
      vertexShader: plasticVertex, fragmentShader: plasticFragment, uniforms: { uLight: shared.uLight, uFade: fade, uScratch: scratch }, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    }));
    const book = keep(new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.7, bumpScale: 0.6 }));
    const morphU = { value: 0 }, shotU = { value: null as THREE.Texture | null }, shotRect = { value: new THREE.Vector4(0, 0, 1, 1) };
    book.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uMorph: morphU, uShot: shotU, uShotRect: shotRect });
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>\n${MORPH}`)
        .replace("#include <map_fragment>", "#include <map_fragment>\nfloat reveal = 0.;\n#ifdef USE_MAP\nreveal = morphInk(diffuseColor.rgb, vMapUv);\n#endif")
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .6, reveal);")
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0., reveal);");
    };
    const spineMat = keep(new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.55 }));
    const label = { value: null as THREE.Texture | null };
    const fog = { value: 0 };
    const discMat = keep(new THREE.ShaderMaterial({ vertexShader: discVertex, fragmentShader: discFragment, uniforms: { uLabel: label, uLight: shared.uLight, uGround: shared.uGround, uFog: fog } }));
    const shadowMat = keep(new THREE.ShaderMaterial({ vertexShader: shadowVertex, fragmentShader: shadowFragment, transparent: true, depthWrite: false, uniforms: { uOff: { value: new THREE.Vector2() }, uAlpha: { value: 0.16 } } }));

    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.z = -TRAY / 2;
    const bed = new THREE.Mesh(trayFaceGeo, trayFaceMat);
    bed.position.z = -0.035;
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-W / 2 + 0.115, 0, -TRAY / 2);
    spine.rotation.y = -Math.PI / 2;
    const shell = new THREE.Mesh(shellGeo, plastic);
    shell.position.z = -TRAY / 2;
    // The disc sits on the tray under the booklet; `spin` turns it on its own axis.
    const face = new THREE.Mesh(discGeo, discMat);
    spin.add(face, new THREE.Mesh(rimGeo, rimMat));
    disc.add(spin);
    disc.position.set(DX, 0, 0.03);
    // The lid swings on the hinge down the left edge.
    lid.position.set(-W / 2, 0, 0);
    const front = new THREE.Mesh(lidGeo, plastic);
    front.position.set(W / 2, 0, LID / 2 + 0.01);
    const booklet = new THREE.Mesh(bookGeo, book);
    booklet.position.set(W / 2 + DX, 0, LID - 0.06);
    lid.add(booklet, front);
    // What the pointer is tested against: the case's volume, and the disc wherever it has slid to.
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.position.z = (LID - TRAY) / 2;
    hit.userData.i = face.userData.i = i;
    targets.push(hit, face);
    root.add(tray, bed, spine, shell, disc, lid, hit);
    root.visible = false;
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.renderOrder = -1;
    shadow.visible = false;
    scene.add(root, shadow);
    return { d, i, root, lid, disc, spin, book, spineMat, label, fog, fade, shadow, shadowMat, x, y, z, rx, ry, rz, open: 0, out: 0, lift: 0, speed: 0, since: 0, enter: 0, enterAt: 0, morph: 0, morphU, shotU, shotRect, shot: false };
  });

  let pointed = -1, focused = -1, hovered = -1, touch = false, visible = true, dead = false, raf = 0, last = 0, squeeze = 1, front = 0;
  let layout = COMPACT;
  const corner = new THREE.Vector3(), ndc = new THREE.Vector2(), ray = new THREE.Raycaster();

  function pose(c: (typeof cases)[number]) {
    const k = c.lift, e = c.enter, back = (1 - e) * 36;
    const keepTurn = 1 - 0.8 * k;
    // Pointed at, it comes in front of every other case, however far back it hangs, and in from the frame's edges far
    // enough that the case and its disc, once out, are seen whole.
    const bx = c.x * squeeze, by = c.y / Math.sqrt(squeeze), hz = Math.max(c.z + 11, front);
    const vy = (camera.position.z - hz) * TAN, vx = vy * camera.aspect;
    const hx = Math.min(Math.max(bx * 0.85, -vx + 8), vx - 15), hy = Math.min(Math.max(by * 0.88, -vy + 8.5), vy - 8.5);
    c.root.position.set(bx + (hx - bx) * k, by + (hy - by) * k - (1 - e) * 4, c.z + (hz - c.z) * k - back);
    // Pointed at, it comes forward and turns its open side a little toward you.
    c.root.rotation.set(c.rx * keepTurn + 0.06 * k + lean.x * (1 + k), c.ry * keepTurn - 0.2 * k + lean.y * (1 + k), c.rz * keepTurn);
    c.lid.rotation.y = -0.5 * c.open;
    c.disc.position.set(DX + 6.6 * c.out, 0, 0.03 + 0.95 * c.out);
    c.disc.rotation.y = -0.22 * c.out;
    const depth = camera.position.z - c.root.position.z;
    const f = Math.min(1, Math.max(0, (depth - fog.near) / (fog.far - fog.near)));
    c.fog.value = f;
    c.fade.value = 1 - f;
    c.shadow.position.set(c.root.position.x - light.x * 1.6, c.root.position.y - light.y * 1.6 - 1.4, c.root.position.z - 7);
    c.shadowMat.uniforms.uAlpha.value = 0.16 * (1 - f) * e;
  }

  // Each case's link sits over it at rest: it's what keyboard focus outlines. The pointer is tested in 3D instead.
  function placeLink(c: (typeof cases)[number]) {
    const a = links[c.i];
    if (!a) return;
    const saved = [c.lift, c.open, c.out, c.enter];
    [c.lift, c.open, c.out, c.enter] = [0, 0, 0, 1];
    pose(c);
    c.root.updateMatrixWorld(true);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const w = box.clientWidth, h = box.clientHeight;
    for (const sx of [-1, 1])
      for (const sy of [-1, 1])
        for (const sz of [-TRAY, LID]) {
          corner.set((sx * W) / 2, (sy * H) / 2, sz).applyMatrix4(c.root.matrixWorld).project(camera);
          const px = (corner.x * 0.5 + 0.5) * w, py = (-corner.y * 0.5 + 0.5) * h;
          x0 = Math.min(x0, px);
          y0 = Math.min(y0, py);
          x1 = Math.max(x1, px);
          y1 = Math.max(y1, py);
        }
    [c.lift, c.open, c.out, c.enter] = saved;
    pose(c);
    Object.assign(a.style, { visibility: c.enterAt ? "visible" : "hidden", width: `${x1 - x0}px`, height: `${y1 - y0}px`, transform: `translate(${x0}px, ${y0}px)` });
  }
  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    layout = innerWidth >= 1024 ? WIDE : COMPACT;
    front = Math.max(...layout.places.map((p) => p[2])) + 4;
    for (const c of cases) [c.x, c.y, c.z, c.rx, c.ry, c.rz] = layout.places[c.i % layout.places.length];
    // A narrow frame (a phone) gathers the cluster in: narrower, and a little taller.
    squeeze = layout === WIDE ? 1 : Math.min(1, Math.max(0.6, camera.aspect / 1.25));
    camera.position.set(0, 0, Math.max(layout.half[1] / Math.sqrt(squeeze) / TAN, (layout.half[0] * squeeze) / (TAN * camera.aspect)));
    camera.updateProjectionMatrix();
    // The haze starts just behind the nearest cases and thickens over a metre.
    fog.near = camera.position.z + 2;
    fog.far = camera.position.z + 120;
    scene.updateMatrixWorld(true);
    cases.forEach(placeLink);
    wake();
  }

  function wake() {
    if (!raf && visible && !dead) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }
  const ease = (t: number) => 1 - (1 - t) ** 3;
  function tick(now: number) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    const k = still ? 1 : 1 - Math.exp(-dt * 6);
    light.lerp(lightAim, k);
    lean.lerp(leanAim, k);
    let busy = light.distanceToSquared(lightAim) > 1e-6 || lean.distanceToSquared(leanAim) > 1e-8, lit = 0;
    for (const c of cases) {
      if (!c.enterAt) continue;
      c.enter = still ? 1 : ease(Math.min(1, Math.max(0, (now - c.enterAt) / 1100)));
      if (c.enter < 1) busy = true;
      const on = hovered === c.i;
      if (on && !c.since) c.since = now;
      if (!on) c.since = 0;
      // The lid lifts first; the disc follows a beat later, and spins while it's out.
      const step = (v: number, to: number, rate: number) => (still ? to : v + (to - v) * (1 - Math.exp(-dt * rate)));
      c.lift = step(c.lift, on ? 1 : 0, 9);
      c.open = step(c.open, on ? 1 : 0, 11);
      c.out = step(c.out, on && now - c.since > 110 ? 1 : 0, 6.5);
      c.speed = step(c.speed, on && !still ? 2.6 : 0, 3);
      c.morph = step(c.morph, on && c.shot ? 1 : 0, 3.2);
      c.morphU.value = c.morph;
      c.spin.rotation.z -= c.speed * dt;
      const settled = [c.lift, c.open, c.out, c.morph].every((v) => Math.abs(v - Math.round(v)) < 1e-3) && c.speed < 1e-3;
      if (!settled || on) busy = true;
      // As it comes forward, the paper's texture comes up and the foil takes more of the light.
      c.book.bumpScale = 0.5 + 1.4 * c.lift;
      c.book.envMapIntensity = 0.8 + 0.5 * c.lift;
      lit = Math.max(lit, c.lift);
      pose(c);
    }
    key.position.set(light.x * 40, light.y * 40, 60);
    key.intensity = 1.5 + 0.7 * lit;
    renderer.render(scene, camera);
    if (busy) wake();
  }

  function setHover() {
    const next = pointed >= 0 ? pointed : focused;
    if (pointed >= 0) box.dataset.cursor = "View project";
    else delete box.dataset.cursor;
    if (next === hovered) return;
    hovered = next;
    wake();
  }
  // The case under the pointer, nearest first: its volume, or its disc wherever that has slid to.
  function pick(x: number, y: number) {
    const r = box.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(targets, false).find((h) => cases[h.object.userData.i].enterAt);
    return hit ? (hit.object.userData.i as number) : -1;
  }
  const move = (e: PointerEvent) => {
    if (!visible || e.pointerType === "touch") return;
    const r = box.getBoundingClientRect();
    const nx = Math.max(-1.6, Math.min(1.6, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1.6, Math.min(1.6, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    lightAim.set(nx * 1.3, -ny * 1.3, 1);
    leanAim.set(still ? 0 : ny * 0.04, still ? 0 : nx * 0.06);
    pointed = pick(e.clientX, e.clientY);
    setHover();
    wake();
  };
  const down = (e: PointerEvent) => {
    touch = e.pointerType === "touch";
  };
  // A press goes in through the case's link; on touch the first tap opens the case and the second goes in.
  const press = (e: MouseEvent) => {
    const i = pick(e.clientX, e.clientY);
    if (touch && hovered !== i) {
      pointed = i;
      setHover();
      return;
    }
    if (i >= 0) links[i]?.click();
  };
  const leave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointed = -1;
    setHover();
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    wake();
  });
  io.observe(box);
  const ro = new ResizeObserver(resize);
  ro.observe(box);
  const onTheme = () => {
    theme();
    wake();
  };
  addEventListener("pointermove", move, { passive: true });
  addEventListener("themechange", onTheme);
  box.addEventListener("pointerdown", down);
  box.addEventListener("click", press);
  box.addEventListener("pointerleave", leave);
  resize();

  // Press them one at a time, nearest first, a frame apart, and bring each one up out of the haze as it's done.
  (async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const F: Fonts = { serif: font("--font-baskerville", "Georgia, serif"), sans: font("--font-geist", "system-ui, sans-serif"), mono: font("--font-geist-mono", "ui-monospace, monospace") };
    await Promise.all([`italic 400 40px ${F.serif}`, `400 40px ${F.serif}`, `800 40px ${F.sans}`, `500 20px ${F.mono}`].map((f) => document.fonts.load(f).catch(() => {})));
    let at = 0;
    for (const c of [...cases].sort((a, b) => b.z - a.z)) {
      await frame();
      if (dead) return;
      const a = art();
      COVERS[c.d.slug]?.(a, c.d, F);
      const map = keep(new THREE.CanvasTexture(a.print)), finish = keep(new THREE.CanvasTexture(a.finish));
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = finish.anisotropy = maxAniso;
      Object.assign(c.book, { map, bumpMap: finish, roughnessMap: finish, metalnessMap: finish, color: new THREE.Color(0xffffff), roughness: 1, metalness: 1 });
      c.book.needsUpdate = true;
      const lab = keep(new THREE.CanvasTexture(paintLabel(c.d, c.i, F)));
      lab.colorSpace = THREE.SRGBColorSpace;
      lab.anisotropy = maxAniso;
      c.label.value = lab;
      const sp = keep(new THREE.CanvasTexture(paintSpine(c.d, c.i, F)));
      sp.colorSpace = THREE.SRGBColorSpace;
      Object.assign(c.spineMat, { map: sp, color: new THREE.Color(0xffffff) });
      c.spineMat.needsUpdate = true;
      for (const t of [map, finish, lab, sp]) renderer.initTexture(t);
      a.print.width = a.finish.width = 0; // uploaded; free the canvases
      if (c.d.shot)
        new THREE.TextureLoader()
          .loadAsync(c.d.shot)
          .then((t) => {
            if (dead) return void t.dispose();
            keep(t);
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = maxAniso;
            const img = t.image as { width: number; height: number };
            const r = img.width / img.height;
            if (r >= 1) c.shotRect.value.set((1 - 1 / r) / 2, 0, 1 / r, 1);
            else c.shotRect.value.set(0, 1 - r, 1, r);
            renderer.initTexture(t);
            c.shotU.value = t;
            c.shot = true;
          })
          .catch(() => {});
      c.root.visible = c.shadow.visible = true;
      at = Math.max(performance.now(), at + 120);
      c.enterAt = at;
      placeLink(c);
      wake();
    }
  })();

  return {
    focus(i: number) {
      focused = i;
      setHover();
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("themechange", onTheme);
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("click", press);
      box.removeEventListener("pointerleave", leave);
      made.forEach((m) => m.dispose());
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
