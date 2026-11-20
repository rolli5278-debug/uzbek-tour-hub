// Booking.com Demand API mijoz (rasmiy hamkorlik API'si).
// Hujjatlar: https://developers.booking.com/demand/docs/open-api/3.2/demand-api (OpenAPI 3.2 spetsifikatsiyasiga moslangan)
// Muhit o'zgaruvchilari:
//   BOOKING_API_TOKEN      — Demand API Bearer tokeni (hamkorlik kabinetidan)
//   BOOKING_AFFILIATE_ID   — Affiliate ID (raqam). Faqat shu bo'lsa ham, havolalarga "aid" qo'shiladi.
//   BOOKING_API_BASE       — ixtiyoriy; test uchun: https://demandapi-sandbox.booking.com/3.2
//   BOOKING_CURRENCY       — ixtiyoriy; standart USD

const BASE = () => (process.env.BOOKING_API_BASE || "https://demandapi.booking.com/3.2").replace(/\/$/, "");
export const affiliateId = () => (process.env.BOOKING_AFFILIATE_ID || "").replace(/\D/g, "");
export const liveEnabled = () => !!(process.env.BOOKING_API_TOKEN && affiliateId());
const CURRENCY = () => (process.env.BOOKING_CURRENCY || "USD").toUpperCase();

