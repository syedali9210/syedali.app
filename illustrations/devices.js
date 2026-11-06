/**
 * Devices (Animation Engine): a plinth with the four devices the engine renders on, standing side by side and leaning
 * back a little: an iPhone, the iPhone Duo open flat with its hinge down the middle, an iPad, and a MacBook open on its
 * base. Each screen is inset in its bezel; the phones have their island. The pointer picks a device; it stands up
 * straight and lifts, and takes the bright edge. The read-out names it; the slider is the lean at rest, in degrees.
 */
const { Cam, clamp, fillet, fit, poly, proj, rad, rings, prism, facing, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const Y = 14, Z = 8, TK = 3;
const DEV = [
  { name: "iphone", x: 8, w: 24, h: 50, r: 5, island: 1 },
  { name: "duo", x: 40, w: 44, h: 50, r: 5, island: 1, hinge: 1 },
  { name: "ipad", x: 92, w: 46, h: 64, r: 4 },
  { name: "macbook", x: 148, w: 64, h: 42, r: 3, laptop: 1 },
];
const X1 = 220, LIFT = 16, REST = 2;

const rr = (w, h, r) => fillet([[0, 0], [w, 0], [w, h], [0, h]], [r, r, r, r]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lean = -value;
  const C = Cam(45, 0.5, 1.48);
  fit(C, [[-4, 0, 0], [X1, 52, 0], [X1, 0, 0], [-4, 52, 0], [92, Y, 64 + Z + LIFT], [148, Y - 10, 50 + Z]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-4, 0, X1, 30, 3, 1.4);
  put(solid(g), prism(P, front, pr, pi, 0, Z));
  // The MacBook's base lies on the plinth's far end, in front of its screen.
  const mb = DEV[3], [lr, li] = rings(mb.x, Y + 1, mb.x + mb.w, Y + 36, 3, 1.2);
  put(solid(g), prism(P, front, lr, li, Z, Z + 2.4));
  mk("path", { class: "nf lo", d: poly([[mb.x + 6, Y + 6], [mb.x + mb.w - 6, Y + 6], [mb.x + mb.w - 6, Y + 20], [mb.x + 6, Y + 20]].map(([x, y]) => P(x, y, Z + 2.4))) + poly([[mb.x + 22, Y + 24], [mb.x + mb.w - 22, Y + 24], [mb.x + mb.w - 22, Y + 33], [mb.x + 22, Y + 33]].map(([x, y]) => P(x, y, Z + 2.4))) }, g);

  const devs = DEV.map((d, k) => ({
    ...d, k, shape: rr(d.w, d.h, d.r), screen: rr(d.w - 5, d.h - 5, Math.max(1, d.r - 2)),
    back: mk("path", { class: "lo" }, g), face: mk("path", { class: "sil" }, g), marks: mk("path", { class: "nf lo" }, g),
    a: tween(d.laptop ? -16 : lean), z: tween(0), drawn: "",
  }));

  function draw(d, now) {
    const th = tval(d.a, now), lift = tval(d.z, now), key = th.toFixed(2) + "," + lift.toFixed(2);
    if (key === d.drawn) return;
    d.drawn = key;
    const s = Math.sin(rad(th)), c = Math.cos(rad(th)), z0 = Z + (d.laptop ? 2.4 : 0) + lift;
    const w = (u, v) => P(d.x + u, Y + v * s, z0 + v * c);
    const wb = (u, v) => P(d.x + u, Y + v * s - TK * c, z0 + v * c + TK * s);
    d.back.setAttribute("d", poly(d.shape.map((p) => wb(p[0], p[1]))));
    d.face.setAttribute("d", poly(d.shape.map((p) => w(p[0], p[1]))));
    let m = poly(d.screen.map((p) => w(p[0] + 2.5, p[1] + 2.5)));
    if (d.island) m += poly(rr(9, 2.6, 1.3).map((p) => w(d.w / (d.hinge ? 4 : 2) - 4.5 + p[0], d.h - 6 + p[1])));
    if (d.hinge) m += seg(w(d.w / 2, 2), w(d.w / 2, d.h - 2));
    d.marks.setAttribute("d", m);
  }

  const B = register(stage, (_dt, now) => {
    devs.forEach((d) => draw(d, now));
    return devs.some((d) => !tdone(d.a, now) || !tdone(d.z, now));
  });
  bag.add(B.unregister);

  let act = -2;
  function pick(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    devs.forEach((d) => {
      const on = d.k === a, rest = d.laptop ? -16 : lean;
      tset(d.a, on ? (d.laptop ? -4 : 0) : rest, now, a < 0 ? 0 : Math.abs(d.k - a) * 40);
      tset(d.z, on && !d.laptop ? LIFT : 0, now, 0);
      d.face.classList.toggle("hi", d.k === (a < 0 ? REST : a));
    });
    read.textContent = a < 0 ? "rest" : devs[a].name;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each device's rest centre on screen (rule 01): one row, so the nearest centre along x.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      devs.forEach((d) => { const c = P(d.x + d.w / 2, Y, Z + d.h / 2); const dd = Math.abs(c[0] - x); if (dd < bd && Math.abs(c[1] - y) < 70) { bd = dd; best = d.k; } });
      pick(bd < 40 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  devs.forEach((d) => draw(d, performance.now()));
  pick(-1);
  return { set: (v) => { lean = -clamp(v, 0, 20); act = -3; pick(-1); }, destroy: bag.dispose };
}

hairline({
  name: "devices",
  means: "The four devices the engine renders on: the one under the pointer stands up straight and lifts off the plinth.",
  rules: [1, 4, 5, 10],
  range: [6, 12, 18],
  mount,
});
