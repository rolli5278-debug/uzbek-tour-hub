# Uzbek Tour Hub — loyiha konteksti (Claude Code uchun)

Bu fayl claude.ai'dagi suhbatdan Claude Code'ga o'tish uchun yozilgan. Loyiha egasi bilan o'zbek tilida gaplashing.

## Loyiha nima
O'zbekistonning tarixiy obidalari bo'yicha uch tilli (uz/ru/en) ko'p sahifali statik sayt + Netlify Functions.
Build talab qilinmaydi: `public/` to'g'ridan-to'g'ri joylanadi. Netlify sozlamalari `netlify.toml` da.

## Tuzilma
- `public/` — sayt. `assets/js/data.js` (avtomatik), `i18n.js` (interfeys matnlari), `common.js` (header, til, reyting,
  chat, bron), `pages.js` (sahifalar), `assets/css/site.css`. `obida/`, `shahar/`, `sarguzasht/`, `xizmatlar/` — tayyor HTML.
- `netlify/functions/` — `ratings` (Blobs, ovoz kaliti = tuzli SHA-256(IP+obida)), `chat` (Claude, Origin tekshiruvi),
  `hotels`, `attractions`, `cars`, `config` (Booking.com Demand API 3.2; obida koordinatasi bo'yicha), `booking` (Telegram).
  Frontend: `U.bookingPanel(el, {name, lat, lng, city})` (common.js oxiri) — 5 tab: stays/flights/cars/attractions/taxi.
  "Demo" yoki "jonli narx yo'q" kabi ogohlantirishlar KO'RSATILMAYDI (foydalanuvchi talabi). Booking.com iframe'ga ruxsat bermaydi.
- Ma'lumot manbalari (Python skriptlar):
  - `build_data.py` → `data.js`, `data.json`, `netlify/lib/monument-ids.mjs`. Obidalar: `build_data.py` (uz) +
    `content_i18n.py` (ru/en) + `content_extra.py` (qo'shimcha obidalar, UNESCO ma'lumotlari) + `valley.json`.
  - `import_valley.py turizm_obyektlari.xlsx` → `valley.json` (Farg'ona, Andijon, Namangan — 207 obida, tavsif faqat uz).
  - `process_osm.py` → `public/data/services/*.json` (restoran/shifoxona/bank, OpenStreetMap, `osm_raw.json` dan).
  - `build_pages.py` → barcha HTML, `sitemap.xml`, `robots.txt`. Domen: `SITE_URL=https://... python3 build_pages.py`.
  - Rasmlar: `public/images/w/` (Wikimedia Commons, muallif/litsenziya `img_meta.json` da, saralash `img_review.json`).
- Tartib: `python3 import_valley.py turizm_obyektlari.xlsx && python3 build_data.py && python3 build_pages.py`.

## Egasining qat'iy talablari (buzmang)
- Saytda TAXMINIY NARX bo'lmasin. Faqat Booking.com API qaytargan haqiqiy narxlar (mehmonxona, ekskursiya).
- UNESCO: faqat tasdiqlangan ro'yxatlar (whc.unesco.org / ich.unesco.org). Kartalar va bosh sahifada "UNESCO"
  belgisi yo'q; batafsil UNESCO bloki faqat shahar/obida/yo'nalish sahifasida, aloqasi bo'lsa.
- "Baholanmagan" kabi yozuvlar yo'q: har bir obidaning boshlang'ich bahosi (`base`, build_data.py → `base_score`)
  bor, sayyohlar ovozi bilan aralashtiriladi (common.js: W=5). Baholash funksiyasini o'chirmang.
- Bosh sahifadagi rasmiy son: davlat muhofazasidagi 8 437 ta moddiy madaniy meros obyekti
  (Madaniy meros agentligi ma'lumoti, UzA 2026-06-01). Yangilansa — `pages.js` dagi `OFFICIAL`.
- Kalitlarni (Anthropic, Booking, Telegram) hech qachon kodga yozmang — faqat Netlify muhit o'zgaruvchilari.
- Noaniq faktlarni aniq deb yozmang; manbasi yo'q ma'lumotni qo'shmang.

## Ochiq ishlar
- Netlify'ga joylash (egasi Netlify ulagichini ulashi kerak) va `SITE_URL` bilan sahifalarni qayta yaratish.
- Vodiy obidalari (207 ta) uchun rasm yo'q (zaxira belgi), ru/en tavsif yo'q (faqat nom tarjimasi).
- 4 obidada rasm yo'q: xoja-ahror, hamza-muzey, dasturxonchi, miyon-hazrat.
- Fayldagi xatolar: Andijon #59, #60 qatorlarida Buxoro koordinatasi va ta'rifi bor edi — chiqarib tashlangan.

## Lokal sinov
`node dev/dev.mjs .   (port 8003, Booking/Anthropic/Telegram so'rovlari mock qilinadi)` (agar mavjud bo'lsa) yoki `npx netlify dev`. Funksiyalar uchun `.env` (`.env.example`).

## Admin panel (v13)
- UI: `public/admin/index.html` + `public/assets/js/admin.js` + `public/assets/css/admin.css`
- API: `netlify/functions/admin.mjs` (`/api/admin/*`), auth: `netlify/lib/admin.mjs`, kontent: `netlify/lib/content.mjs`
- Ochiq: `/api/content` (o'zgarishlar), `/api/media/*` (yuklangan rasmlar); bronlar `uth-bookings` store'da (`b/<ts>_<id>`)
- Sahifalar `UTH.boot(active, fn)` orqali ishga tushadi: avval /api/content qo'llanadi (1.5 s timeout, 60 s sessionStorage kesh)
- Naqsh dizayni: `public/assets/img/naqsh/*.svg`, CSS `site.css` oxirida ("O'zbek milliy naqshlari")
- Rasm qoidasi (foydalanuvchi talabi): FAQAT obidaning o'z surati. Ko'cha/daryo/umumiy manzara suratlari QO'YILMAYDI.
  O'z surati yo'q obida → joylashuv xaritasi `map-<id>.webp` (`kind: map`, Natural Earth admin-1, public domain; generator: /home/claude/mapgen/gen.py).
  Admin paneldan haqiqiy surat yuklansa, u xarita o'rniga birinchi bo'lib chiqadi.
