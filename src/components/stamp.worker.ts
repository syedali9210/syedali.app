/**
 * The hero's stamps while they're alive, each on its own canvas in this worker (OffscreenCanvas + WebGL2), so the hover keeps
 * its pace whatever the page is doing. At rest a stamp is only its picture on the page; pointed at, this takes over.
 *
 * A stamp is a whole piece of rock with the project carved into its face (public/stamps, scripts/stamps/bake.py), each its
 * own stone. Pointed at, it lifts and tilts to the pointer on springs, and is hammered: three blows, the first where the
 * pointer came in, each jolting the rock and driving the carving deeper in a ragged wave from where it landed, with a flash and
 * a puff of stone dust. The dust and chips burst off the face, fall and float round it, and a little keeps drifting down while
 * it's held. The pointer is the lamp: the rock's body and its carving throw shadows that swing round as it moves. Let go, the
 * carving settles back to the depth it rests at; the rock itself never changes.
 */
type Init = { type: "init"; id: number; canvas: OffscreenCanvas; slug: string; base: string; w: number; h: number; box: number; dpr: number; rot: number; urgent: boolean };
type Msg =
  | Init
  | { type: "set"; id: number; t: number; lift: number; tx: number; ty: number; lx: number; ly: number; entry: [number, number] }
  | { type: "size"; id: number; w: number; h: number; box: number; dpr: number }
  | { type: "rot"; id: number; rot: number }
  | { type: "over"; id: number; on: boolean; x: number; y: number; nx: number; ny: number; k?: number; straight?: number; stage?: boolean }
  | { type: "move"; id: number; x: number; y: number }
  | { type: "smash"; id: number; x: number; y: number }
  | { type: "park"; id: number }
  | { type: "drop"; id: number };

const REST = 0.55; // the carving's depth at rest, of its full depth: as baked (bake.py REST)
const CARVE: [number, number] = [-8, 40]; // the carving's height range, px on the 768 bake (bake.py CARVE)
const BODY = 170; // the rock's body at its highest, px (bake.py BODY)
// Each stone's chips and its dust, in mid tones: dust paler than the page would vanish against it.
const STONES: Record<string, { chip: number[]; dust: number[] }> = {
  trace: { chip: [0.36, 0.37, 0.39], dust: [0.6, 0.6, 0.59] },
  "animation-engine": { chip: [0.53, 0.4, 0.27], dust: [0.72, 0.61, 0.47] },
  kiprun: { chip: [0.19, 0.21, 0.24], dust: [0.44, 0.45, 0.48] },
  kodex: { chip: [0.66, 0.65, 0.62], dust: [0.72, 0.71, 0.68] },
  uniqkey: { chip: [0.27, 0.33, 0.29], dust: [0.53, 0.58, 0.53] },
  "anime-sports-league": { chip: [0.46, 0.26, 0.18], dust: [0.7, 0.52, 0.42] },
};
const BLOWS = [0.04, 0.34, 0.66]; // seconds into the hover
const FRONT = 2.3; // how fast a blow's wave runs, stamp heights per second
const LAMP_REST: [number, number] = [-322, 352]; // the bake's light, as a lamp position
// Held, the lamp hangs up and to the left of the pointer and follows it, so the light always rakes across the carving.
const LAMP_HELD: [number, number] = [-190, 210];

