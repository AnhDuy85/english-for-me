/* ============================================================
 * pwa.js — Đăng ký service worker, báo "sẵn sàng offline", báo cập nhật,
 * gợi ý "Thêm vào màn hình chính". Lựa chọn ẩn gợi ý lưu ở khóa riêng englishRoadmap.ui.v1.
 * Trên file:// (hoặc http không phải localhost) bỏ qua im lặng.
 * ============================================================ */
(function () {
  "use strict";

  const UI_KEY = "englishRoadmap.ui.v1";

  function $(id) { return document.getElementById(id); }

  function loadUi() {
    try {
      const o = JSON.parse(localStorage.getItem(UI_KEY) || "{}");
      return o && typeof o === "object" ? o : {};
    } catch (e) { return {}; }
  }
  function saveUi(patch) {
    const o = loadUi();
    Object.keys(patch).forEach(function (k) { o[k] = patch[k]; });
    try { localStorage.setItem(UI_KEY, JSON.stringify(o)); } catch (e) { /* bỏ qua */ }
  }

  function swAllowed() {
    if (!("serviceWorker" in navigator)) return false;
    const h = location.hostname;
    return location.protocol === "https:" || h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  }

  function platform() {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/.test(ua)) return "android";
    return "other";
  }

  /* ---------- Gợi ý thêm vào màn hình chính ---------- */
  let deferredPrompt = null;

  function showInstallBanner() {
    if (isStandalone() || loadUi().installHintDismissed) return;
    const p = platform();
    if (p === "other" && !deferredPrompt) return;
    const text = p === "ios"
      ? "Cài như một ứng dụng: bấm Chia sẻ (biểu tượng hình vuông có mũi tên) rồi chọn “Thêm vào màn hình chính”. Dùng Safari."
      : "Cài như một ứng dụng: mở menu của trình duyệt (dấu ba chấm) rồi chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.";
    $("install-text").textContent = text;
    $("install-btn").classList.toggle("hidden", !deferredPrompt);
    $("install-banner").classList.remove("hidden");
  }

  function initInstall() {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredPrompt = e;
      showInstallBanner();
    });
    window.addEventListener("appinstalled", function () {
      $("install-banner").classList.add("hidden");
      saveUi({ installHintDismissed: true });
    });
    $("install-btn").addEventListener("click", function () {
      if (!deferredPrompt) return;
      const ev = deferredPrompt;
      deferredPrompt = null; // sự kiện chỉ dùng được một lần
      $("install-btn").classList.add("hidden");
      ev.prompt();
      if (ev.userChoice && ev.userChoice.then) {
        ev.userChoice.then(function (c) {
          if (c && c.outcome === "accepted") {
            $("install-banner").classList.add("hidden");
          } else {
            // Đã đóng hộp thoại: giữ lại hướng dẫn cài thủ công qua menu trình duyệt
            $("install-text").textContent = "Chưa cài. Bạn có thể cài sau: mở menu của trình duyệt (dấu ba chấm) rồi chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.";
          }
        });
      }
    });
    $("install-dismiss").addEventListener("click", function () {
      $("install-banner").classList.add("hidden");
      saveUi({ installHintDismissed: true });
    });
    showInstallBanner();
  }

  /* ---------- Service worker ---------- */
  function offlineReady() {
    $("offline-status").textContent = "Đã sẵn sàng học offline.";
  }

  function offerUpdate(worker) {
    const banner = $("update-banner");
    banner.classList.remove("hidden");
    $("update-btn").onclick = function () { worker.postMessage({ type: "SKIP_WAITING" }); };
  }

  function initSw() {
    let reloading = false;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      // Lần cài đầu tiên (chưa có controller) không cần tải lại
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });

    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener("updatefound", function () {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener("statechange", function () {
          if (w.state === "installed" && navigator.serviceWorker.controller) offerUpdate(w);
        });
      });
    }).catch(function () { /* không đăng ký được: app vẫn chạy online bình thường */ });

    // ready chỉ xong khi worker đã active, tức là precache đã hoàn tất
    navigator.serviceWorker.ready.then(function () {
      offlineReady();
      if (!loadUi().offlineReadyShown) {
        saveUi({ offlineReadyShown: true });
        const t = $("toast");
        t.textContent = "Đã sẵn sàng học offline.";
        t.classList.remove("hidden");
        setTimeout(function () { t.classList.add("hidden"); }, 6000);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!swAllowed()) return;
    initSw();
    initInstall();
  });
})();
