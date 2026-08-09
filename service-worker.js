const CACHE_NAME = "toksnap-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  // Untuk file HTML dan JavaScript,
  // selalu coba ambil versi terbaru dari server.
  if (
    event.request.destination === "script" ||
    event.request.destination === "document"
  ) {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;

        })
        .catch(() => caches.match(event.request))
    );

    return;
  }

  // File lainnya tetap menggunakan cache terlebih dahulu.
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );

});