const VS = `#version 300 es
layout(location = 0) in vec2 aPos;
uniform vec2 uSize, uCanvas, uTilt, uShift;
uniform float uRot, uScale, uPersp, uThick, uDepthAt;
out vec2 vUv;
out vec3 vPos, vT, vB, vN;
void main() {
  vUv = vec2(aPos.x + .5, .5 - aPos.y);
  vec3 q = vec3(aPos * uSize, -uDepthAt * uThick) * uScale;
  float c = cos(uRot), r = sin(uRot);
  mat3 Z = mat3(c, r, 0., -r, c, 0., 0., 0., 1.);
  float cx = cos(uTilt.x), sx = sin(uTilt.x), cy = cos(uTilt.y), sy = sin(uTilt.y);
  mat3 X = mat3(1., 0., 0., 0., cx, sx, 0., -sx, cx);
  mat3 Y = mat3(cy, 0., -sy, 0., 1., 0., sy, 0., cy);
  mat3 R = Y * X * Z;
  vec3 v = R * q + vec3(uShift, 0.);
  vPos = v;
  vT = R * vec3(1., 0., 0.);
  vB = R * vec3(0., 1., 0.);
  vN = R * vec3(0., 0., 1.);
  float w = 1. - v.z / uPersp;
  gl_Position = vec4(v.xy / (.5 * uCanvas), -v.z / (uPersp * 4.) * w, w);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vPos, vT, vB, vN;
uniform sampler2D uArt, uAlb, uMapN, uMapR, uMapM;
uniform vec2 uKey, uSize;
uniform vec3 uDust;
uniform vec4 uHits[3];
uniform float uFade, uSettle, uPersp, uSlice, uAsp;
out vec4 o;
const float REST = ${REST.toFixed(3)}, C0 = ${CARVE[0].toFixed(1)}, C1 = ${CARVE[1].toFixed(1)}, BODY = ${BODY.toFixed(1)};

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { return .55 * vnoise(p) + .3 * vnoise(p * 2.1 + 3.) + .15 * vnoise(p * 4.3 + 7.); }
vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
// The height that throws shadows, px: the rock's body and its carving at this depth.
float heightAt(vec2 q, float depth) {
  return textureLod(uMapM, q, 0.).r * BODY + (textureLod(uMapN, q, 0.).b * (C1 - C0) + C0) * depth;
}

void main() {
  vec4 rest = texture(uArt, vUv);
  float alpha = rest.a;
  if (alpha < .004) discard;
  vec3 V = normalize(vec3(0., 0., uPersp) - vPos);
  vec3 T = normalize(vT), B = normalize(vB), N = normalize(vN);
  vec3 Lk = normalize(vec3(uKey, 340.) - vPos);

  // The rock's side, seen when it tilts: its own stone, in shadow.
  if (uSlice > .5) {
    vec3 side = toLinear(texture(uAlb, vUv).rgb) * (.05 + .45 * max(dot(N, Lk), 0.));
    side = side / (1. + side);
    o = vec4(pow(clamp(side * 1.9, 0., 1.), vec3(1. / 2.2)) * alpha, alpha);
    return;
  }

  // How deep the carving is here: its rest depth, and a step more behind each blow's wave as it runs out from where it landed.
  vec2 asp = vec2(uAsp, 1.);
  float depth = REST, wave = 0., haze = 0., flash = 0.;
  vec2 push = vec2(0.);
  for (int i = 0; i < 3; i++) {
    vec4 hit = uHits[i];
    if (hit.w < .5 || hit.z < 0.) continue;
    vec2 d = (vUv - hit.xy) * asp;
    float dist = length(d) + .1 * (fbm(vUv * asp * 6. + float(i) * 3.7) - .5);
    float reach = hit.z * ${FRONT.toFixed(2)};
    depth += (1. - REST) / 3. * smoothstep(reach + .02, reach - .12, dist);
    float ring = exp(-pow((dist - reach) / .045, 2.)) * exp(-hit.z * 2.2);
    wave += ring;
    push += normalize(d + 1e-4) * ring;
    haze += exp(-dist * 7.) * exp(-hit.z * 4.5);
    flash += exp(-dist * 16.) * exp(-hit.z * 20.);
  }
  depth = mix(depth, REST, uSettle);
  float deepen = clamp((depth - REST) / (1. - REST), 0., 1.);

  // Parallax through the carving: it really is cut in when it tilts.
  float dpx = depth * (C1 - C0) / 768. * uSize.x;
  vec3 Vt = vec3(dot(V, T), dot(V, B), max(dot(V, N), .3));
  vec2 per = vec2(Vt.x, -Vt.y) / Vt.z * dpx / uSize;
  vec2 uv = vUv;
  float layer = 0.;
  float h = 1. - textureLod(uMapN, uv, 0.).b;
  float prev = h;
  for (int i = 0; i < 10 && layer < h; i++) {
    prev = h - layer;
    layer += .1;
    uv = vUv - per * layer;
    h = 1. - textureLod(uMapN, uv, 0.).b;
  }
  float after = h - layer;
  uv += per * .1 * clamp(after / (after - prev + 1e-4), 0., 1.);

  vec4 mapM = texture(uMapM, uv);
  float rough = max(mapM.g, .06), cav = mapM.b;
  vec2 nf = texture(uMapN, uv).xy * 2. - 1., nr = texture(uMapR, uv).xy * 2. - 1.;
  vec2 tilt = mix(nr, nf, deepen) * vec2(1., -1.);
  tilt += vec2(push.x, -push.y) * .3;
  vec3 Nd = normalize(T * tilt.x + B * tilt.y + N * sqrt(max(1. - dot(tilt, tilt), .04)));

  // The shadows the lamp throws: marched toward it over the rock's body and its carving.
  vec3 Lt = vec3(dot(Lk, T), dot(Lk, B), max(dot(Lk, N), .05));
  vec2 dir = vec2(Lt.x, -Lt.y);
  float lxy = max(length(dir), 1e-3);
  dir /= lxy;
  float tanE = Lt.z / lxy;
  float h0 = heightAt(uv, depth), block = 0.;
  for (int i = 1; i <= 16; i++) {
    float t = float(i) * float(i) * .42 + float(i) * 1.6;
    block = max(block, heightAt(uv + dir * t / vec2(768., 962.), depth) - h0 - t * tanE);
  }
  float shade = 1. - smoothstep(0., 5., block);

  // Lit as the bake lights it, so it's the same rock the moment it takes over; then the lamp moves on it.
  vec3 alb = toLinear(texture(uAlb, uv).rgb);
  vec3 Hh = normalize(Lk + V);
  float ndl = max(dot(Nd, Lk), 0.), ndh = max(dot(Nd, Hh), 0.);
  float shin = 8. + 220. * (1. - rough) * (1. - rough);
  float spec = .04 * pow(ndh, shin) * (3.2 * (1. - rough) + .4) * shade;
  float sky = (.1 + .16 * max(Nd.y, 0.)) * .048;
  vec3 col = alb * (.1 + 1. * ndl * shade) + spec + sky;
  col *= .18 + .82 * pow(cav, 1.6);
  // The dust a blow throws up, hanging over the face; the blow's flash.
  col = mix(col, toLinear(uDust) * .7, clamp(haze, 0., 1.) * .42);
  col += vec3(1., .86, .62) * flash * 1.1 + toLinear(uDust) * wave * .05;
  col = col / (1. + col);
  vec3 c = pow(clamp(col * 1.9, 0., 1.), vec3(1. / 2.2));
  o = mix(rest, vec4(c * alpha, alpha), uFade);
}`;

