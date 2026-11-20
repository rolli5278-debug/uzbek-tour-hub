# Statik HTML sahifalarni yaratadi (SEO uchun har bir obida, shahar va yo'nalish alohida tayyor HTML).
# Ishga tushirish: SITE_URL=https://sizning-domen.netlify.app python3 build_pages.py
import json, os
import html, shutil
BASE = os.path.dirname(os.path.abspath(__file__))

SITE = os.environ.get("SITE_URL", "https://uzbek-tour-hub.netlify.app").rstrip("/")
D = json.load(open(os.path.join(BASE, "data.json")))
PUB = os.path.join(BASE, "public")
E = lambda s: html.escape(str(s or ""), quote=True)
city = {c["id"]: c for c in D["cities"]}

HEAD = '''<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#3d00b7">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Uzbek Tour Hub">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="{ogtype}">
<meta property="og:url" content="{url}">
{ogimg}<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%233d00b7'/%3E%3Cpath d='M32 12l18 10v4H14v-4zM18 29h5v16h-5zm11 0h6v16h-6zm12 0h5v16h-5zM14 48h36v4H14z' fill='%23fff'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=Unbounded:wght@800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap">
{extra}<link rel="stylesheet" href="/assets/css/site.css">
{ld}</head>
<body{bodyattr}>
<a class="sr-only" href="#main">Asosiy kontentga o'tish</a>
<header id="site-header" class="site-header"></header>
<main id="main">
{body}
</main>
<footer id="site-footer" class="site-footer"></footer>
<script src="/assets/js/data.js"></script>
<script src="/assets/js/i18n.js"></script>
<script src="/assets/js/common.js"></script>
{extra_js}<script src="/assets/js/pages.js"></script>
<script>UTH.boot("{active}", function () {{ {call} }});</script>
</body>
</html>
'''
LEAF_CSS = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">\n'
LEAF_JS = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>\n'
SITEMAP = []

