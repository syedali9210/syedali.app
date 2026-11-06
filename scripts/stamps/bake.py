"""Bakes the hero's stamps into public/stamps/: each project as a whole piece of rock, broken and chipped round its edge,
with the project's motif (motifs.js, drawn in the browser with the site's own fonts) carved into its face inside a cartouche
on a dressed panel, and the maps its hover is lit from. Each is its own stone.

  <slug>.webp      the rock as it rests on the page, lit from the top left, 768 wide, its outline in alpha
  <slug>-sm.webp   the same at 512, for the page
  <slug>-a.webp    its colour unlit: the stone, its grain, flecks and veins, the dark in its cracks
  <slug>-n.webp    normal x, normal y at full depth; the carving's height
  <slug>-r.webp    normal x, normal y at rest
  <slug>-m.webp    the body's height, roughness, cavity

At rest the carving is shown at REST of its full depth; the hover hammers it to the full depth. The rock's own body doesn't
change: its height (BODY px at most) is kept apart from the carving's (CARVE px), so the worker can deepen one alone.

Run with the site up on localhost:3418 (or STAMPS_SITE), in Edge (or STAMPS_BROWSER=chromium):  python scripts/stamps/bake.py [slug ...]   or   bake.py pieces [piece ...] for the archive's
"""
import asyncio, base64, io, os, pathlib, re, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_fill_holes, distance_transform_edt as edt, gaussian_filter as blur, label, maximum, zoom
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "stamps"
SITE = os.environ.get("STAMPS_SITE", "http://localhost:3418/")
W, H = 768, 962      # the box a rock fits in
M = 46               # from the box's edge to the carving's field
REST = 0.55          # the carving's depth at rest; stamp.worker.ts hammers it to 1
CARVE = (-8.0, 40.0) # the carving's height range, px, from its deepest cut to its highest point (stamp.worker.ts)
BODY = 170.0         # the rock's body at its highest, px
SLUGS = ["trace", "animation-engine", "kiprun", "kodex", "uniqkey", "anime-sports-league"]

# Each project's stone: its body from dark to light, two kinds of fleck, whether it has veins (marble) or strata (sandstone),
# how rough it is, how much paler its fresh-cut faces are than its weathered skin, and the seed its shape is broken from.
STONE = {
    "trace": dict(lo=(0.4, 0.41, 0.43), hi=(0.62, 0.63, 0.65), fleck=(0.13, 0.13, 0.14), spark=(0.88, 0.87, 0.85), vein=0, strata=0, rough=0.86, fresh=0.14, seed=11),
    "animation-engine": dict(lo=(0.58, 0.44, 0.3), hi=(0.8, 0.66, 0.49), fleck=(0.44, 0.31, 0.19), spark=(0.88, 0.79, 0.64), vein=0, strata=1, rough=0.92, fresh=0.1, seed=23),
    "kiprun": dict(lo=(0.19, 0.21, 0.24), hi=(0.33, 0.35, 0.39), fleck=(0.09, 0.1, 0.12), spark=(0.5, 0.52, 0.55), vein=0, strata=0, rough=0.8, fresh=0.55, seed=37),
    "kodex": dict(lo=(0.76, 0.75, 0.72), hi=(0.93, 0.92, 0.89), fleck=(0.56, 0.56, 0.56), spark=(0.98, 0.97, 0.95), vein=1, strata=0, rough=0.48, fresh=0.05, seed=41),
    "uniqkey": dict(lo=(0.29, 0.35, 0.31), hi=(0.45, 0.52, 0.46), fleck=(0.15, 0.19, 0.16), spark=(0.62, 0.68, 0.6), vein=0.5, strata=0, rough=0.8, fresh=0.26, seed=53),
    "anime-sports-league": dict(lo=(0.5, 0.27, 0.19), hi=(0.7, 0.42, 0.3), fleck=(0.35, 0.17, 0.11), spark=(0.84, 0.62, 0.48), vein=0, strata=1, rough=0.9, fresh=0.32, seed=67),
}


def ring(*pts):
    """An outline as (angle in degrees, reach), clockwise from the right, reach as a fraction of the box's width and height."""
    return [(0.5 + r * np.cos(np.radians(a)), 0.5 + r * np.sin(np.radians(a))) for a, r in pts]


