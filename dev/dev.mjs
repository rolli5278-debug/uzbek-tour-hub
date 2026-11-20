// Lokal test serveri: statik fayllar + /api/* -> Netlify funksiyalari (tashqi API'lar mock qilingan)
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT = process.argv[2];
const realFetch = globalThis.fetch;
globalThis.__log = [];
import { mockFetch } from "./mocks.mjs";
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  const m = mockFetch(url, opts, __log);
  if (m) return m;
  return realFetch(url, opts);
};
const fns = {};
for (const f of fs.readdirSync(path.join(ROOT, "netlify/functions")).filter(f=>f.endsWith(".mjs"))) {
  const m = await import(path.join(ROOT, "netlify/functions", f));
  fns[m.config.path] = m.default;
}
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/__log") { res.end(JSON.stringify(__log)); return; }
  const fnKey = Object.keys(fns).find(k => k.endsWith("/*") ? u.pathname.startsWith(k.slice(0,-1)) : k === u.pathname);
  if (fnKey) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await fns[fnKey](new Request("http://x" + req.url, { method: req.method, headers: req.headers, body: ["GET","HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  let p = path.join(ROOT, "public", decodeURIComponent(u.pathname)); if (!p.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.writeHead(404, {"content-type":"text/html"}); fs.createReadStream(path.join(ROOT, "public", "404.html")).pipe(res); return; }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
}).listen(8003, () => console.log("listening 8003"));