// The shadow on the page: the rock's own outline, softened, offset away from the light, and larger and softer the higher
// it's lifted. A tight one where it nearly touches, a wide one under it. The outline is its own small copy of the art's
// alpha (SHAPE), the rock in the middle half with clear margins round it, so a blurred mip never smears the rock's edge
// out to the texture's edge.
const SHAPE = [256, 320];
const SHADOW_VS = `#version 300 es
void main() { vec2 v = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(v * 2. - 1., 0., 1.); }`;
const SHADOW_FS = `#version 300 es
precision highp float;
uniform sampler2D uShape;
uniform vec2 uCanvas, uSize, uShift, uCast, uPx;
uniform float uRot, uScale, uLift;
out vec4 o;
// How much of the rock covers q (canvas px from its centre), blurred over about w px: a blurred mip, read in a ring.
float cover(vec2 q, float w) {
  float c = cos(-uRot), s = sin(-uRot);
  vec2 p = mat2(c, s, -s, c) * q / uScale;
  vec2 uv = vec2(p.x / uSize.x, -p.y / uSize.y) * .5 + .5;
  if (any(greaterThan(abs(uv - .5), vec2(.5)))) return 0.;
  float r = w / uScale;
  float lod = log2(max(r / uSize.x * ${SHAPE[0] / 2}. * .6, 1.));
  vec2 step_ = r * .3 / uSize;
  float a = textureLod(uShape, uv, lod).a * 2.;
  for (int i = 0; i < 6; i++) {
    float t = float(i) * 1.0472 + .5;
    a += textureLod(uShape, uv + vec2(cos(t), sin(t)) * step_, lod).a;
  }
  return a / 8.;
}
void main() {
  vec2 q = gl_FragCoord.xy / uPx - .5 * uCanvas;
  float w1 = 7. + 12. * uLift, w2 = 20. + 44. * uLift;
  float a1 = cover(q - uShift - uCast * .35, w1), a2 = cover(q - uShift - uCast, w2);
  float a = 1. - (1. - (.4 - .12 * uLift) * a1) * (1. - (.32 + .12 * uLift) * a2);
  o = vec4(vec3(.08, .07, .06) * a, a);
}`;

// The dust: soft round grains, lighter where they're fine, bronze where they're chips.
const DUST_VS = `#version 300 es
layout(location = 0) in vec4 aP;
layout(location = 1) in vec4 aC;
uniform vec2 uCanvas;
uniform float uPersp, uPx;
out vec4 vC;
void main() {
  float w = 1. - aP.z / uPersp;
  gl_Position = vec4(aP.xy / (.5 * uCanvas), 0., w);
  gl_PointSize = aP.w * uPx / w;
  vC = aC;
}`;
const DUST_FS = `#version 300 es
precision mediump float;
in vec4 vC;
uniform vec3 uChip, uDust;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2. - 1.;
  float r = dot(q, q);
  if (r > 1.) discard;
  float a = vC.x * (1. - r) * (1. - r * .6);
  vec3 c = mix(uChip * (.75 + .3 * vC.y), uDust * (.9 + .12 * vC.y), vC.z);
  o = vec4(c * a, a);
}`;

type Spring = { x: number; v: number; t: number };
const spring = (x = 0): Spring => ({ x, v: 0, t: x });
const step = (s: Spring, k: number, c: number, dt: number) => {
  s.v += (-k * (s.x - s.t) - c * s.v) * dt;
  s.x += s.v * dt;
};

type Mote = { x: number; y: number; z: number; vx: number; vy: number; vz: number; age: number; life: number; size: number; grow: number; warm: number; fine: number; drag: number; fall: number; base: number; seed: number };
type Blow = { u: number; v: number; at: number; done: boolean };

