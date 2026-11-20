# OpenStreetMap (Overpass) xom ma'lumotidan shahar xizmatlari JSON fayllarini yaratadi:
#   public/data/services/<shahar>-<restaurant|hospital|bank>.json
# Manba: © OpenStreetMap ishtirokchilari, ODbL litsenziyasi.
import json, math, os, re

RAW = json.load(open(os.path.join(os.path.dirname(__file__), "osm_raw.json")))
OUT = os.path.join(os.path.dirname(__file__), "public/data/services")
os.makedirs(OUT, exist_ok=True)
CENTER = {"samarqand": (39.6542, 66.975), "buxoro": (39.7747, 64.4286), "xiva": (41.3783, 60.3639), "shahrisabz": (39.0578, 66.8342),
          "toshkent": (41.3111, 69.2797), "qoqon": (40.5357, 70.9465), "termiz": (37.2242, 67.2783), "qoraqalpogiston": (42.4531, 59.6103), "fargona": (40.3842, 71.7843), "andijon": (40.7821, 72.3442), "namangan": (41.0011, 71.6683)}
CUISINE = {"uzbek": "o'zbek", "regional": "milliy", "russian": "rus", "italian": "italyan", "pizza": "pitsa", "burger": "burger", "turkish": "turk",
           "korean": "koreys", "japanese": "yapon", "sushi": "sushi", "chinese": "xitoy", "georgian": "gruzin", "indian": "hind", "coffee_shop": "qahvaxona",
           "kebab": "kabob", "shashlik": "shashlik", "international": "xalqaro", "european": "yevropa", "chicken": "tovuq", "local": "milliy"}

def dist(a, b):
    r = math.pi / 180
    x = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))

def clean_url(u):
    u = (u or "").strip()
    if not u:
        return None
    if not re.match(r"^https?://", u):
        u = "https://" + u
    return u if re.match(r"^https?://[^\s\"'<>]+$", u) else None

meta = RAW.get("_meta", {})
total = 0
for key, els in RAW.items():
    if key.startswith("_"):
        continue
    city, kind = key.split("/")
    c = CENTER[city]
    seen, items = set(), []
    for e in els:
        tg = e.get("tags", {})
        lat = e.get("lat") or (e.get("center") or {}).get("lat")
        lng = e.get("lon") or (e.get("center") or {}).get("lon")
        name = (tg.get("name") or "").strip()
        if not (lat and lng and name):
            continue
        k = (name.lower(), round(lat, 4), round(lng, 4))
        if k in seen:
            continue
        seen.add(k)
        addr = " ".join(x for x in [tg.get("addr:street"), tg.get("addr:housenumber")] if x)
        if not addr and tg.get("addr:full"):
            addr = tg["addr:full"]
        # oshxona turi OSM kalitlari sifatida saqlanadi (masalan "uzbek;coffee_shop") — sayt tilida tarjima qilinadi
        cuisine = ";".join(x.strip().lower() for x in tg.get("cuisine", "").split(";") if x.strip())
        sub = cuisine if kind == "restaurant" else (tg.get("operator") or tg.get("brand") or "") if kind == "bank" else ""
        items.append({
            "name": name, "kind": tg.get("amenity"),
            "sub": sub[:80] or None, "address": addr or None,
            "phone": (tg.get("phone") or tg.get("contact:phone") or "").split(";")[0].strip() or None,
            "website": clean_url(tg.get("website") or tg.get("contact:website")),
            "hours": tg.get("opening_hours"),
            "lat": round(lat, 6), "lng": round(lng, 6),
            "osm": f'https://www.openstreetmap.org/{e["type"]}/{e["id"]}',
            "_d": dist(c, (lat, lng)),
        })
    # to'liqroq yozuvlar (manzil/telefon bor) va markazga yaqinlari oldinda
    items.sort(key=lambda x: (x["_d"] - (0.6 if x["address"] else 0) - (0.4 if x["phone"] else 0)))
    for x in items:
        del x["_d"]
    json.dump({"city": city, "kind": kind, "source": "OpenStreetMap", "license": "ODbL", "fetched": meta.get("fetched"), "items": items},
              open(os.path.join(OUT, f"{city}-{kind}.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    total += len(items)
    print(city, kind, len(items))
print("total", total)
