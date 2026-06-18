const CACHE_VERSION = "v1.1.0";
const CACHE_KEY = `toolbox-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/styles/app.css",
  "/core/dom.js",
  "/core/feedback.js",
  "/core/theme.js",
  "/core/navigation.js",
  "/core/clock.js",
  "/features/json/jsonTool.js",
  "/features/url/urlTool.js",
  "/features/time/timeTool.js",
  "/features/uuid/uuidTool.js",
  "/features/password/passwordTool.js",
  "/features/currency/currencyTool.js",
  "/main.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_KEY).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_KEY).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_KEY).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });

        if (cached) {
          event.waitUntil(networkFetch);
          return cached;
        }

        return networkFetch;
      })
    )
  );
});
