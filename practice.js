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
  // Runs the learner's own code on one test, one line at a time, and records each line with a short note
  // of what changed (like the Code tab of a step card). Kept in sync with tools/practice_trace.py.
  var TRACE_HARNESS = "# Python that runs inside the page's Python worker to trace the learner's own code.\n# Globals given by the worker: SRC (the learner's code), CFG (json with tests, need, trace = test index).\nimport json, sys, re\nfrom collections import Counter, deque\n\n_SAFE = {'len', 'max', 'min', 'abs', 'float', 'int', 'str', 'sorted', 'sum', 'range', 'set', 'list', 'dict', 'tuple', 'Counter', 'isinstance', 'ord', 'chr'}\n_LIMIT = 400\n\n\nclass _Stop(Exception):\n    pass\n\n\ndef _show(v, depth=0):\n    if depth > 3:\n        return '\u2026'\n    if isinstance(v, (Counter, dict)):\n        items = list(v.items())\n        s = ', '.join(f'{_key(k)}: {_show(x, depth + 1)}' for k, x in items[:12])\n        return '{' + s + (', \u2026' if len(items) > 12 else '') + '}'\n    if isinstance(v, (set, frozenset)):\n        return '{' + ', '.join(_key(k) for k in list(v)[:12]) + '}' if v else 'set()'\n    if isinstance(v, (list, deque, tuple)):\n        s = ', '.join(_show(x, depth + 1) for x in list(v)[:12])\n        return '[' + s + (', \u2026' if len(v) > 12 else '') + ']'\n    if isinstance(v, float) and v == float('inf'):\n        return 'inf'\n    if isinstance(v, str):\n        return v if len(v) == 1 else '\"' + (v if len(v) <= 30 else v[:30] + '\u2026') + '\"'\n    if callable(v) or type(v).__module__ not in ('builtins', 'collections'):\n        return None\n    return str(v)\n\n\ndef _key(k):\n    return k if isinstance(k, str) else _show(k)\n\n\ndef _snap(loc):\n    out = {}\n    for k, v in loc.items():\n        if k.startswith('__') or k == 'self':\n            continue\n        s = _show(v)\n        if s is not None:\n            out[k] = s\n    return out\n\n\ndef _names(expr):\n    return [n for n in dict.fromkeys(re.findall(r'[A-Za-z_]\\w*', expr)) if n not in _SAFE and n not in ('and', 'or', 'not', 'in', 'is', 'None', 'True', 'False')]\n\n\ndef _cond_note(cond, frame):\n    # never run a check that calls something that could change data (like pop), only plain reads\n    calls = re.findall(r'([A-Za-z_][\\w.]*)\\s*\\(', cond)\n    if any(c.split('.')[-1] not in _SAFE for c in calls):\n        return ''\n    env = dict(frame.f_globals); env.update(frame.f_locals)\n    try:\n        val = bool(eval(cond, env))\n    except Exception:\n        return ''\n    parts = re.split(r'\\s+(==|!=|<=|>=|<|>|not in|in)\\s+', cond)\n    if len(parts) == 3 and ' and ' not in cond and ' or ' not in cond:\n        try:\n            left, right = _show(eval(parts[0], env)), _show(eval(parts[2], env))\n            if left is not None and right is not None:\n                return f'{left} {parts[1]} {right} \u2192 {val}'\n        except Exception:\n            pass\n    return f'\u2192 {val}'\n\n\ndef _change_note(code, before, after):\n    s = code.strip()\n    changed = [n for n in after if before.get(n) != after[n]]\n    m = re.match(r'([A-Za-z_]\\w*)\\s*=\\s*(.*)$', s)\n    if m and m.group(1) in after:\n        if not _names(m.group(2)):\n            changed = [n for n in changed if n != m.group(1)]\n        elif m.group(1) not in changed:\n            changed = [m.group(1)] + changed\n    return ', '.join(f'{n} = {after[n]}' for n in changed[:3])\n\n\ndef _trace():\n    cfg = json.loads(CFG)\n    ns = {'__name__': 'user'}\n    exec(compile(SRC, 'your code', 'exec'), ns)\n    for name in cfg.get('need', []):\n        if name not in ns and ns.get('Solution') is not None and hasattr(ns['Solution'], name):\n            ns[name] = getattr(ns['Solution'](), name)\n    lines = SRC.split('\\n')\n    test = cfg['tests'][cfg['trace']]\n    steps = []\n    open_ = {}   # frame -> (line, locals before, note decided before the line ran)\n\n    def close(frame, after, ret=None, returned=False):\n        line, before, pre = open_.pop(frame)\n        code = lines[line - 1] if 0 < line <= len(lines) else ''\n        if pre is not None:\n            note = pre\n        elif code.strip().startswith('return') and returned:\n            note = '\u2192 ' + (_show(ret) or '')\n        else:\n            note = _change_note(code, before, after)\n        steps.append({'line': line, 'note': note})\n        if len(steps) >= _LIMIT:\n            raise _Stop()\n\n    def tracer(frame, event, arg):\n        if frame.f_code.co_filename != 'your code':\n            return None\n        if event == 'line':\n            if frame in open_:\n                close(frame, _snap(frame.f_locals))\n            code = lines[frame.f_lineno - 1].strip() if frame.f_lineno <= len(lines) else ''\n            m = re.match(r'(?:if|elif|while)\\s+(.*):\\s*(#.*)?$', code)\n            open_[frame] = (frame.f_lineno, _snap(frame.f_locals), _cond_note(m.group(1), frame) if m else None)\n        elif event == 'exception':\n            # the line that was running raised an error: that is the last step, marked with the error\n            if frame in open_:\n                line, before, pre = open_.pop(frame)\n                steps.append({'line': line, 'note': '\u2717 ' + arg[0].__name__, 'err': True})\n        elif event == 'return':\n            if frame in open_:\n                close(frame, _snap(frame.f_locals), arg, True)\n        return tracer\n\n    result = {'steps': steps, 'call': None}\n    env = dict(ns)\n    sys.settrace(tracer)\n    try:\n        for code, want in test['steps']:\n            result['call'] = code\n            if want is None:\n                exec(code, env)\n            else:\n                result['got'] = _show(eval(code, env))\n    except _Stop:\n        result['stopped'] = True\n    except Exception as e:\n        result['err'] = type(e).__name__ + ': ' + str(e)\n        open_.clear()\n    finally:\n        sys.settrace(None)\n    return result\n\n\njson.dumps(_trace())\n";
  function traceNow(code, cfg, idx) {
    if (!worker) startWorker();
    return ready.then(function () {
      return new Promise(function (res, rej) {
        var timer = setTimeout(function () { worker.terminate(); worker = null; rej(new Error("slow")); }, 8000);
        worker.onmessage = function (e) {
          clearTimeout(timer);
          if (e.data.err) rej(new Error(e.data.err)); else res(JSON.parse(e.data.out));
        };
        var c = JSON.parse(JSON.stringify(cfg)); c.trace = idx;
        worker.postMessage({ src: code, cfg: JSON.stringify(c), harness: TRACE_HARNESS });
      });
    });
  }
  function tracePython(code, cfg, idx) {
    var job = queue.then(function () { return traceNow(code, cfg, idx); });
    queue = job.catch(function () {});
    return job;
  }
  // the step-by-step view of the learner's own code
  function showTrace(out, code, box, tr) {
    var old = $(".trace", out); if (old) old.remove();
    var panel = el("div", "trace");
    var lines = code.replace(/\s+$/, "").split("\n");
    var mine = {};
    if (box && box._gaps && box.dataset.lv === "2") box._gaps.forEach(function (g, gi) { for (var n = g[0]; n <= g[1]; n++) mine[n] = gi + 1; });
    var head = el("p", "trace-head");
    head.appendChild(document.createTextNode("Tracing "));
    head.appendChild(el("code", null, tr.call || "your code"));
    head.appendChild(document.createTextNode(" one line at a time."));
    var pre = el("div", "trace-code"), rows = [];
    lines.forEach(function (l, i) {
      var row = el("span", "tl" + (mine[i + 1] ? " mine" : ""));
      row.appendChild(el("span", "tn", String(i + 1)));
      row.appendChild(el("span", "tc", l || " "));
      pre.appendChild(row); rows.push(row);
    });
    var info = el("p", "trace-info");
    var nav = el("div", "trace-nav");
    var back = el("button", "lbtn ghost", "Back"), n = el("span", "trace-n"), next = el("button", "lbtn", "Next");
    back.type = next.type = "button";
    nav.appendChild(back); nav.appendChild(n); nav.appendChild(next);
    panel.appendChild(head); panel.appendChild(pre); panel.appendChild(info); panel.appendChild(nav);
    out.appendChild(panel);
    var steps = tr.steps || [], at = 0;
    function show() {
      rows.forEach(function (r) { r.classList.remove("on", "bad"); var x = $(".inl", r); if (x) x.remove(); });
      if (!steps.length) { info.textContent = "No line of your function ran."; n.textContent = ""; return; }
      var s = steps[at], r = rows[s.line - 1];
      if (r) {
        r.classList.add("on"); if (s.err) r.classList.add("bad");
        if (s.note) r.appendChild(el("span", "inl note", "# " + s.note));
        var pr = pre.getBoundingClientRect(), rr = r.getBoundingClientRect();
        pre.scrollTop += (rr.top + rr.bottom) / 2 - (pr.top + pr.bottom) / 2;
      }
      n.textContent = (at + 1) + " of " + steps.length;
      var last = at === steps.length - 1, msg = "Line " + s.line + (mine[s.line] ? ", in gap " + mine[s.line] : "") + ".";
      if (last && tr.err) msg = "Your code crashed on line " + s.line + (mine[s.line] ? " (in gap " + mine[s.line] + ")" : "") + " with " + tr.err + ".";
      else if (last && tr.stopped) msg = "I stopped after " + steps.length + " lines. A loop may never end, so check what changes each time around it.";
      else if (last && tr.got != null) msg = "Your function returned " + tr.got + ".";
      info.textContent = msg;
      back.disabled = at === 0; next.disabled = last;
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { if (at < steps.length - 1) { at++; show(); } });
    show();
  }
  function traceButton(cfg, out, res) {
    if (!lastCode || !res.tests) return;
    var fail = res.tests.filter(function (r) { return !r.ok; })[0];
    var idx = fail ? fail.id : 0, code = lastCode, box = lastBox;
    var b = el("button", "lbtn trace-btn", fail ? "Trace my code on the first failing test" : "Trace my code on the first test");
    b.type = "button";
    b.addEventListener("click", function () {
      b.disabled = true; b.textContent = "Tracing…";
      tracePython(code, cfg, idx).then(function (tr) {
        b.remove(); showTrace(out, code, box, tr);
      }, function () { b.disabled = false; b.textContent = "Tracing took too long. Try again"; });
    });
    out.appendChild(b);
  }
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
        return "Python could not read your code" + (res.line ? " at " + where(res.line) : "") + ". Make sure every def, for, while and if line ends with a colon, and that every block has at least one line inside it.";
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
  // "line 18" alone is hard to find, so show the line itself, and its gap in Fill the gaps
  var lastCode = "", lastBox = null;
  function where(n) {
    if (!n) return "";
    var text = (lastCode.split("\n")[n - 1] || "").trim();
    var gap = "";
    if (lastBox && lastBox._gaps && lastBox.dataset.lv === "2") lastBox._gaps.forEach(function (g, i) { if (n >= g[0] && n <= g[1]) gap = " (in gap " + (i + 1) + ")"; });
    return "line " + n + gap + (text ? ": " + text : "");
  }
  function testText(cfg, r) {
    var steps = cfg.tests[r.id].steps;
    var setup = steps.slice(0, r.step).map(function (s) { return s[0]; });
    var call = steps[r.step][0];
    var head = setup.length ? "After " + setup.slice(-2).join(" and ") + (setup.length > 2 ? " (and earlier calls)" : "") + ", the call " : "The call ";
    if (r.err) return head + call + " crashed with " + r.err + (r.line ? " on " + where(r.line) : ".");
    return head + call + " should return " + py(steps[r.step][1]) + ", but your code returned " + r.got + ".";
  }
  function showResult(cfg, out, res) {
    out.textContent = "";
    if (res.load) {
      out.appendChild(el("p", "ro-bad", "Your code didn't run. " + res.load + (res.line ? " (" + where(res.line) + ")" : "")));
      out.appendChild(el("p", "ro-hint", hintFor(cfg, res)));
      return;
    }
    var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
    if (pass === all) { out.appendChild(el("p", "ro-good", "All " + all + " tests pass. You wrote the whole solution yourself.")); traceButton(cfg, out, res); return; }
    out.appendChild(el("p", "ro-sum", pass + " of " + all + " tests pass."));
    out.appendChild(el("p", "ro-hint", "Here is something to think about. " + hintFor(cfg, res)));
    var ul = el("ul", "ro-list");
    res.tests.filter(function (r) { return !r.ok; }).slice(0, 3).forEach(function (r) { ul.appendChild(el("li", null, testText(cfg, r))); });
    out.appendChild(ul);
    traceButton(cfg, out, res);
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
  // the three practice levels: 4 = From blank (only the function line), 3 = From comments (numbered outline), 2 = Fill the gaps
  function modeName(box) { return box.dataset.lv === "2" ? "Fill the gaps" : box.dataset.lv === "4" ? "From blank" : "From comments"; }
  // the From blank start: the outline without its comments, so only imports and the function line are left
  function bareStart(start) {
    var out = [];
    start.split("\n").forEach(function (l) {
      if (/^\s*#/.test(l)) return;
      if (!l.trim() && (!out.length || !out[out.length - 1].trim())) return;
      out.push(l.replace(/\s+$/, ""));
    });
    var filled = out.filter(function (l) { return l.trim(); }), last = filled.length ? filled[filled.length - 1] : "";
    var ind = (last.match(/^\s*/)[0] || "") + (/:\s*$/.test(last) ? "    " : "");
    return out.join("\n").replace(/\s+$/, "") + "\n" + ind + "\n";
  }
  function wireRun(cfg, box, getCode) {
    var btn = $(".run-btn", box), status = $(".run-status", box), out = $(".run-out", box);
    btn.addEventListener("click", function () {
      var code = getCode();
      if (code == null) return;
      lastCode = code; lastBox = box;
      btn.disabled = true;
      out.textContent = "";
      runPython(code, cfg, status).then(function (res) {
        status.textContent = "";
        showResult(cfg, out, res);
        var lesson = box.closest(".lsn");
        var entry = { kind: "run", problem: problemName(lesson), mode: modeName(box), code: box.dataset.lv === "2" ? gapText(box) : code };
        if (res.load) { entry.result = "my code did not run: " + res.load + (res.line ? " (" + where(res.line) + ")" : ""); }
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
          addLog({ kind: "run", problem: problemName(box.closest(".lsn")), mode: modeName(box), code: box.dataset.lv === "2" ? gapText(box) : code, result: "my code ran for more than 8 seconds, so it was stopped." });
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
    var groups = null;
    try { groups = box.dataset.groups ? JSON.parse(box.dataset.groups) : null; } catch (e) { groups = null; }
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
        ["line", "skip", "say", "res", "ask", "note"].forEach(function (k) { delete s[k]; });
        Object.keys(f).forEach(function (k) { s[k] = f[k]; });
        if (s.arr && !s.rows) s.rows = [{ cells: s.arr }];
        last = s;
        return s;
      });
    }
    Object.keys(data).forEach(function (key) { data[key] = expand(data[key]); });
    // every variable keeps one fixed spot for the whole tab, across all examples,
    // so the eye always finds it in the same place
    var slots = {};
    Object.keys(data).forEach(function (key) {
      var tab = key.slice(key.indexOf("|") + 1);
      var sl = slots[tab] || (slots[tab] = { order: [], len: {} });
      data[key].forEach(function (f) {
        (f.vars || []).forEach(function (p) {
          if (sl.order.indexOf(p[0]) < 0) sl.order.push(p[0]);
          sl.len[p[0]] = Math.max(sl.len[p[0]] || 0, (p[0] + " = " + p[1]).length);
        });
      });
    });
    var full = data[exs[0] + "|" + tabs[0].name], at = 0;
    function pick() {
      full = data[exs[curEx] + "|" + tabs[curTab].name] || full; at = 0;
      code.hidden = !tabs[curTab].code;
      // a code tab shows only the code, with the values on its lines
      card.classList.toggle("code-only", tabs.length > 1 && tabs[curTab].code);
      tabs.forEach(function (t, j) { if (t.btn) t.btn.classList.toggle("on", j === curTab); });
      show();
      steady();
    }
    code.hidden = !tabs[0].code;
    card.classList.toggle("code-only", tabs.length > 1 && tabs[0].code);
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
      if (lanesAll && !cellsBox.classList.contains("many")) cellsBox.classList.add("lanes");
      wrap.appendChild(cellsBox);
      return wrap;
    }
    function show() {
      var s = full[at];
      stage.textContent = "";
      (s.rows || []).forEach(function (row, k) {
        var w = drawRow(row, s);
        if (rowMin[k] && useMins) w.style.minHeight = rowMin[k] + "px";
        stage.appendChild(w);
      });
      // pointer labels share one line; a label moves up a line only when it really overlaps the label before it
      $$(".wk-cells:not(.many)", stage).forEach(function (cb) {
        var prev = null;
        $$(".wk-p", cb).forEach(function (p) {
          if (!p.textContent) return;
          var r = p.getBoundingClientRect();
          if (prev && !prev.up && r.left < prev.r.right + 2) { p.classList.add("up"); cb.classList.add("lanes"); prev = { r: r, up: true }; }
          else prev = { r: r, up: false };
        });
      });
      var sl = slots[tabs[curTab].name];
      // once a variable has appeared, it stays with its latest value, like a real Python variable
      var now = {}, before = {};
      for (var k = 0; k <= at; k++) (full[k].vars || []).forEach(function (p) { now[p[0]] = p[1]; if (k < at) before[p[0]] = p[1]; });
      // in a tab that shows code, the values sit next to the code lines instead of in a separate panel
      var inlineVals = tabs.length > 1 && tabs[curTab].code;
      if (sl && sl.order.length && !inlineVals) {
        // a variable not in use yet keeps its spot but stays hidden, so nothing shifts
        function chipFor(name) {
          var chip = el("span", "wk-var");
          chip.appendChild(el("b", null, name));
          // keep each "A: 1" pair together, so a long dictionary only wraps between pairs
          var val = el("span", "wk-val", "= " + (name in now ? String(now[name]).replace(/: /g, ":\u00a0") : ""));
          chip.appendChild(val);
          if (!(name in now)) chip.classList.add("off");
          if (chipMin[name] && useMins) val.style.minHeight = chipMin[name] + "px";
          return chip;
        }
        // a card can sort its variables into labelled groups (data-groups), such as
        // "What we need", "Current window" and "Best so far"; each group keeps its place
        var used = {}, list = groups ? groups.slice() : [];
        list.forEach(function (g) { g[1].forEach(function (n) { used[n] = 1; }); });
        var rest = sl.order.filter(function (n) { return !used[n]; });
        // every group uses the same name column, so all the "=" signs line up down the card
        // the name column is as wide as the widest name, measured in the real font
        stage.style.removeProperty("--nw");
        if (rest.length) list.push(["", rest]);
        list.forEach(function (g) {
          var names = g[1].filter(function (n) { return sl.order.indexOf(n) >= 0; });
          if (!names.length) return;
          var box = el("div", groups ? "wk-grp" : "wk-grp bare");
          if (g[0]) box.appendChild(el("div", "wk-gt", g[0]));
          var vs = el("div", "wk-vars fixed");
          names.forEach(function (n) { vs.appendChild(chipFor(n)); });
          box.appendChild(vs);
          stage.appendChild(box);
        });
      }
      // every group shares one name column, so all the "=" signs line up down the card
      var bs = $$(".wk-vars.fixed .wk-var b", stage), nwpx = 0;
      bs.forEach(function (x) { nwpx = Math.max(nwpx, x.scrollWidth); });
      if (nwpx) stage.style.setProperty("--nw", Math.ceil(nwpx + 6) + "px");
      var res = el("p", "vz-res");
      if (s.res) { res.textContent = s.res; res.className = "vz-res on " + (s.bad_res ? "no" : "yes"); }
      stage.appendChild(res);
      var lit = range(s.line), setHere = {}, lastSet = {};
      var target = function (src) {
        var m = /^\s*for\s+(\w+)\s+in\b/.exec(src) || /^\s*([A-Za-z_]\w*)(?:\[[^\]]*\])?\s*(?:\+=|-=|=(?!=))/.exec(src) ||
          /^\s*([A-Za-z_]\w*)\.(?:add|append|appendleft|remove|discard|pop|popleft|extend|clear)\(/.exec(src);
        return m ? m[1] : null;
      };
      // a variable's value is shown only on the last highlighted line that changes it, where the value is true
      $$(".snl", pre).forEach(function (l, i) {
        if (lit.indexOf(i + 1) < 0) return;
        var tg = target(l.textContent);
        if (tg) lastSet[tg] = i;
      });
      $$(".snl", pre).forEach(function (l, i) {
        var on = lit.indexOf(i + 1) >= 0;
        l.classList.toggle("ptr", on);
        l.classList.toggle("skip", on && !!s.skip);
        // like a debugger: a highlighted line shows the value of the variable it changes,
        // or, for an if, while or return line, the values it reads
        $$(".inl", l).forEach(function (x) { x.remove(); });
        if (!on || !inlineVals) return;
        // a step recorded by running the code carries its own note: a quiet comment at the end of the line
        if ("note" in s) {
          if (s.note) l.appendChild(el("span", "inl note", "# " + s.note));
          return;
        }
        var src = l.textContent, names = [], vals = now;
        var tg = target(src);
        if (tg) { setHere[tg] = 1; if (lastSet[tg] === i) names = [tg]; }
        else if (/^\s*(if|elif|while|return)\b/.test(src)) {
          // a check reads each value as it is at that line: the new value if a line above in this
          // step set it, otherwise the value from before this step
          vals = {};
          (src.match(/[A-Za-z_]\w*/g) || []).forEach(function (w) {
            var v = setHere[w] ? now[w] : before[w];
            if (v !== undefined && names.indexOf(w) < 0) { names.push(w); vals[w] = v; }
          });
          names = names.slice(0, 3);
        }
        names = names.filter(function (n) { return n in vals; });
        if (!names.length) return;
        l.appendChild(el("span", "inl", names.map(function (n) { return n + " = " + vals[n]; }).join(", ")));
      });
      // the code box scrolls itself so the highlighted lines sit in its middle
      var hl = $$(".snl.ptr", pre);
      if (hl.length && pre.scrollHeight > pre.clientHeight + 2 && !code.hidden) {
        var pr = pre.getBoundingClientRect();
        var mid = (hl[0].getBoundingClientRect().top + hl[hl.length - 1].getBoundingClientRect().bottom) / 2 - pr.top + pre.scrollTop;
        var goal = Math.max(0, Math.round(mid - pre.clientHeight / 2));
        if (card.classList.contains("measuring") || !pre.scrollTo) pre.scrollTop = goal;
        else pre.scrollTo({ top: goal, behavior: "smooth" });
      }
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
      var keep = at, hs = 0, hc = 0, lanes = false;
      stage.style.minHeight = cap.style.minHeight = "";
      if (!card.offsetWidth) return;
      card.classList.add("measuring");
      // if any step needs two label lines, every step keeps both lines, so the rows below never move
      lanesAll = false;
      for (var j = 0; j < full.length; j++) { at = j; show(); if (stage.querySelector(".wk-cells.lanes")) lanes = true; }
      lanesAll = lanes;
      // the tallest version of each row and each variable chip becomes its fixed height
      rowMin = []; chipMin = {}; useMins = false;
      for (var i = 0; i < full.length; i++) {
        at = i; show();
        $$(".wk-row", stage).forEach(function (r, k) { rowMin[k] = Math.max(rowMin[k] || 0, Math.ceil(r.getBoundingClientRect().height)); });
        $$(".wk-var", stage).forEach(function (c) { var nm = c.firstChild.textContent, v = c.querySelector(".wk-val"); if (v) chipMin[nm] = Math.max(chipMin[nm] || 0, Math.ceil(v.getBoundingClientRect().height)); });
      }
      // measure the card heights again with those fixed heights in place
      useMins = true;
      // the code box also keeps its tallest height, because values shown next to lines can add height
      pre.style.minHeight = "";
      var hp = 0;
      for (var q = 0; q < full.length; q++) {
        at = q; show();
        hs = Math.max(hs, Math.ceil(stage.getBoundingClientRect().height));
        hc = Math.max(hc, Math.ceil(cap.getBoundingClientRect().height));
        if (!code.hidden) hp = Math.max(hp, Math.ceil(pre.getBoundingClientRect().height));
      }
      if (hp) pre.style.minHeight = hp + "px";
      card.classList.remove("measuring");
      at = keep; show();
      stage.style.minHeight = (hs + 8) + "px"; cap.style.minHeight = hc + "px";
    }
    var lastW = 0, lanesAll = false, rowMin = [], chipMin = {}, useMins = true;
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

    /* The practice tabs. "From blank" is made here as a copy of the comments editor. */
    var lv3 = $('.lv[data-lv="3"]', lesson), t3 = $('.lv-tabs button[data-lv="3"]', lesson);
    if (lv3 && t3 && !$('.lv[data-lv="4"]', lesson) && cfg.start) {
      var lv4 = lv3.cloneNode(true);
      lv4.dataset.lv = "4";
      var intro = $("p", lv4);
      if (intro) intro.textContent = "Write the whole function from memory, with no outline. Only the function line is given. A failed test gives a hint.";
      var intro3 = $("p", lv3);
      if (intro3) intro3.textContent = "Write the whole function from the numbered comments. Each comment describes one job. A failed test gives a hint.";
      lv3.parentNode.insertBefore(lv4, lv3);
      var t4 = t3.cloneNode(true);
      t4.dataset.lv = "4"; t4.textContent = "From blank";
      t3.textContent = "From comments";
      t3.parentNode.insertBefore(t4, t3);
      $$(".lv-tabs button", lesson).forEach(function (x) { x.classList.toggle("on", x === t4); });
      $$(".lv", lesson).forEach(function (l) { l.hidden = l !== lv4; });
    }
    // "Build it" (the full code with the interview walkthrough) becomes the fourth practice tab
    var tabRow = $(".lv-tabs", lesson), buildBox = $(".code-text", lesson);
    if (tabRow && buildBox && !$('.lv[data-lv="5"]', lesson)) {
      var lv5 = el("div", "lv"); lv5.dataset.lv = "5"; lv5.hidden = true;
      var lead = buildBox.previousElementSibling;
      lv5.appendChild(el("p", null, "Read the full solution, or tap Build it to see how I would write and explain it in an interview, one piece at a time."));
      if (lead && lead.tagName === "P" && /Build it/.test(lead.textContent)) lead.remove();
      lv5.appendChild(buildBox);
      var lastLv = $$(".lv", lesson).pop();
      lastLv.parentNode.insertBefore(lv5, lastLv.nextSibling);
      var t5 = el("button", null, "Build it"); t5.type = "button"; t5.dataset.lv = "5";
      tabRow.appendChild(t5);
    }
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
        var lineNo = 1;
        box._gaps = [];
        var whole = blanks.map(function (b, i) {
          var pad = new Array(+b.dataset.indent + 1).join(" ");
          var given = cfg.before[i] || "";
          lineNo += given.split("\n").length - 1;
          var mine = dedent($("textarea", b).value).map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
          var n = mine.split("\n").length - 1;
          box._gaps.push([lineNo, lineNo + n - 1]);
          lineNo += n;
          return given + mine;
        }).join("") + (cfg.after || "");
        return whole;
      });
      logRow(box);
    });

    $$('.lv[data-lv="3"], .lv[data-lv="4"]', lesson).forEach(function (box) {
      var blank = box.dataset.lv === "4";
      var own = JSON.parse(JSON.stringify(cfg)); own.start = blank ? bareStart(cfg.start) : cfg.start;
      (function (cfg) {
      var ta = $(".ed", box), KEY = "lsn-" + lesson.dataset.lesson + (blank ? "-blank-v1" : "-editor-v1");
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
        if (cb) cb.textContent = "Answer";
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
        var cmpBtn = el("button", "lbtn ghost ed-cmp", "Answer");
        cmpBtn.type = "button";
        $(".run", box).insertBefore(cmpBtn, $(".run-status", box));
        var cmpOut = el("div", "cmp-out");
        $(".run-out", box).after(cmpOut);
        var asked = false;
        cmpBtn.addEventListener("click", function () {
          if (cmpOut.firstChild) { cmpOut.textContent = ""; cmpBtn.textContent = "Answer"; return; }
          if (ta.value.trim() === cfg.start.trim() && !asked) {
            asked = true;
            cmpOut.appendChild(el("p", "ro-hint", "Try writing something first. A wrong guess teaches more than reading the answer. Press the button again to see it anyway."));
            return;
          }
          var c = comparePanel(ta.value, answer);
          cmpOut.appendChild(c.box);
          cmpBtn.textContent = "Hide answer";
          addLog({ kind: "answer", problem: problemName(lesson), mode: modeName(box), code: ta.value.replace(/\s+$/, ""), missing: c.missing, extra: c.extra });
        });
      }
      logRow(box);
      })(own);
    });

    var keys = (cfg.keys || []).concat([["return", "return "], ["for", "for "], ["in", "in "], ["if", "if "]]);
    var seen = {};
    keys = keys.filter(function (k) { if (seen[k[0]]) return false; seen[k[0]] = 1; return true; });
    if (window.CodeKeys) $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, keys); });
  });
})();