// Saytda ishlatiladigan shaharlar (Booking.com qidiruv nomi bilan)
export const CITIES = {
  tashkent: { en: "Tashkent", uz: "Toshkent", ru: "Ташкент", lat: 41.3111, lng: 69.2797 },
  samarkand: { en: "Samarkand", uz: "Samarqand", ru: "Самарканд", lat: 39.6542, lng: 66.9597 },
  bukhara: { en: "Bukhara", uz: "Buxoro", ru: "Бухара", lat: 39.7747, lng: 64.4286 },
  khiva: { en: "Khiva", uz: "Xiva", ru: "Хива", lat: 41.3783, lng: 60.3639 },
  kokand: { en: "Kokand", uz: "Qo'qon", ru: "Коканд", lat: 40.5286, lng: 70.9425 },
  fergana: { en: "Fergana", uz: "Farg'ona", ru: "Фергана", lat: 40.3864, lng: 71.7864 },
  nukus: { en: "Nukus", uz: "Nukus", ru: "Нукус", lat: 42.4531, lng: 59.6103 },
  termez: { en: "Termez", uz: "Termiz", ru: "Термез", lat: 37.2242, lng: 67.2783 },
  shahrisabz: { en: "Shahrisabz", uz: "Shahrisabz", ru: "Шахрисабз", lat: 39.0578, lng: 66.8342 },
  andijan: { en: "Andijan", uz: "Andijon", ru: "Андижан", lat: 40.7821, lng: 72.3442 },
  namangan: { en: "Namangan", uz: "Namangan", ru: "Наманган", lat: 41.0011, lng: 71.6683 },
};
export const cityKey = (v) => {
  const s = String(v || "").toLowerCase().replace(/[^a-zа-я']/g, "");
  for (const [k, c] of Object.entries(CITIES)) {
    if ([k, c.en, c.uz, c.ru].some((n) => n.toLowerCase().replace(/[^a-zа-я']/g, "") === s)) return k;
  }
  if (s.startsWith("samar")) return "samarkand";
  if (s.startsWith("bux") || s.startsWith("bukh")) return "bukhara";
  if (s.startsWith("tosh") || s.startsWith("tash")) return "tashkent";
  if (s.startsWith("xiv") || s.startsWith("khiv")) return "khiva";
  if (s.startsWith("qo") || s.startsWith("kok")) return "kokand";
  if (s.startsWith("far") || s.startsWith("fer")) return "fergana";
  if (s.startsWith("andi")) return "andijan";
  if (s.startsWith("naman")) return "namangan";
  return null;
};

const isoDate = (d) => d.toISOString().slice(0, 10);
export function normalizeDates(checkin, checkout) {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  let ci = /^\d{4}-\d{2}-\d{2}$/.test(checkin || "") ? new Date(checkin + "T00:00:00Z") : null;
  if (!ci || isNaN(ci) || ci < today) { ci = new Date(today); ci.setUTCDate(ci.getUTCDate() + 14); }
  let co = /^\d{4}-\d{2}-\d{2}$/.test(checkout || "") ? new Date(checkout + "T00:00:00Z") : null;
  if (!co || isNaN(co) || co <= ci) { co = new Date(ci); co.setUTCDate(co.getUTCDate() + 2); }
  const nights = Math.round((co - ci) / 864e5);
  if (nights > 30) { co = new Date(ci); co.setUTCDate(co.getUTCDate() + 30); }
  return { checkin: isoDate(ci), checkout: isoDate(co), nights: Math.min(nights, 30) };
}

// Booking.com qidiruv sahifasiga havola (API kalitisiz ham ishlaydi; narxlar Booking.com'da real vaqtda)
export function searchUrl({ city, checkin, checkout, adults = 2, rooms = 1, lang = "en-gb", query }) {
  const c = CITIES[city];
  const p = new URLSearchParams({
    ss: query || (c ? `${c.en}, Uzbekistan` : "Uzbekistan"),
    checkin, checkout,
    group_adults: String(adults), no_rooms: String(rooms), group_children: "0",
    lang,
    selected_currency: CURRENCY(),
  });
  if (affiliateId()) p.set("aid", affiliateId());
  return `https://www.booking.com/searchresults.html?${p}`;
}
const withAid = (u) => {
  if (!u || !affiliateId()) return u;
  try { const x = new URL(u); if (!x.searchParams.get("aid")) x.searchParams.set("aid", affiliateId()); return x.toString(); } catch { return u; }
};

async function call(path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const r = await fetch(`${BASE()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BOOKING_API_TOKEN}`,
        "X-Affiliate-Id": affiliateId(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("Booking.com API", path, r.status, text.slice(0, 500));
      throw new Error(`Booking.com API xatosi (${r.status})`);
    }
    return JSON.parse(text);
  } finally { clearTimeout(timer); }
}

const rows10 = (n) => Math.min(100, Math.max(10, Math.ceil(n / 10) * 10));
// 3.2: narxlar { accommodation_currency, booker_currency } ko'rinishida
const amount = (o) => (o == null ? NaN : typeof o === "number" ? o : Number(o.booker_currency ?? o.accommodation_currency));

const pick = (v, lang) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] || v["en-gb"] || v["en-us"] || Object.values(v)[0] || "";
};

// Shahar ID'lari (bir marta olinadi va xotirada saqlanadi)
let cityIds = null;
async function cityId(key) {
  if (!cityIds) {
    cityIds = {};
    try {
      let page;
      for (let n = 0; n < 5; n++) {
        const j = await call("/common/locations/cities", page ? { page } : { country: "uz", languages: ["en-gb"], rows: 100 });
        for (const c of j.data || []) {
          const name = pick(c.name, "en-gb").toLowerCase();
          for (const [k, v] of Object.entries(CITIES)) if (name === v.en.toLowerCase()) cityIds[k] ??= c.id;
        }
        page = j.metadata?.next_page;
        if (!page || Object.keys(cityIds).length === Object.keys(CITIES).length) break;
      }
    } catch (e) { console.error("city lookup failed", e.message); }
  }
  return cityIds[key] || null;
}

const cache = new Map();
const TTL = 10 * 60_000;

// Jonli qidiruv: narxlar + mehmonxona nomi, reytingi, rasmi
export async function searchHotels({ city, checkin, checkout, adults = 2, rooms = 1, sort = "popularity", maxPrice, limit = 12, lang = "en-gb", lat, lng, radius = 5 }) {
  const key = JSON.stringify([city, checkin, checkout, adults, rooms, sort, maxPrice, limit, lang, lat, lng]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v;

  const c = CITIES[city];
  const body = {
    checkin, checkout,
    booker: { country: "uz", platform: "desktop" },
    guests: { number_of_adults: adults, number_of_rooms: rooms },
    currency: CURRENCY(),
    extras: ["products"],
    rows: rows10(limit),
  };
  // Obida koordinatasi berilsa — shu nuqta atrofida (km) qidiramiz, aks holda shahar bo'yicha
  if (Number.isFinite(lat) && Number.isFinite(lng)) body.coordinates = { latitude: lat, longitude: lng, radius };
  else {
    const id = await cityId(city);
    if (id) body.city = id;
    else body.coordinates = { latitude: c.lat, longitude: c.lng, radius: 15 };
  }
  if (sort === "price") body.sort = { by: "price", direction: "ascending" };
  else if (sort === "review") body.sort = { by: "review_score", direction: "descending" };
  if (maxPrice) body.filters = { price: { maximum: Number(maxPrice) } }; // 3.2: kechalik narx, currency talab qilinadi

  const s = await call("/accommodations/search", body);
  const offers = (s.data || []).filter((x) => x?.price).slice(0, limit);
  if (!offers.length) { const v = []; cache.set(key, { t: Date.now(), v }); return v; }

  const d = await call("/accommodations/details", {
    accommodations: offers.map((o) => o.id),
    extras: ["photos"],
    languages: [...new Set([lang, "en-gb"])],
    rows: rows10(offers.length),
  });
  const det = new Map((d.data || []).map((x) => [x.id, x]));
  const nights = Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / 864e5));

  const v = offers.filter((o) => Number.isFinite(amount(o.price.total ?? o.price.display ?? o.price.base))).map((o) => {
    const x = det.get(o.id) || {};
    const photos = x.photos || [];
    const main = photos.find((p) => p.main_photo) || photos[0];
    const total = amount(o.price.total ?? o.price.display ?? o.price.base);
    const product = (o.products || [])[0] || {};
    const plan = product?.policies?.meal_plan?.plan;
    return {
      id: o.id,
      name: pick(x.name, lang) || `#${o.id}`,
      stars: x.rating?.stars ?? null,
      reviewScore: x.rating?.review_score ?? null,
      reviews: x.rating?.number_of_reviews ?? null,
      address: pick(x.location?.address, lang),
      lat: x.location?.coordinates?.latitude ?? null, lng: x.location?.coordinates?.longitude ?? null,
      photo: main?.url?.standard || main?.url?.large || main?.url?.thumbnail_large || null,
      currency: (typeof o.currency === "string" ? o.currency : o.currency?.booker) || CURRENCY(),
      total: Math.round(total * 100) / 100,
      perNight: Math.round((total / nights) * 100) / 100,
      freeCancellation: product?.policies?.cancellation?.type === "free_cancellation",
      breakfast: ["breakfast_included", "half_board", "full_board", "all_inclusive"].includes(plan),
      deal: product?.deal?.discount_percentage || null,
      url: withAid(o.url || x.url?.web || (typeof x.url === "string" ? x.url : "")),
    };
  });
  cache.set(key, { t: Date.now(), v });
  if (cache.size > 300) cache.clear();
  return v;
}

// Ekskursiyalar va gid xizmatlari (Demand API 3.2: /attractions/search + /attractions/details)
export async function searchAttractions({ city, lang = "en-gb", limit = 10, lat, lng }) {
  const c = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : CITIES[city];
  const key = JSON.stringify(["attr", city, lang, limit, lat, lng]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const today = new Date(); const end = new Date(today); end.setUTCDate(end.getUTCDate() + 14);
  const s = await call("/attractions/search", {
    coordinates: { latitude: c.lat, longitude: c.lng, radius: 20 },
    dates: { start_date: isoDate(today), end_date: isoDate(end) },
    currency: CURRENCY(), rows: rows10(limit), sort: { by: "most_popular" },
  });
  const found = (s.data || []).slice(0, limit);
  if (!found.length) { cache.set(key, { t: Date.now(), v: [] }); return []; }
  const d = await call("/attractions/details", { attractions: found.map((a) => a.id), languages: [...new Set([lang, "en-gb"])], rows: rows10(found.length) });
  const det = new Map((d.data || []).map((x) => [x.id, x]));
  const v = found.map((a) => {
    const x = det.get(a.id) || {};
    const loc = (x.locations || [])[0]?.coordinates;
    return {
      id: a.id, name: pick(x.name, lang) || a.id,
      price: Number(a.price?.total) || null, currency: a.price?.currency || CURRENCY(),
      rating: x.ratings?.score ?? null, reviews: x.ratings?.number_of_reviews ?? null,
      photo: x.photos?.[0]?.url || null, freeCancel: !!a.free_cancellation,
      lat: loc?.latitude ?? null, lng: loc?.longitude ?? null,
      url: withAid(a.urls?.web?.detail || x.urls?.web?.detail || ""),
    };
  });
  cache.set(key, { t: Date.now(), v });
  return v;
}


// Avtomobil ijarasi (Demand API 3.2: /cars/search). Olish va qaytarish — berilgan koordinata yaqinida.
export async function searchCars({ lat, lng, pickup, dropoff, age = 30, lang = "en-gb", limit = 10 }) {
  const key = JSON.stringify(["cars", lat, lng, pickup, dropoff, age, lang]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const loc = { coordinates: { latitude: lat, longitude: lng } };
  const s = await call("/cars/search", {
    booker: { country: "uz" }, currency: CURRENCY(), driver: { age }, language: lang, maximum_results: limit,
    route: { pickup: { datetime: pickup, location: loc }, dropoff: { datetime: dropoff, location: loc } },
  });
  const v = (s.data || []).slice(0, limit).map((o) => ({
    id: o.offer, categories: o.categories || [], price: Number(o.price?.total) || null, currency: o.price?.currency || CURRENCY(),
    freeCancel: o.policies?.cancellation?.type === "free_cancellation", mileage: o.policies?.mileage?.type || null,
    url: withAid(o.url?.web || ""),
  })).filter((x) => x.price);
  cache.set(key, { t: Date.now(), v });
  return v;
}
