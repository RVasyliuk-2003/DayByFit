const CACHE = "daybyfit-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled(
          ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"].map(
            (url) => cache.add(url),
          ),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const put = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase та інше не чіпаємо

  // відкриття сторінки: мережа, але при поганому зв'язку швидко беремо збережену
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/").then((cached) => {
        const network = fetch(request).then((res) => put("/", res));
        if (!cached) return network;
        return Promise.race([
          network,
          new Promise((_, reject) => setTimeout(reject, 4000)),
        ]).catch(() => cached);
      }),
    );
    return;
  }

  // файли з хешем у назві не змінюються: спершу кеш
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches
        .match(request)
        .then((hit) => hit || fetch(request).then((res) => put(request, res))),
    );
    return;
  }

  // решта (іконки, маніфест): віддаємо кеш і тихо оновлюємо
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request).then((res) => put(request, res));
      return hit || network;
    }),
  );
});
