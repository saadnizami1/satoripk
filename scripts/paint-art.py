"""Paints Satori's scene artwork in code: Lahore rooftops under five skies.

    python scripts/paint-art.py public/art

Needs numpy and Pillow. Every scene is deterministic (seeded), so re-running
produces the same files. Layers are painted far to near; each layer is pulled
toward the horizon colour for atmospheric depth, softened with a blur, and the
whole frame gets film grain so it reads as paint on paper, not flat vector.
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/art'
os.makedirs(OUT, exist_ok=True)
SS = 2  # supersample factor for clean edges


def rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def mix(a, b, t):
    return tuple(int(round(v)) for v in rgb(a) * (1 - t) + rgb(b) * t)


def sky(w, h, stops):
    """Vertical gradient through (position, hex) stops."""
    ys = np.linspace(0, 1, h)
    out = np.zeros((h, 3))
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        m = (ys >= p0) & (ys <= p1)
        t = ((ys[m] - p0) / max(p1 - p0, 1e-6))[:, None]
        t = t * t * (3 - 2 * t)
        out[m] = rgb(c0) * (1 - t) + rgb(c1) * t
    return np.broadcast_to(out[:, None, :], (h, w, 3)).copy()


def glow(img, cx, cy, radius, col, strength, disc=None):
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx * w) ** 2 + (yy - cy * h) ** 2)
    g = (np.exp(-(d / (radius * w)) ** 2) * strength)[..., None]
    img = img * (1 - g) + rgb(col) * g
    if disc:
        r, dcol = disc
        a = np.clip((r * w - d) / 1.5, 0, 1)[..., None]
        img = img * (1 - a) + rgb(dcol) * a
    return img


def ridge(w, base, amp, seed, rough=0.55):
    r = np.random.default_rng(seed)
    pts = np.array([0.0, 0.0])
    a = amp
    while len(pts) < w // 6:
        mid = (pts[:-1] + pts[1:]) / 2 + r.normal(0, a, len(pts) - 1)
        new = np.empty(len(pts) * 2 - 1)
        new[0::2] = pts
        new[1::2] = mid
        pts = new
        a *= rough
    return base + np.interp(np.linspace(0, len(pts) - 1, w), np.arange(len(pts)), pts)


def composite(img, layer_rgba, blur=0.0):
    """Alpha-composite an RGBA PIL layer (supersampled) onto the float image."""
    h, w, _ = img.shape
    lay = layer_rgba.resize((w, h), Image.LANCZOS)
    if blur:
        lay = lay.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(lay, float)
    al = a[..., 3:4] / 255
    return img * (1 - al) + a[..., :3] * al


def hills(img, base, amp, seed, col, blur=1.2):
    h, w, _ = img.shape
    y = ridge(w, base * h, amp * h, seed)
    yy = np.mgrid[0:h, 0:w][0]
    m = Image.fromarray(((yy >= y[None, :]) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    m = np.asarray(m, float)[..., None] / 255
    return img * (1 - m) + rgb(col) * m


def mist(img, y0, y1, col, strength):
    h = img.shape[0]
    ys = np.linspace(0, 1, h)
    t = np.clip(1 - np.abs((ys - (y0 + y1) / 2) / ((y1 - y0) / 2)), 0, 1) ** 1.6 * strength
    return img * (1 - t[:, None, None]) + rgb(col) * t[:, None, None]


# ── City pieces (drawn on supersampled RGBA layers) ──────────────────────

def mosque(d, cx, ground, s, col):
    """A Mughal-style silhouette: prayer hall, three domes, four minarets."""
    hw = 260 * s
    d.rectangle([cx - hw, ground - 120 * s, cx + hw, ground], fill=col)
    d.rectangle([cx - 70 * s, ground - 170 * s, cx + 70 * s, ground], fill=col)  # central iwan
    for dx, r, hgt in ((0, 92, 170), (-170, 58, 120), (170, 58, 120)):
        x = cx + dx * s
        y = ground - hgt * s
        d.ellipse([x - r * s, y - r * 1.35 * s, x + r * s, y + r * 0.55 * s], fill=col)
        d.rectangle([x - 4 * s, y - r * 1.35 * s - 34 * s, x + 4 * s, y - r * 1.2 * s], fill=col)
        d.ellipse([x - 9 * s, y - r * 1.35 * s - 44 * s, x + 9 * s, y - r * 1.35 * s - 26 * s], fill=col)
    for dx, hgt in ((-330, 420), (330, 420), (-280, 300), (280, 300)):
        x = cx + dx * s
        top = ground - hgt * s
        d.rectangle([x - 13 * s, top, x + 13 * s, ground], fill=col)
        for k in (0.32, 0.62):  # balconies
            by = ground - hgt * k * s
            d.rectangle([x - 22 * s, by - 7 * s, x + 22 * s, by + 3 * s], fill=col)
        d.rectangle([x - 20 * s, top - 6 * s, x + 20 * s, top + 4 * s], fill=col)
        for px in (-15, 15):  # chhatri pillars
            d.rectangle([x + px * s - 3 * s, top - 34 * s, x + px * s + 3 * s, top], fill=col)
        d.ellipse([x - 22 * s, top - 62 * s, x + 22 * s, top - 22 * s], fill=col)
        d.rectangle([x - 2 * s, top - 80 * s, x + 2 * s, top - 56 * s], fill=col)


def rooftops(d, w, ground, s, col, rng, hmin, hmax, lit=None, lit_p=0.0, tanks=0.35):
    x = -40 * s
    while x < w:
        bw = rng.integers(70, 190) * s
        bh = rng.integers(hmin, hmax) * s
        top = ground - bh
        d.rectangle([x, top, x + bw, ground + 400 * s], fill=col)
        # parapet steps
        if rng.random() < 0.5:
            d.rectangle([x + 6 * s, top - 10 * s, x + bw - 6 * s, top], fill=col)
        if rng.random() < tanks:  # rooftop water tank on legs
            tx = x + rng.integers(14, max(15, int(bw / s) - 50)) * s
            d.rectangle([tx + 4 * s, top - 22 * s, tx + 8 * s, top], fill=col)
            d.rectangle([tx + 30 * s, top - 22 * s, tx + 34 * s, top], fill=col)
            d.rounded_rectangle([tx, top - 52 * s, tx + 38 * s, top - 20 * s], radius=int(6 * s), fill=col)
        if rng.random() < 0.18:  # small dome or stair cabin
            r = rng.integers(14, 26) * s
            cxd = x + bw / 2
            d.ellipse([cxd - r, top - r * 1.4, cxd + r, top + r * 0.4], fill=col)
        if rng.random() < 0.25:  # antenna
            ax = x + rng.integers(10, max(11, int(bw / s) - 10)) * s
            d.line([ax, top, ax, top - rng.integers(30, 60) * s], fill=col, width=max(1, int(3 * s)))
            d.line([ax - 12 * s, top - 40 * s, ax + 12 * s, top - 40 * s], fill=col, width=max(1, int(2 * s)))
        if lit is not None and lit_p:
            for wy in range(int(top + 22 * s), int(ground - 10 * s), int(30 * s)):
                for wx in range(int(x + 14 * s), int(x + bw - 20 * s), int(28 * s)):
                    if rng.random() < lit_p:
                        lit.rectangle([wx, wy, wx + 9 * s, wy + 13 * s], fill=(245, 197, 66, 235))
        x += bw + rng.integers(-10, 14) * s


def kite(d, x, y, size, ang, body, s):
    pts = [(0, -1.0), (0.7, 0), (0, 1.15), (-0.7, 0)]
    ca, sa = math.cos(ang), math.sin(ang)
    P = [(x + (px * ca - py * sa) * size * s, y + (px * sa + py * ca) * size * s) for px, py in pts]
    d.polygon(P, fill=body)
    d.line([P[0], P[2]], fill=(255, 253, 247, 170), width=max(1, int(1.2 * s)))
    d.line([P[1], P[3]], fill=(255, 253, 247, 120), width=max(1, int(1 * s)))
    tx, ty = P[2]
    for k in range(3):  # little tail bows
        bx, by = tx - 4 * s * k, ty + 9 * s * (k + 1)
        d.polygon([(bx - 4 * s, by - 3 * s), (bx + 4 * s, by + 3 * s), (bx + 4 * s, by - 3 * s), (bx - 4 * s, by + 3 * s)], fill=body)
    return P[2]


def string(d, a, b, col, s, sag=0.12):
    (x0, y0), (x1, y1) = a, b
    pts = []
    for i in range(41):
        t = i / 40
        pts.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + math.sin(t * math.pi) * sag * abs(x1 - x0)))
    d.line(pts, fill=col, width=max(1, int(1.1 * s)))


def wires(d, w, y, s, col, rng, n=3):
    for i in range(n):
        y0 = y + rng.integers(-30, 30) * s
        y1 = y + rng.integers(-30, 30) * s
        string(d, (-10, y0), (w + 10, y1), col, s, sag=0.03 + 0.02 * i)


def grain(img, amount, seed):
    r = np.random.default_rng(seed)
    return img + r.normal(0, amount, img.shape[:2])[..., None]


def save(img, name, w, h, q=78):
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{name:22s} {w}x{h}  {os.path.getsize(path) // 1024} KB')
    return im


# ── Scenes ───────────────────────────────────────────────────────────────

SCENES = {
    # name: sky stops, sun, hill colours, city colours (far, mid, near), lit window chance, kites
    'dusk': dict(
        sky=[(0, '#14233A'), (0.30, '#2E4A6B'), (0.55, '#8C5A78'), (0.70, '#E28A6B'), (0.80, '#F5C542')],
        sun=(0.70, 0.66, 0.16, '#F7C96A', 0.75, (0.026, '#FBE3A0')),
        hill=['#7A5A74', '#5C4866'], city=['#4A3A5A', '#2D2840', '#141420'],
        lit=0.06, horizon='#E8A27A', kites=True, mosque=True,
    ),
    'dawn': dict(
        sky=[(0, '#4E6E88'), (0.35, '#9BB4BE'), (0.62, '#F0CDB2'), (0.80, '#F8E3C4')],
        sun=(0.28, 0.70, 0.14, '#FCE7BE', 0.6, (0.022, '#FFF3D6')),
        hill=['#A9B5B8', '#8C9BA4'], city=['#7F8C98', '#56637A', '#2C3448'],
        lit=0.015, horizon='#F2D7BE', kites=True, mosque=True,
    ),
    'day': dict(
        sky=[(0, '#5E8E92'), (0.40, '#7FA3A0'), (0.70, '#C9DDD2'), (0.82, '#EAF0E4')],
        sun=(0.82, 0.20, 0.10, '#FFF6DA', 0.35, None),
        hill=['#9EBAB0', '#7FA39A'], city=['#6E8F8E', '#43626A', '#1F3440'],
        lit=0.0, horizon='#DCE8DF', kites=True, mosque=True,
    ),
    'night': dict(
        sky=[(0, '#070E18'), (0.40, '#0F1E2E'), (0.75, '#1E3550'), (0.85, '#2E4A6B')],
        sun=(0.78, 0.18, 0.05, '#EFE6CC', 0.22, (0.017, '#F4ECD6')),
        hill=['#22374E', '#1A2B40'], city=['#162536', '#0E1826', '#060B12'],
        lit=0.10, horizon='#2E4A6B', kites=False, mosque=True,
    ),
}


def paint(name, W, H, seed, mosque_x=0.62, kite_spots=None):
    cfg = SCENES[name]
    w, h = W * SS, H * SS
    s = SS * (W / 1800)
    img = sky(W, H, cfg['sky'])
    sx, sy, sr, scol, sst, disc = cfg['sun']
    img = glow(img, sx, sy, sr, scol, sst, disc)
    if name == 'night':  # stars
        r = np.random.default_rng(seed + 99)
        for _ in range(140):
            x, y = r.integers(0, W), r.integers(0, int(H * 0.55))
            img[y, x] = img[y, x] * 0.2 + rgb('#F4ECD6') * 0.8 * r.uniform(0.4, 1)
    img = hills(img, 0.66, 0.05, seed + 1, cfg['hill'][0], blur=2.2)
    img = hills(img, 0.70, 0.04, seed + 2, cfg['hill'][1], blur=1.6)
    img = mist(img, 0.62, 0.78, cfg['horizon'], 0.35)

    rng = np.random.default_rng(seed)
    far = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(far)
    if cfg['mosque']:
        mosque(d, w * mosque_x, h * 0.74, s * 0.85, mix(cfg['city'][0], cfg['horizon'], 0.15) + (255,))
    rooftops(d, w, h * 0.77, s * 0.8, mix(cfg['city'][0], cfg['horizon'], 0.1) + (255,), rng, 30, 90)
    img = composite(img, far, blur=1.4)
    img = mist(img, 0.72, 0.84, cfg['horizon'], 0.22)

    mid = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    lit = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    rooftops(ImageDraw.Draw(mid), w, h * 0.84, s, mix(cfg['city'][1], cfg['city'][1], 0) + (255,), rng, 40, 150,
             lit=ImageDraw.Draw(lit), lit_p=cfg['lit'])
    img = composite(img, mid, blur=0.8)
    img = composite(img, lit, blur=0.6)

    near = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    nd = ImageDraw.Draw(near)
    ncol = mix(cfg['city'][2], cfg['city'][2], 0) + (255,)
    rooftops(nd, w, h * 0.975, s * 1.25, ncol, rng, 10, 60, tanks=0.45)
    wires(nd, w, h * 0.82, s, ncol[:3] + (200,), rng)
    # Rooftop life: a washing line and a row of potted plants
    lx0, lx1, ly = w * 0.05, w * 0.34, h * 0.885
    nd.line([lx0, ly - 70 * s, lx0, h], fill=ncol, width=max(1, int(4 * s)))
    nd.line([lx1, ly - 70 * s, lx1, h], fill=ncol, width=max(1, int(4 * s)))
    string(nd, (lx0, ly - 66 * s), (lx1, ly - 66 * s), ncol, s, sag=0.05)
    cloth = [(245, 197, 66, 255), (236, 78, 139, 255), (158, 217, 195, 255), (255, 253, 247, 230), (127, 163, 160, 255)]
    for k, t in enumerate(np.linspace(0.08, 0.92, 7)):
        cx = lx0 + (lx1 - lx0) * t
        cy = ly - 66 * s + math.sin(t * math.pi) * 0.05 * (lx1 - lx0)
        cw, ch = (rng.integers(26, 46) * s, rng.integers(34, 70) * s)
        dim = 0.55 if name in ('dusk', 'night') else 0.8
        c = tuple(int(v * dim) for v in cloth[k % len(cloth)][:3]) + (255,)
        nd.rectangle([cx - cw / 2, cy, cx + cw / 2, cy + ch], fill=c)
    for px in np.linspace(w * 0.62, w * 0.96, 6):
        ph = rng.integers(26, 40) * s
        nd.rectangle([px - 12 * s, h * 0.955 - ph * 0.5, px + 12 * s, h], fill=ncol)
        for leaf in range(5):
            a = -math.pi / 2 + (leaf - 2) * 0.45
            nd.ellipse([px + math.cos(a) * 22 * s - 9 * s, h * 0.955 - ph * 0.5 + math.sin(a) * 30 * s - 14 * s,
                        px + math.cos(a) * 22 * s + 9 * s, h * 0.955 - ph * 0.5 + math.sin(a) * 30 * s + 14 * s], fill=ncol)
    img = composite(img, near, blur=0.5)

    if cfg['kites']:
        kl = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        kd = ImageDraw.Draw(kl)
        cols = [(245, 197, 66, 255), (236, 78, 139, 255), (158, 217, 195, 255), (255, 253, 247, 255)]
        spots = kite_spots or [(0.16, 0.30, 22, -0.3), (0.30, 0.18, 15, 0.25), (0.84, 0.36, 18, 0.15),
                               (0.47, 0.42, 11, -0.2), (0.92, 0.14, 12, 0.4)]
        for i, (kx, ky, ks, ka) in enumerate(spots):
            tail = kite(kd, kx * w, ky * h, ks * 1.6, ka, cols[i % len(cols)], s)
            string(kd, tail, (kx * w + (0.12 if kx < 0.5 else -0.12) * w, h * 0.86),
                   (255, 253, 247, 70), s, sag=0.08)
        img = composite(img, kl, blur=0.4)

    img = grain(img, 5, seed + 7)
    return save(img, f'{name}.webp', W, H, q=72 if W > 2000 else 74)


if __name__ == '__main__':
    paint('dusk', 2200, 1280, 11, mosque_x=0.66)
    paint('dawn', 1800, 1050, 21, mosque_x=0.30)
    paint('day', 1800, 1050, 31, mosque_x=0.74)
    paint('night', 1800, 1050, 41, mosque_x=0.55)
    # Soft, out-of-focus backdrops for glass sections
    for src, out in (('dusk', 'blur-dusk'), ('night', 'blur-night'), ('day', 'blur-day')):
        im = Image.open(os.path.join(OUT, f'{src}.webp')).convert('RGB').resize((900, 525), Image.LANCZOS)
        im = im.filter(ImageFilter.GaussianBlur(26))
        arr = grain(np.asarray(im, float), 4, 5)
        save(arr, f'{out}.webp', 900, 525, q=70)
