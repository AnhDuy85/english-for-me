/* ============================================================
 * sw.js — Service worker: học offline.
 * Chiến lược: PRECACHE TOÀN BỘ (app shell + dialogs + 12 file từ vựng, ~0,77 MiB)
 * khi cài đặt; tài nguyên: cache-first; điều hướng (HTML): mạng trước (chờ tối đa
 * 4 giây) rồi rơi về index.html trong cache khi offline.
 * QUAN TRỌNG: khi sửa bất kỳ file nào trong danh sách, hãy TĂNG số VERSION bên dưới.
 * ============================================================ */
"use strict";
const VERSION = "english-roadmap-v1";
const PREFIX = "english-roadmap-";
const NAV_TIMEOUT_MS = 4000;

const PRECACHE = [
  "./", "index.html", "manifest.webmanifest", "css/style.css",
  "js/data.js", "js/storage.js", "js/ipa.js", "js/speech.js", "js/vocab.js", "js/dialogs.js",
  "js/subtitles.js", "js/player.js", "js/backup.js", "js/app.js", "js/mobile.js", "js/pwa.js",
  "js/vocab/week01.js", "js/vocab/week02.js", "js/vocab/week03.js", "js/vocab/week04.js",
  "js/vocab/week05.js", "js/vocab/week06.js", "js/vocab/week07.js", "js/vocab/week08.js",
  "js/vocab/week09.js", "js/vocab/week10.js", "js/vocab/week11.js", "js/vocab/week12.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png",
  "samples/sample-dialog.vtt", "vocab-template.csv"
];

function scoped(p) { return new URL(p, self.registration.scope).href; }

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // cache: "reload" để không lấy bản cũ từ cache HTTP của trình duyệt
      return cache.addAll(PRECACHE.map(function (p) { return new Request(scoped(p), { cache: "reload" }); }));
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function navigationResponse(request) {
  const network = fetch(request).then(function (res) {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(scoped("index.html"), copy); });
    }
    return res;
  });
  const timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error("timeout")); }, NAV_TIMEOUT_MS); });
  return Promise.race([network, timeout]).catch(function () {
    return caches.match(scoped("index.html")).then(function (hit) { return hit || network; });
  });
}

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(navigationResponse(req));
    return;
  }
  if (url.pathname.endsWith("/sw.js")) return; // luôn lấy từ mạng để cập nhật phiên bản
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
