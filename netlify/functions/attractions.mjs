// GET /api/attractions?city=samarkand&lang=uz — shahardagi ekskursiyalar va gid xizmatlari (Booking.com Attractions).
import { json, rateLimited } from "../lib/shared.mjs";
import { CITIES, cityKey, liveEnabled, searchAttractions } from "../lib/booking.mjs";

const LANGS = { uz: "en-gb", ru: "ru", en: "en-gb" };

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (rateLimited(req, "attractions", 30, 60_000)) return json({ ok: false, error: "Juda ko'p so'rov." }, 429);
  const q = new URL(req.url).searchParams;
  const city = cityKey(q.get("city"));
  if (!city) return json({ ok: false, error: "Noma'lum shahar" }, 400);
  const base = { ok: true, city, cityName: CITIES[city].en, source: "Booking.com" };
  if (!liveEnabled()) return json({ ...base, live: false, items: [] }, 200, { "cache-control": "public, max-age=300" });
  try {
    const lat = parseFloat(q.get("lat")), lng = parseFloat(q.get("lng"));
    const near = Number.isFinite(lat) && Number.isFinite(lng);
    const items = await searchAttractions({ city, lang: LANGS[q.get("lang")] || "en-gb", ...(near ? { lat, lng } : {}) });
    return json({ ...base, live: true, fetchedAt: new Date().toISOString(), items }, 200, { "cache-control": "public, max-age=600" });
  } catch (e) {
    console.error("attractions error", e);
    return json({ ...base, live: false, items: [], error: "Booking.com'dan ma'lumot olib bo'lmadi." });
  }
};

export const config = { path: "/api/attractions" };
