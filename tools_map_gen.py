# Har bir o'z surati yo'q obida uchun aniq joylashuv xaritasi (Natural Earth admin-1, public domain)
import json, math, asyncio, sys, os
from PIL import Image
BASE = os.path.dirname(os.path.abspath(__file__)); OUTD = BASE + "/public/images/w"
# Manba: https://github.com/nvkelso/natural-earth-vector — geojson/ne_10m_admin_1_states_provinces.geojson (public domain)
NE = json.load(open(os.path.join(os.path.dirname(__file__), "ne_admin1.geojson")))
REG = {"andijon": "Andijon", "fargona": "Ferghana", "namangan": "Namangan", "qoqon": "Ferghana", "samarqand": "Samarkand", "buxoro": "Bukhoro", "xiva": "Khorezm",
       "shahrisabz": "Kashkadarya", "toshkent": "Tashkent", "termiz": "Surkhandarya", "qoraqalpogiston": "Karakalpakstan"}
CITIES = {"Andijon": [("Andijon", 40.7821, 72.3442), ("Asaka", 40.6415, 72.2387), ("Shahrixon", 40.7136, 72.0571), ("Xonobod", 40.8000, 73.0000), ("Paxtaobod", 40.9300, 72.5000), ("Qo'rg'ontepa", 40.7300, 72.7600)],
          "Ferghana": [("Farg'ona", 40.3864, 71.7864), ("Marg'ilon", 40.4724, 71.7246), ("Qo'qon", 40.5286, 70.9425), ("Quva", 40.5220, 72.0700), ("Rishton", 40.3567, 71.2847), ("Beshariq", 40.4358, 70.6103)],
          "Namangan": [("Namangan", 40.9983, 71.6726), ("Chust", 41.0035, 71.2378), ("Pop", 40.8736, 71.1089), ("Chortoq", 41.0690, 71.8237), ("Uchqo'rg'on", 41.1136, 72.0790)]}
