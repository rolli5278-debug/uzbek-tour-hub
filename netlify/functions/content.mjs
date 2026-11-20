// GET /api/content — admin paneldan kiritilgan o'zgarishlar (sayt brauzerda ularni ma'lumotlarga qo'llaydi)
import { json } from "../lib/shared.mjs";
import { getContent } from "../lib/content.mjs";

export default async () => {
  try {
    const c = await getContent();
    return json({ ok: true, content: { mons: c.mons, cities: c.cities, adv: c.adv, tours: c.tours, newMons: c.newMons, settings: c.settings, v: c.updatedAt || null } }, 200,
      { "cache-control": "public, max-age=30, stale-while-revalidate=120" });
  } catch (e) {
    console.error("content", e);
    return json({ ok: true, content: {} }, 200, { "cache-control": "public, max-age=10" });
  }
};
export const config = { path: "/api/content" };
