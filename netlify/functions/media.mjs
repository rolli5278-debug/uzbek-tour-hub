// GET /api/media/:key — admin yuklagan rasmlar (Netlify Blobs)
import { store } from "../lib/store.mjs";

export default async (req) => {
  const key = new URL(req.url).pathname.split("/").pop();
  if (!/^[\w.-]{6,80}$/.test(key)) return new Response("Not found", { status: 404 });
  const r = await store("uth-media").getBinary(key).catch(() => null);
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(r.data, { headers: { "content-type": r.meta.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
};
export const config = { path: "/api/media/*" };
