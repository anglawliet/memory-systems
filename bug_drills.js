/* Bug Prevention Drills: short daily drills built from the mistakes in MY_CODING_MISTAKES.md.
   One question at a time. A "fix" drill: tap the line with the bug, then rewrite it, and the page runs
   the tests in the browser. A "predict" drill: trace a few lines and type the values.
   Every result goes into the practice log, and first-try scores are kept per habit on this phone.
   The drills themselves live in bug_drills_data.js, made and checked by tools/drills/build.py. */
(function () {
  var DRILLS = window.DRILLS || [], HABITS = window.DRILL_HABITS || {};
  var P = window.MSPractice;
  var KEY = "drills-v1", PER_DAY = 6;
  var PRE = "from collections import Counter, deque\n";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dayBefore(s) { var d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - 1); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* ---------- saved progress ---------- */
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { s = null; }
    s = s || {};
    s.stats = s.stats || {}; s.seen = s.seen || {}; s.days = s.days || {}; s.missed = s.missed || [];
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked */ } }
  var state = load();

  /* ---------- choosing today's drills ----------
     Habits I miss more often are picked more often, and a habit missed last time comes back first.
     Inside a habit, a drill I have not seen (or saw longest ago) is picked, so the same code does not repeat. */
  function rng(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  function weight(h) {
    var st = state.stats[h];
    var w = st && st.n ? 1 + 3 * (1 - st.first / st.n) : 2;
    if (state.missed.indexOf(h) >= 0) w += 4;
    return w;
  }
  function freshest(list, used) {
    var ok = list.filter(function (d) { return used.indexOf(d.id) < 0; });
    ok.sort(function (a, b) { return (state.seen[a.id] || "").localeCompare(state.seen[b.id] || ""); });
    return ok[0];
  }
  function pickSet(seedText) {
    var r = rng(seedText), used = [], fixes = [], preds = [];
    var habits = Object.keys(HABITS).filter(function (h) { return DRILLS.some(function (d) { return d.habit === h && d.kind === "fix"; }); });
    // missed habits first, then by weight
    state.missed.forEach(function (h) {
      if (fixes.length >= PER_DAY - 2) return;
      var d = freshest(DRILLS.filter(function (x) { return x.habit === h && x.kind === "fix"; }), used);
      if (d) { fixes.push(d); used.push(d.id); }
    });
    var guard = 0;
    while (fixes.length < PER_DAY - 2 && guard++ < 200) {
      var total = habits.reduce(function (s, h) { return s + weight(h); }, 0), x = r() * total, h = habits[0];
      for (var i = 0; i < habits.length; i++) { x -= weight(habits[i]); if (x <= 0) { h = habits[i]; break; } }
      var d = freshest(DRILLS.filter(function (y) { return y.habit === h && y.kind === "fix"; }), used);
      if (d) { fixes.push(d); used.push(d.id); }
    }
    for (var k = 0; k < 2; k++) { var p = freshest(DRILLS.filter(function (y) { return y.kind === "predict"; }), used); if (p) { preds.push(p); used.push(p.id); } }
    // predict drills at places 2 and 5, so the kinds alternate
    var out = fixes.slice();
    if (preds[0]) out.splice(1, 0, preds[0]);
    if (preds[1]) out.splice(4, 0, preds[1]);
    return out.map(function (d) { return d.id; });
  }
  function byId(id) { for (var i = 0; i < DRILLS.length; i++) if (DRILLS[i].id === id) return DRILLS[i]; return null; }

  /* ---------- the page ---------- */
  var root = $("#drills"), home = $(".dr-home", root), card = $(".dr-card", root);
  function streak() {
    var d = state.days[today()] ? today() : dayBefore(today()), n = 0;
    while (state.days[d]) { n++; d = dayBefore(d); }
    return n;
  }
  function showHome() {
    card.hidden = true; home.hidden = false;
    var t = state.today && state.today.day === today() ? state.today : null;
    var box = $(".dr-today", home); box.textContent = "";
    var done = t ? t.done : 0, total = t ? t.ids.length : PER_DAY;
    var s = streak();
    box.appendChild(el("p", "dr-big", done >= total ? "Done for today." : done ? done + " of " + total + " drills done today." : "Six short drills, about five minutes."));
    box.appendChild(el("p", "dr-sub", s ? "You have practiced " + s + (s === 1 ? " day" : " days in a row") + "." : "Practice once a day. Your streak starts with today's first drill."));
    var go = el("button", "lbtn dr-go", done >= total ? "Do six more" : done ? "Continue" : "Start today's drills");
    go.type = "button";
    if (done >= total) go.className = "lbtn ghost dr-go";
    go.addEventListener("click", function () {
      if (!t || t.done >= t.ids.length) {
        var round = t ? (t.round || 0) + 1 : 0;
        state.today = { day: today(), ids: pickSet(today() + "#" + round), done: 0, round: round };
        save();
      }
      showDrill();
    });
    box.appendChild(go);
    showStats();
  }
  function showStats() {
    var box = $(".dr-stats", home); box.textContent = "";
    var hs = Object.keys(HABITS).filter(function (h) { return state.stats[h] && state.stats[h].n; });
    if (!hs.length) { box.appendChild(el("p", null, "Your first-try scores appear here after your first drill.")); }
    else {
      var tb = el("div", "dr-table");
      hs.forEach(function (h) {
        var st = state.stats[h], row = el("div", "dr-row");
        row.appendChild(el("span", "dr-h", HABITS[h]));
        var pct = Math.round(100 * st.first / st.n);
        var v = el("span", "dr-v", st.first + " of " + st.n);
        var bar = el("span", "dr-bar"), fill = el("i"); fill.style.width = pct + "%"; bar.appendChild(fill);
        row.appendChild(v); row.appendChild(bar);
        tb.appendChild(row);
      });
      box.appendChild(tb);
    }
    // the Pre-Run Trace numbers, worked out from the practice log
    var tr = $(".dr-trace", home); tr.textContent = "";
    var runs = (P ? P.readLog() : []).filter(function (e) { return e.kind === "run" && e.mode === "From blank" && e.page !== "bug_drills"; });
    var since = runs.filter(function (e) { return e.trace; });
    if (!since.length) { tr.appendChild(el("p", null, "No From blank runs with the trace option yet. In From blank, type a prediction before you press Run the tests, and the numbers appear here.")); return; }
    var used = since.filter(function (e) { return /^used/.test(e.trace); }), not = since.filter(function (e) { return !/^used/.test(e.trace); });
    function passRate(list) { var p = list.filter(function (e) { return /^(\d+) of \1 tests pass/.test(e.result || ""); }).length; return p + " of " + list.length; }
    tr.appendChild(el("p", null, "You traced before " + used.length + " of " + since.length + " runs. Runs where you traced first passed every test " + passRate(used) + " times. Runs without a trace passed every test " + passRate(not) + " times."));
  }

  function header(d, kindText) {
    card.textContent = "";
    var t = state.today, n = t.ids.indexOf(d.id) + 1;
    var top = el("div", "dr-top");
    top.appendChild(el("span", "lsn-tag", "Drill " + n + " of " + t.ids.length + ", " + kindText));
    var quit = el("button", "lbtn ghost dr-quit", "Stop"); quit.type = "button";
    quit.addEventListener("click", showHome);
    top.appendChild(quit);
    card.appendChild(top);
    var h = el("h4", "dr-task"); h.innerHTML = rich(d.task); card.appendChild(h);
  }
  function codeBox(d, tappable) {
    var box = el("div", "dr-code");
    d.code.split("\n").forEach(function (line, i) {
      var ind = line.match(/^ */)[0].length;
      var row = el(tappable ? "button" : "div", "dr-ln");
      if (tappable) row.type = "button";
      row.dataset.n = i + 1;
      row.appendChild(el("span", "dr-n", String(i + 1)));
      var c = el("span", "dr-c", line.slice(ind) || " ");
      c.style.paddingLeft = (ind / 2) + "ch";   // half-width indents, so lines fit on a phone
      row.appendChild(c);
      box.appendChild(row);
    });
    return box;
  }
  function explain(d, ok, after) {
    var box = el("div", "dr-why " + (ok ? "good" : "miss"));
    box.appendChild(el("p", "dr-verdict", ok ? "Right on the first try." : "Not on the first try. This habit will come back in a later drill."));
    var h = el("p", "dr-habit"); h.innerHTML = "<b>The habit:</b> " + esc(HABITS[d.habit]) + "."; box.appendChild(h);
    var w = el("p"); w.innerHTML = rich(d.why); box.appendChild(w);
    if (d.kind === "fix") {
      box.appendChild(el("p", "dr-small", "The fixed code:"));
      var fx = codeBox({ code: fixedCode(d) }, false);
      var fixLen = d.fix.split("\n").length;
      for (var n = d.bug[0]; n < d.bug[0] + fixLen; n++) { var r = fx.querySelector('[data-n="' + n + '"]'); if (r) r.classList.add("fixed"); }
      box.appendChild(fx);
    }
    var next = el("button", "lbtn dr-next", "Next"); next.type = "button";
    next.addEventListener("click", after);
    box.appendChild(next);
    card.appendChild(box);
    next.focus({ preventScroll: true });
  }
  function fixedCode(d) {
    var lines = d.code.split("\n");
    return lines.slice(0, d.bug[0] - 1).concat(d.fix.split("\n"), lines.slice(d.bug[1])).join("\n");
  }
  function record(d, firstTry, result, code) {
    var st = state.stats[d.habit] || (state.stats[d.habit] = { n: 0, first: 0 });
    st.n++; if (firstTry) st.first++;
    state.seen[d.id] = today() + "#" + Date.now();
    var i = state.missed.indexOf(d.habit);
    if (!firstTry && i < 0) state.missed.push(d.habit);
    if (firstTry && i >= 0) state.missed.splice(i, 1);
    state.days[today()] = (state.days[today()] || 0) + 1;
    state.today.done++;
    save();
    if (P) P.addLog({ kind: "drill", problem: "Bug Prevention Drills", mode: d.kind === "fix" ? "Find and fix" : "Predict", result: result, code: code });
  }
  function nextDrill() {
    if (state.today.done >= state.today.ids.length) { showHome(); window.scrollTo(0, root.offsetTop - 70); return; }
    showDrill();
  }
  function showDrill() {
    home.hidden = true; card.hidden = false;
    var d = byId(state.today.ids[state.today.done]);
    if (!d) { state.today.done++; save(); return nextDrill(); }
    if (d.kind === "fix") fixDrill(d); else predictDrill(d);
    window.scrollTo(0, root.offsetTop - 70);
  }

  /* ---------- a find-and-fix drill ---------- */
  function fixDrill(d) {
    header(d, "find and fix");
    card.appendChild(el("p", "dr-tests", "The tests:"));
    var tests = el("ul", "dr-tl");
    d.tests.slice(0, 2).forEach(function (t) { var li = el("li"); li.innerHTML = "<code>" + esc(t[0]) + "</code> should return <code>" + esc(P ? P.py(t[1]) : JSON.stringify(t[1])) + "</code>"; tests.appendChild(li); });
    card.appendChild(tests);
    var ask = el("p", "dr-ask", "Step 1. Tap the line with the bug.");
    card.appendChild(ask);
    var code = codeBox(d, true);
    card.appendChild(code);
    var msg = el("p", "dr-msg");
    card.appendChild(msg);
    var found = null, tapped = null;
    code.addEventListener("click", function (ev) {
      var row = ev.target.closest(".dr-ln");
      if (!row || found !== null) return;
      tapped = +row.dataset.n;
      found = tapped >= d.bug[0] && tapped <= d.bug[1];
      for (var n = d.bug[0]; n <= d.bug[1]; n++) code.querySelector('[data-n="' + n + '"]').classList.add("bug");
      if (!found) row.classList.add("wrong");
      msg.textContent = found ? "Yes, the bug is there." : "Not that line. The bug is in the marked " + (d.bug[1] > d.bug[0] ? "lines" : "line") + ".";
      msg.className = "dr-msg " + (found ? "ok" : "no");
      code.querySelectorAll(".dr-ln").forEach(function (b) { b.disabled = true; });
      step2();
    });
    function step2() {
      ask.textContent = "Step 2. Rewrite the marked " + (d.bug[1] > d.bug[0] ? "lines" : "line") + " so every test passes. Keep each line's indent the same as in the code.";
      var ta = el("textarea", "dr-edit");
      // the lines are shown without the 4 spaces every function line has; they are added back when checking
      ta.value = d.bugText.split("\n").map(function (l) { return l.replace(/^ {4}/, ""); }).join("\n");
      ta.rows = Math.max(2, d.bugText.split("\n").length + 1);
      ta.spellcheck = false; ta.setAttribute("autocapitalize", "off"); ta.setAttribute("autocomplete", "off"); ta.setAttribute("autocorrect", "off");
      card.appendChild(ta);
      var row = el("div", "dr-btns"), check = el("button", "lbtn", "Check my fix"), show = el("button", "lbtn ghost", "Show the answer");
      check.type = show.type = "button"; show.hidden = true;
      var status = el("span", "dr-status");
      row.appendChild(check); row.appendChild(show); row.appendChild(status);
      card.appendChild(row);
      var out = el("div", "dr-out"); card.appendChild(out);
      var tries = 0, finished = false;
      function finish(fixedFirst, mine, gaveUp) {
        if (finished) return; finished = true;
        check.disabled = true; show.disabled = true; ta.readOnly = true;
        var first = found && fixedFirst;
        var res = "Drill " + d.id + " (Habit " + d.habit + ", " + HABITS[d.habit].toLowerCase() + "). The bug was: " + d.bugText.trim().replace(/\n\s*/g, " / ") + ". Found the bug line on the first try: " + (found ? "yes" : "no, I tapped line " + tapped) + ". Fixed it on the first try: " + (fixedFirst ? "yes" : gaveUp ? "no, I looked at the answer" : "no") + ".";
        record(d, first, res, mine);
        explain(d, first, nextDrill);
      }
      check.addEventListener("click", function () {
        if (!P) return;
        var mine = ta.value.replace(/\t/g, "    ").replace(/\s+$/, "").split("\n").map(function (l) { return l.trim() ? "    " + l : l; }).join("\n");
        var lines = d.code.split("\n");
        var src = PRE + lines.slice(0, d.bug[0] - 1).concat(mine.split("\n"), lines.slice(d.bug[1])).join("\n") + "\n";
        var cfg = { need: [d.fn], tests: d.tests.map(function (t) { return { steps: [[t[0], t[1]]] }; }) };
        tries++; check.disabled = true; out.textContent = "";
        P.runPython(src, cfg, status).then(function (r) {
          status.textContent = "";
          if (r.load) { out.appendChild(el("p", "ro-bad", "Python could not read the code. " + r.load)); }
          else {
            var bad = r.tests.filter(function (x) { return !x.ok; });
            if (!bad.length) { out.appendChild(el("p", "ro-good", "All " + r.tests.length + " tests pass.")); finish(tries === 1, mine, false); return; }
            var b = bad[0], t = d.tests[b.id];
            out.appendChild(el("p", "ro-bad", b.err ? "The call " + t[0] + " crashed with " + b.err + "." : "The call " + t[0] + " should return " + P.py(t[1]) + ", but it returned " + b.got + "."));
          }
          show.hidden = false; check.disabled = false;
        }, function (err) {
          status.textContent = ""; check.disabled = false; show.hidden = false;
          out.appendChild(el("p", "ro-bad", err.message === "slow" ? "The code ran for more than 8 seconds, so it was stopped. A loop may never end." : "Python could not start. Check your internet connection and try again."));
        });
      });
      show.addEventListener("click", function () { finish(false, ta.value.replace(/\s+$/, ""), true); });
    }
  }

  /* ---------- a predict drill ---------- */
  function norm(s) {
    s = String(s).trim().replace(/\s+/g, "").replace(/"/g, "'");
    if (/^(true|false|none)$/i.test(s)) s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return s;
  }
  function predictDrill(d) {
    header(d, "predict");
    card.appendChild(codeBox(d, false));
    card.appendChild(el("p", "dr-ask", "Type the value of each name after the last line runs."));
    var form = el("div", "dr-form"), inputs = [];
    d.ask.forEach(function (q) {
      var row = el("label", "dr-q");
      var name = el("code", null, q);
      var inp = el("input", "dr-in"); inp.type = "text"; inp.setAttribute("autocapitalize", "off"); inp.setAttribute("autocomplete", "off"); inp.setAttribute("autocorrect", "off"); inp.spellcheck = false;
      row.appendChild(name); row.appendChild(inp);
      form.appendChild(row); inputs.push(inp);
    });
    card.appendChild(form);
    var row = el("div", "dr-btns"), check = el("button", "lbtn", "Check"); check.type = "button";
    row.appendChild(check); card.appendChild(row);
    check.addEventListener("click", function () {
      if (inputs.some(function (i) { return !i.value.trim(); })) { check.textContent = "Fill in every value first"; return; }
      check.disabled = true;
      var allOk = true, parts = [];
      inputs.forEach(function (inp, i) {
        var ok = norm(inp.value) === norm(d.answers[i]);
        allOk = allOk && ok;
        inp.readOnly = true;
        var lab = inp.parentNode;
        lab.classList.add(ok ? "ok" : "no");
        lab.appendChild(el("span", "dr-ans", ok ? "Right" : "It is " + d.answers[i]));
        parts.push(d.ask[i] + " = " + inp.value.trim() + (ok ? " (right)" : " (wrong, it is " + d.answers[i] + ")"));
      });
      var res = "Drill " + d.id + " (Habit " + d.habit + ", " + HABITS[d.habit].toLowerCase() + "). I predicted " + parts.join(", ") + ".";
      record(d, allOk, res, "");
      explain(d, allOk, nextDrill);
    });
  }

  /* ---------- copy the practice log ---------- */
  var copy = $(".dr-copy", root), cmsg = $(".dr-cmsg", root);
  if (copy) copy.addEventListener("click", function () {
    var text = P ? P.logText() : "";
    function done() { cmsg.textContent = "Copied. Paste it into a chat with Claude and ask what to work on."; }
    function manual() { cmsg.textContent = "Select this text and copy it."; var ta = el("textarea", "log-text"); ta.value = text; ta.readOnly = true; cmsg.appendChild(ta); ta.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, manual); else manual();
  });

  showHome();
})();
