// Umumiy yordamchi funksiyalar (Netlify Functions uchun)
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

// Oddiy, instansiya darajasidagi rate-limit (to'liq himoya emas, lekin spamni kamaytiradi)
const buckets = new Map();
export function rateLimited(req, key, limit, windowMs) {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id) || { n: 0, t: now };
  if (now - b.t > windowMs) { b.n = 0; b.t = now; }
  b.n += 1;
  buckets.set(id, b);
  if (buckets.size > 5000) buckets.clear();
  return b.n > limit;
}

export const clean = (v, max = 200) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const ipOf = (req) =>
  req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0";

// Faqat shu saytdan kelgan brauzer so'rovlariga ruxsat (strict=true bo'lsa Origin majburiy).
// Eslatma: bu boshqa saytlardagi skriptlarni to'xtatadi, lekin brauzer bo'lmagan mijozlar sarlavhani soxtalashtirishi mumkin —
// shuning uchun rate-limit bilan birga ishlatiladi.
export function sameOrigin(req, strict = false) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host;
  const o = req.headers.get("origin");
  if (o) { try { return new URL(o).host === host; } catch { return false; } }
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  return !strict;
}
