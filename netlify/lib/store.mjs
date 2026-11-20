// Ma'lumotlar ombori: Netlify Blobs (ishlab chiqarishda) yoki lokal fayl (faqat UTB_DEV_STORE bilan, test uchun)
import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";

function fileStore(name) {
  const dir = path.join(process.env.UTB_DEV_STORE, name);
  fs.mkdirSync(dir, { recursive: true });
  const f = (k) => path.join(dir, encodeURIComponent(k) + ".json");
  const fb = (k) => path.join(dir, encodeURIComponent(k) + ".bin");
  return {
    async get(k) { try { return JSON.parse(fs.readFileSync(f(k), "utf8")); } catch { return null; } },
    async setJSON(k, v) { fs.writeFileSync(f(k), JSON.stringify(v)); },
    async delete(k) { for (const p of [f(k), fb(k), fb(k) + ".meta"]) { try { fs.unlinkSync(p); } catch {} } },
    async list(prefix = "") {
      return fs.readdirSync(dir).filter((x) => x.endsWith(".json")).map((x) => decodeURIComponent(x.slice(0, -5))).filter((k) => k.startsWith(prefix));
    },
    async setBinary(k, buf, meta) { fs.writeFileSync(fb(k), Buffer.from(buf)); fs.writeFileSync(fb(k) + ".meta", JSON.stringify(meta || {})); },
    async getBinary(k) {
      try { return { data: fs.readFileSync(fb(k)), meta: JSON.parse(fs.readFileSync(fb(k) + ".meta", "utf8")) }; } catch { return null; }
    },
  };
}

export function store(name) {
  if (process.env.UTB_DEV_STORE) return fileStore(name);
  const s = getStore({ name, consistency: "strong" });
  return {
    get: (k) => s.get(k, { type: "json" }),
    setJSON: (k, v) => s.setJSON(k, v),
    delete: (k) => s.delete(k),
    async list(prefix = "") {
      const out = [];
      for await (const page of s.list({ prefix, paginate: true })) out.push(...page.blobs.map((b) => b.key));
      return out;
    },
    setBinary: (k, buf, meta) => s.set(k, buf, { metadata: meta || {} }),
    async getBinary(k) {
      const r = await s.getWithMetadata(k, { type: "arrayBuffer" });
      return r ? { data: Buffer.from(r.data), meta: r.metadata || {} } : null;
    },
  };
}