# The archive's pieces, each on a stone of its own: its colour and kind, its outline, how hard its edge was chipped (chip), how far
# its corners were worn round (round), and what's carved on it. The cartouche fits any outline that reaches about 0.36 all round.
PIECES = {
    "maze-walk": dict(title="Maze Walk", subject="maze-walk", lo=(0.66, 0.5, 0.24), hi=(0.86, 0.7, 0.38), fleck=(0.46, 0.32, 0.12), spark=(0.92, 0.82, 0.58), vein=0, strata=1, rough=0.92, fresh=0.12, seed=311, chip=1.5, round=8, shape=ring((-125, 0.44), (-55, 0.44), (-10, 0.45), (40, 0.56), (90, 0.49), (140, 0.56), (190, 0.45))),
    "hello": dict(title="Hello", subject="hello", lo=(0.56, 0.44, 0.42), hi=(0.76, 0.62, 0.58), fleck=(0.26, 0.2, 0.2), spark=(0.92, 0.82, 0.78), vein=0, strata=0, rough=0.84, fresh=0.2, seed=301, chip=1.3, round=12, shape=ring((-90, 0.5), (-30, 0.47), (30, 0.47), (90, 0.5), (150, 0.47), (210, 0.47))),
    "tab-hop": dict(title="Tab Hop", subject="tab-hop", lo=(0.3, 0.36, 0.44), hi=(0.47, 0.54, 0.63), fleck=(0.15, 0.18, 0.23), spark=(0.7, 0.76, 0.82), vein=0.3, strata=0, rough=0.74, fresh=0.3, seed=307, chip=0.8, round=26, shape=ring((-90, 0.42), (-45, 0.43), (0, 0.44), (45, 0.5), (90, 0.5), (135, 0.5), (180, 0.44), (225, 0.43))),
    "notch-card": dict(title="Notch Card", subject="notch-card", lo=(0.11, 0.11, 0.13), hi=(0.23, 0.23, 0.26), fleck=(0.05, 0.05, 0.06), spark=(0.62, 0.62, 0.64), vein=0.2, strata=0, rough=0.58, fresh=0.5, seed=319, chip=0.9, round=20, shape=ring((-90, 0.46), (-40, 0.5), (0, 0.46), (40, 0.5), (90, 0.46), (140, 0.5), (180, 0.46), (220, 0.5))),
    "scratch-card": dict(title="Scratch Card", subject="scratch-card", lo=(0.74, 0.7, 0.6), hi=(0.92, 0.89, 0.79), fleck=(0.55, 0.5, 0.4), spark=(0.97, 0.95, 0.88), vein=0, strata=1, rough=0.82, fresh=0.06, seed=331, chip=1.1, round=20, shape=ring((-62, 0.5), (-20, 0.5), (30, 0.52), (75, 0.5), (118, 0.5), (160, 0.5), (210, 0.52))),
    "nav-scrubber": dict(title="Nav Scrubber", subject="nav-scrubber", lo=(0.2, 0.38, 0.31), hi=(0.34, 0.56, 0.46), fleck=(0.08, 0.2, 0.15), spark=(0.55, 0.78, 0.66), vein=1, strata=0, rough=0.62, fresh=0.25, seed=313, chip=1, round=16, shape=ring((-145, 0.52), (-90, 0.46), (-35, 0.52), (20, 0.47), (65, 0.47), (90, 0.5), (115, 0.47), (160, 0.47))),
    "chat-quiz": dict(title="Chat Quiz", subject="chat-quiz", lo=(0.62, 0.3, 0.2), hi=(0.82, 0.46, 0.32), fleck=(0.38, 0.16, 0.1), spark=(0.9, 0.62, 0.48), vein=0, strata=1, rough=0.9, fresh=0.28, seed=317, chip=1.6, round=10, shape=ring((-90, 0.5), (-18, 0.48), (54, 0.52), (126, 0.52), (198, 0.48))),
    "trace-launch": dict(title="Trace film", subject="film", film="trace", lo=(0.15, 0.19, 0.42), hi=(0.26, 0.33, 0.62), fleck=(0.07, 0.09, 0.24), spark=(0.85, 0.76, 0.45), vein=0.2, strata=0, rough=0.6, fresh=0.42, seed=337, chip=1.2, round=14, shape=ring((-100, 0.52), (-70, 0.45), (-20, 0.5), (35, 0.44), (80, 0.52), (120, 0.45), (170, 0.5), (230, 0.44))),
    "engine-launch": dict(title="Engine film", subject="film", film="animation-engine", lo=(0.36, 0.29, 0.46), hi=(0.55, 0.46, 0.66), fleck=(0.2, 0.15, 0.28), spark=(0.8, 0.72, 0.88), vein=0, strata=0, rough=0.72, fresh=0.3, seed=347, chip=1, round=24, shape=ring((-90, 0.46), (-50, 0.5), (-10, 0.44), (30, 0.5), (70, 0.45), (110, 0.5), (150, 0.45), (190, 0.5), (230, 0.45))),
    "kiprun-film": dict(title="KIPRUN film", subject="film", film="kiprun", lo=(0.13, 0.14, 0.15), hi=(0.25, 0.26, 0.27), fleck=(0.06, 0.06, 0.07), spark=(0.55, 0.55, 0.55), vein=1, strata=0, rough=0.7, fresh=0.6, seed=349, chip=1.4, round=9, shape=ring((-140, 0.53), (-90, 0.45), (-40, 0.53), (0, 0.44), (40, 0.5), (90, 0.47), (140, 0.5), (180, 0.44))),
    "trace-ui": dict(title="Trace, live", subject="film", film="timeline", lo=(0.36, 0.4, 0.2), hi=(0.54, 0.58, 0.32), fleck=(0.2, 0.24, 0.1), spark=(0.72, 0.76, 0.5), vein=0, strata=0, rough=0.88, fresh=0.24, seed=353, chip=1.2, round=18, shape=ring((-90, 0.5), (0, 0.5), (90, 0.5), (180, 0.5))),
    "trace": dict(title="Trace", subject="trace", lo=(0.44, 0.48, 0.52), hi=(0.64, 0.68, 0.72), fleck=(0.22, 0.24, 0.27), spark=(0.85, 0.87, 0.9), vein=0, strata=0, rough=0.8, fresh=0.2, seed=359, chip=1, round=30, shape=ring((-120, 0.47), (-60, 0.47), (0, 0.45), (60, 0.47), (120, 0.47), (180, 0.45))),
    "animation-engine": dict(title="Animation Engine", subject="animation-engine", lo=(0.78, 0.58, 0.46), hi=(0.93, 0.76, 0.63), fleck=(0.55, 0.38, 0.28), spark=(0.97, 0.87, 0.77), vein=0, strata=1, rough=0.9, fresh=0.08, seed=367, chip=1.5, round=12, shape=ring((-80, 0.5), (-35, 0.44), (15, 0.52), (70, 0.46), (115, 0.52), (165, 0.44), (215, 0.52))),
    "kiprun": dict(title="KIPRUN", subject="kiprun", lo=(0.12, 0.17, 0.27), hi=(0.22, 0.29, 0.42), fleck=(0.05, 0.08, 0.14), spark=(0.5, 0.56, 0.66), vein=0.3, strata=0, rough=0.66, fresh=0.55, seed=373, chip=1.1, round=15, shape=ring((-110, 0.5), (-50, 0.5), (0, 0.45), (55, 0.52), (125, 0.52), (180, 0.45))),
    "kodex": dict(title="Kodex", subject="kodex", lo=(0.84, 0.82, 0.76), hi=(0.97, 0.96, 0.92), fleck=(0.62, 0.6, 0.54), spark=(0.99, 0.98, 0.96), vein=1, strata=0, rough=0.46, fresh=0.04, seed=379, chip=0.9, round=22, shape=ring((-90, 0.5), (-40, 0.44), (5, 0.5), (50, 0.45), (90, 0.5), (130, 0.45), (175, 0.5), (220, 0.44))),
    "uniqkey": dict(title="Uniqkey", subject="uniqkey", lo=(0.3, 0.5, 0.5), hi=(0.46, 0.68, 0.66), fleck=(0.14, 0.28, 0.28), spark=(0.72, 0.88, 0.85), vein=0.5, strata=0, rough=0.7, fresh=0.24, seed=383, chip=1.3, round=11, shape=ring((-90, 0.48), (-25, 0.52), (40, 0.44), (90, 0.52), (140, 0.44), (205, 0.52))),
    "anime-sports-league": dict(title="Anime Sports League", subject="anime-sports-league", lo=(0.5, 0.14, 0.12), hi=(0.72, 0.26, 0.2), fleck=(0.28, 0.06, 0.05), spark=(0.9, 0.55, 0.4), vein=0.6, strata=0, rough=0.76, fresh=0.34, seed=389, chip=1.4, round=13, shape=ring((-130, 0.48), (-75, 0.52), (-25, 0.47), (35, 0.52), (95, 0.46), (150, 0.52), (205, 0.47))),
    # The page's own stone: a tall standing stone with a hole through its head.
    "archive": dict(title="Archive", subject="archive", page=True, lo=(0.38, 0.35, 0.31), hi=(0.6, 0.56, 0.5), fleck=(0.2, 0.18, 0.16), spark=(0.78, 0.74, 0.68), vein=0, strata=1, rough=0.9, fresh=0.2, seed=397, chip=1.7, round=7, planes=(1, 3), hole=(0.5, 0.24, 0.075), shape=[(0.3, 0.035), (0.5, 0.015), (0.66, 0.06), (0.74, 0.2), (0.71, 0.36), (0.78, 0.58), (0.75, 0.8), (0.83, 0.975), (0.54, 0.99), (0.2, 0.985), (0.25, 0.78), (0.2, 0.56), (0.28, 0.36), (0.23, 0.2)]),
}
# The experience's own stone: broken into three rising steps, a path cut up them with a milestone for each role.
PIECES["experience"] = dict(title="Experience", subject="experience", page=True, lo=(0.33, 0.29, 0.4), hi=(0.54, 0.48, 0.63), fleck=(0.17, 0.14, 0.22), spark=(0.8, 0.74, 0.88), vein=0, strata=1, rough=0.84, fresh=0.24, seed=409, chip=1.4, round=8, planes=(0, 1), shape=[(0.05, 0.66), (0.2, 0.62), (0.4, 0.61), (0.43, 0.4), (0.62, 0.37), (0.67, 0.36), (0.7, 0.13), (0.86, 0.09), (0.95, 0.1), (0.97, 0.4), (0.93, 0.7), (0.96, 0.97), (0.55, 0.985), (0.1, 0.98), (0.03, 0.82)])
# The about's: a river pebble worn smooth, the star from beside the name cut in the same cartouche as the rocks.
PIECES["about"] = dict(title="About", words="SYED  ALI", subject="about", page=True, lo=(0.6, 0.45, 0.42), hi=(0.82, 0.66, 0.62), fleck=(0.34, 0.24, 0.22), spark=(0.94, 0.84, 0.8), vein=0.3, strata=0, rough=0.62, fresh=0.14, seed=419, chip=0.45, round=40, planes=(0, 1), shape=ring((-90, 0.47), (-45, 0.5), (0, 0.46), (45, 0.5), (90, 0.49), (135, 0.51), (180, 0.45), (225, 0.5)))
# The phone's menu: a stone of the hero's kind in the site's accent, three bars cut on it. Only ever a small picture, so one small file.
PIECES["menu"] = dict(title="Menu", words="MENU", subject="menu", icon=216, lo=(0.6, 0.22, 0.08), hi=(0.86, 0.4, 0.17), fleck=(0.36, 0.12, 0.04), spark=(0.95, 0.62, 0.38), vein=0, strata=0, rough=0.82, fresh=0.24, seed=401)
# The way back from a case study on a phone: the menu stone's sibling, an arrow cut on it.
PIECES["back"] = dict(title="Back", words="BACK", subject="back", icon=216, lo=(0.6, 0.22, 0.08), hi=(0.86, 0.4, 0.17), fleck=(0.36, 0.12, 0.04), spark=(0.95, 0.62, 0.38), vein=0, strata=0, rough=0.82, fresh=0.24, seed=431)
for _id, _p in PIECES.items():
    STONE[f"piece-{_id}"] = _p


