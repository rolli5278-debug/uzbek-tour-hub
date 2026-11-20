# Farg'ona vodiysi obidalarini (Farg'ona, Andijon, Namangan) yuklangan Excel ro'yxatidan import qiladi.
# Natija: content_valley.json (build_data.py shu faylni o'qiydi). Manba: turizm_obyektlari.xlsx.
import json, os, re, sys
import openpyxl

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "turizm_obyektlari.xlsx")
SHEETS = {"Farg'ona": "fargona", "Andijon": "andijon", "Namangan": "namangan"}
EXISTING = {"Modarixon maqbarasi": "modarixon", "Dahma va Shohon shohlarining maqbarasi": "dahmai-shohon"}
# Faylda xato kiritilgan qatorlar (boshqa viloyat koordinatasi/ta'rifi ko'chirilgan)
BAD_TEXT = {("Andijon", 59), ("Andijon", 60)}
NAME_FIX = {("Farg'ona", 25): "Chomochbiy yodgorligi", ("Farg'ona", 45): "Umoch ota ziyoratgohi",
            ("Andijon", 10): "Turaxon masjidi", ("Andijon", 19): "Qo'ychi Xalfa ziyoratgohi",
            ("Andijon", 20): "Tabib mulla Abdujabbor bulog'i", ("Andijon", 12): "Oqmozor ota ziyoratgohi",
            ("Andijon", 26): "Jome' me'moriy majmuasi (madrasa va minora)", ("Andijon", 79): "Otako'zi ota madrasasi"}

def dms(s):
    if s is None:
        return None
    s = str(s).replace(",", ".").replace("’", "'").replace("′", "'").replace("″", '"').replace("''", '"')
    m = re.findall(r"(\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)", s)
    if len(m) >= 2:
        return [round(float(a) + float(b) / 60 + float(c) / 3600, 6) for a, b, c in m[:2]]
    n = re.findall(r"\d+\.\d+", s)
    return [round(float(n[0]), 6), round(float(n[1]), 6)] if len(n) >= 2 else None

def in_valley(c):
    return c and 39.8 <= c[0] <= 41.7 and 70.3 <= c[1] <= 73.3

def clean_name(s):
    s = re.sub(r"^[\s.\"“”«»]+|[\s,.\"“”«»]+$", "", s.strip())
    s = s.replace("“", "").replace("”", "").replace('"', "").replace("ʼ", "'").replace("‘", "'").replace("’", "'")
    s = re.sub(r"\s+", " ", s)
    if s.isupper():
        s = s.capitalize()
    return s[0].upper() + s[1:]

def cat_of(name):
    n = name.lower()
    if "uy-muzey" in n or "muzey" in n: return "muzey"
    if "madras" in n: return "madrasa"
    if "majmua" in n: return "ansambl"
    if "masjid" in n: return "masjid"
    if "maqbara" in n or "daxma" in n or "dahma" in n or "mozori" in n: return "maqbara"
    return "ziyoratgoh"

ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12, "XIII": 13,
         "XIV": 14, "XV": 15, "XVI": 16, "XVII": 17, "XVIII": 18, "XIX": 19, "XX": 20, "XXI": 21}
VERB = r"(?:qurilgan|qurildi|qurdirilgan|qurdirgan|qurib bitkazilgan|krib bitkazilgan|bunyod|barpo|tiklangan|asos solin|oid|mansub|tegishli)"
R = r"(X{0,3}(?:IX|IV|V?I{0,3}))"
def year_of(text):
    """Qurilish fe'li bilan bevosita bog'langan davrni topadi (yil yoki asr). Topilmasa (None, None)."""
    t = text.replace("‒", "-").replace("–", "-")
    cands = []
    for m in re.finditer(R + r"\s*-\s*" + R + r"\s*-?\s*asr[a-z']*[^.]{0,80}?" + VERB, t):
        if m.group(1) in ROMAN and m.group(2) in ROMAN:
            cands.append((m.start(), f"{m.group(1)}–{m.group(2)} asrlar", (ROMAN[m.group(1)] - 1) * 100 + 50))
    for m in re.finditer(r"(?<![-–\w])" + R + r"\s*-?\s*asr[a-z']*[^.]{0,80}?" + VERB, t):
        if m.group(1) in ROMAN:
            cands.append((m.start(), f"{m.group(1)} asr", (ROMAN[m.group(1)] - 1) * 100 + 50))
    for m in re.finditer(r"\b(\d{1,2})\s*-\s*(\d{1,2})\s*-?\s*asr[a-z']*[^.]{0,80}?" + VERB, t):
        a, b = int(m.group(1)), int(m.group(2))
        if 1 <= a <= b <= 21:
            cands.append((m.start(), f"{a}–{b}-asrlar", (a - 1) * 100 + 50))
    for m in re.finditer(r"(?<![-–\d])(\d{1,2})\s*-?\s*asr[a-z']*[^.]{0,80}?" + VERB, t):
        if 1 <= int(m.group(1)) <= 21:
            cands.append((m.start(), f"{int(m.group(1))}-asr", (int(m.group(1)) - 1) * 100 + 50))
    for m in re.finditer(r"\b(1[0-9]{3})(?:\s*-\s*(1[0-9]{3}))?\s*-?\s*yil(?!lig)[a-z']*[^.]{0,40}?" + VERB, t):
        y1 = int(m.group(1)); lab = f"{m.group(1)}–{m.group(2)}-yillar" if m.group(2) else f"{y1}-yil"
        cands.append((m.start(), lab, y1))
    if not cands:
        return None, None
    cands.sort()
    return cands[0][1], cands[0][2]

