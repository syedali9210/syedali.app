/**
 * Modules (Kodex): a base plate laid out like a product page rebuilt in modules: one large lead module and six smaller
 * ones of different sizes, each with what it holds marked on its top (a picture, a line or two of copy). Text-heavy
 * pages became modules you can read one at a time; here the modules near the pointer rise towards it, the one under it
 * most, each on its own spring, and that one takes the bright edge. At rest the lead module stands up, and one beside it.
 * The read-out names the module; the slider is the reach.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, rrect, poly, seg, unproj, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

// [x0, y0, x1, y1, rest height]: a page's sections, tiled with 4-unit gutters.
const MODS = [
  [4, 4, 64, 54, 14],
  [68, 4, 136, 28, 3],
  [68, 32, 100, 54, 7],
  [104, 32, 136, 54, 3],
  [4, 58, 42, 96, 3],
  [46, 58, 96, 96, 4],
  [100, 58, 136, 96, 2],
];
const X1 = 140, Y1 = 100, HMAX = 22;
const falloff = (u) => (u <= 0 ? 1 : u <= 0.45 ? 1 - (u / 0.45) * 0.66 : u <= 1 ? 0.34 - ((u - 0.45) / 0.55) * 0.26 : 0.08);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value;
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[0, 0, -5], [X1, Y1, -5], [X1, 0, -5], [0, Y1, -5], [34, 29, HMAX + 2]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [br, bi] = rings(0, 0, X1, Y1, 6, 2);
  put(solid(g), prism(P, front, br, bi, -5, 0));

  // Painted from the far corner: by the sum of each module's centre (they never overlap on the plate).
  const mods = MODS.map(([x0, y0, x1, y1, h0], k) => {
    const [r, i] = rings(x0, y0, x1, y1, 2.4, 1);
    return { k, x0, y0, x1, y1, h0, r, i, sp: spring(h0, { eps: 0.03 }), drawn: NaN };
  }).sort((a, b) => a.x0 + a.x1 + a.y0 + a.y1 - (b.x0 + b.x1 + b.y0 + b.y1));
  mods.forEach((m) => { m.el = solid(g); m.marks = mk("path", { class: "nf lo" }, g); });
  const lead = mods.find((m) => m.k === 0);

  function draw(m) {
    const z = Math.max(0.8, m.sp.x);
    if (z === m.drawn) return;
    m.drawn = z;
    put(m.el, prism(P, front, m.r, m.i, 0, z));
    // What the module holds: the lead module a picture and two lines; the others a line or two.
    const at = (x, y) => P(x, y, z), w = m.x1 - m.x0;
    let d = seg(at(m.x0 + 5, m.y1 - 6), at(m.x0 + 5 + w * 0.55, m.y1 - 6));
    if (m.y1 - m.y0 > 20) d += seg(at(m.x0 + 5, m.y1 - 10), at(m.x0 + 5 + w * 0.35, m.y1 - 10));
    if (m.k === 0) d += poly(rrect(m.x0 + 6, m.y0 + 6, m.x1 - 6, m.y1 - 18, 1.6, 3).map((q) => at(q.u, q.v)));
    m.marks.setAttribute("d", d);
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const m of mods) { if (stepS(m.sp, dt)) moving = true; draw(m); }
    return moving;
  });
  bag.add(B.unregister);

  let over = null;
  function retarget() {
    let under = null;
    for (const m of mods) {
      if (!over) { m.sp.t = m.h0; continue; }
      // Distance to the module's nearest edge, so a large module answers when the pointer is anywhere on it.
      const dx = Math.max(m.x0 - over[0], 0, over[0] - m.x1), dy = Math.max(m.y0 - over[1], 0, over[1] - m.y1);
      if (dx === 0 && dy === 0) under = m;
      m.sp.t = HMAX * falloff(Math.hypot(dx, dy) / R);
    }
    mods.forEach((m) => m.el.sil.classList.toggle("hi", m === (over ? under : lead)));
    read.textContent = !over ? "rest" : under ? `module ${under.k + 1}` : "plate";
    B.wake();
  }

  bag.add(pointer(stage, {
    // The pointer is put on the plate, which never moves (rule 01).
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  mods.forEach(draw);
  retarget();
  return { set: (v) => { R = clamp(v, 10, 80); if (over) retarget(); }, destroy: bag.dispose };
}

hairline({
  name: "modules",
  means: "A page rebuilt in modules: the ones near the pointer rise towards it, the one under it most.",
  rules: [1, 3, 5, 9],
  range: [16, 34, 60],
  mount,
});