def study(slug):
    s = (ROOT / "src/content/case-studies" / f"{slug}.ts").read_text(encoding="utf-8")
    g = lambda pat: re.search(pat, s).group(1)
    return dict(slug=slug, title=g(r'\n  title: "([^"]+)"'), kind=g(r'\n  kind: "([^"]+)"'), year=g(r'\n  year: "([^"]+)"'))


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def noise(rng, shape, sigma):
    """Smooth noise, scaled to -1..1."""
    n = blur(rng.normal(0, 1, shape), sigma)
    return n / (np.abs(n).max() + 1e-9)


def rock(rng, st=None):
    """Signed distance into a broken piece of rock, px, positive inside: a blocky round body, lumped, cut flat along a few
    fracture lines, its edge chipped. A stone with a `shape` is broken from that outline instead, its corners worn by `round`."""
    st = st or {}
    ys, xs = np.mgrid[0:H, 0:W] + 0.5
    if "shape" in st:
        im = Image.new("L", (W, H), 0)
        ImageDraw.Draw(im).polygon([(min(0.985, max(0.015, x)) * W, min(0.985, max(0.015, y)) * H) for x, y in st["shape"]], fill=255)
        m = blur(np.asarray(im, np.float32) / 255, st.get("round", 12)) > 0.5
        S = (edt(m) - edt(~m)).astype(np.float64) + 12 * noise(rng, (H, W), 44)
        for _ in range(rng.integers(*st.get("planes", (2, 5)))):
            a = rng.uniform(0, 2 * np.pi)
            reach = np.abs((xs - W / 2) * np.cos(a) + (ys - H / 2) * np.sin(a))[m].max()
            S = np.minimum(S, reach * rng.uniform(0.9, 0.985) - ((xs - W / 2) * np.cos(a) + (ys - H / 2) * np.sin(a)))
        if "hole" in st:
            hx, hy, hr = st["hole"]
            S = np.minimum(S, np.hypot(xs - hx * W, ys - hy * H) - hr * W + 3.5 * noise(rng, (H, W), 7))
        return S + st.get("chip", 1) * (9 * noise(rng, (H, W), 9) + 3.5 * noise(rng, (H, W), 2.5))
    cx, cy = W / 2 + rng.uniform(-8, 8), H / 2 + rng.uniform(-8, 8)
    ax, ay = W * rng.uniform(0.448, 0.482), H * rng.uniform(0.44, 0.478)
    turn = rng.uniform(-0.12, 0.12)
    dx, dy = xs - cx, ys - cy
    u, v = (dx * np.cos(turn) + dy * np.sin(turn)) / ax, (-dx * np.sin(turn) + dy * np.cos(turn)) / ay
    ang, rad = np.arctan2(v, u), np.hypot(u, v)
    p = rng.uniform(2.6, 3.6)
    reach = (np.abs(np.cos(ang)) ** p + np.abs(np.sin(ang)) ** p) ** (-1 / p)
    for k in range(2, 7):
        reach *= 1 + rng.uniform(0.012, 0.045) / k * 2 * np.cos(k * ang + rng.uniform(0, 6.3))
    S = (reach - rad) * min(ax, ay)
    # Fracture planes: flat breaks where a piece came away.
    for _ in range(rng.integers(3, 6)):
        a = rng.uniform(0, 2 * np.pi)
        d = rng.uniform(0.85, 0.97) * (np.abs(np.cos(a)) * ax + np.abs(np.sin(a)) * ay)
        S = np.minimum(S, d - ((xs - cx) * np.cos(a) + (ys - cy) * np.sin(a)))
    # Chips along the edge, large and small.
    S += 9 * noise(rng, (H, W), 9) + 3.5 * noise(rng, (H, W), 2.5)
    return S


