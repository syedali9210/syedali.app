"""Bakes the work section's dithered fields into public/stamps/: a drift of cloud printed as a screen of dots in each project's own
inks, for its screen or film to float on.

  field-<slug>.webp   lossless, the dots hard-edged, so they stay crisp and it stays small

Each dot takes its ink and its size from the tone under it, with an ordered dither between the steps.
Run:  python scripts/stamps/fields.py [slug ...]
"""
import pathlib, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as blur

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "stamps"
CELL = 8  # px a dot
BAYER = np.array([[0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26], [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22], [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25], [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]]) / 64.0

# Each project: its ground and inks from dark to light (its theme's colours), and its field's size.
FIELDS = {
    "trace": dict(ground="#060a2c", inks=["#1b2f9e", "#2f5bea", "#8db0ff", "#eef1ff"], size=(1840, 1150), seed=5),
    "animation-engine": dict(ground="#0c0a26", inks=["#2a2a9c", "#6a5fe0", "#9a8cf2", "#ffc2e6"], size=(1840, 1150), seed=11),
    "kiprun": dict(ground="#0a0d3c", inks=["#232c94", "#3643ba", "#7d88ff", "#d6e78b"], size=(2720, 1130), seed=17),
    "kodex": dict(ground="#0a123c", inks=["#22389e", "#3550c8", "#87abff", "#d3e6a2"], size=(1840, 1150), seed=23),
    "uniqkey": dict(ground="#031517", inks=["#0c3a3f", "#14686a", "#56c79a", "#a8eccb"], size=(1840, 1150), seed=29),
    "anime-sports-league": dict(ground="#03154a", inks=["#8c1a4a", "#fc4b6c", "#ff8a3c", "#ffd36b"], size=(2720, 1130), seed=31),
}


def rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], np.uint8)


def clouds(rng, shape):
    """A drift of cloud, 0 to 1: octaves of noise, the big ones carrying it."""
    n = sum(blur(rng.normal(0, 1, shape), s) * s ** 1.1 for s in (34, 16, 7, 3))
    return (n - n.min()) / np.ptp(n)


def bake(slug, o):
    W, H = o["size"]
    cols, rows = W // CELL, H // CELL
    rng = np.random.default_rng(o["seed"])
    tone = np.clip((clouds(rng, (rows, cols)) - 0.3) * 2.1, 0, 1) ** 1.2
    # Ink and size per dot: the tone stepped, with the dither deciding between steps.
    iy, ix = np.indices((rows, cols))
    t = tone * 4 + (BAYER[iy % 8, ix % 8] - 0.5) * 0.9
    level = np.clip(np.floor(t), 0, 3).astype(int)
    on = t > 0.28
    yy, xx = np.mgrid[0:CELL, 0:CELL] + 0.5 - CELL / 2
    discs = np.stack([np.hypot(xx, yy) <= r for r in (1.9, 2.5, 3.1, 3.7)])
    mask = discs[level] & on[..., None, None]
    inks = np.stack([rgb(c) for c in o["inks"]])
    cell = inks[level][:, :, None, None, :] * mask[..., None] + rgb(o["ground"]) * ~mask[..., None]
    pic = cell.transpose(0, 2, 1, 3, 4).reshape(rows * CELL, cols * CELL, 3).astype(np.uint8)
    Image.fromarray(pic, "RGB").save(OUT / f"field-{slug}.webp", lossless=True, method=6)
    print(slug, (cols * CELL, rows * CELL), f"{(OUT / f'field-{slug}.webp').stat().st_size // 1024} kB", flush=True)


for slug, o in FIELDS.items():
    if len(sys.argv) < 2 or slug in sys.argv[1:]:
        bake(slug, o)
