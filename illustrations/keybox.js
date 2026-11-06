/**
 * Key box (Uniqkey): a wall cabinet of eight hooks in two rows, a key on each but one, every key a ring, a bow and a
 * toothed blade. Breach monitoring is noticing the key that isn't there: at rest the empty hook carries the only bright
 * mark. The pointer picks the key nearest it; it swings out on its hook towards you and takes the bright edge, its
 * neighbours swinging a little after it. The read-out names the hook; the slider is how far a key swings.
 */
const { Cam, clamp, facing, fillet, fit, flatDot, place, poly, prism, proj, rad, rings, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const COLS = [20, 46, 72, 98], ROWS = [84, 46], EMPTY = 5, YK = 7;
const BW = 118, BH = 104;
// A key in its own plane: u across, v down from the hook. A bow (a rounded plate with the ring's hole), then the blade.
const KEY = fillet(
  [[-6, 4], [6, 4], [6, 13], [2, 13], [2, 30], [5, 30], [5, 33], [2, 33], [2, 36], [4.5, 36], [4.5, 39], [2, 39], [2, 42], [-2, 43], [-2, 13], [-6, 13]],
  [3, 3, 1.5, 0.6, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.8, 0.8, 0.6, 1.5],
  2,
);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let swing = value;
  const C = Cam(45, 0.5, 1.95);
  fit(C, [[0, 0, 0], [BW, 0, 0], [BW, 0, BH], [0, 0, BH], [BW, 30, 0], [0, 30, 0]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The cabinet: a back board with a frame standing proud of it, and a small shelf at its foot.
  const [br, bi] = rings(0, -6, BW, 0, 2, 1);
  put(solid(g), prism(P, front, br, bi, 0, BH));
  mk("path", { class: "nf lo", d: poly([[5, 5], [BW - 5, 5], [BW - 5, BH - 5], [5, BH - 5]].map(([x, z]) => P(x, 0.01, z))) }, g);
  const [sr, si] = rings(-2, -6, BW + 2, 16, 2, 1);
  put(solid(g), prism(P, front, sr, si, 0, 4));

  const keys = [];
  ROWS.forEach((z, r) => COLS.forEach((x, c) => {
    const k = r * COLS.length + c, grp = mk("g", {}, g);
    mk("path", { class: "nf", d: seg(P(x, 0, z), P(x, YK, z)) + seg(P(x, YK, z), P(x, YK, z + 3)) }, grp);
    const key = { k, x, z, grp, empty: k === EMPTY, a: tween(0) };
    if (key.empty) key.dot = flatDot(grp, C, 1.3, "dot");
    else { key.back = mk("path", { class: "lo" }, grp); key.face = mk("path", { class: "sil" }, grp); key.ring = mk("path", { class: "nf" }, grp); key.hole = mk("path", { class: "nf lo" }, grp); }
    keys.push(key);
  }));
  const empty = keys[EMPTY];
  place(empty.dot, P(empty.x, YK, empty.z - 6));

  function draw(key, now) {
    if (key.empty) return;
    const a = rad(tval(key.a, now)), s = Math.sin(a), c = Math.cos(a);
    // Swinging on the hook: the key turns about the hook's line, its foot coming out towards you.
    const w = (u, v, t = 0) => P(key.x + u, YK + v * s + t * c, key.z - v * c + t * s);
    key.back.setAttribute("d", poly(KEY.map(([u, v]) => w(u, v, -1.4))));
    key.face.setAttribute("d", poly(KEY.map(([u, v]) => w(u, v, 0))));
    const ring = (r, v0) => poly(Array.from({ length: 16 }, (_, i) => w(Math.cos((i / 16) * Math.PI * 2) * r, v0 + Math.sin((i / 16) * Math.PI * 2) * r)));
    key.ring.setAttribute("d", ring(3.6, 2.4));
    key.hole.setAttribute("d", ring(1.6, 8.5));
  }

  const B = register(stage, (_dt, now) => {
    keys.forEach((k) => draw(k, now));
    return keys.some((k) => !tdone(k.a, now));
  });
  bag.add(B.unregister);

  let act = -2;
  function pick(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    // A key swinging out is nearer than the keys below it: it is painted last (rule 06).
    if (a >= 0) g.appendChild(keys[a].grp);
    keys.forEach((k) => {
      if (k.empty) { k.dot.setAttribute("class", a < 0 || a === k.k ? "dot" : "dot off"); return; }
      const d = a < 0 ? 9 : Math.abs((k.k % 4) - (a % 4)) + Math.abs(Math.floor(k.k / 4) - Math.floor(a / 4));
      tset(k.a, d === 0 ? swing : d === 1 ? swing * 0.4 : 0, now, d * 45);
      k.face.classList.toggle("hi", k.k === a);
    });
    read.textContent = a < 0 ? "rest" : keys[a].empty ? `hook ${a + 1} · empty` : `hook ${a + 1}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each key's rest position on screen (rule 01), never by where a swinging key is drawn.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      keys.forEach((k) => { const c = P(k.x, YK, k.z - 20); const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = k.k; } });
      pick(bd < 30 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  keys.forEach((k) => draw(k, performance.now()));
  pick(-1);
  return { set: (v) => { swing = clamp(v, 20, 80); }, destroy: bag.dispose };
}

hairline({
  name: "keybox",
  means: "A key box with one hook empty: the key nearest the pointer swings out on its hook, its neighbours a little.",
  rules: [1, 2, 4, 5],
  range: [35, 58, 75],
  mount,
});
