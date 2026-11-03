/* ============================================================
 * speech.js — Luyện nói: nhận diện giọng (SpeechRecognition), đọc mẫu (SpeechSynthesis),
 * chấm điểm so khớp văn bản, lưu lịch sử, biểu đồ tuần. Đăng ký vào window.RM.speech.
 *
 * LƯU Ý: điểm là mức KHỚP VĂN BẢN mà trình duyệt nhận diện được so với câu mẫu,
 * KHÔNG phải chấm phát âm theo từng âm.
 *
 * API dùng lại cho các bước sau:
 *   RM.speech.speak(text, rate)            đọc mẫu
 *   RM.speech.score(target, said)          -> {total, wordScore, ipaScore, ok, missing, wrong, extra, tokens}
 *   RM.speech.setTarget(text, week, go)    đặt câu luyện (go=true: chuyển sang tab Luyện nói)
 *   RM.speech.todayCount()                 số câu đã chấm hôm nay (cho việc "Nói 10 câu")
 *   RM.speech.store                        kho lịch sử (englishRoadmap.speaking.v1)
 *   Sự kiện document "rm-speaking-scored" (detail = bản ghi vừa lưu)
 * ============================================================ */
(function () {
  "use strict";
  window.RM = window.RM || {};
  const IPA = window.RM.ipa;

  const STORE_KEY = "englishRoadmap.speaking.v1";
  const MAX_HISTORY = 500;
  const DAILY_GOAL = 10;

  /* ---------------- Kho câu luyện theo tuần (khớp chủ đề 12 tuần) ---------------- */
  const SENTENCES = {
    1: ["Hi, how are you doing today?", "My name is Linh, nice to meet you.", "Where are you from?", "Could you say that again, please?", "I'm doing great, thanks.", "Nice to see you again.", "It's been a while.", "Let's catch up over coffee sometime."],
    2: ["I have two brothers and one sister.", "I usually get up at six in the morning.", "What time do you wake up?", "How many people are in your family?", "I live with my parents.", "My father works in a bank.", "Please say it one more time.", "I usually have breakfast at seven."],
    3: ["How much is this shirt?", "Do you have this in a larger size?", "Can I pay by card?", "I'm just looking, thanks.", "Excuse me, where is the fitting room?", "Is there a discount today?", "Could I have a receipt, please?", "It's twenty dollars."],
    4: ["I'd like a table for two, please.", "What do you recommend?", "Could we have the bill, please?", "I'm allergic to nuts.", "I'll have the grilled salmon.", "Can I have some water, please?", "Could we split the bill?", "This menu sounds very good."],
    5: ["Excuse me, how do I get to the station?", "Turn left at the corner.", "Go straight and then turn right.", "How long does it take to walk there?", "Is it far from here?", "It's about five minutes on foot.", "The bank is next to the station.", "Thank you so much for your help."],
    6: ["Hello, this is Linh speaking.", "Can we meet at ten tomorrow morning?", "Sorry, could you speak more slowly?", "Can I leave a message?", "Please hold on for a moment.", "Is he available this afternoon?", "That time works for me.", "I'll call you back later."],
    7: ["I have a headache and a sore throat.", "How long have you felt like this?", "You should get some rest.", "I need to make an appointment.", "Take this medicine twice a day.", "I have a fever since yesterday.", "Do you feel better today?", "I should see a doctor."],
    8: ["It's pretty hot today.", "It might rain later, so bring an umbrella.", "What are you doing this weekend?", "I'm into reading and playing the guitar.", "Would you like to play together?", "Are you free on Saturday?", "I hope the weather clears up.", "The weather is sunny and humid."],
    9: ["Last weekend I went to see my parents.", "First, I woke up early. Then I had breakfast.", "It was really fun.", "What happened next?", "After that, we went to the park.", "Yesterday I was very tired.", "I saw an old friend last week.", "We had a great time together."],
    10: ["I work in marketing as a designer.", "Could you help me with this report?", "I'll get back to you by Friday.", "Let me summarize the main points.", "The deadline is next Monday.", "Let's schedule a meeting for tomorrow.", "I'll send you the invite.", "Are we on the same page?"],
    11: ["I have a reservation under the name Linh.", "Is breakfast included?", "There's a problem with my room.", "Could you recommend a good place to visit?", "Where is the boarding gate?", "I'd like a window seat, please.", "My flight is delayed.", "What time is check out?"],
    12: ["Let me think for a second.", "What I mean is that I need more practice.", "That's a good question.", "Can you give me an example?", "I want to keep practicing every day.", "Could you say that more slowly?", "I'm still learning, but I'm getting better.", "Thank you for talking with me today."]
  };

  /* ---------------- Tiện ích ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  /** Chuẩn hoá: chữ thường, bỏ dấu câu, giữ dấu nháy đơn trong từ. */
  function normalize(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9'\s]/g, " ").replace(/(^|\s)'+|'+(?=\s|$)/g, " ")
      .split(/\s+/).filter(Boolean);
  }

  /* ---------------- Diff cấp từ (Levenshtein + truy vết) ---------------- */
  function diff(target, said) {
    const t = normalize(target), u = normalize(said);
    const m = t.length, n = u.length;
    const dp = [];
    for (let i = 0; i <= m; i++) { dp.push(new Array(n + 1).fill(0)); dp[i][0] = i; }
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = t[i - 1] === u[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      }
    }
    const out = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (t[i - 1] === u[j - 1] ? 0 : 1)) {
        out.push(t[i - 1] === u[j - 1] ? { word: t[i - 1], status: "ok" } : { word: t[i - 1], status: "wrong", said: u[j - 1] });
        i--; j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        out.push({ word: t[i - 1], status: "missing" }); i--;
      } else {
        out.push({ word: u[j - 1], status: "extra" }); j--;
      }
    }
    return out.reverse();
  }

  /**
   * Điểm 0..100. wordScore = từ đúng theo thứ tự / (số từ mẫu + từ thừa).
   * ipaScore chỉ tính trên các từ có trong từ điển IPA (null nếu không có từ nào). Tổng = 70% từ + 30% IPA.
   */
  function score(target, said) {
    const tokens = diff(target, said);
    const c = { ok: 0, missing: 0, wrong: 0, extra: 0 };
    let tLen = 0, ipaSum = 0, ipaCount = 0;
    tokens.forEach(function (k) {
      c[k.status]++;
      if (k.status !== "extra") tLen++;
      if (k.status === "ok" && IPA.word(k.word) != null) { ipaSum += 100; ipaCount++; }
      else if (k.status === "missing" && IPA.word(k.word) != null) { ipaCount++; }
      else if (k.status === "wrong") {
        const s = IPA.similarity(k.word, k.said);
        if (s != null) { ipaSum += s; ipaCount++; }
      }
    });
    const denom = tLen + c.extra;
    const wordScore = tLen === 0 || denom === 0 ? 0 : Math.round((c.ok / denom) * 100);
    const ipaScore = ipaCount ? Math.round(ipaSum / ipaCount) : null;
    const total = ipaScore == null ? wordScore : Math.round(wordScore * 0.7 + ipaScore * 0.3);
    return { total: total, wordScore: wordScore, ipaScore: ipaScore, ipaCovered: ipaCount, ok: c.ok, missing: c.missing, wrong: c.wrong, extra: c.extra, tokens: tokens };
  }

  /* ---------------- Kho lịch sử ---------------- */
  const store = (function () {
    let data = { schema: "englishRoadmap.speaking", version: 1, history: [] };
    let persistent = true;

    function str(v, max) { return typeof v === "string" ? v.slice(0, max) : ""; }
    function int(v, lo, hi) { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : lo; }

    function sanitize(raw) {
      const out = { schema: "englishRoadmap.speaking", version: 1, history: [] };
      if (!raw || typeof raw !== "object" || !Array.isArray(raw.history)) return out;
      raw.history.forEach(function (e) {
        if (!e || typeof e !== "object" || !/^\d{4}-\d{2}-\d{2}$/.test(String(e.d))) return;
        out.history.push({
          t: str(e.t, 40), d: e.d, week: int(e.week, 0, 12),
          target: str(e.target, 300), said: str(e.said, 300),
          total: int(e.total, 0, 100), ok: int(e.ok, 0, 999), missing: int(e.missing, 0, 999),
          wrong: int(e.wrong, 0, 999), extra: int(e.extra, 0, 999)
        });
      });
      out.history = out.history.slice(-MAX_HISTORY);
      return out;
    }

    function load() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        data = raw ? sanitize(JSON.parse(raw)) : sanitize(null);
      } catch (e) { persistent = false; data = sanitize(null); }
    }
    function save() {
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
      catch (e) { persistent = false; }
    }
    load();

    return {
      add: function (e) {
        const rec = sanitize({ history: [e] }).history[0];
        if (!rec) return null;
        data.history.push(rec);
        data.history = data.history.slice(-MAX_HISTORY);
        save();
        return rec;
      },
      list: function () { return data.history.slice(); },
      exportObj: function () { return JSON.parse(JSON.stringify(data)); },
      importObj: function (o) {
        const s = sanitize(o);
        data = s; save();
        return { ok: true, message: "Đã nhập " + s.history.length + " bản ghi luyện nói." };
      },
      reset: function () { data = sanitize(null); save(); },
      isPersistent: function () { return persistent; },
      sanitize: sanitize
    };
  })();

  function todayCount() {
    const k = dateKey();
    return store.list().filter(function (e) { return e.d === k; }).length;
  }

  /** Trung bình theo tuần lịch (bắt đầu thứ Hai), n tuần gần nhất, cũ -> mới. */
  function weeklyAverages(n, now) {
    now = now || new Date();
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
    const weeks = [];
    for (let i = n - 1; i >= 0; i--) {
      const s = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - i * 7);
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
      weeks.push({ from: dateKey(s), to: dateKey(e), label: pad(s.getDate()) + "/" + pad(s.getMonth() + 1), sum: 0, count: 0, avg: null });
    }
    store.list().forEach(function (h) {
      for (let k = 0; k < weeks.length; k++) {
        if (h.d >= weeks[k].from && h.d <= weeks[k].to) { weeks[k].sum += h.total; weeks[k].count++; break; }
      }
    });
    weeks.forEach(function (w) { w.avg = w.count ? Math.round(w.sum / w.count) : null; });
    return weeks;
  }

  /* ---------------- Đọc mẫu (SpeechSynthesis) ---------------- */
  let voices = [];
  function loadVoices() { voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  function synthSupported() { return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window; }
  function pickVoice() {
    return voices.find(function (v) { return /en[-_]US/i.test(v.lang); }) ||
      voices.find(function (v) { return /en[-_]GB/i.test(v.lang); }) ||
      voices.find(function (v) { return /^en/i.test(v.lang); }) || null;
  }
  function speak(text, rate) {
    if (!synthSupported()) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : "en-US";
    u.rate = rate || 1;
    window.speechSynthesis.speak(u);
    return true;
  }
  function stopSpeak() { if (synthSupported()) window.speechSynthesis.cancel(); }

  /* ---------------- Nhận diện giọng nói (SpeechRecognition) ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function recognitionSupported() { return !!SR; }

  const ERR = {
    "no-speech": "Không nghe thấy gì. Hãy nói to và rõ hơn rồi thử lại.",
    "not-allowed": "Micro đang bị chặn. Hãy cho phép quyền micro cho trang này rồi thử lại.",
    "service-not-allowed": "Trình duyệt không cho dùng dịch vụ nhận diện giọng nói.",
    "audio-capture": "Không tìm thấy micro.",
    "network": "Nhận diện giọng nói của Chrome/Edge cần kết nối mạng. Hãy kiểm tra mạng rồi thử lại.",
    "aborted": "Đã dừng nghe."
  };

  function listen(opts) {
    opts = opts || {};
    if (!SR) {
      if (opts.onError) opts.onError("Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.");
      return { stop: function () {} };
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = function (e) {
      const r = e.results && e.results[0] && e.results[0][0];
      if (r && opts.onResult) opts.onResult(r.transcript, r.confidence);
    };
    rec.onerror = function (e) { if (opts.onError) opts.onError(ERR[e.error] || ("Lỗi nhận diện: " + e.error)); };
    rec.onend = function () { if (opts.onEnd) opts.onEnd(); };
    try { rec.start(); }
    catch (err) { if (opts.onError) opts.onError("Không khởi động được micro."); }
    return { stop: function () { try { rec.stop(); } catch (e) { /* bỏ qua */ } } };
  }

  /* ---------------- Giao diện tab Luyện nói ---------------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  let ui = null;          // tham chiếu DOM, tạo khi init
  let curWeek = 1;
  let listening = null;
  let lastTarget = "";

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
  function status(msg) { $("sp-status").textContent = msg; }

  function band(total) {
    if (total >= 80) return { cls: "good", label: "Tốt" };
    if (total >= 50) return { cls: "mid", label: "Tạm được" };
    return { cls: "bad", label: "Cần luyện thêm" };
  }

  // ROADMAP_DATA khai báo bằng const nên không nằm trong window
  function weekData() { return typeof ROADMAP_DATA !== "undefined" ? ROADMAP_DATA.weeks : null; }

  function renderWeekSelect() {
    const sel = $("sp-week");
    clear(sel);
    const weeks = weekData() || [];
    for (let n = 1; n <= 12; n++) {
      const w = weeks[n - 1];
      sel.appendChild(el("option", { value: String(n), text: "Tuần " + n + (w ? ": " + w.title : "") }));
    }
    sel.value = String(curWeek);
  }

  function renderPickList() {
    const box = $("sp-pick-list");
    clear(box);
    (SENTENCES[curWeek] || []).forEach(function (s) {
      const b = el("button", { type: "button", class: "pick", text: s, "aria-pressed": String(s === $("sp-target").value) });
      b.addEventListener("click", function () { setTargetText(s); });
      box.appendChild(b);
    });
  }

  function setTargetText(text) {
    $("sp-target").value = text;
    $("sp-result").classList.add("hidden");
    renderPickList();
    status("Đã chọn câu. Bấm Nghe mẫu hoặc Nói.");
  }

  function renderDaily() {
    const n = todayCount();
    $("sp-daily").textContent = "Hôm nay: " + n + "/" + DAILY_GOAL + " câu" + (n >= DAILY_GOAL ? " · đã đủ, hãy tick việc “Nói 10 câu” nếu có" : "");
  }

  function renderResult(sc) {
    const b = band(sc.total);
    const box = $("sp-result");
    box.classList.remove("hidden");
    const big = $("sp-score");
    big.className = "score-big " + b.cls;
    big.textContent = sc.total + "/100 · " + b.label;
    const tk = $("sp-tokens");
    clear(tk);
    const sym = { ok: "✓", wrong: "✗", missing: "−", extra: "+" };
    const lab = { ok: "đúng", wrong: "sai", missing: "SÓT", extra: "THỪA" };
    sc.tokens.forEach(function (k) {
      const txt = k.status === "wrong" ? k.word + " → " + k.said : k.word;
      tk.appendChild(el("li", { class: "tok " + k.status }, [
        el("span", { "aria-hidden": "true", text: sym[k.status] + " " }), txt,
        el("span", { class: "tok-lab", text: " (" + lab[k.status] + ")" })
      ]));
    });
    $("sp-counts").textContent = "Đúng " + sc.ok + " · Sai " + sc.wrong + " · Sót " + sc.missing + " · Thừa " + sc.extra +
      " · Khớp từ " + sc.wordScore + "%" + (sc.ipaScore == null ? " · IPA: chưa đủ dữ liệu từ điển" : " · IPA " + sc.ipaScore + "% (" + sc.ipaCovered + " từ có trong từ điển)");
    const targetWords = normalize($("sp-target").value);
    $("sp-ipa").textContent = "IPA câu mẫu (từ có trong từ điển, “?” là chưa có): " + IPA.phrase(targetWords);
    box.focus();
  }

  function handleSaid(said) {
    const target = $("sp-target").value.trim();
    $("sp-said").textContent = "Nhận diện được: “" + said + "”";
    const sc = score(target, said);
    const rec = store.add({ t: new Date().toISOString(), d: dateKey(), week: curWeek, target: target, said: said, total: sc.total, ok: sc.ok, missing: sc.missing, wrong: sc.wrong, extra: sc.extra });
    renderResult(sc);
    status("Điểm " + sc.total + "/100.");
    renderDaily(); renderHistory(); renderChart();
    if (rec) document.dispatchEvent(new CustomEvent("rm-speaking-scored", { detail: rec }));
  }

  function toggleRecord() {
    const target = $("sp-target").value.trim();
    if (listening) { listening.stop(); return; }
    if (!normalize(target).length) { status("Hãy chọn hoặc nhập một câu tiếng Anh trước."); $("sp-target").focus(); return; }
    stopSpeak();
    const btn = $("sp-record");
    let got = false;
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = "⏹ Dừng nghe";
    status("Đang nghe, hãy nói câu trên bằng tiếng Anh…");
    listening = listen({
      onResult: function (text) { got = true; handleSaid(text); },
      onError: function (msg) { got = true; status(msg); },
      onEnd: function () {
        listening = null;
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = "🎤 Nói";
        if (!got) status("Không nhận diện được câu nào. Hãy thử lại.");
      }
    });
  }

  function renderHistory() {
    const box = $("sp-history");
    clear(box);
    const days = {};
    store.list().forEach(function (h) {
      const d = days[h.d] || (days[h.d] = { d: h.d, sum: 0, count: 0 });
      d.sum += h.total; d.count++;
    });
    const keys = Object.keys(days).sort().reverse().slice(0, 14);
    if (!keys.length) { box.appendChild(el("li", { class: "muted", text: "Chưa có lịch sử. Hãy nói câu đầu tiên." })); return; }
    keys.forEach(function (k) {
      const d = days[k];
      const avg = Math.round(d.sum / d.count);
      const p = k.split("-");
      box.appendChild(el("li", {}, [
        el("span", { text: p[2] + "/" + p[1] + "/" + p[0] }),
        el("span", { class: "muted", text: " · " + d.count + " câu · trung bình " }),
        el("strong", { class: band(avg).cls, text: avg + " (" + band(avg).label + ")" })
      ]));
    });
  }

  function renderChart() {
    const data = weeklyAverages(8);
    const box = $("sp-chart");
    clear(box);
    const W = 480, H = 200, left = 30, bottom = 28, top = 14, bw = 36;
    const plotH = H - top - bottom;
    const slot = (W - left) / data.length;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "chart-svg");
    svg.setAttribute("role", "img");
    const summary = data.map(function (w) { return "tuần từ " + w.label + ": " + (w.avg == null ? "chưa có" : w.avg); }).join("; ");
    svg.setAttribute("aria-label", "Biểu đồ điểm trung bình theo tuần, 8 tuần gần nhất. " + summary);
    function add(name, attrs, text) {
      const n = document.createElementNS(SVGNS, name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text != null) n.textContent = text;
      svg.appendChild(n);
      return n;
    }
    [0, 50, 100].forEach(function (v) {
      const y = top + plotH - (v / 100) * plotH;
      add("line", { x1: left, x2: W, y1: y, y2: y, class: "chart-grid" });
      add("text", { x: left - 4, y: y + 4, class: "chart-axis", "text-anchor": "end" }, String(v));
    });
    data.forEach(function (w, i) {
      const cx = left + slot * i + slot / 2;
      if (w.avg != null) {
        const h = Math.max(2, (w.avg / 100) * plotH);
        add("rect", { x: cx - bw / 2, y: top + plotH - h, width: bw, height: h, rx: 4, class: "chart-bar " + band(w.avg).cls });
        add("text", { x: cx, y: top + plotH - h - 4, class: "chart-val", "text-anchor": "middle" }, String(w.avg));
      }
      add("text", { x: cx, y: H - 10, class: "chart-axis", "text-anchor": "middle" }, w.label);
    });
    box.appendChild(svg);
    const rows = data.map(function (w) {
      return el("tr", {}, [el("td", { text: w.label + " – " + w.to.slice(8, 10) + "/" + w.to.slice(5, 7) }), el("td", { text: w.avg == null ? "Chưa có" : String(w.avg) }), el("td", { text: String(w.count) })]);
    });
    box.appendChild(el("details", { class: "chart-table" }, [
      el("summary", { text: "Xem bảng số liệu" }),
      el("table", {}, [
        el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Tuần (T2 – CN)" }), el("th", { scope: "col", text: "Điểm TB" }), el("th", { scope: "col", text: "Số câu" })])]),
        el("tbody", {}, rows)
      ])
    ]));
  }

  function applySupport() {
    const ok = recognitionSupported();
    $("sp-unsupported").classList.toggle("hidden", ok);
    $("sp-record").classList.toggle("hidden", !ok);
    $("sp-synth-warn").classList.toggle("hidden", synthSupported());
    $("sp-listen").classList.toggle("hidden", !synthSupported());
    $("sp-slow").classList.toggle("hidden", !synthSupported());
    $("sp-replay").classList.toggle("hidden", !synthSupported());
  }

  function init() {
    if (!$("panel-speaking")) return;
    ui = true;
    curWeek = window.RM.week || 1;
    renderWeekSelect();
    renderPickList();
    applySupport();
    $("sp-week").addEventListener("change", function () {
      curWeek = Number($("sp-week").value) || 1;
      window.RM.week = curWeek;
      renderPickList();
    });
    $("sp-target").addEventListener("input", function () { $("sp-result").classList.add("hidden"); });
    $("sp-listen").addEventListener("click", function () { if (!speak($("sp-target").value, 1)) status("Trình duyệt không hỗ trợ đọc mẫu."); });
    $("sp-slow").addEventListener("click", function () { speak($("sp-target").value, 0.7); });
    $("sp-replay").addEventListener("click", function () { speak($("sp-target").value, 0.9); });
    $("sp-record").addEventListener("click", toggleRecord);
    $("sp-retry").addEventListener("click", function () { $("sp-result").classList.add("hidden"); toggleRecord(); });
    $("sp-clear").addEventListener("click", function () {
      if (!window.confirm("Xóa toàn bộ lịch sử luyện nói? Không hoàn tác được.")) { status("Đã hủy."); return; }
      store.reset(); render(); status("Đã xóa lịch sử luyện nói.");
    });
    if (!$("sp-target").value) $("sp-target").value = (SENTENCES[curWeek] || [""])[0];
    render();
  }

  /** Vẽ lại phần thay đổi theo dữ liệu (gọi khi mở tab hoặc sau khi nhập/xóa). */
  function render() {
    if (!ui) return;
    renderPickList(); renderDaily(); renderHistory(); renderChart();
  }

  /** Đặt câu luyện từ nơi khác (hội thoại, từ vựng...). go=true: chuyển sang tab Luyện nói. */
  function setTarget(text, week, go) {
    if (!ui) return;
    if (week >= 1 && week <= 12) { curWeek = week; $("sp-week").value = String(week); }
    setTargetText(String(text || ""));
    if (go && window.RM.nav) window.RM.nav.go("speaking", true);
  }

  window.RM.speech = {
    normalize: normalize, diff: diff, score: score, speak: speak, stop: stopSpeak, listen: listen,
    recognitionSupported: recognitionSupported, synthSupported: synthSupported,
    sentences: function (week) { return (SENTENCES[week] || []).slice(); },
    weeklyAverages: weeklyAverages, todayCount: todayCount, store: store,
    init: init, render: render, setTarget: setTarget, dailyGoal: DAILY_GOAL
  };

  if (typeof module !== "undefined" && module.exports) module.exports = window.RM.speech;
  // init() do app.js gọi sau khi biết tuần hiện tại
})();
