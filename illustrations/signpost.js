/**
 * Signpost (Kodex): a post on a round foot with three arms at three heights, each an arrow-ended board pointing its
 * own way: products, industries, integrations. The navigation was rebuilt around what a visitor means to do; here the
 * pointer's height picks an arm, and that arm swings round to point where the pointer is, on a spring, and takes the
 * bright edge. At rest the three point three ways. The read-out names the arm; the slider is how far it follows.
 */
const { Cam, clamp, facing, fillet, fit, poly, prism, proj, rings, circ, unproj, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const ARMS = [
  { name: "products", z: 96, a: 20 },
  { name: "industries", z: 74, a: 150 },
  { name: "integrations", z: 52, a: 80 },
];
const L = 62, AH = 13, TK = 2.4, POST = 116, LIT = 0;
const BOARD = fillet([[3, -AH / 2], [L - 10, -AH / 2], [L, 0], [L - 10, AH / 2], [3, AH / 2]], [1.5, 2, 1.5, 2, 1.5]);

/** The shortest signed turn from a to b, in degrees. */
const delta = (a, b) => ((((b - a) % 360) + 540) % 360) - 180;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let follow = value;
  const C = Cam(45, 0.5, 2.05);
  fit(C, [[-L, -L, 0], [L, L, 0], [L, -L, 0], [-L, L, 0], [0, 0, POST + 4]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, circ(22, 24), circ(20.4, 24), 0, 4));
  const postG = mk("g", {}, g), post = solid(postG);
  put(post, prism(P, front, circ(2.8, 12), circ(1.6, 12), 4, POST));
  put(solid(postG), prism(P, front, circ(4, 12), circ(2.8, 12), POST, POST + 3));

  const arms = ARMS.map((a, k) => {
    const grp = mk("g", {}, g);
    return { ...a, k, grp, back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), rule: mk("path", { class: "nf lo" }, grp), sp: spring(a.a, { eps: 0.05 }), drawn: NaN };
  });

  // An arm turned away from the camera is behind the post, one turned towards it in front (rule 06).
  let ordered = "";
  function order() {
    const facing = arms.map((a) => Math.cos(((a.sp.x - 45) * Math.PI) / 180) > 0);
    const key = facing.join();
    if (key === ordered) return;
    ordered = key;
    arms.forEach((a, k) => { if (facing[k]) g.appendChild(a.grp); else g.insertBefore(a.grp, postG); });
  }

  function draw(a) {
    if (a.sp.x === a.drawn) return;
    a.drawn = a.sp.x;
    const c = Math.cos((a.sp.x * Math.PI) / 180), s = Math.sin((a.sp.x * Math.PI) / 180);
    const w = (u, v, t = 0) => P(u * c - t * s, u * s + t * c, a.z + v);
    a.back.setAttribute("d", poly(BOARD.map(([u, v]) => w(u, v, -TK))));
    a.face.setAttribute("d", poly(BOARD.map(([u, v]) => w(u, v, 0))));
    a.rule.setAttribute("d", poly([[9, -2.6], [L - 18, -2.6], [L - 18, 2.6], [9, 2.6]].map(([u, v]) => w(u, v, 0.01))));
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const a of arms) { if (stepS(a.sp, dt)) m = true; draw(a); }
    order();
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function aim(k, toward) {
    arms.forEach((a) => {
      a.sp.t += delta(a.sp.t, a.k === k && toward !== null ? a.a + delta(a.a, toward) * follow : a.a);
      a.face.classList.toggle("hi", a.k === (k < 0 ? LIT : k));
    });
    if (k !== act) { act = k; read.textContent = k < 0 ? "rest" : arms[k].name; }
    B.wake();
  }

  bag.add(pointer(stage, {
    // The arm is picked by its fixed height on the post (rule 01); it aims at the pointer put on its own plane.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      arms.forEach((a) => { const d = Math.abs(P(0, 0, a.z)[1] - y); if (d < bd) { bd = d; best = a.k; } });
      if (bd > 18) return aim(-1, null);
      const [ux, uy] = unproj(C, x, y, arms[best].z);
      aim(best, Math.hypot(ux, uy) < 4 ? null : (Math.atan2(uy, ux) * 180) / Math.PI);
    },
    leave: () => aim(-1, null),
  }));
  bag.add(() => svg.replaceChildren());
  arms.forEach(draw);
  order();
  aim(-1, null);
  return { set: (v) => { follow = clamp(v, 0.2, 1); }, destroy: bag.dispose };
}

hairline({
  name: "signpost",
  means: "A signpost with three arms: the one at the pointer's height swings round to point where the pointer is.",
  rules: [1, 5, 6, 8],
  range: [0.4, 0.8, 1],
  mount,
});
