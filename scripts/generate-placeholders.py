"""
Генерирует демо-изображения в стиле архитектурных чертежей (фасады и планы)
для наполнения сайта до получения реальных фото объектов от заказчика.
Запуск: python3 scripts/generate-placeholders.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'src' / 'seed' / 'images'
OUT.mkdir(parents=True, exist_ok=True)

GREEN = (0, 79, 66)
GREEN_DARK = (0, 56, 47)
GOLD = (184, 150, 90)
PAPER = (244, 240, 231)
PAPER2 = (236, 232, 221)
WHITE = (255, 255, 255)

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
S = 2  # суперсэмплинг для сглаживания


def font(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT, size * S)


class Canvas:
    def __init__(self, w, h, bg, ink, accent, grid=None):
        self.w, self.h = w * S, h * S
        self.img = Image.new('RGB', (self.w, self.h), bg)
        self.d = ImageDraw.Draw(self.img)
        self.ink, self.accent, self.bg = ink, accent, bg
        if grid:
            step = 40 * S
            for x in range(0, self.w, step):
                self.d.line([(x, 0), (x, self.h)], fill=grid, width=1)
            for y in range(0, self.h, step):
                self.d.line([(0, y), (self.w, y)], fill=grid, width=1)

    def line(self, pts, width=2, fill=None):
        self.d.line([(x * S, y * S) for x, y in pts], fill=fill or self.ink, width=int(width * S), joint='curve')

    def rect(self, x0, y0, x1, y1, width=2, fill=None, outline=None):
        self.d.rectangle([x0 * S, y0 * S, x1 * S, y1 * S], fill=fill, outline=outline or self.ink, width=int(width * S))

    def poly(self, pts, width=2, fill=None, outline=None):
        p = [(x * S, y * S) for x, y in pts]
        if fill:
            self.d.polygon(p, fill=fill)
        self.d.line(p + [p[0]], fill=outline or self.ink, width=int(width * S), joint='curve')

    def circle(self, cx, cy, r, width=2, fill=None, outline=None):
        self.d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=fill, outline=outline or self.ink, width=int(width * S))

    def text(self, x, y, s, size=14, bold=False, fill=None, anchor='la'):
        self.d.text((x * S, y * S), s, font=font(size, bold), fill=fill or self.ink, anchor=anchor)

    def hatch(self, x0, y0, x1, y1, step=10, color=None, width=1):
        color = color or self.accent
        for k in range(int(x0 - (y1 - y0)), int(x1), step):
            a = (max(x0, k), y0 + (max(x0, k) - k))
            b_x = min(x1, k + (y1 - y0))
            b = (b_x, y0 + (b_x - k))
            if a[1] <= y1 and b[1] >= y0:
                self.line([a, b], width=width, fill=color)

    def save(self, name):
        out = self.img.resize((self.w // S, self.h // S), Image.LANCZOS)
        out.save(OUT / name, quality=88)
        print('saved', name)


def dimension(c, x0, x1, y, label, color=None):
    color = color or c.ink
    c.line([(x0, y), (x1, y)], width=1, fill=color)
    for x in (x0, x1):
        c.line([(x, y - 8), (x, y + 8)], width=1, fill=color)
        c.line([(x - 5, y + 5), (x + 5, y - 5)], width=1.5, fill=color)
    c.text((x0 + x1) / 2, y - 6, label, size=12, fill=color, anchor='md')


def tree(c, x, ground, h, color):
    c.line([(x, ground), (x, ground - h * 0.45)], width=1.5, fill=color)
    c.circle(x, ground - h * 0.62, h * 0.3, width=1.5, outline=color)
    c.circle(x - h * 0.12, ground - h * 0.7, h * 0.18, width=1, outline=color)


def person(c, x, ground, color):
    c.circle(x, ground - 52, 5, width=1.5, outline=color)
    c.line([(x, ground - 46), (x, ground - 22)], width=1.5, fill=color)
    c.line([(x, ground - 22), (x - 6, ground)], width=1.5, fill=color)
    c.line([(x, ground - 22), (x + 6, ground)], width=1.5, fill=color)
    c.line([(x - 9, ground - 38), (x + 9, ground - 38)], width=1.5, fill=color)


def windows(c, x0, y0, x1, y1, cols, rows, gap=14, mullion=True, fill=None):
    cw = (x1 - x0 - gap * (cols + 1)) / cols
    rh = (y1 - y0 - gap * (rows + 1)) / rows
    for i in range(cols):
        for j in range(rows):
            wx0 = x0 + gap + i * (cw + gap)
            wy0 = y0 + gap + j * (rh + gap)
            c.rect(wx0, wy0, wx0 + cw, wy0 + rh, width=1.5, fill=fill)
            if mullion and cw > 40:
                c.line([(wx0 + cw / 2, wy0), (wx0 + cw / 2, wy0 + rh)], width=1)


def stamp(c, title, sub, w, h, color):
    bx0, by0 = w - 330, h - 78
    c.rect(bx0, by0, w - 30, h - 30, width=1.5, outline=color)
    c.line([(bx0 + 92, by0), (bx0 + 92, h - 30)], width=1, fill=color)
    c.text(bx0 + 46, by0 + 25, 'BAIYM', size=15, bold=True, fill=color, anchor='mm')
    c.text(bx0 + 106, by0 + 12, title, size=12, bold=True, fill=color)
    c.text(bx0 + 106, by0 + 30, sub, size=11, fill=color)


def facade(name, seed, dark=False, pitched=False, floors=2, w=1600, h=1200):
    rnd = random.Random(seed)
    if dark:
        c = Canvas(w, h, GREEN, (232, 238, 235), GOLD, grid=(10, 92, 79))
        soft = (150, 190, 178)
    else:
        c = Canvas(w, h, PAPER, GREEN, GOLD, grid=(231, 226, 214))
        soft = (140, 170, 160)
    ground = h * 0.74
    fh = h * (0.2 if floors == 1 else 0.17 if floors == 2 else 0.135)
    # земля
    c.line([(40, ground), (w - 40, ground)], width=3)
    for x in range(40, int(w - 40), 18):
        c.line([(x, ground + 2), (x - 10, ground + 12)], width=1, fill=soft)
    # основной объём
    bw = rnd.randint(int(w * 0.44), int(w * 0.5))
    bx0 = rnd.randint(int(w * 0.13), int(w * 0.17))
    by0 = ground - fh * floors
    c.rect(bx0, by0, bx0 + bw, ground, width=3)
    for f in range(1, floors):
        c.line([(bx0, ground - fh * f), (bx0 + bw, ground - fh * f)], width=2)
    # золотая облицовка слева и окна
    clad = 96
    c.hatch(bx0 + 3, by0 + 3, bx0 + clad, ground - 3, step=10, width=1)
    c.line([(bx0 + clad, by0), (bx0 + clad, ground)], width=1.5)
    for f in range(floors):
        windows(c, bx0 + clad + 6, ground - fh * (f + 1) + 22, bx0 + bw - 18, ground - fh * f - 26, rnd.choice([3, 3, 4]), 1)
    # крыша
    if pitched:
        ridge = by0 - rnd.randint(int(h * 0.14), int(h * 0.18))
        c.poly([(bx0 - 34, by0), (bx0 + bw / 2, ridge), (bx0 + bw + 34, by0)], width=3)
        c.line([(bx0 + bw / 2, ridge), (bx0 + bw / 2, by0)], width=1, fill=soft)
    else:
        c.rect(bx0 - 26, by0 - 20, bx0 + bw + 26, by0, width=3)
    # пристройка с входом
    ax0 = bx0 + bw
    aw = rnd.randint(int(w * 0.18), int(w * 0.22))
    ah = fh * (1.15 if floors > 1 else 0.85)
    c.rect(ax0, ground - ah, ax0 + aw, ground, width=3)
    c.rect(ax0 - 12, ground - ah - 16, ax0 + aw + 46, ground - ah, width=2.5)
    door_w = 70
    c.rect(ax0 + 30, ground - ah * 0.78, ax0 + 30 + door_w, ground, width=2)
    c.rect(ax0 + 30 + door_w + 24, ground - ah + 34, ax0 + aw - 24, ground - 14, width=1.5)
    # деревья только на свободных местах
    if bx0 > 150:
        tree(c, bx0 - 78, ground, rnd.randint(190, 250), soft)
    right_free = ax0 + aw + 46
    if w - right_free > 160:
        tree(c, right_free + (w - right_free) / 2, ground, rnd.randint(210, 270), soft)
    person(c, bx0 + bw * 0.55, ground, soft)
    person(c, ax0 + 30 + door_w + 60, ground, soft)
    # солнце
    c.circle(w * 0.84, h * 0.15, 40, width=2, outline=GOLD)
    # размеры и оси
    dimension(c, bx0, bx0 + bw, ground + 56, f'{rnd.randint(10, 16)} 400')
    dimension(c, ax0, ax0 + aw, ground + 56, f'{rnd.randint(4, 7)} 200')
    for i, x in enumerate([bx0, bx0 + bw, ax0 + aw]):
        c.circle(x, ground + 112, 15, width=1.5)
        c.text(x, ground + 112, str(i + 1), size=13, anchor='mm')
    # отметки уровней справа
    lx = w - 120
    for lvl, y in [('±0.000', ground), (f'+{floors * 3}.300', by0)]:
        c.line([(lx - 40, y), (lx + 10, y)], width=1, fill=GOLD)
        c.poly([(lx - 40, y), (lx - 50, y - 10), (lx - 30, y - 10)], width=1, outline=GOLD)
        c.text(lx - 40, y - 14, lvl, size=11, fill=GOLD, anchor='ld')
    stamp(c, 'ДЕМО-ИЗОБРАЖЕНИЕ', 'Фасад · М 1:100', w, h, c.ink)
    c.save(name)


def plan(name, seed, dark=False, w=1600, h=1200):
    rnd = random.Random(seed)
    if dark:
        c = Canvas(w, h, GREEN, (232, 238, 235), GOLD, grid=(10, 92, 79))
    else:
        c = Canvas(w, h, PAPER2, GREEN, GOLD, grid=(226, 221, 208))
    x0, y0, x1, y1 = 220, 170, w - 260, h - 210
    wall = 10
    c.rect(x0, y0, x1, y1, width=wall)
    mx = x0 + (x1 - x0) * rnd.uniform(0.52, 0.6)
    my = y0 + (y1 - y0) * rnd.uniform(0.45, 0.55)
    c.line([(mx, y0), (mx, y1)], width=6)
    c.line([(x0, my), (mx - 120, my)], width=6)
    c.line([(mx, my + 40), (x1, my + 40)], width=6)
    c.line([(mx + (x1 - mx) / 2, my + 40), (mx + (x1 - mx) / 2, y1)], width=6)
    # двери (дуги)
    for (dx, dy, r, start) in [(mx - 120, my, 80, 0), (mx, y0 + 120, 70, 90), (mx + 30, my + 40, 70, 0)]:
        c.d.arc([(dx - r) * S, (dy - r) * S, (dx + r) * S, (dy + r) * S], start, start + 90, fill=c.ink, width=2 * S)
    # окна (разрывы с двойной линией)
    for wx in [x0 + 120, x0 + 360, mx + 120, x1 - 180]:
        c.rect(wx, y0 - 8, wx + 120, y0 + 8, width=1.5, fill=c.bg)
        c.line([(wx, y0), (wx + 120, y0)], width=1)
    for wx in [x0 + 160, mx + 200]:
        c.rect(wx, y1 - 8, wx + 140, y1 + 8, width=1.5, fill=c.bg)
    # мебель/подписи
    rooms = [
        ((x0 + mx) / 2, (y0 + my) / 2, 'Гостиная', '32,4 м²'),
        ((x0 + mx) / 2, (my + y1) / 2, 'Кухня-столовая', '24,8 м²'),
        ((mx + x1) / 2, (y0 + my + 40) / 2, 'Спальня', '18,6 м²'),
        ((mx + mx + (x1 - mx) / 2) / 2, (my + 40 + y1) / 2, 'С/у', '6,2 м²'),
        ((mx + (x1 - mx) / 2 + x1) / 2, (my + 40 + y1) / 2, 'Кабинет', '11,0 м²'),
    ]
    for (rx, ry, t, a) in rooms:
        c.text(rx, ry - 10, t, size=17, bold=True, anchor='mm')
        c.text(rx, ry + 16, a, size=13, anchor='mm', fill=GOLD)
    # стол и диван
    c.rect(x0 + 80, my - 150, x0 + 260, my - 70, width=1.5)
    c.circle((x0 + mx) / 2 + 60, (my + y1) / 2 + 70, 46, width=1.5)
    # размерные цепочки
    dimension(c, x0, mx, y0 - 70, f'{rnd.randint(6, 8)} 200')
    dimension(c, mx, x1, y0 - 70, f'{rnd.randint(4, 6)} 800')
    dimension(c, x0, x1, y1 + 70, f'{rnd.randint(12, 14)} 000')
    # штриховка-акцент
    c.hatch(mx + 6, y0 + 6, mx + 80, my + 34, step=12, width=1)
    # стрелка севера
    nx, ny = w - 150, 200
    c.circle(nx, ny, 40, width=1.5)
    c.poly([(nx, ny - 34), (nx - 12, ny + 10), (nx, ny + 2), (nx + 12, ny + 10)], width=1.5, fill=GOLD, outline=GOLD)
    c.text(nx, ny - 58, 'С', size=14, bold=True, anchor='mm')
    stamp(c, 'ДЕМО-ИЗОБРАЖЕНИЕ', 'План 1 этажа · М 1:100', w, h, c.ink)
    c.save(name)


def massing(name, seed, w=1600, h=1200):
    """Аксонометрия: объёмная схема здания"""
    rnd = random.Random(seed)
    c = Canvas(w, h, (238, 243, 241), GREEN, GOLD, grid=(222, 231, 228))
    ang = math.radians(30)
    k = 1.35

    def iso(x, y, z):
        cx, cy = w * 0.5, h * 0.56
        return (cx + (x - y) * math.cos(ang) * k, cy + (x + y) * math.sin(ang) * k - z * k)

    def box(x, y, z, dx, dy, dz, top, left, right):
        p = iso
        c.poly([p(x, y + dy, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)], width=2, fill=left)
        c.poly([p(x + dx, y, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x + dx, y, z + dz)], width=2, fill=right)
        c.poly([p(x, y, z + dz), p(x + dx, y, z + dz), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)], width=2, fill=top)

    def win_y(x, y, z, wdt, hgt):
        c.poly([iso(x, y, z), iso(x + wdt, y, z), iso(x + wdt, y, z + hgt), iso(x, y, z + hgt)], width=1.5, fill=(160, 190, 182))

    def win_x(x, y, z, wdt, hgt):
        c.poly([iso(x, y, z), iso(x, y + wdt, z), iso(x, y + wdt, z + hgt), iso(x, y, z + hgt)], width=1.5, fill=(160, 190, 182))

    def tree_at(tx, ty):
        bx, by = iso(tx, ty, 0)
        c.line([(bx, by), (bx, by - 70)], width=1.5)
        c.circle(bx, by - 108, 44, width=1.5, fill=(214, 228, 222))

    L = rnd.randint(260, 320)
    D = rnd.randint(190, 230)
    H1 = rnd.randint(130, 150)
    H2 = rnd.randint(110, 130)
    trees = [(L + 140, -170), (-230, -170), (L + 120, D + 140), (-200, D + 170)]
    back = [t for t in trees if t[0] + t[1] < 120]
    front = [t for t in trees if t[0] + t[1] >= 120]
    c.poly([iso(-280, -230, 0), iso(L + 220, -230, 0), iso(L + 220, D + 230, 0), iso(-280, D + 230, 0)], width=1.5, fill=(226, 234, 230))
    for t in back:
        tree_at(*t)
    box(-120, -40, 0, L, D, H1, (250, 248, 243), (205, 220, 214), (180, 202, 194))
    box(-120 + L * 0.35, -40, H1, L * 0.65, D * 0.8, H2, (250, 248, 243), (205, 220, 214), (180, 202, 194))
    box(-230, D * 0.45, 0, 110, D * 0.75, H1 * 0.7, (241, 232, 214), (222, 205, 172), (204, 182, 140))
    n = 4
    for i in range(n):
        win_y(-120 + 24 + i * (L - 30) / n + 12, -40 + D, 30, (L - 30) / n - 30, H1 - 70)
    for i in range(3):
        win_y(-120 + L * 0.35 + 20 + i * (L * 0.65 - 20) / 3, -40 + D * 0.8, H1 + 25, (L * 0.65 - 20) / 3 - 26, H2 - 55)
    for i in range(2):
        win_x(-120 + L, -40 + 20 + i * (D - 30) / 2, 30, (D - 30) / 2 - 24, H1 - 70)
    for t in front:
        tree_at(*t)
    stamp(c, 'ДЕМО-ИЗОБРАЖЕНИЕ', 'Объёмная схема', w, h, GREEN)
    c.save(name)


facade('facade-1.jpg', 11, floors=2)
facade('facade-2.jpg', 23, pitched=True, floors=2)
facade('facade-3.jpg', 37, dark=True, floors=3)
facade('facade-4.jpg', 41, pitched=True, floors=1)
facade('facade-5.jpg', 53, floors=3)
facade('facade-6.jpg', 67, dark=True, pitched=True, floors=2)
plan('plan-1.jpg', 5)
plan('plan-2.jpg', 9, dark=True)
massing('massing-1.jpg', 3)
massing('massing-2.jpg', 8)
