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
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
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
      }, function (err) {
        status.textContent = "";
        if (err.message === "slow") {
          out.appendChild(el("p", "ro-bad", "Your code ran for more than 8 seconds, so I stopped it."));
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
    var frames;
    try { frames = JSON.parse($("script", box).textContent); } catch (e) { return; }
    var pre = $("pre.snip", box);
    var card = el("div", "viz pro wk-card");
    var head = el("div", "vz-head");
    head.appendChild(el("h5", "wk-title", box.dataset.title || "Watch the code run"));
    var body = el("div", "vz-body"), stage = el("div", "vz-stage wk-stage"), code = el("div", "vz-code");
    code.appendChild(pre);
    body.appendChild(stage); body.appendChild(code);
    var foot = el("div", "vz-foot"), cap = el("p", "vz-cap"), ctrl = el("div", "vz-ctrl");
    var back = el("button", "vz-btn", "Back"), next = el("button", "vz-btn primary", "Next");
    back.type = next.type = "button";
    var prog = el("div", "vz-prog"), bar = el("div", "vz-bar"), n = el("span", "vz-n");
    bar.appendChild(el("i"));
    prog.appendChild(bar); prog.appendChild(n);
    ctrl.appendChild(back); ctrl.appendChild(prog); ctrl.appendChild(next);
    foot.appendChild(cap); foot.appendChild(ctrl);
    card.appendChild(head); card.appendChild(body); card.appendChild(foot);
    box.textContent = "";
    box.appendChild(card);

    // fill in what each frame did not list from the frame before it
    var full = [], last = {};
    frames.forEach(function (f) {
      var s = {};
      Object.keys(last).forEach(function (k) { s[k] = last[k]; });
      ["line", "skip", "say", "res"].forEach(function (k) { delete s[k]; });
      Object.keys(f).forEach(function (k) { s[k] = f[k]; });
      if (s.arr && !s.rows) s.rows = [{ cells: s.arr }];
      full.push(s);
      last = s;
    });
    var at = 0;
    function drawRow(row, s) {
      var wrap = el("div", "wk-row");
      if (row.label) wrap.appendChild(el("div", "wk-label", row.label));
      var cellsBox = el("div", "wk-cells");
      var cells = typeof row.cells === "string" ? row.cells.split("") : row.cells;
      var win = row.win || (row === s.rows[0] ? s.win : null);
      var hit = row.hit || (row === s.rows[0] ? s.hit : null) || [];
      var bad = row.bad || (row === s.rows[0] ? s.bad : null) || [];
      var dim = row.dim || (row === s.rows[0] ? s.dim : null) || [];
      var ptr = row.ptr || (row === s.rows[0] ? s.ptr : null) || {};
      cells.forEach(function (c, i) {
        var cell = el("div", "wk-c");
        var tags = Object.keys(ptr).filter(function (k) { return ptr[k] === i; });
        cell.appendChild(el("span", "wk-p", tags.join(", ")));
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
      cap.innerHTML = rich(s.say || "");
      cap.classList.remove("in"); void cap.offsetWidth; cap.classList.add("in");
      n.textContent = "Step " + (at + 1) + " of " + full.length;
      bar.firstChild.style.width = ((at + 1) / full.length * 100) + "%";
      back.disabled = at === 0;
      next.textContent = at === full.length - 1 ? "Start over" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === full.length - 1 ? 0 : at + 1; show(); });
    show();
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
          ta.value = b.dataset.answer;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          msg.textContent = "Here is one answer. Read it, then clear the box and type it again from memory.";
          msg.className = "b-msg";
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
    });

    $$('.lv[data-lv="3"]', lesson).forEach(function (box) {
      var ta = $(".ed", box), KEY = "lsn-" + lesson.dataset.lesson + "-editor-v1";
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
      ta.value = saved || cfg.start;
      codeKeys(ta);
      ta.addEventListener("input", function () { try { localStorage.setItem(KEY, ta.value); } catch (e) { /* storage may be blocked */ } });
      $(".ed-reset", box).addEventListener("click", function () {
        ta.value = cfg.start;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
        $(".run-out", box).textContent = "";
      });
      wireRun(cfg, box, function () { return ta.value; });
    });

    var keys = (cfg.keys || []).concat([["return", "return "], ["for", "for "], ["in", "in "], ["if", "if "]]);
    var seen = {};
    keys = keys.filter(function (k) { if (seen[k[0]]) return false; seen[k[0]] = 1; return true; });
    if (window.CodeKeys) $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, keys); });
  });
})();
