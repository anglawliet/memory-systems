/* The interactive parts of a lesson page (class "lsn"): guess-the-answer rows, questions,
   the trie picture, the step-by-step walkthroughs, the three practice levels with a real
   Python runner, and the interview sentences that light up their code. */
(function () {
  var lesson = document.querySelector(".lsn:not([data-lesson])");
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
  function lbl(id) { return id === "root" ? "root" : id.slice(-1); }
  function said(id) { return id === "root" ? "the root" : "the " + lbl(id) + " node"; }

  function svg(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function makeTrie(host, legend) {
    var s = svg("svg", { viewBox: "0 0 340 262", class: "trie", role: "img",
      "aria-label": "A trie holding cat, car and dog. The root leads to the c node and the d node. The c node leads to the a node, which leads to the t node and the r node. The d node leads to the o node, which leads to the g node." });
    var edges = {}, nodes = {};
    var band = svg("rect", { x: 4, y: 0, width: 332, height: 56, rx: 12, class: "row-band" }, s);
    Object.keys(POS).forEach(function (id) {
      if (id === "root") return;
      var parent = id.length === 1 ? "root" : id.slice(0, -1);
      var a = POS[parent], b = POS[id];
      var g = svg("g", { class: "te" }, s);
      svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, g);
      edges[id] = g;
    });
    Object.keys(POS).forEach(function (id) {
      var p = POS[id];
      var g = svg("g", { class: "tn" + (id === "root" ? " tn-root" : ""), "data-id": id }, s);
      svg("circle", { cx: p[0], cy: p[1], r: 21 }, g);
      var t = svg("text", { x: p[0], y: p[1] + 5, class: "tn-l" }, g);
      t.textContent = lbl(id);
      if (id !== "root" && id.length > 1) {
        var left = id === "ca" || id === "cat";
        var pt = svg("text", { x: p[0] + (left ? -27 : 27), y: p[1] - 2, class: "tn-p", "text-anchor": left ? "end" : "start" }, g);
        pt.textContent = id;
      }
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
    var mkLayer = svg("g", { class: "mk-layer" }, s);
    host.appendChild(s);
    if (legend) {
      var lg = el("div", "trie-key");
      legend.forEach(function (k) {
        var i = el("span", "tk tk-" + k[0]);
        i.appendChild(el("i"));
        i.appendChild(document.createTextNode(k[1]));
        lg.appendChild(i);
      });
      var kb = el("details", "trie-keybox");
      var ks = el("summary");
      ks.textContent = "What the colors mean";
      kb.appendChild(ks); kb.appendChild(lg);
      host.appendChild(kb);
    }
    function has(set, id) { return !!set && set.indexOf(id) >= 0; }
    var ROWS = [30, 96, 162, 228];
    function spot(id) { var p = POS[id]; return "translate(" + (p[0] - 17) + "px," + (p[1] - 18) + "px)"; }
    function markers(list) {
      mkLayer.textContent = "";
      var made = (list || []).map(function (m) {
        var g = svg("g", { class: "mk" + (m.kind ? " " + m.kind : "") }, mkLayer);
        svg("circle", { cx: 0, cy: 0, r: 9 }, g);
        g.style.transition = "none";
        g.style.transform = spot(m.from || m.at);
        return { g: g, to: spot(m.at) };
      });
      if (!made.length) return;
      mkLayer.getBoundingClientRect();
      requestAnimationFrame(function () {
        made.forEach(function (m) { m.g.style.transition = ""; m.g.style.transform = m.to; });
      });
    }
    return function set(st) {
      st = st || {};
      var row = st.row != null && st.row < ROWS.length ? st.row : -1;
      band.classList.toggle("on", row >= 0);
      if (row >= 0) band.style.transform = "translateY(" + (ROWS[row] - 28) + "px)";
      markers(st.mk);
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
        g.classList.toggle("newend", st.newEnd === id);
      });
    };
  }

  $$('.lt[data-mode="static"]', lesson).forEach(function (h) { makeTrie(h)(); });

  /* a stepper: the trie, a message, the code, and Back / Next */
  function stepper(box, opts) {
    var codePre = $("pre.snip", box);
    var codeWrap = $(".viz-code", box);
    box.classList.add("pro");
    var head = el("div", "vz-head");
    var titles = el("div", "vz-titles");
    var eyebrow = el("span", "vz-eyebrow", opts.eyebrow || "Walkthrough");
    var title = el("span", "vz-title", "");
    titles.appendChild(eyebrow); titles.appendChild(title);
    var top = el("div", "viz-top");
    head.appendChild(titles); head.appendChild(top);
    var stage = el("div", "vz-stage");
    var state = el("div", "viz-state");
    var pic = el("div", "viz-pic");
    var set = makeTrie(pic);
    stage.appendChild(state); stage.appendChild(pic);
    var res = el("p", "vz-res");
    stage.appendChild(res);
    var body = el("div", "vz-body");
    body.appendChild(stage);
    if (codeWrap) { codeWrap.classList.add("vz-code"); body.appendChild(codeWrap); }
    var foot = el("div", "vz-foot");
    var capText = el("p", "vz-cap");
    capText.setAttribute("aria-live", "polite");
    var ctrl = el("div", "vz-ctrl");
    var back = el("button", "vz-btn", "Back"), next = el("button", "vz-btn primary", "Next");
    back.type = next.type = "button";
    var prog = el("div", "vz-prog"), bar = el("span", "vz-bar"), fill = el("i"), count = el("span", "vz-n");
    bar.appendChild(fill); prog.appendChild(bar); prog.appendChild(count);
    ctrl.appendChild(back); ctrl.appendChild(count); ctrl.appendChild(next);
    foot.appendChild(bar); foot.appendChild(capText); foot.appendChild(ctrl);
    box.textContent = "";
    box.appendChild(head); box.appendChild(body); box.appendChild(foot);
    var steps = [], at = 0, frames = [], shownStep = -1;
    function storyFor(s, i) {
      var hit = (s.story || []).filter(function (x) { return x[0] === i; });
      return hit.length ? hit[0][1] : null;
    }
    function build() {
      frames = [];
      steps.forEach(function (s, si) {
        var order = (s.line || []).concat(s.skip || []).filter(function (x, k, a) { return a.indexOf(x) === k; }).sort(function (a, b) { return a - b; });
        var lastRun = Math.max.apply(null, (s.line || []).concat([-1]));
        if (!codePre || !order.length) { frames.push({ si: si, at: -1, skip: false, text: s.msg || "", applied: true }); return; }
        var made = 0, seen = [];
        order.forEach(function (i) {
          seen.push(i);
          var line = storyFor(s, i);
          if (line) { frames.push({ si: si, at: i, skip: (s.skip || []).indexOf(i) >= 0, text: line, seen: seen.slice() }); made++; }
        });
        if (!made) frames.push({ si: si, at: order[order.length - 1], skip: false, text: s.msg || "", seen: seen.slice() });
        frames.forEach(function (f) {
          if (f.si === si) f.applied = f.at === -1 || lastRun < 0 || (f.seen || []).indexOf(lastRun) >= 0;
        });
      });
    }
    function paint(si) {
      if (shownStep === si) return;
      shownStep = si;
      if (si < 0) { set({}); state.textContent = ""; res.textContent = ""; res.className = "vz-res"; return; }
      var s = steps[si], p = {};
      for (var k in s.pic) if (k !== "mk" && k !== "row") p[k] = s.pic[k];
      if (s.node) p.mark = s.node;
      set(p);
      opts.draw(state, s);
      if (s.result != null && opts.result) {
        res.textContent = opts.result(s);
        res.className = "vz-res on " + (s.wrong ? "bad" : s.result ? "yes" : "no");
      } else { res.textContent = ""; res.className = "vz-res"; }
    }
    function show() {
      var f = frames[at], s = steps[f.si];
      if (opts.title) title.textContent = opts.title(s);
      count.textContent = (at + 1) + " / " + frames.length;
      fill.style.width = ((at + 1) / frames.length * 100) + "%";
      if (codePre) {
        lines(codePre).forEach(function (l, i) {
          l.classList.toggle("ptr", i === f.at);
          l.classList.toggle("skip", i === f.at && f.skip);
        });
      }
      paint(f.applied ? f.si : f.si - 1);
      capText.textContent = f.text;
      capText.classList.remove("in"); capText.getBoundingClientRect(); capText.classList.add("in");
      back.disabled = at === 0;
      next.textContent = at === frames.length - 1 ? "Start over" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { at = at === frames.length - 1 ? 0 : at + 1; show(); });
    return {
      top: top,
      load: function (list) { steps = list; at = 0; shownStep = -2; build(); show(); }
    };
  }

  function chips(label, ids, cls) {
    if (!ids) return el("div", "lst lst-none", "The list " + label + " has not been created yet.");
    var row = el("div", "lst");
    row.dataset.row = label;
    row.appendChild(el("code", "lst-name", label + " = "));
    var b = el("span", "lst-items");
    if (!ids) { b.appendChild(el("span", "lst-none", "It has not been created yet.")); }
    else {
      b.appendChild(document.createTextNode("["));
      ids.forEach(function (id, i) {
        var c = el("span", "chip " + cls, lbl(id));
        c.dataset.id = id;
        b.appendChild(c);
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
    out.push({ line: [], word: "", li: -1, pic: snap({}),
      msg: "The trie starts with only the root. Press Next to add \"cat\", then \"car\", then \"dog\"." });
    var madeBy = {};
    WORDS.forEach(function (w) {
      var node = root, path = "";
      out.push({ line: [1], word: w, li: -1, node: "root", anim: { type: "tree", row: "node" }, pic: snap({ mk: [{ at: "root" }] }),
        notes: [[1, "node starts at the root."]],
        story: [[1, "We want to add \"" + w + "\". Start at the root with node = self.root."]],
        msg: "We're adding \"" + w + "\". Every word starts at the root, so node is the root." });
      for (var i = 0; i < w.length; i++) {
        var ch = w[i], here = id.get(node);
        path += ch;
        if (!(ch in node)) {
          node[ch] = {}; id.set(node[ch], path); show.push(path); madeBy[path] = w;
          out.push({ line: [2, 3, 4], word: w, li: i, node: here, pic: snap({ fresh: [path], mk: [{ at: here }] }),
            notes: [[2, "letter is " + q(ch) + "."], [3, cap(said(here)) + " has no " + q(ch) + ", so this is True."], [4, "This creates " + said(path) + ", an empty dictionary."]],
            story: [[2, "The " + (i === 0 ? "first" : "next") + " letter is " + q(ch) + ". Check whether " + said(here) + " has a child for it."], [3, cap(said(here)) + " has no child for " + q(ch) + "."], [4, "Create the child with node[" + q(ch) + "] = {}. We are still at " + said(here) + "."]],
            msg: cap(said(here)) + " has no " + q(ch) + ", so addWord creates " + said(path) + ". The variable node is still " + said(here) + ", because creating a node doesn't move into it." });
          node = node[ch];
          out.push({ line: [5], word: w, li: i, node: path, anim: { type: "tree", row: "node" }, pic: snap({ mk: [{ at: path, from: here }] }),
            notes: [[5, "node moves into " + said(path) + "."]],
            story: [[5, "The " + lbl(path) + " node now exists. Move to it with node = node[" + q(ch) + "]."]],
            msg: "Now node moves into " + said(path) + "." });
        } else {
          node = node[ch];
          out.push({ line: [2, 3, 5], skip: [4], word: w, li: i, node: path, anim: { type: "tree", row: "node" }, pic: snap({ mk: [{ at: path, from: here }] }),
            notes: [[2, "letter is " + q(ch) + "."], [3, cap(said(here)) + " already has " + q(ch) + ", so this is False."], [4, "Skipped, because the node already exists."], [5, "node moves into " + said(path) + "."]],
            story: [[2, "The " + (i === 0 ? "first" : "next") + " letter is " + q(ch) + ". Check whether " + said(here) + " has a child for it."], [3, cap(said(here)) + " already has a child for " + q(ch) + " from \"" + madeBy[path] + "\"."], [4, "Do not create another child."], [5, "Move to the existing " + lbl(path) + " node with node = node[" + q(ch) + "]."]],
            msg: cap(said(here)) + " already has " + q(ch) + ", because an earlier word created it. So addWord skips creating it and only moves into " + said(path) + "." });
        }
      }
      node["$"] = true; ends.push(path);
      out.push({ line: [6], word: w, li: w.length, node: path, pic: snap({ newEnd: path, mk: [{ at: path, kind: "win" }] }),
        notes: [[6, cap(said(path)) + " gets the key '$'."]],
        story: [[6, "All letters in \"" + w + "\" are stored. Add '$' to the " + lbl(path) + " node to mark a complete word."]],
        msg: "Every letter of \"" + w + "\" is done. The last line sets node['$'] = True, so " + said(path) + " now marks the end of a saved word." });
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
      eyebrow: "Watch addWord",
      title: function (s) { return s.word ? "addWord(\"" + s.word + "\")" : "self.root = {}"; },
      draw: function (state, s) {
        state.textContent = "";
        if (s.word) drawWord(state, s.word, s.li);
      }
    });
    v.top.remove();
    v.load(addSteps());
  });

  /* 5b. Walkthroughs of search that show which lines run, which lines are skipped, and why */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function L(list) { return "[" + list.map(function (n) { return lbl(nm(n)); }).join(", ") + "]"; }
  function matchOf(word) {
    var m = WORDS.filter(function (w) {
      if (w.length !== word.length) return false;
      for (var i = 0; i < w.length; i++) if (word[i] !== "." && word[i] !== w[i]) return false;
      return true;
    });
    return m[0] || "";
  }
  function q(ch) { return "'" + ch + "'"; }
  function names(list) {
    var n = list.map(function (x) { return said(nm(x)); });
    return n.length <= 1 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
  }
  function truth(word) {
    var current = [T.root];
    for (var i = 0; i < word.length; i++) {
      var next = [];
      current.forEach(function (node) {
        if (word[i] === ".") Object.keys(node).forEach(function (k) { if (k !== "$") next.push(node[k]); });
        else if (word[i] in node) next.push(node[word[i]]);
      });
      current = next;
      if (!current.length) return false;
    }
    return current.some(function (n) { return "$" in n; });
  }

  /* The search from Implement Trie, which keeps only one node */
  function plainSteps(word) {
    var out = [], node = T.root, here = "root";
    out.push({ line: [1], li: -1, node: "root", anim: { type: "tree", row: "node" }, pic: { cur: ["root"], row: 0, mk: [{ at: "root" }] },
      story: [[1, "The original search keeps only one possible position. Start at the root with node = self.root."]],
      msg: "The search starts at the root. The variable node can hold only one dictionary, and right now it holds the root." });
    for (var i = 0; i < word.length; i++) {
      var letter = word[i];
      if (!(letter in node)) {
        var wrong = truth(word);
        var keys = Object.keys(node).filter(function (k) { return k !== "$"; }).map(q);
        var m = letter === "."
          ? "The code looks for a key called '.', but " + said(here) + (keys.length ? " has the keys " + keys.join(" and ") + "." : " has no letters below it.") + " So the search returns False."
          : cap(said(here)) + " has no " + q(letter) + ", so no saved word can match. The search returns False.";
        if (wrong) m += " That answer is wrong, because a saved word does match \"" + word + "\". The dot could be " + keys.join(" or ") + ", but node can hold only one of them.";
        out.push({ line: [2, 3, 4], li: i, node: here, pic: { cur: [here], look: here, dead: [here], row: i, mk: [{ at: here, kind: "dead" }] }, result: false, wrong: wrong,
          notes: [[2, "letter is " + q(letter) + "."], [3, cap(said(here)) + " has no " + q(letter) + " key, so this is True."]],
          story: [[2, letter === "." ? "The next character is '.'. It could match " + (keys.length ? keys.join(" or ") : "any letter") + ", but this code looks for a child named '.'." : "The next character is " + q(letter) + ". Check whether " + said(here) + " has a child for it."], [3, letter === "." ? cap(said(here)) + " has no child named '.'." : cap(said(here)) + " has no child for " + q(letter) + "."], [4, wrong ? "The code returns False, even though \"" + matchOf(word) + "\" matches. A dot needs several possible positions, so we need a list called current." : "This path cannot match. Return False."]],
          msg: m });
        return out;
      }
      var prev = here;
      node = node[letter]; here = nm(node);
      out.push({ line: [2, 3, 5], skip: [4], li: i, node: here, anim: { type: "tree", row: "node" }, pic: { cur: [here], go: [here], row: i + 1, mk: [{ at: here, from: prev }] },
        notes: [[2, "letter is " + q(letter) + "."], [3, cap(said(prev)) + " has " + q(letter) + ", so this is False."],
                [4, "Skipped, because the if above was False."], [5, "node moves into " + said(here) + "."]],
        story: [[2, "The next character is " + q(letter) + ". Check whether " + said(prev) + " has a child for it."], [3, cap(said(prev)) + " has a child for " + q(letter) + "."], [4, "Do not return False."], [5, "Move to that child with node = node[" + q(letter) + "]. The character tells us exactly which child to follow."]],
        msg: "The letter is " + q(letter) + ". " + cap(said(prev)) + " has " + q(letter) + ", so the return is skipped, and node moves into " + said(here) + "." });
    }
    var has = "$" in node;
    out.push({ line: [6], li: word.length, node: here, pic: { cur: [here], look: here, row: word.length, mk: [{ at: here, kind: has ? "win" : "miss" }] }, result: has,
      notes: [[6, cap(said(here)) + (has ? " has '$', so this returns True." : " has no '$', so this returns False.")]],
      story: [[6, "We read every character and reached " + said(here) + ". " + (has ? "This position has '$', so return True." : "This position has no '$', so \"" + word + "\" is only a prefix. Return False.")]],
      msg: "Every letter has been read. " + cap(said(here)) + (has ? " has '$', so a saved word ends here, and the search returns True." : " has no '$', so \"" + word + "\" is only the start of a longer word. The search returns False.") });
    return out;
  }

  /* The search that keeps a list of nodes */
  function searchSteps(word) {
    var out = [];
    function ids(list) { return list.map(nm); }
    var current = [T.root];
    out.push({ line: [1], li: -1, cur: ids(current), nxt: null, anim: { type: "tree", row: "current" }, pic: { cur: ids(current), row: 0, mk: [{ at: "root" }] },
      notes: [[1, "current holds only the root."]],
      story: [[1, "We have not read any characters. The root is our only possible position, so current = [root]."]],
      msg: "Before we read any letter, the root is our only possible position. So current starts as a list that holds only the root." });
    for (var i = 0; i < word.length; i++) {
      var letter = word[i], next = [], dead = [], go = [];
      var landed = [];
      out.push({ line: [2, 3], li: i, cur: ids(current), nxt: [], anim: { type: "reset", was: i > 0 ? ids(current) : null }, pic: { cur: ids(current), row: i, mk: ids(current).map(function (id) { return { at: id }; }) },
        notes: [[2, "letter is " + q(letter) + "."], [3, "next_nodes starts as an empty list."]],
        story: [[2, letter === "." ? "Read '.'. It matches any one letter, so find every position reachable from current = " + L(current) + "." : "Read " + q(letter) + ". Find every position reachable from current = " + L(current) + " using this character."], [3, "Start with next_nodes = []. It collects every position we can reach, so we know where to look for the next character."]],
        msg: "The next letter is " + (letter === "." ? "a dot, which can be any one letter" : q(letter)) + ". The current list holds " + names(current) +
             ". The next_nodes list starts empty, because we haven't found any valid next positions yet." });
      current.forEach(function (node, k) {
        var here = nm(node), m, st, before = next.length;
        var base = [[4, "node is " + said(here) + "."]];
        var tale = [[4, current.length === 1 ? "Check " + said(here) + ", the only position in current = " + L(current) + "." : "Check " + said(here) + ", position " + (k + 1) + " of " + current.length + " in current = " + L(current) + "." + (k === 0 ? " Every position might lead to a match." : "")]];
        if (letter === ".") {
          var keys = Object.keys(node).filter(function (k) { return k !== "$"; });
          keys.forEach(function (k) { next.push(node[k]); go.push(nm(node[k])); });
          base.push([5, "letter is '.', so this is True."]);
          tale.push([5, "The character is '.', so it can match any one letter."]);
          if (keys.length) {
            tale.push([6, "Follow every letter child of " + said(here) + ", which " + (keys.length === 1 ? "is " : "are ") + keys.map(q).join(" and ") + "."]);
            if ("$" in node) tale.push([7, "Skip '$'. It marks a word ending, not a letter child."]);
            tale.push([8, "Add " + (keys.length === 1 ? "that position" : "those positions") + ". Now next_nodes = " + L(next) + "."]);
            base.push([6, "The letter keys are " + keys.map(q).join(" and ") + "."]);
            if ("$" in node) base.push([7, "The '$' key is skipped here, because it is not a letter."]);
            base.push([8, "This adds " + names(keys.map(function (k) { return node[k]; })) + "."]);
            base.push([9, "Skipped, because the if above was True."]);
            st = { line: [4, 5, 6, 7, 8], skip: [9, 10] };
            m = "It's a dot, so " + said(here) + " adds every letter below it. That is " + names(keys.map(function (k) { return node[k]; })) + ".";
          } else {
            dead.push(here);
            base.push([7, "The only key is '$', so this is False."]);
            tale.push([7, cap(said(here)) + " has only '$'. It has no letter child to follow."]);
            tale.push([8, "Add nothing because this path ends. The list stays next_nodes = " + L(next) + "."]);
            base.push([8, "Skipped, so nothing is added."]);
            base.push([9, "Skipped, because the if above was True."]);
            st = { line: [4, 5, 6, 7], skip: [8, 9, 10] };
            m = "It's a dot, but " + said(here) + " has no letters below it. Its only key is '$', and the code skips '$' because it isn't a letter. Nothing is added, so this path ends here.";
          }
        } else {
          base.push([5, "letter is " + q(letter) + ", not '.', so this is False."]);
          base.push([6, "Skipped, because letter is not a dot."]);
          tale.push([5, "The character is " + q(letter) + ", not a dot."]);
          tale.push([6, "Skip the dot steps. Check for a child for " + q(letter) + "."]);
          if (letter in node) {
            next.push(node[letter]); go.push(nm(node[letter]));
            base.push([9, cap(said(here)) + " has " + q(letter) + ", so this is True."]);
            base.push([10, "This adds " + said(nm(node[letter])) + "."]);
            tale.push([9, cap(said(here)) + " has a child for " + q(letter) + "."]);
            tale.push([10, "Add the " + lbl(nm(node[letter])) + " node. Now next_nodes = " + L(next) + "."]);
            st = { line: [4, 5, 9, 10], skip: [6, 7, 8] };
            m = cap(said(here)) + " has " + q(letter) + ", so " + said(nm(node[letter])) + " is added to next_nodes.";
          } else {
            dead.push(here);
            base.push([9, cap(said(here)) + " has no " + q(letter) + ", so this is False."]);
            base.push([10, "Skipped, so nothing is added."]);
            tale.push([9, cap(said(here)) + " has no child for " + q(letter) + ". This path cannot match."]);
            tale.push([10, "Add nothing. The list stays next_nodes = " + L(next) + "."]);
            st = { line: [4, 5, 9], skip: [6, 7, 8, 10] };
            m = cap(said(here)) + " has no " + q(letter) + ", so nothing is added. This path ends here.";
          }
        }
        var kids = ids(next.slice(before));
        var mk = landed.slice();
        if (kids.length) kids.forEach(function (id) { mk.push({ at: id, from: here }); });
        else mk.push({ at: here, kind: "dead" });
        ids(current.slice(k + 1)).forEach(function (id) { mk.push({ at: id }); });
        kids.forEach(function (id) { landed.push({ at: id }); });
        out.push({ line: st.line, skip: st.skip, notes: base, story: tale, li: i, node: here, anim: { type: "add", ids: kids }, cur: ids(current), nxt: ids(next),
          pic: { cur: ids(current), nxt: ids(next), look: here, dead: dead.slice(), go: go.slice(), row: i + 1, mk: mk }, msg: m });
      });
      current = next;
      if (current.length) {
        out.push({ line: [11, 12], skip: [13], li: i, anim: { type: "move" }, cur: ids(current), nxt: ids(next), pic: { cur: ids(current), row: i + 1, mk: ids(current).map(function (id) { return { at: id }; }) },
          notes: [[11, "current now holds " + names(current) + "."], [12, "current is not empty, so this is False."], [13, "Skipped, so the search goes on."]],
          story: [[11, "We checked every position in current. Set current = next_nodes, so current = " + L(current) + "."], [12, "The current list is not empty, so a path is still possible. " + (i === word.length - 1 ? "That was the last character." : "Read the next character.")]],
          msg: "We've checked every node in current, so current = next_nodes. " + (current.length === 1 ? "Our only possible position after \"" + word.slice(0, i + 1) + "\" is " : "Our possible positions after \"" + word.slice(0, i + 1) + "\" are ") + names(current) + "." });
      } else {
        out.push({ line: [11, 12, 13], li: i, cur: [], nxt: [], pic: { dead: dead.slice() }, result: false,
          notes: [[11, "current is now empty."], [12, "current is empty, so this is True."]],
          story: [[11, "We checked every position, but next_nodes = []. Set current = next_nodes, so current = []."], [13, "The current list is empty, so every path failed. Return False."]],
          msg: "We've checked every node in current, and next_nodes is empty. There is nowhere left to go, so no saved word can match \"" + word + "\". The search returns False." });
        return out;
      }
    }
    var hit = current.filter(function (n) { return "$" in n; });
    var fin;
    if (hit.length) {
      var at = current.indexOf(hit[0]);
      var before = current.slice(0, at);
      fin = { line: [14, 15, 16], skip: [17], notes: [[14, "node is " + said(nm(hit[0])) + "."],
        [15, (before.length ? cap(names(before)) + (before.length === 1 ? " has" : " have") + " no '$', so the loop moved on. " : "") + cap(said(nm(hit[0]))) + " has '$', so this is True."],
        [17, "Skipped, because the search already returned True."]],
        story: [[14, "We read every character, and current = " + L(current) + ". Check each position for '$'."], [15, (before.length ? cap(names(before)) + (before.length === 1 ? " has" : " have") + " no '$'. " : "") + cap(said(nm(hit[0]))) + " has '$', so a complete saved word ends here."], [16, "Return True."]],
        msg: "Every letter has been read, and current holds " + names(current) + ". " + cap(said(nm(hit[0]))) + " has '$', so a saved word ends there. The search returns True." };
    } else {
      fin = { line: [14, 15, 17], skip: [16], notes: [[15, "No node in current has '$', so this is never True."], [16, "Skipped, because no node has '$'."], [17, "The loop ended, so this returns False."]],
        story: [[14, "We read every character, and current = " + L(current) + ". Check each position for '$'."], [15, "No position in current = " + L(current) + " has '$'."], [17, (current.length === 1 ? "This position is" : "These positions are") + " only a prefix of longer words. Return False."]],
        msg: "Every letter has been read, and current holds " + names(current) + ". " + (current.length === 1 ? "That node doesn't" : "None of them") + " have '$', so these are only the start of longer words. The search returns False." };
    }
    fin.li = word.length; fin.cur = ids(current); fin.nxt = ids(current); fin.result = hit.length > 0;
    fin.node = hit.length ? nm(hit[0]) : null;
    fin.pic = { cur: ids(current), look: hit.length ? nm(hit[0]) : null, row: word.length,
      mk: current.map(function (n) { return { at: nm(n), kind: "$" in n ? "win" : "miss" }; }) };
    out.push(fin);
    return out;
  }

  function letterRow(state, word, li) {
    var at = Math.min(li, word.length - 1);
    if (at < 0) { state.appendChild(el("div", "lst lst-none", "The variable letter has not been set yet.")); return; }
    var lr = el("div", "lst lst-let");
    lr.appendChild(el("code", "lst-name", "letter = "));
    lr.appendChild(el("span", "chip c-let", q(word[at])));
    state.appendChild(lr);
  }
  function nodeRow(state, id) {
    var r = el("div", "lst");
    r.dataset.row = "node";
    r.appendChild(el("code", "lst-name", "node = "));
    var c = el("span", "chip c-node", lbl(id));
    c.dataset.id = id;
    r.appendChild(c);
    state.appendChild(r);
  }

  /* Mark the chip being checked, a path that ended, and the node that wins */
  function markChips(state, s) {
    rowChips(state, "current").forEach(function (c) {
      var id = c.dataset.id, p = s.pic || {};
      if (s.node && s.result == null && p.look === id) c.classList.add("look");
      if (s.node && s.result == null && p.look === id && (p.dead || []).indexOf(id) >= 0) c.classList.add("dead");
      var win = s.hit || (s.result && p.look);
      if (s.result != null && win === id) c.classList.add("win");
    });
  }

  /* Chips that fly between the tree and the variable rows */
  /* The moving parts are the lesson itself and only move when Next is pressed, so they play even when
     the phone asks for less motion. The stylesheet turns off only the pulses in that case. */
  var still = false;
  function centre(r) { return [r.left + r.width / 2, r.top + r.height / 2]; }
  function fly(chip, fromRect, delay) {
    if (still || !fromRect) return;
    var a = centre(fromRect), b = centre(chip.getBoundingClientRect());
    chip.style.setProperty("transition", "none", "important");
    chip.style.transform = "translate(" + (a[0] - b[0]) + "px," + (a[1] - b[1]) + "px) scale(.85)";
    chip.style.opacity = ".4";
    chip.getBoundingClientRect();
    requestAnimationFrame(function () {
      chip.style.setProperty("transition", "transform .9s cubic-bezier(.45,0,.25,1) " + (delay || 0) + "s, opacity .5s " + (delay || 0) + "s", "important");
      chip.style.transform = "";
      chip.style.opacity = "";
    });
  }
  function treeRect(box, id) {
    var c = $('.tn[data-id="' + id + '"] > circle', box);
    return c ? c.getBoundingClientRect() : null;
  }
  function rowChips(state, name) { return $$('.lst[data-row="' + name + '"] .chip', state); }
  function animate(box, state, s) {
    var a = s.anim;
    if (!a) return;
    if (a.type === "tree") {
      rowChips(state, a.row).forEach(function (c, i) { fly(c, treeRect(box, c.dataset.id), i * 0.08); });
    } else if (a.type === "add") {
      rowChips(state, "next_nodes").forEach(function (c) {
        if (a.ids.indexOf(c.dataset.id) >= 0) fly(c, treeRect(box, c.dataset.id), 0.35);
      });
    } else if (a.type === "move") {
      var from = {};
      rowChips(state, "next_nodes").forEach(function (c) { from[c.dataset.id] = c.getBoundingClientRect(); });
      rowChips(state, "current").forEach(function (c, i) { fly(c, from[c.dataset.id], i * 0.08); });
    } else if (a.type === "reset" && a.was && a.was.length) {
      var row = $('.lst[data-row="next_nodes"]', state);
      if (!row) return;
      var ghost = chips("next_nodes", a.was, "c-nxt gone");
      row.parentNode.replaceChild(ghost, row);
      setTimeout(function () { if (ghost.isConnected) ghost.parentNode.replaceChild(row, ghost); }, still ? 0 : 750);
    }
  }

  function tracer(box, o) {
    var v = stepper(box, {
      eyebrow: o.eyebrow,
      title: function () { return "search(\"" + v.word + "\")"; },
      result: function (s) { return "Returns " + (s.result ? "True" : "False") + (s.wrong ? ", but the right answer is True." : "."); },
      draw: function (state, s) {
        state.textContent = "";
        drawWord(state, v.word, s.li);
      }
    });
    var picks = el("div", "vz-seg");
    picks.setAttribute("role", "tablist");
    o.picks.forEach(function (w) {
      var b = el("button", "pick", w);
      b.type = "button";
      b.addEventListener("click", function () { go(w); });
      picks.appendChild(b);
    });
    v.top.appendChild(picks);
    function go(w) {
      v.word = w;
      $$(".pick", picks).forEach(function (b) { b.classList.toggle("on", b.textContent === w); });
      v.load(o.steps(w));
    }
    go(o.picks[0]);
    return { go: go, box: box };
  }

  /* The idea without code: markers that move, split and disappear */
  function markerSteps(word) {
    var out = [], current = [T.root];
    function ids(list) { return list.map(nm); }
    out.push({ li: -1, cur: ["root"], anim: { type: "tree", row: "current" }, pic: { row: 0, mk: [{ at: "root" }] },
      msg: "We put one marker on the root. A marker means the search could be at that node. Before any letter, the only place is the root." });
    for (var i = 0; i < word.length; i++) {
      var letter = word[i], next = [], mk = [], says = [];
      current.forEach(function (node) {
        var here = nm(node);
        var kids = letter === "." ? Object.keys(node).filter(function (k) { return k !== "$"; }) : (letter in node ? [letter] : []);
        if (!kids.length) {
          mk.push({ at: here, kind: "dead" });
          says.push(letter === "." ? cap(said(here)) + " has no letters below it, so its marker is removed."
                                   : cap(said(here)) + " has no " + q(letter) + ", so its marker is removed.");
        }
        kids.forEach(function (k) { next.push(node[k]); mk.push({ at: nm(node[k]), from: here }); });
        if (kids.length === 1) says.push("The marker on " + said(here) + " moves to " + said(nm(node[kids[0]])) + ".");
        if (kids.length > 1) says.push("The marker on " + said(here) + " splits into " + kids.length + " markers, one for " + names(kids.map(function (k) { return node[k]; })) + ".");
      });
      var head = letter === "." ? "The letter is a dot, so every marker splits into one marker for each child below it. "
                                : "The letter is " + q(letter) + ", so every marker moves to its " + q(letter) + " child. ";
      var st = { li: i, cur: ids(next), anim: { type: "tree", row: "current" }, pic: { row: i + 1, mk: mk }, msg: head + says.join(" ") };
      if (!next.length) {
        st.cur = [];
        st.msg += " No markers are left, so no saved word can match. The answer is False.";
        st.result = false;
        out.push(st);
        return out;
      }
      st.msg += " Every marker is now one row lower.";
      out.push(st);
      current = next;
    }
    var hit = current.filter(function (n) { return "$" in n; });
    out.push({ li: word.length, result: hit.length > 0, cur: ids(current), hit: hit.length ? nm(hit[0]) : null,
      pic: { row: word.length, mk: current.map(function (n) { return { at: nm(n), kind: "$" in n ? "win" : "miss" }; }) },
      msg: "Every letter has been read. " + (hit.length
        ? "The marker on " + said(nm(hit[0])) + " sits on a node with '$', so a saved word ends there. The answer is True."
        : (current.length === 1 ? "The marker sits" : "No marker sits") + (current.length === 1 ? " on a node without '$'" : " on a node with '$'") + ", so these are only the start of longer words. The answer is False.") });
    return out;
  }
  $$('.viz[data-mode="markers"]', lesson).forEach(function (box) {
    tracer(box, {
      picks: [".og", "..t", "c..", "d.t"], steps: markerSteps,
      legend: [["mk", "A blue dot is a marker. It means the search could be at that node."], ["row", "The shaded row is where every marker is."], ["end", "A green $ marks the end of a saved word."]],
      draw: function (state, s) {
        state.appendChild(chips("current", s.cur, "c-cur"));
        markChips(state, s);
      }
    });
  });

  $$('.viz[data-mode="plain"]', lesson).forEach(function (box) {
    tracer(box, { picks: ["cat", ".og"], steps: plainSteps, eyebrow: "Watch the normal search" });
  });

  /* Three modes for search("..t"): the idea, the lists, then the code */
  var L3T = {
    "M1_00": "We start at the root. Blue shows our current position.",
    "M1_01": "The first character is a dot. A dot can match any one letter.",
    "M1_02": "The root has c and d children. Green shows both possible moves.",
    "M1_03": "We move to those children. Our positions are now c and d.",
    "M1_04": "The second character is another dot. It can match any one letter.",
    "M1_05": "The c node has only an a child. We can move to the a node.",
    "M1_06": "The d node has only an o child. We can move to the o node.",
    "M1_07": "We move to those children. Our positions are now the a node and the o node.",
    "M1_08": "The third character is t. We need a t child from each position.",
    "M1_09": "The a node has a t child. We can move to the t node.",
    "M1_10": "The o node has no t child. That path stops.",
    "M1_11": "We move forward. Our only position is now the t node.",
    "M1_12": "No characters remain. The t node marks a complete word, so the answer is True.",
    "M2_00": "Starting positions contains every possible position. Before reading anything, it contains only the root.",
    "M2_01": "The first character is a dot. We make an empty Positions reached box for the new positions.",
    "M2_02": "The root has c and d children. We add both to Positions reached.",
    "M2_03": "We checked every starting position. Positions reached now becomes Starting positions.",
    "M2_04": "In Python, we call these boxes current and next_nodes. For this dot, we start a new empty next_nodes.",
    "M2_05": "The c node has an a child. We add the a node to next_nodes.",
    "M2_06": "The d node has an o child. We add the o node, so next_nodes is [a, o].",
    "M2_07": "We checked every position in current. We set current to next_nodes, so current is [a, o].",
    "M2_08": "The next character is t. We start with a new empty next_nodes list.",
    "M2_09": "The a node has a t child. We add the t node to next_nodes.",
    "M2_10": "The o node has no t child. That path stops.",
    "M2_11": "We checked every position in current. We set current to next_nodes, so current is [t].",
    "M2_12": "No characters remain. The t node has '$', so a complete word ends there and the answer is True.",
    "M3_1Q": "Before we read the first character of '..t', which trie node is our only possible position?",
    "M3_1A": "The line `current = [self.root]` creates the list of positions before reading a character. It sets `current = [root]` because the search must start at the root.",
    "M3_2Q": "Which Python loop reads '..t' one character at a time, starting with the first dot?",
    "M3_2A": "The line `for letter in word:` loops through '..t' from left to right. On each loop, `letter` is the character being read, so its values are '.', '.', and then 't'.",
    "M3_3Q": "Before we check the character we're reading, where should we collect the positions reached after reading it?",
    "M3_3A": "The line `next_nodes = []` creates an empty list for the positions reached after reading this character. For the first dot, `current = [root]` and `next_nodes` starts as `[]`.",
    "M3_4Q": "When `current` contains possible positions, which of those positions must the code check?",
    "M3_4A": "The line `for node in current:` checks every position in `current`, one at a time. Here `current = [root]`, so `node` is the root being ringed in the trie.",
    "M3_5Q": "The character we're reading is '.', and `node` is the root. Which children of the root should be added to `next_nodes`?",
    "M3_5A": "The line `if letter == '.':` selects the dot case, and the line `for key in node:` checks every entry at the root. The line `if key != '$':` skips the end mark, while `next_nodes.append(node[key])` adds each letter child. The trie has c and d children at the root, so `next_nodes = [c, d]`.",
    "M3_6Q": "The character we're reading is 't', and `node` is the a node. Which child should be added to `next_nodes`?",
    "M3_6A": "The line `elif letter in node:` checks whether the a node has a child named t. Because that child exists, the line `next_nodes.append(node[letter])` adds the t node. The trie therefore shows `next_nodes = [t]` after the a node is checked.",
    "M3_7Q": "After every position in `current` has been checked, which list should become the positions used for the next character?",
    "M3_7A": "The line `current = next_nodes` replaces the old positions with the positions just reached. Here `next_nodes = [t]`, so `current` becomes `[t]`.",
    "M3_8Q": "When searching for 'cab', reading 'b' from the a node reaches no child. What should the code return after `current` becomes empty?",
    "M3_8A": "The line `if not current:` checks whether there are no positions left after `current = next_nodes`. Here the a node has no b child, so `next_nodes = []` and `current = []`. The line `return False` stops the search because no trie path can match 'cab'.",
    "M3_9Q": "After every character has been read, `current = [t]`. Which mark must the code find at that node to confirm that a saved word ends there?",
    "M3_9A": "The line `for node in current:` checks each final position, and the line `if '$' in node:` looks for the end mark at that node. The t node has '$', so `return True` runs. If no final position has '$', the last line `return False` runs."
  };
  var L3CODE = [
    "def search(self, word):",
    "    current = [self.root]",
    "    for letter in word:",
    "        next_nodes = []",
    "        for node in current:",
    "            if letter == '.':",
    "                for key in node:",
    "                    if key != '$':",
    "                        next_nodes.append(node[key])",
    "            elif letter in node:",
    "                next_nodes.append(node[letter])",
    "        current = next_nodes",
    "        if not current:",
    "            return False",
    "    for node in current:",
    "        if '$' in node:",
    "            return True",
    "    return False"
  ];
  var L3STEPS = [
    { li: -1, pic: { cur: ["root"] }, start: ["root"], reach: null },
    { li: 0, pic: { cur: ["root"] }, start: ["root"], reach: [] },
    { li: 0, pic: { cur: ["root"], look: "root", nxt: ["c", "d"], go: ["c", "d"] }, start: ["root"], reach: ["c", "d"] },
    { li: 0, pic: { cur: ["c", "d"] }, start: ["c", "d"], reach: null, move: true },
    { li: 1, pic: { cur: ["c", "d"] }, start: ["c", "d"], reach: [], names: true },
    { li: 1, pic: { cur: ["c", "d"], look: "c", nxt: ["ca"], go: ["ca"] }, start: ["c", "d"], reach: ["ca"] },
    { li: 1, pic: { cur: ["c", "d"], look: "d", nxt: ["ca", "do"], go: ["ca", "do"] }, start: ["c", "d"], reach: ["ca", "do"] },
    { li: 1, pic: { cur: ["ca", "do"] }, start: ["ca", "do"], reach: null, move: true },
    { li: 2, pic: { cur: ["ca", "do"] }, start: ["ca", "do"], reach: [] },
    { li: 2, pic: { cur: ["ca", "do"], look: "ca", nxt: ["cat"], go: ["cat"] }, start: ["ca", "do"], reach: ["cat"] },
    { li: 2, pic: { cur: ["ca", "do"], look: "do", dead: ["do"], nxt: ["cat"], go: ["cat"] }, start: ["ca", "do"], reach: ["cat"] },
    { li: 2, pic: { cur: ["cat"] }, start: ["cat"], reach: null, move: true },
    { li: 3, pic: { cur: ["cat"], look: "cat", mk: [{ at: "cat", kind: "win" }] }, start: ["cat"], reach: null }
  ];
  var L3BLOCKS = [
    { lines: [1], li: -1, pic: { cur: ["root"] } },
    { lines: [2], li: 0, pic: { cur: ["root"] } },
    { lines: [3], li: 0, pic: { cur: ["root"] } },
    { lines: [4], li: 0, pic: { cur: ["root"], look: "root" } },
    { lines: [5, 6, 7, 8], li: 0, ask: { cur: ["root"], look: "root" }, pic: { cur: ["root"], look: "root", nxt: ["c", "d"], go: ["c", "d"] } },
    { lines: [9, 10], li: 2, ask: { cur: ["ca", "do"], look: "ca" }, pic: { cur: ["ca", "do"], look: "ca", nxt: ["cat"], go: ["cat"] } },
    { lines: [11], li: 2, ask: { cur: ["ca", "do"], nxt: ["cat"] }, pic: { cur: ["cat"] } },
    { lines: [12, 13], li: 2, word: "cab", ask: { cur: ["ca"], look: "ca" }, pic: { cur: ["ca"], look: "ca", dead: ["ca"] } },
    { lines: [14, 15, 16, 17], li: 3, ask: { cur: ["cat"] }, pic: { cur: ["cat"], look: "cat", mk: [{ at: "cat", kind: "win" }] } }
  ];

  function threeModes(box) {
    var tabs = el("div", "l3-tabs");
    tabs.setAttribute("role", "tablist");
    var MODES = ["1. The idea", "2. The lists", "3. The code"];
    var mode = 0, at = 0;
    var tb = MODES.map(function (name, i) {
      var b = el("button", i === 0 ? "on" : "", name);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () { mode = i; at = 0; tb.forEach(function (x, j) { x.classList.toggle("on", j === i); }); show(); });
      tabs.appendChild(b);
      return b;
    });
    var word = el("div", "wd l3-word");
    var pic = el("div", "l3-pic");
    var setTrie = makeTrie(pic);
    var lists = el("div", "l3-lists");
    var cap = el("p", "l3-cap");
    cap.setAttribute("aria-live", "polite");
    var nav = el("div", "viz-nav l3-nav");
    var back = el("button", "lbtn ghost", "Back"), count = el("span", "viz-count"), next = el("button", "lbtn", "Next");
    back.type = next.type = "button";
    nav.appendChild(back); nav.appendChild(count); nav.appendChild(next);
    var code = el("pre", "snip l3-code");
    var lineEls = L3CODE.map(function (t) {
      var n = t.length - t.replace(/^ +/, "").length;
      var s = el("span", "l3-ln", t.trim());
      s.style.paddingLeft = (n / 4 * 1.2 + 1.2) + "em";
      s.style.textIndent = "-1.2em";
      code.appendChild(s);
      return s;
    });
    [tabs, word, pic, lists, code, cap, nav].forEach(function (x) { box.appendChild(x); });

    function steps() {
      if (mode < 2) return L3STEPS.map(function (s, i) { return { s: s, text: L3T["M" + (mode + 1) + "_" + (i < 10 ? "0" : "") + i] }; });
      var out = [];
      L3BLOCKS.forEach(function (b, i) {
        out.push({ b: b, k: i, q: true, text: L3T["M3_" + (i + 1) + "Q"] });
        out.push({ b: b, k: i, q: false, text: L3T["M3_" + (i + 1) + "A"] });
      });
      return out;
    }
    function drawWord(w, li) {
      word.textContent = "";
      for (var i = 0; i < w.length; i++) word.appendChild(el("span", "wd-c" + (i === li ? " on" : i < li ? " done" : ""), w[i]));
    }
    function chipBox(kind, label, pyName, ids, showName) {
      var b = el("div", "l3-box l3-" + kind + (ids ? "" : " idle"));
      var h = el("p", "l3-bl", label);
      if (showName) { h.appendChild(document.createTextNode(" ")); h.appendChild(el("code", "", pyName)); }
      b.appendChild(h);
      var items = el("div", "l3-items");
      (ids || []).forEach(function (id) { var c = el("span", "l3-chip", lbl(id)); c.dataset.id = id; items.appendChild(c); });
      if (ids && !ids.length) items.appendChild(el("span", "l3-empty", "empty"));
      b.appendChild(items);
      return b;
    }
    function drawLists(s, list, idx) {
      var was = {};
      $$(".l3-reach .l3-chip", lists).forEach(function (c) { was[c.dataset.id] = c.getBoundingClientRect(); });
      var named = list.slice(0, idx + 1).some(function (x) { return x.s.names; });
      lists.textContent = "";
      lists.appendChild(chipBox("start", "Starting positions", "current", s.start, named));
      lists.appendChild(chipBox("reach", "Positions reached", "next_nodes", s.reach, named));
      if (!s.move || still) return;
      $$(".l3-start .l3-chip", lists).forEach(function (c) {
        var r0 = was[c.dataset.id]; if (!r0) return;
        var r1 = c.getBoundingClientRect();
        c.style.setProperty("transition", "none", "important");
        c.style.transform = "translate(" + (r0.left - r1.left) + "px," + (r0.top - r1.top) + "px)";
        c.getBoundingClientRect();
        requestAnimationFrame(function () {
          c.style.setProperty("transition", "transform .7s cubic-bezier(.3,.8,.3,1)", "important");
          c.style.transform = "";
        });
      });
    }
    function show() {
      var list = steps(), st = list[at];
      box.dataset.mode = mode + 1;
      lists.hidden = mode !== 1;
      code.hidden = mode !== 2;
      cap.className = "l3-cap" + (st.q ? " q" : "") + (mode === 2 ? " long" : "");
      cap.textContent = "";
      if (st.q) cap.appendChild(el("span", "l3-think", "Think first"));
      var ct = el("span", "l3-ct");
      st.text.split("`").forEach(function (part, i) {
        if (i % 2) ct.appendChild(el("code", "", part));
        else ct.appendChild(document.createTextNode(part));
      });
      cap.appendChild(ct);
      if (mode < 2) {
        drawWord("..t", st.s.li);
        setTrie(st.s.pic);
        if (mode === 1) drawLists(st.s, list, at);
      } else {
        var b = st.b;
        drawWord(b.word || "..t", b.li);
        setTrie(st.q ? (b.ask || b.pic) : b.pic);
        var shown = [0];
        L3BLOCKS.slice(0, st.k + (st.q ? 0 : 1)).forEach(function (x) { shown = shown.concat(x.lines); });
        lineEls.forEach(function (e, i) {
          e.classList.toggle("hid", shown.indexOf(i) < 0);
          e.classList.toggle("hl", !st.q && b.lines.indexOf(i) >= 0);
        });
      }
      count.textContent = "Step " + (at + 1) + " of " + list.length;
      back.disabled = at === 0;
      next.disabled = at === list.length - 1;
      next.textContent = st.q ? "Show answer" : "Next";
    }
    back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
    next.addEventListener("click", function () { if (at < steps().length - 1) { at++; show(); } });
    show();
  }
  $$(".l3", lesson).forEach(threeModes);

  var searchViz = null;
  $$('.viz[data-mode="search"]', lesson).forEach(function (box) {
    searchViz = tracer(box, {
      picks: ["..t", ".og", "c.t", "c..", "cab", "ca", "cat."], steps: searchSteps,
      legend: [["cur", "A blue node is in current."], ["nxt", "A green node is in next_nodes."], ["look", "A thick ring marks the node being checked."], ["dead", "A red dashed ring marks a path that ended."], ["end", "A green $ marks the end of a saved word."]],
      draw: function (state, s, word) {
        letterRow(state, word, s.li);
        if (s.node) nodeRow(state, s.node);
        state.appendChild(chips("current", s.cur, "c-cur"));
        state.appendChild(chips("next_nodes", s.nxt, "c-nxt"));
        markChips(state, s);
      }
    });
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
      return "The searches with dots fail. Trace one of them by hand with the trie from Part 2, and compare it to the walkthrough in Part 4.";
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
        ta.setRangeText("    ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (e.key === "Enter") {
        var lineStart = v.lastIndexOf("\n", s - 1) + 1;
        var line = v.slice(lineStart, s);
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
    var ta = $(".ed", box), KEY = "lsn-211-editor-v2";
    var START = "class WordDictionary:\n\n    def __init__(self):\n        \n\n    def addWord(self, word):\n        \n\n    def search(self, word):\n        # 1. Start at the root.\n\n        # 2. Read one letter at a time.\n\n        # 3. Find every possible next position.\n\n        # 4. Move to those positions.\n\n        # 5. Check whether a complete word matches.\n\n";
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

  /* 9. The code key bar on phones (see codekeys.js) */
  // two rows on a phone: the first row is the common words, the second is this problem's names
  var WORDS_KEYS = [["if", "if "], ["not in", "not in "], ["for", "for "], ["return", "return "], ["node"], ["letter"], ["'$'"],
                    ["current"], ["next_nodes"], [".append(", ".append()", 1], ["True"], ["False"]];
  if (window.CodeKeys) $$(".lv", lesson).forEach(function (lv) { window.CodeKeys.attach(lv, WORDS_KEYS); });
})();
