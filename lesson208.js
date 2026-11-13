/* The interactive parts of the Implement Trie lesson (class "lsn", data-lesson="208"):
   the questions, the walkthrough card, and the practice editor that runs real Python tests. */
(function () {
  var lesson = document.querySelector('.lsn[data-lesson="208"]');
  if (!lesson) return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  // `name` in a caption shows as code
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }

  /* 1. Questions outside the stages: questions next to each other share one spot */
  $$(".mcq", lesson).forEach(function (q) {
    if (q.closest(".stages")) return;
    var prev = q.previousElementSibling;
    if (prev && prev.classList.contains("mcq")) return;
    var run = [q], n = q.nextElementSibling;
    while (n && n.classList.contains("mcq")) { run.push(n); n = n.nextElementSibling; }
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

  /* The stages that grow search and startsWith: light up the lines each stage adds */
  $$(".grow", lesson).forEach(function (g) {
    var want = [];
    g.dataset["new"].split(",").forEach(function (part) {
      var ab = part.split("-"), a = +ab[0], b = +(ab[1] || ab[0]);
      for (var i = a; i <= b; i++) want.push(i);
    });
    $$(".snl", g).forEach(function (l, i) { l.classList.toggle("new", want.indexOf(i + 1) >= 0); });
  });

  /* 2. The walkthrough card: the tag for node moves through the trie, with an idea tab and a code tab.
     Code lines (0-based): 1 node = self.root, 2 for, 3 if not in node, 4 create or return False,
     5 node = node[letter], 6 the last line. */
  var RUNS = {
    insert: { label: "insert", title: 'insert("cat")', code: "insert", fresh: true, steps: [
      { node: "", lines: [1], idea: "The trie has car and cart, and we insert cat. The tag for `node` starts at the root.",
        code: "The line `node = self.root` puts `node` at the root." },
      { node: "c", lines: [2, 3, 5], idea: "The root has a c child. We move down to the c node without creating a child.",
        code: "The letter c is in `node`. We skip the create line and move down." },
      { node: "ca", lines: [2, 3, 5], idea: "The c node has an a child. We move down to the a node.",
        code: "The letter a is in `node`. We move down again." },
      { node: "ca", made: true, lines: [2, 3, 4], idea: "The a node has an r child but no t child. We create an empty t node.",
        code: "The letter t is not in `node`. The line `node['t'] = {}` creates the t node." },
      { node: "cat", made: true, lines: [5], idea: "We move down to the new t node.",
        code: "The line `node = node[letter]` moves down to the new t node." },
      { node: "cat", made: true, end: true, lines: [6], idea: "No letters are left. We put '$' in the t node, so cat is now a saved word.",
        code: "The loop is done. The line `node['$'] = True` marks the end of cat." }
    ] },
    search: { label: "search", title: 'search("ca")', code: "search", steps: [
      { node: "", lines: [1], idea: "We search for ca. The tag starts at the root.",
        code: "The line `node = self.root` puts `node` at the root." },
      { node: "c", lines: [2, 3, 5], idea: "The root has a c child. We move down to the c node.",
        code: "The letter c is in `node`, so we move down." },
      { node: "ca", lines: [2, 3, 5], idea: "The c node has an a child. We move down to the a node.",
        code: "The letter a is in `node`, so we move down." },
      { node: "ca", lines: [6], result: false, idea: "No letters are left, but the a node has no '$'. The word ca is not a saved word, so the answer is False.",
        code: "The loop is done. The line `return '$' in node` returns False." }
    ] },
    startsWith: { label: "startsWith", title: 'startsWith("ca")', code: "startsWith", steps: [
      { node: "", lines: [1], idea: "We check whether a saved word starts with ca. The tag starts at the root.",
        code: "The line `node = self.root` puts `node` at the root." },
      { node: "c", lines: [2, 3, 5], idea: "The root has a c child. We move down to the c node.",
        code: "The letter c is in `node`, so we move down." },
      { node: "ca", lines: [2, 3, 5], idea: "The c node has an a child. We move down to the a node.",
        code: "The letter a is in `node`, so we move down." },
      { node: "ca", lines: [6], result: true, idea: "Every letter was found, and car and cat start with ca. The answer is True without checking for '$'.",
        code: "The loop is done, so the line `return True` runs." }
    ] },
    cow: { label: "search cow", title: 'search("cow")', code: "search", steps: [
      { node: "", lines: [1], idea: "We search for cow. The tag starts at the root.",
        code: "The line `node = self.root` puts `node` at the root." },
      { node: "c", lines: [2, 3, 5], idea: "The root has a c child. We move down to the c node.",
        code: "The letter c is in `node`, so we move down." },
      { node: "c", ghost: true, lines: [2, 3, 4], result: false, idea: "The c node has an a child but no o child. No saved word matches, so the answer is False.",
        code: "The letter o is not in `node`, so `return False` runs." }
    ] }
  };
  var ORDER = ["insert", "search", "startsWith", "cow"];
  // where each trie node sits in the drawing; "co" is the missing o child
  // The tree grows left to right, so it fits the width of a phone and leaves room for the code.
  var POS = { "": [34, 100], c: [96, 100], ca: [158, 100], car: [220, 62], cart: [282, 62], cat: [220, 140], co: [158, 158] };
  var ENDS = ["car", "cart", "cat"];
  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  $$('.viz[data-mode="trie"]', lesson).forEach(function (box) {
    var codeWrap = $(".viz-code", box), codes = {};
    $$("[data-run]", codeWrap).forEach(function (d) { codes[d.dataset.run] = d; });
    box.classList.add("pro", "brd", "trc");
    var head = el("div", "vz-head"), titles = el("div", "vz-titles");
    titles.appendChild(el("span", "vz-eyebrow", "Watch node move"));
    var title = el("span", "vz-title", "");
    titles.appendChild(title);
    head.appendChild(titles);
    var picks = el("div", "vz-seg tr-picks");

    var tabs = el("div", "l3-tabs bt-tabs");
    var mode = 0;
    var tabBtns = ["1. The idea", "2. The code"].map(function (t, i) {
      var b = el("button", i ? "" : "on", t);
      b.type = "button";
      b.addEventListener("click", function () { mode = i; tabBtns.forEach(function (x, k) { x.classList.toggle("on", k === i); }); show(); });
      tabs.appendChild(b);
      return b;
    });

    var stage = el("div", "vz-stage");
    var tree = svg("svg", { viewBox: "6 14 306 170", class: "bt-tree", role: "img",
      "aria-label": "The trie with car, cart and cat. The root has a c child, c has an a child, and a has r and t children. The r node has '$' and a t child." });
    var edges = {}, nodes = {};
    Object.keys(POS).forEach(function (id) {
      if (!id) return;
      var a = POS[id.slice(0, -1)], b = POS[id];
      edges[id] = svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: "bt-e" + (id === "co" ? " ghost" : "") }, tree);
    });
    Object.keys(POS).forEach(function (id) {
      var p = POS[id], g = svg("g", { class: "bt-n" + (id ? "" : " root") + (id === "co" ? " ghost" : "") }, tree);
      svg("circle", { cx: p[0], cy: p[1], r: id ? 18 : 22 }, g);
      var t = svg("text", { x: p[0], y: p[1] + 5 }, g);
      t.textContent = id ? id.slice(-1) : "root";
      if (ENDS.indexOf(id) >= 0) {
        var e = svg("g", { class: "bt-end" }, g);
        svg("circle", { cx: p[0] + 15, cy: p[1] + 14, r: 8 }, e);
        var et = svg("text", { x: p[0] + 15, y: p[1] + 18 }, e);
        et.textContent = "$";
      }
      nodes[id] = g;
    });
    var tagG = svg("g", { class: "bt-tag" }, tree);
    svg("rect", { x: -22, y: -10, width: 44, height: 19, rx: 9 }, tagG);
    var tagT = svg("text", { x: 0, y: 4 }, tagG);
    tagT.textContent = "node";
    var res = el("p", "bd-found");
    stage.appendChild(tree); stage.appendChild(res);

    var body = el("div", "vz-body");
    body.appendChild(stage);
    codeWrap.classList.add("vz-code"); body.appendChild(codeWrap);
    var foot = el("div", "vz-foot"), bar = el("span", "vz-bar"), barFill = el("i");
    bar.appendChild(barFill);
    var capText = el("p", "vz-cap"); capText.setAttribute("aria-live", "polite");
    var ctrl = el("div", "vz-ctrl");
    var back = el("button", "vz-btn", "Back"), next = el("button", "vz-btn primary", "Next"), count = el("span", "vz-n");
    back.type = next.type = "button";
    ctrl.appendChild(back); ctrl.appendChild(count); ctrl.appendChild(next);
    foot.appendChild(bar); foot.appendChild(capText); foot.appendChild(ctrl);
    box.textContent = "";
    box.appendChild(head); box.appendChild(picks); box.appendChild(tabs); box.appendChild(body); box.appendChild(foot);

    var run = null, at = 0;
    function show() {
      var s = run.steps[at];
      box.classList.toggle("bt-idea", mode === 0);
      count.textContent = (at + 1) + " / " + run.steps.length;
      barFill.style.width = ((at + 1) / run.steps.length * 100) + "%";
      Object.keys(nodes).forEach(function (id) {
        var hide = (id === "cat" && run.fresh && !s.made) || (id === "co" && !s.ghost);
        nodes[id].style.display = hide ? "none" : "";
        if (edges[id]) edges[id].style.display = hide ? "none" : "";
        nodes[id].classList.toggle("cur", id === s.node);
        nodes[id].classList.toggle("lit", !!id && id !== s.node && s.node.indexOf(id) === 0);
        nodes[id].classList.toggle("new", id === "cat" && !!run.fresh && !!s.made);
        if (edges[id]) edges[id].classList.toggle("lit", !!id && s.node.indexOf(id) === 0);
        var end = $(".bt-end", nodes[id]);
        if (end) end.style.display = id === "cat" && run.fresh && !s.end ? "none" : "";
      });
      var tp = POS[s.node];
      tagG.setAttribute("transform", "translate(" + tp[0] + "," + (tp[1] - (s.node ? 32 : 36)) + ")");
      res.hidden = s.result === undefined;
      if (s.result !== undefined) {
        res.textContent = run.title + " returns " + (s.result ? "True" : "False");
        res.classList.toggle("on", s.result);
        res.classList.toggle("no", !s.result);
      }
      Object.keys(codes).forEach(function (k) { codes[k].hidden = k !== run.code; });
      $$(".snl", codes[run.code]).forEach(function (l, i) { l.classList.toggle("ptr", s.lines.indexOf(i) >= 0); });
      capText.innerHTML = rich(mode === 0 ? s.idea : s.code);
      back.disabled = at === 0;
      next.textContent = at === run.steps.length - 1 ? "Start over" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === run.steps.length - 1 ? 0 : at + 1; show(); });
    ORDER.forEach(function (k) {
      var b = el("button", "pick", RUNS[k].label);
      b.type = "button";
      b.dataset.run = k;
      b.addEventListener("click", function () { go(k); });
      picks.appendChild(b);
    });
    function go(k) {
      run = RUNS[k]; at = 0;
      $$(".pick", picks).forEach(function (b) { b.classList.toggle("on", b.dataset.run === k); });
      title.textContent = run.title;
      show();
    }
    go("insert");
  });

  /* 3. Practice: run real Python in the browser */
  var TESTS = [
    { ops: [["insert", "apple"], ["search", "apple"], ["search", "app"], ["startsWith", "app"], ["insert", "app"], ["search", "app"]],
      exp: [null, true, false, true, null, true] },
    { ops: [["insert", "car"], ["insert", "cart"], ["insert", "cat"], ["search", "car"], ["search", "ca"], ["search", "cart"], ["search", "cat"], ["search", "cow"], ["startsWith", "ca"], ["startsWith", "cab"], ["startsWith", "cart"]],
      exp: [null, null, null, true, false, true, true, false, true, false, true] },
    { ops: [["search", "a"], ["startsWith", "a"]], exp: [false, false] },
    { ops: [["insert", "cart"], ["search", "car"], ["insert", "car"], ["search", "car"], ["search", "cart"]],
      exp: [null, false, null, true, true] },
    { ops: [["insert", "a"], ["insert", "a"], ["search", "a"], ["startsWith", "a"]], exp: [null, null, true, true] },
    { ops: [["insert", "dog"], ["insert", "do"], ["search", "d"], ["startsWith", "d"], ["search", "do"], ["search", "dot"], ["startsWith", "dog"], ["startsWith", "dogs"]],
      exp: [null, null, false, true, true, false, true, false] }
  ].map(function (t, i) { t.id = i; return t; });
  var HARNESS = [
    "import json, traceback",
    "def _run():",
    "    tests = json.loads(TESTS)",
    "    ns = {'__name__': 'user'}",
    "    try:",
    "        exec(compile(SRC, 'your code', 'exec'), ns)",
    "    except SyntaxError as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e.msg), 'line': e.lineno, 'kind': type(e).__name__}",
    "    except Exception as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e), 'kind': type(e).__name__}",
    "    T = ns.get('Trie')",
    "    if T is None or not all(hasattr(T, m) for m in ('insert', 'search', 'startsWith')):",
    "        return {'load': 'There is no class named Trie with insert, search and startsWith.', 'kind': 'NoClass'}",
    "    out = []",
    "    for t in tests:",
    "        r = {'id': t['id'], 'ok': True}",
    "        k = 0",
    "        try:",
    "            obj = T()",
    "            for k, (op, arg) in enumerate(t['ops']):",
    "                got = getattr(obj, op)(arg)",
    "                want = t['exp'][k]",
    "                if want is not None and got is not want:",
    "                    r.update({'ok': False, 'step': k, 'got': repr(got)})",
    "                    break",
    "        except Exception as e:",
    "            tb = traceback.extract_tb(e.__traceback__)",
    "            mine = [f.lineno for f in tb if f.filename == 'your code']",
    "            r.update({'ok': False, 'step': k, 'err': type(e).__name__ + ': ' + str(e), 'kind': type(e).__name__, 'line': mine[-1] if mine else None})",
    "        out.append(r)",
    "    return {'tests': out}",
    "json.dumps(_run())"
  ].join("\n");
  var HINT = {
    syntax: "Python could not read your code{at}. Make sure every def, for and if line ends with a colon, and that each method has at least one line inside it.",
    noclass: "The tests need a class named Trie with the methods insert, search and startsWith. Check the names carefully, including the capital W.",
    load: "Your code stopped before the tests began. Read the error above and check the line it names.",
    key: "Your code tried to read a missing key. Before using node[letter], check that letter is in node.",
    attr: "Your code used something that does not exist. Make sure __init__ sets self.root = {} and every method starts with node = self.root.",
    none: "One of your methods returned None. Make sure search and startsWith end with a return line on every path.",
    prefixword: "The method search returned True for letters that were never saved as a word, like ca. After the loop, return whether '$' is in node.",
    erased: "Some saved words disappeared. In insert, create a child only when the letter is not in node. Otherwise you replace it and erase the words below it.",
    noend: "The method search returned False for a saved word. Make sure insert puts '$' in the last node with node['$'] = True.",
    swcheck: "The method startsWith returned False even though a saved word starts with those letters. A prefix does not need '$'. If every letter is found, return True.",
    swmissing: "The method startsWith returned True even though a letter was missing. Return False as soon as a letter is not in node.",
    other: "Some answers are wrong. Compare your three methods with the walk: start at the root, then check, move and finish."
  };
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function hintFor(res) {
    if (res.load) {
      if (/SyntaxError|IndentationError|TabError/.test(res.kind)) return fill(HINT.syntax, { at: res.line ? " at line " + res.line : "" });
      if (res.kind === "NoClass") return HINT.noclass;
      return HINT.load;
    }
    var fails = res.tests.filter(function (r) { return !r.ok; });
    function any(fn) { return fails.some(fn); }
    function op(r) { return TESTS[r.id].ops[r.step]; }
    function want(r) { return TESTS[r.id].exp[r.step]; }
    if (any(function (r) { return r.kind === "KeyError"; })) return HINT.key;
    if (any(function (r) { return r.kind === "AttributeError" || r.kind === "NameError" || r.kind === "TypeError"; })) return HINT.attr;
    if (any(function (r) { return !r.err && r.got === "None"; })) return HINT.none;
    if (any(function (r) { return !r.err && op(r)[0] === "search" && want(r) === false && r.got === "True"; })) return HINT.prefixword;
    if (any(function (r) { return !r.err && op(r)[0] === "startsWith" && want(r) === false && r.got === "True"; })) return HINT.swmissing;
    if (any(function (r) { return !r.err && r.id === 3 && r.step === 4; })) return HINT.erased;
    if (any(function (r) { return !r.err && op(r)[0] === "startsWith" && want(r) === true; })) return HINT.swcheck;
    if (any(function (r) { return !r.err && op(r)[0] === "search" && want(r) === true; })) return HINT.noend;
    return HINT.other;
  }
  function testText(t, r) {
    var done = t.ops.slice(0, r.step).filter(function (o) { return o[0] === "insert"; }).map(function (o) { return "'" + o[1] + "'"; });
    var o = t.ops[r.step];
    var call = (done.length ? "After inserting " + done.join(", ") + ", " : "With an empty trie, ") + o[0] + "('" + o[1] + "')";
    if (r.err) return call + " crashed with " + r.err + (r.line ? " on line " + r.line + "." : ".");
    return call + " should return " + (t.exp[r.step] ? "True" : "False") + ", but your code returned " + r.got + ".";
  }

  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var worker = null, ready = null;
  function startWorker() {
    var src = "importScripts('" + PYODIDE + "pyodide.js');" +
      "var py = loadPyodide({indexURL: '" + PYODIDE + "'}).then(function (p) { postMessage({ready: true}); return p; }," +
      " function (e) { postMessage({fail: String(e)}); });" +
      "onmessage = function (e) { py.then(function (p) { try { p.globals.set('SRC', e.data.src); p.globals.set('TESTS', e.data.tests);" +
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
  function runPython(code, status) {
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
        worker.postMessage({ src: code, tests: JSON.stringify(TESTS), harness: HARNESS });
      });
    });
  }
  function showResult(out, res) {
    out.textContent = "";
    if (res.load) {
      out.appendChild(el("p", "ro-bad", "Your code didn't run. " + res.load + (res.line ? " (line " + res.line + ")" : "")));
      out.appendChild(el("p", "ro-hint", hintFor(res)));
      return;
    }
    var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
    if (pass === all) { out.appendChild(el("p", "ro-good", "All " + all + " tests pass. You wrote the whole solution yourself.")); return; }
    out.appendChild(el("p", "ro-sum", pass + " of " + all + " tests pass."));
    out.appendChild(el("p", "ro-hint", "Here is something to think about. " + hintFor(res)));
    var ul = el("ul", "ro-list");
    res.tests.filter(function (r) { return !r.ok; }).slice(0, 3).forEach(function (r) { ul.appendChild(el("li", null, testText(TESTS[r.id], r))); });
    out.appendChild(ul);
  }
  function wireRun(box, getCode) {
    var btn = $(".run-btn", box), status = $(".run-status", box), out = $(".run-out", box);
    btn.addEventListener("click", function () {
      var code = getCode();
      if (code == null) return;
      btn.disabled = true;
      out.textContent = "";
      runPython(code, status).then(function (res) {
        status.textContent = "";
        showResult(out, res);
      }, function (err) {
        status.textContent = "";
        if (err.message === "slow") {
          out.appendChild(el("p", "ro-bad", "Your code ran for more than 8 seconds, so I stopped it."));
          out.appendChild(el("p", "ro-hint", "Here is something to think about. A loop may never end. Each loop should go through the letters of word or prefix once."));
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

  var tabs = $$(".lv-tabs button", lesson), levels = $$(".lv", lesson);
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.toggle("on", x === t); });
      levels.forEach(function (l) { l.hidden = l.dataset.lv !== t.dataset.lv; });
    });
  });

  // the fixed code that goes before each gap
  var BEFORE = [
    "class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n",
    "\n    def search(self, word):\n",
    "\n    def startsWith(self, prefix):\n"
  ];
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
        msg.textContent = "Here is one answer. Read it, then clear the box and type it again from memory.";
        msg.className = "b-msg";
      });
    });
    wireRun(box, function () {
      if (blanks.some(function (b) { return !$("textarea", b).value.trim(); })) {
        $(".run-status", box).textContent = "Please fill in every gap first, and press Hint if you are stuck.";
        return null;
      }
      return blanks.map(function (b, i) {
        var pad = new Array(+b.dataset.indent + 1).join(" ");
        return BEFORE[i] + dedent($("textarea", b).value).map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
      }).join("");
    });
  });

  $$('.lv[data-lv="3"]', lesson).forEach(function (box) {
    var ta = $(".ed", box), KEY = "lsn-208-editor-v1";
    var START = "class Trie:\n    def __init__(self):\n        # 1. Make an empty root.\n\n    def insert(self, word):\n        # 2. Walk down, create missing.\n\n        # 3. Put '$' at the end.\n\n    def search(self, word):\n        # 4. Walk down, False if missing.\n\n        # 5. Return: is '$' here?\n\n    def startsWith(self, prefix):\n        # 6. Same walk, then True.\n\n";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
    ta.value = saved || START;
    codeKeys(ta);
    ta.addEventListener("input", function () { try { localStorage.setItem(KEY, ta.value); } catch (e) { /* storage may be blocked */ } });
    $(".ed-reset", box).addEventListener("click", function () {
      ta.value = START;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      $(".run-out", box).textContent = "";
    });
    wireRun(box, function () { return ta.value; });
  });

  var WORDS_KEYS = [["if", "if "], ["not in", "not in "], ["return", "return "], ["node"], ["letter"], ["word"],
                    ["self.root"], ["'$'"], ["True"], ["False"], ["for", "for "], ["in", "in "]];
  $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, WORDS_KEYS); });
})();
