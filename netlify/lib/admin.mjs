// Admin autentifikatsiyasi: parol faqat Netlify muhit o'zgaruvchisida (ADMIN_PASSWORD), sessiya — HMAC imzolangan HttpOnly cookie.
import crypto from "node:crypto";

const COOKIE = "uth_admin";
const TTL = 12 * 3600; // 12 soat

export const adminConfigured = () => (process.env.ADMIN_PASSWORD || "").length >= 8;
const secret = () => crypto.createHash("sha256").update("uth-admin|" + (process.env.ADMIN_SECRET || "") + "|" + (process.env.ADMIN_PASSWORD || "")).digest();
const sign = (s) => crypto.createHmac("sha256", secret()).update(s).digest("base64url");
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

export function checkPassword(user, pass) {
  if (!adminConfigured()) return false;
  const u = process.env.ADMIN_USER || "admin";
  // Uzunlik bo'yicha vaqt farqi chiqmasligi uchun xeshlarni solishtiramiz
  const h = (v) => crypto.createHash("sha256").update(String(v || "")).digest("hex");
  return eq(h(user), h(u)) & eq(h(pass), h(process.env.ADMIN_PASSWORD)) ? true : false;
}

export function sessionCookie(user) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function sessionUser(req) {
  if (!adminConfigured()) return null;
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig || !eq(sig, sign(payload))) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, "base64url").toString());
    return p.exp > Date.now() / 1000 ? p.u : null;
  } catch { return null; }
}
