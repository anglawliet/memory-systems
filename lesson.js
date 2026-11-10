/* The interactive parts of a lesson page (class "lsn"): guess-the-answer rows, questions,
   the trie picture, the step-by-step walkthroughs, the three practice levels with a real
   Python runner, and the interview sentences that light up their code. */
(function () {
  var lesson = document.querySelector(".lsn");
  if (!lesson) return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function lines(pre) { return $$(".snl", pre); }
  function light(pre, list, cls) {
    cls = cls || "on";
    lines(pre).forEach(function (l, i) { l.classList.toggle(cls, list.indexOf(i) >= 0); });
  }
  function range(spec) {
    var out = [];
    String(spec).split(",").forEach(function (p) {
      var ab = p.split("-").map(Number);
      for (var i = ab[0]; i <= (ab.length > 1 ? ab[1] : ab[0]); i++) out.push(i);
    });
    return out;
  }

  /* 1. Guess the answer rows */
  $$(".pr", lesson).forEach(function (box) {
    var rows = $$(".pr-row", box);
    var score = el("p", "pr-score");
    box.appendChild(score);
    rows.forEach(function (row) {
      var why = el("p", "pr-why");
      row.appendChild(why);
      $$("button", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var pick = b.textContent === "True" ? "T" : "F";
          var ok = pick === row.dataset.ok;
          $$("button", row).forEach(function (x) { x.classList.remove("right", "wrong"); });
          b.classList.add(ok ? "right" : "wrong");
          row.classList.add("done");
          why.textContent = (ok ? "That's right. " : "That's not quite right. The answer is " + (row.dataset.ok === "T" ? "True" : "False") + ". ") + row.dataset.why;
          var done = rows.filter(function (r) { return r.classList.contains("done"); });
          if (done.length === rows.length) {
            var right = rows.filter(function (r) { return $("button.right", r); }).length;
            score.textContent = "You have " + right + " of " + rows.length + " right. The trie in Part 2 explains every answer.";
          }
        });
      });
    });
  });

  /* 2. Questions with one right answer */
  $$(".lq", lesson).forEach(function (q) {
    var why = $(".lq-why", q);
    $$(".lq-opt", q).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".lq-opt", q).forEach(function (x) { x.classList.remove("right", "wrong"); });
        b.classList.add(b.dataset.ok ? "right" : "wrong");
        why.textContent = b.dataset.why;
        why.className = "lq-why " + (b.dataset.ok ? "ok" : "no");
      });
    });
  });

  /* 3. Think first, then reveal */
  $$(".think", lesson).forEach(function (t) {
    var btn = $(".think-btn", t), label = btn.textContent;
    btn.addEventListener("click", function () {
      var open = t.classList.toggle("open");
      btn.textContent = open ? "Hide it" : label;
    });
  });

  /* 4. The trie and the picture of it */
  var WORDS = ["cat", "car", "dog"];
  var POS = { root: [170, 30], c: [95, 96], d: [245, 96], ca: [95, 162], "do": [245, 162],
              cat: [52, 228], car: [138, 228], dog: [245, 228] };
  var SVGNS = "http://www.w3.org/2000/svg";

  function buildTrie(words) {
    var root = {}, id = new Map([[root, "root"]]);
    words.forEach(function (w) {
      var node = root, path = "";
      for (var i = 0; i < w.length; i++) {
        var ch = w[i];
        path += ch;
        if (!(ch in node)) { node[ch] = {}; id.set(node[ch], path); }
        node = node[ch];
      }
      node["$"] = true;
    });
    return { root: root, id: id };
  }
  var T = buildTrie(WORDS);
  function nm(node) { return T.id.get(node); }
  function said(id) { return id === "root" ? "the root" : "the " + id + " node"; }

  function svg(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function makeTrie(host, legend) {
    var s = svg("svg", { viewBox: "0 0 340 262", class: "trie", role: "img",
      "aria-label": "A trie holding cat, car and dog. The root leads to c and d. The c node leads to ca, which leads to cat and car. The d node leads to do, which leads to dog." });
    var edges = {}, nodes = {};
    Object.keys(POS).forEach(function (id) {
      if (id === "root") return;
      var parent = id.length === 1 ? "root" : id.slice(0, -1);
      var a = POS[parent], b = POS[id];
      var g = svg("g", { class: "te" }, s);
      svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, g);
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var off = b[0] < a[0] ? -11 : b[0] > a[0] ? 11 : 12;
      var t = svg("text", { x: mx + off, y: my + 5, class: "te-l" }, g);
      t.textContent = id[id.length - 1];
      edges[id] = g;
    });
    Object.keys(POS).forEach(function (id) {
      var p = POS[id];
      var g = svg("g", { class: "tn" + (id === "root" ? " tn-root" : "") }, s);
      svg("circle", { cx: p[0], cy: p[1], r: 21 }, g);
      var t = svg("text", { x: p[0], y: p[1] + 5, class: "tn-l" }, g);
      t.textContent = id;
      var e = svg("g", { class: "tn-end" }, g);
      svg("circle", { cx: p[0] + 17, cy: p[1] + 16, r: 9 }, e);
      var et = svg("text", { x: p[0] + 17, y: p[1] + 20 }, e);
      et.textContent = "$";
      var m = svg("g", { class: "tn-mark" }, g);
      svg("rect", { x: p[0] - 22, y: p[1] - 45, width: 44, height: 19, rx: 9 }, m);
      var mt = svg("text", { x: p[0], y: p[1] - 31 }, m);
      mt.textContent = "node";
      nodes[id] = g;
    });
    host.appendChild(s);
    if (legend) {
      var lg = el("div", "trie-key");
      legend.forEach(function (k) {
        var i = el("span", "tk tk-" + k[0]);
        i.appendChild(el("i"));
        i.appendChild(document.createTextNode(k[1]));
        lg.appendChild(i);
      });
      host.appendChild(lg);
    }
    function has(set, id) { return !!set && set.indexOf(id) >= 0; }
    return function set(st) {
      st = st || {};
      Object.keys(nodes).forEach(function (id) {
        var g = nodes[id];
        var shown = !st.show || has(st.show, id);
        g.classList.toggle("off", !shown);
        if (edges[id]) {
          edges[id].classList.toggle("off", !shown);
          edges[id].classList.toggle("go", has(st.go, id));
        }
        g.classList.toggle("end", st.ends ? has(st.ends, id) : /^(cat|car|dog)$/.test(id));
        g.classList.toggle("cur", has(st.cur, id));
        g.classList.toggle("nxt", has(st.nxt, id));
        g.classList.toggle("look", st.look === id);
        g.classList.toggle("dead", has(st.dead, id));
        g.classList.toggle("new", has(st.fresh, id));
        g.classList.toggle("mark", st.mark === id);
      });
    };
  }

  $$('.lt[data-mode="static"]', lesson).forEach(function (h) { makeTrie(h)(); });

  /* a stepper: the trie, a message, the code, and Back / Next */
  function stepper(box, opts) {
    var codePre = $("pre.snip", box);
    var codeWrap = $(".viz-code", box);
    var top = el("div", "viz-top");
    var pic = el("div", "viz-pic");
    var state = el("div", "viz-state");
    var msg = el("p", "viz-msg");
    msg.setAttribute("aria-live", "polite");
    var nav = el("div", "viz-nav");
    var back = el("button", "lbtn ghost", "Back"), count = el("span", "viz-n"), next = el("button", "lbtn", "Next");
    back.type = next.type = "button";
    nav.appendChild(back); nav.appendChild(count); nav.appendChild(next);
    var set = makeTrie(pic, opts.legend);
    var left = el("div", "viz-left"), right = el("div", "viz-right");
    left.appendChild(pic); left.appendChild(state);
    right.appendChild(msg); right.appendChild(nav); right.appendChild(codeWrap);
    var grid = el("div", "viz-grid");
    grid.appendChild(left); grid.appendChild(right);
    box.insertBefore(top, box.firstChild);
    box.appendChild(grid);
    var steps = [], at = 0;
    function show() {
      var s = steps[at];
      set(s.pic);
      msg.textContent = s.msg;
      light(codePre, s.line || []);
      opts.draw(state, s);
      count.textContent = "Step " + (at + 1) + " of " + steps.length;
      back.disabled = at === 0;
      next.textContent = at === steps.length - 1 ? "Start over" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === steps.length - 1 ? 0 : at + 1; show(); });
    return {
      top: top,
      load: function (list) { steps = list; at = 0; show(); }
    };
  }

  function chips(label, ids, cls) {
    if (!ids) return el("div", "lst lst-none", "The list " + label + " has not been created yet.");
    var row = el("div", "lst");
    row.appendChild(el("code", "lst-name", label + " = "));
    var b = el("span", "lst-items");
    if (!ids) { b.appendChild(el("span", "lst-none", "It has not been created yet.")); }
    else {
      b.appendChild(document.createTextNode("["));
      ids.forEach(function (id, i) {
        b.appendChild(el("span", "chip " + cls, id));
        if (i < ids.length - 1) b.appendChild(document.createTextNode(","));
      });
      b.appendChild(document.createTextNode("]"));
    }
    row.appendChild(b);
    return row;
  }

  /* 5a. Walkthrough of addWord */
  function addSteps() {
    var root = {}, id = new Map([[root, "root"]]), show = ["root"], ends = [], out = [];
    function snap(extra) {
      var p = { show: show.slice(), ends: ends.slice() };
      for (var k in extra) p[k] = extra[k];
      return p;
    }
    out.push({ line: [], word: "", pic: snap({ mark: null }),
      msg: "The trie starts as just the root, an empty dictionary. Press Next to add cat, then car, then dog." });
    WORDS.forEach(function (w) {
      var node = root, path = "";
      out.push({ line: [1], word: w, li: -1, pic: snap({ mark: "root" }),
        msg: "We're adding \"" + w + "\". We start at the root, so node is the root." });
      for (var i = 0; i < w.length; i++) {
        var ch = w[i], here = id.get(node);
        path += ch;
        if (!(ch in node)) {
          node[ch] = {}; id.set(node[ch], path); show.push(path);
          out.push({ line: [2, 3, 4], word: w, li: i, pic: snap({ mark: here, fresh: [path] }),
            msg: "Is \"" + ch + "\" a key in " + said(here) + "? No. So we create an empty dictionary under \"" + ch + "\". We only created it. node is still " + said(here) + "." });
          node = node[ch];
          out.push({ line: [5], word: w, li: i, pic: snap({ mark: path }),
            msg: "Now we move into it. node is now " + said(path) + "." });
        } else {
          node = node[ch];
          out.push({ line: [2, 3, 5], word: w, li: i, pic: snap({ mark: path }),
            msg: "Is \"" + ch + "\" a key in " + said(here) + "? Yes, an earlier word already created it. So we skip creating and just move into it. node is now " + said(path) + "." });
        }
      }
      node["$"] = true; ends.push(path);
      out.push({ line: [6], word: w, li: w.length, pic: snap({ mark: path }),
        msg: "Every letter of \"" + w + "\" is done. We set node['$'] = True, so " + said(path) + " now marks that a saved word ends here." });
    });
    out[out.length - 1].msg += " All three words are saved.";
    return out;
  }
  function drawWord(state, word, li) {
    var row = el("div", "wd");
    for (var i = 0; i < word.length; i++) {
      var c = el("span", "wd-c" + (i === li ? " on" : i < li ? " done" : ""), word[i]);
      row.appendChild(c);
    }
    state.appendChild(row);
  }
  $$('.viz[data-mode="add"]', lesson).forEach(function (box) {
    var v = stepper(box, {
      legend: [["mark", "node: where the code is standing"], ["new", "just created"], ["end", "a saved word ends here"]],
      draw: function (state, s) {
        state.textContent = "";
        if (s.word) {
          var h = el("p", "wd-h", "addWord(\"" + s.word + "\")");
          state.appendChild(h);
          drawWord(state, s.word, s.li);
        }
      }
    });
    v.top.remove();
    v.load(addSteps());
  });

  /* 5b. Walkthrough of search */
  function searchSteps(word) {
    var out = [];
    function ids(list) { return list.map(nm); }
    function names(list) {
      var n = list.map(function (x) { return said(nm(x)); });
      return n.length <= 1 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
    }
    var current = [T.root];
    out.push({ line: [1], li: -1, cur: ids(current), nxt: null, pic: { cur: ids(current) },
      msg: "Before reading any letter, the only place the search can be is the root. So current starts as a list with just the root in it." });
    for (var i = 0; i < word.length; i++) {
      var letter = word[i], next = [], dead = [], go = [];
      var what = letter === "." ? "a dot, which can be any one letter" : "\"" + letter + "\"";
      out.push({ line: [2, 3], li: i, cur: ids(current), nxt: [], pic: { cur: ids(current) },
        msg: "The next letter is " + what + ". We have " + (current.length === 1 ? "one possible position, " : (["", "", "two", "three", "four"][current.length] || current.length) + " possible positions, ") + names(current) +
             ". next_nodes starts empty. It will collect every place we can be after this letter." });
      current.forEach(function (node) {
        var here = nm(node), m;
        if (letter === ".") {
          var keys = Object.keys(node).filter(function (k) { return k !== "$"; });
          keys.forEach(function (k) { next.push(node[k]); go.push(nm(node[k])); });
          if (keys.length) {
            m = "It's a dot, so from " + said(here) + (keys.length === 1 ? " we follow its only letter, " : " we follow every letter: ") + keys.map(function (k) { return "\"" + k + "\""; }).join(" and ") +
                ". We add " + names(keys.map(function (k) { return node[k]; })) + " to next_nodes.";
          } else {
            dead.push(here);
            m = "It's a dot, but " + said(here) + " has no letters below it. Its only key is '$', the word-end marker, and we skip that because it isn't a letter. Nothing is added, so this path ends here.";
          }
          out.push({ line: [4, 5, 6, 7, 8], li: i, cur: ids(current), nxt: ids(next),
            pic: { cur: ids(current), nxt: ids(next), look: here, dead: dead.slice(), go: go.slice() }, msg: m });
        } else {
          if (letter in node) {
            next.push(node[letter]); go.push(nm(node[letter]));
            m = "We're looking for \"" + letter + "\". Does " + said(here) + " have a \"" + letter + "\"? Yes, so we add " + said(nm(node[letter])) + " to next_nodes.";
          } else {
            dead.push(here);
            m = "We're looking for \"" + letter + "\". Does " + said(here) + " have a \"" + letter + "\"? No, so nothing is added. This path ends here.";
          }
          out.push({ line: [4, 9, 10], li: i, cur: ids(current), nxt: ids(next),
            pic: { cur: ids(current), nxt: ids(next), look: here, dead: dead.slice(), go: go.slice() }, msg: m });
        }
      });
      current = next;
      if (current.length) {
        out.push({ line: [11], li: i, cur: ids(current), nxt: ids(next), pic: { cur: ids(current) },
          msg: "We checked every position. Now current = next_nodes, so " + (current.length === 1 ? "the only position after \"" + word.slice(0, i + 1) + "\" is " : "the positions after \"" + word.slice(0, i + 1) + "\" are ") + names(current) + "." });
      } else {
        out.push({ line: [11, 12, 13], li: i, cur: [], nxt: [], pic: { dead: dead.slice() }, result: false,
          msg: "We checked every position, and next_nodes is empty. current becomes empty too. No saved word can match \"" + word + "\", so we return False." });
        return out;
      }
    }
    var hit = current.filter(function (n) { return "$" in n; });
    out.push({ line: hit.length ? [14, 15, 16] : [14, 15, 17], li: word.length, cur: ids(current), nxt: ids(current), pic: { cur: ids(current), look: hit.length ? nm(hit[0]) : null }, result: hit.length > 0,
      msg: "We've read every letter. current holds " + names(current) + ". " +
           (hit.length ? said(nm(hit[0])) .replace(/^t/, "T") + " has the '$' key, so a saved word ends there. We return True."
                       : (current.length === 1 ? "It doesn't" : "None of them") + " have the '$' key. These are only the start of longer words, so we return False.") });
    return out;
  }

  var searchViz = null;
  $$('.viz[data-mode="search"]', lesson).forEach(function (box) {
    var v = stepper(box, {
      legend: [["cur", "A blue node is in current."], ["nxt", "A green node is in next_nodes."], ["look", "A thick ring marks the node being checked."], ["dead", "A red dashed ring marks a path that ended."], ["end", "A green $ marks the end of a saved word."]],
      draw: function (state, s) {
        state.textContent = "";
        drawWord(state, v.word, s.li);
        state.appendChild(chips("current", s.cur, "c-cur"));
        state.appendChild(chips("next_nodes", s.nxt, "c-nxt"));
        if (s.result != null) state.appendChild(el("p", "viz-res " + (s.result ? "yes" : "no"), "search(\"" + v.word + "\") returns " + (s.result ? "True" : "False") + "."));
      }
    });
    var picks = el("div", "picks");
    ["c.t", "..t", ".og", "c..", "cab", "ca", "cat."].forEach(function (w) {
      var b = el("button", "pick", w);
      b.type = "button";
      b.addEventListener("click", function () { go(w); });
      picks.appendChild(b);
    });
    var form = el("form", "pick-own");
    var inp = el("input");
    inp.type = "text"; inp.maxLength = 6; inp.placeholder = "like d.g";
    inp.setAttribute("autocapitalize", "off"); inp.setAttribute("autocomplete", "off"); inp.spellcheck = false;
    inp.setAttribute("aria-label", "Your own search, using letters and dots");
    var gb = el("button", "lbtn ghost", "Trace it");
    gb.type = "submit";
    var bad = el("span", "pick-bad");
    form.appendChild(inp); form.appendChild(gb); form.appendChild(bad);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var w = inp.value.trim().toLowerCase();
      if (!/^[a-z.]{1,6}$/.test(w)) { bad.textContent = "Use 1 to 6 letters or dots."; return; }
      bad.textContent = "";
      go(w);
    });
    v.top.appendChild(picks);
    v.top.appendChild(form);
    function go(w) {
      v.word = w;
      $$(".pick", picks).forEach(function (b) { b.classList.toggle("on", b.textContent === w); });
      v.load(searchSteps(w));
    }
    searchViz = { go: go, box: box };
    go("..t");
  });

  /* 6. Practice levels */
  var tabs = $$(".lv-tabs button", lesson), levels = $$(".lv", lesson);
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.toggle("on", x === t); });
      levels.forEach(function (l) { l.hidden = l.dataset.lv !== t.dataset.lv; });
    });
  });

  /* Level 1: question first, then the lines that answer it */
  var GUIDE = [
    { q: "Every word needs the same place to start. What do I create first?", l: "0-2", why: "One empty dictionary, the root. Every word starts here." },
    { q: "To add a word, where do I begin, and how do I go through it?", l: "3-6", why: "I begin at the root and go through the word one letter at a time." },
    { q: "This letter might not have a path yet. What do I do?", l: "7-8", why: "If the letter is missing, I create an empty dictionary for it. I'm still standing on the same node." },
    { q: "The path exists now. How do I step into it?", l: "9", why: "I move node into the child. This is the line that actually moves." },
    { q: "The letters are done. How will search know a word ends here?", l: "10", why: "I add the '$' key. A path alone could just be the start of a longer word." },
    { q: "Search starts before reading any letter. Where can I be?", l: "11-13", why: "Only at the root. I keep it in a list, because a dot can give me several places later." },
    { q: "For each letter, where could I be next? Where do I collect that?", l: "14-15", why: "In a new empty list for every letter, so places from the earlier letter don't mix in." },
    { q: "Which places have to take this step?", l: "16", why: "Every node in current, because I don't know yet which path will work." },
    { q: "The letter is a dot. Where can each node go?", l: "17-20", why: "To every child. I skip '$', because it marks a word end and isn't a letter." },
    { q: "The letter is a normal letter. Where can each node go?", l: "21-22", why: "Only to the child for that letter, if the node has it. Otherwise this path ends." },
    { q: "Every node has taken its step. What now?", l: "23", why: "The new places become the current places. This happens after the node loop finishes." },
    { q: "What if no places are left?", l: "24-25", why: "No saved word can match, so I return False right away." },
    { q: "Every letter is read. Is the answer True?", l: "26-29", why: "Only if some remaining node has '$'. Otherwise the letters were only the start of a word." }
  ];
  $$(".gb", lesson).forEach(function (gbox) {
    var pre = $("pre.snip", gbox), ls = lines(pre);
    var q = $(".gb-q", gbox), why = $(".gb-why", gbox), n = $(".gb-n", gbox);
    var back = $(".gb-back", gbox), next = $(".gb-next", gbox);
    var k = 0, shown = false;
    function draw() {
      var upto = [];
      for (var i = 0; i < k + (shown ? 1 : 0); i++) upto = upto.concat(range(GUIDE[i].l));
      var fresh = shown ? range(GUIDE[k].l) : [];
      ls.forEach(function (l, i) {
        l.classList.toggle("hid", upto.indexOf(i) < 0);
        l.classList.toggle("on", fresh.indexOf(i) >= 0);
      });
      pre.classList.toggle("empty", upto.length === 0);
      q.textContent = GUIDE[k].q;
      why.textContent = shown ? GUIDE[k].why : "Think of your answer, then press Show the code.";
      n.textContent = "Question " + (k + 1) + " of " + GUIDE.length;
      back.disabled = k === 0 && !shown;
      next.textContent = !shown ? "Show the code" : k === GUIDE.length - 1 ? "Start over" : "Next question";
    }
    next.addEventListener("click", function () {
      if (!shown) shown = true;
      else if (k === GUIDE.length - 1) { k = 0; shown = false; }
      else { k++; shown = false; }
      draw();
    });
    back.addEventListener("click", function () {
      if (shown) shown = false; else if (k > 0) { k--; shown = true; }
      draw();
    });
    draw();
  });

  /* 7. Running Python in the browser */
  var BASE = ["cat", "car", "dog"];
  var TESTS = [
    ["cat", true], ["cab", false], ["c.t", true], ["c.r", true], ["c..", true], ["ca", false], ["c.", false],
    [".og", true], ["..t", true], ["cat.", false], ["...", true], ["....", false], ["dog", true], ["do", false],
    ["d.g", true], [".", false]
  ].map(function (t, i) { return { id: i, words: BASE, q: t[0], exp: t[1] }; }).concat([
    { id: 100, words: [], q: "a", exp: false },
    { id: 101, words: [], q: ".", exp: false },
    { id: 102, words: ["ab"], q: "a", exp: false },
    { id: 103, words: ["ab", "a"], q: "a", exp: true },
    { id: 104, words: ["a", "ab"], q: "a", exp: true }
  ]);
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
    "    WD = ns.get('WordDictionary')",
    "    if WD is None:",
    "        return {'load': 'There is no class named WordDictionary.', 'kind': 'NoClass'}",
    "    out = []",
    "    for t in tests:",
    "        r = {'id': t['id']}",
    "        try:",
    "            d = WD()",
    "            for w in t['words']:",
    "                d.addWord(w)",
    "            got = d.search(t['q'])",
    "            r['got'] = repr(got)",
    "            r['ok'] = (got is True and t['exp']) or (got is False and not t['exp'])",
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
        var timer = setTimeout(function () {
          worker.terminate(); worker = null;
          rej(new Error("slow"));
        }, 6000);
        worker.onmessage = function (e) {
          clearTimeout(timer);
          if (e.data.err) rej(new Error(e.data.err)); else res(JSON.parse(e.data.out));
        };
        worker.postMessage({ src: code, tests: JSON.stringify(TESTS), harness: HARNESS });
      });
    });
  }

  function testText(t, r) {
    var setup = t.words.length ? "After adding " + t.words.join(", ") + ", " : "With nothing added, ";
    var call = "search(\"" + t.q + "\")";
    if (r.err) return setup + call + " crashed with " + r.err + (r.line ? " on line " + r.line + "." : ".");
    return setup + call + " should return " + (t.exp ? "True" : "False") + ", but your code returned " + r.got + ".";
  }
  function hintFor(res) {
    if (res.load) {
      if (/SyntaxError|IndentationError|TabError/.test(res.kind))
        return "Python could not read your code" + (res.line ? " at line " + res.line : "") + ". Check that every def, for, if and elif line ends with a colon, and that the lines inside them are indented the same amount.";
      if (res.kind === "NoClass") return "The tests look for a class named WordDictionary. Check the spelling of the class name.";
      return "Your code stopped before the tests could start. Read the error above and check the line it names.";
    }
    var by = {}; res.tests.forEach(function (r) { by[r.id] = r; });
    var fails = res.tests.filter(function (r) { return !r.ok; });
    function failed(q) { return TESTS.some(function (t) { return t.q === q && t.words === BASE && !by[t.id].ok; }); }
    function any(fn) { return fails.some(fn); }
    if (any(function (r) { return r.kind === "TypeError" && /bool/.test(r.err); }))
      return "One of your positions is True instead of a dictionary. That happens when a dot adds the value under '$'. Which key should the dot loop skip, and why?";
    if (any(function (r) { return r.kind === "KeyError"; }))
      return "Your code reads a letter that isn't in a dictionary. Before you step into node[letter], what do you need to check first?";
    if (any(function (r) { return r.kind === "NameError" || r.kind === "AttributeError" || r.kind === "UnboundLocalError"; }))
      return "Python doesn't know one of the names. Check the spelling of self.root, current, next_nodes and node, and check that each one is created before it is used.";
    if (any(function (r) { return r.got === "None"; }))
      return "Your search returned None for some searches. That means it reached the end without a return. Every way out of search should return True or False.";
    if (!by[103].ok || !by[104].ok)
      return "Adding a second word erased part of the first one. Look at addWord: should it create a new dictionary for a letter that is already there?";
    if (failed("ca") || failed("do"))
      return "Your search says yes when the letters are only the start of a saved word. When every letter is read, what must the node have before you can say True?";
    if ((failed(".og") || failed("..t") || failed("c..")) && !failed("c.t"))
      return "Your dot follows only one child. When a node has several children, which ones should go into next_nodes?";
    if (failed("c.") || failed("....") || failed("."))
      return "A dot must match exactly one letter. Check that every letter, including a dot, moves every position exactly one step down.";
    if (failed("cab"))
      return "A normal letter should follow only the child for that letter. What should a node add if it doesn't have the letter?";
    if (fails.some(function (r) { return TESTS[r.id] && TESTS[r.id].q.indexOf(".") >= 0; }))
      return "The searches with dots fail. Trace one of them by hand with the trie from Part 2, and compare it to the walkthrough in Part 7.";
    return "Pick one failing search and trace it by hand with the trie from Part 2. Where does your code first do something different?";
  }
  function showResult(out, res) {
    out.textContent = "";
    if (res.load) {
      out.appendChild(el("p", "ro-bad", "Your code didn't run. " + res.load + (res.line ? " (line " + res.line + ")" : "")));
      out.appendChild(el("p", "ro-hint", hintFor(res)));
      return;
    }
    var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
    if (pass === all) {
      out.appendChild(el("p", "ro-good", "All " + all + " tests pass. You wrote the whole solution yourself."));
      return;
    }
    out.appendChild(el("p", "ro-sum", pass + " of " + all + " tests pass."));
    out.appendChild(el("p", "ro-hint", "Here is something to think about. " + hintFor(res)));
    var ul = el("ul", "ro-list");
    res.tests.filter(function (r) { return !r.ok; }).slice(0, 4).forEach(function (r) {
      var t = TESTS.filter(function (x) { return x.id === r.id; })[0];
      var li = el("li", null, testText(t, r) + " ");
      if (searchViz && t.words === BASE && t.q.length <= 6) {
        var w = el("button", "ro-watch", "Watch the right steps");
        w.type = "button";
        w.addEventListener("click", function () {
          searchViz.go(t.q);
          searchViz.box.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        li.appendChild(w);
      }
      ul.appendChild(li);
    });
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
        out.textContent = "";
        if (err.message === "slow") {
          out.appendChild(el("p", "ro-bad", "Your code ran for more than 6 seconds, so I stopped it."));
          out.appendChild(el("p", "ro-hint", "Here is something to think about. A loop may never end. Do you add to a list while looping over that same list? current and next_nodes have to be two different lists."));
        } else {
          out.appendChild(el("p", "ro-bad", "Python could not start. Check your internet connection and try again. (" + err.message + ")"));
          worker = null;
        }
      }).then(function () { btn.disabled = false; });
    });
  }

  /* editor helpers: Tab adds 4 spaces, Enter keeps the indent and adds 4 more after a colon */
  function codeKeys(ta) {
    ta.addEventListener("keydown", function (e) {
      var s = ta.selectionStart, v = ta.value;
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        ta.setRangeText("    ", s, ta.selectionEnd, "end");
      } else if (e.key === "Enter") {
        var lineStart = v.lastIndexOf("\n", s - 1) + 1;
        var line = v.slice(lineStart, s);
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

  /* Level 2: fill the gaps */
  $$('.lv[data-lv="2"]', lesson).forEach(function (box) {
    var blanks = $$(".blank", box);
    blanks.forEach(function (b) {
      var ta = $("textarea", b), msg = $(".b-msg", b);
      codeKeys(ta);
      $(".b-hint", b).addEventListener("click", function () { msg.textContent = b.dataset.hint; msg.className = "b-msg hint"; });
      $(".b-show", b).addEventListener("click", function () {
        if (!ta.value.trim()) { msg.textContent = "Try typing something first. A wrong guess teaches more than reading the answer. Press Show answer again to see it anyway."; msg.className = "b-msg hint"; if (!b.dataset.asked) { b.dataset.asked = "1"; return; } }
        ta.value = b.dataset.answer;
        msg.textContent = "Here is one answer. Read it, then clear the box and type it again from memory.";
        msg.className = "b-msg";
      });
    });
    var parts = [
      "class WordDictionary:\n    def __init__(self):\n        self.root = {}\n\n    def addWord(self, word):\n        node = self.root\n        for letter in word:\n            if letter not in node:\n                node[letter] = {}\n            node = node[letter]\n        node['$'] = True\n\n    def search(self, word):\n        current = [self.root]\n        for letter in word:\n            next_nodes = []\n            for node in current:\n",
      0, 1, 2
    ];
    wireRun(box, function () {
      var empty = blanks.filter(function (b) { return !$("textarea", b).value.trim(); });
      if (empty.length) {
        $(".run-status", box).textContent = "Please fill in every gap first, and press Hint if you are stuck.";
        return null;
      }
      return parts.map(function (p) {
        if (typeof p === "string") return p;
        var b = blanks[p], pad = new Array(+b.dataset.indent + 1).join(" ");
        return dedent($("textarea", b).value).map(function (l) { return l.trim() ? pad + l : ""; }).join("\n") + "\n";
      }).join("");
    });
  });

  /* Level 3: a blank editor */
  $$('.lv[data-lv="3"]', lesson).forEach(function (box) {
    var ta = $(".ed", box), KEY = "lsn-211-editor";
    var START = "class WordDictionary:\n\n    def __init__(self):\n        \n\n    def addWord(self, word):\n        \n\n    def search(self, word):\n        \n";
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

  /* 8. Interview sentences light up their code */
  $$(".say", lesson).forEach(function (say) {
    var pre = $("pre.snip", say.nextElementSibling);
    var ss = $$(".say-s", say);
    ss.forEach(function (s) {
      s.addEventListener("click", function () {
        var on = !s.classList.contains("on");
        ss.forEach(function (x) { x.classList.remove("on"); });
        if (on) s.classList.add("on");
        light(pre, on ? range(s.dataset.l) : []);
        var first = $(".snl.on", pre);
        if (first) {
          var r = first.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight) first.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        pre.classList.toggle("focus", on);
      });
    });
  });
})();
