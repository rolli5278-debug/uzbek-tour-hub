# Foydalanuvchi bergan rasmni tiniqlashtirib (EDSR x2 neyron super-rezolyutsiya + yengil keskinlik),
# viloyat muqovasi yoki obida surati sifatida o'rnatadi.
# Ishlatish: python3 tools_region_cover.py <rasm> <shahar_id | mon:obida_id> "<muallif/manba>" [manba_sahifa_url]
import sys, os, json, cv2, numpy as np
from PIL import Image, ImageFilter
src, cid, credit = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "Uzbek Tour Hub")
BASE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(BASE, "public/images/w")
im = cv2.imread(src); assert im is not None, "rasm o'qilmadi"
h, w = im.shape[:2]
if max(w, h) < 1600:
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(os.environ.get("EDSR", "/home/claude/sr/EDSR_x2.pb")); sr.setModel("edsr", 2)
    T, P = 256, 12; out = np.zeros((h * 2, w * 2, 3), np.uint8)
    for y in range(0, h, T):
        for x in range(0, w, T):
            y0, x0, y1, x1 = max(0, y - P), max(0, x - P), min(h, y + T + P), min(w, x + T + P)
            up = sr.upsample(im[y0:y1, x0:x1])
            oy, ox = (y - y0) * 2, (x - x0) * 2; th, tw = min(T, h - y) * 2, min(T, w - x) * 2
            out[y * 2:y * 2 + th, x * 2:x * 2 + tw] = up[oy:oy + th, ox:ox + tw]
    im = out
pil = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
if pil.width > 2000: pil = pil.resize((2000, round(pil.height * 2000 / pil.width)), Image.LANCZOS)
is_mon = cid.startswith("mon:"); key = cid[4:] if is_mon else "city:" + cid
fn = (f"{key}-u1.webp" if is_mon else f"cover-{cid}.webp")
pil.save(os.path.join(OUT, fn), "WEBP", quality=86, method=6)
pil.resize((640, round(pil.height * 640 / pil.width)), Image.LANCZOS).save(os.path.join(OUT, fn.replace(".webp", "-s.webp")), "WEBP", quality=82, method=6)
M = json.load(open(os.path.join(BASE, "img_meta.json")))
page = sys.argv[4] if len(sys.argv) > 4 else ""
M[key] = [{"title": credit, "thumb": "", "page": page, "lic": "", "artist": credit, "w": pil.width, "h": pil.height, "file": fn}]
json.dump(M, open(os.path.join(BASE, "img_meta.json"), "w"), ensure_ascii=False, indent=1)
print(fn, pil.size)