type Stamp = {
  id: number;
  gl: WebGL2RenderingContext;
  canvas: OffscreenCanvas;
  u: (n: string) => WebGLUniformLocation | null;
  us: (n: string) => WebGLUniformLocation | null;
  ud: (n: string) => WebGLUniformLocation | null;
  prog: WebGLProgram;
  shadow: WebGLProgram;
  dustProg: WebGLProgram;
  vao: WebGLVertexArrayObject;
  empty: WebGLVertexArrayObject;
  dustVao: WebGLVertexArrayObject;
  dustBuf: WebGLBuffer;
  count: number;
  stone: { chip: number[]; dust: number[] };
  ready: boolean;
  w: number;
  h: number;
  box: number;
  dpr: number;
  rot0: number;
  on: boolean;
  live: boolean;
  t: number;
  settle: number;
  k: number; // how big it is lifted
  straight: number; // how far lifting turns it upright
  stage: boolean; // lifted onto a stage, by the page
  fade: number;
  entry: [number, number];
  blows: Blow[];
  dust: Mote[];
  drift: number;
  lift: Spring;
  tx: Spring;
  ty: Spring;
  lx: Spring;
  ly: Spring;
  sx: Spring;
  sy: Spring;
  px: number;
  py: number;
  nx: number;
  ny: number;
  fresh: boolean;
  sized: boolean;
  pending: number;
};

const stamps = new Map<number, Stamp>();
let raf = 0, last = 0;
const MAX_TILT = 0.3, MAX_MOTES = 900;
const scratch = new Float32Array(MAX_MOTES * 8);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function grid(gl: WebGL2RenderingContext, nx: number, ny: number) {
  const pos = new Float32Array((nx + 1) * (ny + 1) * 2);
  let k = 0;
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) ((pos[k++] = i / nx - 0.5), (pos[k++] = 0.5 - j / ny));
  const idx = new Uint16Array(nx * ny * 6);
  k = 0;
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
      idx.set([a, c, b, b, c, d], k);
      k += 6;
    }
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  return { vao, count: idx.length };
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const sh = (t: number, src: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, src);
    gl.compileShader(x);
    return x;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

function uniforms(gl: WebGL2RenderingContext, p: WebGLProgram) {
  const cache = new Map<string, WebGLUniformLocation | null>();
  return (n: string) => {
    if (!cache.has(n)) cache.set(n, gl.getUniformLocation(p, n));
    return cache.get(n)!;
  };
}

async function init(m: Init) {
  const gl = m.canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return postMessage({ type: "failed", id: m.id });
  m.canvas.addEventListener("webglcontextlost", () => {
    stamps.delete(m.id);
    postMessage({ type: "failed", id: m.id });
  });
  const prog = program(gl, VS, FS);
  const shadow = program(gl, SHADOW_VS, SHADOW_FS);
  const dustProg = program(gl, DUST_VS, DUST_FS);
  const { vao, count } = grid(gl, 40, 50);
  const empty = gl.createVertexArray()!;
  const dustVao = gl.createVertexArray()!;
  gl.bindVertexArray(dustVao);
  const dustBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, dustBuf);
  gl.bufferData(gl.ARRAY_BUFFER, scratch.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
  const s: Stamp = {
    id: m.id, gl, canvas: m.canvas, prog, shadow, dustProg, vao, empty, dustVao, dustBuf, count, stone: STONES[m.slug] ?? STONES.trace, // an archive stone's own comes from its picture, below
    u: uniforms(gl, prog), us: uniforms(gl, shadow), ud: uniforms(gl, dustProg), ready: false,
    w: m.w, h: m.h, box: m.box, dpr: m.dpr, rot0: m.rot, on: false, live: false, t: 0, settle: 1, k: 1.3, straight: 0.62, stage: false, fade: 0, entry: [0.5, 0.5], blows: [], dust: [], drift: 0,
    lift: spring(), tx: spring(), ty: spring(), lx: spring(LAMP_REST[0]), ly: spring(LAMP_REST[1]), sx: spring(), sy: spring(), px: 0, py: 0, nx: 0, ny: 0, fresh: false, sized: false, pending: 0,
  };
  stamps.set(m.id, s);
  // The maps. Loaded here, so the page never decodes them. Set up ahead of the pointer, they wait behind whatever the page itself is loading.
  const load = async (name: string, premultiply: boolean) => {
    const blob = await (await fetch(`${m.base}${m.slug}${name}.webp`, { priority: m.urgent ? "auto" : "low" })).blob();
    return createImageBitmap(blob, { premultiplyAlpha: premultiply ? "premultiply" : "none", colorSpaceConversion: "none" });
  };
  const [art, alb, mapN, mapR, mapM] = await Promise.all([load("", true), load("-a", false), load("-n", false), load("-r", false), load("-m", false)]);
  gl.useProgram(prog);
  const tex = (unit: number, name: string, img: ImageBitmap) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    gl.uniform1i(s.u(name), unit);
    img.close();
  };
  const shape = new OffscreenCanvas(SHAPE[0], SHAPE[1]);
  const pen = shape.getContext("2d")!;
  pen.drawImage(art, SHAPE[0] / 4, SHAPE[1] / 4, SHAPE[0] / 2, SHAPE[1] / 2);
  if (!STONES[m.slug]) {
    // Its chips are its own colour, and its dust that a little paler, so both show against the page.
    const px = pen.getImageData(0, 0, SHAPE[0], SHAPE[1]).data, sum = [0, 0, 0];
    let n = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 220) (sum[0] += px[i]), (sum[1] += px[i + 1]), (sum[2] += px[i + 2]), n++;
    const avg = sum.map((v) => v / Math.max(1, n) / 255);
    s.stone = { chip: avg.map((v) => v * 0.8), dust: avg.map((v) => v * 0.72 + 0.14) };
  }
  tex(0, "uArt", art);
  tex(1, "uAlb", alb);
  tex(2, "uMapN", mapN);
  tex(3, "uMapR", mapR);
  tex(4, "uMapM", mapM);
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shape);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.useProgram(shadow);
  gl.uniform1i(s.us("uShape"), 5);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);
  s.ready = true;
  // Once now, hidden: the driver builds a program's real shaders on its first draw, so the first hover has nothing to build.
  s.fade = 1;
  s.dust.push(mote(0, 0, 0, 0, 0, 0, 1, 1, 0.5, 1, 1, 0, 0));
  draw(s);
  s.dust.length = 0;
  s.fade = 0;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  postMessage({ type: "ready", id: m.id });
  if (s.pending) ask(s);
}