def shoe_relief(field_w, field_h, scale, at):
    """KIPRUN's Kipcore from the range page's photo: cut from its dark ground, modelled as a rounded body with the photo's own
    detail (laces, the KIPRUN letters, the sole's lines) carved into it, the upper standing a little proud of the sole."""
    im = Image.open(ROOT / "public/case-studies/kiprun/range.webp").convert("RGB").crop((230, 690, 1480, 1270))
    a = np.asarray(im, dtype=np.float32) / 255
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    sat = a.max(-1) - a.min(-1)
    mask = blur(lum, 1.2) > 0.13
    lab, n = label(mask)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    mask = binary_fill_holes(lab == sizes.argmax())
    d = edt(mask)
    body = 1 - (1 - np.clip(d / 95, 0, 1)) ** 2
    detail = blur(lum, 1.3) - blur(lum, 11)
    upper = blur((sat > 0.18).astype(np.float32) * mask, 3)
    h = 0.3 + 0.44 * body + 0.32 * detail + 0.06 * upper
    h = np.where(mask, h, 0)
    soft = blur(mask.astype(np.float32), 1.4)
    ys, xs = np.nonzero(mask)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    hi = Image.fromarray(h.astype(np.float32), "F").crop(box)
    mi = Image.fromarray(soft.astype(np.float32), "F").crop(box)
    hi, mi = hi.rotate(8, Image.BICUBIC, expand=True), mi.rotate(8, Image.BICUBIC, expand=True)
    tw = int(at["w"] * scale)
    th = round(hi.height * tw / hi.width)
    hi, mi = hi.resize((tw, th), Image.BICUBIC), mi.resize((tw, th), Image.BICUBIC)
    H_ = np.zeros((field_h, field_w), np.float32)
    M_ = np.zeros((field_h, field_w), np.float32)
    x0, y0 = int(at["x"] * scale - tw / 2), int(at["y"] * scale - th / 2)
    H_[y0:y0 + th, x0:x0 + tw] = np.asarray(hi)
    M_[y0:y0 + th, x0:x0 + tw] = np.clip(np.asarray(mi), 0, 1)
    return H_, M_


