/* The stamps' carvings: each project's motif drawn as relief layers on a canvas with the site's own fonts, for
   scripts/stamps/bake.py to carve into a piece of rock. A layer is a white mask on black and how it's modelled:
     raise   a plateau up to `top`, its shoulders rounded over `r` px
     dome    a rounded swell up to `top` (a ball, a bead)
     add     a swell of `top` added to whatever is under it (a seam on the ball)
     cut     a V-cut groove `top` deep, its walls running `r` px from its edge to its bottom
     panel   the ground lowered by `top` and dressed with a point chisel (bake.py pits it)
   Layers are applied in order, later ones on top. Every subject sits in the same carved cartouche: a fillet and a string of
   beads with a leafy vine growing up between them to a rosette at its head, and a ribbon across its foot cut with the
   number and name, so no mark stands on the stone alone. The subject is drawn inside the cartouche, fitted to it and clipped by it.
   Plain script, top level on purpose, so the bake can add it to any page. */
const FW = 676, FH = 870, S = 1.5; // the field inside the box's margin, px, painted at 1.5x
const GROUND = 0.2;
const TAU = Math.PI * 2;
const C = [338, 432], OUT = [246, 310], IN = [206, 270]; // the cartouche: its centre, its outer and inner ovals
let FIT = null; // while a subject is drawn: how it's fitted into the cartouche