// Full size only from a stamp's first lift: most of the time most of them are only pictures.
function resize(s: Stamp) {
  const W = Math.max(1, Math.round(s.box * s.dpr));
  if (s.canvas.width !== W) s.canvas.width = s.canvas.height = W;
  s.gl.viewport(0, 0, W, W);
  s.sized = true;
}

// Where a point of the stamp (u, v across it) is on the canvas now: the vertex shader's own sums, run here.
function onCanvas(s: Stamp, u: number, v: number) {
  const scale = 1 + (s.k - 1) * s.lift.x;
  const rot = -s.rot0 * (Math.PI / 180) * (1 - s.straight * s.lift.x);
  let x = (u - 0.5) * s.w * scale, y = (0.5 - v) * s.h * scale, z = 0;
  const c = Math.cos(rot), r = Math.sin(rot);
  [x, y] = [c * x - r * y, r * x + c * y];
  const cx = Math.cos(s.tx.x), sx = Math.sin(s.tx.x), cy = Math.cos(s.ty.x), sy = Math.sin(s.ty.x);
  [y, z] = [cx * y - sx * z, sx * y + cx * z];
  [x, z] = [cy * x + sy * z, -sy * x + cy * z];
  return [x + s.sx.x, y + s.sy.x, z];
}

function mote(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number, warm: number, fine: number, base: number, drag: number, fall: number, grow = 0): Mote {
  return { x, y, z, vx, vy, vz, age: 0, life, size, grow, warm, fine, drag, fall, base, seed: Math.random() * 6.28 };
}

// A blow: the rock jolts, the carving starts to deepen behind its wave, and dust and chips burst off the face.
function strike(s: Stamp, b: Blow, quiet = false) {
  b.done = true;
  if (!quiet) postMessage({ type: "blow", id: s.id, n: s.blows.indexOf(b) });
  s.lift.v -= 2.4;
  s.tx.v += rand(-1.6, 1.6);
  s.ty.v += rand(-1.6, 1.6);
  s.sy.v -= 60;
  const [x, y, z] = onCanvas(s, b.u, b.v);
  const room = MAX_MOTES - s.dust.length;
  for (let i = 0; i < Math.min(150, room); i++) {
    const a = Math.random() * Math.PI * 2, sp = rand(30, 250) * Math.sqrt(Math.random());
    s.dust.push(mote(x + rand(-6, 6), y + rand(-6, 6), z, Math.cos(a) * sp, Math.sin(a) * sp * 0.7 + rand(20, 110), rand(20, 160), rand(1.6, 3.4), rand(1.1, 3.6) * (Math.random() < 0.08 ? 1.8 : 1), Math.random(), 1, rand(0.35, 0.7), rand(2.2, 3.8), rand(40, 90)));
  }
  for (let i = 0; i < Math.min(22, MAX_MOTES - s.dust.length); i++) {
    const a = Math.random() * Math.PI * 2, sp = rand(120, 320);
    s.dust.push(mote(x, y, z, Math.cos(a) * sp, Math.sin(a) * sp * 0.6 + rand(60, 180), rand(40, 200), rand(0.8, 1.5), rand(3, 6.8), Math.random(), 0, 0.95, rand(0.5, 0.9), rand(480, 620)));
  }
  // A cloud of it, blooming out from where it struck and thinning as it goes.
  for (let i = 0; i < Math.min(6, MAX_MOTES - s.dust.length); i++) {
    const a = Math.random() * Math.PI * 2, sp = rand(18, 70);
    s.dust.push(mote(x + rand(-10, 10), y + rand(-10, 10), z + 10, Math.cos(a) * sp, Math.sin(a) * sp + 12, rand(10, 40), rand(1.1, 1.9), rand(18, 34), Math.random(), 1, 0.16, 1.6, 8, rand(40, 80)));
  }
}

