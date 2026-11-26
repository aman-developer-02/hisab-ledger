const CACHE_NAME = "cleartally-offline-v6";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("identitytoolkit") ||
    url.includes("securetoken") ||
    url.includes("corsproxy.io") ||
    url.includes("allorigins.win") ||
    url.includes("codetabs.com") ||
    url.includes("finance.yahoo.com")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match("./index.html"))
  );
});