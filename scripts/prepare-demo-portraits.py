"""
Готовит демо-портреты специалистов для демо-контента: обрезает до 4:5, уменьшает до 1200×1500
и ставит штамп «ДЕМО-ФОТО», чтобы сгенерированные портреты нельзя было принять за реальных сотрудников.

Запуск: python3 scripts/prepare-demo-portraits.py <исходник> <имя> [<исходник> <имя> ...]
Пример: python3 scripts/prepare-demo-portraits.py ~/portraits/p0.png team-1
Результат: src/seed/images/<имя>.jpg
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'src' / 'seed' / 'images'
W, H = 1200, 1500  # 4:5, как карточки специалистов на сайте

GREEN = (0, 79, 66)
PAPER = (244, 240, 231)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def crop_4x5(img: Image.Image) -> Image.Image:
    w, h = img.size
    target_h = round(w * 5 / 4)
    if target_h <= h:
        # Лишнюю высоту в основном срезаем снизу: над головой остаётся воздух
        extra = h - target_h
        top = extra // 4
        return img.crop((0, top, w, top + target_h))
    target_w = round(h * 4 / 5)
    left = (w - target_w) // 2
    return img.crop((left, 0, left + target_w, h))


def stamp(img: Image.Image) -> Image.Image:
    """Штамп в духе углового штампа чертежа, как на остальных демо-картинках"""
    d = ImageDraw.Draw(img, 'RGBA')
    f_logo = ImageFont.truetype(FONT_B, 30)
    f_title = ImageFont.truetype(FONT_B, 32)
    f_sub = ImageFont.truetype(FONT, 22)
    pad, gap = 22, 18
    logo, title, sub = 'BAIYM', 'ДЕМО-ФОТО', 'портрет создан ИИ'
    logo_w = d.textlength(logo, font=f_logo)
    text_w = max(d.textlength(title, font=f_title), d.textlength(sub, font=f_sub))
    box_w = int(pad + logo_w + gap * 2 + text_w + pad)
    box_h = 92
    margin = 30
    x1, y1 = W - margin - box_w, H - margin - box_h
    x2, y2 = W - margin, H - margin
    d.rectangle([x1, y1, x2, y2], fill=PAPER + (238,), outline=GREEN, width=3)
    sep = int(x1 + pad + logo_w + gap)
    d.line([(sep, y1), (sep, y2)], fill=GREEN, width=2)
    d.text((x1 + pad, (y1 + y2) / 2), logo, font=f_logo, fill=GREEN, anchor='lm')
    d.text((sep + gap, y1 + 16), title, font=f_title, fill=GREEN, anchor='lt')
    d.text((sep + gap, y2 - 16), sub, font=f_sub, fill=GREEN, anchor='lb')
    return img


def main(args: list[str]) -> None:
    if not args or len(args) % 2:
        print(__doc__)
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)
    for src, name in zip(args[::2], args[1::2]):
        img = Image.open(src).convert('RGB')
        img = crop_4x5(img).resize((W, H), Image.LANCZOS)
        img = stamp(img)
        out = OUT / f'{name}.jpg'
        img.save(out, 'JPEG', quality=84, optimize=True, progressive=True)
        print(f'{src} -> {out} ({out.stat().st_size // 1024} КБ)')


if __name__ == '__main__':
    main(sys.argv[1:])