LAT2CYR = [("o'", "ў"), ("g'", "ғ"), ("sh", "ш"), ("ch", "ч"), ("ng", "нг"), ("yo", "ё"), ("yu", "ю"), ("ya", "я"), ("ye", "е"),
           ("a", "а"), ("b", "б"), ("d", "д"), ("e", "е"), ("f", "ф"), ("g", "г"), ("h", "ҳ"), ("i", "и"), ("j", "ж"), ("k", "к"), ("l", "л"),
           ("m", "м"), ("n", "н"), ("o", "о"), ("p", "п"), ("q", "қ"), ("r", "р"), ("s", "с"), ("t", "т"), ("u", "у"), ("v", "в"), ("x", "х"),
           ("y", "й"), ("z", "з"), ("'", "ъ")]
RU_FIX = {"ў": "у", "ғ": "г", "қ": "к", "ҳ": "х"}  # rus imlosiga yaqinlashtirish
def to_ru(s):
    out, i, low = "", 0, s
    while i < len(low):
        ch = low[i]
        for a, b in LAT2CYR:
            if low[i:i + len(a)].lower() == a:
                b2 = "".join(RU_FIX.get(c, c) for c in b)
                out += b2.upper() if low[i].isupper() and b2 not in ("ъ",) else b2
                if low[i].isupper() and len(b2) > 1:
                    out = out[:-len(b2)] + b2[0].upper() + b2[1:]
                i += len(a)
                break
        else:
            out += ch
            i += 1
    return out.replace("ъ", "") if True else out

TYPES = [  # (o'zbekcha qo'shimcha, ru, en)
    ("uy-muzeyi", "дом-музей", "House Museum"), ("yodgorlik majmuasi", "мемориальный комплекс", "Memorial Complex"),
    ("me'moriy majmuasi", "архитектурный комплекс", "Architectural Complex"), ("majmuasi", "комплекс", "Complex"),
    ("ziyoratgohlari", "святыни", "Shrines"), ("ziyoratgohi", "святыня", "Shrine"), ("qadamjolari", "кадамджой", "Qadamjoy"),
    ("maqbarasi", "мавзолей", "Mausoleum"), ("madrasasi", "медресе", "Madrasah"), ("masjidi", "мечеть", "Mosque"),
    ("daxmasi", "дахма", "Tomb"), ("mozori", "мазар", "Mazar"), ("yodgorligi", "памятник", "Memorial"), ("bulog'i", "родник", "Spring"),
]
def names(uz):
    base, ru_t, en_t = uz, None, None
    for suf, r, e in TYPES:
        idx = uz.lower().find(suf)
        if idx > 0:
            base = (uz[:idx] + uz[idx + len(suf):]).strip(" -,")
            ru_t, en_t = r, e
            break
    base_ru = to_ru(base)
    if ru_t:
        ru = f"{ru_t.capitalize()} {base_ru}" if ru_t not in ("дом-музей",) else f"Дом-музей {base_ru}"
        en = f"{base} {en_t}"
    else:
        ru, en = base_ru, base
    return ru, en

REGION = {"fargona": ("Farg'ona viloyati", "Ферганская область", "Fergana Region"),
          "andijon": ("Andijon viloyati", "Андижанская область", "Andijan Region"),
          "namangan": ("Namangan viloyati", "Наманганская область", "Namangan Region")}
CAT_RU = {"ziyoratgoh": "Святыня", "maqbara": "Мавзолей", "masjid": "Мечеть", "madrasa": "Медресе", "muzey": "Музей", "ansambl": "Комплекс"}
CAT_EN = {"ziyoratgoh": "Shrine", "maqbara": "Mausoleum", "masjid": "Mosque", "madrasa": "Madrasah", "muzey": "Museum", "ansambl": "Complex"}
CAT_UZ = {"ziyoratgoh": "Ziyoratgoh", "maqbara": "Maqbara", "masjid": "Masjid", "madrasa": "Madrasa", "muzey": "Muzey", "ansambl": "Majmua"}

def slug(s):
    s = s.lower().replace("o'", "o").replace("g'", "g").replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:48]

