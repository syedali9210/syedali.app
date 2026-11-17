"""Bakes the link preview (src/app/opengraph-image.jpg and twitter-image.jpg, named in content/seo.ts): Syed's line cut into a slab of the front page's
stone, lying on the site's paper. The slab comes out of bake.py itself, the same rock, chisel and light as the stones in the
hero, broken from a wide box, with a dressed panel sunk in its face, a fillet and a string of beads round it as on the stones'
cartouches, and the line V-cut in the site's serif. The page round it is set in Edge in the site's own fonts.

Run with the site up on localhost:3421 (or STAMPS_SITE):  python scripts/stamps/og.py
"""
import asyncio, base64, io, os, pathlib, tempfile

from PIL import Image
from playwright.async_api import async_playwright

import bake

LINE = ["Shaping products,", "building myself."]
ALT = 'Syed Ali, product designer and design engineer. His line, "Shaping products, building myself.", is cut into a slab of the stone his site is carved from.'
APP = bake.ROOT / "src" / "app"
SITE = os.environ.get("STAMPS_SITE", "http://localhost:3421/")
WB, HB = 2700, 1300  # the slab's box, px: about three times the size it's shown at, so its grain is as fine as the hero stones'
# A warm sandstone with its beds showing, from the hero's tan stone, broken as a tablet: long, its corners knocked off.
SLAB = dict(lo=(0.6, 0.47, 0.33), hi=(0.82, 0.69, 0.52), fleck=(0.44, 0.31, 0.19), spark=(0.9, 0.81, 0.66), vein=0, strata=1, rough=0.9, fresh=0.2, seed=29,
            chip=1.3, round=18, planes=(1, 3), cracks=1,
            shape=[(0.05, 0.1), (0.3, 0.05), (0.6, 0.075), (0.93, 0.04), (0.975, 0.3), (0.96, 0.62), (0.985, 0.92), (0.66, 0.955), (0.36, 0.93), (0.04, 0.965), (0.02, 0.62), (0.035, 0.35)])

# The carving, painted in the page: the panel, its fillet and beads, and the line, fitted to the panel.
CARVE_JS = """([fw, fh, S, lines]) => {
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--font-baskerville').trim() || 'Georgia, serif';
  const layer = (kind, top, r, draw) => {
    const cv = Object.assign(document.createElement('canvas'), { width: Math.round(fw * S), height: Math.round(fh * S) });
    const c = cv.getContext('2d');
    c.fillStyle = '#000';
    c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(S, 0, 0, S, 0, 0);
    c.fillStyle = c.strokeStyle = '#fff';
    c.lineCap = c.lineJoin = 'round';
    draw(c);
    return { kind, top, r, url: cv.toDataURL('image/png') };
  };
  const cx = fw / 2, cy = fh / 2, pw = fw * 0.74, ph = fh * 0.6, u = fw / 1908;
  const m = document.createElement('canvas').getContext('2d');
  m.font = `400 100px ${serif}`;
  const px = ((pw - 250 * u) / Math.max(...lines.map((l) => m.measureText(l).width))) * 100;
  const beads = (c) => {
    const x = cx - pw / 2 + 44 * u, y = cy - ph / 2 + 44 * u, w = pw - 88 * u, h = ph - 88 * u, gap = 19 * u;
    for (const [x0, y0, x1, y1] of [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]]) {
      const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / gap);
      for (let i = 0; i < n; i++) {
        c.beginPath();
        c.arc(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, 5.2 * u, 0, Math.PI * 2);
        c.fill();
      }
    }
  };
  return {
    field: [fw, fh], scale: S, ground: 0.2, size: px,
    layers: [
      // a sunk panel, smooth (a chisel-dressed floor speckled the letters away), its fillet and beads, then the line cut deep
      layer('sink', 0.12, 6 * u, (c) => (c.beginPath(), c.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 20 * u), c.fill())),
      layer('raise', 0.2, 3 * u, (c) => ((c.lineWidth = 13 * u), c.beginPath(), c.roundRect(cx - pw / 2 + 16 * u, cy - ph / 2 + 16 * u, pw - 32 * u, ph - 32 * u, 12 * u), c.stroke())),
      layer('dome', 0.26, 0, beads),
      layer('cut', 0.44, px * 0.06, (c) => {
        c.font = `400 ${px}px ${serif}`;
        c.textAlign = 'center';
        lines.forEach((l, i) => c.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * px * 1.22 + px * 0.33));
      }),
    ],
  };
}"""

