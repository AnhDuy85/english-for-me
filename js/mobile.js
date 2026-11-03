/* ============================================================
 * mobile.js — Cử chỉ cảm ứng cho flashcard và ẩn mic khi không hỗ trợ
 * Không thay đổi logic học: chỉ "bấm hộ" các nút có sẵn (#vc-flip, #vc-wrong, #vc-right).
 * ============================================================ */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function clickIfEnabled(id) {
    const b = $(id);
    if (b && !b.disabled) { b.click(); return true; }
    return false;
  }

  function initFlashcard() {
    const card = $("vc-card");
    if (!card) return;
    let sx = 0, sy = 0, tracking = false, swiped = false;

    card.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
      swiped = false;
    }, { passive: true });

    card.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      // Vuốt ngang rõ ràng (>= 60px, ngang hơn dọc) sau khi đã lật thẻ
      if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swiped = true;
        clickIfEnabled(dx < 0 ? "vc-wrong" : "vc-right");
      }
    }, { passive: true });

    // Chạm vào thẻ để lật (không chạy sau một cú vuốt; không ảnh hưởng nút bên trong thẻ)
    card.addEventListener("click", function (e) {
      if (swiped) { swiped = false; return; }
      if (e.target.closest("button, a, input, select, textarea")) return;
      clickIfEnabled("vc-flip");
    });
  }

  function markSpeechSupport() {
    const sp = window.RM && window.RM.speech;
    const ok = !!(sp && sp.recognitionSupported && sp.recognitionSupported());
    document.documentElement.classList.toggle("no-sr", !ok);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFlashcard();
    markSpeechSupport();
  });
})();
