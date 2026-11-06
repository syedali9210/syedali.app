/**
 * Vault (Uniqkey): a plate of thirty-six keys on a rounded plinth. A scan sweeps across it on its own, lifting each
 * key as it passes; the pointer takes over the scan, lifting the keys near it, and every lifted key settles back as
 * its charge fades. Keys above half charge take the bright edge. The read-out names the key under the pointer;
 * the slider is the afterglow, in seconds.
 */
const { Cam, clamp, facing, fit, prism, proj, rings, unproj, mk, pointer, put, register, disposer, solid } = HL;

const N = 6, CELL = 17, KEY = 11, LIFT = 15, EXT = N * CELL, PB = 6, SWEEP = 2.8;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let tau = value, over = null, clock = 0;
  const C = Cam(45, 0.5, 1.95);
  fit(C, [[-6, -6, -PB], [EXT + 6, EXT + 6, -PB], [EXT + 6, -6, -PB], [-6, EXT + 6, -PB], [0, 0, LIFT + 3]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-6, -6, EXT + 6, EXT + 6, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));
  // Back to front, diagonal by diagonal, so each key covers the ones behind it.
  const keys = [];
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const x0 = i * CELL + (CELL - KEY) / 2, y0 = j * CELL + (CELL - KEY) / 2;
    const [ring, inner] = rings(x0, y0, x0 + KEY, y0 + KEY, 3.4, 1);
    keys.push({ i, j, ring, inner, e: 0, el: solid(g), drawn: NaN });
  }

  function drawKey(k) {
    const h = 2 + LIFT * k.e;
    if (Math.abs(h - k.drawn) < 0.05) return;
    k.drawn = h;
    put(k.el, prism(P, front, k.ring, k.inner, 0, h));
    k.el.sil.classList.toggle("hi", k.e > 0.5);
  }

  // Ambient: the charge fades every frame, and with no pointer the sweep keeps scanning (rule 07: it sleeps offscreen).
  const B = register(stage, (dt) => {
    clock += dt;
    const fade = Math.exp(-dt / tau);
    // The sweep: a diagonal line crossing the plate, then a pause before the next pass.
    const t = (clock % SWEEP) / SWEEP, line = t * 1.6 * 2 * (N - 1) - 0.3 * (N - 1);
    for (const k of keys) {
      let hit = 0;
      if (over) hit = Math.max(0, 1 - Math.hypot((k.i + 0.5) * CELL - over[0], (k.j + 0.5) * CELL - over[1]) / (CELL * 1.6));
      else if (t < 0.62) hit = Math.max(0, 1 - Math.abs(k.i + k.j - line) / 1.2);
      k.e = Math.max(k.e * fade, hit);
      drawKey(k);
    }
    return true;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: ([x, y]) => {
      over = unproj(C, x, y, 0);
      const i = Math.floor(over[0] / CELL), j = Math.floor(over[1] / CELL);
      read.textContent = i >= 0 && j >= 0 && i < N && j < N ? `key ${i + 1}·${j + 1}` : "rest";
      B.wake();
    },
    leave: () => { over = null; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  keys.forEach(drawKey);
  return { set: (v) => { tau = clamp(v, 0.1, 5); }, destroy: bag.dispose };
}

hairline({
  name: "vault",
  means: "A plate of keys under a scan: each key lifts as the scan or the pointer passes, then settles as its charge fades.",
  rules: [1, 3, 7, 9],
  range: [0.3, 0.8, 1.6],
  mount,
});