# The page: the site's sheet and its paper, the slab's shadow thrown down and right from the top-left light, the slab, and the name.
PAGE_JS = """async ([slab, out]) => {
  const css = getComputedStyle(document.documentElement);
  const mono = css.getPropertyValue('--font-geist-mono').trim() || 'monospace';
  await document.fonts.load(`500 30px ${mono}`);
  const img = (src) => new Promise((ok, no) => Object.assign(new Image(), { onload() { ok(this); }, onerror: no, src }));
  const [stone, vellum, grain] = await Promise.all([img(slab), img('/stamps/paper-vellum.webp'), img('/stamps/paper-grain.webp')]);
  const [W, H] = out, k = W / 1200;
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H }), c = cv.getContext('2d');
  c.fillStyle = '#f5f5f5';
  c.fillRect(0, 0, W, H);
  for (const [tex, tile, a] of [[vellum, 360, 0.08], [grain, 180, 0.06]]) {
    c.globalAlpha = a;
    for (let y = 0; y < H; y += tile * k) for (let x = 0; x < W; x += tile * k) c.drawImage(tex, x, y, tile * k, tile * k);
  }
  c.globalAlpha = 1;
  const sw = 880 * k, sh = (sw * stone.height) / stone.width, sx = W / 2 + 14 * k, sy = H / 2 + 4 * k, turn = -0.035;
  const place = () => (c.translate(sx, sy), c.rotate(turn));
  // the shadow: the slab's own outline, darkened and softened, a long soft one and a tight one where it meets the paper
  const sil = Object.assign(document.createElement('canvas'), { width: stone.width, height: stone.height }), s = sil.getContext('2d');
  s.drawImage(stone, 0, 0);
  s.globalCompositeOperation = 'source-in';
  s.fillStyle = 'rgb(30,28,40)';
  s.fillRect(0, 0, sil.width, sil.height);
  for (const [dx, dy, blur, a] of [[30, 38, 34, 0.32], [8, 11, 9, 0.3]]) {
    c.save();
    c.filter = `blur(${blur * k}px)`;
    c.globalAlpha = a;
    place();
    c.drawImage(sil, -sw / 2 + dx * k, -sh / 2 + dy * k, sw, sh);
    c.restore();
  }
  c.save();
  place();
  c.drawImage(stone, -sw / 2, -sh / 2, sw, sh);
  c.restore();
  c.fillStyle = '#32404f';
  c.font = `500 ${15 * k}px ${mono}`;
  c.letterSpacing = `${2.1 * k}px`;
  c.textBaseline = 'alphabetic';
  c.fillText('✦ SYED ALI', 56 * k, 60 * k);
  c.fillStyle = '#596470';
  c.fillText('PRODUCT DESIGNER & DESIGN ENGINEER', 56 * k, H - 50 * k);
  c.textAlign = 'right';
  c.fillText('SYEDALI.APP', W - 56 * k, H - 50 * k);
  return cv.toDataURL('image/png');
}"""


def data_url(im):
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


async def main():
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="og-"))
    # bake.py's box, margin and output, set for a slab; the carving shown at its full depth (the hero rests at REST)
    bake.W, bake.H, bake.M, bake.REST, bake.OUT = WB, HB, 60, 1.0, tmp
    bake.CARVE = (-26.0, 40.0)  # the letters cut about three times as deep as the hero's ribbon, so they read small
    bake.STONE["og"] = SLAB
    async with async_playwright() as p:
        b = await p.chromium.launch(channel=os.environ.get("STAMPS_BROWSER", "msedge"), headless=True)
        pg = await b.new_page()
        await pg.goto(SITE, wait_until="domcontentloaded")
        await pg.evaluate("document.fonts.ready")
        await pg.evaluate("document.fonts.load('400 100px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-baskerville'))")
        spec = await pg.evaluate(CARVE_JS, [WB - 120, HB - 120, 1.5, LINE])
        bake.bake(dict(slug="og"), spec)
        slab = Image.open(tmp / "og.webp").convert("RGBA")
        slab = slab.crop(slab.getbbox())
        page = await pg.evaluate(PAGE_JS, [data_url(slab), [2400, 1260]])
        await b.close()
    im = Image.open(io.BytesIO(base64.b64decode(page.split(",")[1]))).convert("RGB").resize((1200, 630), Image.LANCZOS)
    # a JPEG well under 300 kB: WhatsApp drops a preview picture much bigger than that
    for name in ("opengraph-image", "twitter-image"):
        im.save(APP / f"{name}.jpg", quality=86, optimize=True, progressive=True)
        (APP / f"{name}.alt.txt").write_text(ALT, encoding="utf-8")
    print("baked", APP / "opengraph-image.jpg", f"{(APP / 'opengraph-image.jpg').stat().st_size // 1024} kB, line at {spec['size']:.0f} px")


asyncio.run(main())
