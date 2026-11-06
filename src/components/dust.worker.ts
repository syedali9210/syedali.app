/**
 * The archive's dust, drawn in a worker on a canvas laid over the page (OffscreenCanvas + WebGL2), so it keeps its pace
 * while the page is busy opening the piece (a figure's page, a film's decoder). The page hands the canvas over once it's
 * idle, and the context, the program and a first draw are all made then, so an opening has nothing left to build. For
 * each opening the page sends the picture (an ImageBitmap) with where it is and where it's going; the worker samples it
 * into grains, flies them, and says "done" the frame the last one lands. In, the dots then hold until the page says
 * stop (it has the real picture up by then); out, they've faded home. The flight is the 2D fallback's, in Archive.tsx.
 * Given the stone it's leaving (or going home to), each grain starts on that stone, in its colour, and turns to the picture's
 * as it lands, so even a white figure's flight shows, and it reads as the stone itself turning to dust.
 */
type Rect = { left: number; top: number; width: number; height: number };
type Run = { type: "run"; id: number; bitmap: ImageBitmap; stone?: ImageBitmap; stage: Rect; card: Rect; mode: "in" | "out"; vw: number; vh: number; dpr: number };
type Msg = { type: "init"; canvas: OffscreenCanvas } | Run | { type: "stop"; id: number };

const VS = `#version 300 es
in vec2 aFrom; in vec2 aTo; in vec3 aCol; in vec3 aStone; in vec2 aLW;
uniform float uT, uOut, uSize; uniform vec2 uRes;
out vec4 vCol;
void main() {
  float t = clamp((uT - aLW.x) / .62, 0., 1.);
  float e = t < .5 ? 4. * t * t * t : 1. - pow(-2. * t + 2., 3.) / 2.;
  vec2 a = mix(aFrom, aTo, uOut), b = mix(aTo, aFrom, uOut);
  float arc = sin(3.14159265 * e);
  vec2 p = mix(a, b, e) + vec2(sin(aLW.y + e * 6.) * 22. * arc, -arc * (40. + 24. * sin(aLW.y)));
  float al = uOut > .5 ? (t <= 0. ? 1. : max(0., 1. - e * 1.15)) : min(1., e * 6.);
  // e runs from where it's leaving to where it's going; going home, that's the stone's end last.
  vCol = vec4(mix(aStone, aCol, smoothstep(.3, .85, mix(e, 1. - e, uOut))) * al, al);
  gl_Position = vec4(p / uRes * vec2(2., -2.) + vec2(-1., 1.), 0., 1.);
  gl_PointSize = uSize * (.8 + .4 * fract(aLW.y * 7.3));
}`;
const FS = `#version 300 es
precision mediump float;
in vec4 vCol; out vec4 o;
void main() {
  // A round grain, its edge soft by about a pixel.
  vec2 q = gl_PointCoord - .5;
  float a = 1. - smoothstep(.16, .25, dot(q, q));
  if (a <= 0.) discard;
  o = vCol * a;
}`;

let canvas: OffscreenCanvas;
let gl: WebGL2RenderingContext | null = null;
let prog: WebGLProgram | null = null;
let current = 0, raf = 0;
const bufs: WebGLBuffer[] = [];

// Each grain's path (from, to), its colour on the picture and on the stone, and its lag and wobble.
function upload(...data: Float32Array[]) {
  ["aFrom", "aTo", "aCol", "aStone", "aLW"].forEach((name, b) => {
    gl!.bindBuffer(gl!.ARRAY_BUFFER, bufs[b]);
    gl!.bufferData(gl!.ARRAY_BUFFER, data[b], gl!.STATIC_DRAW);
    const loc = gl!.getAttribLocation(prog!, name);
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, b === 2 || b === 3 ? 3 : 2, gl!.FLOAT, false, 0, 0);
  });
}