def inside_dist(m):
    """Distance into a soft mask, in px, with the mask's own antialiasing for the last pixel."""
    return edt(m > 0.5) + np.clip(m, 0, 1) - 0.5


def model(spec):
    """The carving's relief over the field at painting resolution, from its layers: 0 where the stone's face is left. And
    where the ground is dressed: the panel's floor, wherever nothing was carved over it after. And the panel's whole area."""
    S = spec["scale"]
    fw, fh = int(spec["field"][0] * S), int(spec["field"][1] * S)
    g = spec["ground"]
    h = np.full((fh, fw), g, np.float32)
    dress, area, floor = np.zeros((fh, fw), np.float32), np.zeros((fh, fw), np.float32), None
    for L in spec["layers"]:
        k = L["kind"]
        if k == "shoe":
            sh, sm = shoe_relief(fw, fh, S, L)
            h = h * (1 - sm) + np.maximum(sh, h) * sm
            continue
        if k == "figure":
            # An archive figure, carved: its outline raised as a low plateau, its own lines cut into that.
            a = np.asarray(Image.open(ROOT / L["src"]).convert("L"), np.float32) / 255
            ink = a < 0.82
            ys_, xs_ = np.nonzero(ink)
            a = a[ys_.min():ys_.max() + 1, xs_.min():xs_.max() + 1]
            tw = int(L["w"] * S)
            th = round(a.shape[0] * tw / a.shape[1])
            a = np.asarray(Image.fromarray(a, "F").resize((tw, th), Image.LANCZOS), np.float32)
            lines = blur((a < 0.86).astype(np.float32), 0.8) > 0.2
            body_ = binary_fill_holes(lines)
            x0_, y0_ = int(L["x"] * S - tw / 2), int(L["y"] * S - th / 2)
            bm, lm = np.zeros((fh, fw), np.float32), np.zeros((fh, fw), np.float32)
            bm[y0_:y0_ + th, x0_:x0_ + tw] = body_
            lm[y0_:y0_ + th, x0_:x0_ + tw] = lines
            db = inside_dist(blur(bm, 0.8))
            p = (1 - (1 - np.clip(db / (3 * S), 0, 1)) ** 2) * np.clip(bm * 2, 0, 1)
            h = h * (1 - p) + 0.36 * p
            h -= 0.1 * np.clip(inside_dist(blur(lm, 0.6)) / (1.1 * S), 0, 1)
            continue
        m = np.asarray(Image.open(io.BytesIO(base64.b64decode(L["url"].split(",")[1]))).convert("L"), dtype=np.float32) / 255
        if m.max() < 0.01:
            continue
        top, r = L["top"], max(L["r"], 0.5) * S
        d = inside_dist(m)
        if k == "cut":  # a V: its walls run from the edge down to its bottom over r
            h -= top * np.clip(d / r, 0, 1)
            continue
        if k == "dome":
            lab, n = label(m > 0.5)
            R = np.zeros_like(d)
            if n:
                peak = np.asarray(maximum(d, lab, index=np.arange(1, n + 1)), np.float32)
                R[lab > 0] = peak[lab[lab > 0] - 1]
            p = np.sqrt(np.clip(1 - (1 - np.clip(d / np.maximum(R, 1), 0, 1)) ** 2, 0, 1)) * np.clip(m * 2, 0, 1)
            h = h * (1 - p) + np.maximum(h, top) * p
        elif k == "add":
            h += top * (1 - (1 - np.clip(d / r, 0, 1)) ** 2) * np.clip(m * 2, 0, 1)
        else:
            p = (1 - (1 - np.clip(d / r, 0, 1)) ** 2) * np.clip(m * 2, 0, 1)
            if k == "panel":
                h -= top * p
                dress, area, floor = np.maximum(dress, p), np.maximum(area, p), h.copy()
            else:  # raise, sink
                h = h * (1 - p) + top * p
    if floor is not None:
        dress *= np.clip(1 - np.abs(h - floor) / 0.02, 0, 1)
    return h - g, dress, area


