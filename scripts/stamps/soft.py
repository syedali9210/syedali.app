"""The soft things the page would otherwise have to work out on the fly, baked to small pictures so a phone only has to move them.

  - A shadow per hero rock: a blurred copy of its outline. As a filter it was redrawn whenever a stone moved or grew.
  - The dome, in each theme: nested bells of colour run through a wide blur. As a live SVG filter its first paint was slow.
  - The paper's two noise tiles, in each theme. As SVG turbulence the GPU redrew them on every theme switch and page change, which was most
    of what stalled those. Dark is the same flecks inverted, which was a filter that ran on the grain every frame.

Run: python scripts/stamps/soft.py  (needs public/stamps/<slug>-sm.webp from `npm run stamps`, and Edge for the paper)
"""
import asyncio
import io
import pathlib

import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
from scipy.ndimage import gaussian_filter as blur

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public/stamps"
SLUGS = ["trace", "animation-engine", "kiprun", "kodex", "uniqkey", "anime-sports-league"]

# The shadow's ink, and its two blurs in px on the 512 picture (a tight one close under the rock, a wide one that spreads).
INK = (20, 26, 40)
PAD = 0.4  # the picture's margin each side, of the rock's box: CSS hangs it at -40%, 180% wide


def shadow(slug):
    a = np.asarray(Image.open(OUT / f"{slug}-sm.webp").convert("RGBA"), np.float32)[..., 3] / 255
    h, w = a.shape
    px, py = round(w * PAD), round(h * PAD)
    big = np.zeros((h + 2 * py, w + 2 * px), np.float32)
    big[py : py + h, px : px + w] = a
    s = np.clip(blur(big, 19) * 0.24 + blur(big, 42) * 0.17, 0, 1)
    rgba = np.dstack([np.full_like(s, c) for c in INK] + [s * 255]).astype(np.uint8)
    W = 240
    im = Image.fromarray(rgba, "RGBA").resize((W, round(W * big.shape[0] / big.shape[1])), Image.LANCZOS)
    im.save(OUT / f"{slug}-shadow.webp", quality=70, method=6, alpha_quality=80)
    return im.size


# The dome (Dome.tsx), its colours sampled down the middle of Abhijit Rout's image. Where each bell's top sits, of 1280.
PEAKS = [40, 290, 380, 445, 510, 575, 640, 710, 800]
LIGHT = ["#ecbafc", "#e8b6e2", "#eaa4ad", "#f0876d", "#f5ab92", "#f9c8b6", "#fcdfd3", "#fef2ec", "#ffffff"]
DARK = ["#ecbafc", "#e8b6e2", "#eaa4ad", "#f0876d", "#e46332", "#bc4017", "#831c0b", "#3a0503", "#0b0808"]
SCALE = 0.64  # px per unit of its 1000 x 1280
MARGIN = 300  # units past each side and the foot, so the blur never thins at the frame's edges


def dome(name, colours):
    W, H = round((1000 + 2 * MARGIN) * SCALE), round((1280 + MARGIN) * SCALE)
    xs = (np.arange(W) + 0.5) / SCALE - MARGIN
    ys = (np.arange(H) + 0.5) / SCALE
    col = np.zeros((H, W, 3), np.float32)
    alpha = np.zeros((H, W), np.float32)
    for peak, c in zip(PEAKS, colours):
        # A Gaussian across the width, sigma 670 of 1000; everything below its curve is this colour.
        top = 1280 - (1280 - peak) * np.exp(-(((xs - 500) / 670) ** 2))
        inside = ys[:, None] >= top[None, :]
        rgb = [int(c[i : i + 2], 16) / 255 for i in (1, 3, 5)]
        col[inside] = rgb
        alpha[inside] = 1
    sigma = 22 * SCALE
    a = blur(alpha, sigma)
    premul = np.dstack([blur(col[..., i] * alpha, sigma) for i in range(3)])
    # Where it's nearly see-through it keeps the outermost colour: anything darker there shows as a dark halo round the rim on the dark theme.
    rim = np.array([int(colours[0][i : i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)
    rgb = np.where(a[..., None] > 1e-3, premul / np.maximum(a[..., None], 1e-3), rim)
    # Keep the frame only: its own 1000 x 1280.
    x0, x1 = round(MARGIN * SCALE), round((MARGIN + 1000) * SCALE)
    y1 = round(1280 * SCALE)
    out = np.dstack([rgb[:y1, x0:x1], a[:y1, x0:x1]])
    # The first bell's blur runs past the frame's top edge, which on the dark theme showed as a faint flat line. It fades out before it gets there.
    t = np.clip((np.arange(y1) + 0.5) / (70 * SCALE), 0, 1)
    out[..., 3] *= (t * t * (3 - 2 * t))[:, None]
    im = Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")
    im.save(OUT / f"dome-{name}.webp", quality=92, method=6, alpha_quality=100, exact=True)
    return im.size


# The paper's tiles, drawn from the SVG noise they replace: a fibre, tiled at 360 css px, and a finer grain, tiled at 180.
PAPER = {
    "vellum": (360, "<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='v'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.35 0 0 0 0 0.41 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(#v)'/></svg>"),
    "grain": (180, "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='2.2' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"),
}


async def paper():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="msedge", headless=True)
        out = []
        for name, (size, svg) in PAPER.items():
            ctx = await b.new_context(viewport={"width": size, "height": size}, device_scale_factor=1)
            pg = await ctx.new_page()
            await pg.set_content(f"<!doctype html><style>html,body{{margin:0;background:transparent}}svg{{display:block}}</style>{svg}")
            shot = await pg.screenshot(omit_background=True)
            await ctx.close()
            light = np.asarray(Image.open(io.BytesIO(shot)).convert("RGBA")).copy()
            dark = light.copy()
            dark[..., :3] = 255 - dark[..., :3]  # what filter: invert(1) did
            for tag, px in (("", light), ("-dark", dark)):
                path = OUT / f"paper-{name}{tag}.webp"
                Image.fromarray(px, "RGBA").save(path, quality=35, method=6, alpha_quality=40)
                out.append((path.name, path.stat().st_size // 1024))
        await b.close()
    return out


if __name__ == "__main__":
    for s in SLUGS:
        print(s, shadow(s), (OUT / f"{s}-shadow.webp").stat().st_size // 1024, "kB")
    for name, colours in (("light", LIGHT), ("dark", DARK)):
        print("dome", name, dome(name, colours), (OUT / f"dome-{name}.webp").stat().st_size // 1024, "kB")
    print(asyncio.run(paper()))
