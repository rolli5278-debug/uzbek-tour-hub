// POST /api/booking — sayohat/gid bron so'rovlari: admin panelga saqlanadi (Netlify Blobs) va Telegram'ga xabar beriladi (sozlangan bo'lsa).
// Muhit o'zgaruvchilari (ixtiyoriy): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
import crypto from "node:crypto";
import { json, rateLimited, clean, sameOrigin } from "../lib/shared.mjs";
import { notifyTelegram, telegramConfigured } from "../lib/telegram.mjs";
import { store } from "../lib/store.mjs";
import { getContent } from "../lib/content.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(req, true)) return json({ ok: false, error: "Ruxsat etilmagan manba" }, 403);
  if (rateLimited(req, "booking", 6, 10 * 60_000)) return json({ ok: false, error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." }, 429);
  const settings = (await getContent().catch(() => ({}))).settings || {};
  if (settings.bookingsClosed) return json({ ok: false, error: "Bron qabul qilish vaqtincha to'xtatilgan." }, 503);

  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: "Noto'g'ri so'rov" }, 400); }
  if (b?.website) return json({ ok: true }); // honeypot
  const d = b?.data && typeof b.data === "object" ? b.data : {};
  const name = clean(d.clientName, 80), contact = clean(d.contact, 60);
  if (name.length < 2 || contact.length < 5) return json({ ok: false, error: "Ism va aloqa ma'lumotini kiriting." }, 400);
  const num = (v, max) => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
  const type = ["tour", "adventure", "guide"].includes(b?.type) ? b.type : "tour";
  const id = "BK-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const rec = {
    id, ts: new Date().toISOString(), type, status: "new", name, contact, tour: clean(d.tourName, 120),
    date: /^\d{4}-\d{2}-\d{2}$/.test(d.date || "") ? d.date : "", travelers: num(d.travelers, 50), comment: clean(d.comment, 600),
    lang: ["uz", "ru", "en"].includes(d.lang) ? d.lang : "", note: "", tg: false,
  };
  const TITLES = { tour: "🧳 Yangi sayohat so'rovi", adventure: "⛰ Sarguzasht turi so'rovi", guide: "🧭 Gid so'rovi" };
  if (telegramConfigured()) {
    rec.tg = await notifyTelegram(TITLES[type], [
      ["So'rov ID", id], ["Ism", name], ["Aloqa", contact], ["Sayohat", rec.tour], ["Sana", rec.date], ["Kishilar", rec.travelers], ["Izoh", rec.comment], ["Til", rec.lang],
    ]).catch((e) => { console.error(e); return false; });
  }
  try {
    await store("uth-bookings").setJSON(`b/${rec.ts}_${id}`, rec);
  } catch (e) {
    console.error("booking store", e);
    if (!rec.tg) return json({ ok: false, error: "So'rovni yuborib bo'lmadi. Keyinroq urinib ko'ring." }, 502);
  }
  return json({ ok: true, id });
};

export const config = { path: "/api/booking" };
