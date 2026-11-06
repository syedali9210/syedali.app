/**
 * Cabinet (Kodex): a filing cabinet of four drawers, each front with a handle and a label holder. The pointer's height
 * picks a drawer: it slides out the furthest, its neighbours less, each on its own spring, and it takes the bright edge.
 * At rest the second drawer stands half open. The read-out names the drawer; the slider is the reach, in drawers.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, rrect, poly, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const W = 64, D = 52, ND = 4, DH = 22, GAP = 3, BASE = 6, H = BASE + ND * (DH + GAP) + 4, OUT = 30, REST = 1;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;
  const C = Cam(45, 0.5, 1.92);
  fit(C, [[0, 0, 0], [W, D + OUT, 0], [W, 0, 0], [0, D + OUT, 0], [0, 0, H], [W, 0, H], [0, D + OUT, H]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [kr, ki] = rings(0, 0, W, D, 4, 1.4);
  put(solid(g), prism(P, front, kr, ki, 0, H));
  // The drawers are painted bottom to top, so a pulled drawer above covers the one below.
  const drawers = [];
  for (let k = 0; k < ND; k++) {
    const z0 = BASE + k * (DH + GAP);
    drawers.push({ z0, body: solid(g), face: solid(g), marks: mk("path", { class: "nf lo" }, g), sp: spring(k === ND - 1 - REST ? OUT * 0.45 : 0, { eps: 0.02 }), drawn: NaN });
  }
  const n = (k) => ND - k; // drawer 1 is the top one

  function draw(dr) {
    const s = dr.sp.x;
    if (s === dr.drawn) return;
    dr.drawn = s;
    const y = D + s;
    // Only what stands out of the cabinet is drawn; the rest is inside it.
    if (s > 0.6) { const [r, i] = rings(4, D, W - 4, y, 1.2, 0.6); put(dr.body, prism(P, front, r, i, dr.z0 + 1, dr.z0 + DH - 2)); }
    else put(dr.body, { sil: "", crease: "" });
    const [fr, fi] = rings(1.5, y, W - 1.5, y + 2.4, 1, 0.4);
    put(dr.face, prism(P, front, fr, fi, dr.z0, dr.z0 + DH));
    const onFace = (q) => P(q.u, y + 2.41, q.v);
    const handle = rrect(W / 2 - 11, dr.z0 + 5, W / 2 + 11, dr.z0 + 9, 2, 4).map(onFace);
    const label = rrect(W / 2 - 8, dr.z0 + 13, W / 2 + 8, dr.z0 + 18, 1, 3).map(onFace);
    dr.marks.setAttribute("d", poly(handle) + poly(label));
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const dr of drawers) { if (stepS(dr.sp, dt)) m = true; draw(dr); }
    return m;
  });
  bag.add(B.unregister);

  function pick(a) {
    drawers.forEach((dr, k) => {
      const u = a < 0 ? (k === ND - 1 - REST ? 0 : 9) : Math.abs(k - a) / reach;
      dr.sp.t = a < 0 ? (k === ND - 1 - REST ? OUT * 0.45 : 0) : OUT * (u <= 0 ? 1 : u < 1 ? 1 - u * 0.75 : 0);
      dr.face.sil.classList.toggle("hi", k === (a < 0 ? ND - 1 - REST : a));
    });
    read.textContent = a < 0 ? "rest" : `drawer ${n(a)}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each drawer's rest front (rule 01): the one whose front centre is nearest the pointer's height.
    move: ([, y]) => {
      let best = 0, bd = Infinity;
      drawers.forEach((dr, k) => { const d = Math.abs(P(W / 2, D, dr.z0 + DH / 2)[1] - y); if (d < bd) { bd = d; best = k; } });
      pick(bd < 30 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  drawers.forEach(draw);
  pick(-1);
  return { set: (v) => { reach = v; }, destroy: bag.dispose };
}

hairline({
  name: "cabinet",
  means: "A filing cabinet: the drawer at the pointer's height slides out, and the ones beside it follow less far.",
  rules: [1, 3, 4, 5],
  range: [1, 2, 3.5],
  mount,
});
