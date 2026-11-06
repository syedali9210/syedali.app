/**
 * Treadmill (KIPRUN): a deck whose belt never stops, with a rail on each side and a console on two posts.
 * The belt's slats ride by on their own; hovering slows the belt on a spring so one slat can be followed, and that
 * slat carries the bright edge. The read-out is the belt speed in km/h; the slider is the running speed.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, seg, spring, stepS, unproj, mk, pointer, put, register, disposer, solid } = HL;

const L = 132, Wd = 46, DECK = 9, BELT0 = 9, BELT1 = Wd - 9, PITCH = 11, NS = Math.round(L / PITCH);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let base = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[0, 0, -2], [L, Wd, -2], [L, 0, -2], [0, Wd, -2], [6, 0, 66], [6, Wd, 66]], 200, 170);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // Posts and console stand at the far (x = 0) end; the far post is painted before the deck, the near one after.
  const post = (y0, y1) => { const [r, i] = rings(2, y0, 9, y1, 2.2, 0.8); return prism(P, front, r, i, 0, 62); };
  put(solid(g), post(1, 7));
  const [dr, di] = rings(0, 0, L, Wd, 7, 1.6);
  put(solid(g), prism(P, front, dr, di, 0, DECK));
  const [br, bi] = rings(4, BELT0, L - 4, BELT1, 3, 0.8);
  put(solid(g), prism(P, front, br, bi, DECK, DECK + 0.6));
  const slats = mk("path", { class: "nf lo" }, g), lead = mk("path", { class: "nf hi" }, g);
  const rail = (y0, y1) => { const [r, i] = rings(18, y0, L - 10, y1, 1.6, 0.5); return prism(P, front, r, i, DECK, DECK + 3); };
  put(solid(g), rail(1.5, 6));
  put(solid(g), rail(Wd - 6, Wd - 1.5));
  put(solid(g), post(Wd - 7, Wd - 1));
  const [cr, ci] = rings(-2, -2, 16, Wd + 2, 3, 1);
  put(solid(g), prism(P, front, cr, ci, 58, 66));

  const rate = spring(base, { eps: 0.002 });
  let off = 0, drawn = NaN, over = null; // over: the pointer's x on the belt, or null
  const z = DECK + 0.6;

  function draw() {
    if (off === drawn) return;
    drawn = off;
    const d = [], xs = [];
    for (let k = 0; k < NS; k++) xs.push(6 + ((k * PITCH + off) % (L - 12)));
    // The bright slat: the one nearest the pointer while it slows the belt, else the first.
    let lk = 0;
    if (over !== null) xs.forEach((x, k) => { if (Math.abs(x - over) < Math.abs(xs[lk] - over)) lk = k; });
    let leadD = "";
    xs.forEach((x, k) => {
      const s = seg(P(x, BELT0 + 1.5, z), P(x, BELT1 - 1.5, z));
      if (k === lk) leadD = s; else d.push(s);
    });
    slats.setAttribute("d", d.join(""));
    lead.setAttribute("d", leadD);
  }

  // Ambient: the belt runs while the figure is on screen (rule 07 lets ambient motion run, and the loop sleeps offscreen).
  const B = register(stage, (dt) => {
    stepS(rate, dt);
    off = (off + rate.x * dt * 7) % (L - 12);
    draw();
    return true;
  });
  bag.add(B.unregister);

  const kmh = (r) => (r * 1.25).toFixed(1);
  bag.add(pointer(stage, {
    move: ([x, y]) => { over = clamp(unproj(C, x, y, DECK)[0], 6, L - 6); rate.t = clamp(base * 0.22, 0.4, 99); read.textContent = kmh(rate.t); B.wake(); },
    leave: () => { over = null; rate.t = base; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw();
  return { set: (v) => { base = v; rate.t = v; B.wake(); }, destroy: bag.dispose };
}

hairline({
  name: "treadmill",
  means: "A treadmill whose belt never stops: hover and it slows, so one stride of it can be followed.",
  rules: [3, 5, 7, 8],
  range: [5, 9.6, 14],
  mount,
});
