// POST /api/chat — "Silk Road AI" sayohat agenti (Anthropic Claude API, vosita bilan ishlash)
// Muhit o'zgaruvchilari: ANTHROPIC_API_KEY (majburiy), ANTHROPIC_MODEL (ixtiyoriy)
// Agent "search_hotels" vositasi orqali Booking.com'dan mehmonxona va narxlarni o'zi qidira oladi.
import { json, rateLimited, sameOrigin } from "../lib/shared.mjs";
import { CITIES, cityKey, normalizeDates, searchUrl, searchHotels, liveEnabled } from "../lib/booking.mjs";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = () => process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
// Netlify oddiy funksiyalari ~10 soniyada to'xtatiladi; vaqt byudjeti shunga moslangan
const BUDGET_MS = () => Number(process.env.CHAT_TIMEOUT_MS) || 9000;
const MAX_MSG = 2000;
const MAX_HISTORY = 16;
const MAX_TOOL_ROUNDS = 3;

const systemPrompt = (lang = "uz") => `Sen "Uzbek Tour Hub" saytining "Silk Road AI" sayohat agentisan.
Bugungi sana: ${new Date().toISOString().slice(0, 10)}.

Vazifang: O'zbekistonga sayohat qiluvchilarga tejamkor, amaliy va aniq reja tuzib berish
(Samarqand, Buxoro, Xiva, Qo'qon, Farg'ona vodiysi, Toshkent, Chorvoq, Nurota, Termiz, Nukus).

Qoidalar:
- Foydalanuvchi qaysi tilda yozsa (o'zbek, rus yoki ingliz), o'sha tilda javob ber.
- Markdown ishlat: qisqa sarlavhalar (###), ro'yxatlar (*), muhim joylar **qalin**. Kursiv ishlatma.
- Kunma-kun marshrut, transport, turar joy, ovqatlanish va taxminiy byudjetni ber.
- Mehmonxona, turar joy yoki narx so'ralganda "search_hotels" vositasini chaqir.
  - Vosita jonli Booking.com narxlarini qaytarsa: 3–5 ta variantni nomi, kechasi narxi, reytingi bilan
    ko'rsat va narxlar "Booking.com, so'rov vaqtidagi" ekanini ayt. Har biriga havola qo'sh: [Booking.com](url).
  - Jonli narxlar mavjud bo'lmasa: o'zingdan aniq narx yoki mehmonxona nomi O'YLAB TOPMA.
    Foydalanuvchiga Booking.com qidiruv havolasini ber: [Booking.com'da real narxlar](searchUrl).
- Narx haqida: faqat search_hotels vositasi qaytargan Booking.com narxlarini ayt. Kirish chiptalari, transport, gid yoki
  sayohat turlari uchun hech qanday taxminiy narx aytma — rasmiy manba yoki operatordan aniqlashni maslahat ber.
- Sayohatga aloqasi yo'q savollarga qisqa javob berib, mavzuni sayohatga qaytar.
- Javoblar ixcham bo'lsin (odatda 250 so'zgacha), agar batafsil so'ralmasa.
- Saytdagi sarguzasht yo'nalishlari (tavsiya qilish mumkin): Amirsoy, Beldersoy (qish); Chimyon, Zomin, Pskem/Ugom-Chotqol (trekking;
  Pskem chegara zonasiga yaqin — ruxsatnoma kerak bo'lishi mumkin); Chorvoq, Bo'stonliq (paraplan, jet-ski), Chotqol rafting (yoz);
  Aydarko'l kigiz uy lagerlari, Orol/Ustyurt, Xorazm cho'l qal'alari (bahor/kuz); Nurota, Sentyob, Boysun, Sarmishsoy (etno/tabiat).
  Batafsil sahifa: /sarguzasht.html. Mavsum va masofalar taxminiy ekanini ayt.
- Interfeys tili: {LANG}. Foydalanuvchi boshqa tilda yozsa, o'sha tilda javob ber.`;

const TOOLS = [
  {
    name: "search_hotels",
    description:
      "O'zbekiston shahrida Booking.com mehmonxonalarini va real narxlarini qidiradi. " +
      "Jonli narxlar mavjud bo'lmasa, Booking.com qidiruv havolasini qaytaradi.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", enum: Object.keys(CITIES), description: "Shahar kaliti" },
        checkin: { type: "string", description: "Kirish sanasi YYYY-MM-DD (noma'lum bo'lsa qoldiring)" },
        checkout: { type: "string", description: "Chiqish sanasi YYYY-MM-DD" },
        adults: { type: "integer", minimum: 1, maximum: 16 },
        sort: { type: "string", enum: ["popularity", "price", "review"] },
        max_price_per_night: { type: "number", description: "Kechasi uchun maksimal narx (USD)" },
      },
      required: ["city"],
    },
  },
];

