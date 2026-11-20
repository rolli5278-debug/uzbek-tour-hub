// /api/ratings — obidalar reytingi (Netlify Blobs)
//   GET  → { ok, ratings: { [id]: { avg, count } } }
//   POST { id, stars (1–5) } → { ok, rating }
// Ovoz kaliti faqat IP va obida bo'yicha tuziladi (brauzerdagi ID'ga bog'liq emas): bitta IP — bitta obidaga bitta baho.
// Qayta baholansa, avvalgi baho yangilanadi. IP ochiq saqlanmaydi — tuzli SHA-256 xeshi ishlatiladi.
import crypto from "node:crypto";
import { json, rateLimited, sameOrigin, ipOf } from "../lib/shared.mjs";
import { MONUMENT_IDS } from "../lib/monument-ids.mjs";
import { store } from "../lib/store.mjs";
import { getContent } from "../lib/content.mjs";
// Admin paneldan qo'shilgan yangi obidalar (n-...) ham baholanadi
const extraIds = async () => new Set(((await getContent().catch(() => ({}))).newMons || []).filter((x) => !x.hidden).map((x) => x.id));

const IDS = MONUMENT_IDS; // build_data.py yaratadi
const SUMMARY = "summary";
const db = () => store("uth-ratings");
const pub = (r) => ({ avg: r.count ? Math.round((r.sum / r.count) * 100) / 100 : 0, count: r.count || 0 });


export default async (req) => {
  try {
    if (req.method === "GET") {
      const s = (await db().get(SUMMARY)) || {};
      const out = {}, extra = await extraIds();
      for (const [id, r] of Object.entries(s)) if ((IDS.has(id) || extra.has(id)) && r.count) out[id] = pub(r);
      return json({ ok: true, ratings: out }, 200, { "cache-control": "public, max-age=15" });
    }
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
    if (!sameOrigin(req, true)) return json({ ok: false, error: "Ruxsat etilmagan manba" }, 403);
    if (rateLimited(req, "rate", 40, 10 * 60_000)) return json({ ok: false, error: "Juda ko'p baho. Birozdan so'ng urinib ko'ring." }, 429);

    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: "Noto'g'ri so'rov" }, 400); }
    const id = String(b?.id || ""), stars = Number(b?.stars);
    if (!IDS.has(id) && !(id.startsWith("n-") && (await extraIds()).has(id))) return json({ ok: false, error: "Noma'lum obida" }, 400);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return json({ ok: false, error: "Baho 1 dan 5 gacha bo'lsin" }, 400);

    const salt = process.env.RATING_SALT || "uth-ratings-v2";
    const key = crypto.createHash("sha256").update(`${salt}|${ipOf(req)}|${id}`).digest("hex").slice(0, 32);
    const s = db();
    const votesKey = `votes/${id}`;
    const votes = (await s.get(votesKey)) || {};
    const prev = votes[key] || 0;
    votes[key] = stars;
    await s.setJSON(votesKey, votes);

    const summary = (await s.get(SUMMARY)) || {};
    const r = summary[id] || { sum: 0, count: 0 };
    if (prev) r.sum += stars - prev;
    else { r.sum += stars; r.count += 1; }
    summary[id] = r;
    await s.setJSON(SUMMARY, summary);
    return json({ ok: true, rating: pub(r), updated: !!prev });
  } catch (e) {
    console.error("ratings error", e);
    return json({ ok: false, error: "Serverda xatolik. Keyinroq urinib ko'ring." }, 500);
  }
};

export const config = { path: "/api/ratings" };
