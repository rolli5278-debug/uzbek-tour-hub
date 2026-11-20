// GET /api/cars?lat=..&lng=..&pickup=YYYY-MM-DDTHH:mm:ss&dropoff=...&age=30&lang=uz — avtomobil ijarasi (Booking.com Cars)
import { json, rateLimited } from "../lib/shared.mjs";
import { liveEnabled, searchCars } from "../lib/booking.mjs";

const LANGS = { uz: "en-gb", ru: "ru", en: "en-gb" };
const DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (rateLimited(req, "cars", 20, 60_000)) return json({ ok: false, error: "Juda ko'p so'rov." }, 429);
  const q = new URL(req.url).searchParams;
  const lat = parseFloat(q.get("lat")), lng = parseFloat(q.get("lng"));
  const pickup = q.get("pickup"), dropoff = q.get("dropoff");
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !DT.test(pickup || "") || !DT.test(dropoff || "") || pickup >= dropoff)
    return json({ ok: false, error: "Noto'g'ri parametr" }, 400);
  const age = Math.min(Math.max(parseInt(q.get("age") || "30", 10) || 30, 18), 99);
  if (!liveEnabled()) return json({ ok: true, live: false, items: [] }, 200, { "cache-control": "public, max-age=300" });
  try {
    const items = await searchCars({ lat, lng, pickup, dropoff, age, lang: LANGS[q.get("lang")] || "en-gb" });
    return json({ ok: true, live: true, fetchedAt: new Date().toISOString(), items }, 200, { "cache-control": "public, max-age=300" });
  } catch (e) {
    console.error("cars error", e);
    return json({ ok: true, live: false, items: [] });
  }
};

export const config = { path: "/api/cars" };
