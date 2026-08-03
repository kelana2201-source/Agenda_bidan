#!/usr/bin/env python3
"""Generator ikon PWA 'Agenda & Manajemen Kegiatan Bidan'.
Menghasilkan: favicon.png (128), icon-192.png, icon-512.png
Desain: kartu kalender putih di atas gradasi teal, lencana medis (palang) rose.
"""
from PIL import Image, ImageDraw, ImageFilter

S = 512
R = 118  # radius sudut background

def gradient(size, c1, c2, vertical=True):
    img = Image.new("RGB", size)
    d = ImageDraw.Draw(img)
    w, h = size
    for i in range(h if vertical else w):
        t = i / (h - 1 if vertical else w - 1)
        col = tuple(int(c1[j] + (c2[j] - c1[j]) * t) for j in range(3))
        if vertical:
            d.line([(0, i), (w, i)], fill=col)
        else:
            d.line([(i, 0), (i, h)], fill=col)
    return img

def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return m

def make_icon(size):
    base = gradient((S, S), (0x0F, 0x76, 0x6E), (0x02, 0x84, 0xC7))
    base = base.filter(ImageFilter.GaussianBlur(0))  # no-op, keep crisp
    mask = rounded_mask((S, S), R)
    base.putalpha(mask)

    d = ImageDraw.Draw(base, "RGBA")

    # --- Kartu kalender (putih) dengan bayangan lembut ---
    sheet = (88, 104, 424, 408)
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sh)
    ds.rounded_rectangle([sheet[0], sheet[1] + 14, sheet[2], sheet[3] + 14],
                         radius=44, fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(12))
    base.alpha_composite(sh)
    d.rounded_rectangle(sheet, radius=44, fill=(255, 255, 255, 255))

    # Header kalender (teal tua) + ring binder
    d.rounded_rectangle([sheet[0], sheet[1], sheet[2], sheet[1] + 76],
                        radius=44, fill=(0x0F, 0x76, 0x6E, 255))
    d.rectangle([sheet[0], sheet[1] + 38, sheet[2], sheet[1] + 76], fill=(0x0F, 0x76, 0x6E, 255))
    # lubang ring
    d.ellipse([148, 92, 196, 140], fill=(0x0F, 0x76, 0x6E, 255))
    d.ellipse([316, 92, 364, 140], fill=(0x0F, 0x76, 0x6E, 255))
    d.ellipse([160, 104, 184, 128], fill=(0x0F, 0x76, 0x6E, 255))
    d.ellipse([328, 104, 352, 128], fill=(0x0F, 0x76, 0x6E, 255))
    d.ellipse([160, 104, 184, 128], outline=(0xF5, 0x9E, 0x0B, 255), width=7)
    d.ellipse([328, 104, 352, 128], outline=(0xF5, 0x9E, 0x0B, 255), width=7)
    # garis header bawah
    d.line([sheet[0] + 18, sheet[1] + 76, sheet[2] - 18, sheet[1] + 76],
           fill=(0xE2, 0xE8, 0xF0, 255), width=3)

    # Grid tanggal (titik-titik)
    dots = []
    for r in range(3):
        for c in range(5):
            x = 128 + c * 62
            y = 232 + r * 46
            dots.append((x, y))
    for i, (x, y) in enumerate(dots):
        fill = (0x14, 0xB8, 0xA6, 255) if i in (1, 2, 4, 8, 12, 13) else (0xC7, 0xD2, 0xE0, 255)
        d.rounded_rectangle([x - 8, y - 8, x + 8, y + 8], radius=6, fill=fill)

    # Lencana medis: lingkaran rose + palang putih
    cx, cy, cr = 256, 296, 64
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(0xE1, 0x1D, 0x48, 255))
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], outline=(255, 255, 255, 80), width=4)
    d.rounded_rectangle([cx - 11, cy - 34, cx + 11, cy + 34], radius=9, fill=(255, 255, 255, 255))
    d.rounded_rectangle([cx - 34, cy - 11, cx + 34, cy + 11], radius=9, fill=(255, 255, 255, 255))

    # Lencana kecil "selesai" (centang) di pojok kartu
    bx, by, br = 392, 372, 34
    d.ellipse([bx - br, by - br, bx + br, by + br], fill=(0x22, 0xC5, 0x5E, 255))
    d.line([bx - 14, by, bx - 4, by + 12], fill=(255, 255, 255, 255), width=7, joint="curve")
    d.line([bx - 4, by + 12, bx + 16, by - 12], fill=(255, 255, 255, 255), width=7, joint="curve")

    # Render ke ukuran akhir (anti-alias via downscale)
    img = base.convert("RGBA").resize((size, size), Image.LANCZOS)
    return img

def main():
    make_icon(512).save("icon-512.png")
    make_icon(192).save("icon-192.png")
    make_icon(128).save("favicon.png")
    print("OK: icon-512.png, icon-192.png, favicon.png")

if __name__ == "__main__":
    main()