def page(path, title, desc, body, active, fn, leaflet=False, data_id=None, img=None, ld=None, ogtype="website", prio="0.6"):
    url = SITE + ("/" if path == "index.html" else "/" + path)
    out = HEAD.format(
        title=E(title), desc=E(desc), url=url, ogtype=ogtype,
        ogimg=f'<meta property="og:image" content="{SITE}{img}">\n' if img else "",
        extra=LEAF_CSS if leaflet else "", extra_js=LEAF_JS if leaflet else "",
        ld=f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n' if ld else "",
        bodyattr=f' data-id="{E(data_id)}"' if data_id else "",
        body=body, active=active, call=f"UTHPages.{fn}();" if fn else "")
    full = os.path.join(PUB, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w").write(out)
    if not path.startswith("404") and prio:
        SITEMAP.append((url, prio))

def fig(im, alt):
    if not im:
        return ""
    return f'<img src="{im["s"]}" alt="{E(alt)}" width="1600" loading="eager">'

# ---- Asosiy sahifalar
page("index.html", "Uzbek Tour Hub — O'zbekistonning tarixiy obidalari", "O'zbekistonning tarixiy shaharlari va obidalari: haqiqiy joylashuv, qisqa tarix, sayyohlar reytingi va sarguzasht yo'nalishlari. O'zbek, rus va ingliz tillarida.",
     '<section class="hero" id="hero"><div class="wrap"><h1 class="display h1">O\'zbekistonning tarixiy obidalarini kashf eting</h1></div></section>\n<section class="section section-soft" id="features"></section>\n<section class="section" id="showcase"></section>\n<section class="section section-soft" id="collections"></section>\n<section class="section" id="advnow"></section>\n<section class="section section-soft" id="ai"></section>\n<section class="section" id="discover"></section>',
     "home", "home", img=D["monuments"][0]["imgs"][0]["s"] if D["monuments"][0]["imgs"] else None, prio="1.0")
mon_list = "".join(f'<li><a href="/obida/{m["id"]}.html">{E(m["name"]["uz"])}</a> — {E(city[m["city"]]["name"]["uz"])}</li>' for m in D["monuments"])
page("obidalar.html", "O'zbekistondagi tarixiy obidalar — Uzbek Tour Hub", f"O'zbekistondagi {len(D['monuments'])} ta tarixiy obida (davlat muhofazasida jami 8 437 ta meros obyekti bor): shahar va tur bo'yicha saralash, reyting.",
     f'<div id="page"><section class="page-hero wrap"><h1 class="display h1">O\'zbekistondagi tarixiy obidalar</h1><ul>{mon_list}</ul></section></div>', "mon", "list", prio="0.9")
page("reyting.html", "Obidalar reytingi — Uzbek Tour Hub", "Sayyohlar baholari asosidagi tarixiy obidalar reyting jadvali.", '<div id="page"></div>', "rating", "rating", prio="0.7")
page("sayohatlar.html", "Tarixiy sayohatlar — Uzbek Tour Hub", "Samarqand, Buxoro, Xiva, Qo'qon va Shahrisabz bo'ylab gid hamrohligidagi tarixiy sayohatlar.", '<div id="page"></div>', "tours", "tours", prio="0.7")
adv_list = "".join(f'<li><a href="/sarguzasht/{a["id"]}.html">{E(a["title"]["uz"])}</a></li>' for a in D["adventures"])
page("sarguzasht.html", "Sarguzasht va tabiat — Uzbek Tour Hub", "O'zbekistonda trekking, rafting, tog' chang'isi, cho'l safari va etnoturizm: qiyinlik, mavsum, xarita va ob-havo.",
     f'<div id="page"><section class="page-hero wrap"><h1 class="display h1">Sarguzasht va tabiat</h1><ul>{adv_list}</ul></section></div>', "adv", "adv", leaflet=True, prio="0.8")

# ---- Shaharlar
for c in D["cities"]:
    ms = [m for m in D["monuments"] if m["city"] == c["id"]]
    li = "".join(f'<li><a href="/obida/{m["id"]}.html">{E(m["name"]["uz"])}</a> — {E(m["short"]["uz"])}</li>' for m in ms)
    img = c["imgs"][0] if c["imgs"] else None
    body = (f'<div id="page"><section class="page-hero wrap"><p class="eyebrow">{E(c["region"]["uz"])}</p><h1 class="display h1">{E(c["name"]["uz"])}</h1>'
            f'<p class="lead">{E(c["intro"]["uz"])}</p>{fig(img, c["name"]["uz"])}<h2>{E(c["name"]["uz"])} obidalari</h2><ul>{li}</ul></section></div>')
    page(f'shahar/{c["id"]}.html', f'{c["name"]["uz"]}: tarixiy obidalar, mehmonxonalar va xizmatlar — Uzbek Tour Hub', c["intro"]["uz"], body, "mon", "city",
         leaflet=True, data_id=c["id"], img=img["s"] if img else None, prio="0.8",
         ld={"@context": "https://schema.org", "@type": "City", "name": c["name"]["uz"], "alternateName": [c["name"]["en"], c["name"]["ru"]],
             "geo": {"@type": "GeoCoordinates", "latitude": c["lat"], "longitude": c["lng"]}, "description": c["intro"]["uz"]})

# ---- Obidalar
for m in D["monuments"]:
    c = city[m["city"]]
    img = m["imgs"][0] if m["imgs"] else None
    body = (f'<div id="page"><section class="page-hero wrap"><nav class="breadcrumbs"><a href="/">Bosh sahifa</a><span>/</span><a href="/shahar/{c["id"]}.html">{E(c["name"]["uz"])}</a></nav>'
            f'<h1 class="display h1">{E(m["name"]["uz"])}</h1><p class="muted">{E(m["name"]["en"])} · {E(c["name"]["uz"])}</p>{fig(img, m["name"]["uz"])}'
            f'<p>{E(m["text"]["uz"])}</p><dl><dt>Qurilgan davri</dt><dd>{E(m["year"]["uz"])}</dd><dt>Bunyodkor</dt><dd>{E(m["builder"]["uz"])}</dd>'
            f'<dt>Koordinata</dt><dd>{m["lat"]}, {m["lng"]}</dd>'
            + "".join(f'<dt>UNESCO</dt><dd>{E(D["unesco"][k]["name"]["uz"])} ({D["unesco"][k]["year"]})</dd>' for k in m["unesco"]) + '</dl></section></div>')
    ld = {"@context": "https://schema.org", "@type": "TouristAttraction", "name": m["name"]["uz"], "alternateName": [m["name"]["en"], m["name"]["ru"]],
          "description": m["short"]["uz"], "url": f'{SITE}/obida/{m["id"]}.html',
          "geo": {"@type": "GeoCoordinates", "latitude": m["lat"], "longitude": m["lng"]},
          "containedInPlace": {"@type": "City", "name": c["name"]["uz"]}}
    if img:
        ld["image"] = SITE + img["s"]
    page(f'obida/{m["id"]}.html', f'{m["name"]["uz"]} — {c["name"]["uz"]} | Uzbek Tour Hub', m["short"]["uz"], body, "mon", "mon",
         data_id=m["id"], img=img["s"] if img else None, ld=ld, ogtype="article", prio="0.7")

# ---- Sarguzasht yo'nalishlari
for a in D["adventures"]:
    img = a["imgs"][0] if a["imgs"] else None
    prog = "".join(f"<li>{E(p)}</li>" for p in a["program"]["uz"])
    body = (f'<div id="page"><section class="page-hero wrap"><h1 class="display h1">{E(a["title"]["uz"])}</h1>{fig(img, a["title"]["uz"])}'
            f'<p>{E(a["desc"]["uz"])}</p><h2>Kunma-kun dastur</h2><ol>{prog}</ol></section></div>')
    page(f'sarguzasht/{a["id"]}.html', f'{a["title"]["uz"]} — Sarguzasht | Uzbek Tour Hub', a["desc"]["uz"], body, "adv", "advDetail",
         leaflet=True, data_id=a["id"], img=img["s"] if img else None, ogtype="article", prio="0.6",
         ld={"@context": "https://schema.org", "@type": "TouristTrip", "name": a["title"]["uz"], "description": a["desc"]["uz"],
             "touristType": "Adventure", "itinerary": {"@type": "Place", "geo": {"@type": "GeoCoordinates", "latitude": a["lat"], "longitude": a["lng"]}}})

# ---- Shahar xizmatlari (OpenStreetMap ma'lumotlari, tayyor HTML)
SVC_NAME = {"restaurant": "Restoranlar", "hospital": "Shifoxonalar", "bank": "Bank va bankomatlar"}
for c in D["cities"]:
    for kind, title in SVC_NAME.items():
        f = os.path.join(PUB, "data/services", f'{c["id"]}-{kind}.json')
        if not os.path.exists(f):
            continue
        j = json.load(open(f))
        li = "".join(f'<li><b>{E(x["name"])}</b>{" — " + E(x["address"]) if x.get("address") else ""}{" · " + E(x["phone"]) if x.get("phone") else ""}</li>' for x in j["items"][:80])
        body = (f'<div id="page"><section class="page-hero wrap"><h1 class="display h1">{title} — {E(c["name"]["uz"])}</h1>'
                f'<p>{E(c["name"]["uz"])}dagi {title.lower()}: manzil, telefon va ish vaqti. Manba: OpenStreetMap (ODbL).</p><ul>{li}</ul></section></div>')
        page(f'xizmatlar/{c["id"]}-{kind}.html', f'{title} — {c["name"]["uz"]} | Uzbek Tour Hub', f'{c["name"]["uz"]}dagi {title.lower()}: manzil, telefon, ish vaqti va xarita.',
             body, "mon", "svc", leaflet=True, data_id=f'{c["id"]}|{kind}', prio="0.5")

# ---- 404
page("404.html", "Sahifa topilmadi — Uzbek Tour Hub", "", '<section class="section wrap" style="text-align:center"><h1 class="display h1">404</h1><p class="lead" style="margin:16px auto 28px">Bunday sahifa topilmadi · Страница не найдена · Page not found</p><a class="btn btn-primary" href="/">Uzbek Tour Hub</a></section>', "", None)

# ---- Eski manzillar (obida.html?id=…, shahar.html?c=…) uchun yo'naltirish
page("obida/view.html", "Obida | Uzbek Tour Hub", "O'zbekistondagi tarixiy obida", '<div id="page"></div>', "mon", "mon", leaflet=True, prio=None)
for name, param, prefix in (("obida.html", "id", "/obida/"), ("shahar.html", "c", "/shahar/")):
    open(os.path.join(PUB, name), "w").write(
        f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Uzbek Tour Hub</title>'
        f'<script>var v=new URLSearchParams(location.search).get("{param}");location.replace(v?(/^n-/.test(v)?"/obida/view.html?id="+encodeURIComponent(v):"{prefix}"+encodeURIComponent(v)+".html"):"/obidalar.html");</script>'
        f'<a href="/obidalar.html">Uzbek Tour Hub</a>')

# ---- sitemap.xml va robots.txt
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += "".join(f"  <url><loc>{u}</loc><priority>{p}</priority></url>\n" for u, p in SITEMAP) + "</urlset>\n"
open(os.path.join(PUB, "sitemap.xml"), "w").write(sm)
open(os.path.join(PUB, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: {SITE}/sitemap.xml\n")
print(len(SITEMAP), "pages in sitemap; SITE =", SITE)
