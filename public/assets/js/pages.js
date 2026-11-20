/* ==========================================================================
   Uzbek Tour Hub — sahifalar
   ========================================================================== */
(function () {
  "use strict";
  var D = window.UTH_DATA, U = window.UTH, t = U.t, L = U.L, esc = U.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = (window.UTHPages = {});
  // Davlat muhofazasidagi moddiy madaniy meros obyektlari soni (Madaniy meros agentligi; UzA, 2026-06-01)
  var OFFICIAL = 8437;
  var ICO = {
    star: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
    boot: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M5 3h6v8l6 2.5c1.8.7 3 2.4 3 4.4V20H4l1-6z"/></svg>'
  };
  function crumbs(items) {
    return '<nav class="breadcrumbs" aria-label="breadcrumb"><a href="/">' + t("nav.home") + "</a>" + items.map(function (x) {
      return "<span>/</span>" + (x[1] ? '<a href="' + x[1] + '">' + esc(x[0]) + "</a>" : '<span aria-current="page">' + esc(x[0]) + "</span>");
    }).join("") + "</nav>";
  }
  function setMeta(title, desc) {
    document.title = title + " — Uzbek Tour Hub";
    var m = document.querySelector('meta[name="description"]'); if (m && desc) m.setAttribute("content", desc);
  }
  function ranked(list) {
    return list.map(function (m) { return { m: m, r: U.ratings.get(m.id) }; })
      .sort(function (a, b) { return b.r.avg - a.r.avg || b.r.count - a.r.count; });
  }
  function topList(el, list, n) {
    var rows = ranked(list).slice(0, n);
    el.innerHTML = rows.map(function (x, i) {
      return '<a class="top-row" href="' + U.monUrl(x.m) + '"><span class="rank">' + (i + 1) + '</span><span class="av">' + U.monImg(x.m) + "</span><span><b>" + esc(L(x.m.name)) + "</b><small>" + esc(L(U.city(x.m.city).name)) + (x.r.count ? " · " + t("n.votes", { n: x.r.count }) : "") + '</small></span><span class="score">★ ' + x.r.avg.toFixed(1) + "</span></a>";
    }).join("");
  }
  // Leaflet xaritasi; Leaflet yuklanmasa — Google iframe
  function leaflet(el, points, center, zoom) {
    if (!window.L || !points.length && !center) {
      var c = center || points[0];
      el.innerHTML = '<iframe title="map" loading="lazy" src="https://maps.google.com/maps?q=' + c.lat + "," + c.lng + "&z=" + (zoom || 12) + '&output=embed"></iframe>';
      return null;
    }
    var map = window.L.map(el, { scrollWheelZoom: false });
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
    var layer = window.L.layerGroup().addTo(map);
    function draw(pts) {
      layer.clearLayers();
      var b = [];
      pts.forEach(function (p) {
        var mk = p.color ? window.L.circleMarker([p.lat, p.lng], { radius: 8, color: "#fff", weight: 2, fillColor: p.color, fillOpacity: 1 }) : window.L.marker([p.lat, p.lng]);
        mk.addTo(layer).bindPopup(p.html); b.push([p.lat, p.lng]);
      });
      if (b.length > 1) map.fitBounds(b, { padding: [40, 40], maxZoom: 15 });
      else map.setView(b[0] || [center.lat, center.lng], zoom || 14);
    }
    draw(points);
    return { map: map, draw: draw };
  }
  var MONTHS = function (i) { return t("m" + i); };
  var NOW_M = new Date().getMonth() + 1;

  /* ================= BOSH SAHIFA ================= */
  P.home = function () {
    var M = D.monuments;
    // Qahramon galereyasi: UNESCO nishoni ortida avtomatik almashinadi; bosilganda tegishli sahifa ochiladi
    var slides = ["registon", "kalta-minor", "poi-kalon", "shohi-zinda", "oqsaroy", "somoniy", "ichan-qala"].map(U.mon).filter(function (m) { return m.imgs.length && U.isWH(m.unesco); })
      .map(function (m) { return { url: U.monUrl(m), img: m.imgs[0], name: L(m.name), sub: L(U.city(m.city).name), year: L(m.year), id: m.id, icon: m.cat }; });
    $("#hero").innerHTML = '<div class="wrap hero-grid"><div class="hero-copy">' +
      '<span class="dots" aria-hidden="true"></span>' +
      '<h1 class="display h1">' + t("hero.h1") + "</h1>" +
      '<p class="lead">' + t("hero.lead", { n: U.num(OFFICIAL), m: M.length }) + "</p>" +
      '<div class="hero-cta"><a class="btn btn-primary" href="/obidalar.html">' + t("hero.cta") + '</a><a class="btn btn-outline" href="/sarguzasht.html">' + t("nav.adv") + "</a></div>" +
      '<div class="stats"><div class="stat"><b>' + U.num(OFFICIAL) + "</b><span>" + t("stat.official") + '</span></div><div class="stat"><b>14</b><span>' + t("stat.regions") + '</span></div><div class="stat"><b>' + M.length + "</b><span>" + t("stat.onsite") + '</span></div></div><p class="stat-src">' + t("stat.src") + "</p></div>" +
      '<div class="hero-card-stack"><div class="ghost g2"></div><div class="ghost g1"></div>' +
      '<a class="hero-card" href="' + slides[0].url + '" aria-live="polite"><div class="slides">' + slides.map(function (s, i) {
        return '<div class="slide' + (i ? "" : " on") + '">' + U.pic(s.img, s.name, "dome", { big: true, eager: true, sizes: "(max-width: 900px) 92vw, 520px" }) + "</div>";
      }).join("") + "</div>" +
      '<div class="top"><h3 data-s="name">' + esc(slides[0].name) + '</h3><div class="who">' + ICO.pin + '<span data-s="sub">' + esc(slides[0].sub) + "</span></div></div>" +
      '<div class="bottom"><div><small>' + t("rating") + '</small><b data-s="rate">—</b></div><div class="right"><small>' + t("built") + '</small><b data-s="year" class="nowrap">' + esc(slides[0].year) + "</b></div></div></a>" +
      '<button type="button" class="hero-nav prev" aria-label="' + t("prev") + '">‹</button><button type="button" class="hero-nav next" aria-label="' + t("next") + '">›</button>' +
      '<div class="slide-dots" role="tablist">' + slides.map(function (s, i) { return '<button type="button" role="tab" aria-label="' + esc(s.name) + '"' + (i ? "" : ' class="on"') + "></button>"; }).join("") + "</div>" +
      '<div class="badge-spin" aria-hidden="true"><svg class="ring" viewBox="0 0 100 100"><defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs><text font-size="9.5" font-weight="700" letter-spacing="2.4" fill="#141416"><textPath href="#c">' + t("badge") + " · " + t("badge") + " ·</textPath></text></svg>" +
      '<svg class="core" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 5v2H3V7zM5 10h2v8H5zm4 0h2v8H9zm4 0h2v8h-2zm4 0h2v8h-2zM3 19h18v2H3z"/></svg></div></div></div>';
    (function slider() {
      var card = $(".hero-card"), els = $$(".hero-card .slide"), dots = $$(".slide-dots button"), g1 = $(".ghost.g1"), g2 = $(".ghost.g2"), i = 0, tm;
      function ghost(el, k) { var s = slides[k % slides.length]; el.style.backgroundImage = "url(" + (s.img.m || s.img.s) + ")"; }
      function show(k, dir) {
        i = (k + slides.length) % slides.length;
        els.forEach(function (e, j) { e.classList.toggle("on", j === i); e.classList.remove("in-l", "in-r"); if (j === i && dir) { void e.offsetWidth; e.classList.add(dir > 0 ? "in-r" : "in-l"); } });
        dots.forEach(function (d, j) { d.classList.toggle("on", j === i); d.setAttribute("aria-selected", j === i); });
        var s = slides[i]; card.href = s.url;
        $('[data-s="name"]').textContent = s.name; $('[data-s="sub"]').textContent = s.sub; $('[data-s="year"]').textContent = s.year;
        var r = U.ratings.get(s.id); $('[data-s="rate"]').innerHTML = "★ " + r.avg.toFixed(1) + (r.count ? ' <small style="display:inline">(' + r.count + ")</small>" : "");
        ghost(g1, i + 1); ghost(g2, i + 2);
      }
      function play() { clearInterval(tm); if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) tm = setInterval(function () { show(i + 1); }, 5000); }
      dots.forEach(function (d, j) { d.onclick = function () { show(j, j > i ? 1 : -1); play(); }; });
      function step(d) { show(i + d, d); play(); }
      $(".hero-nav.prev").onclick = function () { step(-1); };
      $(".hero-nav.next").onclick = function () { step(1); };
      // Sensor/sichqoncha bilan surish
      var x0 = null, y0 = 0, dx = 0, moved = false;
      card.addEventListener("pointerdown", function (e) { if (e.button > 0 || e.pointerType === "touch") return; x0 = e.clientX; y0 = e.clientY; dx = 0; moved = false; clearInterval(tm); });
      card.addEventListener("pointermove", function (e) {
        if (x0 === null) return; dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) { moved = true; card.classList.add("drag"); try { card.setPointerCapture(e.pointerId); } catch (_) {} }
        if (moved) els[i].style.transform = "translateX(" + dx * 0.35 + "px)";
      });
      function end() {
        if (x0 === null) return; x0 = null; card.classList.remove("drag"); els[i].style.transform = "";
        if (moved && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); else play();
      }
      card.addEventListener("pointerup", end); card.addEventListener("pointercancel", end);
      // Telefon sensori: alohida touch hodisalari (iOS Safari va Android uchun ishonchli)
      card.addEventListener("touchstart", function (e) { var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; dx = 0; moved = false; clearInterval(tm); }, { passive: true });
      card.addEventListener("touchmove", function (e) {
        if (x0 === null) return; var p = e.touches[0]; dx = p.clientX - x0;
        if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(p.clientY - y0)) { moved = true; card.classList.add("drag"); }
        if (moved) { e.preventDefault(); els[i].style.transform = "translateX(" + dx * 0.35 + "px)"; }
      }, { passive: false });
      card.addEventListener("touchend", end); card.addEventListener("touchcancel", end);
      card.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
      card.addEventListener("dragstart", function (e) { e.preventDefault(); });
      // Trackpad/sichqoncha g'ildiragi bilan gorizontal aylantirish (Shift + g'ildirak ham)
      var wl = 0;
      card.addEventListener("wheel", function (e) {
        var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (!d) return; e.preventDefault();
        if (Date.now() - wl > 600 && Math.abs(d) > 12) { wl = Date.now(); step(d > 0 ? 1 : -1); }
      }, { passive: false });
      card.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } });
      card.addEventListener("mouseenter", function () { clearInterval(tm); });
      card.addEventListener("mouseleave", play);
      P._heroShow = function () { show(i); };
      show(0); play();
      // Telefonda galereya ko'rinib turganda chat tugmasi kartani yopmasin
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { document.body.classList.toggle("hero-vis", es[0].isIntersecting); }, { threshold: 0.25 }).observe($(".hero-card-stack"));
    })();

    $("#features").innerHTML = '<div class="wrap features"><h2 class="h2">' + t("feat.h2") + "</h2>" +
      '<div class="feature reveal"><span class="ico">' + ICO.pin + "</span><div><h3>" + t("feat.1t") + "</h3><p>" + t("feat.1p") + "</p></div></div>" +
      '<div class="feature reveal"><span class="ico">' + ICO.star + "</span><div><h3>" + t("feat.2t") + "</h3><p>" + t("feat.2p") + "</p></div></div>" +
      '<div class="feature reveal"><span class="ico">' + ICO.globe + "</span><div><h3>" + t("feat.3t") + "</h3><p>" + t("feat.3p") + "</p></div></div></div>";

    var feat = ["bibixonim", "gur-amir", "ichan-qala", "labi-hovuz"].map(U.mon), big = feat[0];
    $("#showcase").innerHTML = '<div class="wrap showcase">' +
      '<a class="big-card reveal" href="' + U.monUrl(big) + '"><div class="img">' + U.monImg(big, { big: true, sizes: "(max-width: 900px) 92vw, 560px" }) + '</div><div class="meta"><div><h3>' + esc(L(big.name)) + '</h3><span class="muted">' + esc(L(U.city(big.city).name)) + " · " + esc(L(big.year)) + '</span></div><div class="right"><small class="muted">' + t("rating") + "</small><div>" + U.rateMini(big.id) + "</div></div></div></a>" +
      '<div class="mini-list">' + feat.slice(1).map(function (m) {
        return '<div class="mini reveal"><a class="img" href="' + U.monUrl(m) + '">' + U.monImg(m) + '</a><div><h4><a href="' + U.monUrl(m) + '">' + esc(L(m.name)) + '</a></h4><div class="chip-row"><span class="chip green">' + esc(L(U.city(m.city).name)) + '</span><span class="chip nowrap">' + esc(L(m.year)) + '</span></div><button class="btn btn-outline btn-xs" type="button" data-rate-open="' + m.id + '">' + t("rate.btn") + "</button></div></div>";
      }).join("") + "</div>" +
      '<div class="top-list"><h3 class="h3">' + t("top.h") + '</h3><span class="sub">' + t("top.sub") + '</span><div id="top5"></div><a class="btn-ghost" href="/reyting.html" style="display:inline-block;margin-top:16px">' + t("top.all") + " →</a></div></div>";

    var cols = ["samarqand", "buxoro", "xiva"].map(U.city);
    $("#collections").innerHTML = '<div class="wrap"><div class="section-head"><h2 class="h2">' + t("col.h2") + '</h2><a class="btn btn-outline btn-sm" href="/obidalar.html">' + t("allMons", { n: M.length }) + '</a></div><div class="collections">' +
      cols.map(function (c) {
        var ms = U.monsOf(c.id).filter(function (m) { return m.imgs.length && m.imgs[0].s !== (c.imgs[0] || {}).s && m.id !== "registon"; }).slice(0, 3);
        return '<a class="collection reveal" href="' + U.cityUrl(c) + '"><div class="collage"><div class="main">' + U.cityImg(c) + '</div><div class="side">' + ms.map(function (m) { return "<div>" + U.monImg(m) + "</div>"; }).join("") + "</div></div>" +
          "<h3>" + esc(L(c.name)) + '</h3><div class="row"><span class="muted" style="font-size:.88rem">' + esc(L(c.region)) + '</span><span class="pill">' + t("n.mons", { n: c.count }) + "</span></div></a>";
      }).join("") + "</div></div>";

    var now = D.adventures.filter(function (a) { return a.months.indexOf(NOW_M) > -1; }).slice(0, 4);
    $("#advnow").innerHTML = '<div class="wrap"><div class="section-head"><div><h2 class="h2">' + t("now.h2") + '</h2><p class="muted" style="margin-top:6px">' + t("now.sub", { m: MONTHS(NOW_M) }) + '</p></div><a class="btn btn-outline btn-sm" href="/sarguzasht.html">' + t("adv.all") + '</a></div><div class="adv-grid">' + (now.length ? now.map(advCard).join("") : '<div class="empty">' + t("adv.noneNow") + "</div>") + "</div></div>";

    var tl = ["kalta-minor", "oqsaroy", "somoniy"].map(U.mon);
    $("#ai").innerHTML = '<div class="wrap split"><div class="collage-free reveal">' +
      tl.map(function (m, i) { return '<div class="tile t' + (i + 1) + '">' + U.monImg(m) + "</div>"; }).join("") + "</div>" +
      '<div class="reveal"><h2 class="h2">' + t("ai.h2") + '</h2><p class="lead" style="margin:20px 0 32px">' + t("ai.p") + "</p>" +
      '<button class="btn btn-primary" type="button" data-chat-open>' + t("ai.cta") + "</button></div></div>";

    var cats = [["all", t("all")]].concat(Object.keys(D.cats).map(function (k) { return [k, U.catName(k)]; }));
    $("#discover").innerHTML = '<div class="wrap"><div class="section-head"><h2 class="h2">' + t("disc.h2") + '</h2></div>' +
      '<div class="toolbar"><div class="tabs" role="tablist">' + cats.map(function (c, i) { return '<button class="tab' + (i ? "" : " on") + '" role="tab" data-cat="' + c[0] + '">' + esc(c[1]) + "</button>"; }).join("") + '</div><a class="btn btn-outline btn-sm" href="/obidalar.html">' + t("allMons", { n: M.length }) + '</a></div><div class="grid" id="disc-grid"></div></div>';
    function disc(cat) {
      var list = M.filter(function (m) { return cat === "all" || m.cat === cat; }).slice(0, 8);
      $("#disc-grid").innerHTML = list.map(U.card).join(""); U.reveal($("#disc-grid"));
    }
    $$("#discover .tab").forEach(function (b) { b.onclick = function () { $$("#discover .tab").forEach(function (x) { x.classList.toggle("on", x === b); }); disc(b.dataset.cat); }; });
    disc("all");

    function paintRatings() { topList($("#top5"), M, 5); P._heroShow(); U.refreshRateMinis(); }
    U.ratings.load().then(paintRatings);
    document.addEventListener("uth:rated", paintRatings);
    U.reveal();
  };

  /* ================= BARCHA OBIDALAR ================= */
  P.list = function () {
    var st = { city: U.qs("c") || "all", cat: U.qs("cat") || "all", q: U.qs("q") || "", sort: "default" };
    setMeta(t("list.h1"), t("list.lead", { n: U.num(OFFICIAL), m: D.monuments.length }));
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.mons")]]) +
      '<h1 class="display h1">' + t("list.h1") + '</h1><p class="lead" style="margin-top:16px">' + t("list.lead", { n: U.num(OFFICIAL), m: D.monuments.length }) + "</p></section>" +
      '<section class="wrap" style="padding-bottom:40px"><div class="tabs" id="city-tabs" style="margin-bottom:20px"><button class="tab" data-city="all">' + t("allCities") + "</button>" + D.cities.map(function (c) { return '<button class="tab" data-city="' + c.id + '">' + esc(L(c.name)) + "</button>"; }).join("") + "</div>" +
      '<div class="toolbar"><div class="left"><select class="select" id="f-cat" aria-label="' + t("type") + '"><option value="all">' + t("allTypes") + "</option>" + Object.keys(D.cats).map(function (k) { return '<option value="' + k + '">' + esc(U.catName(k)) + "</option>"; }).join("") + "</select>" +
      '<select class="select" id="f-sort" aria-label="' + t("sort") + '"><option value="default">' + t("sort.def") + '</option><option value="rating">' + t("sort.rating") + '</option><option value="name">' + t("sort.name") + "</option></select>" +
      '<input class="input" id="f-q" type="search" placeholder="' + t("search.byName") + '" value="' + esc(st.q) + '" aria-label="' + t("search.byName") + '"></div><span class="muted" id="f-count"></span></div>' +
      '<div class="grid" id="list-grid"></div></section>';
    $("#f-cat").value = st.cat;
    function render() {
      $$("#city-tabs .tab").forEach(function (b) { b.classList.toggle("on", b.dataset.city === st.city); });
      var q = U.norm(st.q.trim());
      var list = D.monuments.filter(function (m) { return (st.city === "all" || m.city === st.city) && (st.cat === "all" || m.cat === st.cat) && (!q || U.allNames(m.name).indexOf(q) > -1); });
      if (st.sort === "name") list.sort(function (a, b) { return L(a.name).localeCompare(L(b.name), U.lang); });
      if (st.sort === "rating") list.sort(function (a, b) { var x = U.ratings.get(a.id), y = U.ratings.get(b.id); return y.avg - x.avg || y.count - x.count; });
      $("#f-count").textContent = t("n.mons", { n: list.length });
      $("#list-grid").innerHTML = list.length ? list.map(U.card).join("") : '<div class="empty" style="grid-column:1/-1">' + t("list.empty") + "</div>";
      U.reveal($("#list-grid"));
      var p = new URLSearchParams(); if (st.city !== "all") p.set("c", st.city); if (st.cat !== "all") p.set("cat", st.cat); if (st.q) p.set("q", st.q);
      history.replaceState(null, "", "/obidalar.html" + (p.toString() ? "?" + p : ""));
    }
    $$("#city-tabs .tab").forEach(function (b) { b.onclick = function () { st.city = b.dataset.city; render(); }; });
    $("#f-cat").onchange = function () { st.cat = this.value; render(); };
    $("#f-sort").onchange = function () { st.sort = this.value; render(); };
    $("#f-q").oninput = function () { st.q = this.value; render(); };
    render();
    U.ratings.load().then(function () { st.sort === "rating" ? render() : U.refreshRateMinis(); });
    document.addEventListener("uth:rated", function () { U.refreshRateMinis(); });
  };

  /* ================= SHAHAR ================= */
  var SVC = [
    { k: "restaurant", ico: "🍽", color: "#c2410c" },
    { k: "hospital", ico: "🏥", color: "#b91c1c" },
    { k: "bank", ico: "🏦", color: "#00813b" },
    { k: "tours", ico: "🧭", color: "#0b7a75" }
  ];
  P.city = function () {
    var id = document.body.getAttribute("data-id") || U.qs("c");
    var c = U.city(id) || D.cities[0], ms = U.monsOf(c.id);
    setMeta(t("city.title", { c: L(c.name) }), L(c.intro));
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.mons"), "/obidalar.html"], [L(c.name)]]) +
      '<div class="city-hero"><div><span class="eyebrow">' + esc(L(c.region)) + '</span><h1 class="display h1" style="margin-top:10px">' + esc(L(c.name)) + '</h1><p class="lead" style="margin-top:18px">' + esc(L(c.intro)) + "</p>" +
      '<div class="facts"><div class="fact"><small>' + t("stat.onsite") + "</small><b>" + ms.length + '</b></div><div class="fact"><small>' + t("avgRating") + '</small><b id="city-avg">—</b></div></div>' +
      U.unescoBlock(c.unesco) +
      '<div class="btn-row"><a class="btn btn-primary btn-sm" href="#obidalar">' + t("city.seeMons") + '</a><a class="btn btn-outline btn-sm" href="#xizmatlar">' + t("city.services") + "</a></div></div>" +
      '<div class="cover gal-mini">' + U.cityImg(c, { big: true, eager: true }) + (c.imgs[0] && c.imgs[0].c ? '<span class="credit">📷 ' + U.credit(c.imgs[0]) + "</span>" : "") + "</div></div></section>" +
      '<section class="section section-soft" id="obidalar"><div class="wrap"><div class="section-head"><h2 class="h2">' + t("city.monsH", { c: L(c.name) }) + '</h2><span class="muted">' + t("sortedByRating") + '</span></div><div class="grid" id="city-grid"></div></div></section>' +
      '<section class="section section-soft" id="booking"><div class="wrap"><div class="section-head"><div><h2 class="h2">' + t("bk.h2", { c: L(c.name) }) + '</h2><p class="muted" style="margin-top:6px;max-width:640px">' + t("bk.sub") + '</p></div></div><div id="bk-panel"></div></div></section>' +
      '<section class="section" id="xizmatlar"><div class="wrap"><div class="section-head"><div><h2 class="h2">' + t("svc.h2") + '</h2><p class="muted" style="margin-top:6px;max-width:640px">' + t("svc.sub") + '</p></div></div>' +
      '<div class="tabs svc-tabs" role="tablist">' + SVC.map(function (s, i) { return '<button class="tab' + (i ? "" : " on") + '" role="tab" data-svc="' + s.k + '"><span aria-hidden="true">' + s.ico + "</span> " + t("svc." + s.k) + "</button>"; }).join("") + "</div>" +
      '<div class="svc-layout"><div id="svc-body" class="svc-body" aria-live="polite"></div><div class="map-box sticky" id="city-map"></div></div></div></section>';
    var shown = 24;
    function grid() {
      var list = ms.slice().sort(function (a, b) { var x = U.ratings.get(a.id), y = U.ratings.get(b.id); return y.avg - x.avg || y.count - x.count; });
      $("#city-grid").innerHTML = list.slice(0, shown).map(U.card).join("") + (list.length > shown ? '<div class="more-row"><button class="btn btn-outline btn-sm" type="button" id="more-mons">' + t("showMore", { n: list.length - shown }) + "</button></div>" : "");
      U.reveal($("#city-grid"));
      var mb = $("#more-mons"); if (mb) mb.onclick = function () { shown += 48; grid(); };
      var avg = ms.reduce(function (s, m) { return s + U.ratings.get(m.id).avg; }, 0) / (ms.length || 1);
      $("#city-avg").textContent = "★ " + avg.toFixed(1);
    }
    grid(); U.ratings.load().then(grid);
    document.addEventListener("uth:rated", grid);

    var monPts = ms.filter(function (m) { return m.lat != null; }).map(function (m) { return { lat: m.lat, lng: m.lng, html: "<b>" + esc(L(m.name)) + "</b><br>" + esc(L(m.year)) + '<br><a href="' + U.monUrl(m) + '">' + t("more") + " →</a>" }; });
    var mp = leaflet($("#city-map"), monPts, c, 13);
    var cache = {};
    function show(kind) {
      $$(".svc-tabs .tab").forEach(function (b) { b.classList.toggle("on", b.dataset.svc === kind); });
      var body = $("#svc-body"), color = SVC.find(function (s) { return s.k === kind; }).color;
      body.innerHTML = '<div class="svc-loading">' + t("loading") + "</div>";
      var url = "/data/services/" + c.id + "-" + kind + ".json";
      (cache[kind] || (cache[kind] = kind === "tours" ? Promise.resolve({}) : fetch(url).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; }))).then(function (j) {
        if ($(".svc-tabs .tab.on").dataset.svc !== kind) return;
        var items = j.items || [];
        var full = items.length;
        if (["restaurant", "hospital", "bank"].indexOf(kind) > -1) items = items.slice(0, 12);
        body.innerHTML = svcView(kind, j, items, c) + (full > items.length ? '<a class="btn btn-outline btn-sm" style="margin-top:16px" href="/xizmatlar/' + c.id + "-" + kind + '.html">' + t("svc.all", { n: full }) + " →</a>" : "");
        if (mp) mp.draw(monPts.concat(items.filter(function (x) { return x.lat && x.lng; }).map(function (x) {
          return { lat: x.lat, lng: x.lng, color: color, html: "<b>" + esc(x.name) + "</b>" + (x.price ? "<br>" + U.money(x.price, x.currency) : "") + (x.url ? '<br><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + t("open") + " ↗</a>" : "") };
        })));
        if (kind === "tours") wireLocalTours(c);
      });
    }
    $$(".svc-tabs .tab").forEach(function (b) { b.onclick = function () { show(b.dataset.svc); }; });
    show("restaurant");
    U.bookingPanel($("#bk-panel"), { name: L(c.name), lat: c.lat, lng: c.lng, city: c });
  };
  function svcView(kind, j, items, c) {
    var src = function (txt) { return '<p class="svc-src">' + txt + "</p>"; };
    if (kind === "tours") {
      var live = "";
      var own = D.tours.filter(function (x) { return x.city === c.id; });
      return live + '<h3 class="h4" style="margin:26px 0 12px">' + t("tours.own") + "</h3>" +
        (own.length ? '<div class="svc-list">' + own.map(function (x) { return '<div class="svc-item"><span class="svc-ico">🧭</span><div><b>' + esc(L(x.title)) + "</b><small>" + esc(L(x.duration)) + '</small></div><div class="svc-price"><button class="btn btn-primary btn-xs" type="button" data-own-tour="' + x.id + '">' + t("book.btn") + "</button></div></div>"; }).join("") + "</div>" : "") +
        '<button class="btn btn-outline btn-sm" type="button" data-guide-req style="margin-top:14px">' + t("guide.req", { c: L(c.name) }) + "</button>";
    }
    if (!items.length) return '<div class="notice"><b>' + t("svc.none") + "</b><p>" + (j.error ? esc(j.error) : t("svc.noneP")) + '</p><a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/' + encodeURIComponent(t("svc.q." + kind) + " " + c.name.en) + "/@" + c.lat + "," + c.lng + ',14z">Google Maps ↗</a></div>';
    var ico = { restaurant: "🍽", hospital: "🏥", bank: "🏦" }[kind];
    var KIND = { cafe: "☕", fast_food: "🍔", clinic: "🩺", atm: "🏧", bureau_de_change: "💱" };
    return '<div class="svc-list">' + items.map(function (x) {
      var dist = x.lat ? U.fmtKm(U.km(c, x)) : "";
      var maps = "https://www.google.com/maps/search/?api=1&query=" + (x.lat ? x.lat + "," + x.lng : encodeURIComponent(x.name));
      return '<div class="svc-item"><span class="svc-ico">' + (KIND[x.kind] || ico) + "</span><div><b>" + esc(x.name) + "</b>" +
        "<small>" + esc([t("k." + x.kind), kind === "restaurant" && x.sub ? x.sub.split(";").map(function (c) { var k = "cu." + c; var v = t(k); return v === k ? c.replace(/_/g, " ") : v; }).join(", ") : x.sub].filter(Boolean).join(" · ")) + "</small>" + (x.address ? "<small>" + esc(x.address) + "</small>" : "") + (x.hours ? "<small>🕘 " + esc(x.hours) + "</small>" : "") +
        '</div><div class="svc-price">' + (x.rating ? "<b>★ " + x.rating + "</b>" : "") + (dist ? "<small>" + t("fromCenter", { d: dist }) + "</small>" : "") +
        (x.phone ? '<a href="tel:' + esc(x.phone.replace(/[^+\d]/g, "")) + '">' + esc(x.phone) + "</a>" : "") + (x.website ? '<a href="' + esc(x.website) + '" target="_blank" rel="noopener nofollow">' + t("website") + " ↗</a>" : "") + '<a href="' + maps + '" target="_blank" rel="noopener">' + t("route") + " ↗</a></div></div>";
    }).join("") + "</div>" + src(t("src.osm", { d: j.fetched || "" }));
  }
  function wireLocalTours(c) {
    $$("[data-own-tour]").forEach(function (b) { b.onclick = function () { var x = D.tours.find(function (z) { return z.id === b.dataset.ownTour; }); U.openBooking({ title: L(x.title), duration: L(x.duration) }); }; });
    var g = $("[data-guide-req]"); if (g) g.onclick = function () { U.openBooking({ title: t("guide.req", { c: L(c.name) }), kind: "guide" }); };
  }

  /* ================= XIZMATLAR SAHIFASI (restoran / shifoxona / bank) ================= */
  P.svc = function () {
    var parts = (document.body.getAttribute("data-id") || "").split("|"), c = U.city(parts[0]), kind = parts[1];
    var color = SVC.find(function (s) { return s.k === kind; }).color;
    setMeta(t("svcp.title", { s: t("svc." + kind), c: L(c.name) }), t("svcp.lead", { s: t("svc." + kind).toLowerCase(), c: L(c.name) }));
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[L(c.name), U.cityUrl(c)], [t("svc." + kind)]]) +
      '<h1 class="display h1 h1-detail">' + esc(t("svc." + kind)) + " — " + esc(L(c.name)) + '</h1><p class="lead">' + t("svcp.lead", { s: t("svc." + kind).toLowerCase(), c: L(c.name) }) + '</p>' +
      '<div class="tabs" style="margin:22px 0">' + ["restaurant", "hospital", "bank"].map(function (k) { return '<a class="tab' + (k === kind ? " on" : "") + '" href="/xizmatlar/' + c.id + "-" + k + '.html">' + t("svc." + k) + "</a>"; }).join("") + "</div>" +
      '<div class="toolbar"><input class="input" id="sq" type="search" placeholder="' + t("search.byName") + '"><span class="muted" id="scount"></span></div>' +
      '<div class="svc-layout"><div id="svc-body" class="svc-body"><div class="svc-loading">' + t("loading") + '</div></div><div class="map-box sticky" id="svc-map"></div></div></section>';
    var mp = leaflet($("#svc-map"), [], c, 14), all = [], meta = {};
    function render() {
      var q = U.norm($("#sq").value.trim());
      var list = all.filter(function (x) { return !q || U.norm(x.name + " " + (x.sub || "") + " " + (x.address || "")).indexOf(q) > -1; });
      $("#scount").textContent = t("n.places", { n: list.length });
      $("#svc-body").innerHTML = svcView(kind, meta, list, c);
      if (mp) mp.draw(list.map(function (x) { return { lat: x.lat, lng: x.lng, color: color, html: "<b>" + esc(x.name) + "</b>" + (x.address ? "<br>" + esc(x.address) : "") }; }));
    }
    fetch("/data/services/" + c.id + "-" + kind + ".json").then(function (r) { return r.json(); }).then(function (j) { meta = j; all = j.items || []; render(); })
      .catch(function () { $("#svc-body").innerHTML = '<div class="notice">' + t("svc.none") + "</div>"; });
    $("#sq").oninput = render;
  };

  /* ================= OBIDA ================= */
  P.mon = function () {
    var id = document.body.getAttribute("data-id") || U.qs("id");
    var m = U.mon(id) || D.monuments[0], c = U.city(m.city);
    setMeta(L(m.name) + " — " + L(c.name), L(m.short));
    var others = U.monsOf(c.id).filter(function (x) { return x.id !== m.id; }).slice(0, 4);
    var near = m.lat == null ? [] : D.monuments.filter(function (x) { return x.id !== m.id && x.lat != null; }).map(function (x) { return { m: x, d: U.km(m, x) }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 4);
    var imgs = m.imgs.length ? m.imgs : [null];
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.mons"), "/obidalar.html"], [L(c.name), U.cityUrl(c)], [L(m.name)]]) +
      '<div class="detail"><div><div class="gallery"><div class="gal-main">' + imgs.map(function (im, i) {
        return '<figure class="gal-slide' + (i ? "" : " on") + '">' + U.pic(im, L(m.name), null, { big: true, eager: i === 0 }) + (im && im.c ? '<figcaption class="credit">📷 ' + U.credit(im) + "</figcaption>" : "") + "</figure>";
      }).join("") + (imgs.length > 1 ? '<button class="gal-nav prev" type="button" aria-label="' + t("prev") + '">‹</button><button class="gal-nav next" type="button" aria-label="' + t("next") + '">›</button>' : "") + "</div>" +
      (imgs.length > 1 ? '<div class="gal-thumbs">' + imgs.map(function (im, i) { return '<button type="button" class="' + (i ? "" : "on") + '" aria-label="' + (i + 1) + '">' + U.pic(im, "", null) + "</button>"; }).join("") + "</div>" : "") + "</div>" +
      (m.lat != null ? '<div class="map-box" style="height:300px;margin-top:24px"><iframe title="' + esc(L(m.name)) + '" loading="lazy" src="https://maps.google.com/maps?q=' + m.lat + "," + m.lng + "&z=17&hl=" + U.lang + '&output=embed"></iframe></div>' : "") + "</div>" +
      '<div><div class="chip-row"><span class="chip primary">' + esc(U.catSingle(m.cat)) + "</span>" + "</div>" +
      '<h1 class="display h1 h1-detail">' + esc(L(m.name)) + '</h1><p class="muted" style="margin:0">' + esc(U.lang === "en" ? L(c.name) : m.name.en + " · " + L(c.name)) + "</p>" +
      (m.uzOnly && U.lang !== "uz" ? '<p class="uz-note">' + t("uzOnly") + "</p>" : "") + '<p class="detail-text">' + esc(L(m.text)) + "</p>" +
      (m.address ? '<p class="muted" style="font-size:.9rem">📍 ' + esc(m.address) + "</p>" : "") +
      '<div class="info-grid"><div class="fact"><small>' + (m.uzOnly ? t("yearSrc") : t("built")) + "</small><b>" + esc(L(m.year)) + '</b></div><div class="fact"><small>' + t("type") + "</small><b>" + esc(U.catSingle(m.cat)) + '</b></div><div class="fact"><small>' + t("city") + '</small><b><a href="' + U.cityUrl(c) + '">' + esc(L(c.name)) + '</a></b></div><div class="fact"><small>' + t("coords") + "</small><b>" + (m.lat != null ? m.lat.toFixed(4) + ", " + m.lng.toFixed(4) : "—") + "</b></div></div>" +
      U.unescoBlock(m.unesco) +
      '<div class="visit"><h2 class="h4">' + t("visit.h") + '</h2><p style="margin:8px 0 0;font-size:.92rem">🕘 ' + t("visit.hoursNote") + ' <a class="link" href="' + U.mapsLink(m) + '" target="_blank" rel="noopener">Google Maps ↗</a></p></div>' +
      '<a class="btn btn-primary btn-sm" href="' + U.mapsLink(m) + '" target="_blank" rel="noopener noreferrer">' + t("openMaps") + " ↗</a>" +
      '<div class="rate-box"><div class="rate-head"><div><small class="muted" style="font-weight:700;letter-spacing:.06em">' + t("rate.box") + '</small><div class="avg" id="avg"></div></div><a class="btn-ghost" href="/reyting.html">' + t("nav.rating") + " →</a></div>" +
      '<p style="margin:18px 0 8px;font-weight:700">' + t("rate.yours") + '</p><div id="rw"></div><p class="muted" style="font-size:.8rem;margin-top:10px">' + t("rate.rule") + " " + t("rate.method") + "</p></div></div></div></section>" +
      '<section class="section" id="booking"><div class="wrap"><div class="section-head"><div><h2 class="h2">' + t("bk.h2m") + '</h2><p class="muted" style="margin-top:6px;max-width:640px">' + t("bk.subm", { n: L(m.name) }) + '</p></div></div><div id="bk-panel"></div></div></section>' +
      (near.length ? '<section class="section section-soft"><div class="wrap"><div class="section-head"><h2 class="h2">' + t("near.h") + '</h2></div><div class="grid">' + near.map(function (x) {
        return U.card(x.m).replace('<span class="yr">', '<span class="dist">📍 ' + U.fmtKm(x.d) + '</span><span class="yr">');
      }).join("") + "</div></div></section>" : "") +
      (others.length ? '<section class="section"><div class="wrap"><div class="section-head"><h2 class="h2">' + t("others.h", { c: L(c.name) }) + '</h2><a class="btn btn-outline btn-sm" href="' + U.cityUrl(c) + '">' + t("all") + '</a></div><div class="grid">' + others.map(U.card).join("") + "</div></div></section>" : "");
    // galereya
    var gi = 0, sl = $$(".gal-slide"), th = $$(".gal-thumbs button");
    function go(k) { gi = (k + sl.length) % sl.length; sl.forEach(function (s, i) { s.classList.toggle("on", i === gi); }); th.forEach(function (b, i) { b.classList.toggle("on", i === gi); }); }
    th.forEach(function (b, i) { b.onclick = function () { go(i); }; });
    var pv = $(".gal-nav.prev"), nx = $(".gal-nav.next"); if (pv) { pv.onclick = function () { go(gi - 1); }; nx.onclick = function () { go(gi + 1); }; }
    function avg() {
      var r = U.ratings.get(m.id);
      $("#avg").innerHTML = "<b>" + r.avg.toFixed(1) + "</b>" + U.starsStatic(r.avg) + (r.count ? ' <span class="muted">' + t("n.votes", { n: r.count }) + "</span>" : "");
    }
    U.bookingPanel($("#bk-panel"), { name: L(m.name), lat: m.lat || c.lat, lng: m.lng || c.lng, city: c });
    avg(); U.starWidget($("#rw"), m.id, avg);
    U.ratings.load().then(function () { avg(); U.refreshRateMinis(); U.starWidget($("#rw"), m.id, avg); });
    document.addEventListener("uth:rated", function () { avg(); U.refreshRateMinis(); });
    U.reveal();
  };

  /* ================= REYTING JADVALI ================= */
  P.rating = function () {
    var st = { city: "all", sort: "avg", dir: -1 };
    setMeta(t("rt.h1"), t("rt.lead"));
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.rating")]]) +
      '<h1 class="display h1">' + t("rt.h1") + '</h1><p class="lead" style="margin-top:16px">' + t("rt.lead") + "</p></section>" +
      '<section class="wrap" style="padding-bottom:64px"><div class="toolbar"><div class="left"><select class="select" id="r-city" aria-label="' + t("city") + '"><option value="all">' + t("allCities") + "</option>" + D.cities.map(function (c) { return '<option value="' + c.id + '">' + esc(L(c.name)) + "</option>"; }).join("") + "</select>" +
      '</div><span class="muted" id="r-total"></span></div><p class="muted small" style="margin:0 0 16px">' + t("rate.method") + "</p>" +
      '<div class="table-wrap"><table class="rank"><thead><tr><th>#</th><th>' + t("rt.mon") + '</th><th class="c-city"><button data-s="city">' + t("city") + '</button></th><th><button data-s="avg" class="on">' + t("rating") + ' ↓</button></th><th><button data-s="count">' + t("rt.votes") + "</button></th><th><span class=\"sr-only\">" + t("rate.btn") + '</span></th></tr></thead><tbody id="r-body"><tr><td colspan="6" class="muted" style="padding:32px;text-align:center">' + t("loading") + "</td></tr></tbody></table></div></section>";
    function render() {
      var list = D.monuments.filter(function (m) { return st.city === "all" || m.city === st.city; }).map(function (m) { return { m: m, r: U.ratings.get(m.id) }; });
      var total = list.reduce(function (s, x) { return s + x.r.count; }, 0);
      list.sort(function (a, b) {
        if (st.sort === "city") return st.dir * L(U.city(a.m.city).name).localeCompare(L(U.city(b.m.city).name), U.lang) || b.r.avg - a.r.avg;
        if (st.sort === "count") return st.dir * (a.r.count - b.r.count) || b.r.avg - a.r.avg;
        return st.dir * (a.r.avg - b.r.avg) || b.r.count - a.r.count;
      });
      $("#r-total").textContent = t("rt.total", { n: total });
      $("#r-body").innerHTML = list.length ? list.map(function (x, i) {
        var c = U.city(x.m.city), n = i + 1;
        return '<tr><td class="n' + (st.sort === "avg" && st.dir < 0 && n <= 3 ? " top" + n : "") + '">' + n + '</td><td class="c-obj"><a class="obj" href="' + U.monUrl(x.m) + '"><span class="av">' + U.monImg(x.m) + "</span><span><b>" + esc(L(x.m.name)) + "</b><small>" + esc(L(c.name)) + " · " + esc(U.catSingle(x.m.cat)) + "</small></span></a></td>" +
          '<td class="c-city"><a href="' + U.cityUrl(c) + '">' + esc(L(c.name)) + "</a></td>" +
          '<td class="c-avg"><div class="avgcell"><b>' + x.r.avg.toFixed(2) + '</b><span class="bar"><i style="width:' + (x.r.avg / 5 * 100) + '%"></i></span></div></td>' +
          '<td class="c-cnt"><span class="cnt-label">' + t("rt.votes") + ": </span>" + x.r.count + '</td><td class="c-btn"><button class="btn btn-outline btn-xs" type="button" data-rate-open="' + x.m.id + '">' + t("rate.btn") + "</button></td></tr>";
      }).join("") : '<tr><td colspan="6" style="padding:40px;text-align:center" class="muted">' + t("rt.empty") + "</td></tr>";
    }
    $("#r-city").onchange = function () { st.city = this.value; render(); };
    $$("table.rank th button").forEach(function (b) {
      b.onclick = function () {
        st.dir = st.sort === b.dataset.s ? -st.dir : (b.dataset.s === "city" ? 1 : -1); st.sort = b.dataset.s;
        $$("table.rank th button").forEach(function (x) { x.classList.toggle("on", x === b); x.textContent = x.textContent.replace(/ [↑↓]$/, ""); });
        b.textContent += st.dir < 0 ? " ↓" : " ↑"; render();
      };
    });
    U.ratings.load(true).then(render);
    document.addEventListener("uth:rated", render);
  };

  /* ================= TARIXIY SAYOHATLAR ================= */
  P.tours = function () {
    setMeta(t("nav.tours"), t("tours.lead"));
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.tours")]]) +
      '<h1 class="display h1">' + t("nav.tours") + '</h1><p class="lead" style="margin-top:16px">' + t("tours.lead") + "</p></section>" +
      '<section class="wrap" style="padding-bottom:80px"><div class="tour-grid">' + D.tours.map(function (x) {
        var stops = x.stops.map(U.mon);
        var cover = stops[0];
        return '<article class="tour reveal"><div class="img">' + U.monImg(cover) + '</div><div class="body"><h3>' + esc(L(x.title)) + "</h3><p>" + esc(L(x.desc)) + "</p>" +
          '<div class="stops">' + stops.map(function (m) { return '<a href="' + U.monUrl(m) + '">' + esc(L(m.name)) + "</a>"; }).join("") + "</div>" +
          '<div class="foot"><div class="price"><small>' + t("duration") + "</small><b class=\"sm\">" + esc(L(x.duration)) + '</b></div><button class="btn btn-primary btn-xs" type="button" data-book="' + x.id + '">' + t("book.btn") + "</button></div></div></article>";
      }).join("") + "</div></section>";
    $$("[data-book]").forEach(function (b) { b.onclick = function () { var x = D.tours.find(function (z) { return z.id === b.dataset.book; }); U.openBooking({ title: L(x.title), duration: L(x.duration) }); }; });
    U.reveal();
  };

  /* ================= SARGUZASHT ================= */
  function diff(n) { return '<span class="diff d' + n + '" title="' + t("diff." + n) + '" aria-label="' + t("difficulty") + ": " + t("diff." + n) + '">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '">' + ICO.boot + "</i>"; }).join("") + "</span>"; }
  function seasonBar(months) {
    return '<div class="season" aria-label="' + t("season") + '">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) {
      return '<span class="' + (months.indexOf(i) > -1 ? "on" : "") + (i === NOW_M ? " now" : "") + '" title="' + MONTHS(i) + '">' + MONTHS(i).slice(0, 1) + "</span>";
    }).join("") + "</div>";
  }
  function advCard(a) {
    return '<article class="adv reveal"><a class="img" href="' + U.advUrl(a) + '">' + U.advImg(a) + '<span class="tag">' + a.type.map(function (k) { return t("type." + k); }).join(" · ") + "</span></a>" +
      '<div class="body"><h3><a href="' + U.advUrl(a) + '">' + esc(L(a.title)) + "</a></h3>" +
      '<div class="adv-meta">' + diff(a.difficulty) + "<span>⏱ " + t("n.days", { n: a.days }) + "</span><span>🚗 ≈" + a.km + " km</span></div>" +
      seasonBar(a.months) + '<p class="muted adv-desc">' + esc(L(a.desc)) + "</p>" +
      '<div class="foot">' + "<span></span>" + '<a class="btn btn-outline btn-xs" href="' + U.advUrl(a) + '">' + t("more") + "</a></div></div></article>";
  }
  P.adv = function () {
    var A = D.adventures, st = { type: "all", diff: "all", month: "all", dur: "all" };
    setMeta(t("adv.h1"), t("adv.lead"));
    var types = ["trek", "water", "winter", "desert", "etno"];
    var now = A.filter(function (a) { return a.months.indexOf(NOW_M) > -1; });
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.adv")]]) +
      '<h1 class="display h1">' + t("adv.h1") + '</h1><p class="lead" style="margin-top:16px">' + t("adv.lead") + "</p></section>" +
      '<section class="wrap"><div class="now-box"><div><span class="eyebrow">' + t("now.h2") + '</span><h2 class="h3" style="margin-top:6px">' + t("now.sub", { m: MONTHS(NOW_M) }) + '</h2></div><div class="now-chips">' +
        (now.length ? now.map(function (a) { return '<a class="chip" href="' + U.advUrl(a) + '">' + esc(L(a.title)) + "</a>"; }).join("") : '<span class="muted">' + t("adv.noneNow") + "</span>") + "</div></div></section>" +
      '<section class="wrap" style="padding-top:28px"><div class="filters" role="group" aria-label="' + t("filters") + '">' +
        '<div class="tabs" id="f-type"><button class="tab on" data-v="all">' + t("all") + "</button>" + types.map(function (k) { return '<button class="tab" data-v="' + k + '">' + t("type." + k) + "</button>"; }).join("") + "</div>" +
        '<div class="left"><select class="select" id="f-diff" aria-label="' + t("difficulty") + '"><option value="all">' + t("difficulty") + ": " + t("all") + "</option>" + [1, 2, 3].map(function (n) { return '<option value="' + n + '">' + t("diff." + n) + "</option>"; }).join("") + "</select>" +
        '<select class="select" id="f-month" aria-label="' + t("season") + '"><option value="all">' + t("season") + ": " + t("all") + '</option><option value="now">' + t("now.opt") + "</option>" + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) { return '<option value="' + i + '">' + MONTHS(i) + "</option>"; }).join("") + "</select>" +
        '<select class="select" id="f-dur" aria-label="' + t("duration") + '"><option value="all">' + t("duration") + ": " + t("all") + '</option><option value="1">' + t("n.days", { n: 1 }) + '</option><option value="2">' + t("dur.multi") + "</option></select></div>" +
        '<span class="muted" id="a-count"></span></div><div class="adv-grid" id="adv-grid"></div></section>' +
      '<section class="section"><div class="wrap"><div class="section-head"><div><h2 class="h2">' + t("adv.map") + '</h2><p class="muted" style="margin-top:6px">' + t("adv.mapNote") + '</p></div></div><div class="map-box" id="adv-map" style="height:480px"></div></div></section>' +
      '<section class="section section-soft"><div class="wrap split-ai"><div><h2 class="h2">' + t("adv.aiH") + '</h2><p class="lead" style="margin-top:14px">' + t("adv.aiP") + '</p></div><div class="ai-qs">' + ["adv.q1", "adv.q2", "adv.q3"].map(function (k) { return '<button class="ai-q" type="button" data-chat-open data-chat-q="' + esc(t(k)) + '">✨ ' + t(k) + "</button>"; }).join("") + "</div></div></section>" +
      '<section class="wrap" style="padding:40px 0 80px"><p class="muted small">' + t("adv.disclaimer") + "</p></section>";
    var mp = leaflet($("#adv-map"), [], { lat: 41.0, lng: 64.5 }, 6);
    function render() {
      var mo = st.month === "now" ? NOW_M : +st.month;
      var list = A.filter(function (a) {
        return (st.type === "all" || a.type.indexOf(st.type) > -1) && (st.diff === "all" || a.difficulty === +st.diff) &&
          (st.month === "all" || a.months.indexOf(mo) > -1) && (st.dur === "all" || (st.dur === "1" ? a.days === 1 : a.days > 1));
      });
      $("#a-count").textContent = t("n.routes", { n: list.length });
      $("#adv-grid").innerHTML = list.length ? list.map(advCard).join("") : '<div class="empty" style="grid-column:1/-1">' + t("list.empty") + "</div>";
      U.reveal($("#adv-grid"));
      if (mp) mp.draw(list.map(function (a) { return { lat: a.lat, lng: a.lng, color: "#3d00b7", html: "<b>" + esc(L(a.title)) + "</b><br>" + t("n.days", { n: a.days }) + " · " + t("diff." + a.difficulty) + '<br><a href="' + U.advUrl(a) + '">' + t("more") + " →</a>" }; }));
    }
    $$("#f-type .tab").forEach(function (b) { b.onclick = function () { st.type = b.dataset.v; $$("#f-type .tab").forEach(function (x) { x.classList.toggle("on", x === b); }); render(); }; });
    $("#f-diff").onchange = function () { st.diff = this.value; render(); };
    $("#f-month").onchange = function () { st.month = this.value; render(); };
    $("#f-dur").onchange = function () { st.dur = this.value; render(); };
    render();
  };

  // Open-Meteo kodlari → belgi
  function wx(code) {
    if (code === 0) return ["☀️", "wx.clear"]; if (code <= 2) return ["🌤", "wx.partly"]; if (code === 3) return ["☁️", "wx.cloudy"];
    if (code <= 48) return ["🌫", "wx.fog"]; if (code <= 67 || (code >= 80 && code <= 82)) return ["🌧", "wx.rain"];
    if (code <= 77 || code === 85 || code === 86) return ["🌨", "wx.snow"]; return ["⛈", "wx.storm"];
  }
  P.advDetail = function () {
    var a = U.adv(document.body.getAttribute("data-id") || U.qs("id")) || D.adventures[0];
    setMeta(L(a.title), L(a.desc));
    var imgs = a.imgs.length ? a.imgs : [null];
    var prog = L(a.program) || [];
    $("#page").innerHTML = '<section class="page-hero wrap">' + crumbs([[t("nav.adv"), "/sarguzasht.html"], [L(a.title)]]) +
      '<div class="detail"><div><div class="gallery"><div class="gal-main">' + imgs.map(function (im, i) {
        return '<figure class="gal-slide' + (i ? "" : " on") + '">' + U.pic(im, L(a.title), "mountain", { big: true, eager: i === 0 }) + (im && im.c ? '<figcaption class="credit">📷 ' + U.credit(im) + "</figcaption>" : "") + "</figure>";
      }).join("") + (imgs.length > 1 ? '<button class="gal-nav prev" type="button" aria-label="' + t("prev") + '">‹</button><button class="gal-nav next" type="button" aria-label="' + t("next") + '">›</button>' : "") + "</div>" +
      (imgs.length > 1 ? '<div class="gal-thumbs">' + imgs.map(function (im, i) { return '<button type="button" class="' + (i ? "" : "on") + '" aria-label="' + (i + 1) + '">' + U.pic(im, "", "mountain") + "</button>"; }).join("") + "</div>" : "") + "</div>" +
      '<h2 class="h3" style="margin:36px 0 14px">' + t("adv.program") + '</h2><ol class="program">' + prog.map(function (p, i) { return "<li><b>" + t("day", { n: i + 1 }) + "</b><span>" + esc(p) + "</span></li>"; }).join("") + "</ol>" +
      '<h2 class="h3" style="margin:36px 0 14px">' + t("wx.h") + '</h2><div class="weather" id="wx"><div class="svc-loading">' + t("loading") + '</div></div><p class="svc-src">' + t("wx.src") + "</p>" +
      '<div class="map-box" id="adv-map" style="height:320px;margin-top:28px"></div></div>' +
      '<div><div class="chip-row">' + a.type.map(function (k) { return '<span class="chip primary">' + t("type." + k) + "</span>"; }).join("") + "</div>" +
      '<h1 class="display h1 h1-detail">' + esc(L(a.title)) + '</h1><p class="detail-text">' + esc(L(a.desc)) + "</p>" +
      (a.permit ? '<div class="warn">⚠️ ' + t("adv.permit") + "</div>" : "") + U.unescoBlock(a.unesco) +
      '<div class="info-grid"><div class="fact"><small>' + t("difficulty") + "</small><b>" + diff(a.difficulty) + " " + t("diff." + a.difficulty) + '</b></div><div class="fact"><small>' + t("duration") + "</small><b>" + t("n.days", { n: a.days }) + "</b></div>" +
        '<div class="fact"><small>' + t("adv.dist") + "</small><b>≈ " + a.km + " km" + (a.hours ? " · ≈" + a.hours + " " + t("hours") : " · " + t("adv.flight")) + "</b></div>" +
        '<div class="fact"><small>' + t("adv.alt") + "</small><b>" + (a.altitude ? "≈ " + a.altitude + " m" : "—") + "</b></div>" +
        '<div class="fact"><small>' + t("adv.group") + "</small><b>" + esc(a.group) + "</b></div>" +
        '<div class="fact"><small>' + t("adv.age") + "</small><b>" + (a.age ? a.age + "+" : t("adv.anyAge")) + "</b></div></div>" +
      '<div class="season-box"><small class="muted" style="font-weight:700">' + t("season") + "</small>" + seasonBar(a.months) + "</div>" +
      '<div class="lists"><div><h3 class="h4">' + t("adv.includes") + "</h3><ul class=\"ticks\">" + a.includes.map(function (k) { return "<li>" + t("inc." + k) + "</li>"; }).join("") + "</ul></div>" +
        '<div><h3 class="h4">' + t("adv.bring") + "</h3><ul class=\"dots-list\">" + a.bring.map(function (k) { return "<li>" + t("bring." + k) + "</li>"; }).join("") + "</ul></div></div>" +
      '<div class="safety"><h3 class="h4">' + t("adv.safety") + "</h3><p>" + (a.instructor ? "✅ " + t("adv.instr") : "ℹ️ " + t("adv.noInstr")) + "</p><p>ℹ️ " + t("adv.insurance") + "</p></div>" +
      '<div class="book-box"><p>' + t("book.note") + '</p><button class="btn btn-primary" type="button" id="adv-book">' + t("book.btn") + '</button></div>' +
      '<button class="ai-q" type="button" data-chat-open data-chat-q="' + esc(t("adv.askAi", { a: L(a.title) })) + '" style="margin-top:14px;width:100%">✨ ' + t("adv.askAi", { a: L(a.title) }) + "</button>" +
      '<p class="muted small" style="margin-top:18px">' + t("adv.disclaimer") + "</p></div></div></section>" +
      '<section class="section section-soft"><div class="wrap"><div class="section-head"><h2 class="h2">' + t("adv.other") + '</h2><a class="btn btn-outline btn-sm" href="/sarguzasht.html">' + t("adv.all") + '</a></div><div class="adv-grid">' +
      D.adventures.filter(function (x) { return x.id !== a.id; }).map(function (x) { return { x: x, d: U.km(a, x) }; }).sort(function (p, q) { return p.d - q.d; }).slice(0, 4).map(function (o) { return advCard(o.x); }).join("") + "</div></div></section>";
    var gi = 0, sl = $$(".gal-slide"), th = $$(".gal-thumbs button");
    function go(k) { gi = (k + sl.length) % sl.length; sl.forEach(function (s, i) { s.classList.toggle("on", i === gi); }); th.forEach(function (b, i) { b.classList.toggle("on", i === gi); }); }
    th.forEach(function (b, i) { b.onclick = function () { go(i); }; });
    var pv = $(".gal-nav.prev"), nx = $(".gal-nav.next"); if (pv) { pv.onclick = function () { go(gi - 1); }; nx.onclick = function () { go(gi + 1); }; }
    $("#adv-book").onclick = function () { U.openBooking({ title: L(a.title), duration: t("n.days", { n: a.days }), kind: "adventure" }); };
    leaflet($("#adv-map"), [{ lat: a.lat, lng: a.lng, html: "<b>" + esc(L(a.title)) + "</b><br>" + t("adv.approxPin") }], a, 9);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + a.lat + "&longitude=" + a.lng + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var d = j.daily;
        $("#wx").innerHTML = d.time.map(function (day, i) {
          var w = wx(d.weather_code[i]), dt = new Date(day + "T12:00:00");
          return '<div class="wx-day"><small>' + dt.toLocaleDateString(U.locale, { weekday: "short", day: "numeric" }) + '</small><span class="wx-ico" title="' + t(w[1]) + '">' + w[0] + "</span><b>" + Math.round(d.temperature_2m_max[i]) + "°</b><small>" + Math.round(d.temperature_2m_min[i]) + "°</small>" + (d.precipitation_probability_max[i] != null ? '<small class="rain">💧' + d.precipitation_probability_max[i] + "%</small>" : "") + "</div>";
        }).join("");
      }).catch(function () { $("#wx").innerHTML = '<p class="muted">' + t("wx.err") + "</p>"; });
    U.reveal();
  };
})();