function layer(kind, top, r, draw, w = FW, h = FH) {
  const cv = Object.assign(document.createElement("canvas"), { width: Math.round(w * S), height: Math.round(h * S) });
  const c = cv.getContext("2d");
  c.fillStyle = "#000";
  c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(S, 0, 0, S, 0, 0);
  if (FIT) {
    c.beginPath();
    c.ellipse(C[0], C[1], IN[0] - 5, IN[1] - 5, 0, 0, TAU);
    c.clip();
    c.translate(FIT.x, FIT.y);
    c.scale(FIT.k, FIT.k);
    c.translate(-FIT.cx, -FIT.cy);
  }
  c.fillStyle = c.strokeStyle = "#fff";
  c.lineCap = c.lineJoin = "round";
  draw(c);
  return { kind, top, r, url: cv.toDataURL("image/png") };
}
const rrect = (c, x, y, w, h, r) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
};
const disc = (c, x, y, r) => {
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
};
const ellipse = (c, x, y, rx, ry, a = 0) => {
  c.beginPath();
  c.ellipse(x, y, rx, ry, a, 0, TAU);
};
const star = (c, x, y, r, k = 0.38, n = 4) => {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const q = i % 2 ? r * k : r, a = -Math.PI / 2 + (i * Math.PI) / n;
    c[i ? "lineTo" : "moveTo"](x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  c.closePath();
};
// A leaf, added to the current path: a pointed oval from its stalk at (x, y) along angle a.
const leaf = (c, x, y, a, len, wid) => {
  const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
  c.moveTo(x, y);
  c.quadraticCurveTo(x + ux * len * 0.5 + vx * wid, y + uy * len * 0.5 + vy * wid, x + ux * len, y + uy * len);
  c.quadraticCurveTo(x + ux * len * 0.5 - vx * wid, y + uy * len * 0.5 - vy * wid, x, y);
};
// Draws once, then again mirrored about x = cx.
const both = (cx, fn) => (c) => {
  fn(c);
  c.save();
  c.translate(2 * cx, 0);
  c.scale(-1, 1);
  fn(c);
  c.restore();
};
// Points round an oval (centred on 0, 0) every `gap` px along it.
function round(rx, ry, gap) {
  const pts = [];
  let acc = gap / 2, px = rx, py = 0;
  for (let t = 0; t < TAU; t += 0.002) {
    const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
    acc += Math.hypot(x - px, y - py);
    [px, py] = [x, y];
    if (acc >= gap) {
      acc -= gap;
      pts.push([x, y]);
    }
  }
  return pts;
}

// The cartouche: the dressed panel it sinks into the stone (applied before the subject) and its frame (after).
function cartouche(d, n, F) {
  const [cx, cy] = C;
  const mid = [(OUT[0] + IN[0]) / 2, (OUT[1] + IN[1]) / 2];
  // On the band's middle at angle t, `off` px out along its normal; and which way the band runs there as t rises.
  const at = (t, off = 0) => {
    const nx = Math.cos(t) * mid[1], ny = Math.sin(t) * mid[0], nl = Math.hypot(nx, ny);
    return [cx + Math.cos(t) * mid[0] + (nx / nl) * off, cy + Math.sin(t) * mid[1] + (ny / nl) * off];
  };
  const dir = (t) => Math.atan2(Math.cos(t) * mid[1], -Math.sin(t) * mid[0]);
  // The vine grows up the left side from under the ribbon to under the lotus as t rises, and is mirrored up the right. A
  // leaf grows from each of its crests, leaning out; a berry hangs in each bay the leaves leave empty.
  const T0 = Math.PI / 2 + 0.7, T1 = (3 * Math.PI) / 2 - 0.12, WAVE = 22, AMP = 6;
  const crests = [];
  for (let k = 0; ; k++) {
    const t = T0 + (k + 0.5) * (Math.PI / WAVE);
    if (t > T1) break;
    crests.push([t, k % 2 ? -1 : 1]);
  }
  const lean = (t, side) => dir(t) - side * 0.5;

  // The rosette at its head, set into the band like a keystone, where the two vines meet: an open flower seen from above,
  // eight round petals about a boss.
  const fx = cx, fy = cy - mid[1], PETALS = 8;

  // The ribbon across its foot, sagging a little, its ends folded back and down behind it.
  const ry = cy + OUT[1] - 14, rw = 186, rh = 44, sag = 14;
  const band = (c, w, h) => {
    c.beginPath();
    c.moveTo(cx - w, ry - h / 2);
    c.quadraticCurveTo(cx, ry - h / 2 + sag, cx + w, ry - h / 2);
    c.lineTo(cx + w, ry + h / 2);
    c.quadraticCurveTo(cx, ry + h / 2 + sag, cx - w, ry + h / 2);
    c.closePath();
  };
  const words = d.words ?? `${String(n + 1).padStart(2, "0")}  ·  ${d.title.toUpperCase()}`;

  const panel = layer("panel", 0.06, 3, (c) => (ellipse(c, cx, cy, OUT[0] - 2, OUT[1] - 2), c.fill()));
  const frame = [
    // The fillet round its outside, a fine line cut inside it, and a string of beads round its inside.
    layer("raise", 0.44, 2.8, (c) => {
      c.lineWidth = 9;
      ellipse(c, cx, cy, OUT[0], OUT[1]);
      c.stroke();
    }),
    layer("cut", 0.05, 0.8, (c) => {
      c.lineWidth = 1.6;
      ellipse(c, cx, cy, OUT[0] - 9, OUT[1] - 9);
      c.stroke();
    }),
    layer("dome", 0.42, 0, (c) => {
      for (const [x, y] of round(IN[0], IN[1], 12.5)) (disc(c, cx + x, cy + y, 4.3), c.fill());
    }),
    // The vine, its leaves and the leaves' midribs, its berries.
    layer("raise", 0.33, 1.6, both(cx, (c) => {
      c.lineWidth = 4.4;
      c.beginPath();
      for (let t = T0; t <= T1; t += 0.004) c.lineTo(...at(t, AMP * Math.sin((t - T0) * WAVE)));
      c.stroke();
    })),
    layer("raise", 0.38, 2.2, both(cx, (c) => {
      c.beginPath();
      for (const [t, side] of crests) leaf(c, ...at(t, AMP * side), lean(t, side), 17, 9);
      c.fill();
    })),
    layer("cut", 0.05, 0.8, both(cx, (c) => {
      c.lineWidth = 1.5;
      c.beginPath();
      for (const [t, side] of crests) {
        const [x, y] = at(t, AMP * side), a = lean(t, side);
        c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
        c.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13);
      }
      c.stroke();
    })),
    layer("dome", 0.4, 0, both(cx, (c) => {
      for (const [t, side] of crests) {
        const tb = t + Math.PI / WAVE / 2;
        if (tb > T1) continue;
        disc(c, ...at(tb, -side * 9), 3.4);
        c.fill();
      }
    })),
    layer("raise", 0.5, 2.6, (c) => {
      for (let i = 0; i < PETALS; i++) {
        const a = ((i + 0.5) / PETALS) * TAU;
        disc(c, fx + Math.cos(a) * 15, fy + Math.sin(a) * 15, 9.5);
        c.fill();
      }
    }),
    layer("cut", 0.06, 1, (c) => {
      c.lineWidth = 1.8;
      c.beginPath();
      for (let i = 0; i < PETALS; i++) {
        const a = (i / PETALS) * TAU;
        c.moveTo(fx + Math.cos(a) * 8, fy + Math.sin(a) * 8);
        c.lineTo(fx + Math.cos(a) * 25, fy + Math.sin(a) * 25);
      }
      c.stroke();
    }),
    layer("dome", 0.6, 0, (c) => (disc(c, fx, fy, 8), c.fill())),
    layer("raise", 0.34, 2.4, both(cx, (c) => {
      c.beginPath();
      c.moveTo(cx - rw + 16, ry - 10);
      c.lineTo(cx - rw - 30, ry - 4);
      c.lineTo(cx - rw - 17, ry + 14);
      c.lineTo(cx - rw - 32, ry + 32);
      c.lineTo(cx - rw + 16, ry + 26);
      c.closePath();
      c.fill();
    })),
    layer("raise", 0.48, 2.8, (c) => (band(c, rw, rh), c.fill())),
    // Its hems, and the number and name cut along it letter by letter, following its curve.
    layer("cut", 0.04, 0.8, (c) => {
      c.lineWidth = 1.4;
      for (const off of [-1, 1]) {
        const y = ry + off * (rh / 2 - 6);
        c.beginPath();
        c.moveTo(cx - rw + 6, y);
        c.quadraticCurveTo(cx, y + sag, cx + rw - 6, y);
        c.stroke();
      }
    }),
    layer("cut", 0.12, 1.4, (c) => {
      const sp = 3;
      let size = 20, tw = 0;
      const measure = () => {
        c.font = `700 ${size}px ${F.serif}`;
        tw = [...words].reduce((w, ch) => w + c.measureText(ch).width + sp, -sp);
      };
      measure();
      while (tw > rw * 2 - 48 && size > 12) (size--, measure());
      c.textAlign = "left";
      c.textBaseline = "middle";
      let x = cx - tw / 2;
      for (const ch of words) {
        const w = c.measureText(ch).width, s = (x + w / 2 - cx) / (2 * rw) + 0.5;
        c.save();
        c.translate(x + w / 2, ry + 2 * s * (1 - s) * sag);
        c.rotate(Math.atan(((1 - 2 * s) * sag) / rw));
        c.fillText(ch, -w / 2, 0);
        c.restore();
        x += w + sp;
      }
    }),
  ];
  return { panel, frame };
}

