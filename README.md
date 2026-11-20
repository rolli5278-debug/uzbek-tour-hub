# Uzbek Tour Hub — O'zbekistonning tarixiy obidalari (v10)

Ko'p sahifali statik sayt (HTML/CSS/JS, build talab qilinmaydi) + Netlify Functions. Uch tilda: o'zbek, rus, ingliz
(til tanlovi `localStorage` da saqlanadi, `?lang=ru` bilan ham ochiladi).

## Sahifalar
| Yo'l | Mazmuni |
|---|---|
| `/` | Bosh sahifa: avtomatik almashinuvchi galereya, tanlangan obidalar, top reyting, shaharlar, "hozir qayerga" |
| `/obidalar.html` | Barcha obidalar: shahar/tur/nom bo'yicha filtr |
| `/shahar/<id>.html` | Shahar: obidalar, Booking.com paneli (mehmonxona, reys, avto ijara, diqqatga sazovor joylar, transfer), gidli turlar, restoran, shifoxona, bank & ATM, xarita |
| `/obida/<id>.html` | Obida: 3–4 suratli galereya (muallif va litsenziya bilan), tarix, chipta, yaqin obidalar, baholash |
| `/reyting.html` | Reyting jadvali (telefonda kartalar ko'rinishida) |
| `/sayohatlar.html` | Tarixiy sayohatlar (bron so'rovi → Telegram) |
| `/sarguzasht.html` | 15 yo'nalish: filtrlar, umumiy xarita, mavsum, AI savollari |
| `/xizmatlar/<shahar>-<restaurant|hospital|bank>.html` | Restoran, shifoxona, bank & ATM: manzil, telefon, ish vaqti, xarita (OpenStreetMap) |
| `/sarguzasht/<id>.html` | Yo'nalish: galereya, kunma-kun dastur, 7 kunlik ob-havo (Open-Meteo), xarita, bron |

Har bir obida/shahar/yo'nalish sahifasi `build_pages.py` orqali tayyor HTML qilib chiqariladi (sarlavha, tavsif,
`og:image`, JSON-LD). `sitemap.xml` va `robots.txt` ham shu skript bilan yaratiladi.

## Narxlar va UNESCO qoidasi
- Saytda faqat Booking.com Demand API qaytargan haqiqiy narxlar ko'rsatiladi (mehmonxonalar, ekskursiyalar).
  Sayohat, sarguzasht turlari va kirish chiptalari uchun narx yo'q — narxni operator so'rovdan keyin aytadi.
- UNESCO belgisi faqat tasdiqlangan ro'yxatlar uchun: Butunjahon merosi ro'yxati, Xavf ostidagi meros, Dastlabki
  (Tentative) ro'yxat, Nomoddiy meros reprezentativ ro'yxati. Manbalar: whc.unesco.org, ich.unesco.org
  (`content_extra.py` → `UNESCO`). Aloqasi bo'lmagan obidada UNESCO yozuvi chiqmaydi.

## Ma'lumotlarni yangilash
```
python3 process_osm.py                                  # osm_raw.json → public/data/services/*.json
python3 build_data.py                                   # public/assets/js/data.js
SITE_URL=https://sizning-domen.netlify.app python3 build_pages.py   # HTML, sitemap.xml, robots.txt
```
- Obidalar matni: `build_data.py` (o'zbekcha) + `content_i18n.py` (rus, ingliz).
- Sarguzasht yo'nalishlari: `adventures.py` (masofa, balandlik, mavsum — taxminiy).
- Interfeys matnlari: `public/assets/js/i18n.js`.
- Rasmlar: `public/images/w/` (Wikimedia Commons, 1600 px va 640 px WebP). Har birining muallifi va litsenziyasi
  `data.js` da saqlanadi va sahifada ko'rsatiladi (CC BY / BY-SA talabi).

## Backend (Netlify Functions)
| Yo'l | Vazifa |
|---|---|
| `GET/POST /api/ratings` | Reyting (Netlify Blobs). Ovoz kaliti = tuzli SHA-256(IP + obida) |
| `POST /api/chat` | Silk Road AI — Claude. Faqat shu saytdan (Origin tekshiruvi) + rate-limit |
| `GET /api/hotels` | Booking.com Demand API 3.2 mehmonxona narxlari (kalit bo'lmasa — qidiruv havolasi) |
| `GET /api/attractions` | Booking.com Attractions: ekskursiya va gid xizmatlari narxlari (`lat`/`lng` — obida atrofida) |
| `GET /api/cars` | Booking.com Cars: avtomobil ijarasi narxlari (`lat`, `lng`, `pickup`, `dropoff`, `age`) |
| `GET /api/config` | Brauzer uchun ochiq sozlama: hamkor ID (aid) va jonli rejim holati |
| `POST /api/booking` | Sayohat va gid so'rovi → Telegram |

Muhit o'zgaruvchilari: `.env.example`.

## Joylash (Netlify)
1. Arxivni oching va papkani GitHub'ga yuklang (yoki Netlify CLI: `npm i -g netlify-cli && netlify deploy --prod`).
2. Netlify → Add new project → Import from Git. Build sozlamalari `netlify.toml` da: publish = `public`,
   build command bo'sh, funksiyalar `netlify/functions`. Drag-and-drop funksiyalarni joylamaydi.
3. Project configuration → Environment variables: `ANTHROPIC_API_KEY`, `BOOKING_AFFILIATE_ID`, `BOOKING_API_TOKEN`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (`.env.example` ga qarang). Kalitlarni kodga yozmang.
4. Domen ma'lum bo'lgach: `SITE_URL=https://domen python3 build_pages.py` (sitemap, canonical, og:image) va qayta joylang.

## Booking.com paneli
Har bir obida va shahar sahifasida Booking.com uslubidagi 5 bo'limli panel bor: Mehmonxonalar · Aviachiptalar · Avtomobil ijarasi · Diqqatga sazovor joylar · Transfer.
- `BOOKING_API_TOKEN` + `BOOKING_AFFILIATE_ID` o'rnatilsa: mehmonxona (obidadan 5 km radiusda), ekskursiya va avto ijara narxlari Demand API'dan jonli ko'rsatiladi.
- Har doim: tanlangan sana/mehmonlar bilan Booking.com'ning o'z sahifasi yangi oynada ochiladi (aid bilan).
- Aviachipta va transfer uchun Demand API'da endpoint yo'q — faqat Booking.com sahifasiga havola.
- Booking.com sahifalari `X-Frame-Options: SAMEORIGIN` yuboradi, shuning uchun iframe ichida ochib bo'lmaydi.

## Admin panel
Manzil: **`/admin/`** (qisqa havola: `/boshqaruv`). Qidiruv tizimlaridan yopilgan (`noindex`, robots.txt).

Sozlash (Netlify → Site configuration → Environment variables, "Contains secret values" belgilansin):
- `ADMIN_PASSWORD` — kamida 8 belgi (majburiy; bo'lmasa kirish o'chiq)
- `ADMIN_USER` — login (standart: `admin`)
- `ADMIN_SECRET` — ixtiyoriy qo'shimcha imzo kaliti

Imkoniyatlar:
- **Bronlar** — saytdagi barcha bron so'rovlari (Netlify Blobs'da saqlanadi): holat (yangi / tasdiqlangan / bajarilgan / bekor), ichki izoh, qidiruv, CSV eksport, har daqiqada yangi bron tekshiruvi. Telegram ixtiyoriy — ulangan bo'lsa xabar ham keladi.
- **Obidalar** — nom, tavsif, matn, davr, bunyodkor (uz/ru/en), asosiy reyting, yashirish, "tavsiya etilgan", rasm yuklash.
- **Yangi obidalar** — saytga yangi obida qo'shish (`/obida/view.html?id=n-...`), ro'yxat, qidiruv, xarita va reytingda ko'rinadi.
- **Shaharlar, Sarguzasht, Tarixiy sayohatlar** — matn, rasm, yashirish.
- **Reyting** — ovozlar statistikasi, firibgar ovozlarni tozalash.
- **Sozlamalar** — e'lon banneri, aloqa ma'lumotlari (footer), bronni vaqtincha to'xtatish, AI chatni yashirish, JSON zaxira nusxa.

Texnik: sessiya — HMAC imzolangan HttpOnly + Secure + SameSite=Strict cookie (12 soat), login urinishlari cheklangan (5 ta / 15 daqiqa),
barcha o'zgartiruvchi so'rovlar Origin tekshiruvidan o'tadi. O'zgarishlar `/api/content` orqali saytga ~1 daqiqada qo'llanadi
(statik HTML qayta qurilmaydi; SEO matni keyingi `build_pages.py` gacha eski bo'lishi mumkin).
