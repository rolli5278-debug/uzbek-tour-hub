# Uzbek Tour Hub — ishni davom ettirish uchun qo'llanma (handoff)

Bu fayl loyihani yangi sessiyada (masalan, Claude Code'da) davom ettirish uchun: nima qilingan, qanday qoidalar
kelishilgan va qayerda nima turadi.

## Holat (2026-11-18, v11)
- Statik ko'p sahifali sayt (`public/`) + Netlify Functions (`netlify/functions`). Build buyrug'i yo'q.
- Uch tilda (uz/ru/en). Interfeys matnlari: `public/assets/js/i18n.js`.
- 258 ta obida, 11 ta shahar/viloyat sahifasi, 15 ta sarguzasht yo'nalishi, 2 600+ restoran/shifoxona/bank (OpenStreetMap).
- Netlify'ga hali joylanmagan. Joylash qadamlari: `README.md` → "Joylash".

## Foydalanuvchi bilan kelishilgan qoidalar
1. **Narxlar:** saytda faqat Booking.com Demand API qaytargan haqiqiy narxlar. Sayohat, sarguzasht, kirish chiptasi uchun
   taxminiy narx yozilmaydi. AI agent ham taxminiy narx aytmaydi (`netlify/functions/chat.mjs` system prompt).
2. **UNESCO:** kartalarda, menyuda va bosh sahifada "UNESCO" yorlig'i yo'q. Faqat obida/shahar/yo'nalish sahifasida
   tasdiqlangan ro'yxat bloki (ro'yxat nomi, yil, raqam, havola). Ma'lumot: `content_extra.py` → `UNESCO`, `UNESCO_CITY`,
   `UNESCO_MON`, `UNESCO_ADV`. Manba: whc.unesco.org, ich.unesco.org. Tasdiqlanmagan narsani qo'shmang.
3. **Reyting:** "Baholanmagan" kabi yozuv bo'lmaydi. Har bir obidada `base` (boshlang'ich baho, `build_data.py` →
   `base_score`: jahon merosi maqomi, davr, `LANDMARK` ro'yxati). Ko'rsatiladigan reyting = (base×5 + ovozlar yig'indisi) / (5 + ovozlar soni).
   Ovozlar serverda (`/api/ratings`, Netlify Blobs), kalit = tuzli SHA-256(IP + obida). Ruxsat etilgan ID'lar:
   `netlify/lib/monument-ids.mjs` (build_data yaratadi).
4. **Rasmlar:** faqat Wikimedia Commons (CC BY / BY-SA / CC0 / PD), muallif va litsenziya sahifada ko'rsatiladi.
   Ko'rib chiqishda chiqarilganlar: `img_review.json`. Rasm topilmasa — bir xil uslubdagi zaxira belgi (gradient emas).
5. **Kalitlar** hech qachon kodga yozilmaydi — faqat Netlify muhit o'zgaruvchilari (`.env.example`).
6. Davlat muhofazasidagi meros obyektlari soni: **8 437** (Madaniy meros agentligi, VM qarori №239, 12.05.2026) —
   `public/assets/js/pages.js` → `OFFICIAL`. Yangi rasmiy raqam chiqsa, shu yerni yangilang.

## Ma'lumot oqimi
```
turizm_obyektlari.xlsx --import_valley.py--> valley.json (Farg'ona, Andijon, Namangan)
content_i18n.py, content_extra.py, adventures.py, coords.json, img_meta.json, img_review.json, valley.json
        --build_data.py--> public/assets/js/data.js + data.json + netlify/lib/monument-ids.mjs
osm_raw.json --process_osm.py--> public/data/services/<shahar>-<restaurant|hospital|bank>.json
data.json --build_pages.py (SITE_URL=...)--> obida/, shahar/, sarguzasht/, xizmatlar/ HTML, sitemap.xml, robots.txt
```
Rasm manbasi (`_img_src/`) arxivga kirmagan; `public/images/w/` dagi tayyor fayllar yetarli. Yangi rasm qo'shish
uchun Commons'dan yuklab `IMG_SRC` papkasiga qo'ying va `img_meta.json` ga yozuv qo'shing.

## Ochiq ishlar / cheklovlar
- Vodiy obidalari tavsifi faqat o'zbek tilida (ru/en sahifada shu haqda ogohlantirish chiqadi); nomlar ru uchun kirillga o'girilgan.
- Vodiy obidalarining ko'pida surat yo'q (zaxira belgi). 5 tasida koordinata yo'q (xarita o'rniga manzil).
- Fayldagi "sana" ustuni matndan avtomatik ajratilgan ("Sana (manbada)" deb ko'rsatiladi) — tekshirib chiqish foydali.
- Fayldagi boshqa viloyatlar (Jizzax, Navoiy, Qashqadaryo, Surxondaryo, Sirdaryo, Xorazm, uy-muzeylar) hali import qilinmagan:
  `import_valley.py` dagi `SHEETS` ga varaq qo'shish kifoya.
- Booking.com kaliti qo'shilmaguncha mehmonxona/ekskursiya bo'limida Booking.com qidiruv havolasi chiqadi.
