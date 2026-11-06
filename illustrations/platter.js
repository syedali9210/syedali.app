/**
 * Platter (Animation Engine): a phone standing on a turntable, the way the engine turns a device to frame a shot.
 * The pointer's x turns the platter, on a spring; a notch on the rim and the phone's screen, notch and camera turn
 * with it. At rest the phone stands three-quarters on. The read-out is the angle; the slider is how far it can turn.
 */
const { Cam, clamp, lerp, facing, fit, prism, proj, rings, rrect, circ, ringAt, poly, open, spring, stepS, mk, pointer, put, register, disposer, solid, rad } = HL;

const R = 50, PH = 8, W = 34, D = 5, H = 70, REST = -28;

/** A ring of samples turned by a degrees about the origin, normals with it. */
function turn(ring, a) {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
  return ring.map((q) => ({ u: q.u * c - q.v * s, v: q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let swing = value;
  const C = Cam(45, 0.5, 2.05);
  fit(C, [[-R, -R, -PH], [R, R, -PH], [R, -R, -PH], [-R, R, -PH], [0, 0, H + 4], [-W / 2, 0, H], [W / 2, 0, H]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // The platter: a disc on a narrower foot, both rounded.
  const foot = circ(R - 10, 28), footIn = circ(R - 11.5, 28), disc = circ(R, 32), discIn = circ(R - 2, 32);
  put(solid(g), prism(P, front, foot, footIn, -PH - 4, -PH));
  put(solid(g), prism(P, front, disc, discIn, -PH, 0));
  const rim = mk("path", { class: "nf lo" }, g); // the platter's grooves, turning with it
  const notch = mk("path", { class: "nf" }, g);
  const phone = solid(g);
  const face = mk("path", { class: "nf" }, g), detail = mk("path", { class: "nf lo" }, g);

  const [slab, slabIn] = rings(-W / 2, -D / 2, W / 2, D / 2, 2.4, 0.7);
  const a = spring(REST, { eps: 0.05 });
  let drawn = NaN;

  // A point on the phone's face plane (the +v side, or -v when turned past the edge), at u across and z up, turned by t.
  const onFace = (u, z, t, side) => {
    const c = Math.cos(rad(t)), s = Math.sin(rad(t)), v = side * (D / 2 + 0.01);
    return P(u * c - v * s, u * s + v * c, z);
  };

  function draw(t) {
    if (t === drawn) return;
    drawn = t;
    put(phone, prism(P, front, turn(slab, t), turn(slabIn, t), 0, H));
    rim.setAttribute("d", [R - 9, R - 17, R - 25].map((r) => poly(ringAt(P, circ(r, 30), 0))).join(""));
    const tn = turn([{ u: R - 6, v: 0, nu: 1, nv: 0 }, { u: R - 1, v: 0, nu: 1, nv: 0 }], t * 1.0);
    notch.setAttribute("d", open([P(tn[0].u, tn[0].v, 0), P(tn[1].u, tn[1].v, 0)]));
    // The screen faces whichever broad side looks at the camera.
    const n = turn([{ u: 0, v: 0, nu: 0, nv: 1 }], t)[0], side = front(n) ? 1 : -1;
    const scr = rrect(-W / 2 + 2.6, 4, W / 2 - 2.6, H - 4, 4.5, 5).map((q) => onFace(side * q.u, q.v, t, side));
    face.setAttribute("d", poly(scr));
    const pill = rrect(-5, H - 9, 5, H - 6.5, 1.25, 4).map((q) => onFace(side * q.u, q.v, t, side));
    const cam = rrect(-W / 2 + 4, H - 16, -W / 2 + 12, H - 6, 2.5, 4).map((q) => onFace(-side * q.u, q.v, t, -side));
    detail.setAttribute("d", side > 0 ? poly(pill) : poly(cam));
  }

  const B = register(stage, (dt) => {
    const m = stepS(a, dt);
    draw(a.x);
    return m;
  });
  bag.add(B.unregister);

  // One bright edge, always the phone's: it is the thing being framed (rule 04).
  phone.sil.classList.add("hi");
  bag.add(pointer(stage, {
    move: ([x]) => {
      a.t = lerp(-swing, swing, clamp((x - 80) / 240, 0, 1));
      read.textContent = String(Math.round(((a.t % 360) + 360) % 360)).padStart(3, "0") + "°";
      B.wake();
    },
    leave: () => { a.t = REST; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw(a.x);
  return { set: (v) => { swing = v; }, destroy: bag.dispose };
}

hairline({
  name: "platter",
  means: "A phone on a turntable: the pointer turns it, the way the engine turns a device to frame a shot.",
  rules: [3, 5, 8, 9],
  range: [45, 90, 150],
  mount,
});
