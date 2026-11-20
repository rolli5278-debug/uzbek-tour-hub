// GET /api/hotels?city=samarkand&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&adults=2&rooms=1&sort=popularity|price|review&lang=uz
// Booking.com Demand API sozlangan bo'lsa — jonli narxlar; aks holda Booking.com qidiruv havolasi.
import { json, rateLimited } from "../lib/shared.mjs";
import { CITIES, cityKey, normalizeDates, searchUrl, searchHotels, liveEnabled } from "../lib/booking.mjs";

const LANGS = { uz: "en-gb", ru: "ru", en: "en-gb" };

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (rateLimited(req, "hotels", 40, 60_000)) return json({ ok: false, error: "Juda ko'p so'rov." }, 429);

  const q = new URL(req.url).searchParams;
  const city = cityKey(q.get("city") || "samarkand");
  if (!city) return json({ ok: false, error: "Noma'lum shahar", cities: Object.keys(CITIES) }, 400);
  const { checkin, checkout, nights } = normalizeDates(q.get("checkin"), q.get("checkout"));
  const adults = Math.min(Math.max(parseInt(q.get("adults") || "2", 10) || 2, 1), 16);
  const rooms = Math.min(Math.max(parseInt(q.get("rooms") || "1", 10) || 1, 1), 8);
  const sort = ["price", "review", "popularity"].includes(q.get("sort")) ? q.get("sort") : "popularity";
  const lang = LANGS[q.get("lang")] || "en-gb";
  const lat = parseFloat(q.get("lat")), lng = parseFloat(q.get("lng"));
  const near = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

  const base = {
    ok: true, city, cityName: CITIES[city], checkin, checkout, nights, adults, rooms,
    searchUrl: searchUrl({ city, checkin, checkout, adults, rooms, lang }),
    source: "Booking.com",
  };

  if (!liveEnabled()) return json({ ...base, live: false, hotels: [] }, 200, { "cache-control": "public, max-age=300" });

  try {
    const hotels = await searchHotels({ city, checkin, checkout, adults, rooms, sort, limit: 12, lang, ...(near ? { lat, lng, radius: 5 } : {}) });
    return json({ ...base, live: true, fetchedAt: new Date().toISOString(), hotels }, 200, { "cache-control": "public, max-age=300" });
  } catch (e) {
    console.error("hotels error", e);
    return json({ ...base, live: false, hotels: [], error: "Booking.com'dan jonli narxlarni olib bo'lmadi." }, 200);
  }
};

export const config = { path: "/api/hotels" };
