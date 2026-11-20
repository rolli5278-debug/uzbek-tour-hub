/* ==========================================================================
   Uzbek Tour Hub — admin panel (bronlar, kontent, reyting, sozlamalar)
   Barcha so'rovlar /api/admin/* ga; sessiya — HttpOnly cookie (server tomonda tekshiriladi).
   ========================================================================== */
(function () {
  "use strict";
  var D = window.UTH_DATA, app = document.getElementById("app");
  var LANGS = [["uz", "O'zbekcha"], ["ru", "Русский"], ["en", "English"]];
  var ST = { new: "Yangi", confirmed: "Tasdiqlangan", done: "Bajarilgan", cancelled: "Bekor qilingan" };
  var TYPES = { tour: "Sayohat", adventure: "Sarguzasht", guide: "Gid" };
  var S = { user: null, view: "dash", content: null, bookings: [], bFilter: "all", q: "", city: "" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function L(o) { return o == null ? "" : typeof o === "string" ? o : (o.uz || o.ru || o.en || ""); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function cityName(id) { var c = D.cities.find(function (x) { return x.id === id; }); return c ? L(c.name) : id; }
  function fmtDate(s) { if (!s) return ""; var d = new Date(s); return isNaN(d) ? s : d.toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  function toast(msg, bad) { var t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2800); }

  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", headers: {}, credentials: "same-origin" };
    if (opts.body !== undefined) {
      if (opts.raw) { init.body = opts.body; init.headers["content-type"] = opts.type; }
      else { init.body = JSON.stringify(opts.body); init.headers["content-type"] = "application/json"; }
    }
    return fetch("/api/admin/" + path, init).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: "Server javobi noto'g'ri (" + r.status + ")" }; }).then(function (j) {
        if (r.status === 401 && path !== "login") { S.user = null; renderLogin(); }
        if (!j.ok) throw new Error(j.error || "Xato");
        return j;
      });
    });
  }
  function clearSiteCache() { try { sessionStorage.removeItem("uth_ov"); } catch (e) {} }

  /* ---------- Kirish ---------- */
  function renderLogin(msg, configured) {
    app.innerHTML = '<div class="login"><div class="login-card"><div class="hoshiya"></div><div class="in">' +
      '<img src="/assets/img/naqsh/rozetka.svg" alt=""><h1>Uzbek Tour Hub</h1><p class="sub">Boshqaruv paneli</p>' +
      (configured === false ? '<div class="note" style="margin-bottom:14px">Admin panel hali sozlanmagan. Netlify → Site configuration → Environment variables bo\'limida <b>ADMIN_PASSWORD</b> (kamida 8 belgi, maxfiy) va ixtiyoriy <b>ADMIN_USER</b> qo\'shing, so\'ng saytni qayta joylang.</div>' : "") +
      (msg ? '<div class="err" style="margin-bottom:14px">' + esc(msg) + "</div>" : "") +
      '<form class="form" id="lf"><label class="f">Login<input name="user" autocomplete="username" required value="admin"></label>' +
      '<label class="f">Parol<input name="pass" type="password" autocomplete="current-password" required></label>' +
      '<button class="btn" type="submit" style="justify-content:center">Kirish</button></form>' +
      '<p class="muted" style="font-size:.8rem;text-align:center;margin:16px 0 0"><a href="/">← Saytga qaytish</a></p></div><div class="hoshiya"></div></div></div>';
    $("#lf").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, b = f.querySelector("button"); b.disabled = true;
      api("login", { method: "POST", body: { user: f.user.value, pass: f.pass.value } }).then(function (j) { S.user = j.user; start(); })
        .catch(function (err) { renderLogin(err.message, configured); });
    };
  }

  /* ---------- Asosiy maket ---------- */
  var NAV = [["dash", "🏠", "Bosh panel"], ["bookings", "📥", "Bronlar"], ["mons", "🕌", "Obidalar"], ["newmons", "➕", "Yangi obidalar"], ["cities", "🏙", "Shaharlar"],
    ["adv", "⛰", "Sarguzasht"], ["tours", "🧭", "Tarixiy sayohatlar"], ["ratings", "⭐", "Reyting"], ["settings", "⚙", "Sozlamalar"]];
  function shell() {
    var nNew = S.bookings.filter(function (b) { return b.status === "new"; }).length;
    app.innerHTML = '<div class="shell"><aside class="side"><div class="brand"><img src="/assets/img/naqsh/rozetka.svg" alt="" style="background:#fff;border-radius:50%;padding:2px"><div>UZBEK TOUR HUB<small>ADMIN PANEL</small></div></div><nav>' +
      NAV.map(function (n) { return '<button data-v="' + n[0] + '" class="' + (S.view === n[0] ? "on" : "") + '"><span>' + n[1] + "</span>" + n[2] + (n[0] === "bookings" && nNew ? '<span class="badge">' + nNew + "</span>" : "") + "</button>"; }).join("") +
      '</nav></aside><div class="main"><div class="top"><div style="display:flex;gap:10px;align-items:center"><button class="burger" aria-label="Menyu">☰</button><h2 id="ttl"></h2></div>' +
      '<div class="r"><span class="who">👤 ' + esc(S.user) + '</span><a class="btn out sm" href="/" target="_blank" rel="noopener">Saytni ko\'rish ↗</a><button class="btn red sm" id="lo">Chiqish</button></div></div>' +
      '<div class="hoshiya"></div><div class="content" id="ct"></div></div></div>';
    $$(".side nav button").forEach(function (b) { b.onclick = function () { S.view = b.dataset.v; location.hash = S.view; $(".side").classList.remove("open"); shell(); }; });
    $(".burger").onclick = function () { $(".side").classList.toggle("open"); };
    $("#lo").onclick = function () { api("logout", { method: "POST" }).finally(function () { S.user = null; renderLogin(); }); };
    var n = NAV.find(function (x) { return x[0] === S.view; }) || NAV[0];
    $("#ttl").textContent = n[2];
    VIEWS[S.view]($("#ct"));
  }

  /* ---------- Bosh panel ---------- */
  function dash(el) {
    el.innerHTML = '<div class="empty">Yuklanmoqda…</div>';
    api("stats").then(function (j) {
      var b = j.bookings, I = j.integrations;
      function st(v, l) { return '<div class="stat"><b>' + v + "</b><span>" + l + "</span></div>"; }
      el.innerHTML = '<div class="stats">' + st(b.new, "Yangi bronlar") + st(b.week, "So'nggi 7 kunda") + st(b.total, "Jami bronlar") + st(b.confirmed, "Tasdiqlangan") +
        st(D.monuments.length + j.newMons, "Obidalar") + st(j.votes, "Reyting ovozlari") + st(j.edits, "Tahrirlangan yozuvlar") + "</div>" +
        '<div class="panel"><h3>So\'nggi bronlar</h3>' + (j.latest.length ? bookingTable(j.latest, true) : '<div class="empty">Hali bron yo\'q</div>') +
        '<p style="margin:12px 0 0"><button class="btn out sm" data-go="bookings">Barcha bronlar →</button></p></div>' +
        '<div class="panel"><h3>Integratsiyalar</h3><table><tbody>' +
        "<tr><td>Telegram xabarnomalari</td><td>" + (I.telegram ? '<span class="ok-i">✓ ulangan</span>' : '<span class="no-i">✗ ulanmagan</span> <span class="muted">(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)</span>') + "</td></tr>" +
        "<tr><td>Booking.com jonli narxlar</td><td>" + (I.booking ? '<span class="ok-i">✓ ulangan</span>' : '<span class="no-i">✗ ulanmagan</span> <span class="muted">(BOOKING_API_TOKEN, BOOKING_AFFILIATE_ID)</span>') + "</td></tr>" +
        "<tr><td>Silk Road AI</td><td>" + (I.ai ? '<span class="ok-i">✓ ulangan</span>' : '<span class="no-i">✗ ulanmagan</span> <span class="muted">(ANTHROPIC_API_KEY)</span>') + "</td></tr>" +
        "</tbody></table>" + (j.updatedAt ? '<p class="muted" style="margin:10px 0 0;font-size:.85rem">Kontent oxirgi marta o\'zgartirilgan: ' + fmtDate(j.updatedAt) + "</p>" : "") + "</div>";
      $$("[data-go]", el).forEach(function (x) { x.onclick = function () { S.view = x.dataset.go; shell(); }; });
      wireBookingRows(el);
    }).catch(function (e) { el.innerHTML = '<div class="err">' + esc(e.message) + "</div>"; });
  }

  /* ---------- Bronlar ---------- */
  function bookingTable(items, compact) {
    return '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Kelgan</th><th>Mijoz</th><th>Aloqa</th><th>Xizmat</th><th>Sana</th><th>Kishi</th><th>Holat</th>' + (compact ? "" : "<th>Izoh</th><th></th>") + "</tr></thead><tbody>" +
      items.map(function (b) {
        var tel = /^[+\d][\d\s()-]{5,}$/.test(b.contact) ? '<a href="tel:' + esc(b.contact.replace(/[^\d+]/g, "")) + '">' + esc(b.contact) + "</a>" : /^@?\w{4,}$/.test(b.contact) ? '<a href="https://t.me/' + esc(b.contact.replace("@", "")) + '" target="_blank" rel="noopener">' + esc(b.contact) + "</a>" : esc(b.contact);
        return '<tr data-id="' + esc(b.id) + '"><td><b>' + esc(b.id) + "</b></td><td>" + fmtDate(b.ts) + "</td><td>" + esc(b.name) + (b.lang ? ' <span class="muted">(' + esc(b.lang) + ")</span>" : "") + "</td><td>" + tel + "</td>" +
          "<td>" + esc(TYPES[b.type] || b.type) + (b.tour ? '<br><span class="muted">' + esc(b.tour) + "</span>" : "") + (b.comment ? '<br><span class="muted">💬 ' + esc(b.comment) + "</span>" : "") + "</td><td>" + esc(b.date || "—") + "</td><td>" + esc(b.travelers == null ? "—" : b.travelers) + "</td>" +
          '<td><select class="st st-' + esc(b.status) + '" data-st>' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (k === b.status ? " selected" : "") + ">" + ST[k] + "</option>"; }).join("") + "</select></td>" +
          (compact ? "" : "<td>" + (b.note ? esc(b.note) : '<span class="muted">—</span>') + ' <button class="btn out sm" data-note>✎</button></td><td><button class="btn red sm" data-del title="O\'chirish">🗑</button></td>') + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function wireBookingRows(el) {
    $$("tr[data-id]", el).forEach(function (tr) {
      var id = tr.dataset.id, b = S.bookings.find(function (x) { return x.id === id; });
      var sel = $("[data-st]", tr);
      if (sel) sel.onchange = function () {
        api("bookings/" + id, { method: "PATCH", body: { status: sel.value } }).then(function (j) { sel.className = "st st-" + j.item.status; if (b) b.status = j.item.status; toast("Holat yangilandi"); refreshBadge(); })
          .catch(function (e) { toast(e.message, true); });
      };
      var nb = $("[data-note]", tr);
      if (nb) nb.onclick = function () {
        var cur = (b && b.note) || "";
        modal("Izoh: " + id, '<label class="f">Ichki izoh (mijozga ko\'rinmaydi)<textarea id="nt" maxlength="1000">' + esc(cur) + "</textarea></label>", function (box, close) {
          api("bookings/" + id, { method: "PATCH", body: { note: $("#nt", box).value } }).then(function (j) { if (b) b.note = j.item.note; close(); toast("Saqlandi"); VIEWS.bookings($("#ct")); }).catch(function (e) { toast(e.message, true); });
        });
      };
      var db = $("[data-del]", tr);
      if (db) db.onclick = function () {
        if (!confirm(id + " bronini butunlay o'chirasizmi?")) return;
        api("bookings/" + id, { method: "DELETE" }).then(function () { S.bookings = S.bookings.filter(function (x) { return x.id !== id; }); tr.remove(); toast("O'chirildi"); refreshBadge(); }).catch(function (e) { toast(e.message, true); });
      };
    });
  }
  function refreshBadge() {
    var n = S.bookings.filter(function (b) { return b.status === "new"; }).length, btn = $('.side nav [data-v="bookings"]');
    if (!btn) return; var bd = $(".badge", btn);
    if (n) { if (!bd) { bd = document.createElement("span"); bd.className = "badge"; btn.appendChild(bd); } bd.textContent = n; } else if (bd) bd.remove();
  }
  function bookingsView(el) {
    el.innerHTML = '<div class="empty">Yuklanmoqda…</div>';
    api("bookings").then(function (j) {
      S.bookings = j.items; refreshBadge();
      function draw() {
        var q = S.q.toLowerCase();
        var list = S.bookings.filter(function (b) { return (S.bFilter === "all" || b.status === S.bFilter) && (!q || [b.id, b.name, b.contact, b.tour, b.comment, b.note].join(" ").toLowerCase().indexOf(q) > -1); });
        $("#bl", el).innerHTML = list.length ? bookingTable(list) : '<div class="empty">Bron topilmadi</div>';
        wireBookingRows($("#bl", el));
      }
      el.innerHTML = '<div class="toolbar"><div class="chips">' + [["all", "Barchasi"]].concat(Object.keys(ST).map(function (k) { return [k, ST[k]]; })).map(function (c) {
        var n = c[0] === "all" ? S.bookings.length : S.bookings.filter(function (b) { return b.status === c[0]; }).length;
        return '<button data-f="' + c[0] + '" class="' + (S.bFilter === c[0] ? "on" : "") + '">' + c[1] + " (" + n + ")</button>";
      }).join("") + '</div><input type="search" id="bq" placeholder="Qidirish: ism, telefon, ID…" value="' + esc(S.q) + '"><button class="btn out sm" id="csv">⬇ CSV</button><button class="btn out sm" id="rf">↻ Yangilash</button></div><div id="bl"></div>' +
        '<p class="muted" style="font-size:.85rem">Saytdagi bron formalari orqali kelgan so\'rovlar shu yerda saqlanadi. Telegram ulangan bo\'lsa, har bir yangi bron haqida xabar ham keladi.</p>';
      $$("[data-f]", el).forEach(function (b) { b.onclick = function () { S.bFilter = b.dataset.f; $$("[data-f]", el).forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); }; });
      $("#bq", el).oninput = function (e) { S.q = e.target.value; draw(); };
      $("#rf", el).onclick = function () { bookingsView(el); };
      $("#csv", el).onclick = function () {
        var rows = [["ID", "Kelgan", "Turi", "Ism", "Aloqa", "Xizmat", "Sana", "Kishi", "Izoh (mijoz)", "Holat", "Ichki izoh", "Til"]].concat(S.bookings.map(function (b) {
          return [b.id, b.ts, TYPES[b.type] || b.type, b.name, b.contact, b.tour, b.date, b.travelers, b.comment, ST[b.status], b.note, b.lang];
        }));
        var csv = "﻿" + rows.map(function (r) { return r.map(function (v) { v = v == null ? "" : String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
        var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "bronlar-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
      };
      draw();
    }).catch(function (e) { el.innerHTML = '<div class="err">' + esc(e.message) + "</div>"; });
  }

  /* ---------- Kontent yordamchilari ---------- */
  function loadContent() { return S.content ? Promise.resolve(S.content) : api("content").then(function (j) { S.content = j.content; return S.content; }); }
  function triFields(defs, cur, orig) {
    // defs: [[key, label, "input"|"textarea", max]]
    return '<div class="ltabs">' + LANGS.map(function (l, i) { return '<button type="button" data-l="' + l[0] + '" class="' + (i ? "" : "on") + '">' + l[1] + "</button>"; }).join("") + "</div>" +
      LANGS.map(function (l, i) {
        return '<div class="lpane' + (i ? "" : " on") + '" data-lp="' + l[0] + '">' + defs.map(function (d) {
          var v = (cur[d[0]] && cur[d[0]][l[0]]) || "", ph = (orig && orig[d[0]] && orig[d[0]][l[0]]) || "";
          var attrs = ' name="' + d[0] + "." + l[0] + '" maxlength="' + d[3] + '" placeholder="' + esc(ph.slice(0, 160)) + '"';
          return '<label class="f">' + d[1] + (d[2] === "textarea" ? "<textarea" + attrs + ' rows="' + (d[3] > 1000 ? 7 : 3) + '">' + esc(v || ph) + "</textarea>" : "<input" + attrs + ' value="' + esc(v || ph) + '">') + "</label>";
        }).join("") + "</div>";
      }).join("");
  }
  function wireLangTabs(box) { $$(".ltabs button", box).forEach(function (b) { b.onclick = function () { $$(".ltabs button", box).forEach(function (x) { x.classList.toggle("on", x === b); }); $$(".lpane", box).forEach(function (p) { p.classList.toggle("on", p.dataset.lp === b.dataset.l); }); }; }); }
  function readTri(box, keys, orig) {
    var out = {};
    keys.forEach(function (k) {
      var o = {};
      LANGS.forEach(function (l) {
        var el = box.querySelector('[name="' + k + "." + l[0] + '"]'); if (!el) return;
        var v = el.value.trim(), ov = (orig && orig[k] && orig[k][l[0]]) || "";
        if (v && v !== ov) o[l[0]] = v; // faqat o'zgargan qiymatlar saqlanadi
      });
      if (Object.keys(o).length) out[k] = o;
    });
    return out;
  }
  function coverField(cur, origImg) {
    return '<div class="f"><b style="font-size:.84rem">Asosiy rasm</b><div class="cover-box"><img id="cv-img" src="' + esc(cur || (origImg && (origImg.m || origImg.s)) || "") + '" alt="">' +
      '<div style="display:grid;gap:6px"><input type="file" id="cv-file" accept="image/jpeg,image/png,image/webp"><input type="hidden" id="cv" value="' + esc(cur || "") + '">' +
      '<span class="muted" style="font-size:.8rem">JPG/PNG/WebP, 4 MB gacha. Yuklangan rasm birinchi bo\'lib ko\'rsatiladi.</span>' + (cur ? '<button type="button" class="btn red sm" id="cv-rm">Yuklangan rasmni olib tashlash</button>' : "") + "</div></div></div>";
  }
  function wireCover(box, origImg) {
    var f = $("#cv-file", box), h = $("#cv", box), im = $("#cv-img", box), rm = $("#cv-rm", box);
    f.onchange = function () {
      var file = f.files[0]; if (!file) return;
      if (file.size > 4 * 1024 * 1024) { toast("Rasm 4 MB dan katta", true); return; }
      toast("Yuklanmoqda…");
      api("media", { method: "POST", raw: true, type: file.type, body: file }).then(function (j) { h.value = j.url; im.src = j.url; toast("Rasm yuklandi"); }).catch(function (e) { toast(e.message, true); });
    };
    if (rm) rm.onclick = function () { h.value = ""; im.src = origImg ? origImg.m || origImg.s : ""; rm.remove(); };
  }
  function modal(title, html, onSave, extraBtn) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="hd"><h3>' + esc(title) + '</h3><button class="x" aria-label="Yopish">×</button></div><div class="bd">' + html + '</div><div class="ft"><div>' + (extraBtn || "") + '</div><div style="display:flex;gap:8px"><button class="btn out" data-c>Bekor qilish</button><button class="btn" data-s>Saqlash</button></div></div></div>';
    document.body.appendChild(m);
    function close() { m.remove(); document.removeEventListener("keydown", k); }
    function k(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", k);
    $(".x", m).onclick = close; $("[data-c]", m).onclick = close;
    m.addEventListener("click", function (e) { if (e.target === m) close(); });
    $("[data-s]", m).onclick = function () { onSave(m, close); };
    wireLangTabs(m);
    var first = $("input,textarea,select", m); if (first) first.focus();
    return m;
  }
  function saved(kind, id, item) { if (item) S.content[kind][id] = item; else delete S.content[kind][id]; clearSiteCache(); }

  /* ---------- Obidalar ---------- */
  function monsView(el) {
    loadContent().then(function (C) {
      el.innerHTML = '<div class="toolbar"><input type="search" id="mq" placeholder="Obida nomi…" value="' + esc(S.q) + '"><select id="mc"><option value="">Barcha shaharlar</option>' +
        D.cities.map(function (c) { return '<option value="' + c.id + '"' + (S.city === c.id ? " selected" : "") + ">" + esc(L(c.name)) + "</option>"; }).join("") +
        '</select><span class="muted" id="mn"></span></div><div id="ml"></div>';
      function draw() {
        var q = S.q.toLowerCase();
        var list = D.monuments.filter(function (m) { return (!S.city || m.city === S.city) && (!q || [m.name.uz, m.name.ru, m.name.en, m.id].join(" ").toLowerCase().indexOf(q) > -1); });
        $("#mn", el).textContent = list.length + " ta";
        $("#ml", el).innerHTML = '<div class="tbl-wrap"><table><thead><tr><th></th><th>Nomi</th><th>Shahar</th><th>Davri</th><th>Asosiy baho</th><th>Holat</th><th></th></tr></thead><tbody>' +
          list.slice(0, 300).map(function (m) {
            var p = C.mons[m.id] || {}, img = p.cover || (m.imgs[0] && m.imgs[0].m);
            return '<tr><td>' + (img ? '<img class="thumb" src="' + esc(img) + '" alt="" loading="lazy">' : '<span class="thumb"></span>') + "</td><td><b>" + esc(L(p.name) || L(m.name)) + '</b><br><span class="muted" style="font-size:.8rem">' + esc(m.id) + "</span></td><td>" + esc(cityName(m.city)) +
              "</td><td>" + esc(L(p.year) || L(m.year)) + "</td><td>★ " + (p.base || m.base) + "</td><td>" + (Object.keys(p).length ? '<span class="pill p-edit">tahrirlangan</span> ' : "") + (p.hidden ? '<span class="pill p-hid">yashirin</span>' : "") +
              '</td><td><button class="btn out sm" data-ed="' + esc(m.id) + '">Tahrirlash</button> <a class="btn out sm" href="/obida/' + esc(m.id) + '.html" target="_blank" rel="noopener">↗</a></td></tr>';
          }).join("") + "</tbody></table></div>" + (list.length > 300 ? '<p class="muted">Birinchi 300 ta ko\'rsatildi — qidiruvdan foydalaning.</p>' : "");
        $$("[data-ed]", el).forEach(function (b) { b.onclick = function () { editMon(b.dataset.ed, draw); }; });
      }
      $("#mq", el).oninput = function (e) { S.q = e.target.value; draw(); };
      $("#mc", el).onchange = function (e) { S.city = e.target.value; draw(); };
      draw();
    }).catch(function (e) { el.innerHTML = '<div class="err">' + esc(e.message) + "</div>"; });
  }
  var MON_F = [["name", "Nomi", "input", 140], ["short", "Qisqa tavsif", "textarea", 400], ["text", "To'liq matn", "textarea", 6000], ["year", "Qurilgan davri", "input", 60], ["builder", "Bunyodkor", "input", 140]];
  function editMon(id, done) {
    var m = D.monuments.find(function (x) { return x.id === id; }), p = S.content.mons[id] || {};
    modal(L(m.name), '<div class="form">' + triFields(MON_F, p, m) +
      '<div class="row"><label class="f">Asosiy reyting (1–5)<input type="number" id="bs" min="1" max="5" step="0.1" value="' + esc(p.base || m.base) + '"></label>' +
      '<div style="display:grid;gap:8px;align-content:end"><label class="chk"><input type="checkbox" id="hd"' + (p.hidden ? " checked" : "") + "> Saytda yashirish</label>" +
      '<label class="chk"><input type="checkbox" id="ft"' + (p.featured ? " checked" : "") + "> Tavsiya etilgan</label></div></div>" + coverField(p.cover, m.imgs[0]) +
      '<p class="muted" style="font-size:.8rem;margin:0">Bo\'sh qoldirilgan yoki o\'zgartirilmagan maydonlar asl matnda qoladi.</p></div>', function (box, close) {
      var body = readTri(box, MON_F.map(function (f) { return f[0]; }), m);
      var bs = parseFloat($("#bs", box).value); if (bs && bs !== m.base) body.base = bs;
      if ($("#hd", box).checked) body.hidden = true; if ($("#ft", box).checked) body.featured = true;
      if ($("#cv", box).value) body.cover = $("#cv", box).value;
      api("content/mons/" + id, { method: "PUT", body: body }).then(function (j) { saved("mons", id, j.item); close(); toast("Saqlandi — saytda 1 daqiqa ichida ko'rinadi"); done(); }).catch(function (e) { toast(e.message, true); });
    }, Object.keys(p).length ? '<button class="btn red" id="rv">Asl holatga qaytarish</button>' : "");
    var box = $(".modal:last-child"); wireCover(box, m.imgs[0]);
    var rv = $("#rv", box); if (rv) rv.onclick = function () {
      if (!confirm("Barcha o'zgarishlar bekor qilinsinmi?")) return;
      api("content/mons/" + id, { method: "DELETE" }).then(function () { saved("mons", id, null); box.remove(); toast("Asl holatga qaytarildi"); done(); }).catch(function (e) { toast(e.message, true); });
    };
  }

  /* ---------- Yangi obidalar ---------- */
  var CATS = Object.keys(D.cats);
  function newMonsView(el) {
    loadContent().then(function (C) {
      el.innerHTML = '<div class="toolbar"><button class="btn" id="add">➕ Yangi obida qo\'shish</button><span class="muted">Qo\'shilgan obidalar ro\'yxat, qidiruv, xarita va reytingda ko\'rinadi.</span></div><div id="nl"></div>';
      function draw() {
        $("#nl", el).innerHTML = C.newMons.length ? '<div class="tbl-wrap"><table><thead><tr><th></th><th>Nomi</th><th>Shahar</th><th>Turi</th><th>Holat</th><th></th></tr></thead><tbody>' + C.newMons.map(function (n) {
          return '<tr><td>' + (n.cover ? '<img class="thumb" src="' + esc(n.cover) + '" alt="">' : '<span class="thumb"></span>') + "</td><td><b>" + esc(L(n.name)) + "</b></td><td>" + esc(cityName(n.city)) + "</td><td>" + esc(L(D.cats[n.cat]) || n.cat) +
            '</td><td><span class="pill p-new">yangi</span> ' + (n.hidden ? '<span class="pill p-hid">yashirin</span>' : "") + '</td><td><button class="btn out sm" data-ed="' + esc(n.id) + '">Tahrirlash</button> <a class="btn out sm" target="_blank" rel="noopener" href="/obida/view.html?id=' + encodeURIComponent(n.id) + '">↗</a> <button class="btn red sm" data-del="' + esc(n.id) + '">🗑</button></td></tr>';
        }).join("") + "</tbody></table></div>" : '<div class="empty">Hali yangi obida qo\'shilmagan</div>';
        $$("[data-ed]", el).forEach(function (b) { b.onclick = function () { editNew(C.newMons.find(function (x) { return x.id === b.dataset.ed; }), draw); }; });
        $$("[data-del]", el).forEach(function (b) { b.onclick = function () {
          if (!confirm("Obida o'chirilsinmi?")) return;
          api("newmon/" + b.dataset.del, { method: "DELETE" }).then(function () { C.newMons = C.newMons.filter(function (x) { return x.id !== b.dataset.del; }); clearSiteCache(); draw(); toast("O'chirildi"); }).catch(function (e) { toast(e.message, true); });
        }; });
      }
      $("#add", el).onclick = function () { editNew(null, draw); };
      draw();
    });
  }
  function editNew(n, done) {
    var cur = n || {};
    modal(n ? L(n.name) : "Yangi obida", '<div class="form"><div class="row"><label class="f">Shahar / hudud<select id="ncity">' + D.cities.map(function (c) { return '<option value="' + c.id + '"' + (cur.city === c.id ? " selected" : "") + ">" + esc(L(c.name)) + "</option>"; }).join("") + "</select></label>" +
      '<label class="f">Turi<select id="ncat">' + CATS.map(function (k) { return '<option value="' + k + '"' + (cur.cat === k ? " selected" : "") + ">" + esc(L(D.cats[k])) + "</option>"; }).join("") + "</select></label></div>" +
      triFields(MON_F, cur, null) + '<div class="row"><label class="f">Kenglik (lat)<input id="nlat" type="number" step="any" value="' + esc(cur.lat == null ? "" : cur.lat) + '"></label><label class="f">Uzunlik (lng)<input id="nlng" type="number" step="any" value="' + esc(cur.lng == null ? "" : cur.lng) + '"></label>' +
      '<label class="f">Asosiy reyting<input id="nbase" type="number" min="1" max="5" step="0.1" value="' + esc(cur.base || 4) + '"></label></div><label class="chk"><input type="checkbox" id="nhid"' + (cur.hidden ? " checked" : "") + "> Saytda yashirish</label>" + coverField(cur.cover, null) + "</div>", function (box, close) {
      var body = readTri(box, MON_F.map(function (f) { return f[0]; }), null);
      Object.assign(body, { city: $("#ncity", box).value, cat: $("#ncat", box).value, lat: $("#nlat", box).value, lng: $("#nlng", box).value, base: $("#nbase", box).value, hidden: $("#nhid", box).checked, cover: $("#cv", box).value });
      api(n ? "newmon/" + n.id : "newmon", { method: n ? "PUT" : "POST", body: body }).then(function (j) {
        var list = S.content.newMons, i = list.findIndex(function (x) { return x.id === j.item.id; });
        if (i > -1) list[i] = j.item; else list.push(j.item);
        clearSiteCache(); close(); toast("Saqlandi"); done();
      }).catch(function (e) { toast(e.message, true); });
    });
    wireCover($(".modal:last-child"), null);
  }

  /* ---------- Shaharlar / sarguzasht / sayohatlar (umumiy tahrir) ---------- */
  function simpleView(kind, items, fields, titleKey, hasCover, canHide, link) {
    return function (el) {
      loadContent().then(function (C) {
        function draw() {
          el.innerHTML = '<div class="tbl-wrap"><table><thead><tr>' + (hasCover ? "<th></th>" : "") + "<th>Nomi</th><th>Holat</th><th></th></tr></thead><tbody>" + items().map(function (x) {
            var p = C[kind][x.id] || {}, img = p.cover || (x.imgs && x.imgs[0] && x.imgs[0].m);
            return "<tr>" + (hasCover ? "<td>" + (img ? '<img class="thumb" src="' + esc(img) + '" alt="">' : '<span class="thumb"></span>') + "</td>" : "") + "<td><b>" + esc(L(p[titleKey]) || L(x[titleKey])) + "</b></td><td>" +
              (Object.keys(p).length ? '<span class="pill p-edit">tahrirlangan</span> ' : "") + (p.hidden ? '<span class="pill p-hid">yashirin</span>' : "") + '</td><td><button class="btn out sm" data-ed="' + esc(x.id) + '">Tahrirlash</button>' + (link ? ' <a class="btn out sm" target="_blank" rel="noopener" href="' + link(x) + '">↗</a>' : "") + "</td></tr>";
          }).join("") + "</tbody></table></div>";
          $$("[data-ed]", el).forEach(function (b) { b.onclick = function () {
            var x = items().find(function (y) { return y.id === b.dataset.ed; }), p = C[kind][x.id] || {};
            modal(L(x[titleKey]), '<div class="form">' + triFields(fields, p, x) + (canHide ? '<label class="chk"><input type="checkbox" id="hd"' + (p.hidden ? " checked" : "") + "> Saytda yashirish</label>" : "") + (hasCover ? coverField(p.cover, x.imgs && x.imgs[0]) : "") + "</div>", function (box, close) {
              var body = readTri(box, fields.map(function (f) { return f[0]; }), x);
              if (canHide && $("#hd", box).checked) body.hidden = true;
              if (hasCover && $("#cv", box).value) body.cover = $("#cv", box).value;
              api("content/" + kind + "/" + x.id, { method: "PUT", body: body }).then(function (j) { saved(kind, x.id, j.item); close(); toast("Saqlandi"); draw(); }).catch(function (e) { toast(e.message, true); });
            });
            if (hasCover) wireCover($(".modal:last-child"), x.imgs && x.imgs[0]);
          }; });
        }
        draw();
      });
    };
  }

  /* ---------- Reyting ---------- */
  function ratingsView(el) {
    el.innerHTML = '<div class="empty">Yuklanmoqda…</div>';
    api("ratings").then(function (j) {
      var rows = Object.keys(j.summary).map(function (id) {
        var r = j.summary[id], m = D.monuments.find(function (x) { return x.id === id; }) || (S.content && S.content.newMons.find(function (x) { return x.id === id; }));
        return { id: id, name: m ? L(m.name) : id, city: m ? cityName(m.city) : "", count: r.count || 0, avg: r.count ? r.sum / r.count : 0, base: m && m.base };
      }).filter(function (r) { return r.count; }).sort(function (a, b) { return b.count - a.count; });
      el.innerHTML = '<p class="muted">Foydalanuvchilar bergan ovozlar. Saytdagi ko\'rsatkich — asosiy baho va ovozlar aralashmasi. Firibgarlik bilan to\'plangan ovozlarni nolga tushirishingiz mumkin.</p>' +
        (rows.length ? '<div class="tbl-wrap"><table><thead><tr><th>Obida</th><th>Shahar</th><th>Ovozlar</th><th>O\'rtacha ovoz</th><th>Asosiy baho</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
          return "<tr><td><b>" + esc(r.name) + "</b></td><td>" + esc(r.city) + "</td><td>" + r.count + "</td><td>★ " + r.avg.toFixed(2) + "</td><td>" + (r.base ? "★ " + r.base : "—") + '</td><td><button class="btn red sm" data-rs="' + esc(r.id) + '">Ovozlarni tozalash</button></td></tr>';
        }).join("") + "</tbody></table></div>" : '<div class="empty">Hali ovoz berilmagan</div>');
      $$("[data-rs]", el).forEach(function (b) { b.onclick = function () {
        if (!confirm("Bu obidaning barcha ovozlari o'chirilsinmi?")) return;
        api("ratings/" + b.dataset.rs, { method: "DELETE" }).then(function () { toast("Tozalandi"); ratingsView(el); }).catch(function (e) { toast(e.message, true); });
      }; });
    }).catch(function (e) { el.innerHTML = '<div class="err">' + esc(e.message) + "</div>"; });
  }

  /* ---------- Sozlamalar ---------- */
  function settingsView(el) {
    loadContent().then(function (C) {
      var s = C.settings || {};
      el.innerHTML = '<div class="panel"><h3>E\'lon banneri</h3><div class="form"><label class="chk"><input type="checkbox" id="aon"' + (s.announceOn ? " checked" : "") + "> Saytning yuqori qismida ko'rsatish</label>" +
        triFields([["announce", "E'lon matni", "input", 300]], s, null) + '<label class="f">Havola (ixtiyoriy)<input id="aurl" placeholder="/sarguzasht.html yoki https://…" value="' + esc(s.announceUrl || "") + '"></label></div></div>' +
        '<div class="panel"><h3>Aloqa ma\'lumotlari (footerda)</h3><div class="form"><div class="row"><label class="f">Telefon<input id="ph" value="' + esc(s.phone || "") + '" placeholder="+998 90 000 00 00"></label>' +
        '<label class="f">E-pochta<input id="em" type="email" value="' + esc(s.email || "") + '"></label><label class="f">Telegram<input id="tg" value="' + esc(s.telegram || "") + '" placeholder="@kanal"></label></div>' +
        '<div id="adr">' + triFields([["address", "Manzil", "input", 200]], s, null) + "</div></div></div>" +
        '<div class="panel"><h3>Xizmatlar</h3><div class="form"><label class="chk"><input type="checkbox" id="bc"' + (s.bookingsClosed ? " checked" : "") + "> Bron qabul qilishni vaqtincha to'xtatish</label>" +
        '<label class="chk"><input type="checkbox" id="co"' + (s.chatOff ? " checked" : "") + "> Silk Road AI chat tugmasini yashirish</label></div></div>" +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="sv">Saqlash</button><a class="btn out" href="/api/admin/backup" download>⬇ Zaxira nusxa (JSON)</a></div>' +
        '<div class="panel" style="margin-top:18px"><h3>Xavfsizlik</h3><p class="muted" style="margin:0">Login va parol Netlify muhit o\'zgaruvchilarida saqlanadi (<b>ADMIN_USER</b>, <b>ADMIN_PASSWORD</b>). Parolni o\'zgartirish uchun Netlify\'da qiymatni yangilab, saytni qayta joylang — barcha faol sessiyalar avtomatik bekor bo\'ladi. Sessiya 12 soat amal qiladi.</p></div>';
      wireLangTabs(el);
      $("#sv", el).onclick = function () {
        var body = readTri(el, ["announce", "address"], null);
        Object.assign(body, { announceOn: $("#aon", el).checked, announceUrl: $("#aurl", el).value.trim(), phone: $("#ph", el).value.trim(), email: $("#em", el).value.trim(), telegram: $("#tg", el).value.trim(), bookingsClosed: $("#bc", el).checked, chatOff: $("#co", el).checked });
        api("settings", { method: "PUT", body: body }).then(function (j) { C.settings = j.settings; clearSiteCache(); toast("Sozlamalar saqlandi"); }).catch(function (e) { toast(e.message, true); });
      };
    });
  }

  var VIEWS = {
    dash: dash, bookings: bookingsView, mons: monsView, newmons: newMonsView,
    cities: simpleView("cities", function () { return D.cities; }, [["name", "Nomi", "input", 80], ["intro", "Tavsif", "textarea", 3000]], "name", true, false, function (x) { return "/shahar/" + x.id + ".html"; }),
    adv: simpleView("adv", function () { return D.adventures; }, [["title", "Nomi", "input", 140], ["desc", "Tavsif", "textarea", 3000]], "title", true, true, function (x) { return "/sarguzasht/" + x.id + ".html"; }),
    tours: simpleView("tours", function () { return D.tours; }, [["title", "Nomi", "input", 140], ["duration", "Davomiyligi", "input", 60], ["desc", "Tavsif", "textarea", 2000]], "title", false, true, function () { return "/sayohatlar.html"; }),
    ratings: ratingsView, settings: settingsView,
  };

  function start() {
    var h = location.hash.slice(1); if (VIEWS[h]) S.view = h;
    api("bookings").then(function (j) { S.bookings = j.items; }).catch(function () {}).then(shell);
    // Har daqiqada yangi bronlarni tekshirish
    setInterval(function () {
      if (!S.user) return;
      api("bookings").then(function (j) {
        var before = S.bookings.filter(function (b) { return b.status === "new"; }).length;
        S.bookings = j.items; refreshBadge();
        var after = S.bookings.filter(function (b) { return b.status === "new"; }).length;
        if (after > before) { toast("📥 Yangi bron keldi!"); document.title = "(" + after + ") Admin panel — Uzbek Tour Hub"; }
      }).catch(function () {});
    }, 60000);
  }

  fetch("/api/admin/me", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (j) {
    if (j.user) { S.user = j.user; start(); } else renderLogin(null, j.configured);
  }).catch(function () { renderLogin("Server bilan aloqa yo'q"); });
})();