// The pet from the archive's animations, on its 22 x 24 grid, u px a square, its top left at x, y. With arms, it's reaching out both sides.
const pet = (x, y, u, top, arms = false) => [
  layer("raise", top * 0.8, 2, (c) => {
    for (const k of [3, 14]) (rrect(c, x + k * u, y + 17 * u, 5 * u, 6.4 * u, u), c.fill());
    if (arms) for (const k of [-3.4, 20.6]) (rrect(c, x + k * u, y + 9 * u, 4.8 * u, 4.2 * u, u * 0.8), c.fill());
  }),
  layer("raise", top, 2.4, (c) => (rrect(c, x + u, y + 3 * u, 20 * u, 16 * u, 3 * u), c.fill())),
  layer("cut", 0.14, 1.2, (c) => {
    for (const k of [5, 13]) (rrect(c, x + k * u, y + 9 * u, 4 * u, 4 * u, u * 0.4), c.fill());
  }),
];

// Each subject, drawn where it sits in the cartouche or fitted into it (`fit`: scale k about cx, cy, moved to x, y).
const MOTIFS = {
  // Trace: its own mark, the line from one point to the next, raised on a tile ruled like its canvas.
  trace: {
    draw() {
      const s = 286, x0 = C[0] - s / 2, y0 = C[1] - s / 2 - 2, u = s / 32;
      const P = (a, b) => [x0 + a * u, y0 + b * u];
      return [
        layer("raise", 0.5, 9, (c) => (rrect(c, x0, y0, s, s, 64), c.fill())),
        layer("cut", 0.045, 0.9, (c) => {
          c.lineWidth = 1.8;
          rrect(c, x0 + 13, y0 + 13, s - 26, s - 26, 52);
          c.stroke();
          c.save();
          rrect(c, x0 + 20, y0 + 20, s - 40, s - 40, 45);
          c.clip();
          c.lineWidth = 1.3;
          c.beginPath();
          for (let i = 1; i < 8; i++) {
            const g = (i * s) / 8;
            c.moveTo(x0 + g, y0);
            c.lineTo(x0 + g, y0 + s);
            c.moveTo(x0, y0 + g);
            c.lineTo(x0 + s, y0 + g);
          }
          c.stroke();
          c.restore();
        }),
        layer("raise", 0.86, 4, (c) => {
          c.lineWidth = 2.4 * u;
          c.beginPath();
          c.moveTo(...P(7, 21));
          c.bezierCurveTo(...P(11, 21), ...P(12, 11), ...P(16, 11));
          c.bezierCurveTo(...P(20, 11), ...P(21, 21), ...P(25, 21));
          c.stroke();
        }),
        layer("dome", 0.96, 0, (c) => {
          for (const [a, b] of [[7, 21], [25, 21]]) (disc(c, ...P(a, b), 2.4 * u), c.fill());
        }),
      ];
    },
  },

  // Animation Engine: the oldest exercise in animation, a ball bouncing, its keys round and full, its in-betweens as onion
  // skins, squashed where it lands and stretched as it falls, along its arc.
  "animation-engine": {
    fit: { k: 0.62, cx: 339, cy: 412, x: 338, y: 442 },
    draw() {
      const out = [];
      out.push(layer("raise", 0.44, 4, (c) => (rrect(c, 56, 648, 564, 16, 8), c.fill())));
      out.push(layer("cut", 0.06, 1.6, (c) => {
        c.lineWidth = 4.4;
        c.setLineDash([13, 11]);
        c.beginPath();
        c.moveTo(100, 196);
        c.quadraticCurveTo(170, 196, 250, 616);
        c.quadraticCurveTo(318, 300, 372, 300);
        c.quadraticCurveTo(428, 300, 478, 622);
        c.quadraticCurveTo(520, 470, 560, 470);
        c.quadraticCurveTo(596, 470, 622, 628);
        c.stroke();
      }));
      out.push(layer("raise", 0.42, 2.4, (c) => {
        c.lineWidth = 6.5;
        for (const [x, y, rx, ry, a] of [[150, 222, 31, 31, 0], [204, 340, 27, 35, 1.3], [234, 494, 24, 40, 1.38], [300, 420, 25, 37, -1.28], [434, 360, 30, 31, 0], [462, 498, 24, 37, 1.3], [514, 538, 27, 31, -1.15], [600, 540, 26, 31, 1.2]]) {
          ellipse(c, x, y, rx, ry, a);
          c.stroke();
        }
      }));
      out.push(layer("dome", 0.92, 0, (c) => {
        for (const [x, y, rx, ry] of [[100, 196, 36, 36], [250, 624, 50, 25], [372, 300, 34, 34], [478, 628, 44, 22], [560, 470, 32, 32]]) (ellipse(c, x, y, rx, ry), c.fill());
      }));
      out.push(layer("cut", 0.07, 1.8, (c) => {
        c.lineWidth = 5;
        for (const [x, y] of [[250, 612], [478, 618]]) {
          for (const [dx, dy, ex, ey] of [[-58, -10, -82, -30], [-46, -26, -62, -52], [58, -10, 82, -30], [46, -26, 62, -52]]) {
            c.beginPath();
            c.moveTo(x + dx, y + dy);
            c.lineTo(x + ex, y + ey);
            c.stroke();
          }
        }
      }));
      return out;
    },
  },

  // KIPRUN: Decathlon's mark in a roundel over the Kipcore, the shoe standing on its line. The shoe itself is modelled in
  // bake.py from the range page's photo.
  kiprun: {
    draw() {
      const mx = C[0], my = 284, R = 64;
      const mark = new Path2D("M19.865 0C11.2415 0 0.514613 8.92239 0.514613 16.3172C0.514613 20.1363 3.44816 22.0625 7.32266 22.0625C10.1677 22.0625 13.6104 21.0219 16.9314 19.0183V4.26195C16.0458 5.77853 11.8835 11.8892 8.54039 15.1438C6.83559 16.8042 5.48504 17.5238 4.3227 17.5238C3.01643 17.5238 2.39652 16.6382 2.39652 15.3209C2.39652 9.34307 12.4592 1.57194 19.1233 1.57194C21.8687 1.57194 23.6398 2.78964 23.6398 5.15862C23.6398 7.32833 22.1675 10.0515 19.6546 12.5644V17.1363C24.0384 13.6714 26.662 9.25451 26.662 5.68997C26.662 1.93725 23.7395 0 19.865 0Z");
      return [
        layer("raise", 0.46, 5, (c) => (disc(c, mx, my, R), c.fill())),
        layer("cut", 0.05, 1, (c) => {
          c.lineWidth = 2;
          disc(c, mx, my, R - 8);
          c.stroke();
        }),
        layer("raise", 0.78, 2.4, (c) => {
          c.translate(mx - R, my - R);
          c.scale((2 * R) / 24, (2 * R) / 24);
          c.translate(4.6, 5.2);
          c.scale(0.66, 0.66);
          c.fill(mark);
        }),
        layer("cut", 0.06, 1.4, (c) => {
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(200, 572);
          c.lineTo(482, 572);
          c.stroke();
        }),
        { kind: "shoe", x: 338, y: 482, w: 344 },
      ];
    },
  },

  // Kodex: its mark (the stem, the triangle, the crossing arm and the arm set apart) struck in a seal of engine-turned rings.
  kodex: {
    fit: { k: 0.8, cx: 338, cy: 380, x: 338, y: 432 },
    draw() {
      const out = [];
      const cx = 338, cy = 380, R = 236;
      out.push(layer("cut", 0.05, 1.2, (c) => {
        c.lineWidth = 2.6;
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * TAU;
          disc(c, cx + Math.cos(a) * 92, cy + Math.sin(a) * 92, 120);
          c.stroke();
        }
      }));
      out.push(layer("raise", 0.48, 3, (c) => {
        c.lineWidth = 12;
        disc(c, cx, cy, R);
        c.stroke();
      }));
      out.push(layer("cut", 0.06, 1.3, (c) => {
        c.lineWidth = 2.8;
        disc(c, cx, cy, R - 21);
        c.stroke();
      }));
      const s = 300, x = cx - s / 2, y = cy - s / 2, w = 0.115 * s;
      out.push(layer("raise", 0.84, 12, (c) => {
        c.lineWidth = w;
        c.lineCap = "butt";
        c.lineJoin = "miter";
        const P = (u, v) => [x + u * s, y + v * s];
        c.beginPath();
        c.moveTo(...P(0.06, 0.04));
        c.lineTo(...P(0.06, 0.96));
        c.lineTo(...P(0.52, 0.5));
        c.closePath();
        c.stroke();
        c.beginPath();
        c.moveTo(...P(0.06, 0.96));
        c.lineTo(...P(0.97, 0.05));
        c.stroke();
        c.beginPath();
        c.moveTo(...P(0.64, 0.63));
        c.lineTo(...P(0.96, 0.95));
        c.stroke();
      }));
      return out;
    },
  },

  // Uniqkey: a key across the scan, its bow carrying a fingerprint.
  uniqkey: {
    fit: { k: 0.85, cx: 314, cy: 422, x: 338, y: 434 },
    draw() {
      const out = [];
      const bx = 214, by = 300;
      out.push(layer("cut", 0.05, 1.3, (c) => {
        c.lineWidth = 2.8;
        for (const r of [150, 220, 290]) {
          disc(c, bx, by, r);
          c.stroke();
        }
      }));
      out.push(layer("raise", 0.8, 14, (c) => {
        c.save();
        c.translate(bx, by);
        c.rotate(0.82);
        c.beginPath();
        c.arc(0, 0, 96, 0, TAU);
        c.moveTo(60, 0);
        c.arc(0, 0, 40, 0, TAU, true);
        c.fill("evenodd");
        c.fillRect(84, -19, 330, 38);
        for (const [px, len] of [[300, 64], [346, 44], [384, 78]]) c.fillRect(px, 10, 26, len);
        c.restore();
      }));
      out.push(layer("cut", 0.07, 1.6, (c) => {
        c.lineWidth = 3.4;
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.ellipse(bx - 6, by + 4, 46 + i * 10, 36 + i * 9, 0.4, 3.6 + i * 0.12, 3.6 + i * 0.12 + 4.6);
          c.stroke();
        }
      }));
      return out;
    },
  },

  // Anime Sports League: from the tee range, Crick-Stryke's ball on fire, as the manga draws it, with speed behind it.
  "anime-sports-league": {
    fit: { k: 0.64, cx: 330, cy: 420, x: 338, y: 434 },
    draw() {
      const out = [];
      const cx = 396, cy = 458, R = 128;
      out.push(layer("cut", 0.06, 2, (c) => {
        c.lineWidth = 5;
        for (let i = 0; i < 18; i++) {
          const a = -0.95 + (i / 17) * 1.9 + Math.PI / 4;
          const r0 = R + 40 + (i % 3) * 18, r1 = r0 + 90 + (i % 4) * 34;
          c.beginPath();
          c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          c.stroke();
        }
      }));
      // Flames streaming up and back off the ball as the manga draws them: jagged tongues in three layers, each inside the last.
      const back = -2.3;
      const flame = (c, spread, reach, jag, seed) => {
        const ux = Math.cos(back), uy = Math.sin(back), vx = -uy, vy = ux;
        let r = seed;
        const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
        c.beginPath();
        const n = 7;
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n, side = -1 + 2 * t;
          const tipReach = reach * (0.55 + 0.45 * Math.cos(side * 1.25)) * (0.85 + 0.3 * rnd());
          const bx = cx + vx * side * R * spread * 0.9, by = cy + vy * side * R * spread * 0.9;
          pts.push([bx + ux * tipReach + vx * side * jag * 40, by + uy * tipReach + vy * side * jag * 40]);
        }
        c.moveTo(cx + vx * R * spread, cy + vy * R * spread);
        for (let i = n; i >= 0; i--) {
          const [tx, ty] = pts[i];
          const t = i / n, side = -1 + 2 * t;
          const bx = cx + vx * side * R * spread * 0.86 + ux * reach * 0.28, by = cy + vy * side * R * spread * 0.86 + uy * reach * 0.28;
          c.quadraticCurveTo(bx + vx * jag * 22, by + vy * jag * 22, tx, ty);
          const nx2 = cx + vx * (side - 1 / n) * R * spread * 0.8 + ux * reach * 0.36, ny2 = cy + vy * (side - 1 / n) * R * spread * 0.8 + uy * reach * 0.36;
          if (i > 0) c.quadraticCurveTo(tx - ux * reach * 0.1, ty - uy * reach * 0.1, nx2, ny2);
        }
        c.lineTo(cx - vx * R * spread, cy - vy * R * spread);
        c.closePath();
        c.fill();
      };
      out.push(layer("raise", 0.44, 10, (c) => flame(c, 1.0, 400, 1, 7)));
      out.push(layer("raise", 0.58, 9, (c) => flame(c, 0.72, 300, 0.7, 19)));
      out.push(layer("raise", 0.7, 8, (c) => flame(c, 0.44, 200, 0.45, 31)));
      out.push(layer("raise", 0.62, 3, (c) => {
        for (const [x, y, r] of [[112, 420, 18], [210, 150, 15], [330, 136, 17], [92, 260, 12], [520, 250, 13]]) (star(c, x, y, r), c.fill());
      }));
      out.push(layer("dome", 0.96, 0, (c) => (disc(c, cx, cy, R), c.fill())));
      const tiltA = -0.62, ry = R * 0.34;
      out.push(layer("add", 0.06, 3, (c) => {
        c.save();
        disc(c, cx, cy, R - 2);
        c.clip();
        c.lineWidth = 18;
        c.beginPath();
        c.ellipse(cx, cy, R, ry, tiltA, 0, TAU);
        c.stroke();
        c.restore();
      }));
      out.push(layer("add", 0.03, 1.5, (c) => {
        c.save();
        disc(c, cx, cy, R - 6);
        c.clip();
        c.lineWidth = 5;
        c.translate(cx, cy);
        c.rotate(tiltA);
        for (let t = 0; t < TAU; t += 0.13) {
          const ex = Math.cos(t) * R, ey = Math.sin(t) * ry;
          if (ey < 0) continue;
          for (const off of [-16, 16]) {
            c.beginPath();
            c.moveTo(ex - 3, ey + off - 4);
            c.lineTo(ex + 3, ey + off + 4);
            c.stroke();
          }
        }
        c.restore();
      }));
      return out;
    },
  },

  // The archive's animations, each carved as what it is.

  // Maze Walk: its own walkway seen from above, the line the pet paces cut down the middle of it, and the pet at the start.
  "maze-walk": {
    fit: { k: 0.47, cx: 542, cy: 226, x: 338, y: 424 },
    draw() {
      const walk = new Path2D("M212 228L360 143L508 228L574 190L470 130L508 108L647 28L685 50L787 108L872 59L910 81L787 152L647 71L546 130L650 190L508 272L360 187L250 250L431 355L393 377L174 250Z M393 377L309 426L271 404L355 355Z");
      const mid = [[290, 415], [393, 355], [212, 250], [360, 165], [508, 250], [612, 190], [508, 130], [647, 50], [787, 130], [891, 70]];
      return [
        layer("raise", 0.46, 3, (c) => {
          c.lineWidth = 10;
          c.fill(walk);
          c.stroke(walk);
        }),
        layer("cut", 0.07, 1.2, (c) => {
          c.lineWidth = 6;
          c.setLineDash([16, 13]);
          c.beginPath();
          mid.forEach(([x, y], i) => c[i ? "lineTo" : "moveTo"](x, y));
          c.stroke();
        }),
        ...pet(220, 300, 6.4, 0.86),
      ];
    },
  },

  // Hello: the pet, arms out, under its sign.
  hello: {
    draw() {
      const u = 11, x = C[0] - 11 * u, y = C[1] - 66;
      return [
        layer("raise", 0.64, 5, (c) => {
          c.save();
          c.translate(C[0] + 34, C[1] - 136);
          c.rotate(-0.1);
          rrect(c, -104, -56, 208, 112, 22);
          c.fill();
          c.restore();
        }),
        layer("cut", 0.1, 1.6, (c) => {
          c.save();
          c.translate(C[0] + 34, C[1] - 136);
          c.rotate(-0.1);
          c.font = `700 62px ${fonts().serif}`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText("Hi!", 0, 3);
          c.restore();
        }),
        ...pet(x, y, u, 0.8, true),
      ];
    },
  },

  // Tab Hop: three tabs, one selected, and the pet landing on it, the way it came dashed in over the one before.
  "tab-hop": {
    draw() {
      const y = C[1] + 62;
      return [
        layer("raise", 0.3, 5, (c) => (rrect(c, C[0] - 184, y, 368, 88, 44), c.fill())),
        layer("raise", 0.6, 3, (c) => (rrect(c, C[0] - 62, y + 10, 124, 68, 34), c.fill())),
        layer("cut", 0.08, 1.4, (c) => {
          for (const x of [C[0] - 150, C[0] + 90]) (rrect(c, x, y + 34, 60, 20, 10), c.fill());
          rrect(c, C[0] - 34, y + 34, 68, 20, 10);
          c.fill();
          c.lineWidth = 6;
          c.setLineDash([14, 12]);
          c.beginPath();
          c.moveTo(C[0] - 120, y - 8);
          c.quadraticCurveTo(C[0] - 112, y - 196, C[0] - 40, y - 150);
          c.stroke();
        }),
        ...pet(C[0] - 55, y - 122, 5, 0.86),
      ];
    },
  },

  // Info Notch Card: the top edge of a screen, the notch hanging from it with its curved shoulders, and in it who, when and where to reach him.
  "notch-card": {
    draw() {
      const x = C[0] - 164, w = 328, top = C[1] - 176, h = 228;
      return [
        layer("raise", 0.26, 4, (c) => (rrect(c, 60, top - 74, 556, 84, 0), c.fill())),
        layer("raise", 0.56, 4, (c) => {
          c.beginPath();
          c.moveTo(x - 44, top);
          c.quadraticCurveTo(x, top, x, top + 44);
          c.lineTo(x, top + h - 44);
          c.quadraticCurveTo(x, top + h, x + 44, top + h);
          c.lineTo(x + w - 44, top + h);
          c.quadraticCurveTo(x + w, top + h, x + w, top + h - 44);
          c.lineTo(x + w, top + 44);
          c.quadraticCurveTo(x + w, top, x + w + 44, top);
          c.closePath();
          c.fill();
        }),
        layer("cut", 0.08, 1.4, (c) => {
          rrect(c, x + 104, top + 44, 128, 20, 10);
          c.fill();
          rrect(c, x + 104, top + 78, 92, 16, 8);
          c.fill();
          rrect(c, x + 170, top + 164, 118, 16, 8);
          c.fill();
        }),
        layer("dome", 0.74, 0, (c) => {
          disc(c, x + 56, top + 66, 38);
          c.fill();
          for (const k of [0, 1, 2]) (disc(c, x + 40 + k * 42, top + 172, 14), c.fill());
        }),
      ];
    },
  },

  // Scratch Card: the card under its dotted foil, with a swathe scratched out of it.
  "scratch-card": {
    draw() {
      const x = C[0] - 176, y = C[1] - 118, w = 352, h = 232;
      return [
        layer("raise", 0.5, 5, (c) => (rrect(c, x, y, w, h, 26), c.fill())),
        layer("cut", 0.05, 0.8, (c) => {
          for (let i = 0; i < 12; i++)
            for (let j = 0; j < 8; j++) {
              if (i * 0.8 + j > 9.2) continue;
              disc(c, x + 26 + i * 27, y + 24 + j * 27, 4.2);
              c.fill();
            }
        }),
        layer("cut", 0.22, 7, (c) => {
          c.lineWidth = 40;
          c.beginPath();
          c.moveTo(x + 156, y + 196);
          c.lineTo(x + 232, y + 92);
          c.lineTo(x + 244, y + 190);
          c.lineTo(x + 318, y + 66);
          c.stroke();
        }),
      ];
    },
  },

  // Nav Scrubber: the pill, its name in the middle and the ones either side fading, the name again over it, and the thumb holding it.
  "nav-scrubber": {
    draw() {
      const y = C[1] + 8;
      return [
        layer("raise", 0.5, 5, (c) => (rrect(c, C[0] - 180, y, 360, 92, 46), c.fill())),
        layer("raise", 0.64, 4, (c) => (rrect(c, C[0] - 92, y - 110, 184, 74, 37), c.fill())),
        layer("cut", 0.08, 1.4, (c) => {
          rrect(c, C[0] - 52, y - 83, 104, 20, 10);
          c.fill();
          c.globalAlpha = 0.55;
          for (const x of [C[0] - 158, C[0] + 86]) (rrect(c, x, y + 37, 72, 18, 9), c.fill());
          c.globalAlpha = 1;
        }),
        layer("raise", 0.84, 2, (c) => (rrect(c, C[0] - 58, y + 34, 116, 24, 12), c.fill())),
        layer("cut", 0.06, 1.4, (c) => {
          c.lineWidth = 7;
          for (const [a, b] of [[-1, 0], [1, 0]]) {
            c.beginPath();
            c.moveTo(C[0] + a * 112, y + 124);
            c.lineTo(C[0] + a * 134, y + 146);
            c.lineTo(C[0] + a * 112, y + 168);
            c.stroke();
          }
        }),
        layer("dome", 0.62, 0, (c) => (ellipse(c, C[0], y + 156, 58, 44), c.fill())),
      ];
    },
  },

  // Chat Quiz: the question in its bubble, its choices with one picked, and the composer under it.
  "chat-quiz": {
    draw() {
      const x = C[0] - 176, y = C[1] - 190, w = 352, h = 264;
      return [
        layer("raise", 0.48, 5, (c) => {
          rrect(c, x, y, w, h, 34);
          c.fill();
          c.beginPath();
          c.moveTo(x + 52, y + h - 8);
          c.lineTo(x + 40, y + h + 42);
          c.lineTo(x + 112, y + h - 8);
          c.closePath();
          c.fill();
        }),
        layer("cut", 0.09, 1.4, (c) => {
          rrect(c, x + 34, y + 32, 216, 22, 11);
          c.fill();
          c.lineWidth = 7;
          for (const k of [0, 1, 2]) {
            disc(c, x + 56, y + 96 + k * 56, 19);
            c.stroke();
            rrect(c, x + 96, y + 86 + k * 56, [172, 128, 150][k], 20, 10);
            c.fill();
          }
        }),
        layer("dome", 0.72, 0, (c) => (disc(c, x + 56, y + 96, 10), c.fill())),
        layer("raise", 0.56, 4, (c) => (rrect(c, x, C[1] + 132, w, 72, 36), c.fill())),
        layer("cut", 0.08, 1.4, (c) => (rrect(c, x + 34, C[1] + 158, 184, 20, 10), c.fill())),
        layer("dome", 0.78, 0, (c) => (disc(c, x + w - 38, C[1] + 168, 22), c.fill())),
      ];
    },
  },
};

