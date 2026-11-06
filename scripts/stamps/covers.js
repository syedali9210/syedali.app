/* The stamps' art: each project's cover, painted on a canvas with the site's own fonts, in two layers: the print, and its
   finish (height, roughness, metal). scripts/stamps/bake.py runs this in the browser and bakes the results into public/stamps.
   Plain script, top level on purpose, so the bake can add it to any page. */
const N = 1024;
const TAU = Math.PI * 2;
// The finish map: red = height, green = roughness, blue = metal.
const PAPER = "rgb(128,178,0)", GLOSS = "rgb(128,40,0)";
const SILVER = "#e9ecef", GOLD = "#f3d27e", CHROME = "#f4f6f8";
// A jewel case, in centimetres: 142 × 125 mm, a 12 cm booklet and disc.
const W = 14.2, H = 12.5, TRAY = 0.55, LID = 0.47, BOOK = 12, DX = 0.9;
const sheet = (w, h = w) => Object.assign(document.createElement("canvas"), { width: w, height: h });
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const circle = (c, r, x = 0, y = 0) => {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
};
function art() {
    const print = sheet(N), finish = sheet(N);
    const c = print.getContext("2d"), f = finish.getContext("2d");
    f.fillStyle = PAPER;
    f.fillRect(0, 0, N, N);
    return { c, f, print, finish };
}
// Hot foil: the shape in metal, polished, pressed a little into the paper.
function foil(a, shape, tint = SILVER) {
    for (const [x, style] of [[a.c, tint], [a.f, "rgb(104,46,255)"]]) {
        x.save();
        x.fillStyle = x.strokeStyle = style;
        shape(x);
        x.restore();
    }
}
// Spot gloss: varnish over the print, same colour, shinier.
function gloss(a, shape) {
    a.f.save();
    a.f.fillStyle = a.f.strokeStyle = GLOSS;
    shape(a.f);
    a.f.restore();
}
// Embossing: the paper raised, finish unchanged.
function emboss(a, shape, up = 168) {
    a.f.save();
    a.f.fillStyle = a.f.strokeStyle = `rgb(${up},178,0)`;
    shape(a.f);
    a.f.restore();
}
// Film grain in the print and a tooth in the paper.
function grain(a, amt, seed) {
    const t = sheet(256), x = t.getContext("2d"), d = x.createImageData(256, 256), r = rng(seed);
    for (let i = 0; i < d.data.length; i += 4) {
        const v = r() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    a.c.save();
    a.c.globalAlpha = amt;
    a.c.globalCompositeOperation = "overlay";
    a.c.fillStyle = a.c.createPattern(t, "repeat");
    a.c.fillRect(0, 0, N, N);
    a.c.restore();
    // The tooth: the same noise in the height channel only, so roughness and metal stay as painted.
    x.globalCompositeOperation = "multiply";
    x.fillStyle = "#f00";
    x.fillRect(0, 0, 256, 256);
    a.f.save();
    a.f.globalAlpha = 0.08;
    a.f.globalCompositeOperation = "lighter";
    a.f.fillStyle = a.f.createPattern(t, "repeat");
    a.f.fillRect(0, 0, N, N);
    a.f.restore();
}
function text(c, s, x, y, font, fill, align = "left", spacing = 0) {
    c.save();
    c.font = font;
    c.fillStyle = fill;
    c.textAlign = align;
    c.textBaseline = "alphabetic";
    c.letterSpacing = `${spacing}px`;
    c.fillText(s, x, y);
    c.restore();
}
function vgrad(c, top, bottom) {
    const g = c.createLinearGradient(0, 0, 0, N);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, N, N);
}
// The label's mark on every sleeve: a hallmark ring with SA, and the catalogue number.
function series(a, n, F, ink, x = 64, y = 74) {
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
function arcText(c, s, r, font, fill, start) {
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
function digit(x, ch, ox, oy, w, h, t) {
    const on = { "0": [0, 1, 2, 4, 5, 6], "4": [1, 2, 3, 5], "8": [0, 1, 2, 3, 4, 5, 6] };
    const S = [[t, 0, w - 2 * t, t], [w - t, t, t, h / 2 - 1.5 * t], [w - t, h / 2 + t / 2, t, h / 2 - 1.5 * t], [t, h / 2 - t / 2, w - 2 * t, t], [0, h / 2 + t / 2, t, h / 2 - 1.5 * t], [0, t, t, h / 2 - 1.5 * t], [t, h - t, w - 2 * t, t]];
    for (const i of on[ch] ?? []) {
        const [sx, sy, sw, sh] = S[i];
        x.beginPath();
        x.roundRect(ox + sx, oy + sy, sw, sh, t / 2);
        x.fill();
    }
}
/* ── The sleeves ───────────────────────────────────────────────────────────────────────────────────────────────── */
const COVERS = {
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
        for (const [dx, col] of [[-16, "rgba(255,70,140,.75)"], [16, "rgba(70,150,255,.75)"]]) {
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
    emboss(a, (x) => { x.font = `800 92px ${F.sans}`; x.letterSpacing = "-3px"; x.fillText("ANIMATION", 52, 196); x.fillText("ENGINE", 52, 282); }, 226);
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
        const lane = (k) => {
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
        a.f.save(); a.f.translate(70, 520); a.f.transform(1, 0, -0.24, 1, 0, 0);
        emboss(a, (x) => { x.font = `900 226px ${F.sans}`; x.letterSpacing = "-8px"; x.fillText("KIPRUN", 0, 0); }, 226);
        a.f.restore();
        c.restore();
        foil(a, (x) => {
            for (const [i, ch] of [..."0048"].entries())
                digit(x, ch, 96 + i * 92 + (i > 1 ? 40 : 0), 640, 68, 120, 13);
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
    emboss(a, (x) => { x.font = `400 132px ${F.serif}`; x.textAlign = "center"; x.letterSpacing = "-2px"; x.fillText("Kodex", 512, 948); }, 226);
        text(c, "TRUST, COMPILED", 512, 996, `500 17px ${F.mono}`, d.theme.deep, "center", 6);
        series(a, 3, F, d.theme.deep);
        grain(a, 0.05, 41);
    },
    // SA–005 Uniqkey: a field of keys under a radar sweep; the keys it has crossed are lit, one is found in foil, and the
    // breaches show in coral.
    uniqkey(a, d, F) {
        const c = a.c, r = rng(53);
        vgrad(c, "#0e3c42", "#04181b");
        const key = (x, kx, ky, s) => {
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
        const sweep = (x, y) => {
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
    emboss(a, (x) => { x.font = `500 104px ${F.mono}`; x.textAlign = "center"; x.letterSpacing = "16px"; x.fillText("UNIQKEY", 512, 930); }, 226);
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
        const burst = (x) => {
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
    emboss(a, (x) => { x.font = `900 270px ${F.sans}`; x.textAlign = "center"; x.fillText("5", 610, 536); }, 240);
    emboss(a, (x) => { x.font = `italic 900 84px ${F.sans}`; x.fillText("ANIME SPORTS", 190, 896); x.fillText("LEAGUE", 190, 978); }, 226);
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
        for (const [s, y] of [["ANIME SPORTS", 896], ["LEAGUE", 978]]) {
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

// A stamp is taller than a cover: under the picture, a band in the cover's own ink with its number, its line and its label.
const BANDS = {
  trace: ["#0a1350", "#eef1ff"],
  "animation-engine": ["#0d0c17", "#ffffff"],
  kiprun: ["#1a2272", "#ffffff"],
  kodex: ["#e9eedc", "#3550c8"],
  uniqkey: ["#04181b", "#9ce9c3"],
  "anime-sports-league": ["#fff3d6", "#16120f"],
};
function paintStamp(d, n) {
  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const F = { serif: css("--font-serif", "Georgia, serif"), sans: css("--font-sans", "system-ui"), mono: css("--font-mono", "monospace") };
  const a = art();
  COVERS[d.slug](a, d, F);
  const T = 1337;
  const print = sheet(N, T), finish = sheet(N, T);
  const c = print.getContext("2d"), f = finish.getContext("2d");
  const [bg, ink] = BANDS[d.slug];
  c.fillStyle = bg;
  c.fillRect(0, 0, N, T);
  c.drawImage(a.print, 0, 0);
  f.fillStyle = PAPER;
  f.fillRect(0, 0, N, T);
  f.drawImage(a.finish, 0, 0);
  const obi = d.slug === "anime-sports-league";
  const x0 = obi ? 190 : 56;
  if (obi) {
    c.fillStyle = d.theme.deep;
    c.fillRect(0, N, 150, T - N);
  }
  c.save();
  c.globalAlpha = 0.4;
  c.fillStyle = ink;
  c.fillRect(x0, N + 26, N - 56 - x0, 2);
  c.restore();
  const num = String(n + 1).padStart(2, "0");
  const both = (font, s, x, y, fill, spacing = 0, up = 212) => {
    text(c, s, x, y, font, fill, "left", spacing);
    f.save();
    f.font = font;
    f.letterSpacing = spacing + "px";
    f.fillStyle = `rgb(${up},178,0)`;
    f.fillText(s, x, y);
    f.restore();
  };
  both(`400 186px ${F.serif}`, num, x0 - 6, N + 214, ink, -6, 230);
  c.save();
  c.font = `italic 400 37px ${F.serif}`;
  const words = d.tagline.split(" ");
  const lines = [];
  let line = "";
  const room = N - 56 - (x0 + 244);
  for (const w of words) {
    const next = line ? line + " " + w : w;
    if (c.measureText(next).width > room && line) (lines.push(line), (line = w));
    else line = next;
  }
  if (line) lines.push(line);
  c.restore();
  lines.slice(0, 3).forEach((l, i) => both(`italic 400 37px ${F.serif}`, l, x0 + 244, N + 92 + i * 48, ink, 0, 196));
  both(`500 21px ${F.mono}`, `SA-00${n + 1}   ${d.kind.toUpperCase()}   ${d.year}`, x0, N + 276, ink, 4, 190);
  grain({ c, f, print, finish }, 0.05, 90 + n);
  return { print: print.toDataURL("image/png"), finish: finish.toDataURL("image/png") };
}
