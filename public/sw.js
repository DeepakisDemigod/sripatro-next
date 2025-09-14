const CACHE_NAME = "sripatro-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, "/logo.png"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// Handle navigation requests: try network first, then cache offline page on failure
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isNavigate =
    req.mode === "navigate" ||
    (req.method === "GET" && req.headers.get("accept")?.includes("text/html"));

  if (isNavigate) {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(OFFLINE_URL);
        return (
          cached ||
          new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      })
    );
    return;
  }

  // For other requests, fall back to network, but serve from cache if available when offline
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