/* One calm button row under each editor: Run the tests, See the answer, and a More menu (⋯).
   The rarely used buttons (Start over, Copy, Copy my practice log) move into the menu, so the
   row has at most three buttons of the same height. The original buttons stay in the page,
   hidden, and the menu items just press them, so everything they do keeps working. */
(function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function tidy() {
    document.querySelectorAll(".lsn .lv").forEach(function (lv) {
      var run = lv.querySelector(".run");
      if (!run || run.querySelector(".more-btn")) return;
      var items = [];
      var reset = run.querySelector(".ed-reset"), copy = run.querySelector(".cp-txt"), log = lv.querySelector(".log-copy");
      if (reset) items.push([reset, "Start over"]);
      if (copy) items.push([copy, "Copy my code"]);
      if (log) items.push([log, "Copy my practice log"]);
      if (!items.length) return;
      var wrap = el("div", "more"), btn = el("button", "lbtn ghost more-btn", "⋯"), menu = el("div", "more-menu");
      btn.type = "button"; btn.setAttribute("aria-label", "More"); btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      items.forEach(function (it) {
        it[0].classList.add("in-more");
        var b = el("button", "more-item", it[1]); b.type = "button";
        if (it[0] === log) {
          var n = lv.querySelector(".log-n");
          if (n) { var s = el("span", "more-sub"); b.appendChild(s); b._n = function () { s.textContent = n.textContent; }; }
          var row = lv.querySelector(".log-row"); if (row) row.classList.add("in-more");
        }
        b.addEventListener("click", function () { close(); it[0].click(); });
        menu.appendChild(b);
      });
      function close() { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var open = menu.hidden;
        document.querySelectorAll(".more-menu").forEach(function (m) { m.hidden = true; });
        if (open) { menu.querySelectorAll(".more-item").forEach(function (b) { if (b._n) b._n(); }); menu.hidden = false; btn.setAttribute("aria-expanded", "true");
          // keep the menu inside the screen: slide it right just enough when the left side has no room
          menu.style.left = menu.style.right = "";
          var gap = menu.getBoundingClientRect().left - 8;
          if (gap < 0) menu.style.right = gap + "px"; }
        else close();
      });
      document.addEventListener("click", function (ev) { if (!wrap.contains(ev.target)) close(); });
      wrap.appendChild(btn); wrap.appendChild(menu);
      var status = run.querySelector(".run-status");
      run.insertBefore(wrap, status);
    });
  }
  if (document.readyState === "complete") setTimeout(tidy, 0);
  else window.addEventListener("load", function () { setTimeout(tidy, 0); });
})();
