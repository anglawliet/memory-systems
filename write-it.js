/* "Write it": the opposite of Build it. Build it asks what code we need and then shows it.
   Write it says one job in plain words, and the learner writes the code for that job.
   A loose check compares each step with the forms that step accepts. At the end, the
   learner's whole function runs on the lesson's real tests in the browser (Python in a worker,
   shared with practice.js).
   A lesson turns it on with <script type="application/json" class="wi-data"> (see build_pages.py).
   The data holds the question, the given lines, and the steps. Each step has:
     ask     the question I ask myself (the same words as Build it)
     do      the one job in plain words
     indent  how far in the step's code sits in the function (spaces)
     names   the names this step creates; later steps use them, so other names are not accepted
     answer  the code shown by "Show answer"
     what    one short phrase per line of the first form, for the hints
     forms   accepted ways to write the step. A form is a list of lines; a line is
             [indent level, accepted text, other accepted text, ...]. $a and $b stand for
             any loop name, used the same way on every line. */
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
  function btn(cls, text) { var b = el("button", cls, text); b.type = "button"; return b; }
  function color(line) { return window.CodeKeys && window.CodeKeys.colorLine ? window.CodeKeys.colorLine(line) : esc(line); }
  var TOUCH = window.matchMedia && matchMedia("(pointer: coarse)").matches;

  /* ---------- The loose check ---------- */
  // one line of code becomes its tokens joined by single spaces, so spacing never matters
  var TOK = /("(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|\d+(?:\.\d+)?|[A-Za-z_$]\w*|\*\*=?|\/\/=?|[-+*\/%<>=!]=|\S)/g;
  function tokens(line) {
    var out = [], m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(line))) {
      var t = m[1];
      if (t === "#") break;
      // 'A' and "A" are the same string
      if (t.charAt(0) === "'" && t.indexOf('"') < 0) t = '"' + t.slice(1, -1) + '"';
      out.push(t);
    }
    return out;
  }
  function norm(line) {
    var s = tokens(line).join(" ");
    // x = x + 1 is the same as x += 1
    s = s.replace(/^(.+?) = \1 ([-+*]) (.+)$/, "$1 $2= $3");
    // dict() and list() are the same as {} and []
    s = s.replace(/\bdict \( \)/g, "{ }").replace(/\blist \( \)/g, "[ ]");
    // in an if or while, "len(x) > 0", "len(x)" and "x != []" all mean "x is not empty"
    if (/^(if|elif|while) /.test(s)) {
      s = s.replace(/\blen \( ([A-Za-z_]\w*) \) (?:> 0|!= 0|>= 1)/g, "$1")
           .replace(/\b0 < len \( ([A-Za-z_]\w*) \)/g, "$1")
           .replace(/\blen \( ([A-Za-z_]\w*) \)/g, "$1")
           .replace(/\b([A-Za-z_]\w*) != (?:\[ \]|\{ \})/g, "$1");
    }
    return s;
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var REX = {};
  function lineRe(alt) {
    if (REX[alt]) return REX[alt];
    var names = [];
    var src = "^" + norm(alt).split(/(\$[a-z])/).map(function (p) {
      if (/^\$[a-z]$/.test(p)) { names.push(p); return "([A-Za-z_]\\w*)"; }
      return reEsc(p);
    }).join("") + "$";
    return (REX[alt] = { re: new RegExp(src), names: names });
  }
  // does my line match one accepted text of this answer line? Loop names must stay the same.
  function matchLine(mine, line, binds) {
    for (var k = 1; k < line.length; k++) {
      var r = lineRe(line[k]), m = r.re.exec(mine);
      if (!m) continue;
      var nb = {}, ok = true;
      Object.keys(binds || {}).forEach(function (x) { nb[x] = binds[x]; });
      r.names.forEach(function (n, i) {
        if (!binds) return;
        if (nb[n] && nb[n] !== m[i + 1]) ok = false;
        nb[n] = m[i + 1];
      });
      if (ok) return nb;
    }
    return null;
  }
  // my code: the lines that hold code, each with its indent level inside the step
  function parse(text) {
    var out = [];
    String(text).replace(/\t/g, "    ").split("\n").forEach(function (raw, i) {
      var t = raw.trim();
      if (!t || t.charAt(0) === "#") return;
      out.push({ raw: t, no: i + 1, ind: raw.match(/^ */)[0].length, n: norm(raw) });
    });
    var stack = [];
    out.forEach(function (l) {
      if (!stack.length) stack.push(l.ind);
      if (l.ind > stack[stack.length - 1]) stack.push(l.ind);
      else while (stack.length > 1 && l.ind < stack[stack.length - 1]) stack.pop();
      l.lv = stack.length - 1;
    });
    return out;
  }
  function accepts(mine, form) {
    if (mine.length !== form.length) return false;
    var binds = {};
    for (var i = 0; i < form.length; i++) {
      if (mine[i].lv !== form[i][0]) return false;
      binds = matchLine(mine[i].n, form[i], binds);
      if (!binds) return false;
    }
    return true;
  }
  // longest run of lines that match in order, ignoring indents and loop names
  function align(mine, form) {
    var n = mine.length, m = form.length, L = [], i, j;
    for (i = 0; i <= n; i++) { L.push([]); for (j = 0; j <= m; j++) L[i].push(0); }
    function eq(a, b) { return !!matchLine(mine[a].n, form[b], null); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = eq(i, j) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var pairs = [], a = {}, b = {};
    i = 0; j = 0;
    while (i < n && j < m) {
      if (eq(i, j)) { pairs.push([i, j]); a[i] = j; b[j] = i; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else j++;
    }
    return { n: pairs.length, pairs: pairs, mine: a, form: b };
  }
  var WORD = /^[A-Za-z_]\w*$|^\d/;
  function words(n) { return n.split(" ").filter(function (w) { return WORD.test(w); }); }
  function list(ws) {
    var c = ws.slice(0, 3).map(function (w) { return "`" + w + "`"; });
    return c.length < 2 ? c.join("") : c.slice(0, -1).join(", ") + " and " + c[c.length - 1];
  }
  /* What is off, in plain words, without printing the answer.
     It names the line, says what that line should do, and which words differ. */
  function hint(step, text, vocab) {
    var mine = parse(text);
    if (!mine.length) return "Type the code for this step first. Lines that start with # are notes, and the check skips them.";
    var best = null;
    step.forms.forEach(function (f, fi) {
      var a = align(mine, f);
      var score = a.n * 10 - Math.abs(f.length - mine.length) - (fi ? 0.5 : 0);
      if (!best || score > best.score) best = { f: f, fi: fi, a: a, score: score };
    });
    var f = best.f, a = best.a;
    var what = function (j) { return best.fi === 0 && step.what && step.what[j] ? step.what[j] : ""; };
    if (a.n === f.length && a.n === mine.length) {
      // every line matches, so the indents or the loop names are off
      for (var i = 0; i < f.length; i++) {
        if (mine[i].lv < f[i][0]) return "Line " + mine[i].no + " belongs inside the line above it, so indent it one more step. Put the cursor at the start of the line and press Tab, or the \u21e5 key on a phone.";
        if (mine[i].lv > f[i][0]) return "Line " + mine[i].no + " is indented too far. Move it one step to the left, so it lines up with the line it belongs next to.";
      }
      return "Each line is right on its own, but a loop name changes between lines. Use the same name on every line.";
    }
    var j = -1, k = -1;
    for (var x = 0; x < f.length; x++) if (!(x in a.form)) { j = x; break; }
    for (var y = 0; y < mine.length; y++) if (!(y in a.mine)) { k = y; break; }
    var need = f.length === 1 ? "1 line" : f.length + " lines", have = mine.length === 1 ? "1 line" : mine.length + " lines";
    if (j >= 0 && k >= 0) {
      var exp = norm(f[j][1]), got = mine[k].n;
      var ew = words(exp).filter(function (w) { return w.charAt(0) !== "$"; }), gw = words(got);
      var loose = /\$[a-z]/.test(exp);
      var missing = ew.filter(function (w, i) { return gw.indexOf(w) < 0 && ew.indexOf(w) === i; });
      var extra = gw.filter(function (w, i) { return ew.indexOf(w) < 0 && gw.indexOf(w) === i && (!loose || vocab[w]); });
      var head = "Line " + mine[k].no + " does not match yet." + (what(j) ? " This line " + what(j) + "." : "");
      var named = missing.filter(function (w) { return step.allNames.indexOf(w) >= 0; });
      if (named.length && extra.length && extra.every(function (w) { return !vocab[w]; }))
        return head + " Use the name " + list(named) + ", because the later steps use that name.";
      if (missing.length && extra.length) return head + " You wrote " + list(extra) + ", and this line needs " + list(missing) + " instead.";
      if (missing.length) return head + " The line still needs " + list(missing) + ".";
      if (extra.length) return head + " This line does not need " + list(extra) + ".";
      return head + " The words are right, so check the symbols and their order: the minus sign, the brackets ( ) and [ ], and the colon at the end.";
    }
    if (j >= 0) {
      if (what(j)) return "Your step has " + have + ", and this step needs " + need + ". You still need the line that " + what(j) + ".";
      var w = words(norm(f[j][1])).filter(function (v) { return v.charAt(0) !== "$"; });
      return "Your step has " + have + ", and this step needs " + need + ". The missing line uses " + list(w) + ".";
    }
    return "Line " + mine[k].no + " is not part of this step. Remove it, or check whether it belongs to a later step.";
  }

  /* ---------- Putting the function together ---------- */
  function dedent(text) {
    var ls = String(text).replace(/\t/g, "    ").replace(/\s+$/, "").split("\n");
    while (ls.length && !ls[0].trim()) ls.shift();
    var min = Infinity;
    ls.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (min === Infinity) min = 0;
    return ls.map(function (l) { return l.trim() ? l.slice(min).replace(/\s+$/, "") : ""; });
  }
  function pad(n) { return new Array(n + 1).join(" "); }

  /* ---------- One lesson's Write it card ---------- */
  function setup(lesson, data) {
    var cfgEl = $("script.lsn-cfg", lesson), cfg = cfgEl ? JSON.parse(cfgEl.textContent) : null;
    var steps = data.steps, N = steps.length;
    var KEY = "wi-" + lesson.dataset.lesson + "-v1";
    var given = data.given.replace(/\n+$/, "").split("\n");
    // every name the answer creates, so a hint can say "use the name counts"
    var allNames = [];
    steps.forEach(function (s) { (s.names || []).forEach(function (n) { if (allNames.indexOf(n) < 0) allNames.push(n); }); });
    steps.forEach(function (s) { s.allNames = allNames; });
    // the words of the whole answer, so a hint never calls a loop name "not needed"
    var vocab = {};
    [data.given].concat(steps.map(function (s) { return s.answer; })).forEach(function (t) {
      t.split("\n").forEach(function (l) { words(norm(l)).forEach(function (w) { vocab[w] = 1; }); });
    });
    "if for while in not and or return del else elif True False None".split(" ").forEach(function (w) { vocab[w] = 1; });

    // saved progress: one entry per step, and the step on screen
    var st = null;
    try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { st = null; }
    if (!st || !st.s || st.s.length !== N) st = { at: 0, s: steps.map(function () { return { text: "", done: "", acc: "", tries: 0, shown: false }; }) };
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage may be blocked or full */ } }
    function firstOpen() { for (var i = 0; i < N; i++) if (!st.s[i].done) return i; return N; }
    st.at = Math.min(Math.max(0, st.at | 0), firstOpen());

    function assemble(upto) {
      var out = given.slice(), ranges = [];
      for (var i = 0; i < upto; i++) {
        var ls = dedent(st.s[i].acc).map(function (l) { return l ? pad(steps[i].indent) + l : ""; });
        ranges.push([out.length + 1, out.length + ls.length]);
        out = out.concat(ls);
      }
      return { lines: out, ranges: ranges };
    }

    /* the card */
    var box = el("div", "wi");
    var intro = el("p", "wi-intro", "Each step tells you one job in plain words. You write the code for that job, and the check tells you whether it does the job. When every step is done, your whole function runs on the real tests.");
    var q = el("div", "wi-q");
    q.appendChild(el("h5", "wi-qh", "The question"));
    var qp = el("p"); qp.innerHTML = rich(data.question); q.appendChild(qp);
    if (data.example) {
      var ex = el("pre", "wi-ex wi-pre");
      data.example.forEach(function (l) { var r = el("div", "wi-exl"); r.innerHTML = color(l); ex.appendChild(r); });
      q.appendChild(ex);
    }
    if (data.example_note) q.appendChild(el("p", "wi-exn", data.example_note));
    var card = el("div", "wi-card");
    var top = el("div", "wi-top"), stepN = el("span", "wi-stepn"), dots = el("span", "wi-dots");
    top.appendChild(stepN); top.appendChild(dots);
    var ask = el("h4", "wi-ask"), doP = el("p", "wi-do");
    var ed = el("div", "wi-ed");
    var bar = el("div", "wi-bar");
    bar.innerHTML = '<span class="wi-dots3"><i></i><i></i><i></i></span><span>Python code</span>';
    var code = el("pre", "wi-code wi-pre"), slot = el("div", "wi-slot");
    var ta = el("textarea", "wi-ta syn");
    ta.setAttribute("spellcheck", "false"); ta.setAttribute("autocapitalize", "off");
    ta.setAttribute("autocomplete", "off"); ta.setAttribute("autocorrect", "off");
    ta.setAttribute("aria-label", "Your code for this step");
    slot.appendChild(ta);
    ed.appendChild(bar); ed.appendChild(code); ed.appendChild(slot);
    var fb = el("div", "wi-fb"); fb.setAttribute("aria-live", "polite");
    var nav = el("div", "wi-nav"), back = btn("lbtn ghost wi-back", "Back"), go = btn("lbtn wi-go", "Check");
    nav.appendChild(back); nav.appendChild(go);
    card.appendChild(top); card.appendChild(ask); card.appendChild(doP); card.appendChild(ed); card.appendChild(fb); card.appendChild(nav);
    box.appendChild(intro); box.appendChild(q); box.appendChild(card);

    // a measuring line, so the step's box can start where its indent puts it
    var chPx = 9;
    function measure() {
      var probe = el("span", "wi-probe", "0000000000");
      code.appendChild(probe);
      chPx = probe.getBoundingClientRect().width / 10 || chPx;
      probe.remove();
    }

    // read-only code rows: line number, then the code with half-width indents and clean wrapping
    function row(text, n, cls) {
      var r = el("div", "wi-l" + (cls ? " " + cls : ""));
      r.appendChild(el("span", "wi-n", n == null ? "" : String(n)));
      var c = el("span", "wi-c");
      var ind = text.match(/^ */)[0].length, half = Math.floor(ind / 2), body = text.slice(ind);
      // a long line may break only after "(" or ", ", or before a keyword such as and, or, for, in
      // and import, and the rest hangs 2 places further in. A comment line wraps between its words.
      var parts = body.charAt(0) === "#" ? [body]
        : body.replace(/(\(|, )/g, "$1\u0000").replace(/ (?=(?:and|or|if|else|for|in|import) )/g, " \u0000").split("\u0000");
      c.innerHTML = pad(half) + (body.charAt(0) === "#" ? color(body) : parts.map(function (p) { return '<span class="wi-nb">' + color(p) + "</span>"; }).join("<wbr>"));
      c.style.paddingLeft = (half + 2) + "ch";
      c.style.textIndent = -(half + 2) + "ch";
      r.appendChild(c);
      return r;
    }
    function codeRows(target, lines, kept, from) {
      target.textContent = "";
      lines.forEach(function (l, i) { target.appendChild(row(l, (from || 1) + i, kept && kept[i] ? "kept" : "")); });
    }

    function keptMap(asm) {
      var k = {};
      asm.ranges.forEach(function (r, i) { if (st.s[i].done === "kept") for (var n = r[0]; n <= r[1]; n++) k[n - 1] = 1; });
      return k;
    }

    var phase = "", runRes = null, clearArm = false;
    function show(scroll) {
      var at = st.at, final = at >= N;
      stepN.textContent = final ? "Last step: run the tests" : "Step " + (at + 1) + " of " + N;
      var d = "";
      for (var i = 0; i <= N; i++) d += '<i class="' + (i === at ? "cur" : i < N && st.s[i].done ? "done" : "") + '"></i>';
      dots.innerHTML = d;
      var asm = assemble(final ? N : at);
      codeRows(code, asm.lines, keptMap(asm));
      fb.textContent = "";
      fb.className = "wi-fb";
      back.disabled = at === 0;
      clearArm = false;
      if (final) {
        ask.textContent = "Run your whole function";
        doP.textContent = "The code above is your function, built from your own steps. Run it on the real tests to see whether every piece works together.";
        slot.hidden = true;
        go.textContent = "Run the tests";
        if (runRes) results(runRes);
      } else {
        var s = steps[at], ss = st.s[at];
        ask.textContent = s.ask;
        doP.innerHTML = rich(s.do);
        slot.hidden = false;
        if (ta.value !== ss.text) ta.value = ss.text;
        ta.rows = Math.max(2, (s.forms[0] || []).length + 1);
        ta.dataset.ln = String(asm.lines.length + 1);
        ta.dataset.title = "Step " + (at + 1) + " of " + N + ". " + s.ask;
        ta.placeholder = "# write step " + (at + 1) + " here";
        measure();
        var off = Math.floor(s.indent / 2) * chPx;
        slot.style.setProperty("--wi-off", off + "px");
        if (ss.done && ss.text === ss.acc) say(ss.done === "ok" ? "ok" : "kept");
        else if (ss.tries && ss.hint) say("no", ss.hint);
        updateGo();
      }
      if (window.CodeKeys && window.CodeKeys.paint) window.CodeKeys.paint(ta);
      if (scroll) {
        var r = card.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 80, behavior: "smooth" });
      }
    }
    function updateGo() {
      if (st.at >= N) return;
      var ss = st.s[st.at];
      go.textContent = ss.done && ss.text === ss.acc ? (st.at === N - 1 ? "Go to the tests" : "Next step") : "Check";
    }
    // the feedback under the editor: correct, kept, or a hint with Show answer and Keep mine
    function say(kind, msg) {
      fb.textContent = "";
      fb.className = "wi-fb " + kind;
      var ss = st.s[st.at], s = steps[st.at];
      if (kind === "ok") { fb.appendChild(el("p", "wi-ok", "Correct. This step does its job, so you can go on.")); return; }
      if (kind === "kept") { fb.appendChild(el("p", "wi-kept", "You kept your own version of this step. The tests at the end will show whether it works.")); return; }
      var p = el("p", "wi-no");
      p.innerHTML = "<b>Not yet.</b> " + rich(msg);
      fb.appendChild(p);
      // Show answer and Keep mine appear only after a real wrong try
      if (!ss.tries) return;
      var row2 = el("div", "wi-more"), showB = btn("lbtn ghost wi-show", ss.shown ? "Hide answer" : "Show answer"), keep = btn("lbtn ghost wi-keep", "Keep mine");
      row2.appendChild(showB); row2.appendChild(keep);
      fb.appendChild(row2);
      if (ss.shown) answerBox();
      showB.addEventListener("click", function () {
        ss.shown = !ss.shown; save();
        say("no", msg);
      });
      keep.addEventListener("click", function () {
        ss.done = "kept"; ss.acc = ss.text; save();
        next();
      });
      function answerBox() {
        var a = el("div", "wi-ans");
        a.appendChild(el("p", "wi-ans-h", "One answer is below. Type it into the box yourself, then press Check. Typing it helps you remember it."));
        var c = el("pre", "wi-code wi-pre wi-anscode");
        dedent(s.answer).forEach(function (l) { c.appendChild(row(l, null)); });
        a.appendChild(c);
        fb.appendChild(a);
      }
    }
    function check() {
      var ss = st.s[st.at], s = steps[st.at];
      ss.text = ta.value;
      var mine = parse(ss.text);
      var ok = mine.length && s.forms.some(function (f) { return accepts(mine, f); });
      if (ok) {
        ss.done = "ok"; ss.acc = ss.text; ss.hint = ""; save();
        say("ok"); updateGo();
        runRes = null;
        return;
      }
      if (!mine.length) { say("no", hint(s, ss.text, vocab)); return; }
      ss.tries++; ss.hint = hint(s, ss.text, vocab);
      if (ss.done) { ss.done = ""; }
      save();
      say("no", ss.hint);
      updateGo();
    }
    function next() {
      st.at = Math.min(N, st.at + 1);
      save(); show(true);
    }
    go.addEventListener("click", function () {
      if (st.at >= N) { run(); return; }
      var ss = st.s[st.at];
      ss.text = ta.value;
      if (ss.done && ss.text === ss.acc) next();
      else check();
    });
    back.addEventListener("click", function () {
      if (st.at > 0) { st.at--; save(); show(true); }
    });
    ta.addEventListener("input", function () {
      var ss = st.s[st.at];
      if (!ss) return;
      ss.text = ta.value; save();
      // a changed step needs a new check before Next
      if (ss.done && ss.text !== ss.acc && /ok|kept/.test(fb.className)) { fb.textContent = ""; fb.className = "wi-fb"; }
      updateGo();
    });
    // laptop keys like an editor: Tab indents, Enter keeps the indent and goes one step deeper after a colon,
    // and Ctrl or Cmd with Enter runs the check
    ta.addEventListener("keydown", function (e) {
      var s = ta.selectionStart, v = ta.value;
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go.click(); return; }
      if (e.key === "Tab") {
        e.preventDefault();
        var ls = v.lastIndexOf("\n", s - 1) + 1;
        if (e.shiftKey) {
          var n = Math.min(4, v.slice(ls).match(/^ */)[0].length);
          if (n) { ta.setRangeText("", ls, ls + n); ta.setSelectionRange(Math.max(ls, s - n), Math.max(ls, s - n)); }
        } else ta.setRangeText("    ", s, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (e.key === "Enter") {
        var line = v.slice(v.lastIndexOf("\n", s - 1) + 1, s), ind = line.match(/^ */)[0];
        if (/:\s*$/.test(line)) ind += "    ";
        e.preventDefault();
        ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    /* the final run: the learner's own function on the real tests */
    function run() {
      if (!cfg || !window.MSPractice) { fb.textContent = ""; fb.appendChild(el("p", "wi-no", "The tests could not load on this page.")); return; }
      var asm = assemble(N), src = asm.lines.join("\n") + "\n";
      go.disabled = true;
      fb.textContent = ""; fb.className = "wi-fb";
      var status = el("p", "wi-status", "Python is loading. The first time takes a few seconds.");
      fb.appendChild(status);
      window.MSPractice.runPython(src, cfg, status).then(function (res) {
        runRes = { res: res, src: src };
        results(runRes);
      }, function (err) {
        if (err.message === "slow") { runRes = { slow: true }; results(runRes); return; }
        fb.textContent = "";
        fb.appendChild(el("p", "wi-no", "Python could not start. Check your internet connection and try again."));
      }).then(function () { go.disabled = false; });
    }
    function stepOf(line, asm) {
      for (var i = 0; i < asm.ranges.length; i++) if (line >= asm.ranges[i][0] && line <= asm.ranges[i][1]) return i;
      return -1;
    }
    function py(v) { return window.MSPractice && window.MSPractice.py ? window.MSPractice.py(v) : JSON.stringify(v); }
    // a test call breaks only after ", ", never inside a value
    function callHtml(call) { return call.replace(/, /g, ", \u0000").split("\u0000").map(function (p) { return '<span class="wi-nb">' + esc(p) + "</span>"; }).join("<wbr>"); }
    function results(rr) {
      var res = rr.res, asm = assemble(N);
      fb.textContent = "";
      fb.className = "wi-fb";
      var kept = [], target = 0;
      st.s.forEach(function (s, i) { if (s.done === "kept") kept.push(i + 1); });
      if (kept.length) target = kept[0];
      var keptTxt = kept.length ? (kept.length === 1 ? "step " + kept[0] : "steps " + kept.slice(0, -1).join(", ") + " and " + kept[kept.length - 1]) : "";
      if (rr.slow) {
        fb.appendChild(el("p", "wi-no", "Your function ran for more than 8 seconds, so I stopped it. A loop may never end. Check that each pass of the while loop moves a task out of heap or waiting, and that a waiting task comes back at a time the loop still reaches."));
        if (kept.length) fb.appendChild(el("p", "wi-tip", "You kept your own version of " + keptTxt + ", so check " + (kept.length === 1 ? "that step" : "those steps") + " first."));
      } else if (res.load) {
        var where = res.line ? " on line " + res.line + (stepOf(res.line, asm) >= 0 ? ", in step " + (stepOf(res.line, asm) + 1) : "") : "";
        fb.appendChild(el("p", "wi-no", "Your function did not run. Python stopped" + where + " with " + res.load + "."));
        if (kept.length) fb.appendChild(el("p", "wi-tip", "You kept your own version of " + keptTxt + ", so check " + (kept.length === 1 ? "that step" : "those steps") + " first."));
        var ls = res.line ? stepOf(res.line, asm) : -1;
        if (ls >= 0) target = ls + 1;
      } else {
        var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
        fb.appendChild(el("p", pass === all ? "wi-ok" : "wi-sum", pass === all ? "All " + all + " tests pass. You wrote the whole function yourself, one step at a time." : pass + " of " + all + " tests pass."));
        if (pass < all) {
          var crash = res.tests.filter(function (r) { return r.err && r.line; })[0];
          var tip = "";
          if (crash && stepOf(crash.line, asm) >= 0) {
            var si = stepOf(crash.line, asm) + 1;
            tip = "A test crashed on line " + crash.line + ", which is in step " + si + "." + (kept.indexOf(si) >= 0 ? " You kept your own version of that step, so start there." : "");
            target = si;
          } else if (kept.length) tip = "You kept your own version of " + keptTxt + ". A kept step is the first place to look.";
          else tip = "Pick the first failing test and trace it by hand, one slot at a time.";
          fb.appendChild(el("p", "wi-tip", tip));
        }
        var ul = el("ul", "wi-tests");
        res.tests.forEach(function (r) {
          var t = cfg.tests[r.id], k = r.ok ? t.steps.length - 1 : r.step, call = t.steps[k][0], want = t.steps[k][1];
          var li = el("li", r.ok ? "pass" : "fail");
          var c = el("pre", "wi-call wi-pre"); c.innerHTML = callHtml(call);
          var g = el("div", "wi-got");
          g.appendChild(el("span", "wi-badge", r.ok ? "Pass" : "Fail"));
          var txt = r.ok ? "gives " + py(want)
            : r.err ? "crashed with " + r.err + (r.line ? " on line " + r.line + (stepOf(r.line, asm) >= 0 ? " (step " + (stepOf(r.line, asm) + 1) + ")" : "") : "")
            : "gave " + r.got + ", expected " + py(want);
          g.appendChild(el("span", "wi-gt", txt));
          li.appendChild(c); li.appendChild(g);
          ul.appendChild(li);
        });
        fb.appendChild(ul);
      }
      var again = el("div", "wi-again"), over = btn("lbtn ghost wi-over", "Start over");
      var allPass = !rr.slow && !res.load && res.tests.every(function (r) { return r.ok; });
      if (target && !allPass) {
        var to = btn("lbtn wi-to", "Go to step " + target);
        to.addEventListener("click", function () { st.at = target - 1; save(); show(true); });
        again.appendChild(to);
      }
      again.appendChild(over);
      fb.appendChild(again);
      over.addEventListener("click", function () {
        // one tap could wipe every step, so the first tap asks
        if (!clearArm) { clearArm = true; over.textContent = "Tap again to clear every step"; return; }
        st = { at: 0, s: steps.map(function () { return { text: "", done: "", acc: "", tries: 0, shown: false }; }) };
        runRes = null; save(); ta.value = ""; show(true);
      });
    }

    // a phone redraws the step box when the screen turns or the font loads
    function redraw() { if (st.at < N) { measure(); slot.style.setProperty("--wi-off", Math.floor(steps[st.at].indent / 2) * chPx + "px"); } }
    window.addEventListener("resize", redraw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

    return { box: box, show: show, ta: ta };
  }

  /* ---------- Where the card goes ---------- */
  $$(".lsn[data-lesson]").forEach(function (lesson) {
    var src = $("script.wi-data", lesson);
    if (!src) return;
    var data;
    try { data = JSON.parse(src.textContent); } catch (e) { return; }
    var w = setup(lesson, data);
    var tabs = $(".lv-tabs", lesson);
    var lv = el("div", "lv wi-lv");
    lv.dataset.lv = "6";
    lv.appendChild(w.box);
    if (tabs) {
      // the practice tabs: Write it sits right after Build it
      var levels = $$(".lv", lesson), last = levels[levels.length - 1];
      lv.hidden = true;
      last.parentNode.insertBefore(lv, last.nextSibling);
      var t = btn("", "Write it");
      t.dataset.lv = "6";
      tabs.appendChild(t);
      $$("button", tabs).forEach(function (b) {
        b.addEventListener("click", function () {
          var mine = b === t;
          if (mine) {
            $$("button", tabs).forEach(function (x) { x.classList.toggle("on", x === t); });
            $$(".lv", lesson).forEach(function (l) { l.hidden = l !== lv; });
            w.show(false);
          } else lv.hidden = true;
        });
      });
    } else {
      src.parentNode.insertBefore(lv, src.nextSibling);
    }
    // the word keys on a phone: the lesson's own keys, or the names its steps create
    var keys = data.keys || [];
    if (!keys.length) data.steps.forEach(function (s) { (s.names || []).forEach(function (n) { if (!keys.some(function (k) { return k[0] === n; })) keys.push([n]); }); });
    keys = keys.concat([["+= 1", " += 1"], ["return", "return "], ["while", "while "], ["if", "if "], ["for", "for "], ["in", "in "]]);
    if (window.CodeKeys) window.CodeKeys.attach(lv, keys);
    w.show(false);
  });
})();