function setup() {
  gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
  if (!gl) return false;
  const sh = (type: number, src: string) => {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
  gl.useProgram((prog = p));
  for (let i = 0; i < 5; i++) bufs.push(gl.createBuffer()!);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  // One invisible grain, drawn now: the driver builds its real shaders on a program's first draw, not at link.
  upload(new Float32Array(2), new Float32Array(2), new Float32Array(3), new Float32Array(3), new Float32Array(2));
  gl.drawArrays(gl.POINTS, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return true;
}

function run(m: Run) {
  cancelAnimationFrame(raf);
  current = m.id;
  const { id, stage, card, mode, bitmap, stone } = m;
  const w = Math.max(1, Math.round(stage.width)), h = Math.max(1, Math.round(stage.height));
  // The picture as the stage shows it: cover, from the top.
  const pic = new OffscreenCanvas(w, h).getContext("2d", { willReadFrequently: true })!;
  const s = Math.max(w / bitmap.width, h / bitmap.height);
  pic.drawImage(bitmap, (w - bitmap.width * s) / 2, 0, bitmap.width * s, bitmap.height * s);
  bitmap.close();
  const px = pic.getImageData(0, 0, w, h).data;
  // The stone, small: where its outline is, and its colour there.
  const SW = 96, SH = 120;
  let rock: Uint8ClampedArray | null = null;
  if (stone) {
    const g = new OffscreenCanvas(SW, SH).getContext("2d", { willReadFrequently: true })!;
    g.drawImage(stone, 0, 0, SW, SH);
    stone.close();
    rock = g.getImageData(0, 0, SW, SH).data;
  }
  const on = (u: number, v: number) => (Math.floor(v * SH) * SW + Math.floor(u * SW)) * 4;
  // Grains this small are many, so the picture still forms out of them.
  const step = Math.max(2, Math.ceil(Math.sqrt((w * h) / 52000)));
  const n = Math.ceil(w / step) * Math.ceil(h / step);
  const from = new Float32Array(n * 2), to = new Float32Array(n * 2), col = new Float32Array(n * 3), dirt = new Float32Array(n * 3), lw = new Float32Array(n * 2);
  const left = card.left + card.width / 2 < stage.left + stage.width / 2;
  let k = 0;
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step, k++) {
      const i = (y * w + x) * 4;
      to[k * 2] = stage.left + x;
      to[k * 2 + 1] = stage.top + y;
      col[k * 3] = px[i] / 255;
      col[k * 3 + 1] = px[i + 1] / 255;
      col[k * 3 + 2] = px[i + 2] / 255;
      // It starts at the same place on the stone as it lands on the picture, or, if that's off the stone's outline, somewhere on it.
      let u = x / w, v = y / h;
      if (rock) for (let t = 0; t < 8 && rock[on(u, v) + 3] < 128; t++) (u = Math.random()), (v = Math.random());
      const jog = rock ? 8 : 24, s = rock ? on(u, v) : 0, stoned = rock && rock[s + 3] >= 128, shade = 0.86 + Math.random() * 0.28;
      from[k * 2] = card.left + u * card.width + (Math.random() - 0.5) * jog;
      from[k * 2 + 1] = card.top + v * card.height + (Math.random() - 0.5) * jog;
      for (let c = 0; c < 3; c++) dirt[k * 3 + c] = stoned ? (rock![s + c] / 255) * shade : col[k * 3 + c];
      const near = left ? x / w : 1 - x / w;
      lw[k * 2] = (mode === "in" ? near : 1 - near) * 0.3 + Math.random() * 0.08;
      lw[k * 2 + 1] = Math.random() * Math.PI * 2;
    }
  const g = gl!;
  const W = Math.round(m.vw * m.dpr), H = Math.round(m.vh * m.dpr);
  if (canvas.width !== W || canvas.height !== H) (canvas.width = W), (canvas.height = H);
  g.viewport(0, 0, W, H);
  upload(from, to, col, dirt, lw);
  const uT = g.getUniformLocation(prog!, "uT");
  g.uniform2f(g.getUniformLocation(prog!, "uRes"), m.vw, m.vh);
  g.uniform1f(g.getUniformLocation(prog!, "uOut"), mode === "out" ? 1 : 0);
  g.uniform1f(g.getUniformLocation(prog!, "uSize"), Math.max(3, 2.3 * m.dpr));
  const D = mode === "in" ? 720 : 850;
  const t0 = performance.now();
  const draw = (now: number) => {
    if (id !== current) return;
    const T = (now - t0) / D;
    g.clear(g.COLOR_BUFFER_BIT);
    g.uniform1f(uT, T);
    g.drawArrays(g.POINTS, 0, n);
    if (T < 1) return void (raf = requestAnimationFrame(draw));
    if (mode === "out") g.clear(g.COLOR_BUFFER_BIT);
    postMessage({ type: "done", id });
  };
  raf = requestAnimationFrame(draw);
}

onmessage = ({ data: m }: MessageEvent<Msg>) => {
  if (m.type === "init") {
    canvas = m.canvas;
    postMessage({ type: "ready", ok: setup() });
  } else if (m.type === "run") run(m);
  else if (m.id === current) {
    current = 0;
    cancelAnimationFrame(raf);
    gl?.clear(gl.COLOR_BUFFER_BIT);
  }
};

export {};