const fonts = () => ({ serif: getComputedStyle(document.documentElement).getPropertyValue("--font-baskerville").trim() || "Georgia, serif" });

function paintMotif(d, n) {
  const m = MOTIFS[d.slug];
  FIT = m?.fit ?? { k: 1, cx: 0, cy: 0, x: 0, y: 0 };
  const subject = m ? m.draw() : [];
  FIT = null;
  const { panel, frame } = cartouche(d, n, fonts());
  return { field: [FW, FH], scale: S, ground: GROUND, layers: [panel, ...subject, ...frame] };
}

// The takeaways' board (Takeaways.tsx), 440 x 282 css px baked at 2x: a fillet and a cut line round it, a palmette in each
// corner, TAKEAWAYS cut across its head over a rule, and the SA roundel between two sprigs of the rocks' vine. Only its top
// two thirds ever show, so everything that matters is up there.

// A subject scaled about the cartouche's centre: its own fit, times this.
function fitted(key, scale, dy = 0) {
  const m = MOTIFS[key], f = m.fit ?? { k: 1, cx: C[0], cy: C[1], x: C[0], y: C[1] };
  FIT = { k: f.k * scale, cx: f.cx, cy: f.cy, x: C[0] + (f.x - C[0]) * scale, y: C[1] + dy + (f.y - C[1]) * scale };
  const out = m.draw();
  FIT = null;
  return out;
}

