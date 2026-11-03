/* ============================================================
 * app.js — Điều hướng, render, checklist, tự đánh giá
 * Đọc dữ liệu từ ROADMAP_DATA (data.js), lưu qua RoadmapStorage (storage.js)
 * ============================================================ */
(function () {
  "use strict";

  const D = ROADMAP_DATA;
  const S = RoadmapStorage;
  const TABS = ["home", "assess", "roadmap", "schedule", "speaking", "vocab", "media", "progress", "method", "resources", "faq"];
  const STUDY_DAYS = 6; // ngày 1–6 học, ngày 7 kiểm tra cuối tuần

  let currentWeek = 1;
  let currentTab = "home";

  // ---------- Tiện ích DOM ----------
  function $(id) { return document.getElementById(id); }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "text") node.textContent = props[k];
        else if (k === "class") node.className = props[k];
        else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function say(text) { $("status-msg").textContent = text; }

  // ---------- Tính tiến độ ----------
  function taskId(week, day, key) { return "w" + week + "d" + day + "t" + key; }

  function weekTaskIds(week) {
    const ids = [];
    for (let d = 1; d <= STUDY_DAYS; d++) D.taskTypes.forEach(function (t) { ids.push(taskId(week, d, t.key)); });
    D.weekendTasks.forEach(function (t) { ids.push(taskId(week, 7, t.key)); });
    return ids;
  }

  function weekProgress(week) {
    const ids = weekTaskIds(week);
    const done = ids.filter(S.isChecked).length;
    return { done: done, total: ids.length, pct: Math.round((done / ids.length) * 100) };
  }

  function totalProgress() {
    let done = 0, total = 0;
    D.weeks.forEach(function (w) { const p = weekProgress(w.n); done += p.done; total += p.total; });
    return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function setBar(bar, fill, pct) {
    bar.setAttribute("aria-valuenow", String(pct));
    fill.style.width = pct + "%";
  }

  // ---------- Giao diện sáng/tối ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("theme-toggle");
    const isLight = theme === "light";
    btn.textContent = isLight ? "☀ Sáng" : "🌙 Tối";
    btn.setAttribute("aria-pressed", String(isLight));
    // Thanh trạng thái của điện thoại theo giao diện đang chọn
    Array.prototype.forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) {
      m.setAttribute("content", isLight ? "#f4f6ff" : "#0f1221");
    });
  }

  function initTheme() {
    let theme = S.getSetting("theme");
    if (!theme) {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    applyTheme(theme);
    $("theme-toggle").addEventListener("click", function () {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      S.setSetting("theme", next);
    });
  }

  // ---------- Tab ----------
  function activateTab(name, moveFocus) {
    if (TABS.indexOf(name) < 0) name = "home";
    currentTab = name;
    TABS.forEach(function (t) {
      const btn = $("tab-" + t);
      const on = t === name;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", String(on));
      btn.setAttribute("tabindex", on ? "0" : "-1");
      $("panel-" + t).classList.toggle("hidden", !on);
    });
    updateMore(name);
    if (moveFocus) $("tab-" + name).focus();
    if (name === "progress") renderProgress();
    if (name === "roadmap") renderWeekDetail();
    if (name === "schedule") renderSchedule();
    if (name === "speaking" && window.RM && RM.speech) RM.speech.render();
    if (name === "vocab" && window.RM && RM.vocab) RM.vocab.render();
    if (window.RM && RM.media) { if (name === "media") RM.media.render(); else RM.media.stop(); }
    if (history.replaceState) history.replaceState(null, "", "#" + name);
  }

  // ---------- Mục "Thêm" của thanh tab dưới (màn hình hẹp) ----------
  const MORE_TABS = ["home", "assess", "schedule", "progress", "method", "resources", "faq"];
  function setMore(open) {
    $("more-sheet").classList.toggle("hidden", !open);
    $("more-btn").setAttribute("aria-expanded", String(open));
  }
  function updateMore(name) {
    const inMore = MORE_TABS.indexOf(name) >= 0;
    $("more-btn").classList.toggle("active", inMore);
    setMore(false);
  }
  function initMore() {
    $("more-btn").addEventListener("click", function () {
      setMore($("more-sheet").classList.contains("hidden"));
    });
    $("more-sheet").addEventListener("click", function (e) {
      const b = e.target.closest("[data-tab]");
      if (b) activateTab(b.getAttribute("data-tab"), false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMore(false); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#more-sheet, #more-btn")) setMore(false);
    });
  }

  function initTabs() {
    const list = $("tablist");
    initMore();
    list.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-tab]");
      if (btn) activateTab(btn.getAttribute("data-tab"), false);
    });
    list.addEventListener("keydown", function (e) {
      const i = TABS.indexOf(currentTab);
      let next = -1;
      if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = TABS.length - 1;
      if (next >= 0) {
        e.preventDefault();
        activateTab(TABS[next], true);
      }
    });
    window.addEventListener("hashchange", function () {
      const name = location.hash.replace("#", "");
      if (TABS.indexOf(name) >= 0 && name !== currentTab) activateTab(name, false);
    });
  }

  // ---------- Trang chủ ----------
  function renderPhases() {
    const box = $("phase-cards");
    clear(box);
    D.phases.forEach(function (p) {
      const ul = el("ul", null, p.points.map(function (t) { return el("li", { text: t }); }));
      box.appendChild(el("article", { class: "card phase-card" }, [
        el("div", { class: "phase-icon", "aria-hidden": "true", text: p.icon }),
        el("h3", { text: p.name }),
        el("span", { class: "tag", text: p.weeks }),
        el("p", { class: "muted", text: p.summary }),
        ul,
        el("p", { class: "expect", text: p.expectation })
      ]));
    });
  }

  // ---------- Chọn thời lượng ----------
  function renderDurations() {
    ["duration-roadmap", "duration-schedule"].forEach(function (id) {
      const box = $(id);
      clear(box);
      const cur = S.getSetting("duration");
      [30, 60, 90].forEach(function (m) {
        const input = el("input", { type: "radio", name: id, value: String(m) });
        if (m === cur) input.checked = true;
        const label = el("label", { class: m === cur ? "on" : "" }, [input, el("span", { text: D.durations[m].label })]);
        input.addEventListener("change", function () { setDuration(m); });
        box.appendChild(label);
      });
    });
  }

  function setDuration(m) {
    S.setSetting("duration", m);
    // Cập nhật tại chỗ để không mất focus bàn phím của radio
    ["duration-roadmap", "duration-schedule"].forEach(function (id) {
      $(id).querySelectorAll("label").forEach(function (lb) {
        const inp = lb.querySelector("input");
        inp.checked = Number(inp.value) === m;
        lb.className = inp.checked ? "on" : "";
      });
    });
    if (currentTab === "roadmap") renderWeekDetail();
    if (currentTab === "schedule") renderSchedule();
  }

  // ---------- Lộ trình tuần ----------
  function renderWeekPicker() {
    const box = $("week-picker");
    clear(box);
    D.weeks.forEach(function (w) {
      const p = weekProgress(w.n);
      const btn = el("button", {
        type: "button", class: "week-btn", "data-week": String(w.n),
        "aria-pressed": String(w.n === currentWeek),
        "aria-label": "Tuần " + w.n + ": " + w.title + ", hoàn thành " + p.pct + " phần trăm"
      }, ["Tuần " + w.n, el("small", { text: p.pct + "%" })]);
      btn.addEventListener("click", function () { currentWeek = w.n; if (window.RM) RM.week = w.n; renderWeekPicker(); renderWeekDetail(); });
      box.appendChild(btn);
    });
  }

  function taskRow(id, icon, name, minutes, desc) {
    const cb = el("input", { type: "checkbox", id: "cb-" + id, "data-id": id });
    cb.checked = S.isChecked(id);
    cb.addEventListener("change", function () {
      S.setChecked(id, cb.checked);
      updateWeekHeader();
      refreshPickerLabels();
    });
    const label = el("label", { for: "cb-" + id }, [
      el("span", { class: "t-name", text: icon + " " + name }),
      minutes ? el("span", { class: "t-min", text: " · " + minutes + " phút" }) : null,
      el("span", { class: "t-desc", text: desc })
    ]);
    return el("div", { class: "task" }, [cb, label]);
  }

  function updateWeekHeader() {
    const p = weekProgress(currentWeek);
    const bar = $("wk-bar");
    if (!bar) return;
    setBar(bar, $("wk-bar-fill"), p.pct);
    $("wk-bar-text").textContent = p.done + "/" + p.total + " việc · " + p.pct + "%";
  }

  function refreshPickerLabels() {
    D.weeks.forEach(function (w) {
      const btn = $("week-picker").querySelector('[data-week="' + w.n + '"]');
      if (!btn) return;
      const p = weekProgress(w.n);
      btn.querySelector("small").textContent = p.pct + "%";
      btn.setAttribute("aria-label", "Tuần " + w.n + ": " + w.title + ", hoàn thành " + p.pct + " phần trăm");
    });
  }

  // ---------- Liên kết nhanh tới Luyện nói / Từ vựng / Hội thoại của tuần ----------
  function goSpeaking(n) {
    RM.week = n;
    if (RM.speech && RM.speech.setTarget) {
      const first = RM.speech.sentences(n)[0] || "";
      RM.speech.setTarget(first, n, true);
    } else activateTab("speaking", true);
  }
  function goVocab(n) {
    RM.week = n;
    if (RM.vocab && RM.vocab.selectWeek) RM.vocab.selectWeek(n);
    activateTab("vocab", true);
  }
  function goMedia(n) {
    RM.week = n;
    if (RM.media && RM.media.selectWeek) RM.media.selectWeek(n);
    activateTab("media", true);
  }
  function quickLinks(n) {
    const defs = [
      ["🎤 Luyện nói tuần " + n, "Mở Luyện nói với câu gợi ý của tuần " + n, goSpeaking],
      ["🧠 Từ vựng tuần " + n + " (~250 từ)", "Mở từ vựng của tuần " + n, goVocab],
      ["🎬 Hội thoại tuần " + n, "Mở hội thoại của tuần " + n, goMedia]
    ];
    const box = el("div", { class: "quick-links", role: "group", "aria-label": "Liên kết nhanh của tuần " + n });
    defs.forEach(function (d) {
      const b = el("button", { type: "button", class: "btn small", "aria-label": d[1], text: d[0] });
      b.addEventListener("click", function () { d[2](n); });
      box.appendChild(b);
    });
    return box;
  }

  function renderWeekDetail() {
    const box = $("week-detail");
    clear(box);
    const w = D.weeks[currentWeek - 1];
    const mins = D.durations[S.getSetting("duration")];
    const phase = D.phases[w.phase - 1];

    const head = el("div", { class: "card" }, [
      el("span", { class: "tag", text: phase.name }),
      el("h3", { class: "section-h first", text: "Tuần " + w.n + ": " + w.title }),
      el("p", { text: "Mục tiêu: " + w.goal }),
      quickLinks(w.n),
      el("h4", { text: "Mẫu câu trọng tâm" }),
      el("ul", { class: "pattern-list" }, w.patterns.map(function (p) { return el("li", { text: p }); })),
      el("div", { class: "bar-label" }, [el("span", { text: "Tiến độ tuần" }), el("span", { id: "wk-bar-text" })]),
      el("div", { class: "bar", id: "wk-bar", role: "progressbar", "aria-label": "Tiến độ tuần " + w.n, "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
        [el("div", { class: "bar-fill", id: "wk-bar-fill" })])
    ]);
    box.appendChild(head);

    for (let d = 1; d <= STUDY_DAYS; d++) {
      const day = el("section", { class: "day", "aria-label": "Tuần " + w.n + " ngày " + d }, [
        el("h4", {}, ["Ngày " + d + " · ", el("span", { class: "focus", text: w.topics[d - 1] })])
      ]);
      D.taskTypes.forEach(function (t) {
        const desc = t.key === "review" ? D.reviewByPhase[w.phase] : t.key === "talk10" ? D.talk10Desc : w[t.key];
        const row = taskRow(taskId(w.n, d, t.key), t.icon, t.label, mins[t.key], desc);
        if (t.key === "talk10") {
          const go = el("button", { type: "button", class: "btn small", "aria-label": "Mở tab Luyện nói cho tuần " + w.n + " (ngày " + d + ")", text: "🎤 Mở Luyện nói" });
          go.addEventListener("click", function () { goSpeaking(w.n); });
          row.appendChild(go);
        }
        day.appendChild(row);
      });
      box.appendChild(day);
    }

    const weekend = el("section", { class: "day test-box", "aria-label": "Tuần " + w.n + " ngày 7 kiểm tra cuối tuần" }, [
      el("h4", {}, ["Ngày 7 · ", el("span", { class: "focus", text: "Kiểm tra cuối tuần" })])
    ]);
    weekend.appendChild(taskRow(taskId(w.n, 7, "test"), D.weekendTasks[0].icon, D.weekendTasks[0].label, 0, w.test));
    weekend.appendChild(taskRow(taskId(w.n, 7, "fix"), D.weekendTasks[1].icon, D.weekendTasks[1].label, 0, "Ghi vào sổ lỗi, đọc to câu đúng 3 lần, và đưa vào ôn tập tuần sau."));
    box.appendChild(weekend);

    updateWeekHeader();
  }

  // ---------- Thời khóa biểu ----------
  function renderSchedule() {
    const box = $("schedule-body");
    clear(box);
    const sc = D.schedules[S.getSetting("duration")];
    box.appendChild(el("p", { class: "muted", text: sc.label + ". " + sc.note }));
    const grid = el("div", { class: "slots" });
    sc.slots.forEach(function (s) {
      grid.appendChild(el("article", { class: "slot" }, [
        el("h3", { text: s.when }),
        el("div", { class: "time", text: s.time }),
        el("p", { text: s.what })
      ]));
    });
    box.appendChild(grid);
  }

  // ---------- Tiến độ ----------
  function renderProgress() {
    const t = totalProgress();
    $("stat-total").textContent = t.pct + "%";
    $("stat-streak").textContent = S.streak() + " ngày";
    $("stat-done").textContent = t.done + "/" + t.total;
    setBar($("total-bar"), $("total-bar-fill"), t.pct);
    $("total-bar-text").textContent = t.pct + "%";

    const box = $("week-bars");
    clear(box);
    D.weeks.forEach(function (w) {
      const p = weekProgress(w.n);
      const bar = el("div", { class: "bar", role: "progressbar", "aria-label": "Tiến độ tuần " + w.n, "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(p.pct) },
        [el("div", { class: "bar-fill" })]);
      bar.firstChild.style.width = p.pct + "%";
      box.appendChild(el("div", { class: "week-row" }, [
        el("div", { class: "bar-label" }, [el("span", { text: "Tuần " + w.n + ": " + w.title }), el("span", { text: p.pct + "%" })]),
        bar
      ]));
    });
  }

  function initBackup() {
    $("btn-export").addEventListener("click", function () {
      const blob = new Blob([RM.backup.exportAll()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "english-roadmap-tien-do-gop-" + S.todayKey() + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      say("Đã xuất file tiến độ gộp (lộ trình, luyện nói, từ vựng).");
    });

    $("btn-copy").addEventListener("click", function () {
      const text = RM.backup.exportAll();
      const fallback = function () {
        // Không có clipboard API: đưa JSON vào ô dán, chọn sẵn để người dùng tự sao chép
        const ta = $("paste-json");
        ta.value = text;
        ta.focus();
        ta.select();
        say("Chưa tự sao chép được. JSON đã được đặt vào ô bên dưới và chọn sẵn, hãy dùng Sao chép của hệ thống.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { say("Đã sao chép JSON tiến độ vào clipboard."); }, fallback);
      } else fallback();
    });
    $("btn-paste-import").addEventListener("click", function () {
      const text = $("paste-json").value;
      if (!text.trim()) { say("Ô dán đang trống."); return; }
      if (!window.confirm("Nhập văn bản này sẽ ghi đè các phần tiến độ có trong đó (lộ trình, luyện nói, từ vựng). Tiếp tục?")) { say("Đã hủy nhập."); return; }
      const r = RM.backup.importAll(text);
      say(r.message);
      if (r.ok) { $("paste-json").value = ""; refreshAll(); }
    });

    $("btn-import").addEventListener("click", function () { $("file-import").click(); });
    $("file-import").addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        if (!window.confirm("Nhập file sẽ ghi đè các phần tiến độ có trong file (lộ trình, luyện nói, từ vựng). Tiếp tục?")) { say("Đã hủy nhập."); return; }
        const r = RM.backup.importAll(String(reader.result));
        say(r.message);
        if (r.ok) refreshAll();
      };
      reader.onerror = function () { say("Không đọc được file."); };
      reader.readAsText(file);
      e.target.value = "";
    });

    $("btn-reset").addEventListener("click", function () {
      if (!window.confirm("Xóa toàn bộ tiến độ lộ trình, lịch sử luyện nói và tiến độ từ vựng? Hành động này không hoàn tác được. Nên xuất file sao lưu trước.")) {
        say("Đã hủy, tiến độ vẫn giữ nguyên.");
        return;
      }
      RM.backup.resetAll();
      say("Đã đặt lại toàn bộ tiến độ.");
      refreshAll();
    });
  }

  function refreshAll() {
    applyTheme(S.getSetting("theme") || document.documentElement.getAttribute("data-theme") || "dark");
    renderDurations();
    renderWeekPicker();
    renderWeekDetail();
    renderSchedule();
    renderProgress();
    if (window.RM && RM.speech) RM.speech.render();
    if (window.RM && RM.vocab && currentTab === "vocab") RM.vocab.render();
  }

  // ---------- Tự đánh giá ----------
  function renderAssessment() {
    $("assess-disclaimer").textContent = D.assessment.disclaimer;
    const form = $("assess-form");
    clear(form);
    D.assessment.questions.forEach(function (q, i) {
      const fs = el("fieldset", { class: "q" }, [el("legend", { text: "Câu " + (i + 1) + ". " + q.q })]);
      q.options.forEach(function (opt, j) {
        const input = el("input", { type: "radio", name: "q" + i, value: String(j), id: "q" + i + "o" + j });
        fs.appendChild(el("label", { class: "opt", for: "q" + i + "o" + j }, [input, el("span", { text: opt })]));
      });
      form.appendChild(fs);
    });
    form.appendChild(el("button", { type: "submit", class: "btn primary", "aria-label": "Nộp bài và xem gợi ý mức độ" , text: "Xem kết quả" }));
    form.appendChild(el("p", { id: "assess-error", class: "status", role: "alert" }));
    form.addEventListener("submit", function (e) { e.preventDefault(); submitAssessment(form); });
  }

  function submitAssessment(form) {
    const qs = D.assessment.questions;
    let score = 0;
    for (let i = 0; i < qs.length; i++) {
      const picked = form.querySelector('input[name="q' + i + '"]:checked');
      if (!picked) {
        $("assess-error").textContent = "Bạn chưa trả lời câu " + (i + 1) + ".";
        const first = form.querySelector('input[name="q' + i + '"]');
        if (first) first.focus();
        return;
      }
      if (Number(picked.value) === qs[i].answer) score++;
    }
    $("assess-error").textContent = "";
    const level = D.assessment.levels.filter(function (l) { return score >= l.min && score <= l.max; })[0];
    S.setSetting("level", level.id);
    const res = $("assess-result");
    clear(res);
    res.appendChild(el("div", { class: "result-level", text: level.title }));
    res.appendChild(el("p", { text: "Điểm: " + score + "/" + qs.length }));
    res.appendChild(el("p", { text: level.pace }));
    res.appendChild(el("p", { class: "muted small", text: D.assessment.disclaimer }));
    const apply = el("button", { type: "button", class: "btn primary", "aria-label": "Áp dụng thời lượng " + level.suggest + " phút mỗi ngày và mở lộ trình", text: "Chọn " + level.suggest + " phút/ngày và bắt đầu" });
    apply.addEventListener("click", function () { setDuration(level.suggest); activateTab("roadmap", true); });
    res.appendChild(apply);
    res.classList.remove("hidden");
    res.focus();
  }

  // ---------- Phương pháp, tài nguyên, FAQ ----------
  function accordion(title, paragraphs, open) {
    const d = el("details", { class: "acc" }, [
      el("summary", { text: title }),
      el("div", { class: "body" }, paragraphs)
    ]);
    if (open) d.setAttribute("open", "");
    return d;
  }

  function renderStatic() {
    const m = $("method-list");
    D.methods.forEach(function (x, i) {
      m.appendChild(accordion(x.title, x.body.map(function (t) { return el("p", { text: t }); }), i === 0));
    });
    const ml = $("mistake-list");
    D.mistakes.forEach(function (x) {
      ml.appendChild(el("div", { class: "mistake" }, [
        el("strong", { text: "Lỗi: " }), x.mistake,
        el("br"),
        el("strong", { text: "Cách khắc phục: " }), x.fix
      ]));
    });
    const r = $("resource-list");
    D.resources.forEach(function (x) {
      const ul = el("ul", { class: "criteria" }, x.criteria.map(function (c) { return el("li", { text: c }); }));
      r.appendChild(accordion(x.type, [el("p", { class: "muted", text: "Tiêu chí chọn:" }), ul], false));
    });
    const f = $("faq-list");
    D.faq.forEach(function (x) { f.appendChild(accordion(x.q, [el("p", { text: x.a })], false)); });
  }

  // ---------- Khởi động ----------
  function firstIncompleteWeek() {
    for (let i = 0; i < D.weeks.length; i++) {
      if (weekProgress(D.weeks[i].n).pct < 100) return D.weeks[i].n;
    }
    return 1;
  }

  // Nút English Daily chỉ hiện khi chạy cục bộ (english-daily có thể nằm cạnh); trên web (Netlify...) giữ ẩn.
  function initDailyLink() {
    const h = location.hostname;
    const local = location.protocol === "file:" || h === "localhost" || h === "127.0.0.1";
    if (!local) return;
    ["daily-card", "link-daily", "note-daily"].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = false;
    });
  }
  function init() {
    S.load();
    initDailyLink();
    if (!S.isPersistent()) $("storage-warning").classList.remove("hidden");
    initTheme();
    initTabs();
    renderPhases();
    renderStatic();
    renderAssessment();
    initBackup();
    currentWeek = firstIncompleteWeek();
    // Cho các module khác (luyện nói...) điều hướng và biết tuần hiện tại
    window.RM = window.RM || {};
    RM.week = currentWeek;
    RM.nav = { go: activateTab };
    if (RM.speech) RM.speech.init();
    if (RM.vocab) RM.vocab.init();
    if (RM.media) RM.media.init();
    renderDurations();
    renderWeekPicker();
    $("btn-start").addEventListener("click", function () { activateTab("roadmap", true); });
    $("btn-go-assess").addEventListener("click", function () { activateTab("assess", true); });
    const fromHash = location.hash.replace("#", "");
    activateTab(TABS.indexOf(fromHash) >= 0 ? fromHash : "home", false);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
