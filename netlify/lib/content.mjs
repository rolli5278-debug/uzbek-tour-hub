// Admin paneldan kiritilgan o'zgarishlar (obida/shahar/sarguzasht/sayohat matnlari, yashirish, yangi obidalar, sozlamalar)
import { store } from "./store.mjs";
import { clean } from "./shared.mjs";

const db = () => store("uth-content");
let cache = null;
export async function getContent(fresh = false) {
  if (!fresh && cache && Date.now() - cache.t < 15_000) return cache.v;
  const v = (await db().get("content")) || {};
  v.mons ||= {}; v.cities ||= {}; v.adv ||= {}; v.tours ||= {}; v.newMons ||= []; v.settings ||= {};
  cache = { t: Date.now(), v };
  return v;
}
export async function saveContent(v) { v.updatedAt = new Date().toISOString(); await db().setJSON("content", v); cache = { t: Date.now(), v }; }

const LANGS = ["uz", "ru", "en"];
export const tri = (o, max) => {
  if (!o || typeof o !== "object") return undefined;
  const r = {}; for (const l of LANGS) { const s = clean(o[l], max); if (s) r[l] = s; }
  return Object.keys(r).length ? r : undefined;
};
const longText = (v, max) => typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";
export const triLong = (o, max) => {
  if (!o || typeof o !== "object") return undefined;
  const r = {}; for (const l of LANGS) { const s = longText(o[l], max); if (s) r[l] = s; }
  return Object.keys(r).length ? r : undefined;
};
export const imgUrl = (u) => typeof u === "string" && (/^\/api\/media\/[\w.-]+$/.test(u) || /^\/images\/[\w./-]+\.(webp|jpe?g|png)$/.test(u) || /^https:\/\/upload\.wikimedia\.org\/[^\s"'<>]+$/.test(u)) ? u : "";
const drop = (o) => { for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === "" ) delete o[k]; return o; };

// Mavjud obida/shahar/sarguzasht/sayohat uchun o'zgartirishlar
export function cleanPatch(kind, b) {
  const p = { hidden: b.hidden === true ? true : undefined };
  if (kind === "mons") Object.assign(p, {
    name: tri(b.name, 140), short: tri(b.short, 400), text: triLong(b.text, 6000), year: tri(b.year, 60), builder: tri(b.builder, 140),
    base: Number.isFinite(+b.base) && +b.base >= 1 && +b.base <= 5 && b.base !== "" && b.base !== null ? Math.round(+b.base * 10) / 10 : undefined,
    cover: imgUrl(b.cover) || undefined, featured: b.featured === true ? true : undefined,
  });
  if (kind === "cities") Object.assign(p, { name: tri(b.name, 80), intro: triLong(b.intro, 3000), cover: imgUrl(b.cover) || undefined, hidden: undefined });
  if (kind === "adv") Object.assign(p, { title: tri(b.title, 140), desc: triLong(b.desc, 3000), cover: imgUrl(b.cover) || undefined });
  if (kind === "tours") Object.assign(p, { title: tri(b.title, 140), desc: triLong(b.desc, 2000), duration: tri(b.duration, 60) });
  return drop(p);
}

const CITY_IDS = ["samarqand", "buxoro", "xiva", "shahrisabz", "toshkent", "qoqon", "termiz", "qoraqalpogiston", "fargona", "andijon", "namangan"];
const CATS = ["ansambl", "maqbara", "masjid", "madrasa", "minora", "saroy", "arxeologik", "muzey", "ziyoratgoh", "bino"];
export function cleanNewMon(b) {
  const name = tri(b.name, 140);
  if (!name?.uz) return null;
  const lat = +b.lat, lng = +b.lng;
  return drop({
    id: "n-" + (String(b.id || "").match(/^n-[a-z0-9-]{2,60}$/) ? String(b.id).slice(2) : name.uz.toLowerCase().replace(/[ʻ'‘’`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "obida"),
    city: CITY_IDS.includes(b.city) ? b.city : "samarqand", cat: CATS.includes(b.cat) ? b.cat : "bino",
    name, short: tri(b.short, 400), text: triLong(b.text, 6000), year: tri(b.year, 60), builder: tri(b.builder, 140),
    lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : undefined, lng: Number.isFinite(lng) && Math.abs(lng) <= 180 ? lng : undefined,
    base: Number.isFinite(+b.base) && +b.base >= 1 && +b.base <= 5 ? Math.round(+b.base * 10) / 10 : 4.0,
    cover: imgUrl(b.cover) || undefined, hidden: b.hidden === true ? true : undefined,
  });
}

export function cleanSettings(b) {
  return drop({
    announce: tri(b.announce, 300), announceOn: b.announceOn === true ? true : undefined, announceUrl: /^(\/[\w\-./?=&#%]*|https:\/\/[^\s"'<>]+)$/.test(b.announceUrl || "") ? b.announceUrl : undefined,
    phone: clean(b.phone, 40), email: /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(b.email || "") ? b.email : undefined, telegram: clean(b.telegram, 60).replace(/[^\w@]/g, ""),
    address: tri(b.address, 200), bookingsClosed: b.bookingsClosed === true ? true : undefined, chatOff: b.chatOff === true ? true : undefined,
  });
}