// A frame of film: a strip with its sprocket holes cut along both edges, a window sunk in it, and what's on it.
function filmFrame(inner) {
  const [cx, cy] = C, w = 356, h = 290, bar = 44, holes = 8;
  const each = (fn) => {
    for (const y of [cy - h / 2 + bar / 2, cy + h / 2 - bar / 2]) for (let i = 0; i < holes; i++) fn(cx - w / 2 + ((i + 0.5) / holes) * w, y);
  };
  return [
    layer("raise", 0.44, 3, (c) => (rrect(c, cx - w / 2, cy - h / 2, w, h, 8), c.fill())),
    layer("sink", GROUND - 0.02, 2, (c) => (rrect(c, cx - w / 2 + 12, cy - h / 2 + bar, w - 24, h - 2 * bar, 5), c.fill())),
    layer("cut", 0.13, 1.6, (c) => each((x, y) => (rrect(c, x - 9, y - 11, 18, 22, 4), c.fill()))),
    ...inner,
  ];
}

// A piece of the archive (bake.py's PIECES): its own carving in the same cartouche as the hero's rocks. The page's own stone, the
// holed one, has no cartouche: rings cut round its hole, and a tally of the pieces down its face.
function paintPiece(d, n) {
  const F = fonts();
  const field = { field: [FW, FH], scale: S, ground: GROUND };
  if (d.subject === "archive") {
    const hx = 338, hy = 186;
    const stroke = (lw, fn) => (c) => {
      c.lineWidth = lw;
      c.beginPath();
      fn(c);
      c.stroke();
    };
    return {
      ...field,
      layers: [
        layer("raise", 0.4, 2.6, stroke(8, (c) => c.arc(hx, hy, 104, 0, TAU))),
        layer("cut", 0.06, 1, stroke(1.8, (c) => c.arc(hx, hy, 90, 0, TAU))),
        layer("dome", 0.42, 0, (c) => {
          for (let i = 0; i < 44; i++) {
            const a = (i * TAU) / 44;
            disc(c, hx + Math.cos(a) * 124, hy + Math.sin(a) * 124, 4.4);
            c.fill();
          }
        }),
        // The tally: one stroke for every piece, each fifth struck across the four before it.
        layer("cut", 0.16, 1.8, (c) => {
          c.lineWidth = 7;
          c.beginPath();
          const row = (y, count, struck) => {
            for (let i = 0; i < count; i++) {
              const x = hx - 64 + i * 32;
              c.moveTo(x, y - 40);
              c.lineTo(x + (i % 2 ? 3 : -2), y + 40);
            }
            if (struck) {
              c.moveTo(hx - 84, y + 30);
              c.lineTo(hx + 54, y - 30);
            }
          };
          const groups = Math.floor(d.count / 5);
          for (let g = 0; g < groups; g++) row(372 + g * 116, 4, true);
          row(372 + groups * 116, d.count % 5, false);
          c.stroke();
        }),
      ],
    };
  }
  if (d.subject === "experience") {
    // A path up the steps: a string of beads rising from the foot, a roundel at each role, and a star where it's got to.
    const stops = [[150, 668], [366, 470], [568, 262]], end = [596, 112];
    const at = (t) => {
      const p = [[60, 776], [150, 668], [366, 470], [568, 262], end];
      const s = t * (p.length - 1), i = Math.min(p.length - 2, Math.floor(s)), f = s - i;
      return [p[i][0] + (p[i + 1][0] - p[i][0]) * f + Math.sin(t * 9) * 12, p[i][1] + (p[i + 1][1] - p[i][1]) * f];
    };
    return {
      ...field,
      layers: [
        layer("dome", 0.36, 0, (c) => {
          for (let t = 0.012; t < 0.99; t += 0.0235) {
            const [x, y] = at(t);
            if (stops.some(([a, b]) => Math.hypot(x - a, y - b) < 78)) continue;
            disc(c, x, y, 5.2);
            c.fill();
          }
        }),
        layer("panel", 0.05, 3, (c) => {
          for (const [x, y] of stops) (disc(c, x, y, 72), c.fill());
        }),
        layer("raise", 0.44, 2.4, (c) => {
          c.lineWidth = 8;
          for (const [x, y] of stops) (disc(c, x, y, 72), c.stroke());
        }),
        layer("cut", 0.06, 0.9, (c) => {
          c.lineWidth = 1.7;
          for (const [x, y] of stops) (disc(c, x, y, 60), c.stroke());
        }),
        // Each milestone's own count, one stroke for the first role, two, three.
        layer("cut", 0.16, 1.6, (c) => {
          c.lineWidth = 8;
          c.beginPath();
          stops.forEach(([x, y], n) => {
            for (let k = 0; k <= n; k++) {
              const sx = x + (k - n / 2) * 25;
              c.moveTo(sx, y - 30);
              c.lineTo(sx + (k % 2 ? 2 : -1), y + 30);
            }
          });
          c.stroke();
        }),
        layer("raise", 0.56, 3.4, (c) => (star(c, end[0], end[1], 54, 0.26), c.fill())),
      ],
    };
  }
  let subject;
  if (d.subject === "about")
    subject = [
      layer("raise", 0.62, 5, (c) => (star(c, C[0], C[1] - 8, 182, 0.2), c.fill())),
      // Each point's two faces, a line down its ridge.
      layer("cut", 0.42, 1.2, (c) => {
        c.lineWidth = 2.6;
        c.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * TAU) / 4 - Math.PI / 2;
          c.moveTo(C[0] + Math.cos(a) * 34, C[1] - 8 + Math.sin(a) * 34);
          c.lineTo(C[0] + Math.cos(a) * 160, C[1] - 8 + Math.sin(a) * 160);
        }
        c.stroke();
      }),
      layer("dome", 0.5, 0, (c) => {
        for (let i = 0; i < 4; i++) {
          const a = (i * TAU) / 4 - Math.PI / 4;
          disc(c, C[0] + Math.cos(a) * 92, C[1] - 8 + Math.sin(a) * 92, 11);
          c.fill();
        }
      }),
    ];
  else if (d.subject === "back")
    subject = [
      layer("raise", 0.66, 6, (c) => {
        c.lineWidth = 56;
        c.beginPath();
        c.moveTo(C[0] + 138, C[1]);
        c.lineTo(C[0] - 118, C[1]);
        c.moveTo(C[0] - 22, C[1] - 104);
        c.lineTo(C[0] - 128, C[1]);
        c.lineTo(C[0] - 22, C[1] + 104);
        c.stroke();
      }),
    ];
  else if (d.subject === "menu")
    subject = [
      layer("raise", 0.66, 6, (c) => {
        for (const y of [C[1] - 104, C[1], C[1] + 104]) (rrect(c, C[0] - 134, y - 30, 268, 60, 30), c.fill());
      }),
    ];
  else if (d.subject === "figure") subject = [{ kind: "figure", src: d.src, x: C[0], y: C[1] - 6, w: 372 }];
  else if (d.film === "trace") subject = filmFrame(fitted("trace", 0.5));
  else if (d.film === "animation-engine") subject = filmFrame(fitted("animation-engine", 0.62));
  else if (d.film === "kiprun") subject = filmFrame([{ kind: "shoe", x: C[0], y: C[1] + 6, w: 262 }]);
  else if (d.film === "timeline")
    subject = filmFrame([
      layer("raise", 0.38, 1.4, (c) => {
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(C[0] - 136, C[1] + 34);
        c.lineTo(C[0] + 136, C[1] + 34);
        c.stroke();
        for (const [x, h] of [[-120, 30], [-84, 58], [-48, 22], [-12, 72], [24, 40], [60, 62], [96, 26]]) {
          c.beginPath();
          c.roundRect(C[0] + x - 9, C[1] + 22 - h, 18, h, 3);
          c.fill();
        }
      }),
      layer("dome", 0.6, 0, (c) => (disc(c, C[0] + 24, C[1] + 34, 11), c.fill())),
    ]);
  else subject = fitted(d.subject, 1);
  const { panel, frame } = cartouche(d, n, F);
  return { ...field, layers: [panel, ...subject, ...frame] };
}

