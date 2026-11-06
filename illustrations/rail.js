/**
 * Rail (Anime Sports League): a clothes rail with five tees on hangers, one per league, each tee with its collar, its
 * sleeve seams and the league's print on the chest. The pointer picks a tee; it hangs straight and lifts so it can be
 * seen, the tees in front swing forward and the ones behind lean back, staggered outwards from it. At rest they all
 * lean back a little and one hangs straight. The read-out names the league; the slider is the stagger, in ms.
 */
const { Cam, circ, clamp, facing, fillet, fit, open, poly, prism, proj, rad, rings, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const LEAGUES = ["spin-ignite", "sky-smash", "crick-stryke", "apex-kick", "rim-crush"];
const G = 17, X = 0, BAR = 120, HOOK = 118.5, TK = 1.2, REST = -9, BACK = -22, FWD = 18, LIFT = 6, LIT = 2;
const Y0 = -14, Y1 = (LEAGUES.length - 1) * G + 14;
// A tee in its own plane: u across (0 at the middle), v up from the hem; the hanger's shoulders at v = 64.
const TEE = fillet(
  [[-24, 0], [24, 0], [24, 44], [38, 52], [32, 64], [12, 68], [6, 64], [-6, 64], [-12, 68], [-32, 64], [-38, 52], [-24, 44]],
  [2, 2, 1, 2, 2, 2, 3, 3, 2, 2, 2, 1],
);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.48);
  fit(C, [[-30, Y0 - 6, 0], [30, Y1 + 6, 0], [30, Y0 - 6, 0], [-30, Y1 + 6, 0], [0, Y0, BAR + 3], [0, Y1, BAR + 3], [-38, Y1, 40], [38, Y0, 40]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The rail: a foot and an upright at each end, and the bar between them.
  const feet = [Y0, Y1].map((y) => rings(-20, y - 4, 20, y + 4, 3, 1.2));
  feet.forEach(([r, i]) => put(solid(g), prism(P, front, r, i, 0, 4)));
  put(solid(g), prism(P, front, circ(2.4, 12).map((q) => ({ ...q, v: q.v + Y0 })), circ(1.2, 12).map((q) => ({ ...q, v: q.v + Y0 })), 4, BAR));
  const [br, bi] = rings(-1.6, Y0, 1.6, Y1, 1.2, 0.5);
  const bar = solid(g);
  put(bar, prism(P, front, br, bi, BAR - 3, BAR));

  const tees = LEAGUES.map((name, k) => {
    const grp = mk("g", {}, g);
    return { name, k, back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), marks: mk("path", { class: "nf lo" }, grp), hanger: mk("path", { class: "nf" }, grp), a: tween(k === LIT ? 0 : REST), z: tween(0), drawn: "" };
  });
  // The near upright stands in front of every tee.
  put(solid(g), prism(P, front, circ(2.4, 12).map((q) => ({ ...q, v: q.v + Y1 })), circ(1.2, 12).map((q) => ({ ...q, v: q.v + Y1 })), 4, BAR));

  function draw(t, now) {
    const th = tval(t.a, now), lift = tval(t.z, now), key = th.toFixed(2) + "," + lift.toFixed(2);
    if (key === t.drawn) return;
    t.drawn = key;
    const s = Math.sin(rad(th)), c = Math.cos(rad(th)), yb = t.k * G, top = HOOK + lift;
    // Swinging about the hook's tip (v = 84), which sits on the bar: lower points swing out further.
    const w = (u, v, d = 0) => { const dz = v - 84; return P(X + u, yb - dz * s + d * c, top + dz * c + d * s); };
    t.back.setAttribute("d", poly(TEE.map(([u, v]) => w(u, v, -TK))));
    t.face.setAttribute("d", poly(TEE.map(([u, v]) => w(u, v))));
    t.marks.setAttribute("d", open([w(-6, 64), w(0, 58), w(6, 64)]) + seg(w(-24, 44), w(-30, 58)) + seg(w(24, 44), w(30, 58)) + poly([[-10, 30], [10, 30], [10, 46], [-10, 46]].map(([u, v]) => w(u, v))));
    t.hanger.setAttribute("d", open([w(-30, 64), w(0, 74), w(30, 64)]) + seg(w(-30, 64), w(30, 64)) + open([w(0, 74), w(0, 78), w(-2.5, 81), w(-0.6, 84)]));
  }

  const B = register(stage, (_dt, now) => {
    tees.forEach((t) => draw(t, now));
    return tees.some((t) => !tdone(t.a, now) || !tdone(t.z, now));
  });
  bag.add(B.unregister);

  let act = -2;
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(0, act);
    act = a;
    tees.forEach((t) => {
      const delay = Math.abs(t.k - from) * stag;
      const th = a < 0 ? (t.k === LIT ? 0 : REST) : t.k < a ? BACK : t.k > a ? FWD : 0;
      tset(t.a, th, now, delay);
      tset(t.z, t.k === a ? LIFT : 0, now, delay);
      t.face.classList.toggle("hi", t.k === (a < 0 ? LIT : a));
    });
    read.textContent = a < 0 ? "rest" : tees[a].name;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each tee's resting chest on screen (rule 01), never by where a swinging tee is drawn.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      tees.forEach((t) => { const c = P(X, t.k * G, 60); const d = Math.hypot(c[0] - x, (c[1] - y) * 0.45); if (d < bd) { bd = d; best = t.k; } });
      pick(bd < 22 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  tees.forEach((t) => draw(t, performance.now()));
  pick(-1);
  return { set: (v) => { stag = clamp(v, 0, 120); }, destroy: bag.dispose };
}

hairline({
  name: "rail",
  means: "Five tees on a rail, one per league: the one under the pointer hangs straight and lifts, and the others lean away.",
  rules: [1, 2, 8, 10],
  range: [0, 45, 90],
  mount,
});