async function runTool(name, input) {
  if (name !== "search_hotels") return { error: "Noma'lum vosita" };
  const city = cityKey(input?.city);
  if (!city) return { error: "Noma'lum shahar", available: Object.keys(CITIES) };
  const { checkin, checkout, nights } = normalizeDates(input.checkin, input.checkout);
  const adults = Math.min(Math.max(parseInt(input.adults || 2, 10) || 2, 1), 16);
  const link = searchUrl({ city, checkin, checkout, adults });
  if (!liveEnabled())
    return { live: false, city: CITIES[city].en, checkin, checkout, nights, searchUrl: link,
      note: "Jonli narxlar sozlanmagan. Aniq narx aytma — foydalanuvchiga searchUrl havolasini ber." };
  try {
    const hotels = await searchHotels({ city, checkin, checkout, adults, sort: input.sort || "popularity",
      maxPrice: input.max_price_per_night, limit: 8 });
    return {
      live: true, source: "Booking.com", fetchedAt: new Date().toISOString(),
      city: CITIES[city].en, checkin, checkout, nights, searchUrl: link,
      hotels: hotels.map((h) => ({ name: h.name, stars: h.stars, reviewScore: h.reviewScore, reviews: h.reviews,
        perNight: h.perNight, total: h.total, currency: h.currency, freeCancellation: h.freeCancellation,
        breakfast: h.breakfast, url: h.url })),
    };
  } catch (e) {
    return { live: false, error: "Booking.com vaqtincha javob bermadi", searchUrl: link };
  }
}

async function callClaude(apiKey, messages, deadline, lang) {
  const ctrl = new AbortController();
  const left = deadline - Date.now();
  if (left < 1500) { const e = new Error("timeout"); e.timeout = true; throw e; }
  const timer = setTimeout(() => ctrl.abort(), left);
  try {
    const r = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL(), max_tokens: 1400, system: systemPrompt(lang).replace("{LANG}", { uz: "o'zbek", ru: "rus", en: "ingliz" }[lang] || "o'zbek"), tools: TOOLS, messages }),
      signal: ctrl.signal,
    }).catch((err) => { if (err.name === "AbortError") err.timeout = true; throw err; });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("Claude API error", r.status, detail.slice(0, 800));
      const e = new Error("claude"); e.status = r.status; throw e;
    }
    return await r.json();
  } finally { clearTimeout(timer); }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  // Boshqa saytlardan kelgan so'rovlarni rad etamiz (brauzer Origin / Sec-Fetch-Site sarlavhasi bo'yicha)
  if (!sameOrigin(req, true)) return json({ error: "Ruxsat etilmagan manba" }, 403);
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return json({ error: "Noto'g'ri so'rov" }, 415);
  if (rateLimited(req, "chat-burst", 6, 60_000) || rateLimited(req, "chat", 40, 60 * 60_000))
    return json({ error: "Juda ko'p so'rov. Bir daqiqadan so'ng qayta urinib ko'ring." }, 429);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "AI xizmati sozlanmagan (ANTHROPIC_API_KEY yo'q)." }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Noto'g'ri JSON" }, 400); }

  const lang = ["uz", "ru", "en"].includes(body?.lang) ? body.lang : "uz";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: "Xabar bo'sh" }, 400);
  if (message.length > MAX_MSG) return json({ error: `Xabar ${MAX_MSG} belgidan oshmasin.` }, 400);

  // Suhbat tarixi: user/assistant navbatma-navbat, birinchisi user bo'lishi shart
  const history = Array.isArray(body?.conversationHistory) ? body.conversationHistory : [];
  const messages = history
    .filter((m) => m && typeof m.content === "string" && m.content.trim() && (m.role === "user" || m.role === "assistant"))
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  messages.push({ role: "user", content: message });
  while (messages.length && messages[0].role !== "user") messages.shift();
  for (let i = messages.length - 1; i > 0; i--) {
    if (messages[i].role === messages[i - 1].role) {
      messages[i - 1].content += "\n\n" + messages[i].content;
      messages.splice(i, 1);
    }
  }

  const deadline = Date.now() + BUDGET_MS();
  let lastLink = null;
  try {
    let res = await callClaude(apiKey, messages, deadline, lang);
    for (let round = 0; round < MAX_TOOL_ROUNDS && res.stop_reason === "tool_use"; round++) {
      const uses = (res.content || []).filter((b) => b.type === "tool_use");
      const results = [];
      for (const u of uses) {
        const out = await runTool(u.name, u.input || {});
        if (out.searchUrl) lastLink = out.searchUrl;
        results.push({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(out) });
      }
      messages.push({ role: "assistant", content: res.content });
      messages.push({ role: "user", content: results });
      res = await callClaude(apiKey, messages, deadline, lang);
    }
    const reply = (res.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!reply) return json({ error: "AI bo'sh javob qaytardi." }, 502);
    return json({ reply });
  } catch (e) {
    if (e.timeout) {
      if (lastLink) return json({ reply: `### 🏨 Mehmonxonalar\n\nJavob tayyorlash uzoq cho'zildi. Real narxlarni shu yerdan ko'ring: [Booking.com'da qidirish](${lastLink})` });
      return json({ error: "AI javobi kechikdi. Savolni qisqaroq qilib qayta yuboring." }, 504);
    }
    if (e.status === 401 || e.status === 403) {
      console.error("Claude API kaliti rad etildi: ANTHROPIC_API_KEY noto'g'ri yoki o'chirilgan.");
      return json({ error: "AI xizmati sozlanmagan." }, 503);
    }
    if (e.status === 429) return json({ error: "AI so'rovlar limiti tugadi. Birozdan so'ng qayta urinib ko'ring." }, 429);
    if (e.status === 529) return json({ error: "AI xizmati hozir band. Birozdan so'ng qayta urinib ko'ring." }, 503);
    console.error("Chat function error", e);
    return json({ error: "AI xizmatiga ulanib bo'lmadi." }, 502);
  }
};

export const config = { path: "/api/chat" };
