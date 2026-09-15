const BUILD_ID = "5db4e23df757";
const CACHE_NAME = "pdf-studio-" + BUILD_ID;
const APP_SHELL = ["/","/index.html","/manifest.webmanifest","/favicon.svg","/assets/index-BPqKZI6w.js","/assets/index-Bz6ItzD4.css","/assets/index-uwHEI2SI.js","/assets/index.min-BWh4vzuQ.js","/assets/pdf-B75MOh95.js","/assets/pdf.worker.min-B7BB9YL5.js","/assets/pdf.worker.min-iDqQPrd3.mjs"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith("pdf-studio-") || key.startsWith("pdf-qr-tools-")) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }
  if (!/^\/(?:assets|cmaps|standard_fonts)\//.test(url.pathname) && !APP_SHELL.includes(url.pathname)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  })));
});
