/* The interactive parts of the Word Search II lesson (class "lsn", data-lesson="212"):
   the tap-the-path card, and the practice editor that runs real Python tests. */
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

  /* 1. The tap-the-path card: the learner taps the cells that dfs visits */
  var BOARD = [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]];
  var WORDS = ["oath", "pea", "eat", "rain"];
  var PATHS = { oath: [[0, 0], [0, 1], [1, 1], [2, 1]], eat: [[1, 3], [1, 2], [1, 1]] };
  var MSG = {
    ASK_START: "Tap the cell where {word} starts. We will follow only {word}.",
    START_NONE: "{cell} has {x}. The root has no {x} child, so the call ends.",
    START_OTHER: "{cell} has {x}. The root has {an} {x} child, but {word} starts with {w0}.",
    GOOD: "{cell} has {x}. {Node} has {an} {x} child, so `node` moves to the {x} node.",
    ASK_NEXT: "Tap a cell up, down, left or right of {cur}.",
    NOT_NEAR: "{cell} is not next to {cur}. The dfs call only moves up, down, left or right.",
    HASH: "{cell} has '#' because this path already uses it. No node has a '#' child, so the call ends.",
    NO_CHILD: "{cell} has {x}. The {letter} node has no {x} child, so the call ends.",
    OTHER: "{cell} has {x}. The {letter} node has {an} {x} child, but we are following {word}.",
    FOUND: "The {letter} node has '$', so the path spells {word}. Add {word} to `found`, delete '$', and press Go back.",
    BACK: "Put {x} back in {cell}. This call ends, and we return to {prev}.",
    BACK_LAST: "Put {x} back in {cell}. The first call ends, and `found` is {found}."
  };
  // the dfs code in the card, one entry per line, so a message can light up its lines
  var L = { letter: 3, check: 4, ret: 5, move: 6, has: 7, add: 8, del: 9, mark: 10, restore: 15 };
  function cell(r, c) { return "(" + r + ", " + c + ")"; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function an(x) { return "aefhilmnorsx".indexOf(x) >= 0 ? "an" : "a"; }
  function nodeName(p) { return p ? "the " + p.slice(-1) + " node" : "the root"; }
  function list(a) { return "[" + a.map(function (w) { return "'" + w + "'"; }).join(", ") + "]"; }
  function child(p, x) { return WORDS.some(function (w) { return w.indexOf(p + x) === 0; }); }

  $$('.viz[data-mode="board"]', lesson).forEach(function (box) {
    var codePre = $("pre.snip", box), codeWrap = $(".viz-code", box);
    var lines = $$(".snl", codePre);
    box.classList.add("pro", "brd");
    var head = el("div", "vz-head"), titles = el("div", "vz-titles");
    titles.appendChild(el("span", "vz-eyebrow", "Walk the path"));
    var title = el("span", "vz-title", "");
    titles.appendChild(title);
    var top = el("div", "viz-top"), picks = el("div", "vz-seg");
    top.appendChild(picks);
    head.appendChild(titles); head.appendChild(top);

    var stage = el("div", "vz-stage");
    var grid = el("div", "bd-grid");
    var cells = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var d = el("button", "bd-c");
      d.type = "button";
      d.addEventListener("click", tap.bind(null, r, c));
      grid.appendChild(d); cells.push(d);
    }
    var trie = el("div", "bd-trie");
    var rootChip = el("span", "bd-n root", "root");
    var rootRow = el("div", "bd-row"); rootRow.appendChild(rootChip); trie.appendChild(rootRow);
    var chips = { "": rootChip }, ends = {};
    WORDS.forEach(function (w) {
      var row = el("div", "bd-row");
      for (var i = 1; i <= w.length; i++) {
        var n = el("span", "bd-n", w.charAt(i - 1));
        chips[w.slice(0, i)] = n; row.appendChild(n);
      }
      var e = el("span", "bd-end", "'$': '" + w + "'");
      ends[w] = e; row.appendChild(e);
      trie.appendChild(row);
    });
    var tag = el("span", "bd-tag", "node");
    var stack = el("div", "bd-stack");
    var foundBox = el("p", "bd-found");
    var pics = el("div", "bd-pics");
    pics.appendChild(grid); pics.appendChild(trie);
    stage.appendChild(pics); stage.appendChild(stack); stage.appendChild(foundBox);

    var body = el("div", "vz-body");
    body.appendChild(stage);
    codeWrap.classList.add("vz-code"); body.appendChild(codeWrap);
    var foot = el("div", "vz-foot");
    var capText = el("p", "vz-cap"); capText.setAttribute("aria-live", "polite");
    var ctrl = el("div", "vz-ctrl");
    var reset = el("button", "vz-btn", "Start over"), next = el("button", "vz-btn primary", "Go back");
    reset.type = next.type = "button";
    ctrl.appendChild(reset); ctrl.appendChild(next);
    foot.appendChild(capText); foot.appendChild(ctrl);
    box.textContent = "";
    box.appendChild(head); box.appendChild(body); box.appendChild(foot);

    var word, path, board, found, phase, flash, msg, lit;
    function prefix() { return path.map(function (p) { return BOARD[p[0]][p[1]]; }).join(""); }
    function say(text, on) { msg = text; lit = on || []; }

    function show() {
      var p = prefix(), last = path[path.length - 1];
      cells.forEach(function (d, i) {
        var r = Math.floor(i / 4), c = i % 4;
        d.textContent = BOARD[r][c];
        if (board[r][c] === "#") d.appendChild(el("i", "bd-hashmark", "#"));
        var onPath = path.some(function (q) { return q[0] === r && q[1] === c; });
        var near = phase === "walk" && last && Math.abs(last[0] - r) + Math.abs(last[1] - c) === 1;
        d.classList.toggle("path", onPath);
        d.classList.toggle("on", !!last && last[0] === r && last[1] === c);
        d.classList.toggle("near", !!near);
        d.classList.toggle("no", !!flash && flash.r === r && flash.c === c && flash.k === "no");
        d.classList.toggle("maybe", !!flash && flash.r === r && flash.c === c && flash.k === "maybe");
      });
      for (var k in chips) {
        chips[k].classList.toggle("on", k === p);
        chips[k].classList.toggle("done", k !== "" && p.indexOf(k) === 0 && k !== p);
      }
      WORDS.forEach(function (w) { ends[w].classList.toggle("gone", found.indexOf(w) >= 0); });
      chips[p].appendChild(tag);
      stack.textContent = "";
      stack.appendChild(el("span", "bd-stack-h", "Waiting calls"));
      if (!path.length) stack.appendChild(el("span", "bd-call none", "none yet"));
      path.forEach(function (q, i) {
        var e = el("span", "bd-call" + (i === path.length - 1 ? " now" : ""), cell(q[0], q[1]) + " " + BOARD[q[0]][q[1]]);
        stack.appendChild(e);
      });
      foundBox.innerHTML = "found = " + esc(list(found));
      foundBox.classList.toggle("on", found.length > 0);
      lines.forEach(function (l, i) { l.classList.toggle("ptr", lit.indexOf(i) >= 0); });
      capText.innerHTML = rich(msg);
      capText.classList.remove("in"); capText.getBoundingClientRect(); capText.classList.add("in");
      next.hidden = phase === "walk";
      next.textContent = phase === "done" ? "Try again" : "Go back";
    }

    function tap(r, c) {
      if (phase !== "walk") return;
      var x = board[r][c], p = prefix(), want = PATHS[word][path.length], last = path[path.length - 1];
      var v = { cell: cell(r, c), x: x, an: an(x), word: word, w0: word.charAt(0), letter: p.slice(-1), cur: last && cell(last[0], last[1]) };
      flash = { r: r, c: c, k: "no" };
      if (last && last[0] === r && last[1] === c) return;
      if (last && Math.abs(last[0] - r) + Math.abs(last[1] - c) !== 1) {
        say(fill(MSG.NOT_NEAR, v)); show(); return;
      }
      if (x === "#") { say(fill(MSG.HASH, v), [L.letter, L.check, L.ret]); show(); return; }
      if (r !== want[0] || c !== want[1]) {
        if (child(p, x)) { flash.k = "maybe"; say(fill(last ? MSG.OTHER : MSG.START_OTHER, v), [L.letter, L.check]); }
        else say(fill(last ? MSG.NO_CHILD : MSG.START_NONE, v), [L.letter, L.check, L.ret]);
        show(); return;
      }
      flash = null;
      v.Node = cap1(nodeName(p));
      path.push([r, c]); board[r][c] = "#";
      var good = fill(MSG.GOOD, v);
      if (path.length === word.length) {
        found.push(word); phase = "found";
        say(good + " " + fill(MSG.FOUND, { letter: x, word: word }), [L.move, L.has, L.add, L.del]);
      } else {
        say(good + " " + fill(MSG.ASK_NEXT, { cur: cell(r, c) }), [L.letter, L.check, L.move, L.mark]);
      }
      show();
    }

    function goBack() {
      if (phase === "done") { go(word); return; }
      var q = path.pop(), x = BOARD[q[0]][q[1]];
      board[q[0]][q[1]] = x; flash = null;
      var prev = path[path.length - 1];
      if (prev) say(fill(MSG.BACK, { x: x, cell: cell(q[0], q[1]), prev: cell(prev[0], prev[1]) }), [L.restore]);
      else { phase = "done"; say(fill(MSG.BACK_LAST, { x: x, cell: cell(q[0], q[1]), found: list(found) }), [L.restore]); }
      show();
    }
    next.addEventListener("click", goBack);
    reset.addEventListener("click", function () { go(word); });

    ["oath", "eat"].forEach(function (w) {
      var b = el("button", "pick", w);
      b.type = "button";
      b.addEventListener("click", function () { go(w); });
      picks.appendChild(b);
    });
    function go(w) {
      word = w; path = []; found = []; phase = "walk"; flash = null;
      board = BOARD.map(function (row) { return row.slice(); });
      $$(".pick", picks).forEach(function (b) { b.classList.toggle("on", b.textContent === w); });
      title.textContent = "Find " + w;
      say(fill(MSG.ASK_START, { word: w }));
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
        ta.setRangeText("    ", s, ta.selectionEnd, "end");
      } else if (e.key === "Enter") {
        var line = v.slice(v.lastIndexOf("\n", s - 1) + 1, s);
        var ind = line.match(/^ */)[0];
        if (/:\s*$/.test(line)) ind += "    ";
        e.preventDefault();
        ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end");
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
    var ta = $(".ed", box), KEY = "lsn-212-editor-v1";
    var START = "class Solution:\n    def findWords(self, board, words):\n        # 1. Build the trie and store each full word under '$'.\n\n        # 2. Call dfs from every cell with root.\n\n\n    def dfs(self, board, r, c, node, found):\n        # 3. Stop if (r, c) is off the board.\n\n        # 4. Stop if letter is not in node.\n\n        # 5. Move node down and save the word if one ends here.\n\n        # 6. Mark the cell, try four nearby cells, then put letter back.\n\n";
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
})();
