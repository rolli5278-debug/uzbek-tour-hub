// Tashqi API'lar uchun soxta javoblar (faqat lokal test)
export function mockFetch(url, opts, log) {
  if (url.includes("api.anthropic.com")) {
    const b = JSON.parse(opts.body); log.push({ claude: { model: b.model, n: b.messages.length, tools: (b.tools||[]).map(t=>t.name), hdr: Object.keys(opts.headers) } });
    if (process.env.MOCK_FAIL) return new Response("{}", { status: 500 });
    const last = b.messages[b.messages.length - 1];
    const wantsHotel = /mehmonxona|hotel|отел/i.test(JSON.stringify(b.messages[0].content));
    if (wantsHotel && typeof last.content === "string")
      return Response.json({ stop_reason: "tool_use", content: [{ type: "text", text: "Qidiraman." }, { type: "tool_use", id: "tu_1", name: "search_hotels", input: { city: "samarkand", sort: "price" } }] });
    if (Array.isArray(last.content) && last.content[0]?.type === "tool_result") {
      const r = JSON.parse(last.content[0].content);
      const txt = r.live
        ? "### 🏨 Samarqand mehmonxonalari\n\n" + r.hotels.slice(0,3).map(h => `* **${h.name}** — $${h.perNight}/kecha, reyting ${h.reviewScore} — [Booking.com](${h.url})`).join("\n")
        : `### 🏨 Samarqand\n\nJonli narxlar hozir mavjud emas. [Booking.com'da real narxlar](${r.searchUrl})`;
      return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: txt }] });
    }
    return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: "### 3 kunlik reja\n\n* **1-kun:** Samarqand" }] });
  }
  if (url.includes("demandapi")) {
    const b = JSON.parse(opts.body); log.push({ booking: url.split(/\/3\.[12]/)[1], hdr: { aff: opts.headers["X-Affiliate-Id"], auth: !!opts.headers.Authorization }, body: b });
    if (url.endsWith("/common/locations/cities")) return Response.json({ data: [{ id: -2577367, name: { "en-gb": "Samarkand" } }, { id: -2581264, name: { "en-gb": "Tashkent" } }] });
    if (url.endsWith("/accommodations/search")) return Response.json({ data: [
      { id: 101, currency: { booker: "USD", accommodation: "UZS" }, url: "https://www.booking.com/hotel/uz/demo-a.html", price: { base: { booker_currency: 140, accommodation_currency: 1750000 }, display: { booker_currency: 150, accommodation_currency: 1875000 }, total: { booker_currency: 158, accommodation_currency: 1975000 } }, products: [{ policies: { cancellation: { type: "free_cancellation" }, meal_plan: { plan: "breakfast_included" } }, deal: null }] },
      { id: 102, currency: { booker: "USD" }, url: "https://www.booking.com/hotel/uz/demo-b.html", price: { base: { booker_currency: 80, accommodation_currency: 1000000 }, total: { booker_currency: 90, accommodation_currency: 1125000 } }, products: [{ policies: { cancellation: { type: "non_refundable" } }, deal: { discount_percentage: 15 } }] },
      { id: 103, currency: { booker: "USD" }, url: "https://www.booking.com/hotel/uz/demo-c.html", price: { total: { booker_currency: 330, accommodation_currency: 4125000 } }, products: [] } ] });
    if (url.endsWith("/accommodations/details")) return Response.json({ data: [
      { id: 101, name: { "en-gb": "TEST Hotel Alpha" }, rating: { stars: 4, review_score: 8.9, number_of_reviews: 1234 }, location: { address: { "en-gb": "Test street 1" } }, photos: [{ main_photo: true, url: { standard: "/images/w/registon-1-s.webp" } }] },
      { id: 102, name: { "en-gb": "TEST Guesthouse Beta" }, rating: { stars: 2, review_score: 9.3, number_of_reviews: 410 }, location: { address: { "en-gb": "Test street 2" } }, photos: [{ main_photo: true, url: { standard: "/images/w/ichan-qala-1-s.webp" } }] },
      { id: 103, name: { "en-gb": "TEST Palace Gamma" }, rating: { stars: 5, review_score: 7.8, number_of_reviews: 88 }, location: { address: { "en-gb": "Test street 3" } }, photos: [] } ] });
  }
  if (url.includes("places.googleapis.com")) {
    log.push({ places: url.replace("https://places.googleapis.com/v1/","").slice(0,90), key: !!opts.headers?.["X-Goog-Api-Key"] });
    if (url.includes("searchText")) return Response.json({ places: [1,2,3].map(i => ({ displayName: { text: "GTEST Hospital " + i }, formattedAddress: "Test st " + i, location: { latitude: 39.65 + i*0.003, longitude: 66.97 + i*0.002 }, rating: 4.1, userRatingCount: 50*i, internationalPhoneNumber: "+998 66 000 00 0" + i, primaryTypeDisplayName: { text: "Hospital" }, regularOpeningHours: { weekdayDescriptions: ["Monday: Open 24 hours","Tuesday: Open 24 hours","Wednesday: Open 24 hours","Thursday: Open 24 hours","Friday: Open 24 hours","Saturday: Open 24 hours","Sunday: Open 24 hours"] } })) });
    if (url.includes("/media")) return Response.json({ photoUri: "/images/w/registon-1-s.webp?mock=" + encodeURIComponent(url.split("/photos/")[1]?.slice(0,8)||"") });
    return Response.json({ photos: [{ name: "places/X/photos/AAA", authorAttributions: [{ displayName: "Test Muallif", uri: "https://maps.google.com/maps/contrib/1" }] }, { name: "places/X/photos/BBB", authorAttributions: [{ displayName: "Ikkinchi Muallif" }] }] });
  }
  if (url.includes("overpass-api.de")) {
    log.push({ overpass: decodeURIComponent(opts.body).slice(5, 80) });
    const q = decodeURIComponent(opts.body), m = q.match(/around:\d+,([\d.]+),([\d.]+)/), la = +m[1], lo = +m[2];
    const kind = /hospital/.test(q) ? "hospital" : /bank/.test(q) ? "bank" : "restaurant";
    return Response.json({ elements: [1, 2, 3, 4].map((i) => ({ type: "node", id: i, lat: la + i * 0.002, lon: lo - i * 0.0015,
      tags: { amenity: i === 4 && kind === "bank" ? "atm" : kind, name: "TEST " + kind + " " + i, "name:ru": "ТЕСТ " + i, "addr:street": "Test ko'chasi", "addr:housenumber": String(i), opening_hours: "Mo-Su 09:00-22:00", phone: "+998 90 000 00 0" + i, cuisine: kind === "restaurant" ? "uzbek" : undefined } })) });
  }
  if (url.includes("demandapi") && url.endsWith("/cars/search")) return Response.json({ data: [
    { offer: "c1", categories: ["economy", "manual"], policies: { cancellation: { type: "free_cancellation" }, mileage: { type: "unlimited" } }, price: { total: 142.4, currency: "USD" }, url: { web: "https://www.booking.com/cars/test1" } },
    { offer: "c2", categories: ["suv", "automatic"], policies: { mileage: { type: "limited" } }, price: { total: 260, currency: "USD" }, url: { web: "https://www.booking.com/cars/test2" } }] });
  if (url.includes("demandapi") && url.endsWith("/attractions/search")) return Response.json({ data: [
    { id: "PRa1", free_cancellation: true, price: { currency: "USD", total: 35 }, urls: { web: { detail: "https://www.booking.com/attractions/uz/pra1-test.html" } } },
    { id: "PRa2", free_cancellation: false, price: { currency: "USD", total: 18.5 }, urls: { web: { detail: "https://www.booking.com/attractions/uz/pra2-test.html" } } }] });
  if (url.includes("demandapi") && url.endsWith("/attractions/details")) return Response.json({ data: [
    { id: "PRa1", name: { "en-gb": "TEST Samarkand guided walking tour" }, ratings: { score: 4.8, number_of_reviews: 120 }, photos: [{ url: "/images/w/registon-2-s.webp" }], locations: [{ coordinates: { latitude: 39.655, longitude: 66.976 } }] },
    { id: "PRa2", name: { "en-gb": "TEST Registan evening show ticket" }, ratings: { score: 4.5, number_of_reviews: 40 }, photos: [], locations: [{ coordinates: { latitude: 39.6547, longitude: 66.9757 } }] }] });
  if (url.includes("api.telegram.org")) { log.push({ telegram: JSON.parse(opts.body).text.slice(0, 60) }); return Response.json({ ok: true }); }
  return null;
}