def cast(hp, L):
    """How much of the light reaches each point past what stands in front of it: marched toward the light over the heights
    (px), softened. L: toward the light, image axes (x right, y down, z up)."""
    hp = np.pad(hp, 96, mode="edge")
    u = np.array(L[:2], np.float64)
    n = np.hypot(*u)
    u /= n
    tan = L[2] / n
    lit = np.ones_like(hp)
    for t in range(1, 90):
        ox, oy = int(round(u[0] * t)), int(round(u[1] * t))
        q = np.roll(hp, (-oy, -ox), axis=(0, 1))
        lit = np.minimum(lit, np.clip(1 - (q - hp - t * tan) * 0.28, 0, 1))
    return lit[96:-96, 96:-96]


def normals(hp):
    gy, gx = np.gradient(hp)
    nz = 1 / np.sqrt(1 + gx ** 2 + gy ** 2)
    return -gx * nz, -gy * nz, nz


def stone_albedo(rng, st, shape):
    """The stone's colour: mottled, flecked, veined or banded as its kind is. And a fine noise its roughness follows."""
    n1 = noise(rng, shape, 40) * 0.5 + 0.5
    n2 = noise(rng, shape, 7) * 0.5 + 0.5
    lo, hi = np.array(st["lo"]), np.array(st["hi"])
    alb = lo + (hi - lo) * (0.25 + 0.75 * n1 * (0.7 + 0.3 * n2))[..., None]
    f = blur(rng.random(shape), 0.6)
    f = (f - f.min()) / (np.ptp(f) + 1e-9)
    speck = st.get("speck", 1)
    dark = smooth(0.28, 0.2, f) * 0.75 * speck
    light = smooth(0.7, 0.78, f) * 0.6 * speck
    alb = alb * (1 - dark[..., None]) + np.array(st["fleck"]) * dark[..., None]
    alb = alb * (1 - light[..., None]) + np.array(st["spark"]) * light[..., None]
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]]
    if st["strata"]:
        band = np.sin(ys / 9 + 6 * noise(rng, shape, 50) + xs * 0.01) * 0.5 + 0.5
        alb *= (0.9 + 0.12 * band)[..., None]
    if st["vein"]:
        vein = np.abs(noise(rng, shape, 34) * 3 + noise(rng, shape, 9) * 0.5)
        veins = np.clip(1 - vein / 0.045, 0, 1) * st["vein"]
        alb = alb * (1 - 0.3 * blur(veins, 0.6)[..., None])
    return alb, n2


def lit(hp, alb, rough, cavity):
    """As it rests on the page: lit from the top left, everything throwing its shadow. stamp.worker.ts lights it the same."""
    rx_, ry_, _ = normals(hp)
    N = np.dstack([rx_, -ry_, np.sqrt(np.clip(1 - rx_ ** 2 - ry_ ** 2, 0, 1))])  # y up
    Lv = np.array([-0.55, 0.6, 0.58])
    Lv /= np.linalg.norm(Lv)
    Hv = Lv + np.array([0, 0, 1.0])
    Hv /= np.linalg.norm(Hv)
    ndl = np.clip(N @ Lv, 0, 1)
    ndh = np.clip(N @ Hv, 0, 1)
    Li = (Lv[0], -Lv[1], Lv[2])
    shade = cast(hp, Li) * 0.5 + cast(hp, (Li[0] * 0.92 - 0.12, Li[1] * 0.92, Li[2])) * 0.25 + cast(hp, (Li[0] * 0.92, Li[1] * 0.92 + 0.12, Li[2])) * 0.25
    lin = alb ** 2.2
    F0 = 0.04
    shin = 8 + 220 * (1 - rough) ** 2
    spec_ = F0 * (ndh ** shin) * (3.2 * (1 - rough) + 0.4) * shade
    sky = (0.1 + 0.16 * np.clip(N[..., 1], 0, 1)) * F0 * 1.2
    key = 0.1 + 1.0 * ndl * shade
    col = lin * key[..., None] + (spec_ + sky)[..., None]
    col *= (0.18 + 0.82 * cavity ** 1.6)[..., None]
    col = col / (1 + col)  # a soft shoulder
    return np.clip(col * 1.9, 0, 1) ** (1 / 2.2)


