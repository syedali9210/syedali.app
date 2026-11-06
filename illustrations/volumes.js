/**
 * Volumes (Trace): a shelf of six books, one per AI tool's memory, each a different height and thickness, a band
 * printed near the top and foot of every spine. The pointer picks a book by its spine; it slides out towards you and
 * its neighbours come out a little, staggered from it. At rest one book stands half out: the one an agent last asked
 * for. The read-out names the tool; the slider is how far a book comes out.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const BOOKS = [
  { name: "claude code", t: 6.5, d: 17, h: 62 },
  { name: "codex", t: 4.5, d: 16, h: 53 },
  { name: "antigravity", t: 7.5, d: 18, h: 58 },
  { name: "cursor", t: 5, d: 15, h: 48 },
  { name: "copilot", t: 7, d: 17, h: 64 },
  { name: "claude.ai", t: 4.5, d: 15, h: 51 },
  { name: "chatgpt", t: 6, d: 16, h: 56 },
];
const GAP = 0.8, BACK = 3, Z = 5, REST = 2;
const W = BOOKS.reduce((s, b) => s + b.t + GAP, 0) + 8;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;
  const C = Cam(45, 0.5, 2.8);
  fit(C, [[0, 0, 0], [W, 22 + 36, 0], [W, 0, 0], [0, 22 + 36, 0], [0, 0, 78], [W, 0, 78]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The shelf: a back board, then the plank the books stand on.
  const [br, bi] = rings(0, 0, W, BACK, 1.2, 0.6);
  put(solid(g), prism(P, front, br, bi, 0, 76));
  const [pr, pi] = rings(-2, 0, W + 2, 22, 2.4, 1.2);
  put(solid(g), prism(P, front, pr, pi, 0, Z));

  let x = 6;
  const books = BOOKS.map((b, k) => {
    const bk = { ...b, k, x0: x, grp: mk("g", {}, g), out: tween(k === REST ? 12 : 0), drawn: NaN };
    bk.el = solid(bk.grp);
    bk.bands = mk("path", { class: "nf lo" }, bk.grp);
    x += b.t + GAP;
    return bk;
  });

  function draw(bk, now) {
    const o = tval(bk.out, now);
    if (o === bk.drawn) return;
    bk.drawn = o;
    const y0 = BACK + 1 + o, y1 = y0 + bk.d;
    const [r, i] = rings(bk.x0, y0, bk.x0 + bk.t, y1, 1.1, 0.6);
    put(bk.el, prism(P, front, r, i, Z, Z + bk.h));
    // Two bands across the spine, near its head and its foot.
    const band = (z) => seg(P(bk.x0 + 0.9, y1, z), P(bk.x0 + bk.t - 0.9, y1, z));
    // What makes it a book: the cover's hinge groove beside the spine, and the page block set in from the boards on top.
    const xs = bk.x0 + bk.t, top = Z + bk.h;
    const hinge = seg(P(xs, y1 - 2.6, Z + 1.5), P(xs, y1 - 2.6, top - 1.5));
    const pages = seg(P(bk.x0 + 1, y0 + 1.6, top), P(bk.x0 + 1, y1 - 2.2, top)) + seg(P(xs - 1, y0 + 1.6, top), P(xs - 1, y1 - 2.2, top));
    bk.bands.setAttribute("d", band(Z + bk.h - 7) + band(Z + bk.h - 10) + band(Z + 8) + hinge + pages);
  }

  // A book that comes out is nearer than the ones beside it: keep the paint order by depth (rule 06).
  let order = "";
  function sortByDepth(now) {
    const s = books.slice().sort((a, b) => a.x0 + a.t / 2 + tval(a.out, now) - (b.x0 + b.t / 2 + tval(b.out, now)));
    const key = s.map((b) => b.k).join();
    if (key !== order) { order = key; s.forEach((b) => g.appendChild(b.grp)); }
  }

  const B = register(stage, (_dt, now) => {
    books.forEach((b) => draw(b, now));
    sortByDepth(now);
    return books.some((b) => !tdone(b.out, now));
  });
  bag.add(B.unregister);

  let act = -2;
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : REST;
    act = a;
    books.forEach((b) => {
      const d = Math.abs(b.k - from);
      const to = a < 0 ? (b.k === REST ? 12 : 0) : d === 0 ? pull : d === 1 ? pull * 0.28 : 0;
      tset(b.out, to, now, d * 45);
      b.el.sil.classList.toggle("hi", b.k === (a < 0 ? REST : a));
    });
    read.textContent = a < 0 ? "rest" : books[a].name;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each spine's rest centre on screen (rule 01): a book sliding out can't change the choice.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      books.forEach((b) => { const c = P(b.x0 + b.t / 2, BACK + 1 + b.d, Z + b.h / 2); const dd = Math.hypot(c[0] - x, (c[1] - y) * 0.35); if (dd < bd) { bd = dd; best = b.k; } });
      pick(bd < 18 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  const now = performance.now();
  books.forEach((b) => draw(b, now));
  sortByDepth(now);
  pick(-1);
  return { set: (v) => { pull = clamp(v, 8, 40); }, destroy: bag.dispose };
}

hairline({
  name: "volumes",
  means: "Books on a shelf, one per AI tool's memory: the one under the pointer slides out, its neighbours a little.",
  rules: [1, 2, 5, 6],
  range: [16, 26, 34],
  mount,
});
