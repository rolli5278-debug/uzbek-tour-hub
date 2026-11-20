// /api/admin/* — admin panel API (faqat tizimga kirgan administrator uchun)
//   POST login {user, pass} · POST logout · GET me · GET stats
//   GET bookings · PATCH bookings/:id {status, note} · DELETE bookings/:id
//   GET content · PUT content/:kind/:id · DELETE content/:kind/:id   (kind: mons | cities | adv | tours)
//   POST newmon · PUT newmon/:id · DELETE newmon/:id · PUT settings
//   POST media (rasm fayli, ≤ 4 MB) · GET ratings · DELETE ratings/:id · GET backup
import crypto from "node:crypto";
import { json, rateLimited, sameOrigin, clean } from "../lib/shared.mjs";
import { adminConfigured, checkPassword, sessionCookie, clearCookie, sessionUser } from "../lib/admin.mjs";
import { getContent, saveContent, cleanPatch, cleanNewMon, cleanSettings } from "../lib/content.mjs";
import { store } from "../lib/store.mjs";
import { telegramConfigured } from "../lib/telegram.mjs";
import { liveEnabled } from "../lib/booking.mjs";

const STATUSES = ["new", "confirmed", "done", "cancelled"];
const KINDS = ["mons", "cities", "adv", "tours"];
const bookings = () => store("uth-bookings");

async function allBookings() {
  const s = bookings();
  const keys = (await s.list("b/")).sort().reverse().slice(0, 1000);
  const out = [];
  for (let i = 0; i < keys.length; i += 25) {
    const part = await Promise.all(keys.slice(i, i + 25).map(async (k) => ({ key: k, ...(await s.get(k)) })));
    out.push(...part.filter((x) => x.id));
  }
  return out;
}
async function bookingKey(id) {
  if (!/^BK-[A-F0-9]{6}$/.test(id)) return null;
  return (await bookings().list("b/")).find((k) => k.endsWith("_" + id)) || null;
}

