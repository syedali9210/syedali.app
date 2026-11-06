/**
 * Light table (Animation Engine, the Lab): a light box with a 6 × 4 grid of slide mounts lying on its glass, each with
 * its window. The Lab studies films frame by frame; here the pointer is the loupe. The slides near it rise off the glass,
 * the nearest most, each on its own spring, and the one under it takes the bright edge. At rest a diagonal of three
 * has been pulled up: the frames kept last night. The read-out names the frame; the slider is the loupe's reach.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, rrect, poly, unproj, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const NX = 6, NY = 4, CELL = 23, SL = 18, PAD = 9, TOP = 8, HMAX = 16;
const X1 = NX * CELL + PAD * 2, Y1 = NY * CELL + PAD * 2;
const KEPT = { "1,2": 9, "2,1": 12, "3,0": 7 }; // the kept frames, lifted at rest
const falloff = (u) => (u <= 0 ? 1 : u <= 0.45 ? 1 - (u / 0.45) * 0.68 : u <= 1 ? 0.32 - ((u - 0.45) / 0.55) * 0.24 : 0.08);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value * CELL, over = null;
  const C = Cam(45, 0.5, 1.82);
  fit(C, [[0, 0, 0], [X1, Y1, 0], [X1, 0, 0], [0, Y1, 0], [X1 / 2, Y1 / 2, TOP + HMAX + 4]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The light box: a deep body, and its glass set into the top a little inside the rim.
  const [br, bi] = rings(0, 0, X1, Y1, 7, 2);
  put(solid(g), prism(P, front, br, bi, 0, TOP));
  mk("path", { class: "nf lo", d: poly(rrect(4, 4, X1 - 4, Y1 - 4, 4, 5).map((q) => P(q.u, q.v, TOP))) }, g);

  // Slides, diagonal by diagonal from the far corner, so appending is painting back to front.
  const slides = [];
  for (let s = 0; s <= NX + NY - 2; s++) for (let i = 0; i < NX; i++) {
    const j = s - i;
    if (j < 0 || j >= NY) continue;
    const x0 = PAD + i * CELL + (CELL - SL) / 2, y0 = PAD + j * CELL + (CELL - SL) / 2, h0 = KEPT[i + "," + j] || 0;
    const [r, n] = rings(x0, y0, x0 + SL, y0 + SL, 1.6, 0.6);
    const win = rrect(x0 + 4, y0 + 3.5, x0 + SL - 4, y0 + SL - 3.5, 1, 3);
    slides.push({ i, j, h0, r, n, win, el: solid(g), w: mk("path", { class: "nf lo" }, g), sp: spring(h0, { eps: 0.03 }), drawn: NaN });
  }
  const at = (i, j) => slides.find((s) => s.i === i && s.j === j);
  const restMark = at(2, 1);

  function draw(s) {
    const z = TOP + s.sp.x;
    if (z === s.drawn) return;
    s.drawn = z;
    put(s.el, prism(P, front, s.r, s.n, z, z + 1.6));
    s.w.setAttribute("d", poly(s.win.map((q) => P(q.u, q.v, z + 1.6))));
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const s of slides) { if (stepS(s.sp, dt)) m = true; draw(s); }
    return m;
  });
  bag.add(B.unregister);

  function retarget() {
    let under = null;
    for (const s of slides) {
      if (!over) { s.sp.t = s.h0; continue; }
      const cx = PAD + (s.i + 0.5) * CELL, cy = PAD + (s.j + 0.5) * CELL;
      s.sp.t = HMAX * falloff(Math.hypot(cx - over[0], cy - over[1]) / R);
    }
    if (over) {
      const i = Math.floor((over[0] - PAD) / CELL), j = Math.floor((over[1] - PAD) / CELL);
      if (i >= 0 && i < NX && j >= 0 && j < NY) under = at(i, j);
    }
    const lit = over ? under : restMark;
    for (const s of slides) s.el.sil.classList.toggle("hi", s === lit);
    read.textContent = !over ? "rest" : under ? `frame ${under.i + 1}·${under.j + 1}` : "glass";
    B.wake();
  }

  bag.add(pointer(stage, {
    // The pointer is put on the glass, which never moves (rule 01), and the slides answer by distance to it.
    move: (p) => { over = unproj(C, p[0], p[1], TOP); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  slides.forEach(draw);
  retarget();
  return { set: (v) => { R = clamp(v, 0.8, 4) * CELL; if (over) retarget(); }, destroy: bag.dispose };
}

hairline({
  name: "lighttable",
  means: "Film frames on a light table: the slides near the pointer rise off the glass, the nearest most.",
  rules: [1, 3, 5, 8],
  range: [1.2, 2, 3.2],
  mount,
});
