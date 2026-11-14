/* The shared parts of every lesson that has a settings block (script.lsn-cfg):
   the questions, the lines that light up in a growing code block, the walkthrough card,
   and the two practice tabs that run real Python in the browser. */
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  // `name` in a caption shows as code
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>"); }
  function range(spec) {
    var out = [];
    String(spec == null ? "" : spec).split(",").forEach(function (p) {
      if (!p.trim()) return;
      var ab = p.split("-").map(Number);
      for (var i = ab[0]; i <= (ab.length > 1 ? ab[1] : ab[0]); i++) out.push(i);
    });
    return out;
  }

  /* Python runs in a worker, so a slow answer never freezes the page. One worker serves every lesson. */
  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var worker = null, ready = null;
  function startWorker() {
    var src = "importScripts('" + PYODIDE + "pyodide.js');" +
      "var py = loadPyodide({indexURL: '" + PYODIDE + "'}).then(function (p) { postMessage({ready: true}); return p; }," +
      " function (e) { postMessage({fail: String(e)}); });" +
      "onmessage = function (e) { py.then(function (p) { try { p.globals.set('SRC', e.data.src); p.globals.set('CFG', e.data.cfg);" +
      " postMessage({out: p.runPython(e.data.harness)}); } catch (err) { postMessage({err: String(err)}); } }); };";
    worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    ready = new Promise(function (res, rej) {
      worker.onmessage = function (e) {
        if (e.data.ready) res();
        else if (e.data.fail) rej(new Error(e.data.fail));
      };
      worker.onerror = function () { rej(new Error("Python could not be loaded.")); };
    });
  }
  // Each test is a list of steps. A step is [python code, wanted value]. A wanted value of null
  // means the step only runs, for example "k = KthLargest(3, [4, 5, 8, 2])".
  var HARNESS = [
    "import json, traceback, copy",
    "def _norm(v):",
    "    if isinstance(v, tuple):",
    "        v = list(v)",
    "    if isinstance(v, list):",
    "        return [_norm(x) for x in v]",
    "    return v",
    "def _same(got, want, cmp):",
    "    got = _norm(got)",
    "    if isinstance(want, bool):",
    "        return got is want",
    "    if cmp == 'float':",
    "        return isinstance(got, (int, float)) and not isinstance(got, bool) and abs(got - want) < 1e-5",
    "    if cmp == 'sorted':",
    "        return isinstance(got, list) and sorted(got) == sorted(want)",
    "    if cmp == 'sortedInner':",
    "        return isinstance(got, list) and all(isinstance(x, list) for x in got) and sorted(sorted(x) for x in got) == sorted(sorted(x) for x in want)",
    "    return got == want",
    "def _run():",
    "    cfg = json.loads(CFG)",
    "    ns = {'__name__': 'user'}",
    "    try:",
    "        exec(compile(SRC, 'your code', 'exec'), ns)",
    "    except SyntaxError as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e.msg), 'line': e.lineno, 'kind': type(e).__name__}",
    "    except Exception as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e), 'kind': type(e).__name__}",
    "    for name in cfg.get('need', []):",
    "        if name in ns:",
    "            continue",
    "        sol = ns.get('Solution')",
    "        if sol is not None and hasattr(sol, name):",
    "            ns[name] = getattr(sol(), name)",
    "            continue",
    "        return {'load': 'There is no ' + name + ' in your code.', 'kind': 'NoName', 'name': name}",
    "    out = []",
    "    for i, t in enumerate(cfg['tests']):",
    "        r = {'id': i, 'ok': True}",
    "        env = dict(ns)",
    "        k = 0",
    "        try:",
    "            for k, (code, want) in enumerate(t['steps']):",
    "                if want is None:",
    "                    exec(code, env)",
    "                    continue",
    "                got = eval(code, env)",
    "                if not _same(got, want, t.get('cmp', cfg.get('cmp', 'exact'))):",
    "                    r.update({'ok': False, 'step': k, 'got': repr(_norm(got)), 'none': got is None})",
    "                    break",
    "        except Exception as e:",
    "            tb = traceback.extract_tb(e.__traceback__)",
    "            mine = [f.lineno for f in tb if f.filename == 'your code']",
    "            r.update({'ok': False, 'step': k, 'err': type(e).__name__ + ': ' + str(e), 'kind': type(e).__name__, 'line': mine[-1] if mine else None})",
    "        out.append(r)",
    "    return {'tests': out}",
    "json.dumps(_run())"
  ].join("\n");
  // runs wait in line, because the worker answers one run at a time
  var queue = Promise.resolve();
  function runPython(code, cfg, status) {
    var job = queue.then(function () { return runNow(code, cfg, status); });
    queue = job.catch(function () {});
    return job;
  }
  function runNow(code, cfg, status) {
    if (!worker) {
      status.textContent = "Python is loading, and the first time takes a few seconds.";
      startWorker();
    }
    return ready.then(function () {
      status.textContent = "The tests are running.";
      return new Promise(function (res, rej) {
        var timer = setTimeout(function () { worker.terminate(); worker = null; rej(new Error("slow")); }, 8000);
        worker.onmessage = function (e) {
          clearTimeout(timer);
          if (e.data.err) rej(new Error(e.data.err)); else res(JSON.parse(e.data.out));
        };
        worker.postMessage({ src: code, cfg: JSON.stringify(cfg), harness: HARNESS });
      });
    });
  }

  // a wanted value written the way Python prints it
  function py(v) {
    if (v === null) return "None";
    if (v === true) return "True";
    if (v === false) return "False";
    if (typeof v === "string") return "'" + v + "'";
    if (Array.isArray(v)) return "[" + v.map(py).join(", ") + "]";
    return String(v);
  }
  var CRASH = {
    IndexError: "Your code read a position that does not exist. Check the loop limits and every index, such as nums[i + 1].",
    KeyError: "Your code read a key that is not in the dictionary. Check that the key is there first, or read it with .get(key, 0).",
    RecursionError: "A function kept calling itself and never stopped. Check that every call moves closer to the stopping case.",
    ZeroDivisionError: "Your code divided by zero. Check the value you divide by.",
    NameError: "Your code used a name that does not exist yet. Check the spelling of every variable, and set each one before you use it.",
    TypeError: "Your code used a value of the wrong type, or called a function with the wrong number of values. Read the error and check that line.",
    AttributeError: "Your code used something that does not exist on a value. Check the method names and anything that starts with self.",
    UnboundLocalError: "Your code read a variable before giving it a value. Set it before the loop."
  };
  function hintFor(cfg, res) {
    if (res.load) {
      if (/SyntaxError|IndentationError|TabError/.test(res.kind)) {
        return "Python could not read your code" + (res.line ? " at line " + res.line : "") + ". Make sure every def, for, while and if line ends with a colon, and that every block has at least one line inside it.";
      }
      if (res.kind === "NoName") return "The tests call " + cfg.need.join(" and ") + ". Check that the names are spelled exactly like that.";
      return "Your code stopped before the tests began. Read the error above and check the line it names.";
    }
    var fails = res.tests.filter(function (r) { return !r.ok; });
    var crash = fails.filter(function (r) { return r.err; })[0];
    // common mix-ups between list, dict and set methods get their own hint
    var msg = crash ? String(crash.err) : "";
    if (/set\.pop\(\) takes no arguments/.test(msg)) return "A set has no order, so pop() cannot take a value. To remove one exact item from a set, use remove(item).";
    if (/'set' object has no attribute 'append'/.test(msg)) return "A set has no append. To put an item into a set, use add(item).";
    if (/'list' object has no attribute 'add'/.test(msg)) return "A list has no add. To put an item at the end of a list, use append(item).";
    if (/'set' object is not subscriptable/.test(msg)) return "A set has no positions, so it cannot use [ ]. Check whether this should be a list or a dict.";
    if (crash && CRASH[crash.kind]) return CRASH[crash.kind];
    if (fails.some(function (r) { return r.none; })) return "Your code returned None. Make sure the function ends with a return line on every path.";
    var own = fails.filter(function (r) { return cfg.tests[r.id].hint; })[0];
    if (own) return cfg.tests[own.id].hint;
    return "Some answers are wrong. Pick the first failing example and trace it by hand, one loop at a time.";
  }
  function testText(cfg, r) {
    var steps = cfg.tests[r.id].steps;
    var setup = steps.slice(0, r.step).map(function (s) { return s[0]; });
    var call = steps[r.step][0];
    var head = setup.length ? "After " + setup.slice(-2).join(" and ") + (setup.length > 2 ? " (and earlier calls)" : "") + ", the call " : "The call ";
    if (r.err) return head + call + " crashed with " + r.err + (r.line ? " on line " + r.line + "." : ".");
    return head + call + " should return " + py(steps[r.step][1]) + ", but your code returned " + r.got + ".";
  }
  function showResult(cfg, out, res) {
    out.textContent = "";
    if (res.load) {
      out.appendChild(el("p", "ro-bad", "Your code didn't run. " + res.load + (res.line ? " (line " + res.line + ")" : "")));
      out.appendChild(el("p", "ro-hint", hintFor(cfg, res)));
      return;
    }
    var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
    if (pass === all) { out.appendChild(el("p", "ro-good", "All " + all + " tests pass. You wrote the whole solution yourself.")); return; }
    out.appendChild(el("p", "ro-sum", pass + " of " + all + " tests pass."));
    out.appendChild(el("p", "ro-hint", "Here is something to think about. " + hintFor(cfg, res)));
    var ul = el("ul", "ro-list");
    res.tests.filter(function (r) { return !r.ok; }).slice(0, 3).forEach(function (r) { ul.appendChild(el("li", null, testText(cfg, r))); });
    out.appendChild(ul);
  }
  /* Compare the learner's code with one answer, line by line.
     Their code stays as it is. Answer lines they do not have are marked,
     and lines that only they have are listed, so they can fix their own code. */
  function codeLines(text) {
    return String(text).replace(/\t/g, "    ").split("\n").map(function (raw) {
      var t = raw.trim();
      var key = !t || t.charAt(0) === "#" ? "" : t.replace(/'/g, '"').replace(/\s+/g, "");
      return { raw: raw.replace(/\s+$/, ""), key: key };
    });
  }
  function matchLines(a, b) {
    // longest common run of lines, so the order of the lines matters too
    var n = a.length, m = b.length, L = [], i, j;
    for (i = 0; i <= n; i++) { L.push([]); for (j = 0; j <= m; j++) L[i].push(0); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) {
      L[i][j] = a[i].key && a[i].key === b[j].key ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
    var inA = {}, inB = {};
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i].key && a[i].key === b[j].key) { inA[i] = 1; inB[j] = 1; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else j++;
    }
    return { inA: inA, inB: inB };
  }
  function comparePanel(mine, answer) {
    var a = codeLines(mine), b = codeLines(answer), m = matchLines(a, b);
    var missing = b.filter(function (l, j) { return l.key && !m.inB[j]; }).length;
    var extra = a.filter(function (l, i) { return l.key && !m.inA[i]; });
    var box = el("div", "cmp");
    var head = missing || extra.length
      ? "Your code stays as you wrote it. Below is one answer. The marked lines are ones your code does not have in the same form."
      : "Every line of your code matches this answer.";
    box.appendChild(el("p", "cmp-h", head));
    var pre = el("pre", "cmp-code");
    // drop the shared indent, so the lines start at the left edge
    var ind = Math.min.apply(null, b.filter(function (l) { return l.key; }).map(function (l) { return l.raw.match(/^ */)[0].length; }).concat([99]));
    b.forEach(function (l, j) {
      var row = el("span", "cmp-l" + (l.key && !m.inB[j] ? " miss" : ""), l.raw.slice(Math.min(ind, l.raw.match(/^ */)[0].length)) || " ");
      pre.appendChild(row);
    });
    box.appendChild(pre);
    if (extra.length) {
      box.appendChild(el("p", "cmp-h", "These lines are only in your code. Check whether each one is needed or written differently."));
      var mineBox = el("pre", "cmp-code");
      extra.forEach(function (l) { mineBox.appendChild(el("span", "cmp-l extra", l.raw.trim())); });
      box.appendChild(mineBox);
    }
    if (missing || extra.length) box.appendChild(el("p", "cmp-note", "Different names or a different order can still be right. The tests are the real check."));
    return { box: box, missing: b.filter(function (l, j) { return l.key && !m.inB[j]; }).map(function (l) { return l.raw.trim(); }), extra: extra.map(function (l) { return l.raw.trim(); }) };
  }

  /* The practice log: every run and every look at an answer is kept on this phone,
     so the learner can copy it and ask Claude which habits to fix. */
  var LOG = "practice-log-v1";
  function readLog() {
    try { return JSON.parse(localStorage.getItem(LOG) || "[]"); } catch (e) { return []; }
  }
  function addLog(entry) {
    var all = readLog();
    entry.t = new Date().toISOString();
    entry.page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
    all.push(entry);
    if (all.length > 400) all = all.slice(-400);
    try { localStorage.setItem(LOG, JSON.stringify(all)); } catch (e) { /* storage may be full or blocked */ }
    $$(".log-n").forEach(function (n) { n.textContent = logCount(); });
  }
  function logCount() {
    var n = readLog().length;
    return n === 1 ? "1 entry saved on this phone." : n + " entries saved on this phone.";
  }
  function logText() {
    var all = readLog();
    var out = ["My practice log from the memory-systems site, with " + all.length + " entries.",
      "Please look at my mistakes. Tell me which thinking habits cause them, and how to fix those habits for other problems.", ""];
    all.forEach(function (e) {
      var when = e.t.slice(0, 16).replace("T", " ");
      out.push("== " + when + " | " + e.problem + " (" + e.page + ") | " + e.mode);
      if (e.kind === "answer") {
        out.push("I looked at the answer" + (e.gap ? " for gap " + e.gap : "") + ".");
        if (e.missing && e.missing.length) out.push("Answer lines I did not have:\n  " + e.missing.join("\n  "));
        if (e.extra && e.extra.length) out.push("Lines only in my code:\n  " + e.extra.join("\n  "));
      } else {
        out.push("Result: " + e.result);
        (e.fails || []).forEach(function (f) { out.push("Failed: " + f); });
      }
      if (e.code) out.push("My code:\n" + e.code);
      out.push("");
    });
    return out.join("\n");
  }
  function logRow(box) {
    var row = el("div", "log-row");
    var copy = el("button", "lbtn ghost log-copy", "Copy my practice log");
    copy.type = "button";
    var n = el("span", "log-n", logCount()), msg = el("p", "log-msg");
    row.appendChild(copy); row.appendChild(n);
    box.appendChild(row); box.appendChild(msg);
    copy.addEventListener("click", function () {
      var text = logText();
      function done() { msg.textContent = "Copied. Paste it into a chat with Claude and ask what to work on."; }
      function manual() {
        // the phone did not allow copying, so show the text to copy by hand
        msg.textContent = "Select this text and copy it.";
        var ta = el("textarea", "log-text"); ta.value = text; ta.readOnly = true;
        msg.appendChild(ta); ta.focus(); ta.select();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, manual);
      else manual();
    });
  }
  function problemName(lesson) {
    var h = lesson.closest(".deriv");
    h = h && $("h3", h);
    if (!h) return lesson.dataset.lesson;
    var c = h.cloneNode(true);
    $$(".deriv-n, .tag-m, .tag-e, .tag-h, [class^='tag']", c).forEach(function (x) { x.remove(); });
    return c.textContent.trim() || lesson.dataset.lesson;
  }
  // only what the learner typed in each gap, for the log
  function gapText(box) {
    return $$(".blank textarea", box).map(function (t, i) { return "# gap " + (i + 1) + "\n" + t.value.replace(/\s+$/, ""); }).join("\n");
  }
  function wireRun(cfg, box, getCode) {
    var btn = $(".run-btn", box), status = $(".run-status", box), out = $(".run-out", box);
    btn.addEventListener("click", function () {
      var code = getCode();
      if (code == null) return;
      btn.disabled = true;
      out.textContent = "";
      runPython(code, cfg, status).then(function (res) {
        status.textContent = "";
        showResult(cfg, out, res);
        var lesson = box.closest(".lsn");
        var entry = { kind: "run", problem: problemName(lesson), mode: box.dataset.lv === "2" ? "Fill the gaps" : "From blank", code: box.dataset.lv === "2" ? gapText(box) : code };
        if (res.load) { entry.result = "my code did not run: " + res.load + (res.line ? " (line " + res.line + ")" : ""); }
        else {
          var pass = res.tests.filter(function (r) { return r.ok; }).length;
          entry.result = pass + " of " + res.tests.length + " tests pass.";
          entry.fails = res.tests.filter(function (r) { return !r.ok; }).slice(0, 3).map(function (r) { return testText(cfg, r); });
        }
        addLog(entry);
      }, function (err) {
        status.textContent = "";
        if (err.message === "slow") {
          out.appendChild(el("p", "ro-bad", "Your code ran for more than 8 seconds, so I stopped it."));
          addLog({ kind: "run", problem: problemName(box.closest(".lsn")), mode: box.dataset.lv === "2" ? "Fill the gaps" : "From blank", code: box.dataset.lv === "2" ? gapText(box) : code, result: "my code ran for more than 8 seconds, so it was stopped." });
          out.appendChild(el("p", "ro-hint", "Here is something to think about. A loop may never end. Check that every while loop moves a pointer or changes its condition."));
        } else {
          out.appendChild(el("p", "ro-bad", "Python could not start. Check your internet connection and try again. (" + err.message + ")"));
          worker = null;
        }
      }).then(function () { btn.disabled = false; });
    });
  }
  function codeKeys(ta) {
    ta.addEventListener("keydown", function (e) {
      var s = ta.selectionStart, v = ta.value;
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        ta.setRangeText("    ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (e.key === "Enter") {
        var line = v.slice(v.lastIndexOf("\n", s - 1) + 1, s);
        var ind = line.match(/^ */)[0];
        if (/:\s*$/.test(line)) ind += "    ";
        e.preventDefault();
        ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  }
  function dedent(text) {
    var ls = text.replace(/\t/g, "    ").replace(/\s+$/, "").split("\n");
    var min = Infinity;
    ls.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (min === Infinity) min = 0;
    return ls.map(function (l) { return l.slice(min); });
  }

  /* The walkthrough card. Each frame lights one code line and draws one or more rows of cells.
     A frame only lists what changes; everything else stays as it was in the frame before. */
  function walk(box) {
    // one json script is one list of steps; several scripts with data-tab become tabs
    // data-ex names an example string; each example has the same tabs
    var tabs = [], exs = [], data = {};
    try {
      $$('script[type="application/json"]', box).forEach(function (sc) {
        var ex = sc.dataset.ex || "", tab = sc.dataset.tab || "";
        if (exs.indexOf(ex) < 0) exs.push(ex);
        var t = null;
        tabs.forEach(function (x) { if (x.name === tab) t = x; });
        if (!t) { t = { name: tab, code: sc.dataset.code !== "0" }; tabs.push(t); }
        data[ex + "|" + tab] = JSON.parse(sc.textContent);
      });
    } catch (e) { return; }
    if (!tabs.length) return;
    var curTab = 0, curEx = 0;
    var pre = $("pre.snip", box);
    var card = el("div", "viz pro wk-card");
    var head = el("div", "vz-head");
    if (tabs.length > 1) {
      var tb = el("div", "l3-tabs wk-tabs");
      tb.setAttribute("role", "tablist");
      tabs.forEach(function (t, i) {
        var b = el("button", i === 0 ? "on" : "", t.name);
        b.type = "button";
        b.setAttribute("role", "tab");
        b.addEventListener("click", function () { curTab = i; pick(); });
        t.btn = b;
        tb.appendChild(b);
      });
      head.appendChild(tb);
      if (exs.length > 1) {
        var eb = el("div", "wk-exs");
        exs.forEach(function (x, i) {
          var b = el("button", i === 0 ? "on" : "", x);
          b.type = "button";
          b.addEventListener("click", function () {
            curEx = i;
            $$("button", eb).forEach(function (y, j) { y.classList.toggle("on", j === i); });
            pick();
          });
          eb.appendChild(b);
        });
        head.appendChild(eb);
      }
    } else head.appendChild(el("h5", "wk-title", box.dataset.title || "Watch the code run"));
    var body = el("div", "vz-body"), stage = el("div", "vz-stage wk-stage"), code = el("div", "vz-code");
    code.appendChild(pre);
    body.appendChild(stage); body.appendChild(code);
    var foot = el("div", "vz-foot"), cap = el("p", "vz-cap"), ctrl = el("div", "vz-ctrl");
    var back = el("button", "vz-btn", "Back"), next = el("button", "vz-btn primary", "Next");
    back.type = next.type = "button";
    // the bar runs across the top of the footer, and the step count sits between the buttons
    var bar = el("div", "vz-bar"), n = el("span", "vz-n");
    bar.appendChild(el("i"));
    ctrl.appendChild(back); ctrl.appendChild(n); ctrl.appendChild(next);
    foot.appendChild(bar); foot.appendChild(cap); foot.appendChild(ctrl);
    card.appendChild(head); card.appendChild(body); card.appendChild(foot);
    box.textContent = "";
    box.appendChild(card);

    // fill in what each frame did not list from the frame before it
    function expand(frames) {
      var last = {};
      return frames.map(function (f) {
        var s = {};
        Object.keys(last).forEach(function (k) { s[k] = last[k]; });
        ["line", "skip", "say", "res", "ask"].forEach(function (k) { delete s[k]; });
        Object.keys(f).forEach(function (k) { s[k] = f[k]; });
        if (s.arr && !s.rows) s.rows = [{ cells: s.arr }];
        last = s;
        return s;
      });
    }
    Object.keys(data).forEach(function (key) { data[key] = expand(data[key]); });
    var full = data[exs[0] + "|" + tabs[0].name], at = 0;
    function pick() {
      full = data[exs[curEx] + "|" + tabs[curTab].name] || full; at = 0;
      code.hidden = !tabs[curTab].code;
      tabs.forEach(function (t, j) { if (t.btn) t.btn.classList.toggle("on", j === curTab); });
      show();
      steady();
    }
    code.hidden = !tabs[0].code;
    function drawRow(row, s) {
      var wrap = el("div", "wk-row");
      if (row.label) wrap.appendChild(el("div", "wk-label", row.label));
      var cellsBox = el("div", "wk-cells");
      var cells = typeof row.cells === "string" ? row.cells.split("") : row.cells;
      // a long row gets smaller cells, so it stays on one line on a phone
      if (cells.length >= 10) {
        cellsBox.classList.add("many");
        cellsBox.style.gridTemplateColumns = "repeat(" + cells.length + ", minmax(0, 34px))";
      }
      var win = row.win || (row === s.rows[0] ? s.win : null);
      var hit = row.hit || (row === s.rows[0] ? s.hit : null) || [];
      var bad = row.bad || (row === s.rows[0] ? s.bad : null) || [];
      var dim = row.dim || (row === s.rows[0] ? s.dim : null) || [];
      var ptr = row.ptr || (row === s.rows[0] ? s.ptr : null) || {};
      var lastTag = -2, lastLow = false, prevTag = null;
      cells.forEach(function (c, i) {
        var cell = el("div", "wk-c");
        var tags = Object.keys(ptr).filter(function (k) { return ptr[k] === i; });
        var tag = el("span", "wk-p" + (tags.length > 1 ? " multi" : ""), tags.join(", "));
        if (String(c).length > 1) cell.classList.add("wide");
        // labels on neighbouring cells would touch, so the second one moves up a line
        if (tags.length && !cellsBox.classList.contains("many")) {
          var txt = tags.join(", ");
          if (prevTag && prevTag.i === i - 1 && !prevTag.hi && (prevTag.len + txt.length) * 3.4 + 4 > 34) {
            tag.classList.add("up"); cellsBox.classList.add("lanes"); prevTag = { i: i, len: txt.length, hi: true };
          } else prevTag = { i: i, len: txt.length, hi: false };
        }
        // in a long row, a label right next to another label drops to a lower line
        if (tags.length && cellsBox.classList.contains("many")) {
          var low = lastTag === i - 1 && !lastLow;
          if (low) { tag.classList.add("lo"); cellsBox.classList.add("two"); }
          lastTag = i; lastLow = low;
        }
        cell.appendChild(tag);
        var v = el("span", "wk-v", String(c));
        if (win && i >= win[0] && i <= win[1]) v.classList.add("in");
        if (hit.indexOf(i) >= 0) v.classList.add("hit");
        if (bad.indexOf(i) >= 0) v.classList.add("bad");
        if (dim.indexOf(i) >= 0) v.classList.add("dim");
        cell.appendChild(v);
        if (row.idx !== false && s.idx !== false) cell.appendChild(el("span", "wk-i", String(i)));
        cellsBox.appendChild(cell);
      });
      wrap.appendChild(cellsBox);
      return wrap;
    }
    function show() {
      var s = full[at];
      stage.textContent = "";
      (s.rows || []).forEach(function (row) { stage.appendChild(drawRow(row, s)); });
      if (s.vars && s.vars.length) {
        var vs = el("div", "wk-vars");
        s.vars.forEach(function (pair) {
          var chip = el("span", "wk-var");
          chip.appendChild(el("b", null, pair[0]));
          chip.appendChild(document.createTextNode(" = " + pair[1]));
          vs.appendChild(chip);
        });
        stage.appendChild(vs);
      }
      var res = el("p", "vz-res");
      if (s.res) { res.textContent = s.res; res.className = "vz-res on " + (s.bad_res ? "no" : "yes"); }
      stage.appendChild(res);
      var lit = range(s.line);
      $$(".snl", pre).forEach(function (l, i) {
        var on = lit.indexOf(i + 1) >= 0;
        l.classList.toggle("ptr", on);
        l.classList.toggle("skip", on && !!s.skip);
      });
      // an "ask" step poses a question first, and Next shows the answer
      cap.innerHTML = (s.ask ? '<span class="wk-think">Think first</span>' : "") + rich(s.say || "");
      cap.classList.toggle("q", !!s.ask);
      cap.classList.remove("in"); void cap.offsetWidth; cap.classList.add("in");
      n.textContent = (at + 1) + " of " + full.length;
      bar.firstChild.style.width = ((at + 1) / full.length * 100) + "%";
      back.disabled = at === 0;
      next.textContent = at === full.length - 1 ? "Start over" : s.ask ? "Answer" : "Next";
    }
    // draw every step once and keep the tallest picture and text, so Back and Next stay in one place
    function steady() {
      var keep = at, hs = 0, hc = 0;
      stage.style.minHeight = cap.style.minHeight = "";
      if (!card.offsetWidth) return;
      card.classList.add("measuring");
      for (var i = 0; i < full.length; i++) {
        at = i; show();
        hs = Math.max(hs, Math.ceil(stage.getBoundingClientRect().height));
        hc = Math.max(hc, Math.ceil(cap.getBoundingClientRect().height));
      }
      card.classList.remove("measuring");
      at = keep; show();
      stage.style.minHeight = (hs + 8) + "px"; cap.style.minHeight = hc + "px";
    }
    var lastW = 0;
    function resteady() { if (card.offsetWidth && card.offsetWidth !== lastW) { lastW = card.offsetWidth; steady(); } }
    window.addEventListener("resize", resteady);
    if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(resteady); }).observe(card);
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === full.length - 1 ? 0 : at + 1; show(); });
    show();
    resteady();
    // fonts change text heights, so measure again once they have loaded
    function again() { lastW = 0; resteady(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
    window.addEventListener("load", again);
  }

  $$(".lsn[data-lesson]").forEach(function (lesson) {
    var cfgEl = $("script.lsn-cfg", lesson);
    if (!cfgEl) return;
    var cfg = JSON.parse(cfgEl.textContent);

    /* Questions outside the stages: questions next to each other share one spot */
    $$(".mcq", lesson).forEach(function (q) {
      if (q.closest(".stages")) return;
      var prev = q.previousElementSibling;
      if (prev && prev.classList.contains("mcq")) return;
      var run = [q], nx = q.nextElementSibling;
      while (nx && nx.classList.contains("mcq")) { run.push(nx); nx = nx.nextElementSibling; }
      run.forEach(function (quiz) {
        var why = $(".why", quiz);
        $$(".choice", quiz).forEach(function (btn) {
          btn.addEventListener("click", function () {
            $$(".choice", quiz).forEach(function (b) { b.classList.remove("picked"); });
            btn.classList.add("picked");
            why.textContent = btn.getAttribute("data-why");
          });
        });
      });
      if (run.length < 2) return;
      var set = el("div", "mcq-set");
      q.parentNode.insertBefore(set, q);
      run.forEach(function (r) { set.appendChild(r); });
      var bar = el("div", "mcq-nav");
      bar.innerHTML = '<span></span><button type="button">Back</button><button type="button">Next question</button>';
      set.appendChild(bar);
      var label = $("span", bar), qb = $$("button", bar), at = 0;
      function showQ(i) {
        at = i;
        run.forEach(function (r, k) { r.style.display = k === i ? "" : "none"; });
        label.textContent = "Question " + (i + 1) + " of " + run.length;
        qb[0].disabled = i === 0;
        qb[1].disabled = i === run.length - 1;
      }
      qb[0].addEventListener("click", function () { showQ(at - 1); });
      qb[1].addEventListener("click", function () { showQ(at + 1); });
      showQ(0);
    });

    /* Code that grows: light up the lines this step adds */
    $$(".grow", lesson).forEach(function (g) {
      var want = range(g.dataset["new"]);
      $$(".snl", g).forEach(function (l, i) { l.classList.toggle("new", want.indexOf(i + 1) >= 0); });
    });

    $$(".wk", lesson).forEach(walk);

    /* The practice tabs */
    var tabs = $$(".lv-tabs button", lesson), levels = $$(".lv", lesson);
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.toggle("on", x === t); });
        levels.forEach(function (l) { l.hidden = l.dataset.lv !== t.dataset.lv; });
      });
    });

    $$('.lv[data-lv="2"]', lesson).forEach(function (box) {
      var blanks = $$(".blank", box);
      blanks.forEach(function (b) {
        var ta = $("textarea", b), msg = $(".b-msg", b);
        codeKeys(ta);
        $(".b-hint", b).addEventListener("click", function () { msg.textContent = b.dataset.hint; msg.className = "b-msg hint"; });
        $(".b-show", b).addEventListener("click", function () {
          if (!ta.value.trim() && !b.dataset.asked) {
            b.dataset.asked = "1";
            msg.textContent = "Try typing something first. A wrong guess teaches more than reading the answer. Press Show answer again to see it anyway.";
            msg.className = "b-msg hint";
            return;
          }
          var old = $(".cmp", b), btn = $(".b-show", b);
          if (old) { old.remove(); btn.textContent = "Show answer"; return; }
          var c = comparePanel(ta.value, b.dataset.answer);
          b.appendChild(c.box);
          btn.textContent = "Hide answer";
          msg.textContent = "";
          addLog({ kind: "answer", problem: problemName(lesson), mode: "Fill the gaps", gap: blanks.indexOf(b) + 1, code: ta.value.replace(/\s+$/, ""), missing: c.missing, extra: c.extra });
        });
      });
      wireRun(cfg, box, function () {
        if (blanks.some(function (b) { return !$("textarea", b).value.trim(); })) {
          $(".run-status", box).textContent = "Please fill in every gap first, and press Hint if you are stuck.";
          return null;
        }
        return blanks.map(function (b, i) {
          var pad = new Array(+b.dataset.indent + 1).join(" ");
          return (cfg.before[i] || "") + dedent($("textarea", b).value).map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
        }).join("") + (cfg.after || "");
      });
      logRow(box);
    });

    $$('.lv[data-lv="3"]', lesson).forEach(function (box) {
      var ta = $(".ed", box), KEY = "lsn-" + lesson.dataset.lesson + "-editor-v1";
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
      ta.value = saved || cfg.start;
      codeKeys(ta);
      ta.addEventListener("input", function () { try { localStorage.setItem(KEY, ta.value); } catch (e) { /* storage may be blocked */ } });
      $(".ed-reset", box).addEventListener("click", function () {
        var before = ta.value, out = $(".run-out", box);
        ta.value = cfg.start;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
        out.textContent = "";
        var co = $(".cmp-out", box), cb = $(".ed-cmp", box);
        if (co) co.textContent = "";
        if (cb) cb.textContent = "Compare with the answer";
        // one tap clears the code, so give a way back
        if (before.trim() && before !== cfg.start) {
          var p = el("p", "ro-hint", "Your code was cleared. ");
          var undo = el("button", "lbtn ghost ed-undo", "Undo");
          undo.type = "button";
          undo.addEventListener("click", function () {
            ta.value = before;
            ta.dispatchEvent(new Event("input", { bubbles: true }));
            out.textContent = "";
          });
          p.appendChild(undo);
          out.appendChild(p);
        }
      });
      wireRun(cfg, box, function () { return ta.value; });

      // compare with one answer, built from the fixed code and the gap answers
      var gapsBox = $('.lv[data-lv="2"]', lesson);
      if (gapsBox && cfg.before) {
        var answer = $$(".blank", gapsBox).map(function (b, i) {
          var pad = new Array(+b.dataset.indent + 1).join(" ");
          return (cfg.before[i] || "") + b.dataset.answer.split("\n").map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
        }).join("") + (cfg.after || "");
        var cmpBtn = el("button", "lbtn ghost ed-cmp", "Compare with the answer");
        cmpBtn.type = "button";
        $(".run", box).insertBefore(cmpBtn, $(".run-status", box));
        var cmpOut = el("div", "cmp-out");
        $(".run-out", box).after(cmpOut);
        var asked = false;
        cmpBtn.addEventListener("click", function () {
          if (cmpOut.firstChild) { cmpOut.textContent = ""; cmpBtn.textContent = "Compare with the answer"; return; }
          if (ta.value.trim() === cfg.start.trim() && !asked) {
            asked = true;
            cmpOut.appendChild(el("p", "ro-hint", "Try writing something first. A wrong guess teaches more than reading the answer. Press the button again to see it anyway."));
            return;
          }
          var c = comparePanel(ta.value, answer);
          cmpOut.appendChild(c.box);
          cmpBtn.textContent = "Hide the answer";
          addLog({ kind: "answer", problem: problemName(lesson), mode: "From blank", code: ta.value.replace(/\s+$/, ""), missing: c.missing, extra: c.extra });
        });
      }
      logRow(box);
    });

    var keys = (cfg.keys || []).concat([["return", "return "], ["for", "for "], ["in", "in "], ["if", "if "]]);
    var seen = {};
    keys = keys.filter(function (k) { if (seen[k[0]]) return false; seen[k[0]] = 1; return true; });
    if (window.CodeKeys) $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, keys); });
  });
})();
