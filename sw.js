const CACHE_NAME = "agrivoice-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./main.js",
  "./util.js",
  "./dexie.js",
  "./images/logo.png",
  "./images/image.png",
  "./images/send.png",
  "./images/voice.png",
  "./images/loader.gif",
  "./images/shimmer.gif"
];

// Install service worker and cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching AgriVoice assets...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve cached files first, then fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("./index.html")
        )
      );
    })
  );
});

// Update service worker if new version found
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Old cache deleted:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});