wb = openpyxl.load_workbook(SRC, data_only=True)
out, used = [], set()
for sheet, region in SHEETS.items():
    for r in wb[sheet].iter_rows(min_row=3, values_only=True):
        if not r[1]:
            continue
        n = r[0]
        name = NAME_FIX.get((sheet, n)) or clean_name(str(r[1]))
        if name.lower() in ("masjid binosi",):
            name = f"Masjid binosi ({re.sub(r'[“”\"]', '', str(r[2]).split(',')[1] if ',' in str(r[2]) else str(r[2])).strip()})"
        if re.search(r"[А-Яа-яЁё]", name):
            continue
        if clean_name(str(r[1])) in EXISTING:
            continue
        addr = re.sub(r"\s+", " ", str(r[2] or "").replace("‘", "'").replace("’", "'")).strip(" ,.")
        text = "" if (sheet, n) in BAD_TEXT else re.sub(r"\[\d+\]", "", re.sub(r"\s+", " ", str(r[4] or ""))).strip()
        c = dms(r[3])
        c = c if in_valley(c) and (sheet, n) not in BAD_TEXT else None
        city = "qoqon" if re.search(r"Qo'?‘?o?qon", addr.replace("‘", "'")) or "Qo'qon" in addr else region
        cat = cat_of(name)
        yl, yn = year_of(text)
        if (sheet, n) == ("Andijon", 26):
            yl, yn = "XIX asr oxiri", 1890
        ru, en = names(name)
        sid = slug(name)
        k = sid
        i = 2
        while k in used:
            k = f"{sid}-{i}"; i += 1
        used.add(k)
        district = addr.split(",")[0]
        first = re.split(r"(?<=[.!?])\s", text)[0] if text else ""
        out.append(dict(
            id="v-" + k, city=city, cat=cat, region=region, src=f"{sheet} #{n}",
            lat=c[0] if c else None, lng=c[1] if c else None, address=addr,
            name=dict(uz=name, ru=ru, en=en),
            short=dict(uz=(first[:180] + ("…" if len(first) > 180 else "")) if first else f"{CAT_UZ[cat]}, {district}.",
                       ru=f"{CAT_RU[cat]} — {REGION[region][1]}, {to_ru(district)}.",
                       en=f"{CAT_EN[cat]} in {REGION[region][2]}, {district}."),
            text=dict(uz=text or f"{name} — {addr}.", ru=None, en=None),
            year=dict(uz=yl, ru=None, en=None) if yl else None, y=yn,
        ))
json.dump(out, open(os.path.join(BASE, "content_valley.json"), "w"), ensure_ascii=False, indent=0)
from collections import Counter
print(len(out), Counter(x["city"] for x in out), Counter(x["cat"] for x in out), "no coords:", sum(1 for x in out if not x["lat"]), "with year:", sum(1 for x in out if x["y"]))


# ---- build_data.py kutgan formatga (valley.json) o'tkazish; avvalgi ID'lar saqlanadi (berilgan ovozlar yo'qolmasin)
def year_tr(lab):
    if not lab:
        return {"uz": "—", "ru": "—", "en": "—"}
    m = re.match(r"^(\d{3,4})(?:–(\d{3,4}))?-yil", lab)
    if m:
        v = m.group(1) + ("–" + m.group(2) if m.group(2) else "")
        return {"uz": v, "ru": v, "en": v}
    m = re.match(r"^([IVX]+)(?:–([IVX]+))? asr(?:lar)?( oxiri)?$", lab)
    if m:
        a, b, end = m.group(1), m.group(2), m.group(3)
        ru = f"{a}–{b} вв." if b else f"{a} в." + (" (конец)" if end else "")
        def ordn(r):
            n = ROMAN[r]; return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
        en = f"{ordn(a)}–{ordn(b)} c." if b else ("late " if end else "") + f"{ordn(a)} c."
        return {"uz": lab, "ru": ru, "en": en}
    m = re.match(r"^(\d{1,2})(?:–(\d{1,2}))?-asr", lab)
    if m:
        a, b = m.group(1), m.group(2)
        return {"uz": lab, "ru": f"{a}–{b} вв." if b else f"{a} в.", "en": f"{a}–{b}th c." if b else f"{a}th c."}
    return {"uz": lab, "ru": lab, "en": lab}

legacy_path = os.path.join(BASE, "valley.json")
old = json.load(open(legacy_path)) if os.path.exists(legacy_path) else []
legacy = []
for i, x in enumerate(out):
    oid = old[i]["id"] if i < len(old) and old[i]["city"] == x["city"] else x["id"][2:]
    legacy.append(dict(
        id=oid, city=x["city"], region=x["region"], cat=x["cat"], unesco=[],
        name=x["name"], short=x["short"], text={"uz": x["text"]["uz"]}, uzOnly=True,
        year=year_tr(x["year"]["uz"] if x["year"] else None), century=(x["y"] // 100 + 1) if x["y"] else None,
        builder={"uz": "—", "ru": "—", "en": "—"}, address=x["address"], lat=x["lat"], lng=x["lng"], pid=None, imgs=[],
        src="turizm_obyektlari.xlsx · " + x["src"],
    ))
json.dump(legacy, open(legacy_path, "w"), ensure_ascii=False, indent=0)
os.remove(os.path.join(BASE, "content_valley.json"))
print("valley.json:", len(legacy))
