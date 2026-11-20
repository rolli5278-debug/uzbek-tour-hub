// Telegram'ga xabar yuborish (TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID sozlangan bo'lsa)
import { escapeHtml } from "./shared.mjs";

export const telegramConfigured = () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

export async function notifyTelegram(title, rows) {
  if (!telegramConfigured()) return false;
  const text =
    `<b>${escapeHtml(title)}</b>\n\n` +
    rows.filter(([, v]) => v !== "" && v != null)
      .map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`).join("\n") +
    `\n\n🕒 ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!r.ok) console.error("Telegram error", r.status, (await r.text().catch(() => "")).slice(0, 300));
  return r.ok;
}