def cracks(rng, inside, count=None, width=2):
    """A few cracks wandering in from the rock's edge: hairlines, or wider ones that fork."""
    im = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(im)
    ys, xs = np.nonzero(inside)
    for _ in range(count or rng.integers(2, 4)):
        i = rng.integers(len(xs))
        x, y = float(xs[i]), float(ys[i])
        a = np.arctan2(H / 2 - y, W / 2 - x) + rng.uniform(-0.7, 0.7)
        pts = [(x, y)]
        for k in range(rng.integers(14, 30)):
            a += rng.uniform(-0.45, 0.45)
            x, y = x + 9 * np.cos(a), y + 9 * np.sin(a)
            pts.append((x, y))
            if width > 2 and k == 5:
                b, fx, fy = a + rng.choice([-1, 1]) * rng.uniform(0.5, 1), x, y
                fork = [(fx, fy)]
                for _ in range(rng.integers(5, 10)):
                    b += rng.uniform(-0.4, 0.4)
                    fx, fy = fx + 8 * np.cos(b), fy + 8 * np.sin(b)
                    fork.append((fx, fy))
                dr.line(fork, fill=255, width=width - 1)
        dr.line(pts, fill=255, width=width)
    return blur(np.asarray(im, np.float32) / 255, 0.7)


