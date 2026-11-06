/**
 * Dominoes (Uniqkey): a row of eight dominoes standing on a board, each with its pips in two halves. A breach is rarely
 * one account: push the domino under the pointer and it and every one after it fall in turn, each a beat after the one
 * before, and come to rest leaning on the next. At rest the first stands tipped, about to go. The read-out names the
 * domino pushed; the slider is the beat between falls, in ms.
 */
const { Cam, clamp, fillet, fit, poly, prism, proj, rad, rings, seg, facing, place, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const N = 8, W = 22, H = 44, TK = 7, G = 15, FALL = 62, LAST = 78, TIP = 10;
const PIPS = [[1, 2], [3, 0], [2, 5], [4, 1], [0, 6], [5, 3], [6, 2], [1, 4]];
const SHAPE = fillet([[0, 0], [W, 0], [W, H], [0, H]], [2.4, 2.4, 2.4, 2.4]);

/** Pip positions for a count on one half (0–6), in the half's own unit square. */
const LAYOUT = { 0: [], 1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], 4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], 5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]], 6: [[0.3, 0.2], [0.7, 0.2], [0.3, 0.5], [0.7, 0.5], [0.3, 0.8], [0.7, 0.8]] };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let beat = value;
  const C = Cam(45, 0.5, 1.72);
  const Y1 = (N - 1) * G + H + 8;
  fit(C, [[-8, -10, -4], [W + 8, Y1, -4], [W + 8, -10, -4], [-8, Y1, -4], [0, 0, H], [W, 0, H]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [br, bi] = rings(-8, -10, W + 8, Y1, 4, 1.6);
  put(solid(g), prism(P, front, br, bi, -4, 0));

  const dom = PIPS.map((pp, i) => {
    const grp = mk("g", {}, g);
    const d = { i, pp, back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), line: mk("path", { class: "nf lo" }, grp), pips: [], a: tween(i === 0 ? TIP : 0), drawn: NaN };
    [0, 1].forEach((half) => LAYOUT[pp[half]].forEach(([u, v]) => d.pips.push({ half, u, v, el: mk("circle", { r: 1.25, class: "dot m" }, grp) })));
    return d;
  });

  function draw(d, now) {
    const th = tval(d.a, now);
    if (th === d.drawn) return;
    d.drawn = th;
    const s = Math.sin(rad(th)), c = Math.cos(rad(th)), yb = d.i * G;
    // Tipping forward about its front foot: the face leans towards the next domino.
    const w = (u, v) => P(u, yb + v * s, v * c);
    const wb = (u, v) => P(u, yb + v * s - TK * c, v * c + TK * s);
    d.back.setAttribute("d", poly(SHAPE.map(([u, v]) => wb(u, v))));
    d.face.setAttribute("d", poly(SHAPE.map(([u, v]) => w(u, v))));
    d.line.setAttribute("d", seg(w(3, H / 2), w(W - 3, H / 2)));
    d.pips.forEach((p) => place(p.el, w(4 + p.u * (W - 8), (p.half ? H / 2 : 0) + 4 + p.v * (H / 2 - 8))));
  }

  const B = register(stage, (_dt, now) => {
    dom.forEach((d) => draw(d, now));
    return dom.some((d) => !tdone(d.a, now));
  });
  bag.add(B.unregister);

  let act = -2;
  /** Pushes domino a: it and every one after it fall, each a beat later than the one before. -1 stands them back up. */
  function push(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(0, act);
    act = a;
    dom.forEach((d) => {
      const falls = a >= 0 && d.i >= a;
      tset(d.a, falls ? (d.i === N - 1 ? LAST : FALL) : d.i === 0 && a < 0 ? TIP : 0, now, Math.abs(d.i - from) * beat);
      d.face.classList.toggle("hi", d.i === (a < 0 ? 0 : a));
    });
    read.textContent = a < 0 ? "rest" : `domino ${a + 1}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each domino's resting top edge on screen (rule 01): a falling domino can't change what was pushed.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      dom.forEach((d) => { const c = P(W / 2, d.i * G, H * 0.7); const dd = Math.hypot(c[0] - x, (c[1] - y) * 0.6); if (dd < bd) { bd = dd; best = d.i; } });
      push(bd < 26 ? best : -1);
    },
    leave: () => push(-1),
  }));
  bag.add(() => svg.replaceChildren());
  dom.forEach((d) => draw(d, performance.now()));
  push(-1);
  return { set: (v) => { beat = clamp(v, 20, 160); }, destroy: bag.dispose };
}

hairline({
  name: "dominoes",
  means: "A row of dominoes: push the one under the pointer and it and every one after it fall, each a beat after the last.",
  rules: [1, 2, 5, 8],
  range: [40, 80, 130],
  mount,
});
