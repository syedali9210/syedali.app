/**
 * Shoeboxes (KIPRUN): five shoe boxes side by side on a shelf, one per series, the race shoe's box a little lower.
 * Each has its lid, overhanging the body, and a label on its end. The pointer picks a box; it slides out towards you
 * and its lid lifts, and its neighbours come out a little, staggered from it. At rest the middle box stands half out.
 * The read-out names the series; the slider is how far a box comes out.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, rrect, poly, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const SERIES = [
  { name: "kipcore", h: 20 },
  { name: "kipride", h: 21 },
  { name: "kipride max", h: 23 },
  { name: "kipstorm", h: 18 },
  { name: "gravel", h: 22 },
];
const BW = 30, BD = 44, GAP = 4, LID = 5, REST = 2, X1 = SERIES.length * (BW + GAP) + 4;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-4, 0, -5], [X1, BD + 34, -5], [X1, 0, -5], [-4, BD + 34, -5], [0, 0, 30], [X1, 0, 30]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [sr, si] = rings(-4, -2, X1, BD + 4, 3, 1.4);
  put(solid(g), prism(P, front, sr, si, -5, 0));

  const boxes = SERIES.map((b, k) => {
    const grp = mk("g", {}, g);
    return { ...b, k, x0: 4 + k * (BW + GAP), grp, body: solid(grp), lid: solid(grp), label: mk("path", { class: "nf lo" }, grp), out: tween(k === REST ? 14 : 0), up: tween(k === REST ? 3 : 0), drawn: "" };
  });

  function draw(b, now) {
    const o = tval(b.out, now), u = tval(b.up, now), key = o.toFixed(2) + "," + u.toFixed(2);
    if (key === b.drawn) return;
    b.drawn = key;
    const [r, i] = rings(b.x0, o, b.x0 + BW, o + BD, 1.6, 0.8);
    put(b.body, prism(P, front, r, i, 0, b.h - LID + 1));
    // The lid overhangs the body by a unit all round, and lifts when the box is pulled.
    const [lr, li] = rings(b.x0 - 1, o - 1, b.x0 + BW + 1, o + BD + 1, 2, 1);
    put(b.lid, prism(P, front, lr, li, b.h - LID + u, b.h + u));
    // The label on the end you pull by: a card in a frame, and a line for the size.
    const end = (q) => P(q.u, o + BD + 0.01, q.v);
    b.label.setAttribute("d", poly(rrect(b.x0 + 6, 4, b.x0 + BW - 6, b.h - LID - 3, 1.2, 3).map(end)) + seg(end({ u: b.x0 + 9, v: 7.5 }), end({ u: b.x0 + 18, v: 7.5 })));
  }

  // A box that comes out is nearer than the ones beside it: keep the paint order by depth (rule 06).
  let order = "";
  function sortByDepth(now) {
    const s = boxes.slice().sort((a, b) => a.x0 + tval(a.out, now) - (b.x0 + tval(b.out, now)));
    const key = s.map((b) => b.k).join();
    if (key !== order) { order = key; s.forEach((b) => g.appendChild(b.grp)); }
  }

  const B = register(stage, (_dt, now) => {
    boxes.forEach((b) => draw(b, now));
    sortByDepth(now);
    return boxes.some((b) => !tdone(b.out, now) || !tdone(b.up, now));
  });
  bag.add(B.unregister);

  let act = -2;
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : REST;
    act = a;
    boxes.forEach((b) => {
      const d = Math.abs(b.k - from), delay = d * 50;
      tset(b.out, a < 0 ? (b.k === REST ? 14 : 0) : d === 0 ? pull : d === 1 ? pull * 0.22 : 0, now, delay);
      tset(b.up, a < 0 ? (b.k === REST ? 3 : 0) : d === 0 ? 6 : 0, now, delay);
      b.lid.sil.classList.toggle("hi", b.k === (a < 0 ? REST : a));
    });
    read.textContent = a < 0 ? "rest" : boxes[a].name;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each box's rest end on screen (rule 01): one row, so the nearest centre along x.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      boxes.forEach((b) => { const c = P(b.x0 + BW / 2, BD, b.h / 2); const dd = Math.abs(c[0] - x); if (dd < bd && Math.abs(c[1] - y) < 60) { bd = dd; best = b.k; } });
      pick(bd < 30 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  const now = performance.now();
  boxes.forEach((b) => draw(b, now));
  sortByDepth(now);
  pick(-1);
  return { set: (v) => { pull = clamp(v, 10, 40); }, destroy: bag.dispose };
}

hairline({
  name: "shoeboxes",
  means: "Five shoe boxes, one per series: the one under the pointer slides out and its lid lifts.",
  rules: [1, 2, 5, 6],
  range: [16, 26, 34],
  mount,
});
