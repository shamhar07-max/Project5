// DigitalBurj service worker: network-first pages with an offline fallback,
// cache-first for static brand assets. Workspace and API traffic is never cached.
const VERSION = "db-v2";
const OFFLINE = "/offline.html";
const PRECACHE = ["/icon-192.png", "/icon-512.png", "/brand/db-iconmark.png"];

// Production asset serving may redirect /offline.html to /offline. A redirected response
// cannot answer a navigation, so store a fresh, non-redirected copy under the OFFLINE key.
async function cacheOfflinePage(cache) {
  const res = await fetch(OFFLINE, { cache: "reload" });
  if (!res.ok) throw new Error("Offline page unavailable");
  await cache.put(OFFLINE, new Response(await res.blob(), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }));
}

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all([c.addAll(PRECACHE), cacheOfflinePage(c)])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/workspace") || url.pathname.startsWith("/api") || url.pathname.includes("chatgpt") || url.pathname === "/callback") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
    return;
  }
  if (url.pathname.startsWith("/brand/") || /\.(png|webp|jpg|svg|woff2)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