function moveDust(s: Stamp, dt: number) {
  // While it's held, a little keeps drifting down round it.
  if (s.on && s.dust.length < MAX_MOTES) {
    s.drift += dt * 20;
    while (s.drift >= 1) {
      s.drift -= 1;
      const scale = 1 + (s.k - 1) * s.lift.x;
      s.dust.push(mote(s.sx.x + rand(-0.75, 0.75) * s.w * scale, s.sy.x + rand(0.15, 0.75) * s.h * scale, rand(-20, 60), rand(-8, 8), rand(-24, -8), 0, rand(3, 4.6), rand(1, 2.6), Math.random(), 1, rand(0.22, 0.4), 1.2, 6));
    }
  }
  let n = 0;
  for (const m of s.dust) {
    m.age += dt;
    if (m.age > m.life) continue;
    m.vy -= m.fall * dt;
    const k = Math.exp(-m.drag * dt);
    m.vx = m.vx * k + Math.sin(m.age * 1.7 + m.seed) * 16 * dt;
    m.vy *= k;
    m.vz *= k;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.z += m.vz * dt;
    m.size += m.grow * dt;
    s.dust[n++] = m;
  }
  s.dust.length = n;
}

function draw(s: Stamp) {
  const { gl, u, us, ud, w, h, box, dpr } = s;
  const lift = s.lift.x;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const scale = 1 + (s.k - 1) * lift;
  const rot = -s.rot0 * (Math.PI / 180) * (1 - s.straight * lift);

  // The shadow, cast away from the lamp.
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(s.shadow);
  gl.bindVertexArray(s.empty);
  gl.uniform2f(us("uCanvas"), box, box);
  gl.uniform2f(us("uPx"), dpr, dpr);
  gl.uniform2f(us("uSize"), w, h);
  gl.uniform2f(us("uShift"), s.sx.x, s.sy.x);
  const lamp = Math.hypot(s.lx.x, s.ly.x) || 1;
  const away = lift * 26;
  gl.uniform2f(us("uCast"), -3 - (s.lx.x / lamp) * away * Math.min(1, lamp / 90), -14 - lift * 34 - (s.ly.x / lamp) * away * Math.min(1, lamp / 90));
  gl.uniform1f(us("uRot"), rot);
  gl.uniform1f(us("uScale"), scale);
  gl.uniform1f(us("uLift"), lift);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(s.prog);
  gl.bindVertexArray(s.vao);
  gl.uniform2f(u("uSize"), w, h);
  gl.uniform2f(u("uCanvas"), box, box);
  gl.uniform2f(u("uTilt"), s.tx.x, s.ty.x);
  gl.uniform2f(u("uShift"), s.sx.x, s.sy.x);
  gl.uniform1f(u("uRot"), rot);
  gl.uniform1f(u("uScale"), scale);
  gl.uniform1f(u("uPersp"), 1100);
  gl.uniform1f(u("uAsp"), w / h);
  gl.uniform2f(u("uKey"), s.lx.x, s.ly.x);
  gl.uniform1f(u("uFade"), s.fade);
  gl.uniform1f(u("uSettle"), s.settle);
  gl.uniform3f(u("uDust"), s.stone.dust[0], s.stone.dust[1], s.stone.dust[2]);
  const hits = new Float32Array(12);
  s.blows.forEach((b, i) => hits.set([b.u, b.v, s.t - b.at, b.done ? 1 : 0], i * 4));
  gl.uniform4fv(u("uHits"), hits);
  // A rock has a body: its side, seen when it tilts.
  const thick = 0.06 * w * lift;
  if (thick > 0.2) {
    gl.uniform1f(u("uThick"), thick);
    gl.uniform1f(u("uSlice"), 1);
    for (let i = 6; i >= 1; i--) {
      gl.uniform1f(u("uDepthAt"), i / 6);
      gl.drawElements(gl.TRIANGLES, s.count, gl.UNSIGNED_SHORT, 0);
    }
  }
  gl.uniform1f(u("uThick"), 0);
  gl.uniform1f(u("uDepthAt"), 0);
  gl.uniform1f(u("uSlice"), 0);
  gl.drawElements(gl.TRIANGLES, s.count, gl.UNSIGNED_SHORT, 0);

  // The dust, over everything.
  if (s.dust.length) {
    let k = 0;
    for (const m of s.dust) {
      const fadeIn = Math.min(1, m.age / 0.06), fadeOut = Math.min(1, (m.life - m.age) / (m.life * 0.45));
      scratch.set([m.x, m.y, m.z, m.size, m.base * fadeIn * fadeOut, m.warm, m.fine, 0], k);
      k += 8;
    }
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(s.dustProg);
    gl.bindVertexArray(s.dustVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.dustBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, scratch, 0, k);
    gl.uniform2f(ud("uCanvas"), box, box);
    gl.uniform1f(ud("uPersp"), 1100);
    gl.uniform1f(ud("uPx"), dpr);
    gl.uniform3f(ud("uChip"), s.stone.chip[0], s.stone.chip[1], s.stone.chip[2]);
    gl.uniform3f(ud("uDust"), s.stone.dust[0], s.stone.dust[1], s.stone.dust[2]);
    gl.drawArrays(gl.POINTS, 0, s.dust.length);
    gl.enable(gl.DEPTH_TEST);
  }
}