export default async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/admin\/?/, "").split("/").filter(Boolean);
  const [route, a, b] = parts;
  const m = req.method;
  const body = async () => { try { return await req.json(); } catch { return {}; } };

  if (m !== "GET" && !sameOrigin(req, true)) return json({ ok: false, error: "Ruxsat etilmagan manba" }, 403);

  if (route === "login" && m === "POST") {
    if (!adminConfigured()) return json({ ok: false, error: "Admin panel sozlanmagan: Netlify'da ADMIN_PASSWORD (kamida 8 belgi) o'rnating." }, 503);
    if (rateLimited(req, "admin-login", 5, 15 * 60_000)) return json({ ok: false, error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." }, 429);
    const d = await body();
    if (!checkPassword(clean(d.user, 60), typeof d.pass === "string" ? d.pass.slice(0, 200) : "")) {
      await new Promise((r) => setTimeout(r, 600));
      return json({ ok: false, error: "Login yoki parol noto'g'ri." }, 401);
    }
    return json({ ok: true, user: clean(d.user, 60) }, 200, { "set-cookie": sessionCookie(clean(d.user, 60)) });
  }
  if (route === "logout") return json({ ok: true }, 200, { "set-cookie": clearCookie() });

  const user = sessionUser(req);
  if (route === "me") return json({ ok: true, user, configured: adminConfigured() });
  if (!user) return json({ ok: false, error: "Avval tizimga kiring." }, 401);
  if (rateLimited(req, "admin", 600, 10 * 60_000)) return json({ ok: false, error: "Juda ko'p so'rov." }, 429);

  try {
    if (route === "stats" && m === "GET") {
      const [bk, c, r] = await Promise.all([allBookings(), getContent(true), store("uth-ratings").get("summary")]);
      const by = Object.fromEntries(STATUSES.map((s) => [s, bk.filter((x) => x.status === s).length]));
      const votes = Object.values(r || {}).reduce((n, x) => n + (x.count || 0), 0);
      const week = bk.filter((x) => Date.now() - Date.parse(x.ts) < 7 * 864e5).length;
      return json({ ok: true, bookings: { total: bk.length, week, ...by }, latest: bk.slice(0, 5), votes, rated: Object.keys(r || {}).length,
        edits: KINDS.reduce((n, k) => n + Object.keys(c[k] || {}).length, 0), newMons: c.newMons.length, updatedAt: c.updatedAt || null,
        integrations: { telegram: telegramConfigured(), booking: liveEnabled(), ai: !!process.env.ANTHROPIC_API_KEY } });
    }

    if (route === "bookings") {
      if (m === "GET" && !a) return json({ ok: true, items: await allBookings() });
      const key = await bookingKey(a);
      if (!key) return json({ ok: false, error: "Bron topilmadi" }, 404);
      if (m === "PATCH") {
        const d = await body(), rec = await bookings().get(key);
        if (d.status !== undefined) { if (!STATUSES.includes(d.status)) return json({ ok: false, error: "Noto'g'ri holat" }, 400); rec.status = d.status; }
        if (d.note !== undefined) rec.note = clean(d.note, 1000);
        rec.updatedAt = new Date().toISOString(); rec.updatedBy = user;
        await bookings().setJSON(key, rec);
        return json({ ok: true, item: rec });
      }
      if (m === "DELETE") { await bookings().delete(key); return json({ ok: true }); }
    }

    if (route === "content") {
      const c = await getContent(true);
      if (m === "GET") return json({ ok: true, content: c });
      if (!KINDS.includes(a) || !/^[\w-]{2,80}$/.test(b || "")) return json({ ok: false, error: "Noto'g'ri manzil" }, 400);
      if (m === "PUT") { c[a][b] = cleanPatch(a, await body()); if (!Object.keys(c[a][b]).length) delete c[a][b]; await saveContent(c); return json({ ok: true, item: c[a][b] || null }); }
      if (m === "DELETE") { delete c[a][b]; await saveContent(c); return json({ ok: true }); }
    }

    if (route === "newmon") {
      const c = await getContent(true);
      if (m === "POST" || m === "PUT") {
        const d = await body();
        const item = cleanNewMon(m === "PUT" ? { ...d, id: a } : d);
        if (!item) return json({ ok: false, error: "Obida nomini (o'zbekcha) kiriting." }, 400);
        const i = c.newMons.findIndex((x) => x.id === item.id);
        if (m === "POST" && i > -1) item.id += "-" + crypto.randomBytes(2).toString("hex");
        if (m === "PUT" && i > -1) c.newMons[i] = item; else c.newMons.push(item);
        if (c.newMons.length > 500) return json({ ok: false, error: "Juda ko'p yangi obida" }, 400);
        await saveContent(c);
        return json({ ok: true, item });
      }
      if (m === "DELETE") { c.newMons = c.newMons.filter((x) => x.id !== a); await saveContent(c); return json({ ok: true }); }
    }

    if (route === "settings" && m === "PUT") {
      const c = await getContent(true); c.settings = cleanSettings(await body()); await saveContent(c);
      return json({ ok: true, settings: c.settings });
    }

    if (route === "media" && m === "POST") {
      const type = (req.headers.get("content-type") || "").split(";")[0];
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
      if (!ext) return json({ ok: false, error: "Faqat JPG, PNG yoki WebP rasm" }, 400);
      const buf = Buffer.from(await req.arrayBuffer());
      if (buf.length < 100 || buf.length > 4 * 1024 * 1024) return json({ ok: false, error: "Rasm hajmi 4 MB dan oshmasin" }, 400);
      const sig = buf.subarray(0, 12).toString("hex");
      const okSig = ext === "jpg" ? sig.startsWith("ffd8ff") : ext === "png" ? sig.startsWith("89504e47") : sig.startsWith("52494646") && sig.slice(16, 24) === "57454250";
      if (!okSig) return json({ ok: false, error: "Fayl rasm emas" }, 400);
      const key = Date.now().toString(36) + "-" + crypto.randomBytes(4).toString("hex") + "." + ext;
      await store("uth-media").setBinary(key, buf, { type, by: user });
      return json({ ok: true, url: "/api/media/" + key });
    }

    if (route === "ratings") {
      const s = store("uth-ratings");
      if (m === "GET") return json({ ok: true, summary: (await s.get("summary")) || {} });
      if (m === "DELETE" && /^[\w-]{2,80}$/.test(a || "")) {
        const sum = (await s.get("summary")) || {}; delete sum[a];
        await s.setJSON("summary", sum); await s.delete(`votes/${a}`);
        return json({ ok: true });
      }
    }

    if (route === "backup" && m === "GET") {
      const [c, bk] = await Promise.all([getContent(true), allBookings()]);
      return json({ ok: true, exportedAt: new Date().toISOString(), content: c, bookings: bk }, 200, { "content-disposition": `attachment; filename="uth-backup-${new Date().toISOString().slice(0, 10)}.json"` });
    }
  } catch (e) {
    console.error("admin", e);
    return json({ ok: false, error: "Server xatosi" }, 500);
  }
  return json({ ok: false, error: "Topilmadi" }, 404);
};

export const config = { path: "/api/admin/*" };
