/* ============================================================
 * storage.js — Lưu tiến độ bằng localStorage + xuất/nhập JSON
 * Khóa riêng: englishRoadmap.v1 (không dùng chung với english-daily)
 * ============================================================ */
const RoadmapStorage = (function () {
  "use strict";
  const STORE_KEY = "englishRoadmap.v1";
  const SCHEMA = "englishRoadmap";
  const VERSION = 1;

  function defaults() {
    return { schema: SCHEMA, version: VERSION, checks: {}, activity: {}, settings: { theme: "", duration: 60, level: "" } };
  }

  // Dự phòng trong bộ nhớ khi localStorage không dùng được
  let memory = null;
  let persistent = true;

  function sanitize(obj) {
    const out = defaults();
    if (!obj || typeof obj !== "object") return out;
    if (obj.checks && typeof obj.checks === "object") {
      Object.keys(obj.checks).forEach(function (k) {
        if (obj.checks[k] === true && /^w\d{1,2}d[1-7]t[a-z0-9]+$/.test(k)) out.checks[k] = true;
      });
    }
    if (obj.activity && typeof obj.activity === "object") {
      Object.keys(obj.activity).forEach(function (k) {
        if (obj.activity[k] === true && /^\d{4}-\d{2}-\d{2}$/.test(k)) out.activity[k] = true;
      });
    }
    const s = obj.settings || {};
    if (s.theme === "dark" || s.theme === "light") out.settings.theme = s.theme;
    if (s.duration === 30 || s.duration === 60 || s.duration === 90) out.settings.duration = s.duration;
    if (s.level === "A1" || s.level === "A2" || s.level === "B1") out.settings.level = s.level;
    return out;
  }

  function load() {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      memory = raw ? sanitize(JSON.parse(raw)) : defaults();
    } catch (e) {
      persistent = false;
      memory = defaults();
    }
    return memory;
  }

  function save() {
    if (!memory) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(memory));
    } catch (e) {
      persistent = false;
    }
  }

  function isPersistent() { return persistent; }

  function todayKey(d) {
    d = d || new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function isChecked(id) { return load().checks[id] === true; }

  function setChecked(id, value) {
    const st = load();
    if (value) {
      st.checks[id] = true;
      st.activity[todayKey()] = true;
    } else {
      delete st.checks[id];
    }
    save();
  }

  function getSetting(name) { return load().settings[name]; }
  function setSetting(name, value) { load().settings[name] = value; save(); }

  // Chuỗi ngày liên tiếp có tick; hôm nay chưa tick vẫn giữ chuỗi từ hôm qua
  function streak() {
    const act = load().activity;
    const d = new Date();
    if (!act[todayKey(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (act[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function reset() {
    memory = defaults();
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* bỏ qua */ }
  }

  function exportJson() {
    const st = load();
    return JSON.stringify({
      schema: SCHEMA, version: VERSION, exportedAt: new Date().toISOString(),
      checks: st.checks, activity: st.activity, settings: st.settings
    }, null, 2);
  }

  // Trả về { ok, message }
  function importJson(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, message: "File không phải JSON hợp lệ." }; }
    if (!obj || obj.schema !== SCHEMA) return { ok: false, message: "File không phải dữ liệu của Lộ trình tiếng Anh." };
    if (typeof obj.version !== "number" || obj.version > VERSION) return { ok: false, message: "Phiên bản file không được hỗ trợ." };
    memory = sanitize(obj);
    save();
    return { ok: true, message: "Đã nhập tiến độ thành công." };
  }

  return { load, save, isChecked, setChecked, getSetting, setSetting, streak, reset, exportJson, importJson, isPersistent, todayKey };
})();
