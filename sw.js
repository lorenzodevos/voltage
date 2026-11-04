// Service worker: maakt de app installeerbaar en snel.
// Verhoog VERSION bij elke update zodat telefoons de nieuwe versie ophalen.
const VERSION = "voltage-v22";
const SHELL = ["./", "index.html", "styles.css", "app.js", "oefeningen.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"];

self.addEventListener("install", e => {
  // Altijd verse bestanden ophalen (niet uit de browsercache)
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => fetch(u, { cache: "reload" }).then(r => c.put(u, r)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "voltage-photos").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  // Oefeningfoto's (vaste versie op CDN/GitHub): eerst uit cache, ze veranderen nooit
  if (/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)$/.test(url.hostname) && url.pathname.includes("free-exercise-db")) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return; // API, fonts en bibliotheken altijd rechtstreeks
  // App-bestanden: altijd eerst de nieuwste versie van GitHub (browsercache overslaan), cache enkel offline
  const fresh = req.mode === "navigate" ? fetch(url.href, { cache: "no-cache", credentials: "same-origin" }) : fetch(req, { cache: "no-cache" });
  e.respondWith(fresh.then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req.mode === "navigate" ? "index.html" : req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
});