feats = [f for f in NE["features"] if f["properties"].get("adm0_a3") in ("UZB", "KGZ", "TJK", "KAZ", "TKM", "AFG")]
def rings(f):
    g = f["geometry"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    return [p[0] for p in polys]
def region(name): return next(f for f in feats if f["properties"]["adm0_a3"] == "UZB" and f["properties"]["name"] == name)
W, H = 1400, 1100
GIRIH = open(BASE + "/public/assets/img/naqsh/girih.svg").read()
HOSH = open(BASE + "/public/assets/img/naqsh/hoshiya.svg").read()
ROZ = open(BASE + "/public/assets/img/naqsh/rozetka.svg").read()
import base64
b64 = lambda s: "data:image/svg+xml;base64," + base64.b64encode(s.encode()).decode()
def svg_for(lat, lng, regname):
    rf = region(regname); rr = rings(rf)
    has = lat is not None and lng is not None
    xs = [p[0] for r in rr for p in r] + ([lng] if has else []); ys = [p[1] for r in rr for p in r] + ([lat] if has else [])
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    k = math.cos(math.radians((miny + maxy) / 2))
    padx, pady = 230, 150
    sx = (W - 2 * padx) / ((maxx - minx) * k); sy = (H - 2 * pady) / (maxy - miny); s = min(sx, sy)
    ox = (W - (maxx - minx) * k * s) / 2; oy = (H - (maxy - miny) * s) / 2 + 10
    P = lambda x, y: (ox + (x - minx) * k * s, oy + (maxy - y) * s)
    def path(r): return "M" + " L".join("%.1f %.1f" % P(x, y) for x, y in r) + "Z"
    nb = "".join('<path d="%s"/>' % path(r) for f in feats if f is not rf for r in rings(f))
    rg = "".join('<path d="%s"/>' % path(r) for r in rr)
    cities = ""
    for nm, cy, cx in CITIES.get(regname, []):
        x, y = P(cx, cy)
        if 0 < x < W and 0 < y < H:
            cities += '<circle cx="%.1f" cy="%.1f" r="7" fill="#fff" stroke="#123a7a" stroke-width="3"/><text x="%.1f" y="%.1f">%s</text>' % (x, y, x + 13, y + 7, nm)
    px, py = P(lng, lat) if has else (-999, -999)
    # O'zbekiston kichik xaritasi (inset)
    uz = [f for f in feats if f["properties"]["adm0_a3"] == "UZB"]
    ux = [p[0] for f in uz for r in rings(f) for p in r]; uy = [p[1] for f in uz for r in rings(f) for p in r]
    iw, ih = 300, 200; k2 = math.cos(math.radians(41)); s2 = min((iw - 20) / ((max(ux) - min(ux)) * k2), (ih - 20) / (max(uy) - min(uy)))
    Q = lambda x, y: (10 + (x - min(ux)) * k2 * s2, 10 + (max(uy) - y) * s2)
    ipath = lambda r: "M" + " L".join("%.1f %.1f" % Q(x, y) for x, y in r) + "Z"
    inset = "".join('<path d="%s" fill="%s" stroke="#fff" stroke-width="1"/>' % (ipath(r), "#1aa39b" if f is rf else "#c9d3e6") for f in uz for r in rings(f))
    qx, qy = Q(lng, lat) if has else (-999, -999)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><pattern id="g" width="96" height="96" patternUnits="userSpaceOnUse"><image href="{b64(GIRIH)}" width="96" height="96"/></pattern>
<pattern id="h" width="72" height="24" patternUnits="userSpaceOnUse"><image href="{b64(HOSH)}" width="72" height="24"/></pattern>
<linearGradient id="rf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f4f1"/><stop offset="1" stop-color="#cbe9e4"/></linearGradient>
<radialGradient id="pg"><stop offset="0" stop-color="#d6a640" stop-opacity=".55"/><stop offset="1" stop-color="#d6a640" stop-opacity="0"/></radialGradient>
<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#123a7a" flood-opacity=".35"/></filter></defs>
<rect width="{W}" height="{H}" fill="#fbf8f1"/><rect width="{W}" height="{H}" fill="url(#g)"/>
<g fill="#efe9db" stroke="#cbbf a5" stroke-width="2" stroke-linejoin="round">{nb.replace('<path', '<path stroke="#cdbf9f"')}</g>
<rect width="{W}" height="{H}" fill="url(#g)" opacity=".7"/>
<g fill="url(#rf)" stroke="#123a7a" stroke-width="5" stroke-linejoin="round" filter="url(#sh)">{rg}</g>
<g font-family="DM Sans, Arial, sans-serif" font-size="30" font-weight="700" fill="#123a7a" paint-order="stroke" stroke="#fbf8f1" stroke-width="7">{cities}</g>
<circle cx="{px:.1f}" cy="{py:.1f}" r="120" fill="url(#pg)"/>
<circle cx="{px:.1f}" cy="{py:.1f}" r="54" fill="none" stroke="#d6a640" stroke-width="3" stroke-dasharray="6 8"/>
<g filter="url(#sh)" transform="translate({px:.1f} {py:.1f})"><path d="M0 0 C-14 -26 -40 -44 -40 -72 A40 40 0 1 1 40 -72 C40 -44 14 -26 0 0Z" fill="#123a7a" stroke="#fff" stroke-width="5"/><circle cy="-72" r="17" fill="#d6a640"/><circle cy="-72" r="7" fill="#fff"/></g>
<g transform="translate({W - iw - 150} {H - ih - 60})"><rect width="{iw}" height="{ih}" rx="18" fill="#fff" stroke="#d6a640" stroke-width="3"/>{inset}<circle cx="{qx:.1f}" cy="{qy:.1f}" r="7" fill="#123a7a" stroke="#fff" stroke-width="2"/></g>
<image href="{b64(ROZ)}" x="150" y="{H - 220}" width="150" height="150" opacity=".55"/>
<rect width="{W}" height="24" fill="url(#h)"/><rect y="{H - 24}" width="{W}" height="24" fill="url(#h)"/>
</svg>'''
async def main(jobs):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": W, "height": H})
        for mid, lat, lng, reg in jobs:
            await pg.set_content('<html><body style="margin:0">' + svg_for(lat, lng, reg) + "</body></html>")
            await pg.wait_for_timeout(60)
            png = f"/tmp/map_{mid}.png"; await pg.screenshot(path=png)
            im = Image.open(png).convert("RGB")
            im.save(f"{OUTD}/map-{mid}.webp", "WEBP", quality=82, method=6)
            im.resize((640, round(H * 640 / W)), Image.LANCZOS).save(f"{OUTD}/map-{mid}-s.webp", "WEBP", quality=80, method=6)
            os.remove(png)
        await b.close()
if __name__ == "__main__":
    data = json.load(open(BASE + "/data.json"))
    only = sys.argv[1:]
    jobs = [(m["id"], m["lat"], m["lng"], REG[m["city"]]) for m in data["monuments"]
            if (m["imgs"] and m["imgs"][0]["c"].get("k") in ("city", "near")) and (not only or m["id"] in only)]
    print(len(jobs)); asyncio.run(main(jobs)); print("done")
