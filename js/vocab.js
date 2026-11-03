/* ============================================================
 * vocab.js — Tab Từ vựng: kho ~3000 từ (bản nháp), flashcard, ôn tập Leitner 5 hộp,
 * tìm kiếm/lọc, nhập CSV/JSON, xuất CSV.
 * Ý tưởng Leitner lấy từ english-daily/js/storage.js (chép riêng, không liên kết chéo).
 * Dữ liệu tuần nạp theo yêu cầu: js/vocab/weekNN.js đăng ký vào RM.vocabData[N].
 * Khóa lưu trữ riêng: englishRoadmap.vocab.v1. Đăng ký vào window.RM.vocab.
 * ============================================================ */
(function () {
  "use strict";
  window.RM = window.RM || {};
  window.RM.vocabData = window.RM.vocabData || {};

  const STORE_KEY = "englishRoadmap.vocab.v1";
  const WEEKS = 12;
  const MAX_CUSTOM = 5000;
  const MAX_CARDS = 12000;
  const MAX_FILE_BYTES = 3 * 1024 * 1024;
  const PAGE = 50;
  // Số ngày tới lần ôn kế tiếp theo hộp (giống english-daily): đúng thì lên hộp, sai thì về hộp 1
  const INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
  // Số mục mỗi tuần (để hiện thanh tiến độ khi chưa nạp file tuần). Khi nạp xong sẽ dùng số thật.
  const MANIFEST = { 1: 250, 2: 250, 3: 255, 4: 248, 5: 252, 6: 247, 7: 264, 8: 248, 9: 256, 10: 248, 11: 241, 12: 246 };
  const COLUMNS = ["w", "ipa", "pos", "vi", "ex", "exVi", "topic", "week"];
  const COL_LOOKUP = { w: "w", ipa: "ipa", pos: "pos", vi: "vi", ex: "ex", exvi: "exVi", topic: "topic", week: "week" };
  const ID_RE = /^(w(0[1-9]|1[0-2]):|c:).{1,100}$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  // ---------- Tiện ích ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        const v = props[k];
        if (v === false || v == null) return;
        if (k === "text") node.textContent = v;
        else if (k === "class") node.className = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function todayKey() { const d = new Date(); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function addDays(key, n) {
    const p = key.split("-");
    const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function clampInt(v, lo, hi) { const n = Math.floor(Number(v)); return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo; }
  function cleanText(v, max) {
    if (typeof v === "number") v = String(v);
    if (typeof v !== "string") return "";
    return v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  }
  function itemId(week, w) { return "w" + pad2(week) + ":" + w.toLowerCase(); }
  function say(text) { const s = $("vc-status"); if (s) s.textContent = text; }
  function live(text) { const s = $("vc-live"); if (s) s.textContent = text; }

  // ---------- Kiểm tra một mục (dùng cho import và sanitize) ----------
  /** Trả về {item} hoặc {error}. Khóa không phân biệt hoa thường. */
  function cleanItem(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "không phải một đối tượng" };
    const o = {};
    Object.keys(raw).forEach(function (k) {
      const c = COL_LOOKUP[String(k).trim().toLowerCase()];
      if (c) o[c] = raw[k];
    });
    const w = cleanText(o.w, 80);
    const vi = cleanText(o.vi, 200);
    if (!w) return { error: "thiếu cột w (từ tiếng Anh)" };
    if (!/[A-Za-z]/.test(w)) return { error: "w \"" + w + "\" không có chữ cái tiếng Anh" };
    if (!vi) return { error: "thiếu cột vi (nghĩa) cho \"" + w + "\"" };
    let week = 0;
    const wk = cleanText(o.week, 4);
    if (wk !== "") {
      if (!/^\d{1,2}$/.test(wk) || Number(wk) > WEEKS) return { error: "week \"" + wk + "\" phải là số từ 0 đến " + WEEKS };
      week = Number(wk);
    }
    return {
      item: {
        w: w, ipa: cleanText(o.ipa, 100).replace(/^\/|\/$/g, ""), pos: cleanText(o.pos, 20), vi: vi,
        ex: cleanText(o.ex, 300), exVi: cleanText(o.exVi, 300), topic: cleanText(o.topic, 40), week: week
      }
    };
  }

  // ---------- Lưu trữ ----------
  function defaults() {
    return {
      schema: "englishRoadmap.vocab", version: 1, cards: {}, custom: [],
      settings: { scope: "", dailyNew: 20, useBuiltin: true, useDraftIpa: false }
    };
  }
  function sanitize(raw) {
    const d = defaults();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
    if (raw.cards && typeof raw.cards === "object") {
      let n = 0;
      Object.keys(raw.cards).forEach(function (k) {
        if (n >= MAX_CARDS || !ID_RE.test(k)) return;
        const c = raw.cards[k];
        if (!c || typeof c !== "object") return;
        const box = Math.floor(Number(c.box));
        d.cards[k] = {
          box: box >= 1 && box <= 5 ? box : 1,
          due: typeof c.due === "string" && DATE_RE.test(c.due) ? c.due : todayKey(),
          seen: clampInt(c.seen, 0, 99999), wrong: clampInt(c.wrong, 0, 99999), known: c.known === true
        };
        n++;
      });
    }
    if (Array.isArray(raw.custom)) {
      const seen = Object.create(null);
      raw.custom.forEach(function (r) {
        if (d.custom.length >= MAX_CUSTOM) return;
        const res = cleanItem(r);
        if (!res.item) return;
        const k = res.item.w.toLowerCase();
        if (seen[k]) return;
        seen[k] = true;
        d.custom.push(res.item);
      });
    }
    const s = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
    if (typeof s.scope === "string" && /^(all|custom|([1-9]|1[0-2]))$/.test(s.scope)) d.settings.scope = s.scope;
    if ([10, 20, 30, 50].indexOf(s.dailyNew) >= 0) d.settings.dailyNew = s.dailyNew;
    d.settings.useBuiltin = s.useBuiltin !== false;
    d.settings.useDraftIpa = s.useDraftIpa === true;
    return d;
  }

  let persistent = true;
  let data = defaults();
  function loadStore() {
    try {
      const txt = window.localStorage.getItem(STORE_KEY);
      data = txt ? sanitize(JSON.parse(txt)) : defaults();
    } catch (e) {
      data = defaults();
      persistent = false;
    }
  }
  function saveStore() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); persistent = true; }
    catch (e) { persistent = false; say("Không lưu được tiến độ từ vựng vào trình duyệt (bộ nhớ đầy hoặc bị chặn)."); }
  }
  const store = {
    exportObj: function () { return JSON.parse(JSON.stringify(data)); },
    importObj: function (o) {
      if (!o || typeof o !== "object" || o.schema !== "englishRoadmap.vocab") return { ok: false, message: "Không phải dữ liệu từ vựng của Lộ trình." };
      if (typeof o.version === "number" && o.version > 1) return { ok: false, message: "Phiên bản dữ liệu từ vựng mới hơn, chưa hỗ trợ." };
      data = sanitize(o);
      saveStore();
      return { ok: true, message: "Đã nhập tiến độ từ vựng." };
    },
    reset: function () { data = defaults(); saveStore(); },
    isPersistent: function () { return persistent; },
    sanitize: sanitize
  };

  // ---------- Kho từ (nạp theo yêu cầu) ----------
  const cache = {};     // tuần -> mảng mục đã gắn id
  const pending = {};   // tuần -> Promise đang nạp
  function weekFile(n) { return "js/vocab/week" + pad2(n) + ".js"; }

  function absorb(n) {
    const src = window.RM.vocabData[n];
    if (!src || !Array.isArray(src.items)) return null;
    const out = [];
    const seen = Object.create(null);
    src.items.forEach(function (r) {
      const w = cleanText(r && r.w, 80);
      if (!w || seen[w.toLowerCase()]) return;
      seen[w.toLowerCase()] = true;
      out.push({
        id: itemId(n, w), week: n, w: w, ipa: cleanText(r.ipa, 100), pos: cleanText(r.pos, 20), vi: cleanText(r.vi, 200),
        ex: cleanText(r.ex, 300), exVi: cleanText(r.exVi, 300), topic: cleanText(r.topic, 40),
        draft: !(r.draft === false || src.draft === false)
      });
    });
    return out;
  }

  function loadWeek(n) {
    if (cache[n]) return Promise.resolve(cache[n]);
    if (pending[n]) return pending[n];
    pending[n] = new Promise(function (resolve, reject) {
      const done = function () {
        const items = absorb(n);
        if (items) { cache[n] = items; resolve(items); } else reject(new Error("Dữ liệu tuần " + n + " không đúng định dạng"));
      };
      if (window.RM.vocabData[n]) { done(); return; }
      const s = document.createElement("script");
      s.src = weekFile(n);
      s.async = true;
      s.onload = done;
      s.onerror = function () { reject(new Error("Không tải được " + weekFile(n))); };
      document.head.appendChild(s);
    }).then(function (v) { delete pending[n]; return v; }, function (e) { delete pending[n]; throw e; });
    return pending[n];
  }

  function weeksOfScope(scope) {
    if (!data.settings.useBuiltin || scope === "custom") return [];
    if (scope === "all") { const a = []; for (let i = 1; i <= WEEKS; i++) a.push(i); return a; }
    return [Number(scope)];
  }

  /** Nạp các tuần của phạm vi. Trả về danh sách tuần lỗi. */
  function loadScope(scope) {
    const weeks = weeksOfScope(scope);
    return Promise.all(weeks.map(function (n) {
      return loadWeek(n).then(function () { return 0; }, function () { return n; });
    })).then(function (r) { return r.filter(Boolean); });
  }

  function customItems() {
    return data.custom.map(function (c) {
      return { id: "c:" + c.w.toLowerCase(), week: c.week, w: c.w, ipa: c.ipa, pos: c.pos, vi: c.vi, ex: c.ex, exVi: c.exVi, topic: c.topic, draft: false, custom: true };
    });
  }

  /** Các mục của phạm vi (chỉ những tuần đã nạp). */
  function scopeItems(scope) {
    let out = [];
    weeksOfScope(scope).forEach(function (n) { if (cache[n]) out = out.concat(cache[n]); });
    const cu = customItems().filter(function (c) {
      return scope === "all" || scope === "custom" || c.week === Number(scope);
    });
    return out.concat(cu);
  }

  function weekCount(n) {
    const built = data.settings.useBuiltin ? (cache[n] ? cache[n].length : MANIFEST[n]) : 0;
    return built;
  }
  function scopeTotal(scope) {
    let t = 0;
    weeksOfScope(scope).forEach(function (n) { t += weekCount(n); });
    t += customItems().filter(function (c) { return scope === "all" || scope === "custom" || c.week === Number(scope); }).length;
    return t;
  }

  // ---------- Leitner ----------
  function cardOf(id) { return data.cards[id] || null; }
  function grade(id, correct) {
    const c = data.cards[id] || { box: 1, due: todayKey(), seen: 0, wrong: 0, known: false };
    c.seen++;
    if (correct) c.box = Math.min(5, c.box + 1);
    else { c.box = 1; c.wrong++; }
    c.due = addDays(todayKey(), INTERVAL_DAYS[c.box]);
    data.cards[id] = c;
    saveStore();
    return c;
  }
  function setKnown(id, known) {
    const c = data.cards[id] || { box: 1, due: todayKey(), seen: 0, wrong: 0, known: false };
    c.known = !!known;
    data.cards[id] = c;
    saveStore();
  }
  function stateOf(id) {
    const c = cardOf(id);
    if (!c) return "new";
    if (c.known) return "known";
    return c.due <= todayKey() ? "due" : "learning";
  }
  function dueItems(items) {
    return items.filter(function (it) { return stateOf(it.id) === "due"; })
      .sort(function (a, b) { return data.cards[a.id].box - data.cards[b.id].box; });
  }

  // ---------- Trạng thái giao diện ----------
  const view = { scope: "1", topic: "", pos: "", status: "all", query: "", shown: PAGE };
  let session = null;
  let rendering = 0;
  let bound = false;

  function currentScope() {
    if (!view.scope) view.scope = data.settings.scope || String((window.RM && RM.week) || 1);
    return view.scope;
  }

  function filteredItems(ignoreStatus) {
    const items = scopeItems(currentScope());
    const q = view.query.toLowerCase();
    return items.filter(function (it) {
      if (view.topic && it.topic !== view.topic) return false;
      if (view.pos && it.pos !== view.pos) return false;
      if (q && it.w.toLowerCase().indexOf(q) < 0 && it.vi.toLowerCase().indexOf(q) < 0) return false;
      if (!ignoreStatus && view.status !== "all") {
        const s = stateOf(it.id);
        if (view.status === "learning" ? (s !== "learning" && s !== "due") : s !== view.status) return false;
      }
      return true;
    });
  }

  function speakWord(text) {
    if (window.RM && RM.speech && RM.speech.synthSupported && RM.speech.synthSupported()) { RM.speech.speak(text, 0.9); return true; }
    say("Trình duyệt không hỗ trợ đọc giọng nói.");
    return false;
  }

  // ---------- Vẽ giao diện ----------
  function fillSelect(sel, values, current, allLabel) {
    clear(sel);
    sel.appendChild(el("option", { value: "", text: allLabel }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
    sel.value = values.indexOf(current) >= 0 ? current : "";
    return sel.value;
  }

  function renderScopeSelect() {
    const sel = $("vc-scope");
    clear(sel);
    for (let i = 1; i <= WEEKS; i++) sel.appendChild(el("option", { value: String(i), text: "Tuần " + i }));
    sel.appendChild(el("option", { value: "all", text: "Tất cả các tuần" }));
    sel.appendChild(el("option", { value: "custom", text: "Từ của tôi (nhập từ file)" }));
    sel.value = currentScope();
  }

  function renderFilters() {
    const items = scopeItems(currentScope());
    const topics = {}, poss = {};
    items.forEach(function (it) { if (it.topic) topics[it.topic] = 1; if (it.pos) poss[it.pos] = 1; });
    view.topic = fillSelect($("vc-topic"), Object.keys(topics).sort(), view.topic, "Mọi chủ đề");
    view.pos = fillSelect($("vc-pos"), Object.keys(poss).sort(), view.pos, "Mọi loại từ");
  }

  function setBar(barId, fillId, pct) {
    $(barId).setAttribute("aria-valuenow", String(pct));
    $(fillId).style.width = pct + "%";
  }

  function renderProgress() {
    // Tổng: đếm từ "đã thuộc" theo id, không cần nạp hết file
    let total = scopeTotal("all"), known = 0;
    const customIds = Object.create(null);
    customItems().forEach(function (c) { customIds[c.id] = 1; });
    Object.keys(data.cards).forEach(function (id) {
      if (!data.cards[id].known) return;
      if (id.charAt(0) === "c") { if (customIds[id]) known++; }
      else if (data.settings.useBuiltin) known++;
    });
    if (known > total) known = total;
    const pct = total ? Math.round((known / total) * 100) : 0;
    $("vc-total-text").textContent = "Đã thuộc " + known + "/" + total + " từ · " + pct + "%";
    setBar("vc-total-bar", "vc-total-fill", pct);

    const scope = currentScope();
    const st = scopeStats(scope);
    const t2 = st.total;
    const p2 = t2 ? Math.round((st.known / t2) * 100) : 0;
    $("vc-scope-text").textContent = "Phạm vi đang chọn: đã thuộc " + st.known + "/" + t2 + " từ · " + p2 + "%";
    setBar("vc-scope-bar", "vc-scope-fill", p2);

    const box = $("vc-boxes");
    clear(box);
    box.appendChild(el("li", { class: "lbox" }, [el("span", { class: "lbox-n", text: String(st.fresh) }), el("span", { class: "lbox-l", text: "Mới" })]));
    for (let b = 1; b <= 5; b++) {
      box.appendChild(el("li", { class: "lbox" }, [el("span", { class: "lbox-n", text: String(st.boxes[b]) }), el("span", { class: "lbox-l", text: "Hộp " + b })]));
    }
    box.appendChild(el("li", { class: "lbox known" }, [el("span", { class: "lbox-n", text: String(st.known) }), el("span", { class: "lbox-l", text: "Đã thuộc" })]));
    box.appendChild(el("li", { class: "lbox due" }, [el("span", { class: "lbox-n", text: String(st.due) }), el("span", { class: "lbox-l", text: "Đến hạn hôm nay" })]));
  }

  function scopeStats(scope) {
    const st = { total: scopeTotal(scope), known: 0, due: 0, fresh: 0, boxes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const customMap = Object.create(null);
    customItems().forEach(function (c) { customMap[c.id] = c; });
    const today = todayKey();
    let counted = 0;
    Object.keys(data.cards).forEach(function (id) {
      let inScope;
      if (id.charAt(0) === "c") {
        const c = customMap[id];
        inScope = !!c && (scope === "all" || scope === "custom" || c.week === Number(scope));
      } else if (!data.settings.useBuiltin || scope === "custom") inScope = false;
      else inScope = scope === "all" || id.slice(0, 3) === "w" + pad2(Number(scope));
      if (!inScope) return;
      counted++;
      const c = data.cards[id];
      if (c.known) { st.known++; return; }
      st.boxes[c.box]++;
      if (c.due <= today) st.due++;
    });
    st.fresh = Math.max(0, st.total - counted);
    return st;
  }

  function renderList() {
    const items = filteredItems(false);
    const ul = $("vc-list");
    clear(ul);
    const shown = items.slice(0, view.shown);
    shown.forEach(function (it) {
      const known = stateOf(it.id) === "known";
      const head = el("div", { class: "vc-row-main" }, [
        el("strong", { class: "vc-w", lang: "en", text: it.w }),
        it.ipa ? el("span", { class: "vc-ipa", text: " /" + it.ipa + "/" }) : null,
        it.pos ? el("span", { class: "tag", text: it.pos }) : null,
        el("span", { class: "vc-vi", text: it.vi })
      ]);
      const meta = it.ex ? el("div", { class: "muted small", lang: "en", text: it.ex + (it.exVi ? " — " + it.exVi : "") }) : null;
      const btns = el("div", { class: "vc-row-btns" }, [
        el("button", { type: "button", class: "btn small", "data-act": "speak", "data-id": it.id, "aria-label": "Nghe phát âm " + it.w, text: "🔊" }),
        el("button", { type: "button", class: "btn small", "data-act": "known", "data-id": it.id, "aria-pressed": String(known), "aria-label": "Đánh dấu đã thuộc: " + it.w, text: known ? "✓ Đã thuộc" : "Đánh dấu thuộc" })
      ]);
      ul.appendChild(el("li", { class: "vc-row" }, [el("div", null, [head, meta]), btns]));
    });
    $("vc-count").textContent = "Hiển thị " + shown.length + "/" + items.length + " từ";
    $("vc-more").classList.toggle("hidden", items.length <= shown.length);
    if (!items.length) ul.appendChild(el("li", { class: "muted", text: "Không có từ nào khớp bộ lọc." }));
  }

  // ----- Flashcard -----
  function buildQueue() {
    const items = filteredItems(true).filter(function (it) { return stateOf(it.id) !== "known"; });
    const due = dueItems(items);
    const fresh = items.filter(function (it) { return stateOf(it.id) === "new"; }).slice(0, data.settings.dailyNew);
    return due.concat(fresh);
  }

  function startSession() {
    const q = buildQueue();
    if (!q.length) {
      session = null;
      renderCard();
      live("Không có thẻ nào đến hạn hoặc mới trong phạm vi và bộ lọc này.");
      return;
    }
    session = { queue: q, idx: 0, flipped: false, right: 0, wrong: 0, requeued: Object.create(null), total: q.length };
    renderCard();
    announceCard();
    $("vc-card").focus();
  }

  function current() { return session && session.idx < session.queue.length ? session.queue[session.idx] : null; }

  function announceCard() {
    const it = current();
    if (it) live("Thẻ " + (session.idx + 1) + " trên " + session.queue.length + ": " + it.w);
  }

  function renderCard() {
    const box = $("vc-card-body");
    clear(box);
    const it = current();
    if (!session) {
      box.appendChild(el("p", { class: "muted", text: "Chọn phạm vi rồi bấm \"Bắt đầu phiên học\". Thẻ đến hạn ôn được xếp trước, sau đó là từ mới (tối đa " + data.settings.dailyNew + " từ mỗi phiên)." }));
      setCardButtons(false);
      return;
    }
    if (!it) {
      box.appendChild(el("p", { class: "vc-done", text: "Hoàn thành phiên học." }));
      box.appendChild(el("p", { text: "Nhớ: " + session.right + " · Chưa nhớ: " + session.wrong + " · Số thẻ: " + session.total }));
      setCardButtons(false);
      live("Hoàn thành phiên học. Nhớ " + session.right + ", chưa nhớ " + session.wrong + ".");
      return;
    }
    $("vc-progress").textContent = "Thẻ " + (session.idx + 1) + "/" + session.queue.length + " · Hộp " + (cardOf(it.id) ? cardOf(it.id).box : 1) + (cardOf(it.id) ? "" : " (từ mới)");
    box.appendChild(el("div", { class: "vc-front", lang: "en", text: it.w }));
    if (session.flipped) {
      box.appendChild(el("div", { class: "vc-back" }, [
        it.ipa ? el("div", { class: "vc-ipa-big", text: "/" + it.ipa + "/" + (it.pos ? "  ·  " + it.pos : "") }) : (it.pos ? el("div", { class: "muted", text: it.pos }) : null),
        el("div", { class: "vc-meaning", text: it.vi }),
        it.ex ? el("p", { class: "vc-ex", lang: "en", text: it.ex }) : null,
        it.exVi ? el("p", { class: "muted", text: it.exVi }) : null,
        it.draft ? el("p", { class: "tag draft-tag", text: "Bản nháp, chưa rà soát: nghĩa và IPA có thể sai" }) : null
      ]));
    } else {
      box.appendChild(el("p", { class: "muted small", text: "Nhớ nghĩa trong đầu rồi lật thẻ để kiểm tra." }));
    }
    setCardButtons(true);
  }

  function setCardButtons(active) {
    const it = current();
    const flipped = !!(session && session.flipped);
    $("vc-flip").disabled = !(active && it && !flipped);
    $("vc-flip").setAttribute("aria-expanded", String(flipped));
    ["vc-wrong", "vc-right", "vc-known"].forEach(function (id) { $(id).disabled = !(active && it && flipped); });
    $("vc-speak").disabled = !(active && it);
    $("vc-say-ex").disabled = !(active && it && it.ex);
    if (!active || !it) $("vc-progress").textContent = session ? "Đã xong" : "";
  }

  function flip() {
    if (!current() || session.flipped) return;
    session.flipped = true;
    renderCard();
    const it = current();
    live("Nghĩa: " + it.vi + (it.ipa ? ". Phiên âm: " + it.ipa : "") + (it.ex ? ". Ví dụ: " + it.ex : ""));
    $("vc-card").focus();
  }

  function advance(kind) {
    const it = current();
    if (!it || !session.flipped) return;
    if (kind === "known") {
      setKnown(it.id, true);
      session.right++;
    } else {
      grade(it.id, kind === "right");
      if (kind === "right") session.right++;
      else {
        session.wrong++;
        if (!session.requeued[it.id]) { session.requeued[it.id] = true; session.queue.push(it); }
      }
    }
    session.idx++;
    session.flipped = false;
    renderCard();
    announceCard();
    renderProgress();
    renderList();
    $("vc-card").focus();
  }

  // ---------- Nhập / xuất ----------
  function detectDelimiter(text) {
    const first = text.split(/\r\n|\n|\r/, 1)[0] || "";
    const counts = { ",": 0, ";": 0, "\t": 0 };
    let q = false;
    for (let i = 0; i < first.length; i++) {
      const c = first[i];
      if (c === '"') q = !q;
      else if (!q && counts[c] !== undefined) counts[c]++;
    }
    return counts[";"] > counts[","] && counts[";"] >= counts["\t"] ? ";" : (counts["\t"] > counts[","] ? "\t" : ",");
  }

  /** Phân tích CSV theo RFC 4180 (ô có ngoặc kép, dấu phẩy và xuống dòng trong ô). */
  function parseCsv(text, delim) {
    const rows = [], lines = [];
    let row = [], f = "", q = false, line = 1, startLine = 1, qLine = 0;
    function endRow() {
      row.push(f);
      if (!(row.length === 1 && row[0].trim() === "")) { rows.push(row); lines.push(startLine); }
      row = []; f = "";
    }
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else { if (c === "\n") line++; f += c; }
      } else if (c === '"' && f === "") { q = true; qLine = line; }
      else if (c === delim) { row.push(f); f = ""; }
      else if (c === "\r" || c === "\n") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        line++;
        endRow();
        startLine = line;
      } else f += c;
    }
    if (q) return { error: "Dấu ngoặc kép mở ở dòng " + qLine + " chưa được đóng." };
    if (f !== "" || row.length) endRow();
    return { rows: rows, lines: lines };
  }

  function unprefix(v) { return /^'[=+\-@]/.test(v) ? v.slice(1) : v; }

  /** Đọc nội dung file thành {items, errors, rows} hoặc {fatal}. */
  function parseImport(text, fileName) {
    text = text.replace(/^\uFEFF/, "");
    if (!text.trim()) return { fatal: "File rỗng." };
    const errors = [];
    const items = [];
    const isJson = /\.json$/i.test(fileName) || /^\s*[\[{]/.test(text);
    let records = [];
    if (isJson) {
      let j;
      try { j = JSON.parse(text); } catch (e) { return { fatal: "File JSON không hợp lệ: " + e.message }; }
      if (j && !Array.isArray(j) && Array.isArray(j.items)) j = j.items;
      if (!Array.isArray(j)) return { fatal: "JSON phải là một mảng các đối tượng, ví dụ [{\"w\":\"hello\",\"vi\":\"xin chào\"}]." };
      records = j.map(function (r, i) { return { raw: r, label: "Mục " + (i + 1) }; });
    } else {
      const delim = detectDelimiter(text);
      const p = parseCsv(text, delim);
      if (p.error) return { fatal: p.error };
      if (!p.rows.length) return { fatal: "File CSV không có dòng nào." };
      const header = p.rows[0].map(function (h) { return COL_LOOKUP[cleanText(h, 30).toLowerCase()] || null; });
      if (header.indexOf("w") < 0 || header.indexOf("vi") < 0) {
        return { fatal: "Dòng tiêu đề phải có tối thiểu hai cột \"w\" và \"vi\". Các cột hợp lệ: " + COLUMNS.join(", ") + "." };
      }
      for (let r = 1; r < p.rows.length; r++) {
        const row = p.rows[r];
        if (row.length > p.rows[0].length) { errors.push("Dòng " + p.lines[r] + ": có " + row.length + " ô nhưng tiêu đề chỉ có " + p.rows[0].length + " cột (kiểm tra dấu phẩy hoặc ngoặc kép)."); continue; }
        const obj = {};
        header.forEach(function (h, c) { if (h) obj[h] = unprefix(row[c] === undefined ? "" : row[c]); });
        records.push({ raw: obj, label: "Dòng " + p.lines[r] });
      }
    }
    if (records.length > MAX_CUSTOM * 2) return { fatal: "File có quá nhiều dòng (tối đa " + MAX_CUSTOM + " mục)." };
    records.forEach(function (r) {
      const res = cleanItem(r.raw);
      if (res.item) items.push(res.item); else errors.push(r.label + ": " + res.error + ".");
    });
    return { items: items, errors: errors, rows: records.length };
  }

  function showImportResult(lines, ok) {
    const box = $("vc-import-result");
    clear(box);
    box.classList.remove("hidden");
    box.classList.toggle("warn", !ok);
    lines.forEach(function (l) {
      if (Array.isArray(l)) box.appendChild(el("ul", null, l.map(function (x) { return el("li", { text: x }); })));
      else box.appendChild(el("p", { text: l }));
    });
  }

  function handleImportText(text, fileName) {
    const mode = document.querySelector('input[name="vc-import-mode"]:checked').value;
    const parsed = parseImport(text, fileName);
    if (parsed.fatal) { showImportResult(["Không nhập được: " + parsed.fatal], false); say("Nhập thất bại: " + parsed.fatal); return; }
    if (!parsed.items.length) {
      showImportResult(["Không có mục hợp lệ nào để nhập (" + parsed.errors.length + " lỗi). Kho giữ nguyên.", parsed.errors.slice(0, 10)], false);
      say("Không có mục hợp lệ nào, kho giữ nguyên.");
      return;
    }
    if (mode === "replace" && !window.confirm("Thay toàn bộ kho? Kho có sẵn sẽ bị ẩn và chỉ dùng " + parsed.items.length + " từ trong file. Có thể khôi phục bằng nút \"Khôi phục kho có sẵn\". Tiếp tục?")) {
      say("Đã hủy nhập.");
      return;
    }
    say("Đang xử lý file...");
    const prepare = mode === "add" && data.settings.useBuiltin ? loadScope("all") : Promise.resolve([]);
    prepare.then(function (failed) {
      const known = Object.create(null);
      let dup = 0, over = 0;
      if (mode === "add") {
        for (let n = 1; n <= WEEKS; n++) if (cache[n]) cache[n].forEach(function (it) { known[it.w.toLowerCase()] = true; });
        data.custom.forEach(function (c) { known[c.w.toLowerCase()] = true; });
      } else data.custom = [];
      let added = 0;
      parsed.items.forEach(function (it) {
        const k = it.w.toLowerCase();
        if (known[k]) { dup++; return; }
        if (data.custom.length >= MAX_CUSTOM) { over++; return; }
        known[k] = true;
        data.custom.push(it);
        added++;
      });
      if (mode === "replace") data.settings.useBuiltin = false;
      saveStore();
      const lines = [(mode === "replace" ? "Đã thay kho: " : "Đã bổ sung: ") + added + " từ mới. Bỏ qua " + dup + " từ trùng, " + parsed.errors.length + " dòng lỗi" + (over ? ", " + over + " từ vượt giới hạn " + MAX_CUSTOM : "") + "."];
      if (failed.length) lines.push("Lưu ý: không đối chiếu được với tuần " + failed.join(", ") + " (không nạp được file).");
      if (parsed.errors.length) { lines.push("Các lỗi đầu tiên (tối đa 10):"); lines.push(parsed.errors.slice(0, 10)); }
      showImportResult(lines, true);
      say("Đã nhập " + added + " từ.");
      session = null;
      refresh();
    });
  }

  function csvCell(v) {
    let s = String(v == null ? "" : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // chống công thức khi mở bằng Excel
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCsv() {
    say("Đang chuẩn bị file CSV...");
    loadScope("all").then(function (failed) {
      let items = [];
      for (let n = 1; n <= WEEKS; n++) if (cache[n] && data.settings.useBuiltin) items = items.concat(cache[n]);
      items = items.concat(customItems());
      const rows = [COLUMNS.join(",")];
      items.forEach(function (it) {
        rows.push([it.w, it.ipa, it.pos, it.vi, it.ex, it.exVi, it.topic, it.week].map(csvCell).join(","));
      });
      const blob = new Blob(["\uFEFF" + rows.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "english-roadmap-tu-vung-" + todayKey() + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      say("Đã xuất " + items.length + " từ ra CSV" + (failed.length ? " (thiếu tuần " + failed.join(", ") + " vì không nạp được file)" : "") + ".");
    });
  }

  // ---------- IPA cho chấm điểm Luyện nói (tùy chọn, mặc định tắt) ----------
  function syncIpa() {
    if (!(window.RM && RM.ipa && RM.ipa.setExtra)) return;
    if (!data.settings.useDraftIpa) { RM.ipa.clearExtra(); return; }
    const map = {};
    scopeItems("all").forEach(function (it) {
      const k = it.w.toLowerCase();
      if (!/^[a-z']+$/.test(k) || !it.ipa || map[k]) return;
      // Đồng bộ ký hiệu với từ điển của Luyện nói: e (không phải eɪ) -> ɛ
      map[k] = it.ipa.replace(/[\/\s]/g, "").replace(/e(?!ɪ)/g, "ɛ");
    });
    RM.ipa.setExtra(map);
  }

  // ---------- Điều phối ----------
  function refresh() {
    const token = ++rendering;
    const scope = currentScope();
    renderScopeSelect();
    say("Đang nạp dữ liệu...");
    loadScope(scope).then(function (failed) {
      if (token !== rendering) return;
      renderFilters();
      renderProgress();
      renderList();
      renderCard();
      $("vc-draft-ipa").checked = data.settings.useDraftIpa;
      $("vc-daily").value = String(data.settings.dailyNew);
      $("vc-restore").classList.toggle("hidden", data.settings.useBuiltin);
      $("vc-persist-warn").classList.toggle("hidden", persistent);
      syncIpa();
      if (failed.length) say("Không nạp được dữ liệu tuần " + failed.join(", ") + ". Kiểm tra thư mục js/vocab/.");
      else say(scopeItems(scope).length ? "" : "Phạm vi này chưa có từ nào.");
    });
  }

  function bind() {
    if (bound) return;
    bound = true;
    function onScope() {
      view.scope = $("vc-scope").value;
      data.settings.scope = view.scope;
      saveStore();
      view.topic = ""; view.pos = ""; view.shown = PAGE; session = null;
      refresh();
    }
    $("vc-scope").addEventListener("change", onScope);
    $("vc-topic").addEventListener("change", function () { view.topic = this.value; view.shown = PAGE; session = null; renderList(); renderCard(); });
    $("vc-pos").addEventListener("change", function () { view.pos = this.value; view.shown = PAGE; session = null; renderList(); renderCard(); });
    $("vc-status-filter").addEventListener("change", function () { view.status = this.value; view.shown = PAGE; renderList(); });
    $("vc-search").addEventListener("input", function () { view.query = this.value.trim(); view.shown = PAGE; session = null; renderList(); renderCard(); });
    $("vc-more").addEventListener("click", function () { view.shown += PAGE; renderList(); });
    $("vc-daily").addEventListener("change", function () { data.settings.dailyNew = Number(this.value) || 20; saveStore(); session = null; renderCard(); });
    $("vc-draft-ipa").addEventListener("change", function () {
      data.settings.useDraftIpa = this.checked;
      saveStore();
      if (this.checked) loadScope("all").then(function () { syncIpa(); say("Đã bật: Luyện nói dùng thêm IPA bản nháp của kho."); });
      else { syncIpa(); say("Đã tắt IPA của kho khi chấm điểm."); }
    });

    $("vc-start").addEventListener("click", startSession);
    $("vc-flip").addEventListener("click", flip);
    $("vc-wrong").addEventListener("click", function () { advance("wrong"); });
    $("vc-right").addEventListener("click", function () { advance("right"); });
    $("vc-known").addEventListener("click", function () { advance("known"); });
    $("vc-speak").addEventListener("click", function () { const it = current(); if (it) speakWord(it.w); });
    $("vc-say-ex").addEventListener("click", function () {
      const it = current();
      if (it && it.ex && window.RM && RM.speech && RM.speech.setTarget) RM.speech.setTarget(it.ex, it.week || (window.RM.week || 1), true);
    });
    // Phím tắt chỉ chạy khi tiêu điểm nằm ở khung thẻ (không chặn các nút bên trong)
    $("vc-card").addEventListener("keydown", function (e) {
      if (e.target !== this || e.ctrlKey || e.altKey || e.metaKey) return;
      const it = current();
      if (!it) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!session.flipped) flip(); }
      else if (e.key === "1") { e.preventDefault(); advance("wrong"); }
      else if (e.key === "2") { e.preventDefault(); advance("right"); }
      else if (e.key === "3") { e.preventDefault(); advance("known"); }
      else if (e.key === "p" || e.key === "P") { e.preventDefault(); speakWord(it.w); }
    });

    $("vc-list").addEventListener("click", function (e) {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const id = b.getAttribute("data-id");
      const it = scopeItems(currentScope()).filter(function (x) { return x.id === id; })[0];
      if (!it) return;
      if (b.getAttribute("data-act") === "speak") speakWord(it.w);
      else {
        setKnown(id, stateOf(id) !== "known");
        renderProgress();
        renderList();
        const nb = $("vc-list").querySelector('button[data-act="known"][data-id="' + id.replace(/(["\\])/g, "\\$1") + '"]');
        if (nb) nb.focus();
      }
    });

    $("vc-export-csv").addEventListener("click", exportCsv);
    $("vc-import").addEventListener("click", function () { $("vc-file").click(); });
    $("vc-file").addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      if (file.size > MAX_FILE_BYTES) { showImportResult(["File quá lớn (tối đa 3 MB)."], false); say("File quá lớn."); return; }
      const reader = new FileReader();
      reader.onload = function () { handleImportText(String(reader.result), file.name); };
      reader.onerror = function () { showImportResult(["Không đọc được file."], false); say("Không đọc được file."); };
      reader.readAsText(file, "utf-8");
    });
    $("vc-restore").addEventListener("click", function () {
      if (!window.confirm("Khôi phục kho có sẵn và xóa danh sách từ đã nhập? Tiến độ học các từ có sẵn được giữ lại.")) { say("Đã hủy."); return; }
      data.custom = [];
      data.settings.useBuiltin = true;
      saveStore();
      session = null;
      say("Đã khôi phục kho có sẵn.");
      refresh();
    });
    $("vc-reset").addEventListener("click", function () {
      if (!window.confirm("Xóa toàn bộ tiến độ từ vựng (hộp Leitner, từ đã thuộc)? Không hoàn tác được.")) { say("Đã hủy, tiến độ từ vựng vẫn giữ nguyên."); return; }
      data.cards = {};
      saveStore();
      session = null;
      say("Đã xóa tiến độ từ vựng.");
      refresh();
    });
  }

  function init() {
    loadStore();
    // Nếu người dùng đã bật IPA kho cho chấm điểm, nạp nền sau khi trang đã sẵn sàng
    if (data.settings.useDraftIpa) {
      window.setTimeout(function () { loadScope("all").then(syncIpa); }, 1500);
    }
  }

  function render() {
    if (!$("vc-scope")) return;
    bind();
    view.scope = view.scope || "";
    refresh();
  }

  function selectWeek(n) {
    n = Number(n);
    if (n >= 1 && n <= WEEKS) { view.scope = String(n); data.settings.scope = view.scope; saveStore(); }
  }

  window.RM.vocab = {
    init: init, render: render, selectWeek: selectWeek, loadWeek: loadWeek, store: store,
    grade: grade, parseCsv: parseCsv, parseImport: parseImport, cleanItem: cleanItem, csvCell: csvCell,
    intervals: INTERVAL_DAYS, manifest: MANIFEST
  };
  if (typeof module !== "undefined" && module.exports) module.exports = window.RM.vocab;
})();
