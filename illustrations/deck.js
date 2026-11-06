/**
 * Deck (Anime Sports League): five league cards standing in a fan on a curved stand, each with an inner border and its
 * number punched as dots in the corner. The card nearest the pointer rises and stands straight; the others lean away,
 * staggered outward from it on the 700ms lift curve. At rest the middle card stands a little proud.
 * The read-out names the card; the slider is the stagger, in ms.
 */
const { Cam, facing, fit, prism, proj, rings, rrect, fillet, poly, rad, tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid } = HL;

const N = 5, W = 40, H = 58, PIV = [0, 0], RAD = 84, FACE = 45, SPREAD = 16, LEAN = -10, AWAY = 12, LIFT = 14, REST = 2;
// Painted from the fan's ends to its middle, which stands nearest the viewer.
const ORDER = [0, 4, 1, 3, 2];

/** Card k's frame: where its foot centre stands and which way it faces, on an arc about the pivot. */
function seat(k) {
  const a = rad(FACE + (k - (N - 1) / 2) * SPREAD);
  return { cx: PIV[0] + RAD * Math.cos(a), cy: PIV[1] + RAD * Math.sin(a), a };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.98);
  const pts = [];
  for (let k = 0; k < N; k++) {
    const s = seat(k), tx = -Math.sin(s.a) * (W / 2 + 4), ty = Math.cos(s.a) * (W / 2 + 4);
    pts.push([s.cx + tx, s.cy + ty, -6], [s.cx - tx, s.cy - ty, -6], [s.cx, s.cy, H + LIFT + 6]);
  }
  fit(C, pts, 200, 170);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The stand: a low rounded bar under the fan, turned to face the viewer with it.
  const L2 = RAD * Math.sin(rad(SPREAD * 2)) + W / 2 + 10, c0 = Math.cos(rad(FACE)), s0 = Math.sin(rad(FACE)), mid = RAD - 2;
  const turn = (r) => r.map((q) => ({ u: mid * c0 + q.u * -s0 + q.v * c0, v: mid * s0 + q.u * c0 + q.v * s0, nu: -q.nu * s0 + q.nv * c0, nv: q.nu * c0 + q.nv * s0 }));
  const [sr, si] = rings(-L2, -9, L2, 13, 10, 1.8);
  put(solid(g), prism(P, front, turn(sr), turn(si), -6, 0));

  const outline = fillet([[0, 0], [W, 0], [W, H], [0, H]], [4, 4, 4, 4]);
  const border = rrect(4, 4, W - 4, H - 4, 2.5, 4);
  const cards = [];
  for (const k of ORDER) {
    const grp = mk("g", {}, g);
    const face = mk("path", { class: "sil" }, grp), inner = mk("path", { class: "nf lo" }, grp);
    const dots = [];
    for (let d = 0; d <= k; d++) dots.push(mk("circle", { r: 1.1, class: "dot m" }, grp));
    cards[k] = { face, inner, dots, th: tween(LEAN), z: tween(k === REST ? 6 : 0) };
  }

  /** A point on card k: u across, v up, leaning th degrees (positive leans away from the pivot), lifted by z. */
  function at(k, u, v, th, z) {
    const s = seat(k), t = rad(th);
    const out = v * Math.sin(t), across = u - W / 2;
    const tx = -Math.sin(s.a), ty = Math.cos(s.a); // along the arc
    return P(s.cx + across * tx + out * Math.cos(s.a), s.cy + across * ty + out * Math.sin(s.a), v * Math.cos(t) + z);
  }

  function draw(k, now) {
    const c = cards[k], th = tval(c.th, now), z = tval(c.z, now);
    c.face.setAttribute("d", poly(outline.map(([u, v]) => at(k, u, v, th, z))));
    c.inner.setAttribute("d", poly(border.map((q) => at(k, q.u, q.v, th, z))));
    c.dots.forEach((el, d) => place(el, at(k, 9 + d * 4.5, H - 9, th, z)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (let k = 0; k < N; k++) { draw(k, now); if (!tdone(cards[k].th, now) || !tdone(cards[k].z, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  let act = -1;
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : REST;
    act = a;
    cards.forEach((c, k) => {
      const delay = Math.abs(k - from) * stag;
      tset(c.th, a < 0 ? LEAN : k === a ? 0 : LEAN - AWAY, now, delay);
      tset(c.z, a < 0 ? (k === REST ? 6 : 0) : k === a ? LIFT : 0, now, delay);
      c.face.classList.toggle("hi", k === (a < 0 ? REST : a));
    });
    read.textContent = a < 0 ? "rest" : `ep ${a + 1}`;
    B.wake();
  }

  // Picked by each card's rest top centre (rule 01): the one nearest the pointer's x.
  const tops = cards.map((_, k) => at(k, W / 2, H, LEAN, 0)[0]);
  bag.add(pointer(stage, {
    move: ([x]) => { let b = 0; tops.forEach((t, k) => { if (Math.abs(t - x) < Math.abs(tops[b] - x)) b = k; }); pick(b); },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  for (let k = 0; k < N; k++) draw(k, performance.now());
  cards[REST].face.classList.add("hi");
  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "deck",
  means: "Five league cards in a fan: the one nearest the pointer rises and stands straight, the rest lean away in turn.",
  rules: [1, 2, 8, 10],
  range: [0, 45, 90],
  mount,
});