def bake(d, spec):
    slug = d["slug"]
    st = STONE[slug]
    rng = np.random.default_rng(st["seed"])
    S_ = spec["scale"]
    fw, fh = spec["field"]
    relief, dress, area = model(spec)
    relief = zoom(blur(relief, 0.45 * S_), 1 / S_, order=3)[:fh, :fw]
    dress = zoom(blur(dress, 0.45 * S_), 1 / S_, order=1)[:fh, :fw]
    area = zoom(area, 1 / S_, order=1)[:fh, :fw]

    # The rock: a body that rounds hard over at its broken edge and is lumped across its face; the carving on that face.
    S = rock(rng, st)
    alpha = smooth(-0.9, 0.9, S)
    inside = S > 0
    grip = smooth(0, 70, S)
    body = BODY * (1 - (1 - np.clip(S / 240, 0, 1)) ** 2) * 0.8 + (28 * noise(rng, (H, W), 70) + 9 * noise(rng, (H, W), 24)) * grip
    body += (1 - smooth(0, 40, S)) * 7 * noise(rng, (H, W), 3)                # the broken edge is rough
    # Chips knocked off its edge: shallow scallops, the fresh stone under the skin showing in them.
    chip = smooth(0.3, 0.55, noise(rng, (H, W), 5)) * (1 - smooth(12, 44, S)) * inside
    body -= 6 * chip
    body = np.where(inside, body, body * smooth(-6, 0, S))
    body = np.clip(body - body[inside].min(), 0, None)
    body *= BODY / body.max()
    face = smooth(20, 84, S)                                                     # the carving fades out before the edge
    carve = np.zeros((H, W), np.float32)
    carve[M:M + fh, M:M + fw] = relief
    dressed = np.zeros((H, W), np.float32)
    dressed[M:M + fh, M:M + fw] = np.clip(dress, 0, 1)
    carved = np.zeros((H, W), np.float32)
    carved[M:M + fh, M:M + fw] = np.clip(area, 0, 1)
    cut_px = carve * face * 52                                                    # the carving, px at full depth
    # The panel's floor, dressed with a point chisel: pits close together, grit left in them.
    stip = np.clip(blur((rng.random((H, W)) < 0.02).astype(np.float32), 1.5) / 0.0707, 0, 1.4) * dressed * face
    cut_px -= 1.8 * stip
    # The stone's own skin, which the hammer doesn't change: grain, pits, cracks.
    skin = 1.2 * noise(rng, (H, W), 0.9) + 2.4 * noise(rng, (H, W), 4)
    pits = (rng.random((H, W)) < 0.004).astype(np.float32)
    skin -= 3.4 * blur(pits, 1.2) / max(blur(pits, 1.2).max(), 1e-6)
    if "shape" in st:
        # An archive stone has little rock outside its cartouche, and they're shown small: its cracks start at the broken edge, wider,
        # and fork, so they show. They stop short of anything carved.
        crack = cracks(rng, (S > 3) & (S < 24), st.get("cracks", 5), 4) * smooth(0, 6, S) * (1 - blur(np.maximum(carved, (np.abs(carve) > 0.012).astype(np.float32)), 12))
    else:
        crack = cracks(rng, S > 60) * face * (1 - blur(carved, 14))              # the cracks stop short of the cartouche
    skin -= 9 * crack
    body = blur(body + skin * grip, 0.35)
    cut_px = blur(np.clip(cut_px, *CARVE), 0.35)

    full = body + cut_px
    rest = body + cut_px * REST
    nx, ny, _ = normals(full)
    rx_, ry_, _ = normals(rest)
    hollow = np.clip((blur(full, 6) - full) / 6, 0, 1)
    ridge = np.clip((full - blur(full, 10)) / 6, 0, 1)
    cavity = np.clip(1 - 0.16 * np.maximum(blur(full, 4) - full, 0), 0, 1)

    # The stone's colour, dark in its cracks and hollows; the carving's cut faces and the chips a shade lighter than the
    # weathered skin round them; a little darker toward its foot, where the dirt gathers.
    alb, n2 = stone_albedo(rng, st, (H, W))
    ys = np.mgrid[0:H, 0:W][0]
    cut = smooth(1, 4, np.abs(cut_px))
    alb = alb + (1 - alb) * (st["fresh"] * np.maximum(cut, 0.8 * chip))[..., None]
    alb *= (1 - 0.3 * np.clip(stip, 0, 1))[..., None]
    alb *= (1 - 0.5 * hollow - (0.74 if "shape" in st else 0.5) * crack)[..., None]
    alb *= (1 + 0.08 * ridge)[..., None]
    alb *= (1.04 - 0.1 * smooth(0.3, 1, ys / H))[..., None]
    alb = np.clip(alb, 0, 1)
    rough = np.clip(st["rough"] - 0.12 * ridge + 0.05 * n2, 0.2, 1)
    art = lit(rest, alb, rough, cavity)

    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray((np.dstack([art, alpha]) * 255 + 0.5).astype(np.uint8), "RGBA")
    if st.get("icon"):
        im.resize((st["icon"], round(st["icon"] * H / W)), Image.LANCZOS).save(OUT / f"{slug}.webp", quality=88, method=6, alpha_quality=100)
        return
    im.save(OUT / f"{slug}.webp", quality=90, method=6, alpha_quality=100)
    im.resize((512, round(512 * H / W)), Image.LANCZOS).save(OUT / f"{slug}-sm.webp", quality=88, method=6, alpha_quality=100)
    if st.get("page"):  # a page's stone also sits small in the menu, and flies from there
        im.resize((216, round(216 * H / W)), Image.LANCZOS).save(OUT / f"{slug}-icon.webp", quality=86, method=6, alpha_quality=100)
    Image.fromarray((np.dstack([alb, alpha]) * 255 + 0.5).astype(np.uint8), "RGBA").save(OUT / f"{slug}-a.webp", quality=90, method=6, alpha_quality=100)
    carve_h = (cut_px - CARVE[0]) / (CARVE[1] - CARVE[0])
    save = lambda name, a, q: Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB").save(OUT / f"{slug}{name}.webp", quality=q, method=6)
    save("-n", np.dstack([nx * 0.5 + 0.5, ny * 0.5 + 0.5, carve_h]), 95)
    save("-r", np.dstack([rx_ * 0.5 + 0.5, ry_ * 0.5 + 0.5, np.zeros((H, W))]), 95)
    save("-m", np.dstack([body / BODY, rough, cavity]), 92)


async def main():
    only = sys.argv[1:] or SLUGS
    pieces = list(PIECES) if "pieces" in only else [x for x in only if x in PIECES and x not in SLUGS or x == "archive"]
    if only[:1] == ["pieces"] and len(only) > 1:
        pieces = only[1:]
    motifs = (pathlib.Path(__file__).parent / "motifs.js").read_text(encoding="utf-8")
    async with async_playwright() as p:
        b = await p.chromium.launch(channel=os.environ.get("STAMPS_BROWSER", "msedge"), headless=True)
        pg = await b.new_page()
        await pg.goto(SITE, wait_until="domcontentloaded")
        await pg.evaluate("document.fonts.ready")
        await pg.add_script_tag(content=motifs)
        await pg.evaluate("document.fonts.load('700 30px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-baskerville'))")
        for piece in pieces:
            o = PIECES[piece]
            d = dict(slug=f"piece-{piece}", title=o["title"], subject=o["subject"], src=o.get("src"), film=o.get("film"), words=o.get("words"), count=sum(k not in ("archive", "menu", "experience", "about", "back") for k in PIECES))
            bake(d, await pg.evaluate("([d, n]) => paintPiece(d, n)", [d, list(PIECES).index(piece)]))
            print(d["slug"], "baked", flush=True)
        for n, slug in enumerate(SLUGS):
            if slug not in only or only[0] == "pieces":
                continue
            d = study(slug)
            spec = await pg.evaluate("([d, n]) => paintMotif(d, n)", [d, n])
            bake(d, spec)
            print(slug, "baked", [f"{(OUT / (slug + x + '.webp')).stat().st_size // 1024} kB" for x in ("", "-sm", "-a", "-n", "-r", "-m")], flush=True)
        await b.close()


asyncio.run(main())
