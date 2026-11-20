// GET /api/config — brauzer uchun ochiq sozlamalar (maxfiy emas: hamkor ID Booking havolalarida baribir ko'rinadi)
import { json } from "../lib/shared.mjs";
import { liveEnabled } from "../lib/booking.mjs";

export default async () =>
  json({ aid: (process.env.BOOKING_AFFILIATE_ID || "").replace(/[^\w-]/g, "") || null, live: liveEnabled() }, 200, { "cache-control": "public, max-age=600" });

export const config = { path: "/api/config" };
