/* Bug Prevention Drills.
   Six short drills a day, built from the habits in MY_CODING_MISTAKES.md, hidden in everyday code
   (computer vision, backend, data, finance, sensors, algorithms).
   A "fix" drill: tap the line with the bug, then fix it right inside the code, and the page runs the tests.
   A "predict" drill: trace a few lines and type the values.
   Progress lives on this device (localStorage), with a backup file for moving between devices.
   The drills come from bug_drills_data.js, made and checked by tools/drills/build.py. */
(function () {
  var DRILLS = window.DRILLS || [], HABITS = window.DRILL_HABITS || {};
  var P = window.MSPractice;
  var KEY = "drills-v1", PER_DAY = 6;
  var PRE = "from collections import Counter, deque\n";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function today() { return ymd(new Date()); }
  function shift(s, n) { var d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); }

  /* ---------- saved progress ---------- */
  function fresh(s) {
    s = s || {};
    s.stats = s.stats || {}; s.seen = s.seen || {}; s.days = s.days || {}; s.missed = s.missed || [];
    return s;
  }
  function load() { try { return fresh(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { return fresh(null); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked */ } }
  var state = load();
  function done(d) { return (state.days[d] || 0) >= PER_DAY; }

  /* ---------- choosing today's drills ----------
     Habits I miss more often come more often, and a habit missed last time comes back first.
     Inside a habit, the drill I saw longest ago comes first, so the same code does not repeat soon. */
  function rng(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  function weight(h) {
    var st = state.stats[h];
    var w = st && st.n ? 1 + 3 * (1 - st.first / st.n) : 2;
    if (state.missed.indexOf(h) >= 0) w += 4;
    return w;
  }
  function oldest(list, used, r) {
    var ok = list.filter(function (d) { return used.indexOf(d.id) < 0; });
    ok.forEach(function (d) { d._r = r(); });
    ok.sort(function (a, b) { return (state.seen[a.id] || "").localeCompare(state.seen[b.id] || "") || (a._r - b._r); });
    return ok[0];
  }
  function pickSet(seed) {
    var r = rng(seed), used = [], fixes = [], preds = [];
    var habits = Object.keys(HABITS).filter(function (h) { return DRILLS.some(function (d) { return d.habit === h && d.kind === "fix"; }); });
    function take(h) {
      var d = oldest(DRILLS.filter(function (x) { return x.habit === h && x.kind === "fix"; }), used, r);
      if (d) { fixes.push(d); used.push(d.id); }
    }
    state.missed.slice(0, 2).forEach(take);
    var guard = 0;
    while (fixes.length < PER_DAY - 2 && guard++ < 200) {
      var total = habits.reduce(function (s, h) { return s + weight(h); }, 0), x = r() * total, h = habits[0];
      for (var i = 0; i < habits.length; i++) { x -= weight(habits[i]); if (x <= 0) { h = habits[i]; break; } }
      take(h);
    }
    for (var k = 0; k < 2; k++) { var p = oldest(DRILLS.filter(function (y) { return y.kind === "predict"; }), used, r); if (p) { preds.push(p); used.push(p.id); } }
    var out = fixes.slice();
    if (preds[0]) out.splice(1, 0, preds[0]);
    if (preds[1]) out.splice(4, 0, preds[1]);
    return out.map(function (d) { return d.id; });
  }
  function byId(id) { for (var i = 0; i < DRILLS.length; i++) if (DRILLS[i].id === id) return DRILLS[i]; return null; }

  /* ---------- streaks ---------- */
  function streakNow() {
    var d = done(today()) ? today() : shift(today(), -1), n = 0;
    while (done(d)) { n++; d = shift(d, -1); }
    return n;
  }
  function streakBest() {
    var days = Object.keys(state.days).filter(done).sort(), best = 0, run = 0, prev = null;
    days.forEach(function (d) { run = prev && shift(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; });
    return best;
  }

  /* ---------- the home view ---------- */
  var root = $("#drills"), home = $(".dx-home", root), card = $(".dx-card", root), msg = $(".dx-msg", root);
  var year = new Date().getFullYear();

  function showHome() {
    card.hidden = true; home.hidden = false; root.classList.remove("in-drill");
    drawToday(); drawCalendar(); drawAccuracy(); drawTrace();
  }
  function drawToday() {
    var box = $(".dx-today", home); box.textContent = "";
    var t = state.today && state.today.day === today() ? state.today : null;
    var n = state.days[today()] || 0, finished = n >= PER_DAY;
    var left = el("div", "dx-today-l");
    left.appendChild(el("span", "dx-label", "Today"));
    var big = el("span", "dx-count"); big.innerHTML = Math.min(n, PER_DAY) + "<small> / " + PER_DAY + "</small>"; left.appendChild(big);
    left.appendChild(el("span", "dx-note", finished ? "Done. See you tomorrow." : n ? "Keep going." : "About five minutes."));
    var go = el("button", finished ? "lbtn ghost" : "lbtn", finished ? "Practice more" : t && t.done ? "Continue" : "Start");
    go.type = "button";
    go.addEventListener("click", function () {
      if (!t || t.done >= t.ids.length) {
        var round = t ? (t.round || 0) + 1 : 0;
        state.today = { day: today(), ids: pickSet(today() + "#" + round), done: 0, round: round };
        save();
      }
      showDrill();
    });
    box.appendChild(left); box.appendChild(go);
  }
  function drawCalendar() {
    var box = $(".dx-cal", home); box.textContent = "";
    var head = el("div", "dx-row");
    head.appendChild(el("h4", null, "Practice days"));
    var nav = el("div", "dx-yearnav");
    var prev = el("button", "dx-arrow", "‹"), next = el("button", "dx-arrow", "›");
    prev.type = next.type = "button"; prev.setAttribute("aria-label", "Previous year"); next.setAttribute("aria-label", "Next year");
    next.disabled = year >= new Date().getFullYear();
    prev.addEventListener("click", function () { year--; drawCalendar(); });
    next.addEventListener("click", function () { year++; drawCalendar(); });
    nav.appendChild(prev); nav.appendChild(el("span", "dx-year", String(year))); nav.appendChild(next);
    head.appendChild(nav); box.appendChild(head);

    var inYear = Object.keys(state.days).filter(function (d) { return d.slice(0, 4) === String(year) && done(d); }).length;
    var stats = el("div", "dx-stats");
    [[streakNow(), "current streak"], [streakBest(), "longest streak"], [inYear, "days in " + year]].forEach(function (s) {
      var c = el("div", "dx-stat"); c.appendChild(el("b", null, String(s[0]))); c.appendChild(el("span", null, s[1])); stats.appendChild(c);
    });
    box.appendChild(stats);

    var grid = el("div", "dx-months"), tday = today();
    for (var m = 0; m < 12; m++) {
      var mon = el("div", "dx-month");
      mon.appendChild(el("span", "dx-mname", MONTHS[m].slice(0, 3)));
      var days = el("div", "dx-days");
      var first = new Date(year, m, 1), lead = (first.getDay() + 6) % 7;   // weeks start on Monday
      for (var i = 0; i < lead; i++) days.appendChild(el("span", "dx-d blank"));
      var count = new Date(year, m + 1, 0).getDate();
      for (var dnum = 1; dnum <= count; dnum++) {
        var key = ymd(new Date(year, m, dnum)), n = state.days[key] || 0;
        var cls = "dx-d" + (n >= PER_DAY ? " on" : n ? " part" : "") + (key === tday ? " now" : "") + (key > tday ? " future" : "");
        var d = el("span", cls); d.title = MONTHS[m] + " " + dnum + ": " + (n >= PER_DAY ? "done" : n ? n + " of " + PER_DAY : "no practice");
        days.appendChild(d);
      }
      mon.appendChild(days); grid.appendChild(mon);
    }
    box.appendChild(grid);
  }
  function drawAccuracy() {
    var box = $(".dx-acc", home); box.textContent = "";
    var hs = Object.keys(HABITS).filter(function (h) { return state.stats[h] && state.stats[h].n; });
    if (!hs.length) return;
    box.appendChild(el("h4", null, "Weakest habits"));
    hs.sort(function (a, b) { return state.stats[a].first / state.stats[a].n - state.stats[b].first / state.stats[b].n; });
    hs = hs.slice(0, 3);
    var list = el("div", "dx-acc-list");
    hs.forEach(function (h) {
      var st = state.stats[h], pct = Math.round(100 * st.first / st.n);
      var row = el("div", "dx-acc-row");
      row.appendChild(el("span", "dx-acc-name", HABITS[h]));
      row.appendChild(el("span", "dx-acc-val", pct + "%  ·  " + st.first + "/" + st.n));
      var bar = el("span", "dx-bar"), fill = el("i"); fill.style.width = pct + "%"; bar.appendChild(fill); row.appendChild(bar);
      list.appendChild(row);
    });
    box.appendChild(list);
  }
  function drawTrace() {
    var box = $(".dx-trace", home); box.textContent = "";
    var runs = (P ? P.readLog() : []).filter(function (e) { return e.kind === "run" && e.mode === "From blank" && e.trace; });
    if (!runs.length) return;
    box.appendChild(el("h4", null, "Pre-Run Trace"));
    var used = runs.filter(function (e) { return /^used/.test(e.trace); }), not = runs.filter(function (e) { return !/^used/.test(e.trace); });
    function rate(list) { return list.length ? Math.round(100 * list.filter(function (e) { return /^(\d+) of \1 tests pass/.test(e.result || ""); }).length / list.length) + "%" : "–"; }
    var stats = el("div", "dx-stats");
    [[used.length + "/" + runs.length, "runs traced first"], [rate(used), "pass rate, traced"], [rate(not), "pass rate, not traced"]].forEach(function (s) {
      var c = el("div", "dx-stat"); c.appendChild(el("b", null, s[0])); c.appendChild(el("span", null, s[1])); stats.appendChild(c);
    });
    box.appendChild(stats);
  }

  /* ---------- one drill ---------- */
  function header(d, kind) {
    card.textContent = "";
    var t = state.today, n = t.ids.indexOf(d.id);
    var top = el("div", "dx-top");
    var prog = el("div", "dx-prog");
    for (var i = 0; i < t.ids.length; i++) prog.appendChild(el("i", i < n ? "on" : i === n ? "cur" : ""));
    var quit = el("button", "dx-link", "Stop"); quit.type = "button";
    quit.addEventListener("click", function () { showHome(); window.scrollTo(0, 0); });
    top.appendChild(prog); top.appendChild(quit);
    card.appendChild(top);
    card.appendChild(el("p", "dx-meta", (d.domain || "Algorithms") + "  ·  " + kind));
    var h = el("h3", "dx-task"); h.innerHTML = rich(d.task); card.appendChild(h);
  }
  // the code panel: a line number gutter and one row per line
  function codePanel(code, opts) {
    opts = opts || {};
    var panel = el("div", "dx-code");
    code.split("\n").forEach(function (line, i) {
      var row = el(opts.tap ? "button" : "div", "dx-ln");
      if (opts.tap) row.type = "button";
      row.dataset.n = i + 1;
      row.appendChild(el("span", "dx-n", String(i + 1)));
      var ind = line.match(/^ */)[0].length;
      var c = el("span", "dx-c", line.slice(ind) || " ");
      c.style.paddingLeft = ind + "ch";
      row.appendChild(c);
      if (opts.mark && opts.mark.indexOf(i + 1) >= 0) row.classList.add(opts.markClass || "fixed");
      panel.appendChild(row);
    });
    return panel;
  }
  function fixedCode(d) {
    var lines = d.code.split("\n");
    return lines.slice(0, d.bug[0] - 1).concat(d.fix.split("\n"), lines.slice(d.bug[1])).join("\n");
  }
  function result(d, ok, extra) {
    var box = el("div", "dx-result " + (ok ? "good" : "miss"));
    box.appendChild(el("p", "dx-verdict", ok ? "Correct on the first try." : "Not on the first try. This habit will come back soon."));
    var hb = el("p", "dx-habit"); hb.textContent = HABITS[d.habit]; box.appendChild(hb);
    var w = el("p", "dx-why"); w.innerHTML = rich(d.why); box.appendChild(w);
    if (extra) box.appendChild(extra);
    var next = el("button", "lbtn dx-next", state.today.done >= state.today.ids.length ? "Finish" : "Next");
    next.type = "button"; next.addEventListener("click", nextDrill);
    box.appendChild(next);
    card.appendChild(box);
    box.scrollIntoView({ block: "nearest" });
  }
  function record(d, firstTry, res, code) {
    var st = state.stats[d.habit] || (state.stats[d.habit] = { n: 0, first: 0 });
    st.n++; if (firstTry) st.first++;
    state.seen[d.id] = new Date().toISOString();
    var i = state.missed.indexOf(d.habit);
    if (!firstTry && i < 0) state.missed.push(d.habit);
    if (firstTry && i >= 0) state.missed.splice(i, 1);
    state.days[today()] = (state.days[today()] || 0) + 1;
    state.today.done++;
    save();
    if (P) P.addLog({ kind: "drill", problem: "Bug Prevention Drills", mode: d.kind === "fix" ? "Find and fix" : "Predict", result: res, code: code });
  }
  function nextDrill() {
    if (state.today.done >= state.today.ids.length) { showHome(); window.scrollTo(0, 0); return; }
    showDrill();
  }
  function showDrill() {
    home.hidden = true; card.hidden = false; root.classList.add("in-drill");
    var d = byId(state.today.ids[state.today.done]);
    if (!d) { state.today.done++; save(); return nextDrill(); }
    if (d.kind === "fix") fixDrill(d); else predictDrill(d);
    window.scrollTo(0, 0);
  }

  /* find and fix: tap the line, then edit those lines in place */
  function fixDrill(d) {
    header(d, "Find the bug");
    var ask = el("p", "dx-ask", "Tap the line with the bug.");
    card.appendChild(ask);
    var panel = codePanel(d.code, { tap: true });
    card.appendChild(panel);
    var tests = el("div", "dx-tests");
    tests.appendChild(el("span", "dx-label", "Tests"));
    d.tests.forEach(function (t) {
      var row = el("div", "dx-test"); row.innerHTML = "<code>" + esc(t[0]) + "</code><span>→</span><code>" + esc(P ? P.py(t[1]) : JSON.stringify(t[1])) + "</code>";
      tests.appendChild(row);
    });
    card.appendChild(tests);
    var found = null, tapped = null;
    panel.addEventListener("click", function (ev) {
      var row = ev.target.closest(".dx-ln");
      if (!row || found !== null) return;
      tapped = +row.dataset.n;
      found = tapped >= d.bug[0] && tapped <= d.bug[1];
      if (!found) row.classList.add("wrong");
      panel.querySelectorAll(".dx-ln").forEach(function (b) { b.disabled = true; });
      ask.textContent = found ? "Right line. Now fix it in place, then check." : "Not that line. The bug is in the highlighted " + (d.bug[1] > d.bug[0] ? "lines" : "line") + ". Fix it in place, then check.";
      ask.className = "dx-ask " + (found ? "ok" : "no");
      openEditor();
    });
    function openEditor() {
      // the bug lines become one editable block with the same font, spacing and line numbers
      var rows = [];
      for (var n = d.bug[0]; n <= d.bug[1]; n++) rows.push(panel.querySelector('[data-n="' + n + '"]'));
      var wrap = el("div", "dx-edit");
      var nums = el("div", "dx-edit-n");
      var ta = el("textarea", "dx-edit-ta");
      ta.value = d.bugText; ta.spellcheck = false;
      ["autocapitalize", "autocomplete", "autocorrect"].forEach(function (a) { ta.setAttribute(a, "off"); });
      ta.setAttribute("aria-label", "Fix these lines");
      function sizeIt() {
        var k = ta.value.split("\n").length;
        nums.textContent = "";
        for (var i = 0; i < k; i++) nums.appendChild(el("span", null, String(d.bug[0] + i)));
        ta.rows = k; ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px";
      }
      ta.addEventListener("input", sizeIt);
      ta.addEventListener("keydown", function (e) {
        var s = ta.selectionStart, v = ta.value;
        if (e.key === "Tab") { e.preventDefault(); ta.setRangeText("    ", s, ta.selectionEnd, "end"); sizeIt(); }
        else if (e.key === "Enter") {
          e.preventDefault();
          var ls = v.lastIndexOf("\n", s - 1) + 1, ind = v.slice(ls, s).match(/^ */)[0];
          if (/:\s*$/.test(v.slice(ls, s))) ind += "    ";
          ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end"); sizeIt();
        }
      });
      wrap.appendChild(nums); wrap.appendChild(ta);
      rows[0].before(wrap);
      rows.forEach(function (r) { r.remove(); });
      sizeIt();
      ta.focus({ preventScroll: true });
      var len = ta.value.length; ta.setSelectionRange(len, len);

      var bar = el("div", "dx-actions"), check = el("button", "lbtn", "Check"), show = el("button", "dx-link", "Show answer");
      check.type = show.type = "button"; show.hidden = true;
      var status = el("span", "dx-status");
      bar.appendChild(check); bar.appendChild(show); bar.appendChild(status);
      tests.after(bar);
      var out = el("div", "dx-out"); bar.after(out);
      var tries = 0, finished = false;
      function finish(fixedFirst, mine, gaveUp) {
        if (finished) return; finished = true;
        check.disabled = true; show.hidden = true; ta.readOnly = true;
        var first = found && fixedFirst;
        var res = "Drill " + d.id + " (" + (d.domain || "Algorithms") + ", habit " + d.habit + ": " + HABITS[d.habit].toLowerCase() + "). The bug was: " + d.bugText.trim().replace(/\n\s*/g, " / ") + ". Found the bug line on the first try: " + (found ? "yes" : "no, I tapped line " + tapped) + ". Fixed it on the first try: " + (fixedFirst ? "yes" : gaveUp ? "no, I looked at the answer" : "no") + ".";
        record(d, first, res, mine);
        var lab = el("span", "dx-label", "Fixed code");
        var fixedLines = []; for (var n = d.bug[0]; n < d.bug[0] + d.fix.split("\n").length; n++) fixedLines.push(n);
        var frag = el("div"); frag.appendChild(lab); frag.appendChild(codePanel(fixedCode(d), { mark: fixedLines }));
        result(d, first, frag);
      }
      check.addEventListener("click", function () {
        if (!P) return;
        var mine = ta.value.replace(/\t/g, "    ").replace(/\s+$/, "");
        var lines = d.code.split("\n");
        var src = PRE + lines.slice(0, d.bug[0] - 1).concat(mine.split("\n"), lines.slice(d.bug[1])).join("\n") + "\n";
        var cfg = { need: [d.fn], tests: d.tests.map(function (t) { return { steps: [[t[0], t[1]]] }; }) };
        tries++; check.disabled = true; out.textContent = "";
        P.runPython(src, cfg, status).then(function (r) {
          status.textContent = "";
          if (r.load) out.appendChild(el("p", "dx-fail", "Python could not read the code. " + r.load));
          else {
            var bad = r.tests.filter(function (x) { return !x.ok; });
            if (!bad.length) { finish(tries === 1, mine, false); return; }
            var b = bad[0], t = d.tests[b.id];
            out.appendChild(el("p", "dx-fail", b.err ? t[0] + " crashed with " + b.err + "." : t[0] + " returned " + b.got + ", expected " + P.py(t[1]) + "."));
          }
          show.hidden = false; check.disabled = false;
        }, function (err) {
          status.textContent = ""; check.disabled = false; show.hidden = false;
          out.appendChild(el("p", "dx-fail", err.message === "slow" ? "The code ran for more than 8 seconds, so it was stopped." : "Python could not start. Check the connection and try again."));
        });
      });
      show.addEventListener("click", function () { finish(false, ta.value.replace(/\s+$/, ""), true); });
    }
  }

  /* predict: trace the lines and type the values */
  function norm(s) {
    s = String(s).trim().replace(/\s+/g, "").replace(/["']/g, "");
    if (/^(true|false|none)$/i.test(s)) s = s.toLowerCase();
    return s;
  }
  function predictDrill(d) {
    header(d, "Predict the values");
    card.appendChild(codePanel(d.code));
    card.appendChild(el("p", "dx-ask", "What are these values after the last line?"));
    var form = el("div", "dx-form"), inputs = [];
    d.ask.forEach(function (q) {
      var row = el("label", "dx-q");
      row.appendChild(el("code", "dx-qname", q));
      var inp = el("input", "dx-in"); inp.type = "text"; inp.spellcheck = false;
      ["autocapitalize", "autocomplete", "autocorrect"].forEach(function (a) { inp.setAttribute(a, "off"); });
      row.appendChild(inp); form.appendChild(row); inputs.push(inp);
    });
    card.appendChild(form);
    var bar = el("div", "dx-actions"), check = el("button", "lbtn", "Check"); check.type = "button";
    bar.appendChild(check); card.appendChild(bar);
    inputs[0].focus({ preventScroll: true });
    check.addEventListener("click", function () {
      if (inputs.some(function (i) { return !i.value.trim(); })) { check.textContent = "Fill in every value"; return; }
      check.disabled = true;
      var allOk = true, parts = [];
      inputs.forEach(function (inp, i) {
        var ok = norm(inp.value) === norm(d.answers[i]);
        allOk = allOk && ok; inp.readOnly = true;
        var row = inp.parentNode; row.classList.add(ok ? "ok" : "no");
        if (!ok) row.appendChild(el("span", "dx-ans", d.answers[i]));
        parts.push(d.ask[i] + " = " + inp.value.trim() + (ok ? " (right)" : " (wrong, it is " + d.answers[i] + ")"));
      });
      record(d, allOk, "Drill " + d.id + " (" + (d.domain || "Algorithms") + ", habit " + d.habit + ": " + HABITS[d.habit].toLowerCase() + "). I predicted " + parts.join(", ") + ".", "");
      result(d, allOk);
    });
  }

  /* ---------- copy, back up, restore ---------- */
  function say(t) { msg.textContent = t; }
  $(".dx-copy", root).addEventListener("click", function () {
    var text = P ? P.logText() : "";
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { say("Practice log copied."); }, function () { say("Copying was blocked by the browser."); });
  });
  $(".dx-backup", root).addEventListener("click", function () {
    var data = { kind: "memory-systems-backup", saved: new Date().toISOString(), drills: state, log: P ? P.readLog() : [] };
    var a = el("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
    a.download = "drills-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
    say("Backup saved. Keep the file somewhere safe.");
  });
  $(".dx-restore input", root).addEventListener("change", function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    f.text().then(function (txt) {
      var data = JSON.parse(txt);
      if (data.kind !== "memory-systems-backup") throw new Error("not a backup");
      // merge: keep the larger count for each day and each habit, so nothing is lost
      var b = fresh(data.drills);
      Object.keys(b.days).forEach(function (k) { state.days[k] = Math.max(state.days[k] || 0, b.days[k]); });
      Object.keys(b.stats).forEach(function (h) { var s = state.stats[h]; if (!s || b.stats[h].n > s.n) state.stats[h] = b.stats[h]; });
      Object.keys(b.seen).forEach(function (k) { if (!state.seen[k] || b.seen[k] > state.seen[k]) state.seen[k] = b.seen[k]; });
      save();
      if (data.log && data.log.length) {
        var mine = P ? P.readLog() : [], have = {};
        mine.forEach(function (e) { have[e.t] = 1; });
        var merged = mine.concat(data.log.filter(function (e) { return !have[e.t]; })).sort(function (x, y) { return x.t < y.t ? -1 : 1; });
        try { localStorage.setItem("practice-log-v1", JSON.stringify(merged.slice(-400))); } catch (e) { /* ignore */ }
      }
      say("Progress restored."); showHome();
    }).catch(function () { say("That file is not a drills backup."); });
    ev.target.value = "";
  });

  showHome();
})();
