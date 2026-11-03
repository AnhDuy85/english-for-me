/* ============================================================
 * backup.js — Xuất/nhập tiến độ gộp 3 khóa localStorage
 *   englishRoadmap.v1 (checklist), englishRoadmap.speaking.v1, englishRoadmap.vocab.v1
 * Gói: { schema:"englishRoadmap.bundle", version:1, exportedAt, roadmap, speaking, vocab }
 * Nhập: chấp nhận gói gộp, file tiến độ cũ (schema "englishRoadmap") hoặc file riêng
 * của luyện nói / từ vựng. Kiểm tra TOÀN BỘ trước, chỉ ghi khi mọi phần hợp lệ.
 * Đăng ký window.RM.backup = { exportAll, importAll, resetAll }.
 * ============================================================ */
(function () {
  "use strict";
  window.RM = window.RM || {};

  const BUNDLE = "englishRoadmap.bundle";
  const MAX_BYTES = 10 * 1024 * 1024;
  const NAMES = { roadmap: "tiến độ lộ trình", speaking: "lịch sử luyện nói", vocab: "tiến độ từ vựng" };
  const SCHEMAS = { roadmap: "englishRoadmap", speaking: "englishRoadmap.speaking", vocab: "englishRoadmap.vocab" };

  function isObj(o) { return o && typeof o === "object" && !Array.isArray(o); }

  function exportAll() {
    return JSON.stringify({
      schema: BUNDLE, version: 1, exportedAt: new Date().toISOString(),
      roadmap: JSON.parse(RoadmapStorage.exportJson()),
      speaking: RM.speech && RM.speech.store ? RM.speech.store.exportObj() : null,
      vocab: RM.vocab && RM.vocab.store ? RM.vocab.store.exportObj() : null
    }, null, 2);
  }

  // Kiểm tra một phần; trả về thông báo lỗi hoặc ""
  function checkPart(key, o) {
    if (!isObj(o)) return "Phần " + NAMES[key] + " không hợp lệ.";
    if (o.schema !== SCHEMAS[key]) return "Phần " + NAMES[key] + " sai định dạng (schema).";
    if (typeof o.version !== "number" || o.version > 1) return "Phần " + NAMES[key] + " có phiên bản mới hơn, chưa hỗ trợ.";
    return "";
  }

  function importAll(text) {
    if (typeof text !== "string" || !text.trim()) return { ok: false, message: "File rỗng." };
    if (text.length > MAX_BYTES) return { ok: false, message: "File quá lớn (trên 10 MB), không phải file tiến độ." };
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, message: "File không phải JSON hợp lệ." }; }
    if (!isObj(obj)) return { ok: false, message: "Nội dung file không phải dữ liệu tiến độ." };

    const parts = {};
    if (obj.schema === BUNDLE) {
      if (typeof obj.version !== "number" || obj.version > 1) return { ok: false, message: "Phiên bản file gộp mới hơn, chưa hỗ trợ." };
      ["roadmap", "speaking", "vocab"].forEach(function (k) { if (obj[k] != null) parts[k] = obj[k]; });
    } else if (obj.schema === SCHEMAS.roadmap) parts.roadmap = obj;
    else if (obj.schema === SCHEMAS.speaking) parts.speaking = obj;
    else if (obj.schema === SCHEMAS.vocab) parts.vocab = obj;
    else return { ok: false, message: "File không phải dữ liệu của Lộ trình tiếng Anh." };

    const keys = Object.keys(parts);
    if (!keys.length) return { ok: false, message: "File gộp không chứa phần dữ liệu nào." };
    for (let i = 0; i < keys.length; i++) {
      const err = checkPart(keys[i], parts[keys[i]]);
      if (err) return { ok: false, message: err + " Chưa có gì bị thay đổi." };
    }
    if (parts.speaking && !(RM.speech && RM.speech.store)) return { ok: false, message: "Thiếu module luyện nói, chưa có gì bị thay đổi." };
    if (parts.vocab && !(RM.vocab && RM.vocab.store)) return { ok: false, message: "Thiếu module từ vựng, chưa có gì bị thay đổi." };

    const done = [];
    const theme = RoadmapStorage.getSetting("theme");
    if (parts.roadmap) {
      const r = RoadmapStorage.importJson(JSON.stringify(parts.roadmap));
      if (!r.ok) return { ok: false, message: r.message };
      done.push(NAMES.roadmap);
      if (!RoadmapStorage.getSetting("theme") && theme) RoadmapStorage.setSetting("theme", theme);
    }
    if (parts.speaking) {
      const r = RM.speech.store.importObj(parts.speaking);
      if (!r.ok) return { ok: false, message: "Đã nhập: " + done.join(", ") + ". Lỗi ở " + NAMES.speaking + ": " + r.message, parts: parts };
      done.push(NAMES.speaking);
    }
    if (parts.vocab) {
      const r = RM.vocab.store.importObj(parts.vocab);
      if (!r.ok) return { ok: false, message: "Đã nhập: " + done.join(", ") + ". Lỗi ở " + NAMES.vocab + ": " + r.message, parts: parts };
      done.push(NAMES.vocab);
    }
    return { ok: true, message: "Đã nhập: " + done.join(", ") + ".", parts: done };
  }

  function resetAll() {
    const theme = RoadmapStorage.getSetting("theme");
    RoadmapStorage.reset();
    RoadmapStorage.setSetting("theme", theme);
    if (RM.speech && RM.speech.store) RM.speech.store.reset();
    if (RM.vocab && RM.vocab.store) RM.vocab.store.reset();
  }

  window.RM.backup = { exportAll: exportAll, importAll: importAll, resetAll: resetAll };
})();
