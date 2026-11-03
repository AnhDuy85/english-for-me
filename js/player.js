/* ============================================================
 * player.js — Tab "Hội thoại & Video"
 *  1) Hội thoại có kịch bản (RM.dialogs): đọc từng câu bằng SpeechSynthesis, phụ đề song ngữ
 *     đồng bộ (highlight), điều khiển phát, ẩn/hiện Anh-Việt, điền từ khóa, "Nói lại" có chấm điểm
 *     (dùng RM.speech.listen / RM.speech.score).
 *  2) Video của bạn: <video> + blob URL, phụ đề .vtt/.srt (RM.subtitles), danh sách câu, lặp đoạn.
 * Không dùng mạng, không tải gì lên. Đăng ký window.RM.media = {init, render, stop}.
 * ============================================================ */
(function () {
  "use strict";
  window.RM = window.RM || {};

  function $(id) { return document.getElementById(id); }
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === "text") node.textContent = props[k];
      else if (k === "class") node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c != null) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateKey() { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  const synthOk = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const synth = synthOk ? window.speechSynthesis : null;

  /* ---------------- Giọng đọc: 2 người nói khác giọng/cao độ ---------------- */
  let voices = [];
  function loadVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { loadVoices(); synth.addEventListener ? synth.addEventListener("voiceschanged", loadVoices) : (synth.onvoiceschanged = loadVoices); }
  function voiceFor(speaker) {
    const en = voices.filter(function (v) { return /^en/i.test(v.lang); });
    en.sort(function (a, b) { return (/en[-_]US/i.test(b.lang) ? 1 : 0) - (/en[-_]US/i.test(a.lang) ? 1 : 0); });
    if (!en.length) return null;
    return speaker === "B" && en.length > 1 ? en[1] : en[0];
  }

  /* ---------------- Chấm điểm "Nói lại" dùng chung (module A) ---------------- */
  /** Nghe 1 lần, chấm với `target`, ghi vào lịch sử, hiển thị vào `out`. */
  function sayAgain(target, week, out, btn, label) {
    const sp = window.RM.speech;
    if (!sp || !sp.recognitionSupported()) {
      out.textContent = "Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge trên Android (iPhone Safari có thể không hỗ trợ).";
      return;
    }
    let got = false;
    out.textContent = "Đang nghe, hãy nói câu tiếng Anh…";
    btn.disabled = true;
    sp.listen({
      onResult: function (said) {
        got = true;
        const sc = sp.score(target, said);
        sp.store.add({ t: new Date().toISOString(), d: dateKey(), week: week || 0, target: target, said: said, total: sc.total, ok: sc.ok, missing: sc.missing, wrong: sc.wrong, extra: sc.extra });
        const bad = sc.tokens.filter(function (k) { return k.status !== "ok"; }).map(function (k) {
          return k.status === "wrong" ? "✗ " + k.word + " → " + k.said : k.status === "missing" ? "− sót: " + k.word : "+ thừa: " + k.word;
        });
        out.textContent = label + "Điểm " + sc.total + "/100. Nhận diện: “" + said + "”." + (bad.length ? " Cần xem lại: " + bad.join("; ") + "." : " Khớp hoàn toàn.");
        document.dispatchEvent(new CustomEvent("rm-speaking-scored"));
        if (sp.render) sp.render();
      },
      onError: function (msg) { got = true; out.textContent = msg; },
      onEnd: function () { btn.disabled = false; if (!got) out.textContent = "Không nhận diện được câu nào. Hãy thử lại."; }
    });
  }

  /* ============================================================
   * 1) HỘI THOẠI CÓ KỊCH BẢN
   * ============================================================ */
  const st = { week: 1, id: null, idx: -1, playing: false, rate: 0.8, hideEn: false, hideVi: false, cloze: false, revealed: {}, token: 0 };
  let initialised = false;

  const STOP = {};
  "about after again always because before between could should would there their these those where which while other really something through different important".split(" ").forEach(function (w) { STOP[w] = 1; });

  function dialogs() { return window.RM.dialogs || []; }
  function current() { return dialogs().filter(function (d) { return d.id === st.id; })[0] || null; }
  function mdStatus(msg) { $("md-status").textContent = msg; }

  /** Chọn 1 (hoặc 2 nếu câu dài) từ khóa để che: từ dài nhất, không nằm trong danh sách từ chức năng. */
  function clozeIndexes(en) {
    const words = en.split(/([A-Za-z']+)/);
    const cand = [];
    let wi = 0;
    for (let i = 0; i < words.length; i++) {
      if (i % 2 === 1) {
        const w = words[i];
        if (w.length >= 5 && !STOP[w.toLowerCase()]) cand.push({ wi: wi, len: w.length });
        wi++;
      }
    }
    cand.sort(function (a, b) { return b.len - a.len; });
    const n = wi > 8 ? 2 : 1;
    return cand.slice(0, n).map(function (c) { return c.wi; });
  }

  function normWord(s) { return s.toLowerCase().replace(/[’‘]/g, "'").trim(); }

  function enNode(line, i) {
    if (st.hideEn && !st.revealed[i]) {
      const b = el("button", { type: "button", class: "linkbtn dlg-mask", text: "▒▒▒ Bản Anh đang ẩn (bấm để hiện câu này)" });
      b.addEventListener("click", function () { st.revealed[i] = true; renderLines(); focusLine(i, ".dlg-mask, .dlg-en"); });
      return b;
    }
    if (!st.cloze) return el("span", { class: "dlg-en", lang: "en", text: line.en });
    const wrap = el("span", { class: "dlg-en", lang: "en" });
    const blanks = clozeIndexes(line.en);
    let wi = 0;
    line.en.split(/([A-Za-z']+)/).forEach(function (piece, k) {
      if (k % 2 === 0) { if (piece) wrap.appendChild(document.createTextNode(piece)); return; }
      if (blanks.indexOf(wi) < 0) { wrap.appendChild(document.createTextNode(piece)); wi++; return; }
      wi++;
      const input = el("input", { type: "text", class: "cloze", size: String(Math.max(piece.length, 3)), autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Điền từ còn thiếu, " + piece.length + " chữ cái", "data-answer": piece });
      const mark = el("span", { class: "cloze-mark", "aria-live": "polite" });
      function check(final) {
        const v = normWord(input.value);
        if (!v) { mark.textContent = ""; input.classList.remove("ok", "bad"); return; }
        if (v === normWord(piece)) { input.classList.add("ok"); input.classList.remove("bad"); mark.textContent = " ✓ đúng"; }
        else if (final) { input.classList.add("bad"); input.classList.remove("ok"); mark.textContent = " ✗ chưa đúng"; }
        else { input.classList.remove("ok", "bad"); mark.textContent = ""; }
      }
      input.addEventListener("input", function () { check(false); });
      input.addEventListener("change", function () { check(true); });
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(true); } });
      wrap.appendChild(input); wrap.appendChild(mark);
    });
    return wrap;
  }

  function renderLines() {
    const d = current();
    const ol = $("md-lines");
    clear(ol);
    if (!d) return;
    d.lines.forEach(function (line, i) {
      const li = el("li", { class: "dlg-line spk-" + line.speaker, "data-i": String(i) });
      li.appendChild(el("span", { class: "dlg-who", text: "Người " + line.speaker + ": " }));
      li.appendChild(enNode(line, i));
      if (!st.hideVi) li.appendChild(el("span", { class: "dlg-vi", lang: "vi", text: line.vi }));
      const out = el("span", { class: "dlg-res small", role: "status", "aria-live": "polite" });
      const bar = el("div", { class: "dlg-actions" });
      const listen = el("button", { type: "button", class: "btn small", text: "🔊 Nghe câu này", "aria-label": "Nghe câu " + (i + 1) });
      listen.addEventListener("click", function () { playFrom(i, false); });
      const say = el("button", { type: "button", class: "btn small mic-need", text: "🎤 Nói lại", "aria-label": "Nói lại câu " + (i + 1) + " và chấm điểm" });
      say.addEventListener("click", function () {
        pause();
        setActive(i);
        sayAgain(line.en, d.week, out, say, "Câu " + (i + 1) + ": ");
      });
      if (!synthOk) listen.disabled = true;
      bar.appendChild(listen); bar.appendChild(say);
      li.appendChild(bar);
      li.appendChild(out);
      ol.appendChild(li);
    });
    setActive(st.idx, true);
  }

  function focusLine(i, sel) {
    const li = $("md-lines").querySelector('[data-i="' + i + '"]');
    const t = li && li.querySelector(sel);
    if (t) t.focus();
  }

  function setActive(i, silent) {
    st.idx = i;
    const d = current();
    const items = $("md-lines").children;
    for (let k = 0; k < items.length; k++) {
      const on = k === i;
      items[k].classList.toggle("active", on);
      if (on) { items[k].setAttribute("aria-current", "true"); if (!silent && items[k].scrollIntoView) items[k].scrollIntoView({ block: "nearest" }); }
      else items[k].removeAttribute("aria-current");
    }
    if (d && i >= 0 && !silent) mdStatus("Câu " + (i + 1) + "/" + d.lines.length + (st.playing ? " · đang phát" : ""));
  }

  function updatePlayBtn() {
    const b = $("md-play");
    b.setAttribute("aria-pressed", String(st.playing));
    b.textContent = st.playing ? "⏸ Tạm dừng" : "▶ Phát";
  }

  /** Đọc câu i. continuous = true thì tự sang câu kế tiếp. */
  function playFrom(i, continuous) {
    const d = current();
    if (!d || !synthOk) return;
    if (i < 0 || i >= d.lines.length) return;
    const line = d.lines[i];
    synth.cancel();
    const tok = ++st.token;
    st.playing = continuous;
    updatePlayBtn();
    setActive(i);
    const u = new SpeechSynthesisUtterance(line.en);
    const v = voiceFor(line.speaker);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
    u.pitch = line.speaker === "B" ? 0.8 : 1.15;
    u.rate = st.rate;
    u.onend = function () {
      if (tok !== st.token) return;
      if (!continuous) return;
      if (i + 1 < d.lines.length) {
        setTimeout(function () { if (tok === st.token && st.playing) playFrom(i + 1, true); }, 350);
      } else {
        st.playing = false; updatePlayBtn(); mdStatus("Đã hết đoạn hội thoại.");
      }
    };
    u.onerror = function () { if (tok !== st.token) return; st.playing = false; updatePlayBtn(); };
    synth.speak(u);
  }

  function pause() {
    st.token++;
    st.playing = false;
    if (synth) synth.cancel();
    updatePlayBtn();
  }

  function onPlay() {
    if (st.playing) { pause(); mdStatus("Đã tạm dừng ở câu " + (st.idx + 1) + "."); return; }
    const d = current();
    if (!d) return;
    playFrom(st.idx < 0 || st.idx >= d.lines.length - 1 ? 0 : st.idx, true);
  }
  function step(delta) {
    const d = current();
    if (!d) return;
    const was = st.playing;
    const i = Math.min(d.lines.length - 1, Math.max(0, (st.idx < 0 ? (delta > 0 ? -1 : 0) : st.idx) + delta));
    if (synthOk) playFrom(i, was); else setActive(i);
  }

  function selectDialog(id) {
    pause();
    st.id = id; st.idx = -1; st.revealed = {};
    const d = current();
    $("md-dialog").value = id || "";
    $("md-info").textContent = d ? d.title + " · chủ đề: " + d.topic + " · mức " + d.level + " · " + d.lines.length + " câu" : "";
    mdStatus("");
    renderLines();
  }

  function renderDialogSelect() {
    const sel = $("md-dialog");
    clear(sel);
    dialogs().filter(function (d) { return d.week === st.week; }).forEach(function (d) {
      sel.appendChild(el("option", { value: d.id, text: d.title }));
    });
  }

  function selectWeek(n) {
    st.week = n;
    $("md-week").value = String(n);
    renderDialogSelect();
    const first = dialogs().filter(function (d) { return d.week === n; })[0];
    selectDialog(first ? first.id : null);
  }

  function initDialogs() {
    const wk = $("md-week");
    const weeks = typeof ROADMAP_DATA !== "undefined" ? ROADMAP_DATA.weeks : [];
    for (let n = 1; n <= 12; n++) {
      const w = weeks[n - 1];
      wk.appendChild(el("option", { value: String(n), text: "Tuần " + n + (w ? ": " + w.title : "") }));
    }
    wk.addEventListener("change", function () { selectWeek(Number(wk.value) || 1); });
    $("md-dialog").addEventListener("change", function () { selectDialog($("md-dialog").value); });
    $("md-play").addEventListener("click", onPlay);
    $("md-prev").addEventListener("click", function () { step(-1); });
    $("md-next").addEventListener("click", function () { step(1); });
    $("md-repeat").addEventListener("click", function () { if (st.idx >= 0) playFrom(st.idx, st.playing); else mdStatus("Hãy chọn một câu trước."); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="md-rate"]'), function (r) {
      r.addEventListener("change", function () { st.rate = Number(r.value) || 1; mdStatus("Tốc độ " + r.value + "x, áp dụng từ câu kế tiếp."); });
    });
    $("md-hide-en").addEventListener("change", function () { st.hideEn = this.checked; st.revealed = {}; renderLines(); });
    $("md-hide-vi").addEventListener("change", function () { st.hideVi = this.checked; renderLines(); });
    $("md-cloze").addEventListener("change", function () {
      st.cloze = this.checked;
      $("md-reveal").classList.toggle("hidden", !st.cloze);
      renderLines();
      mdStatus(st.cloze ? "Chế độ điền từ: nghe câu rồi gõ từ còn thiếu, bấm Enter để kiểm tra." : "");
    });
    $("md-reveal").addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("#md-lines .cloze"), function (inp) {
        inp.value = inp.getAttribute("data-answer");
        inp.dispatchEvent(new Event("change"));
      });
    });
    $("md-synth-warn").classList.toggle("hidden", synthOk);
    if (!synthOk) { ["md-play", "md-prev", "md-next", "md-repeat"].forEach(function (id) { $(id).disabled = true; }); }
  }

  /* ============================================================
   * 2) VIDEO CỦA BẠN
   * ============================================================ */
  const vd = { items: [], active: -1, selected: -1, loop: false, url: null };
  const MAX_SUB = 2 * 1024 * 1024;

  function vdStatus(msg) { $("vd-status").textContent = msg; }

  function readText(file) {
    return new Promise(function (resolve, reject) {
      const fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result)); };
      fr.onerror = function () { reject(new Error("Không đọc được file " + file.name)); };
      fr.readAsText(file, "utf-8");
    });
  }

  function fmtTime(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ":" + pad(s); }

  function loadSubs() {
    const S = window.RM.subtitles;
    const fEn = $("vd-sub").files[0], fVi = $("vd-sub-vi").files[0];
    if (!fEn) { vd.items = []; renderCues(); if (fVi) vdStatus("Hãy chọn file phụ đề chính (Anh hoặc song ngữ) trước."); return; }
    if (fEn.size > MAX_SUB || (fVi && fVi.size > MAX_SUB)) { vdStatus("File phụ đề quá lớn (tối đa 2 MB)."); return; }
    Promise.all([readText(fEn), fVi ? readText(fVi) : Promise.resolve(null)]).then(function (txt) {
      const en = S.parseVtt(txt[0]);
      if (!en.length) { vd.items = []; renderCues(); vdStatus("Không tìm thấy câu phụ đề hợp lệ trong file. Kiểm tra dòng thời gian dạng 00:00:01.000 --> 00:00:03.000."); return; }
      let mode;
      if (txt[1] != null) {
        const vi = S.parseVtt(txt[1]);
        vd.items = S.merge(en, vi);
        const matched = vd.items.filter(function (c) { return c.vi; }).length;
        mode = "ghép 2 file, " + matched + "/" + vd.items.length + " câu có bản Việt";
      } else {
        vd.items = S.splitBilingual(en);
        const withVi = vd.items.filter(function (c) { return c.vi; }).length;
        mode = withVi ? "song ngữ 2 dòng" : "chỉ có 1 dòng (không thấy bản Việt, có thể chọn thêm file tiếng Việt)";
      }
      vd.active = -1; vd.selected = -1;
      renderCues();
      vdStatus("Đã nạp " + vd.items.length + " câu phụ đề (" + mode + ").");
    }).catch(function (e) { vdStatus(e.message); });
  }

  function renderCues() {
    const ol = $("vd-cues");
    clear(ol);
    if (!vd.items.length) { ol.appendChild(el("li", { class: "muted small", text: "Chưa có phụ đề." })); return; }
    vd.items.forEach(function (c, i) {
      const b = el("button", { type: "button", class: "vd-cue", "data-i": String(i), "aria-label": "Nhảy tới " + fmtTime(c.start) + ": " + c.en }, [
        el("span", { class: "vd-time", text: fmtTime(c.start) }),
        el("span", { class: "vd-en", lang: "en", text: " " + c.en }),
        c.vi ? el("span", { class: "vd-vi", lang: "vi", text: c.vi }) : null
      ]);
      b.addEventListener("click", function () { jumpTo(i); });
      ol.appendChild(el("li", {}, [b]));
    });
    paintCues();
  }

  function paintCues() {
    const kids = $("vd-cues").querySelectorAll(".vd-cue");
    Array.prototype.forEach.call(kids, function (b, k) {
      b.classList.toggle("active", k === vd.active);
      b.classList.toggle("selected", k === vd.selected);
      if (k === vd.selected) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  function jumpTo(i) {
    const v = $("vd-player"), c = vd.items[i];
    if (!c) return;
    vd.selected = i;
    paintCues();
    if (v.src) {
      v.currentTime = c.start;
      const p = v.play(); if (p && p.catch) p.catch(function () { /* trình duyệt chặn tự phát */ });
    } else vdStatus("Chưa chọn video. Hãy chọn file video để phát.");
  }

  function paintCaption(c) {
    $("vd-cap-en").textContent = c && !$("vd-hide-en").checked ? c.en : "";
    $("vd-cap-vi").textContent = c && !$("vd-hide-vi").checked ? c.vi : "";
  }

  function onTime() {
    const v = $("vd-player"), t = v.currentTime;
    if (vd.loop && vd.selected >= 0) {
      const s = vd.items[vd.selected];
      if (t >= s.end || t < s.start - 0.3) { v.currentTime = s.start; return; }
    }
    let idx = -1;
    for (let i = 0; i < vd.items.length; i++) { if (t >= vd.items[i].start && t < vd.items[i].end) { idx = i; break; } }
    if (idx !== vd.active) {
      vd.active = idx;
      paintCaption(idx >= 0 ? vd.items[idx] : null);
      paintCues();
      if (idx >= 0) {
        const b = $("vd-cues").querySelector('[data-i="' + idx + '"]');
        if (b && b.scrollIntoView) b.scrollIntoView({ block: "nearest" });
      }
    }
  }

  function onVideoFile() {
    const f = $("vd-video").files[0];
    const v = $("vd-player");
    if (vd.url) { URL.revokeObjectURL(vd.url); vd.url = null; }
    if (!f) { v.removeAttribute("src"); v.load(); return; }
    if (!/\.(mp4|webm)$/i.test(f.name) && !/^video\/(mp4|webm)$/.test(f.type)) {
      v.removeAttribute("src"); v.load();
      vdStatus("Chỉ hỗ trợ video .mp4 hoặc .webm."); return;
    }
    vd.url = URL.createObjectURL(f);
    v.src = vd.url;
    vdStatus("Đã chọn video: " + f.name + ". Video chỉ phát trên máy bạn, không được tải lên đâu cả.");
  }

  function initVideo() {
    $("vd-video").addEventListener("change", onVideoFile);
    $("vd-sub").addEventListener("change", loadSubs);
    $("vd-sub-vi").addEventListener("change", loadSubs);
    $("vd-player").addEventListener("timeupdate", onTime);
    $("vd-player").addEventListener("error", function () { if ($("vd-player").getAttribute("src")) vdStatus("Trình duyệt không phát được file video này (thử định dạng .mp4 H.264 hoặc .webm)."); });
    $("vd-loop").addEventListener("click", function () {
      if (!vd.loop && vd.selected < 0) {
        if (vd.active >= 0) vd.selected = vd.active;
        else { vdStatus("Hãy bấm chọn một câu trong danh sách trước khi lặp."); return; }
      }
      vd.loop = !vd.loop;
      this.setAttribute("aria-pressed", String(vd.loop));
      paintCues();
      vdStatus(vd.loop ? "Đang lặp câu " + (vd.selected + 1) + ". Bấm lại nút để tắt lặp." : "Đã tắt lặp.");
    });
    $("vd-say").addEventListener("click", function () {
      const c = vd.items[vd.selected >= 0 ? vd.selected : vd.active];
      if (!c) { $("vd-say-result").textContent = "Hãy chọn một câu trong danh sách trước."; return; }
      $("vd-player").pause();
      sayAgain(c.en, 0, $("vd-say-result"), this, "");
    });
    $("vd-hide-en").addEventListener("change", function () { paintCaption(vd.active >= 0 ? vd.items[vd.active] : null); });
    $("vd-hide-vi").addEventListener("change", function () { paintCaption(vd.active >= 0 ? vd.items[vd.active] : null); });
    renderCues();
  }

  /* ---------------- Vòng đời ---------------- */
  function init() {
    if (initialised || !$("panel-media")) return;
    initialised = true;
    initDialogs();
    initVideo();
    selectWeek(window.RM.week >= 1 && window.RM.week <= 12 ? window.RM.week : 1);
  }

  function render() {
    if (!initialised) return;
    if (window.RM.week >= 1 && window.RM.week <= 12 && !st.id) selectWeek(window.RM.week);
  }

  function stop() {
    if (!initialised) return;
    if (st.playing) pause();
    const v = $("vd-player");
    if (v && !v.paused) v.pause();
  }

  window.RM.media = { init: init, render: render, stop: stop, selectWeek: function (n) { if (initialised && n >= 1 && n <= 12) selectWeek(n); } };
})();
