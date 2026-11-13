/* The interactive parts of the Word Search II lesson (class "lsn", data-lesson="212"):
   the walkthrough card, and the practice editor that runs real Python tests. */
(function () {
  var lesson = document.querySelector('.lsn[data-lesson="212"]');
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
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }

  /* 1. The walkthrough card: the board and the trie move together, with an idea tab and a code tab */
  var BOARD = [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]];
  var WORDS = ["oath", "pea", "eat", "rain"];
  // code lines in the card (0-based): 3 letter =, 4 if not in node, 5 return, 6 node = node[letter],
  // 7 if '$', 8 append, 9 del, 10 mark '#', 11-14 the four calls, 15 restore
  var SUM_IDEA = "Each call does four jobs. Stop if the cell is off the board or its letter is not a child. Step into the child. Save the word if '$' is there. Mark the cell, try the four neighbors, and put the letter back.";
  var SUM_CODE = "These four jobs are the whole `dfs` function, from top to bottom. Write it in this order.";
  var RUNS = {
    oath: [
      { cur: [0, 0], path: [], node: "", n: 0, lines: [0],
        idea: "The search starts at the o cell. In the trie, `node` starts at the root.",
        code: "The loops call `dfs` on the o cell, with `node` set to the root." },
      { cur: [0, 0], path: [[0, 0]], node: "o", n: 1, lines: [3, 4, 6],
        idea: "The root has an o child, so we move to the o node. The board and the trie move together.",
        code: "The letter is o. The root has an o child, so `node` becomes the o node." },
      { cur: [0, 0], path: [[0, 0]], hash: true, node: "o", n: 1, lines: [10, 11, 13], marks: [[1, 0, "no"], [0, 1, "ok"]],
        idea: "Check the cells beside o. The o node has an a child but no e child, so only the a on the right can continue.",
        code: "Put '#' in the o cell and call `dfs` on each neighbor. The e call stops at the check, but the a call continues." },
      { cur: [0, 1], path: [[0, 0], [0, 1]], hash: 1, node: "oa", n: 2, lines: [3, 4, 6],
        idea: "Move to the a cell and the a node.",
        code: "The o node has an a child, so `node` becomes the a node." },
      { cur: [0, 1], path: [[0, 0], [0, 1]], hash: true, node: "oa", n: 2, lines: [10, 11, 13, 14], marks: [[1, 1, "ok"], [0, 2, "no"], [0, 0, "used"]],
        idea: "The a node has only a t child, and t is below. The o cell holds '#', so it cannot be used again.",
        code: "Put '#' in the a cell and call `dfs` on each neighbor. Only the t call continues." },
      { cur: [1, 1], path: [[0, 0], [0, 1], [1, 1]], hash: 2, node: "oat", n: 3, lines: [3, 4, 6],
        idea: "Move to the t cell and the t node.",
        code: "The a node has a t child, so `node` becomes the t node." },
      { cur: [1, 1], path: [[0, 0], [0, 1], [1, 1]], hash: true, node: "oat", n: 3, lines: [10, 11, 12, 13, 14], marks: [[2, 1, "ok"], [1, 0, "no"], [1, 2, "no"], [0, 1, "used"]],
        idea: "The t node has only an h child, and h is right below.",
        code: "Put '#' in the t cell and call `dfs` on each neighbor. Only the h call continues." },
      { cur: [2, 1], path: [[0, 0], [0, 1], [1, 1], [2, 1]], hash: 3, node: "oath", n: 4, lines: [6, 7, 8, 9], found: ["oath"],
        idea: "The h node has '$', so the path from the root spelled oath. Add oath to found. We never compare whole words.",
        code: "'$' is in `node`, so add `node['$']` to `found` and delete '$'." },
      { cur: null, path: [], node: "", n: 4, lines: [15], found: ["oath"], back: true,
        idea: "The h node has no children, so the calls end one by one. On the way back, each cell gets its letter back.",
        code: "Each call ends with `board[r][c] = letter`, so the cells get their letters back." }
    ],
    eat: [
      { cur: [1, 3], path: [], node: "", n: 0, lines: [0],
        idea: "The search for eat starts at the e cell on the right. In the trie, `node` starts at the root.",
        code: "The loops call `dfs` on this e cell, with `node` set to the root." },
      { cur: [1, 3], path: [[1, 3]], node: "e", n: 1, lines: [3, 4, 6],
        idea: "The root has an e child, so we move to the e node.",
        code: "The letter is e. The root has an e child, so `node` becomes the e node." },
      { cur: [1, 3], path: [[1, 3]], hash: true, node: "e", n: 1, lines: [10, 11, 12, 14], marks: [[2, 3, "no"], [0, 3, "no"], [1, 2, "ok"]],
        idea: "The e node has only an a child. The r below and the n above do not match. The a on the left does.",
        code: "Put '#' in the e cell and call `dfs` on each neighbor. Only the a call continues." },
      { cur: [1, 2], path: [[1, 3], [1, 2]], hash: 1, node: "ea", n: 2, lines: [3, 4, 6],
        idea: "Move to the a cell and the a node.",
        code: "The e node has an a child, so `node` becomes the a node." },
      { cur: [1, 2], path: [[1, 3], [1, 2]], hash: true, node: "ea", n: 2, lines: [10, 11, 12, 13, 14], marks: [[2, 2, "no"], [0, 2, "no"], [1, 3, "used"], [1, 1, "ok"]],
        idea: "The a node has only a t child, and the t on the left matches. The e cell holds '#', so it cannot be used again.",
        code: "Put '#' in the a cell and call `dfs` on each neighbor. Only the t call continues." },
      { cur: [1, 1], path: [[1, 3], [1, 2], [1, 1]], hash: 2, node: "eat", n: 3, lines: [6, 7, 8, 9], found: ["eat"],
        idea: "Move to t. The t node has '$', so the path spelled eat. Add eat to found.",
        code: "The t node has '$', so add `node['$']` to `found` and delete '$'." },
      { cur: null, path: [], node: "", n: 3, lines: [15], found: ["eat"], back: true,
        idea: "The t node has no children, so the calls end, and each cell gets its letter back.",
        code: "Each call ends with `board[r][c] = letter`." }
    ]
  };
  var ALL = { cur: null, path: [], node: "", n: -1, lines: [3, 4, 5], starts: true,
    idea: "The loops try every cell like this. Most cells stop right away, because the root has no child for their letter. Only o, e and r can start a word here.",
    code: "At most cells, `letter not in node` is true at the root, so `dfs` returns at once." };
  var SUM = { cur: null, path: [], node: "", n: -1, lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], sum: true, idea: SUM_IDEA, code: SUM_CODE };

  // where each trie node sits in the drawing
  var COLX = { o: 30, p: 90, e: 150, r: 210 }, ROWY = [50, 104, 154, 204, 254];
  var POS = { "": [120, ROWY[0]] };
  WORDS.forEach(function (w) { for (var i = 1; i <= w.length; i++) POS[w.slice(0, i)] = [COLX[w[0]], ROWY[i]]; });
  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  $$('.viz[data-mode="board"]', lesson).forEach(function (box) {
    var codePre = $("pre.snip", box), codeWrap = $(".viz-code", box);
    var lines = $$(".snl", codePre);
    box.classList.add("pro", "brd");
    var head = el("div", "vz-head"), titles = el("div", "vz-titles");
    titles.appendChild(el("span", "vz-eyebrow", "Watch dfs"));
    var title = el("span", "vz-title", "");
    titles.appendChild(title);
    var top = el("div", "viz-top"), picks = el("div", "vz-seg");
    top.appendChild(picks);
    head.appendChild(titles); head.appendChild(top);

    var tabs = el("div", "l3-tabs bt-tabs");
    var tabBtns = ["1. The idea", "2. The code"].map(function (t, i) {
      var b = el("button", i ? "" : "on", t);
      b.type = "button";
      b.addEventListener("click", function () { mode = i; tabBtns.forEach(function (x, k) { x.classList.toggle("on", k === i); }); show(); });
      tabs.appendChild(b);
      return b;
    });

    var stage = el("div", "vz-stage");
    var strip = el("div", "bt-strip");
    var stripWrap = el("div", "bt-stripw");
    stripWrap.appendChild(el("span", "bt-sl", "Path spells"));
    stripWrap.appendChild(strip);
    var grid = el("div", "bd-grid");
    var cells = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { var d = el("div", "bd-c"); grid.appendChild(d); cells.push(d); }

    var tree = svg("svg", { viewBox: "0 0 240 280", class: "bt-tree", role: "img",
      "aria-label": "The trie as a tree. The root has four branches: o, a, t, h for oath; p, e, a for pea; e, a, t for eat; and r, a, i, n for rain." });
    var edges = {}, nodes = {};
    Object.keys(POS).forEach(function (id) {
      if (!id) return;
      var a = POS[id.slice(0, -1)], b = POS[id];
      edges[id] = svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: "bt-e" }, tree);
    });
    Object.keys(POS).forEach(function (id) {
      var p = POS[id], g = svg("g", { class: "bt-n" + (id ? "" : " root") }, tree);
      svg("circle", { cx: p[0], cy: p[1], r: id ? 17 : 22 }, g);
      var t = svg("text", { x: p[0], y: p[1] + 5 }, g);
      t.textContent = id ? id.slice(-1) : "root";
      if (WORDS.indexOf(id) >= 0) {
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

    var pics = el("div", "bd-pics");
    pics.appendChild(grid); pics.appendChild(tree);
    var foundBox = el("p", "bd-found");
    stage.appendChild(stripWrap); stage.appendChild(pics); stage.appendChild(foundBox);

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
    box.appendChild(head); box.appendChild(tabs); box.appendChild(body); box.appendChild(foot);

    var word = "oath", steps = [], at = 0, mode = 0;
    function show() {
      var s = steps[at];
      box.classList.toggle("bt-idea", mode === 0);
      count.textContent = (at + 1) + " / " + steps.length;
      barFill.style.width = ((at + 1) / steps.length * 100) + "%";
      // the word strip: letters matched so far
      strip.textContent = "";
      word.split("").forEach(function (ch, i) {
        strip.appendChild(el("span", "bt-l" + (i < s.n ? " got" : "") + (i === s.n - 1 && !s.back ? " now" : ""), ch));
      });
      stripWrap.hidden = s.n < 0;
      var marks = s.marks || [];
      cells.forEach(function (d, i) {
        var r = Math.floor(i / 4), c = i % 4;
        var k = s.path.map(function (q) { return q[0] * 4 + q[1]; }).indexOf(i);
        var marked = k >= 0 && (s.hash === true || k < s.hash);
        var m = marks.filter(function (q) { return q[0] === r && q[1] === c; })[0];
        d.textContent = BOARD[r][c];
        if (marked) d.appendChild(el("i", "bd-hashmark", "#"));
        if (m && m[2] !== "used") d.appendChild(el("i", "bt-mk " + m[2], m[2] === "ok" ? "\u2713" : "\u2717"));
        d.classList.toggle("path", k >= 0);
        d.classList.toggle("on", !!s.cur && s.cur[0] === r && s.cur[1] === c);
        d.classList.toggle("ok", !!m && m[2] === "ok");
        d.classList.toggle("no", !!m && m[2] === "no");
        d.classList.toggle("start", !!s.starts && "oper".indexOf(BOARD[r][c]) >= 0);
        d.classList.toggle("dim", !!s.starts && "oper".indexOf(BOARD[r][c]) < 0);
      });
      Object.keys(nodes).forEach(function (id) {
        var on = s.n >= 0 && !s.sum && id === s.node;
        var lit = !!id && s.node.indexOf(id) === 0 && id !== s.node;
        nodes[id].classList.toggle("cur", on);
        nodes[id].classList.toggle("lit", lit);
        nodes[id].classList.toggle("first", !!s.starts && id.length === 1);
        nodes[id].classList.toggle("gone", (s.found || []).indexOf(id) >= 0);
        if (edges[id]) edges[id].classList.toggle("lit", !!id && s.node.indexOf(id) === 0);
      });
      var tp = POS[s.node];
      tagG.style.display = s.n >= 0 && !s.sum ? "" : "none";
      tagG.setAttribute("transform", "translate(" + tp[0] + "," + (tp[1] - (s.node ? 32 : 36)) + ")");
      foundBox.innerHTML = "found = " + esc("[" + (s.found || []).map(function (w) { return "'" + w + "'"; }).join(", ") + "]");
      foundBox.classList.toggle("on", !!(s.found && s.found.length));
      lines.forEach(function (l, i) { l.classList.toggle("ptr", s.lines.indexOf(i) >= 0); });
      capText.innerHTML = rich(mode === 0 ? s.idea : s.code);
      capText.classList.remove("in"); capText.getBoundingClientRect(); capText.classList.add("in");
      back.disabled = at === 0;
      next.textContent = at === steps.length - 1 ? "Start over" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === steps.length - 1 ? 0 : at + 1; show(); });
    ["oath", "eat"].forEach(function (w) {
      var b = el("button", "pick", w);
      b.type = "button";
      b.addEventListener("click", function () { go(w); });
      picks.appendChild(b);
    });
    function go(w) {
      word = w; steps = RUNS[w].concat([ALL, SUM]); at = 0;
      $$(".pick", picks).forEach(function (b) { b.classList.toggle("on", b.textContent === w); });
      title.textContent = "Find " + w;
      show();
    }
    go("oath");
  });

  /* The stages that grow dfs: light up the lines each stage adds */
  $$(".grow", lesson).forEach(function (g) {
    var want = [];
    g.dataset["new"].split(",").forEach(function (part) {
      var ab = part.split("-"), a = +ab[0], b = +(ab[1] || ab[0]);
      for (var i = a; i <= b; i++) want.push(i);
    });
    $$(".snl", g).forEach(function (l, i) { l.classList.toggle("new", want.indexOf(i + 1) >= 0); });
  });

  /* 2. Practice: run real Python in the browser */
  var EX = BOARD.map(function (r) { return r.slice(); });
  var TESTS = [
    { board: EX, words: ["oath", "pea", "eat", "rain"], exp: ["eat", "oath"] },
    { board: [["a", "b"], ["c", "d"]], words: ["abcb"], exp: [] },
    { board: [["a", "b"], ["c", "d"]], words: ["abdc", "ab", "x"], exp: ["ab", "abdc"] },
    { board: [["a", "a"]], words: ["aaa"], exp: [] },
    { board: [["a"]], words: ["a"], exp: ["a"] },
    { board: [["a", "a"]], words: ["a"], exp: ["a"] },
    { board: [["o", "a"], ["h", "t"]], words: ["oat", "oath"], exp: ["oat", "oath"] },
    { board: [["a", "b"]], words: ["c"], exp: [] },
    { board: [["a", "b"], ["a", "a"]], words: ["aba", "baa", "bab", "aaab", "aaa", "aaaa", "aaba"], exp: ["aaa", "aaab", "aaba", "aba", "baa"] }
  ].map(function (t, i) { t.id = i; return t; });
  var HARNESS = [
    "import json, traceback, copy",
    "def _run():",
    "    tests = json.loads(TESTS)",
    "    ns = {'__name__': 'user'}",
    "    try:",
    "        exec(compile(SRC, 'your code', 'exec'), ns)",
    "    except SyntaxError as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e.msg), 'line': e.lineno, 'kind': type(e).__name__}",
    "    except Exception as e:",
    "        return {'load': type(e).__name__ + ': ' + str(e), 'kind': type(e).__name__}",
    "    S = ns.get('Solution')",
    "    if S is None or not hasattr(S, 'findWords'):",
    "        return {'load': 'There is no class named Solution with a findWords method.', 'kind': 'NoClass'}",
    "    out = []",
    "    for t in tests:",
    "        r = {'id': t['id']}",
    "        b = copy.deepcopy(t['board'])",
    "        try:",
    "            got = S().findWords(b, list(t['words']))",
    "            r['got'] = got if isinstance(got, list) else None",
    "            r['restored'] = b == t['board']",
    "            r['ok'] = isinstance(got, list) and sorted(got) == sorted(t['exp']) and r['restored']",
    "        except RecursionError:",
    "            r['err'] = 'RecursionError: the calls never stop'",
    "            r['kind'] = 'RecursionError'",
    "            r['ok'] = False",
    "        except Exception as e:",
    "            tb = traceback.extract_tb(e.__traceback__)",
    "            mine = [f.lineno for f in tb if f.filename == 'your code']",
    "            r['err'] = type(e).__name__ + ': ' + str(e)",
    "            r['kind'] = type(e).__name__",
    "            r['line'] = mine[-1] if mine else None",
    "            r['ok'] = False",
    "        out.append(r)",
    "    return {'tests': out}",
    "json.dumps(_run())"
  ].join("\n");
  var HINT = {
    syntax: "Python could not read your code{at}. Make sure every def, for and if line ends with a colon. Also make sure the lines inside each block have the same indentation.",
    noclass: "The tests need a class named Solution and a method named findWords. Check both names carefully.",
    load: "Your code stopped before the tests began. Read the error above and check the line it names.",
    index: "Your code tried to read a cell outside the board. Before reading board[r][c], check that r and c are inside the board.",
    key: "Your code tried to read a missing key. Before using node[letter], check that letter is in node.",
    recursion: "Your search keeps moving between the same cells. Before trying nearby cells, mark the current cell with '#'.",
    notrestored: "After findWords finished, board still had '#' in it. After trying all four nearby cells, put letter back.",
    duplicate: "Your answer contains the same word more than once. Right after adding the word to found, delete '$' from node.",
    reuse: "Your answer uses the same cell twice in one word. Before trying nearby cells, mark the current cell with '#'.",
    missing: "Your code misses some words. Make sure dfs tries all four nearby cells and moves down with node = node[letter].",
    none: "The findWords method returned None. Make sure it ends with return found."
  };
  function hintFor(res) {
    if (res.load) {
      if (/SyntaxError|IndentationError|TabError/.test(res.kind)) return fill(HINT.syntax, { at: res.line ? " at line " + res.line : "" });
      if (res.kind === "NoClass") return HINT.noclass;
      return HINT.load;
    }
    var fails = res.tests.filter(function (r) { return !r.ok; });
    function any(fn) { return fails.some(fn); }
    if (any(function (r) { return r.kind === "RecursionError"; })) return HINT.recursion;
    if (any(function (r) { return r.kind === "IndexError"; })) return HINT.index;
    if (any(function (r) { return r.kind === "KeyError"; })) return HINT.key;
    if (any(function (r) { return !r.err && r.got === null; })) return HINT.none;
    if (any(function (r) { return r.got && r.got.length !== new Set(r.got).size; })) return HINT.duplicate;
    if (any(function (r) { return r.got && r.got.some(function (w) { return TESTS[r.id].exp.indexOf(w) < 0; }); })) return HINT.reuse;
    if (any(function (r) { return r.restored === false; })) return HINT.notrestored;
    return HINT.missing;
  }
  function testText(t, r) {
    var call = "With board " + JSON.stringify(t.board).replace(/"/g, "'") + " and words " + JSON.stringify(t.words).replace(/"/g, "'") + ", ";
    if (r.err) return call + "your code crashed with " + r.err + (r.line ? " on line " + r.line + "." : ".");
    if (r.got && r.restored === false) return call + "your code left '#' in the board.";
    return call + "the answer should be " + JSON.stringify(t.exp).replace(/"/g, "'") + ", but your code returned " + (r.got ? JSON.stringify(r.got).replace(/"/g, "'") : "None") + ".";
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
          out.appendChild(el("p", "ro-hint", "Here is something to think about. " + HINT.recursion));
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
    var head = "class Solution:\n    def findWords(self, board, words):\n        root = {}\n        for word in words:\n            node = root\n            for letter in word:\n                if letter not in node:\n                    node[letter] = {}\n                node = node[letter]\n            node['$'] = word\n\n        found = []\n        for r in range(len(board)):\n            for c in range(len(board[0])):\n                self.dfs(board, r, c, root, found)\n        return found\n\n    def dfs(self, board, r, c, node, found):\n";
    wireRun(box, function () {
      if (blanks.some(function (b) { return !$("textarea", b).value.trim(); })) {
        $(".run-status", box).textContent = "Please fill in every gap first, and press Hint if you are stuck.";
        return null;
      }
      return head + blanks.map(function (b) {
        var pad = new Array(+b.dataset.indent + 1).join(" ");
        return dedent($("textarea", b).value).map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
      }).join("");
    });
  });

  $$('.lv[data-lv="3"]', lesson).forEach(function (box) {
    var ta = $(".ed", box), KEY = "lsn-212-editor-v2";
    var START = "class Solution:\n    def findWords(self, board, words):\n        # 1. Build the trie with '$'.\n\n        # 2. Call dfs on every cell.\n\n\n    def dfs(self, board, r, c, node, found):\n        # 3. Stop if off the board.\n\n        # 4. Stop if letter not in node.\n\n        # 5. Move down, save word at '$'.\n\n        # 6. Mark '#', try 4 cells, undo.\n\n";
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

  var WORDS_KEYS = [["if", "if "], ["not in", "not in "], ["return"], ["node"], ["letter"], ["board"], ["found"],
                    ["self.dfs(", "self.dfs()", 1], ["'$'"], ["'#'"], ["len(", "len()", 1], ["del", "del "]];
  $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, WORDS_KEYS); });
})();