function frame(now: number) {
  raf = 0;
  const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
  last = now;
  let busy = false;
  stamps.forEach((s) => {
    if (!s.ready || !s.live) return;
    s.lift.t = s.on ? 1 : 0;
    if (!s.sized) resize(s);
    const hw = 0.5 * s.w * s.k, hh = 0.5 * s.h * s.k;
    const ax = Math.max(-1, Math.min(1, (s.px - s.nx) / hw)), ay = Math.max(-1, Math.min(1, (s.py - s.ny) / hh));
    // Tilt to the pointer, drift a little toward it; the lamp follows quicker.
    s.tx.t = s.on ? ay * MAX_TILT : 0;
    s.ty.t = s.on ? ax * MAX_TILT : 0;
    s.sx.t = s.on ? s.nx + (s.px - s.nx) * 0.08 : 0;
    s.sy.t = s.on ? -s.ny - (s.py - s.ny) * 0.08 : 0;
    s.lx.t = s.on ? s.nx + (s.px - s.nx) * 1.2 + LAMP_HELD[0] : LAMP_REST[0];
    s.ly.t = s.on ? -s.ny - (s.py - s.ny) * 1.2 + LAMP_HELD[1] : LAMP_REST[1];
    step(s.lift, 190, 19, dt);
    step(s.tx, 120, 13, dt);
    step(s.ty, 120, 13, dt);
    step(s.sx, 160, 16, dt);
    step(s.sy, 160, 16, dt);
    step(s.lx, 300, 30, dt);
    step(s.ly, 300, 30, dt);
    if (s.on) {
      s.t += dt;
      s.fade = Math.min(1, s.fade + dt / 0.14);
      s.settle = Math.max(0, s.settle - dt / 0.2);
      for (const b of s.blows) if (!b.done && s.t >= b.at) strike(s, b);
    } else {
      s.t += dt;
      s.settle = Math.min(1, s.settle + dt / 0.45);
      // The picture back only once it's settled, flat and the lamp's home.
      if (s.settle >= 1 && Math.abs(s.lift.x) < 0.02 && Math.hypot(s.lx.x - LAMP_REST[0], s.ly.x - LAMP_REST[1]) < 20) s.fade = Math.max(0, s.fade - dt / 0.2);
    }
    moveDust(s, dt);
    draw(s);
    if (s.fresh) {
      s.fresh = false;
      postMessage({ type: "on", id: s.id });
    }
    const moving = Math.abs(s.lift.x - s.lift.t) + Math.abs(s.lift.v) + Math.abs(s.tx.x - s.tx.t) + Math.abs(s.ty.x - s.ty.t) + Math.abs(s.lx.v) + Math.abs(s.ly.v) > 0.004;
    const blowing = s.blows.some((b) => !b.done || s.t - b.at < 1.2);
    if (s.on || moving || s.dust.length || s.fade > 0 || blowing) busy = true;
    if (!s.on && s.fade <= 0 && !moving && !s.dust.length) {
      // Its last frame stays up until the page has its picture back.
      s.live = false;
      s.blows = [];
      postMessage({ type: "rest", id: s.id });
    }
  });
  if (busy) raf = requestAnimationFrame(frame);
}
// At rest at once, with nothing left moving.
function reset(s: Stamp) {
  s.on = s.live = s.fresh = false;
  s.pending = 0;
  s.fade = 0;
  s.settle = 1;
  s.dust.length = 0;
  s.blows = [];
  for (const sp of [s.lift, s.tx, s.ty, s.sx, s.sy]) sp.x = sp.t = sp.v = 0;
  s.lx.x = s.lx.t = LAMP_REST[0];
  s.ly.x = s.ly.t = LAMP_REST[1];
  s.lx.v = s.ly.v = 0;
}
function ask(s: Stamp) {
  if (!s.ready) return void (s.pending = 1);
  if (!s.live) {
    s.live = true;
    s.fresh = true;
  }
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

onmessage = ({ data: m }: MessageEvent<Msg>) => {
  if (m.type === "init") return void init(m).catch((e) => postMessage({ type: "failed", id: m.id, why: String(e) }));
  const s = stamps.get(m.id);
  if (!s) return;
  if (m.type === "size") {
    s.w = m.w;
    s.h = m.h;
    s.box = m.box;
    s.dpr = m.dpr;
    if (s.sized) resize(s);
  } else if (m.type === "rot") s.rot0 = m.rot;
  else if (m.type === "over") {
    // Off a stage the page's picture takes over at once and flies home, so nothing here moves any more. The last frame stays up while the page fades the canvas out.
    if (!m.on && m.stage) {
      reset(s);
      return void postMessage({ type: "rest", id: s.id });
    }
    const was = s.on;
    s.on = m.on;
    if (m.on) {
      s.px = m.x;
      s.py = m.y;
      s.nx = m.nx;
      s.ny = m.ny;
      s.k = m.k ?? 1.3;
      s.straight = m.straight ?? 0.62;
      s.stage = !!m.stage;
      // On a stage the picture has already flown it here: it comes in at that size and that pose, with nothing left to lift.
      if (s.stage) {
        s.lift.x = s.lift.t = 1;
        s.lift.v = 0;
        s.fade = 1;
      }
    }
    if (m.on && !was) {
      // Where the pointer came in, on the plaque: the page's y runs down, the stamp's rotated by rot0. The first blow lands
      // there, the second across from it, the third at the heart of the motif.
      const a = (s.rot0 * Math.PI) / 180, c = Math.cos(a), r = Math.sin(a);
      const lx = c * m.x + r * m.y, ly = -r * m.x + c * m.y;
      const eu = Math.min(0.8, Math.max(0.2, 0.5 + lx / s.w)), ev = Math.min(0.78, Math.max(0.16, 0.5 + ly / s.h));
      s.entry = [eu, ev];
      s.t = s.stage ? -0.16 : 0; // on a stage, a beat after it comes up
      s.blows = [
        { u: eu, v: ev, at: BLOWS[0], done: false },
        { u: 0.5 + (0.5 - eu) * 0.7, v: 0.46 + (0.46 - ev) * 0.6, at: BLOWS[1], done: false },
        { u: 0.5, v: 0.44, at: BLOWS[2], done: false },
      ];
    }
    ask(s);
  } else if (m.type === "move") {
    s.px = m.x;
    s.py = m.y;
    ask(s);
  } else if (m.type === "smash") {
    // A press: one more blow where it landed, harder, and the page's own sound for it.
    if (!s.ready || !s.live) return;
    const a = (s.rot0 * (1 - s.straight * s.lift.x) * Math.PI) / 180, c = Math.cos(a), r = Math.sin(a), big = 1 + (s.k - 1) * s.lift.x;
    const b = { u: Math.min(0.8, Math.max(0.2, 0.5 + (c * m.x + r * m.y) / (s.w * big))), v: Math.min(0.78, Math.max(0.16, 0.5 + (-r * m.x + c * m.y) / (s.h * big))), at: s.t, done: false };
    s.blows[2] = b;
    strike(s, b, true);
    strike(s, b, true);
    ask(s);
  } else if (m.type === "set") {
    // A pose set outright, for checking a frame.
    s.on = true;
    s.t = m.t;
    s.fade = 1;
    s.settle = 0;
    s.lift.x = s.lift.t = m.lift;
    s.tx.x = s.tx.t = m.tx;
    s.ty.x = s.ty.t = m.ty;
    s.lx.x = s.lx.t = m.lx;
    s.ly.x = s.ly.t = m.ly;
    s.entry = m.entry;
    s.blows = BLOWS.map((at, i) => ({ u: [m.entry[0], 1 - m.entry[0], 0.5][i], v: [m.entry[1], 0.9 - m.entry[1], 0.44][i], at, done: m.t >= at }));
    if (s.ready) {
      resize(s);
      draw(s);
      postMessage({ type: "drawn", id: s.id });
    }
  } else if (m.type === "park") {
    // Its page has gone, and a page with this stone may want it back: at rest, showing nothing, its drawing buffer given back. The maps stay.
    reset(s);
    s.gl.clear(s.gl.COLOR_BUFFER_BIT | s.gl.DEPTH_BUFFER_BIT);
    s.canvas.width = s.canvas.height = 1;
    s.sized = false;
  } else {
    s.gl.getExtension("WEBGL_lose_context")?.loseContext();
    stamps.delete(m.id);
  }
};

export {};
