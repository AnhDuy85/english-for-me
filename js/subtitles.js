/* ============================================================
 * subtitles.js — Parser phụ đề .srt / .vtt tự viết (không thư viện ngoài).
 * Hàm thuần, không đụng DOM nên test được bằng node:
 *   const S = require("./subtitles.js"); S.parseSrt(text) ...
 *
 *   parseVtt(text) / parseSrt(text)  -> [{start, end, lines:[string]}]  (giây, đã sắp theo start)
 *   splitBilingual(cues)             -> [{start, end, en, vi}]  dòng 1 = Anh, các dòng sau = Việt
 *   merge(enCues, viCues)            -> [{start, end, en, vi}]  ghép 2 file theo thời gian
 *   toVtt(items)                     -> chuỗi WebVTT
 * ============================================================ */
(function () {
  "use strict";

  const TIME = "(?:\\d{1,3}:)?\\d{1,2}:\\d{2}(?:[.,]\\d{1,3})?";
  const TIMING = new RegExp("(" + TIME + ")\\s*-->\\s*(" + TIME + ")");

  function toSeconds(s) {
    const parts = s.replace(",", ".").split(":").map(Number);
    let sec = 0;
    for (let i = 0; i < parts.length; i++) sec = sec * 60 + parts[i];
    return sec;
  }

  function cleanLine(s) {
    return s.replace(/<[^>]*>/g, "").replace(/\{[^}]*\}/g, "")
      .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
      .replace(/\s+/g, " ").trim();
  }

  /** Bộ phân tích chung: SRT và VTT chỉ khác ở phần đầu file và dấu , / . của mili giây. */
  function parseCues(text) {
    const src = String(text == null ? "" : text).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const cues = [];
    src.split(/\n{2,}/).forEach(function (block) {
      const lines = block.split("\n");
      let ti = -1, m = null;
      for (let i = 0; i < lines.length; i++) {
        m = TIMING.exec(lines[i]);
        if (m) { ti = i; break; }
      }
      if (ti < 0) return; // WEBVTT, NOTE, STYLE... hoặc khối rác
      const start = toSeconds(m[1]), end = toSeconds(m[2]);
      const body = lines.slice(ti + 1).map(cleanLine).filter(Boolean);
      if (!body.length || !(end > start)) return;
      cues.push({ start: start, end: end, lines: body });
    });
    cues.sort(function (a, b) { return a.start - b.start; });
    return cues;
  }

  function parseSrt(text) { return parseCues(text); }
  function parseVtt(text) { return parseCues(text); }

  /** Phụ đề 2 dòng: dòng 1 tiếng Anh, phần còn lại tiếng Việt. Cue 1 dòng chỉ có en. */
  function splitBilingual(cues) {
    return cues.map(function (c) {
      return { start: c.start, end: c.end, en: c.lines[0], vi: c.lines.slice(1).join(" ") };
    });
  }

  function overlap(a, b) { return Math.min(a.end, b.end) - Math.max(a.start, b.start); }

  /** Ghép file Anh với file Việt: lấy cue Việt trùng thời gian nhiều nhất, nếu không trùng thì lấy cue có start gần nhất (<= 1.5 giây). */
  function merge(enCues, viCues) {
    return enCues.map(function (e) {
      let best = null, bestOv = 0;
      viCues.forEach(function (v) {
        const ov = overlap(e, v);
        if (ov > bestOv) { bestOv = ov; best = v; }
      });
      if (!best) {
        let bestD = 1.5;
        viCues.forEach(function (v) {
          const d = Math.abs(v.start - e.start);
          if (d <= bestD) { bestD = d; best = v; }
        });
      }
      return { start: e.start, end: e.end, en: e.lines.join(" "), vi: best ? best.lines.join(" ") : "" };
    });
  }

  function fmt(t) {
    const ms = Math.round(t * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, r = ms % 1000;
    const p = function (n, w) { return String(n).padStart(w, "0"); };
    return p(h, 2) + ":" + p(m, 2) + ":" + p(s, 2) + "." + p(r, 3);
  }

  function toVtt(items) {
    let out = "WEBVTT\n\n";
    items.forEach(function (c, i) {
      out += (i + 1) + "\n" + fmt(c.start) + " --> " + fmt(c.end) + "\n" + c.en + (c.vi ? "\n" + c.vi : "") + "\n\n";
    });
    return out;
  }

  const api = { parseSrt: parseSrt, parseVtt: parseVtt, splitBilingual: splitBilingual, merge: merge, toVtt: toVtt };
  if (typeof window !== "undefined") { window.RM = window.RM || {}; window.RM.subtitles = api; }
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
