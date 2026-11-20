/* ==========================================================================
   Uzbek Tour Hub — umumiy skript: til, header/footer, qidiruv, reyting, AI chat, bron
   ========================================================================== */
(function () {
  "use strict";
  var D = window.UTH_DATA, I = window.UTH_I18N;
  var U = (window.UTH = {});

  /* ---------- Til (uz / ru / en) ---------- */
  var LANGS = ["uz", "ru", "en"];
  U.lang = (function () {
    var q = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(q) > -1) { try { localStorage.setItem("uth_lang", q); } catch (e) {} return q; }
    try { var s = localStorage.getItem("uth_lang"); if (LANGS.indexOf(s) > -1) return s; } catch (e) {}
    return "uz";
  })();
  document.documentElement.lang = U.lang;
  U.t = function (k, vars) {
    var s = (I[U.lang] && I[U.lang][k]) || I.uz[k] || k;
    if (vars) for (var v in vars) s = s.split("{" + v + "}").join(vars[v]);
    return s;
  };
  U.L = function (o) { return o == null ? "" : typeof o === "string" ? o : (o[U.lang] || o.uz || ""); };
  U.setLang = function (l) { try { localStorage.setItem("uth_lang", l); } catch (e) {} var u = new URL(location.href); u.searchParams.delete("lang"); location.href = u.toString(); };
  U.locale = { uz: "uz-UZ", ru: "ru-RU", en: "en-GB" }[U.lang];
  var t = U.t, L = U.L;

  /* ---------- Yordamchilar ---------- */
  U.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  U.qs = function (k) { return new URLSearchParams(location.search).get(k); };
  U.city = function (id) { return D.cities.find(function (c) { return c.id === id; }); };
  U.mon = function (id) { return D.monuments.find(function (m) { return m.id === id; }); };
  U.adv = function (id) { return D.adventures.find(function (a) { return a.id === id; }); };
  U.isWH = function (keys) { return (keys || []).some(function (k) { return D.unesco[k] && D.unesco[k].t === "wh"; }); };
  // UNESCO bloki: faqat tasdiqlangan ro'yxatlar; aloqasi bo'lmasa — bo'sh satr (sahifada UNESCO yozuvi chiqmaydi)
  U.unescoBlock = function (keys) {
    keys = (keys || []).filter(function (k) { return D.unesco[k]; });
    if (!keys.length) return "";
    return '<div class="unesco-box"><div class="unesco-head"><span class="unesco-logo" aria-hidden="true">UNESCO</span></div>' + keys.map(function (k) {
      var u = D.unesco[k];
      var list = t("un." + u.t) + (u.t === "ich" && u.proclaimed ? " — " + t("un.proclaimed", { y: u.proclaimed }) : "");
      return '<div class="unesco-item"><b>' + U.esc(L(u.name)) + '</b><span>' + U.esc(list) + ", " + u.year + (u.ref ? " · №" + u.ref : "") + "</span>" +
        (u.danger ? '<span class="danger">⚠ ' + t("un.danger", { y: u.danger }) + "</span>" : "") +
        '<a href="' + u.url + '" target="_blank" rel="noopener">' + t("un.src") + " ↗</a></div>";
    }).join("") + "</div>";
  };
  U.monsOf = function (cityId) { return D.monuments.filter(function (m) { return m.city === cityId; }); };
  U.catName = function (k) { return L(D.cats[k].name); };
  U.catSingle = function (k) { return L(D.cats[k].one); };
  U.mapsLink = function (m) {
    if (m.pid) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(m.name.en) + "&query_place_id=" + encodeURIComponent(m.pid);
    return "https://www.google.com/maps/search/?api=1&query=" + (m.lat != null ? m.lat + "," + m.lng : encodeURIComponent(m.name.uz + ", " + (m.address || "")));
  };
  U.monUrl = function (m) { return m.isNew ? "/obida/view.html?id=" + encodeURIComponent(m.id) : "/obida/" + m.id + ".html"; };
  U.cityUrl = function (c) { return "/shahar/" + c.id + ".html"; };
  U.advUrl = function (a) { return "/sarguzasht/" + a.id + ".html"; };
  U.km = function (a, b) {
    var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  U.fmtKm = function (k) { return k < 1 ? Math.round(k * 1000) + " m" : (k < 10 ? k.toFixed(1) : Math.round(k)) + " km"; };
  U.num = function (n) { return U.lang === "en" ? n.toLocaleString("en-GB") : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); };
  U.money = function (v, cur) { try { return new Intl.NumberFormat(U.locale, { style: "currency", currency: cur || "USD", maximumFractionDigits: 0 }).format(v); } catch (e) { return (cur || "$") + " " + Math.round(v); } };

  /* ---------- Rasmlar va zaxira belgisi ---------- */
  // Rasm bo'lmasa: och indigo fon + obida turi ikonkasi + to'q indigo yozuv (yagona uslub)
  var ICONS = {
    dome: '<path d="M32 10c-2 4-10 8-10 18h20c0-10-8-14-10-18z"/><path d="M18 30h28v4H18zM20 36h4v16h-4zm10 0h4v16h-4zm10 0h4v16h-4zM14 54h36v4H14z"/>',
    minaret: '<path d="M32 6l4 8h-8z"/><path d="M28 16h8v4h-8zM27 22h10l-1 30H28zM22 54h20v4H22z"/>',
    fort: '<path d="M10 22h6v-6h6v6h6v-6h8v6h6v-6h6v6h6v36H10z" fill-rule="evenodd"/><path d="M28 58V46a4 4 0 018 0v12z" fill="#f1ebff"/>',
    arch: '<path d="M12 12h40v46H12z"/><path d="M24 58V36a8 8 0 0116 0v22z" fill="#f1ebff"/><path d="M16 16h32v4H16z" fill="#f1ebff"/>',
    column: '<path d="M14 14h36v6H14zM18 22h6v28h-6zm11 0h6v28h-6zm11 0h6v28h-6zM12 52h40v6H12z"/>',
    mountain: '<path d="M6 54l18-28 9 13 7-9 18 24z"/><circle cx="46" cy="16" r="5"/>',
    city: '<path d="M8 58V30h12v28zm16 0V18h16v40zm20 0V36h12v22z"/>'
  };
  var CAT_ICON = { ziyoratgoh: "dome", bino: "column", ansambl: "arch", madrasa: "arch", maqbara: "dome", masjid: "dome", minora: "minaret", saroy: "fort", arxeologik: "column", muzey: "column" };
  U.ph = function (label, icon) {
    return '<div class="ph" role="img" aria-label="' + U.esc(label) + '"><svg viewBox="0 0 64 64" aria-hidden="true" fill="currentColor">' + (ICONS[icon] || ICONS.dome) + "</svg><span>" + U.esc(label) + "</span></div>";
  };
  window.__uthImgErr = function (img) {
    // Avval boshqa o'lcham, keyin zaxira surat — bo'sh ramka qolmasin
    var alt = img.getAttribute("data-alt-src");
    if (!img.dataset.tried && img.srcset) { img.dataset.tried = 1; var first = img.srcset.split(",").pop().trim().split(" ")[0]; img.removeAttribute("srcset"); img.src = first; return; }
    if (alt && img.dataset.tried !== "2") { img.dataset.tried = "2"; img.removeAttribute("srcset"); img.src = alt; return; }
    var d = document.createElement("div");
    d.innerHTML = U.ph(img.getAttribute("data-label") || img.alt || "", img.getAttribute("data-icon") || "dome");
    img.replaceWith(d.firstChild);
  };
  // im: { s: "/images/x.webp", m: "/images/x-s.webp" }
  U.pic = function (im, alt, icon, opts) {
    opts = opts || {};
    if (!im) return U.ph(alt, icon);
    var big = opts.big, src = big ? im.s : (im.m || im.s);
    var srcset = im.m ? ' srcset="' + im.m + " 640w, " + im.s + ' 1600w" sizes="' + (opts.sizes || (big ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 600px) 100vw, 400px")) + '"' : "";
    return '<img src="' + src + '"' + srcset + ' alt="' + U.esc(alt) + '" data-label="' + U.esc(alt) + '" data-icon="' + (icon || "dome") + '"' + (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async" onerror="__uthImgErr(this)">';
  };
  U.monImg = function (m, opts) { return U.pic(m.imgs[0], L(m.name), CAT_ICON[m.cat] || "dome", opts); };
  U.cityImg = function (c, opts) { return U.pic(c.imgs[0], L(c.name), "city", opts); };
  U.advImg = function (a, opts) { return U.pic(a.imgs[0], L(a.title), "mountain", opts); };
  U.credit = function (im) {
    if (!im || !im.c) return "";
    if (!im.c.u) return U.esc(im.c.a || "Uzbek Tour Hub") + (im.c.l ? " · " + U.esc(im.c.l) : "");
    var lbl = im.c.k === "landmark" ? t("img.landmark", { r: L((U.city(im.c.r) || {}).name) }) : im.c.k === "map" ? t("img.map") : im.c.k === "city" ? t("img.city", { r: L((U.city(im.c.r) || {}).name) }) : im.c.k === "near" ? t("img.near") : "";
    if (lbl) return '<b class="ill-note">' + U.esc(lbl) + "</b> · " + '<a href="' + U.esc(im.c.u) + '" target="_blank" rel="noopener">' + U.esc(im.c.a || "Wikimedia Commons") + "</a> · " + U.esc(im.c.l);
    return '<a href="' + U.esc(im.c.u) + '" target="_blank" rel="noopener">' + U.esc(im.c.a || "Wikimedia Commons") + "</a> · " + U.esc(im.c.l);
  };

  /* ---------- Toast ---------- */
  var tw;
  U.toast = function (msg) {
    if (!tw) { tw = document.createElement("div"); tw.className = "toast-wrap"; tw.setAttribute("aria-live", "polite"); document.body.appendChild(tw); }
    var el = document.createElement("div"); el.className = "toast"; el.textContent = msg; tw.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  };

  /* ---------- Reyting (backend: /api/ratings, kalit = IP + obida) ---------- */
  function myVotes() { try { return JSON.parse(localStorage.getItem("uth_votes") || "{}"); } catch (e) { return {}; } }
  var ratingsP = null, ratingsCache = {};
  U.ratings = {
    load: function (force) {
      if (!ratingsP || force) {
        ratingsP = fetch("/api/ratings", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
          ratingsCache = (j && j.ratings) || {}; return ratingsCache;
        }).catch(function () { return ratingsCache; });
      }
      return ratingsP;
    },
    // Reyting = sayt bergan boshlang'ich baho (5 ta ovoz og'irligida) + sayyohlar ovozlari
    get: function (id) {
      var r = ratingsCache[id] || { avg: 0, count: 0 }, m = U.mon(id), base = (m && m.base) || 3.6, W = 5;
      return { avg: (base * W + r.avg * r.count) / (W + r.count), count: r.count, base: base };
    },
    mine: function (id) { return myVotes()[id] || 0; },
    rate: function (id, stars) {
      return fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id, stars: stars }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || t("rate.err")); return j; }); })
        .then(function (j) {
          ratingsCache[id] = j.rating;
          var v = myVotes(); v[id] = stars; try { localStorage.setItem("uth_votes", JSON.stringify(v)); } catch (e) {}
          document.dispatchEvent(new CustomEvent("uth:rated", { detail: { id: id, rating: j.rating } }));
          return j.rating;
        });
    }
  };
  U.rateMini = function (id) {
    var r = U.ratings.get(id);
    return '<span class="rate-mini" data-rate="' + id + '"><span class="star">★</span>' + r.avg.toFixed(1) + (r.count ? ' <span class="muted">(' + r.count + ")</span>" : "") + "</span>";
  };
  U.refreshRateMinis = function () { document.querySelectorAll("[data-rate]").forEach(function (el) { el.outerHTML = U.rateMini(el.getAttribute("data-rate")); }); };
  U.starsStatic = function (avg) {
    var s = "", full = Math.round(avg);
    for (var i = 1; i <= 5; i++) s += i <= full ? "★" : '<span class="off">★</span>';
    return '<span class="stars-static" aria-label="' + avg.toFixed(1) + ' / 5">' + s + "</span>";
  };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
  U.starWidget = function (el, id, onDone) {
    var cur = U.ratings.mine(id);
    el.innerHTML = '<div class="stars" role="radiogroup" aria-label="' + t("rate.title") + '">' + [1, 2, 3, 4, 5].map(function (n) {
      return '<button type="button" role="radio" aria-checked="' + (n === cur) + '" aria-label="' + n + " / 5" + '" data-n="' + n + '" class="' + (n <= cur ? "on" : "") + '">' + STAR + "</button>";
    }).join("") + "</div>";
    var btns = el.querySelectorAll("button");
    function paint(k) { btns.forEach(function (b) { b.classList.toggle("on", +b.dataset.n <= k); }); }
    btns.forEach(function (b) {
      b.addEventListener("mouseenter", function () { paint(+b.dataset.n); });
      b.addEventListener("mouseleave", function () { paint(U.ratings.mine(id)); });
      b.addEventListener("click", function () {
        var n = +b.dataset.n;
        btns.forEach(function (x) { x.disabled = true; });
        U.ratings.rate(id, n).then(function (r) { paint(n); U.toast(t("rate.saved", { n: n })); onDone && onDone(r); })
          .catch(function (e) { paint(U.ratings.mine(id)); U.toast(e.message); })
          .then(function () { btns.forEach(function (x) { x.disabled = false; }); });
      });
    });
  };
  U.openRate = function (id) {
    var m = U.mon(id); if (!m) return;
    var ov = modal('<h3 class="h3">' + t("rate.title") + '</h3><p class="muted" style="margin:6px 0 18px">' + U.esc(L(m.name)) + " · " + U.esc(L(U.city(m.city).name)) + '</p><div id="rw"></div><p class="muted" style="font-size:.82rem;margin-top:14px">' + t("rate.note") + ' <a href="/reyting.html" class="link">' + t("nav.rating") + " →</a></p>");
    U.starWidget(ov.querySelector("#rw"), id, function () { U.refreshRateMinis(); setTimeout(function () { close(ov); }, 700); });
  };

  /* ---------- Modal ---------- */
  function modal(html, cls) {
    var ov = document.createElement("div");
    ov.className = "overlay"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = '<div class="modal ' + (cls || "") + '"><button class="close-x" type="button" aria-label="' + t("close") + '">✕</button>' + html + "</div>";
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("open"); });
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(ov); });
    ov.querySelector(".close-x").onclick = function () { close(ov); };
    function onKey(e) { if (e.key === "Escape") { close(ov); document.removeEventListener("keydown", onKey); } }
    document.addEventListener("keydown", onKey);
    setTimeout(function () { var f = ov.querySelector("input,button:not(.close-x)"); f && f.focus(); }, 50);
    return ov;
  }
  function close(ov) { ov.classList.remove("open"); setTimeout(function () { ov.remove(); }, 260); }
  U.modal = modal; U.closeModal = close;

  /* ---------- Bron so'rovi (Telegram orqali, /api/booking) ---------- */
  // item: { title, duration, kind } — saytda taxminiy narx ko'rsatilmaydi; narxni operator aytadi
  U.openBooking = function (item) {
    var d = new Date(); d.setDate(d.getDate() + 7);
    var min = new Date().toISOString().slice(0, 10);
    var ov = modal('<h3 class="h3">' + t("book.title") + '</h3><p class="muted" style="margin:6px 0 0">' + U.esc(item.title) + (item.duration ? " · " + U.esc(item.duration) : "") + "</p>" +
      '<form class="form" novalidate><div class="form-msg err" hidden></div>' +
      "<label>" + t("book.name") + '<input name="name" required maxlength="80" autocomplete="name"></label>' +
      "<label>" + t("book.contact") + '<input name="contact" required maxlength="60" autocomplete="tel" placeholder="+998 90 123 45 67"></label>' +
      '<div class="row2"><label>' + t("book.date") + '<input type="date" name="date" min="' + min + '" value="' + d.toISOString().slice(0, 10) + '"></label>' +
      "<label>" + t("book.people") + '<select name="n">' + [1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(function (n) { return "<option" + (n === 2 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label></div>" +
      "<label>" + t("book.comment") + '<textarea name="comment" maxlength="600" rows="2"></textarea></label>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
      '<p class="muted" style="font-size:.82rem;margin:0">' + t("book.confirm") + "</p>" +
      '<button class="btn btn-primary" type="submit">' + t("book.send") + "</button></form>");
    var f = ov.querySelector("form"), msg = f.querySelector(".form-msg");
    f.onsubmit = function (e) {
      e.preventDefault(); msg.hidden = true;
      if (f.name.value.trim().length < 2 || f.contact.value.trim().length < 5) { msg.textContent = t("book.fill"); msg.hidden = false; return; }
      var btn = f.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = t("book.sending");
      fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        type: item.kind || "tour", website: f.website.value,
        data: { clientName: f.name.value.trim(), contact: f.contact.value.trim(), tourName: item.title, date: f.date.value, travelers: +f.n.value, comment: f.comment.value.trim(), lang: U.lang }
      }) }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || t("book.err")); }); })
        .then(function () { f.outerHTML = '<div class="form-msg ok" style="margin-top:20px">' + t("book.ok") + "</div>"; })
        .catch(function (err) { msg.textContent = err.message; msg.hidden = false; btn.disabled = false; btn.textContent = t("book.send"); });
    };
  };

  /* ---------- Header ---------- */
  var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var CHEV = '<svg class="chev" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  function langSwitch(cls) {
    return '<div class="lang ' + (cls || "") + '" role="group" aria-label="' + t("lang") + '">' + LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === U.lang) + '"' + (l === U.lang ? ' class="on"' : "") + ">" + l.toUpperCase() + "</button>";
    }).join("") + "</div>";
  }
  function header(active) {
    var cities = D.cities.map(function (c) {
      return '<a class="dd-city" href="' + U.cityUrl(c) + '"><span class="thumb">' + U.cityImg(c) + "</span><span><b>" + U.esc(L(c.name)) + "</b><span>" + t("n.mons", { n: c.count }) + "</span></span></a>";
    }).join("");
    var link = function (href, key, label) { return '<li><a class="nav-link' + (active === key ? " active" : "") + '" href="' + href + '"' + (active === key ? ' aria-current="page"' : "") + ">" + label + "</a></li>"; };
    return '<div class="wrap nav">' +
      '<a class="logo" href="/" aria-label="Uzbek Tour Hub">UZBEK TOUR HUB<small>' + t("logo.sub") + "</small></a>" +
      '<ul class="nav-links">' +
        link("/", "home", t("nav.home")) +
        '<li><button class="nav-link' + (active === "mon" ? " active" : "") + '" type="button" aria-expanded="false" aria-controls="dd-cities" data-dd>' + t("nav.mons") + " " + CHEV + "</button>" +
          '<div class="dropdown" id="dd-cities"><p class="dd-title">' + t("nav.monsLong") + '</p><div class="dropdown-grid">' + cities + '</div><div class="dropdown-foot"><a class="btn btn-outline btn-sm" href="/obidalar.html">' + t("allMons", { n: D.monuments.length }) + '</a><a class="btn-ghost" href="/reyting.html">' + t("nav.rating") + " →</a></div></div></li>" +
        link("/sayohatlar.html", "tours", t("nav.tours")) +
        link("/sarguzasht.html", "adv", t("nav.adv")) +
        link("/reyting.html", "rating", t("nav.rating")) +
      "</ul>" +
      '<div class="nav-right">' +
        '<div class="search" role="search"><label class="sr-only" for="q">' + t("search.label") + '</label><input id="q" type="search" placeholder="' + t("search.ph") + '" autocomplete="off">' + SEARCH_SVG + '<div class="search-results" role="listbox"></div></div>' +
        langSwitch() +
        '<button class="btn btn-primary btn-sm ai-btn" type="button" data-chat-open>AI Planner</button>' +
        '<button class="burger" type="button" aria-label="' + t("menu") + '" aria-expanded="false"><span></span></button>' +
      "</div></div>" +
      '<nav class="mobile-menu" aria-label="' + t("menu") + '">' + langSwitch("lang-lg") + '<div class="search"><input type="search" placeholder="' + t("search.ph") + '" autocomplete="off" aria-label="' + t("search.label") + '">' + SEARCH_SVG + '<div class="search-results"></div></div>' +
        '<a href="/">' + t("nav.home") + "</a>" +
        "<details><summary>" + t("nav.mons") + " <span>▾</span></summary>" + D.cities.map(function (c) { return '<a href="' + U.cityUrl(c) + '">' + U.esc(L(c.name)) + ' <span class="muted">' + c.count + "</span></a>"; }).join("") + '<a href="/obidalar.html">' + t("allMons", { n: D.monuments.length }) + "</a></details>" +
        '<a href="/sayohatlar.html">' + t("nav.tours") + '</a><a href="/sarguzasht.html">' + t("nav.adv") + '</a><a href="/reyting.html">' + t("nav.rating") + '</a><a href="#" data-chat-open>AI Planner</a></nav>';
  }
  function footer() {
    return '<div class="wrap"><div class="foot-grid">' +
      '<div><a class="logo" href="/" style="border:0;padding:0">UZBEK TOUR HUB</a><p class="muted" style="max-width:320px;margin-top:16px;font-size:.92rem">' + t("foot.about") + "</p>" + langSwitch() + "</div>" +
      "<div><h4>" + t("nav.mons") + "</h4><ul>" + D.cities.slice(0, 4).map(function (c) { return '<li><a href="' + U.cityUrl(c) + '">' + U.esc(L(c.name)) + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><h4 aria-hidden="true">&nbsp;</h4><ul>' + D.cities.slice(4).map(function (c) { return '<li><a href="' + U.cityUrl(c) + '">' + U.esc(L(c.name)) + "</a></li>"; }).join("") + "</ul></div>" +
      "<div><h4>" + t("foot.site") + '</h4><ul><li><a href="/obidalar.html">' + t("allMons", { n: D.monuments.length }) + '</a></li><li><a href="/reyting.html">' + t("nav.rating") + '</a></li><li><a href="/sayohatlar.html">' + t("nav.tours") + '</a></li><li><a href="/sarguzasht.html">' + t("nav.adv") + "</a></li></ul></div>" +
      "</div>" +
      '<div class="foot-bottom"><span>© ' + new Date().getFullYear() + " Uzbek Tour Hub</span><span>" + t("foot.credits") + "</span></div></div>";
  }

  /* ---------- Qidiruv (barcha tillardagi nomlar bo'yicha) ---------- */
  function norm(s) { return String(s).toLowerCase().replace(/[ʻʼ‘’`'ʹ]/g, "").replace(/ё/g, "е").replace(/\s+/g, " "); }
  function allNames(o) { return norm([o.uz, o.ru, o.en].join(" ")); }
  U.norm = norm; U.allNames = allNames;
  function wireSearch(box) {
    var inp = box.querySelector("input"), res = box.querySelector(".search-results"), hl = -1;
    function render() {
      var q = norm(inp.value.trim());
      if (q.length < 2) { res.classList.remove("open"); return; }
      var cs = D.cities.filter(function (c) { return allNames(c.name).indexOf(q) > -1; }).map(function (c) { return { url: U.cityUrl(c), img: U.cityImg(c), t: L(c.name), s: t("city") + " · " + t("n.mons", { n: c.count }) }; });
      var ms = D.monuments.filter(function (m) { return (allNames(m.name) + " " + allNames(U.city(m.city).name)).indexOf(q) > -1; })
        .slice(0, 8).map(function (m) { return { url: U.monUrl(m), img: U.monImg(m), t: L(m.name), s: L(U.city(m.city).name) + " · " + U.catSingle(m.cat) }; });
      var as = D.adventures.filter(function (a) { return allNames(a.title).indexOf(q) > -1; }).slice(0, 4).map(function (a) { return { url: U.advUrl(a), img: U.advImg(a), t: L(a.title), s: t("nav.adv") }; });
      var items = cs.concat(ms, as); hl = -1;
      res.innerHTML = items.length ? items.map(function (x, i) { return '<a href="' + x.url + '" data-i="' + i + '">' + x.img + "<div><b>" + U.esc(x.t) + "</b><span>" + U.esc(x.s) + "</span></div></a>"; }).join("") : '<div style="padding:12px" class="muted">' + t("search.none") + "</div>";
      res.classList.add("open");
    }
    inp.addEventListener("input", render);
    inp.addEventListener("focus", render);
    inp.addEventListener("keydown", function (e) {
      var as = res.querySelectorAll("a");
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && as.length) { e.preventDefault(); hl = (hl + (e.key === "ArrowDown" ? 1 : -1) + as.length) % as.length; as.forEach(function (a, i) { a.classList.toggle("hl", i === hl); }); }
      if (e.key === "Enter") { e.preventDefault(); if (as[hl]) location.href = as[hl].href; else if (inp.value.trim()) location.href = "/obidalar.html?q=" + encodeURIComponent(inp.value.trim()); }
      if (e.key === "Escape") res.classList.remove("open");
    });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) res.classList.remove("open"); });
  }

  /* ---------- AI chat (Claude, /api/chat) ---------- */
  function md(text) {
    var out = [], inList = false;
    U.esc(text).split("\n").forEach(function (line) {
      var l = line.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      if (/^\s*[*-]\s+/.test(line)) { if (!inList) { out.push("<ul>"); inList = true; } out.push("<li>" + l.replace(/^\s*[*-]\s+/, "") + "</li>"); return; }
      if (inList) { out.push("</ul>"); inList = false; }
      if (/^#{1,4}\s/.test(line)) out.push("<h4>" + l.replace(/^#{1,4}\s/, "") + "</h4>");
      else if (line.trim()) out.push('<p style="margin:4px 0">' + l + "</p>");
    });
    if (inList) out.push("</ul>");
    return out.join("");
  }
  var history = [];
  function chat() {
    var fab = document.createElement("button");
    fab.className = "chat-fab"; fab.type = "button"; fab.setAttribute("data-chat-open", ""); fab.setAttribute("aria-label", t("chat.open"));
    fab.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg><span class="tip">' + t("chat.open") + "</span>";
    var box = document.createElement("section");
    box.className = "chat"; box.setAttribute("aria-label", t("chat.title"));
    var sugg = [t("chat.s1"), t("chat.s2"), t("chat.s3")];
    box.innerHTML = '<div class="chat-head"><div><b>Silk Road AI</b><small>' + t("chat.sub") + '</small></div><button type="button" aria-label="' + t("close") + '">✕</button></div>' +
      '<div class="chat-body" aria-live="polite"><div class="msg bot">' + t("chat.hello") + "</div></div>" +
      '<div class="chat-sugg">' + sugg.map(function (s) { return '<button type="button">' + U.esc(s) + "</button>"; }).join("") + "</div>" +
      '<form class="chat-form"><label class="sr-only" for="chat-in">' + t("chat.msg") + '</label><textarea id="chat-in" rows="1" maxlength="2000" placeholder="' + t("chat.ph") + '"></textarea><button type="submit" aria-label="' + t("chat.send") + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
    document.body.appendChild(fab); document.body.appendChild(box);
    var body = box.querySelector(".chat-body"), ta = box.querySelector("textarea"), form = box.querySelector("form"), busy = false;
    function open(prefill) { box.classList.add("open"); document.body.classList.add("chat-open"); if (prefill) { ta.value = prefill; } setTimeout(function () { ta.focus(); }, 100); }
    function shut() { box.classList.remove("open"); document.body.classList.remove("chat-open"); }
    U.openChat = function (text, send) { open(text); if (send && text) form.requestSubmit(); };
    document.addEventListener("click", function (e) {
      var tg = e.target.closest && e.target.closest("[data-chat-open]");
      if (!tg) return;
      e.preventDefault();
      if (box.classList.contains("open") && tg === fab) return shut();
      var q = tg.getAttribute("data-chat-q");
      U.openChat(q || "", !!q);
    });
    box.querySelector(".chat-head button").onclick = shut;
    box.querySelectorAll(".chat-sugg button").forEach(function (b) { b.onclick = function () { ta.value = b.textContent; form.requestSubmit(); }; });
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    function add(cls, html) { var d = document.createElement("div"); d.className = "msg " + cls; d.innerHTML = html; body.appendChild(d); body.scrollTop = body.scrollHeight; return d; }
    form.onsubmit = function (e) {
      e.preventDefault();
      var text = ta.value.trim(); if (!text || busy) return;
      busy = true; ta.value = "";
      add("user", U.esc(text));
      var tp = add("bot typing", t("chat.typing"));
      fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, lang: U.lang, conversationHistory: history.slice(-12) }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.reply) throw new Error(j.error || t("chat.err")); return j.reply; }); })
        .then(function (reply) { tp.className = "msg bot"; tp.innerHTML = md(reply); history.push({ role: "user", content: text }, { role: "assistant", content: reply }); })
        .catch(function (err) { tp.className = "msg bot"; tp.textContent = "⚠️ " + err.message; })
        .then(function () { busy = false; body.scrollTop = body.scrollHeight; });
    };
  }

  /* ---------- Ishga tushirish ---------- */
  U.init = function (active) {
    var h = document.getElementById("site-header"); h.className = "site-header"; h.innerHTML = header(active);
    var f = document.getElementById("site-footer"); f.className = "site-footer"; f.innerHTML = footer();
    var ddBtn = h.querySelector("[data-dd]"), dd = h.querySelector(".dropdown"), li = ddBtn.parentElement, tmr;
    function setDD(o) { dd.classList.toggle("open", o); ddBtn.setAttribute("aria-expanded", o); }
    ddBtn.addEventListener("click", function () { setDD(!dd.classList.contains("open")); });
    li.addEventListener("mouseenter", function () { clearTimeout(tmr); setDD(true); });
    li.addEventListener("mouseleave", function () { tmr = setTimeout(function () { setDD(false); }, 180); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDD(false); });
    document.addEventListener("click", function (e) { if (!li.contains(e.target)) setDD(false); });
    // Mobil menyu: header backdrop-filter fixed elementlar uchun konteyner bo'ladi — menyuni body'ga ko'chiramiz
    var bg = h.querySelector(".burger"), mm = h.querySelector(".mobile-menu");
    document.body.appendChild(mm);
    bg.onclick = function () { var o = !mm.classList.contains("open"); mm.classList.toggle("open", o); bg.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
    mm.addEventListener("click", function (e) { if (e.target.closest("a")) { mm.classList.remove("open"); document.body.style.overflow = ""; } });
    h.querySelectorAll(".search").forEach(wireSearch);
    mm.querySelectorAll(".search").forEach(wireSearch);
    document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-lang]"); if (b && b.dataset.lang !== U.lang) U.setLang(b.dataset.lang); });
    chat();
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" }) : null;
    U.reveal = function (root) { (root || document).querySelectorAll(".reveal:not(.in)").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); }); };
    U.reveal();
  };

  /* ---------- Obida kartasi ---------- */
  U.card = function (m) {
    var c = U.city(m.city);
    return '<article class="card reveal"><a class="img" href="' + U.monUrl(m) + '">' + U.monImg(m) +
      '<span class="tag">' + U.esc(U.catSingle(m.cat)) + "</span>" + (m.imgs[0] && m.imgs[0].c && (m.imgs[0].c.k === "map" || m.imgs[0].c.k === "landmark") ? '<span class="ill-tag">' + (m.imgs[0].c.k === "map" ? "📍 " + t("img.mapShort") : t("img.landmarkShort")) + "</span>" : "") + "</a>" +
      '<h3><a href="' + U.monUrl(m) + '">' + U.esc(L(m.name)) + "</a></h3>" +
      '<div class="line"><span class="yr">' + U.esc(L(m.year)) + "</span>" + U.rateMini(m.id) + "</div>" +
      '<div class="foot"><a class="city" href="' + U.cityUrl(c) + '">' + U.esc(L(c.name)) + '</a><button class="btn-ghost" type="button" data-rate-open="' + m.id + '">' + t("rate.btn") + "</button></div></article>";
  };
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-rate-open]"); if (b) U.openRate(b.getAttribute("data-rate-open")); });
})();

/* ==========================================================================
   Booking.com paneli: Stays · Flights · Car rental · Attractions · Transfers
   Jonli narxlar Booking.com Demand API orqali (/api/hotels, /api/attractions, /api/cars).
   Booking.com sahifalari iframe'ga ruxsat bermaydi (X-Frame-Options: SAMEORIGIN), shuning uchun
   qolgan hollarda Booking.com'ning o'z sahifasi tanlangan parametrlar bilan yangi oynada ochiladi.
   ========================================================================== */
(function () {
  "use strict";
  var U = window.UTH, t = U.t, L = U.L, esc = U.esc;
  var AIRPORT = { samarqand: "SKD", buxoro: "BHK", xiva: "UGC", shahrisabz: "SKD", toshkent: "TAS", qoqon: "FEG", termiz: "TMJ", qoraqalpogiston: "NCU", fargona: "FEG", andijon: "AZN", namangan: "NMA" };
  var AIRPORTS = [["TAS", "Toshkent"], ["SKD", "Samarqand"], ["BHK", "Buxoro"], ["UGC", "Urganch"], ["NCU", "Nukus"], ["TMJ", "Termiz"], ["KSQ", "Qarshi"], ["NVI", "Navoiy"], ["FEG", "Farg'ona"], ["AZN", "Andijon"], ["NMA", "Namangan"]];
  var ATTR_SLUG = { samarqand: "samarkand", buxoro: "bukhara", xiva: "khiva", shahrisabz: "shahrisabz", toshkent: "tashkent", qoqon: "kokand", termiz: "termez", qoraqalpogiston: "nukus", fargona: "fergana", andijon: "andijan", namangan: "namangan" };
  var BLANG = { uz: "en-gb", ru: "ru", en: "en-gb" }[U.lang];
  var ICON = {
    stays: '<path d="M3 18V8m0 6h18v4M3 14V11a2 2 0 012-2h5v5m11 0v-2a3 3 0 00-3-3h-6" />',
    flights: '<path d="M2.5 13.5l7-1.5 5-6.5 2 .5-2.5 6.5 4.5-1 2-2 1 .5-1 3.5-14 3.5-3-1.5z" /><path d="M8 19h9" />',
    cars: '<path d="M4 16v-3l2-5h12l2 5v3M4 16h16M4 16v2m16-2v2" /><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
    attractions: '<circle cx="12" cy="10" r="6"/><path d="M12 4v12M6 10h12M8 6l8 8M16 6l-8 8M9 21l3-5 3 5" />',
    taxi: '<path d="M9 5h6l1 3H8zM5 16v-3l2-5h10l2 5v3M5 16h14M5 16v2m14-2v2" /><circle cx="8" cy="13.5" r="1"/><circle cx="16" cy="13.5" r="1"/>'
  };
  var cfgP = null;
  function cfg() { return cfgP || (cfgP = fetch("/api/config").then(function (r) { return r.json(); }).catch(function () { return {}; })); }
  function aid(u, c) { return c && c.aid ? u + (u.indexOf("?") > -1 ? "&" : "?") + "aid=" + encodeURIComponent(c.aid) : u; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function plus(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function cta(href, title, sub) {
    return '<a class="bk-cta" href="' + esc(href) + '" target="_blank" rel="noopener sponsored"><span class="bk-logo">Booking<b>.com</b></span><span><b>' + esc(title) + "</b><small>" + esc(sub) + '</small></span><span class="bk-go">' + t("bk.open") + " ↗</span></a>";
  }
  function money(v, c) { return U.money(v, c); }

  // ctx: { name, lat, lng, city (shahar obyekti) }
  U.bookingPanel = function (el, ctx) {
    var c = ctx.city, q = ctx.name + ", " + c.name.en + ", Uzbekistan";
    var tabs = [["stays", t("bk.stays")], ["flights", t("bk.flights")], ["cars", t("bk.cars")], ["attractions", t("bk.attractions")], ["taxi", t("bk.taxi")]];
    el.innerHTML = '<div class="bk"><div class="bk-bar"><div class="bk-brand">Booking<b>.com</b></div><div class="bk-tabs" role="tablist">' + tabs.map(function (x, i) {
      return '<button type="button" role="tab" data-bk="' + x[0] + '" class="' + (i ? "" : "on") + '" aria-selected="' + !i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[x[0]] + "</svg>" + esc(x[1]) + "</button>";
    }).join("") + '</div></div><div class="bk-body"><form class="bk-form"></form><div class="bk-res" aria-live="polite"></div></div></div>';
    var form = el.querySelector(".bk-form"), res = el.querySelector(".bk-res"), cur = "stays";
    function field(lbl, html) { return "<label><span>" + lbl + "</span>" + html + "</label>"; }
    function people(name, def) { return '<select name="' + name + '">' + [1, 2, 3, 4, 5, 6, 8].map(function (n) { return "<option" + (n === def ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select>"; }
    function renderForm() {
      var h = "";
      if (cur === "stays") h = field(t("checkin"), '<input type="date" name="ci" min="' + plus(0) + '" value="' + plus(7) + '">') + field(t("checkout"), '<input type="date" name="co" min="' + plus(1) + '" value="' + plus(9) + '">') + field(t("book.people"), people("ad", 2));
      if (cur === "flights") h = field(t("bk.from"), '<select name="from">' + AIRPORTS.map(function (a) { return '<option value="' + a[0] + '"' + (a[0] === (AIRPORT[c.id] === "TAS" ? "SKD" : "TAS") ? " selected" : "") + ">" + a[1] + " (" + a[0] + ")</option>"; }).join("") + "</select>") +
        field(t("bk.to"), '<select name="to">' + AIRPORTS.map(function (a) { return '<option value="' + a[0] + '"' + (a[0] === AIRPORT[c.id] ? " selected" : "") + ">" + a[1] + " (" + a[0] + ")</option>"; }).join("") + "</select>") +
        field(t("book.date"), '<input type="date" name="d" min="' + plus(0) + '" value="' + plus(14) + '">') + field(t("bk.pax"), people("ad", 1));
      if (cur === "cars") h = field(t("bk.pickup"), '<input type="datetime-local" name="pu" value="' + plus(7) + 'T10:00">') + field(t("bk.return"), '<input type="datetime-local" name="do" value="' + plus(10) + 'T10:00">') + field(t("bk.age"), '<input type="number" name="age" min="18" max="99" value="30">');
      if (cur === "attractions") h = field(t("book.date"), '<input type="date" name="d" min="' + plus(0) + '" value="' + plus(7) + '">');
      if (cur === "taxi") h = field(t("bk.from"), '<input type="text" readonly value="' + esc(AIRPORT[c.id] ? t("bk.airport") + " " + AIRPORT[c.id] : L(c.name)) + '">') + field(t("bk.to"), '<input type="text" readonly value="' + esc(ctx.name) + '">') + field(t("book.date"), '<input type="date" name="d" min="' + plus(0) + '" value="' + plus(7) + '">') + field(t("bk.pax"), people("ad", 2));
      form.innerHTML = h + '<button class="bk-btn" type="submit">' + t(cur === "flights" || cur === "taxi" ? "bk.searchOn" : "search.go") + "</button>";
    }
    function list(items, row) { return '<div class="bk-list">' + items.map(row).join("") + "</div>"; }
    function run() {
      var f = form;
      cfg().then(function (C) {
        if (cur === "stays") {
          var url = aid("https://www.booking.com/searchresults.html?ss=" + encodeURIComponent(q) + "&checkin=" + f.ci.value + "&checkout=" + f.co.value + "&group_adults=" + f.ad.value + "&no_rooms=1&group_children=0&lang=" + BLANG, C);
          res.innerHTML = '<div class="svc-loading">' + t("loading") + "</div>";
          fetch("/api/hotels?city=" + encodeURIComponent(c.booking) + (ctx.lat ? "&lat=" + ctx.lat + "&lng=" + ctx.lng : "") + "&checkin=" + f.ci.value + "&checkout=" + f.co.value + "&adults=" + f.ad.value + "&lang=" + U.lang)
            .then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (j) {
              var hs = (j && j.live && j.hotels) || [];
              res.innerHTML = (hs.length ? list(hs, function (h) {
                var d = ctx.lat && h.lat ? U.fmtKm(U.km(ctx, h)) : "";
                return '<a class="bk-item" href="' + esc(h.url) + '" target="_blank" rel="noopener sponsored">' + (h.photo ? '<img src="' + esc(h.photo) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : '<span class="bk-ph"></span>') +
                  "<div><b>" + esc(h.name) + "</b><small>" + (h.stars ? "★".repeat(h.stars) + " " : "") + (h.reviewScore ? '<span class="bk-score">' + h.reviewScore + "</span> " + (h.reviews ? t("n.reviews", { n: h.reviews }) : "") : "") + "</small>" +
                  "<small>" + (d ? "📍 " + t("bk.fromSite", { d: d }) + " · " : "") + (h.freeCancellation ? t("freeCancel") : "") + (h.breakfast ? " · " + t("bk.breakfast") : "") + "</small></div>" +
                  '<div class="bk-price"><small>' + t("nightsTotal", { n: j.nights }) + "</small><b>" + money(h.total, h.currency) + "</b><span>" + t("bk.see") + "</span></div></a>";
              }) : "") + cta(url, t("bk.staysCta", { n: ctx.name }), f.ci.value + " — " + f.co.value + " · " + t("book.people") + ": " + f.ad.value);
            });
        }
        if (cur === "attractions") {
          var aurl = aid("https://www.booking.com/attractions/searchresults/uz/" + (ATTR_SLUG[c.id] || "samarkand") + ".html?lang=" + BLANG, C);
          res.innerHTML = '<div class="svc-loading">' + t("loading") + "</div>";
          fetch("/api/attractions?city=" + encodeURIComponent(c.booking) + (ctx.lat ? "&lat=" + ctx.lat + "&lng=" + ctx.lng : "") + "&lang=" + U.lang).then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (j) {
            var as = (j && j.live && j.items) || [];
            res.innerHTML = (as.length ? list(as, function (a) {
              return '<a class="bk-item" href="' + esc(a.url) + '" target="_blank" rel="noopener sponsored">' + (a.photo ? '<img src="' + esc(a.photo) + '" alt="" loading="lazy">' : '<span class="bk-ph"></span>') + "<div><b>" + esc(a.name) + "</b><small>" + (a.rating ? '<span class="bk-score">' + a.rating + "</span> " + (a.reviews ? t("n.reviews", { n: a.reviews }) : "") : "") + (a.freeCancel ? " · " + t("freeCancel") : "") + '</small></div><div class="bk-price"><small>' + t("from") + "</small><b>" + money(a.price, a.currency) + "</b><span>" + t("bk.see") + "</span></div></a>";
            }) : "") + cta(aurl, t("bk.attrCta", { c: L(c.name) }), t("bk.attrSub"));
          });
        }
        if (cur === "cars") {
          var curl = aid("https://www.booking.com/cars/index.html?lang=" + BLANG, C);
          var pu = f.pu.value + ":00", dro = f.do.value + ":00";
          res.innerHTML = '<div class="svc-loading">' + t("loading") + "</div>";
          (ctx.lat ? fetch("/api/cars?lat=" + ctx.lat + "&lng=" + ctx.lng + "&pickup=" + encodeURIComponent(pu) + "&dropoff=" + encodeURIComponent(dro) + "&age=" + f.age.value + "&lang=" + U.lang).then(function (r) { return r.json(); }).catch(function () { return {}; }) : Promise.resolve({})).then(function (j) {
            var cs = (j && j.live && j.items) || [];
            res.innerHTML = (cs.length ? list(cs, function (x) {
              return '<a class="bk-item" href="' + esc(x.url) + '" target="_blank" rel="noopener sponsored"><span class="bk-ph car"></span><div><b>' + esc(x.categories.map(function (k) { return k.replace(/_/g, " "); }).join(" · ") || t("bk.cars")) + "</b><small>" + (x.freeCancel ? t("freeCancel") : "") + (x.mileage === "unlimited" ? " · " + t("bk.unlimited") : "") + '</small></div><div class="bk-price"><small>' + t("bk.total") + "</small><b>" + money(x.price, x.currency) + "</b><span>" + t("bk.see") + "</span></div></a>";
            }) : "") + cta(curl, t("bk.carsCta", { c: L(c.name) }), f.pu.value.replace("T", " ") + " → " + f.do.value.replace("T", " "));
          });
        }
        if (cur === "flights") {
          var from = f.from.value, to = f.to.value;
          var furl = aid("https://flights.booking.com/flights/" + from + "-" + to + "/?type=ONEWAY&adults=" + f.ad.value + "&cabinClass=ECONOMY&depart=" + f.d.value + "&lang=" + BLANG, C);
          window.open(furl, "_blank", "noopener");
          res.innerHTML = cta(furl, t("bk.flightsCta", { a: from, b: to }), f.d.value + " · " + t("bk.pax") + ": " + f.ad.value);
        }
        if (cur === "taxi") {
          var turl = aid("https://www.booking.com/taxi/index.html?lang=" + BLANG, C);
          window.open(turl, "_blank", "noopener");
          res.innerHTML = cta(turl, t("bk.taxiCta", { n: ctx.name }), f.d.value + " · " + t("bk.pax") + ": " + f.ad.value);
        }
      });
    }
    el.querySelectorAll("[data-bk]").forEach(function (b) {
      b.onclick = function () {
        cur = b.dataset.bk;
        el.querySelectorAll("[data-bk]").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
        renderForm(); res.innerHTML = "";
        if (cur === "stays" || cur === "attractions" || cur === "cars") run();
        else res.innerHTML = '<p class="bk-hint">' + t("bk.hint." + cur) + "</p>";
      };
    });
    form.onsubmit = function (e) { e.preventDefault(); run(); };
    renderForm(); run();
  };
})();

/* ==========================================================================
   Admin panel o'zgarishlarini qo'llash (/api/content) va sahifani ishga tushirish
   ========================================================================== */
(function () {
  "use strict";
  var U = window.UTH, D = window.UTH_DATA;
  U.hidden = {}; D.settings = {};
  function merge(t, p, keys) {
    keys.forEach(function (k) {
      if (p[k] === undefined) return;
      t[k] = p[k] && typeof p[k] === "object" && t[k] && typeof t[k] === "object" ? Object.assign({}, t[k], p[k]) : p[k];
    });
  }
  function cover(o, url) { if (url) o.imgs = [{ s: url, m: url, c: { a: "Uzbek Tour Hub" } }].concat((o.imgs || []).filter(function (i) { return i.s !== url; })); }
  function prune(arr, test) { for (var i = arr.length - 1; i >= 0; i--) if (test(arr[i])) { U.hidden[arr[i].id] = 1; arr.splice(i, 1); } }
  U.applyContent = function (o) {
    o = o || {};
    (o.newMons || []).forEach(function (n) {
      if (D.monuments.some(function (m) { return m.id === n.id; })) return;
      var m = Object.assign({ unesco: [], imgs: [], short: {}, text: {}, year: {}, builder: {}, pid: null, lat: null, lng: null }, n);
      m.isNew = true; cover(m, n.cover); D.monuments.push(m);
    });
    D.monuments.forEach(function (m) { var p = (o.mons || {})[m.id]; if (p) { merge(m, p, ["name", "short", "text", "year", "builder", "base", "featured", "hidden"]); cover(m, p.cover); } });
    prune(D.monuments, function (m) { return m.hidden; });
    D.cities.forEach(function (c) {
      var p = (o.cities || {})[c.id]; if (p) { merge(c, p, ["name", "intro"]); cover(c, p.cover); }
      c.count = D.monuments.filter(function (m) { return m.city === c.id; }).length;
      if (!c.imgs.length) { var m = D.monuments.find(function (x) { return x.city === c.id && x.imgs.length; }); if (m) c.imgs = m.imgs.slice(0, 1); }
    });
    // Rasmsiz yangi obida — o'z hududining xaritasi (boshqa obida surati qo'yilmaydi)
    D.monuments.forEach(function (m) {
      if (m.imgs.length) return;
      var f = "/images/w/map-region-" + m.city;
      m.imgs = [{ s: f + "-s.webp", m: f + ".webp", c: { a: "Natural Earth · Uzbek Tour Hub", l: "Public domain", u: "https://www.naturalearthdata.com/", k: "map", r: m.city } }];
      var c = U.city(m.city), cv = c && c.imgs[0];
      if (cv) m.imgs.unshift({ s: cv.s, m: cv.m, c: Object.assign({}, cv.c, { k: "landmark", r: c.id }) });
    });
    D.adventures.forEach(function (a) { var p = (o.adv || {})[a.id]; if (p) { merge(a, p, ["title", "desc", "hidden"]); cover(a, p.cover); } });
    prune(D.adventures, function (a) { return a.hidden; });
    (D.tours || []).forEach(function (x) { var p = (o.tours || {})[x.id]; if (p) merge(x, p, ["title", "desc", "duration", "hidden"]); });
    if (D.tours) prune(D.tours, function (x) { return x.hidden; });
    D.settings = o.settings || {};
  };
  function extras() {
    var S = D.settings, L = U.L, esc = U.esc;
    if (S.announceOn && L(S.announce)) {
      var bar = document.createElement("div"); bar.className = "announce";
      bar.innerHTML = (S.announceUrl ? '<a href="' + esc(S.announceUrl) + '">' : "<span>") + esc(L(S.announce)) + (S.announceUrl ? " →</a>" : "</span>");
      document.body.insertBefore(bar, document.body.firstChild);
    }
    var f = document.querySelector(".site-footer .foot-grid > div");
    if (f && (S.phone || S.email || S.telegram || L(S.address))) {
      var c = document.createElement("ul"); c.className = "foot-contact";
      c.innerHTML = (S.phone ? '<li><a href="tel:' + esc(S.phone.replace(/[^\d+]/g, "")) + '">☎ ' + esc(S.phone) + "</a></li>" : "") +
        (S.email ? '<li><a href="mailto:' + esc(S.email) + '">✉ ' + esc(S.email) + "</a></li>" : "") +
        (S.telegram ? '<li><a href="https://t.me/' + esc(S.telegram.replace(/^@/, "")) + '" target="_blank" rel="noopener">✈ @' + esc(S.telegram.replace(/^@/, "")) + "</a></li>" : "") +
        (L(S.address) ? "<li>📍 " + esc(L(S.address)) + "</li>" : "");
      f.appendChild(c);
    }
    if (S.chatOff) document.querySelectorAll(".chat-fab,[data-chat-open]").forEach(function (e) { e.style.display = "none"; });
  }
  U.boot = function (active, fn) {
    var done = false, c = null;
    function go(o) {
      if (done) return; done = true;
      try { U.applyContent(o); } catch (e) { console.error(e); }
      var id = document.body.getAttribute("data-id");
      if (id && U.hidden[id]) { location.replace(/\/sarguzasht\//.test(location.pathname) ? "/sarguzasht.html" : "/obidalar.html"); return; }
      U.init(active); try { extras(); } catch (e) {}
      if (fn) fn();
    }
    try { c = JSON.parse(sessionStorage.getItem("uth_ov") || "null"); } catch (e) {}
    if (c && Date.now() - c.t < 60000) return go(c.v);
    setTimeout(function () { go(c && c.v); }, 1500);
    fetch("/api/content").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var v = (j && j.ok && j.content) || {};
      try { sessionStorage.setItem("uth_ov", JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
      go(v);
    }).catch(function () { go(c && c.v); });
  };
})();
