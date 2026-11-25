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
             any loop name, used the same way on every line.
     pre     (optional) fixed lines that come right before the step, such as a method's def line.
             They show in the code so far once the learner reaches the step.
     pos     (optional) where the step goes in the finished code, as a number to sort by. The
             default is the step's own order. A step that goes back into an earlier method (like
             the loop in __init__ that Build it writes last) gets a smaller pos, and the code that
             comes after it shows in its own editor under the learner's box.
   The data may also hold slow_tip (what to check when the code runs too long) and trace_tip
   (what to do with a failing test). */
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
  /* Indent levels, the way Python reads them, but forgiving about odd space counts.
     A tab counts as 4 spaces. A line indented deeper than a line that ends with a colon is one
     level inside it, whether the learner typed 2, 3, 4 or 5 spaces. A deeper line after a line
     without a colon stays at that line's level. A line that moves back left lines up with the
     nearest line above it that is not deeper. */
  function setLevels(ls) {
    ls.forEach(function (l, i) {
      var p = null;
      for (var k = i - 1; k >= 0; k--) if (ls[k].ind <= l.ind) { p = ls[k]; break; }
      var prev = i ? ls[i - 1] : null;
      if (!prev) l.lv = 0;
      else if (l.ind > prev.ind) l.lv = /:$/.test(prev.n) ? prev.lv + 1 : prev.lv;
      else if (!p) l.lv = 0;
      else l.lv = p.ind === l.ind || !/:$/.test(p.n) ? p.lv : p.lv + 1;
    });
    return ls;
  }
  function rawLines(text) {
    return String(text).replace(/\t/g, "    ").split("\n").map(function (raw, i) {
      var t = raw.trim();
      return { raw: t, no: i + 1, ind: raw.match(/^ */)[0].length, n: norm(raw), code: !!t && t.charAt(0) !== "#" };
    });
  }
  // my code: the lines that hold code, each with its indent level inside the step
  function parse(text) {
    return setLevels(rawLines(text).filter(function (l) { return l.code; }));
  }
  /* The step rebuilt with clean indents: 4 spaces for each level, counted from the step's own
     first level. Notes (# lines) take the level of the code line under them. This is what goes
     into the function, so a step typed with 2 or 5 spaces still runs. */
  function tidy(text) {
    var all = rawLines(text);
    setLevels(all.filter(function (l) { return l.code; }));
    for (var i = all.length - 1, nextLv = null; i >= 0; i--) {
      if (all[i].code) nextLv = all[i].lv;
      else if (all[i].raw) all[i].lv = nextLv;
    }
    var last = 0;
    var out = all.map(function (l) {
      if (!l.raw) return "";
      if (l.lv == null) l.lv = last;
      last = l.lv;
      return pad(4 * l.lv) + l.raw;
    });
    while (out.length && !out[0]) out.shift();
    while (out.length && !out[out.length - 1]) out.pop();
    return out.join("\n");
  }
  function pad(n) { return new Array(n + 1).join(" "); }
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
        if (mine[i].lv === f[i][0]) continue;
        // the line this one belongs inside, or the line it should line up with
        var par = -1, sib = -1;
        for (var q = i - 1; q >= 0; q--) {
          if (par < 0 && f[q][0] === f[i][0] - 1) par = q;
          if (sib < 0 && f[q][0] === f[i][0]) sib = q;
        }
        if (mine[i].lv < f[i][0]) {
          var kw = par >= 0 ? (mine[par].raw.match(/^[A-Za-z_]+/) || [""])[0] : "";
          return "Line " + mine[i].no + " should be inside " + (par >= 0 ? (kw ? "the `" + kw + "` on line " : "line ") + mine[par].no : "the line above it") +
            ", one level deeper. Put the cursor at the start of line " + mine[i].no + " and press Tab, or the \u21e5 key on a phone.";
        }
        return "Line " + mine[i].no + " should " + (sib >= 0 ? "line up with line " + mine[sib].no : "start at the left edge of the box") +
          ", one level less deep. Put the cursor on line " + mine[i].no + " and press Shift and Tab, or the \u21e4 key on a phone.";
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

  /* ---------- Editor keys, like CoderPad ----------
     Copy, paste, cut, undo and select all are the text box's own. Tab and Shift+Tab indent or
     un-indent every selected line, Enter keeps the indent and goes one level deeper after a colon.
     Changes go through insertText, so undo (Ctrl or Cmd + Z) still works after them. */
  function insert(ta, text) {
    var ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch (e) { ok = false; }
    if (!ok) { ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input", { bubbles: true })); }
  }
  function editorKeys(ta, onRun) {
    ta.addEventListener("keydown", function (e) {
      if (ta.readOnly) return;
      var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (onRun) onRun(); return; }
      if (e.key === "Tab") {
        e.preventDefault();
        var ls = v.lastIndexOf("\n", s - 1) + 1, le = v.indexOf("\n", Math.max(s, en - (en > s && v.charAt(en - 1) === "\n" ? 1 : 0)));
        if (le < 0) le = v.length;
        var multi = v.slice(s, en).indexOf("\n") >= 0;
        if (!e.shiftKey && !multi) { insert(ta, "    "); return; }
        var block = v.slice(ls, le), lines = block.split("\n");
        var out = lines.map(function (l) {
          if (!e.shiftKey) return l.trim() ? "    " + l : l;
          return l.replace(/^( {1,4}|\t)/, "");
        }).join("\n");
        if (out === block) return;
        ta.setSelectionRange(ls, le);
        insert(ta, out);
        ta.setSelectionRange(ls, ls + out.length);
      } else if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
        var line = v.slice(v.lastIndexOf("\n", s - 1) + 1, s), ind = line.match(/^[ \t]*/)[0];
        if (/:\s*(#.*)?$/.test(line)) ind += "    ";
        e.preventDefault();
        insert(ta, "\n" + ind);
      }
    });
  }

  /* ---------- One lesson's Write it card ---------- */
  function setup(lesson, data) {
    var cfgEl = $("script.lsn-cfg", lesson), cfg = cfgEl ? JSON.parse(cfgEl.textContent) : null;
    var steps = data.steps, N = steps.length;
    var KEY = "wi-" + lesson.dataset.lesson + "-v1";
    var given = data.given.replace(/\n+$/, "");
    // a lesson that builds a class says "class" where the others say "function"
    var WHAT = /^class /m.test(given) ? "class" : "function";
    // every name the answer creates, so a hint can say "use the name counts"
    var allNames = [];
    steps.forEach(function (s) { (s.names || []).forEach(function (n) { if (allNames.indexOf(n) < 0) allNames.push(n); }); });
    steps.forEach(function (s) { s.allNames = allNames; });
    // the words of the whole answer, so a hint never calls a loop name "not needed"
    var vocab = {};
    [data.given].concat(steps.map(function (s) { return s.answer + "\n" + (s.pre || ""); })).forEach(function (t) {
      t.split("\n").forEach(function (l) { words(norm(l)).forEach(function (w) { vocab[w] = 1; }); });
    });
    "if for while in not and or return del else elif True False None".split(" ").forEach(function (w) { vocab[w] = 1; });

    /* Saved progress. Each step keeps what was typed (text) and the accepted, tidied version (acc).
       "head" holds code the learner edited by hand in the code-so-far editor: its text covers the
       given lines and every step before head.upto. */
    function fresh() { return { at: 0, head: null, s: steps.map(function () { return { text: "", done: "", acc: "", tries: 0, shown: false }; }) }; }
    var st = null;
    try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { st = null; }
    if (!st || !st.s || st.s.length !== N) st = fresh();
    // progress saved before steps were tidied may hold odd indents, so tidy it once now
    if (!st.tidy) {
      st.s.forEach(function (s) { if (s.done) { var t = tidy(s.acc); if (s.text === s.acc) s.text = t; s.acc = t; } });
      st.tidy = 1; st.head = null;
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage may be blocked or full */ } }
    function firstOpen() { for (var i = 0; i < N; i++) if (!st.s[i].done) return i; return N; }
    st.at = Math.min(Math.max(0, st.at | 0), firstOpen());
    save();

    /* Where each step goes in the finished code. Most steps go in their own order. A step with a
       smaller pos goes back into an earlier part, such as the loop in __init__ that Build it writes last. */
    function pos(i) { return steps[i].pos != null ? steps[i].pos : i + 1; }
    var order = steps.map(function (s, i) { return i; }).sort(function (a, b) { return pos(a) - pos(b) || a - b; });
    // inOrder[i]: step i goes after every step before it, so it simply adds lines at the end
    var inOrder = steps.map(function (s, i) {
      for (var j = 0; j < i; j++) if (pos(j) > pos(i)) return false;
      return true;
    });
    function preLines(i) { return steps[i].pre ? steps[i].pre.split("\n") : []; }
    function accLines(i) { return st.s[i].acc.split("\n").map(function (l) { return l ? pad(steps[i].indent) + l : ""; }); }
    /* The code around step "upto": "before" ends where the learner types, "after" holds the accepted
       steps that come later in the finished code. On the last stage everything is in "before".
       A hand-edited head is used for the same step, or for a later step when every step in between
       only adds lines at the end. */
    function build(upto) {
      var cur = upto < N ? upto : -1, h = st.head, ranges = [], before, after = [];
      function add(to, i, noPre) {
        if (!noPre) to.push.apply(to, preLines(i));
        var ls = accLines(i);
        if (to === before) ranges[i] = [before.length + 1, before.length + ls.length];
        to.push.apply(to, ls);
      }
      var fits = h && (h.upto === upto || (h.upto < upto && !h.tail && inOrder.slice(h.upto, Math.min(upto, N - 1) + 1).every(Boolean)));
      if (fits) {
        before = h.text.replace(/\s+$/, "").split("\n");
        if (h.upto === upto) {
          if (h.tail) after = h.tail.replace(/\s+$/, "").split("\n");
        } else {
          // the head already holds the fixed lines of its own step (they showed above the box)
          for (var i = h.upto; i < upto; i++) add(before, i, i === h.upto);
          if (cur >= 0) before.push.apply(before, preLines(cur));
        }
      } else {
        before = given.split("\n");
        var past = false;
        order.forEach(function (i) {
          if (i === cur) { before.push.apply(before, preLines(i)); past = true; }
          else if (i < upto) add(past ? after : before, i);
        });
      }
      return { text: before.join("\n"), lines: before, ranges: ranges, after: after.join("\n"), afterLines: after };
    }

    function editor(cls, label, numbered) {
      var wrap = el("div", "wi-box " + cls), ta = el("textarea", "wi-ta syn");
      ta.setAttribute("spellcheck", "false"); ta.setAttribute("autocapitalize", "off");
      ta.setAttribute("autocomplete", "off"); ta.setAttribute("autocorrect", "off");
      ta.setAttribute("aria-label", label);
      ta.dataset.title = label;
      if (numbered) ta.dataset.ln = "1";
      wrap.appendChild(ta);
      return { wrap: wrap, ta: ta };
    }

    /* the card */
    var box = el("div", "wi");
    var intro = el("p", "wi-intro", "Each step tells you one job in plain words. You write the code for that job, and the check tells you whether it does the job. Every code box is an editor, so you can change any line. When every step is done, your whole " + WHAT + " runs on the real tests.");
    var q = el("div", "wi-q");
    q.appendChild(el("h5", "wi-qh", "The question"));
    var qp = el("p"); qp.innerHTML = rich(data.question); q.appendChild(qp);
    var ex = null;
    if (data.example) {
      ex = editor("wi-plain wi-exbox", "The example", false);
      ex.ta.value = data.example.join("\n");
      ex.ta.rows = data.example.length;
      q.appendChild(ex.wrap);
    }
    if (data.example_note) q.appendChild(el("p", "wi-exn", data.example_note));
    var card = el("div", "wi-card");
    var top = el("div", "wi-top"), stepN = el("span", "wi-stepn"), dots = el("span", "wi-dots");
    top.appendChild(stepN); top.appendChild(dots);
    var ask = el("h4", "wi-ask"), doP = el("p", "wi-do");
    var ed = el("div", "wi-ed");
    var bar = el("div", "wi-bar");
    bar.innerHTML = '<span class="wi-dots3"><i></i><i></i><i></i></span><span>Python code</span>';
    var sofar = editor("wi-sofar", "Your code so far", true), slot = editor("wi-slot", "Your code for this step", true);
    // the code that comes after this step in the finished code (only when the step goes in the middle)
    var later = editor("wi-sofar wi-after", "The code after this step", true);
    var ta = slot.ta;
    ed.appendChild(bar); ed.appendChild(sofar.wrap); ed.appendChild(slot.wrap); ed.appendChild(later.wrap);
    var fb = el("div", "wi-fb"); fb.setAttribute("aria-live", "polite");
    var ans = el("div", "wi-ans");
    ans.appendChild(el("p", "wi-ans-h", "One answer is below. Type it into your box yourself, then press Check. Typing it helps you remember it."));
    var ansEd = editor("wi-plain wi-ansbox", "One answer", false);
    ans.appendChild(ansEd.wrap);
    ans.hidden = true;
    var nav = el("div", "wi-nav"), back = btn("lbtn ghost wi-back", "Back"), go = btn("lbtn wi-go", "Check");
    nav.appendChild(back); nav.appendChild(go);
    card.appendChild(top); card.appendChild(ask); card.appendChild(doP); card.appendChild(ed); card.appendChild(fb); card.appendChild(ans); card.appendChild(nav);
    box.appendChild(intro); box.appendChild(q); box.appendChild(card);

    function paint(t) { if (window.CodeKeys && window.CodeKeys.paint) window.CodeKeys.paint(t); }
    function lineCount(t) { return t.replace(/\s+$/, "").split("\n").length; }
    // the step's box starts at the step's indent, so the learner types from the right place
    function place() {
      if (st.at >= N) return;
      var cs = getComputedStyle(ta), probe = el("span", null, "0000000000");
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-family:" + cs.fontFamily + ";font-size:" + cs.fontSize;
      ed.appendChild(probe);
      var ch = probe.getBoundingClientRect().width / 10 * (ta.classList.contains("zf") ? 0.75 : 1);
      probe.remove();
      slot.wrap.style.setProperty("--wi-off", Math.round(steps[st.at].indent * ch) + "px");
    }

    var runRes = null, clearArm = false;
    function show(scroll) {
      var at = st.at, final = at >= N;
      stepN.textContent = final ? "Last step: run the tests" : "Step " + (at + 1) + " of " + N;
      var d = "";
      for (var i = 0; i <= N; i++) d += '<i class="' + (i === at ? "cur" : i < N && st.s[i].done ? "done" : "") + '"></i>';
      dots.innerHTML = d;
      var b = build(final ? N : at);
      if (sofar.ta.value !== b.text) sofar.ta.value = b.text;
      sofar.ta.rows = b.lines.length;
      sofar.ta.dataset.title = final ? "Your whole " + WHAT : "Your code so far";
      if (later.ta.value !== b.after) later.ta.value = b.after;
      later.ta.rows = Math.max(1, b.afterLines.length);
      later.wrap.hidden = final || !b.after;
      fb.textContent = ""; fb.className = "wi-fb"; ans.hidden = true;
      back.disabled = at === 0;
      clearArm = false;
      if (final) {
        ask.textContent = "Run your whole " + WHAT;
        doP.textContent = "This is your " + WHAT + ", built from your own steps. You can still change any line in it. Run it on the real tests to see whether every piece works together.";
        slot.wrap.hidden = true;
        go.textContent = "Run the tests";
        if (runRes) results(runRes);
      } else {
        var s = steps[at], ss = st.s[at];
        ask.textContent = s.ask;
        doP.innerHTML = rich(s.do);
        slot.wrap.hidden = false;
        if (ta.value !== ss.text) ta.value = ss.text;
        ta.rows = Math.max(2, (s.forms[0] || []).length + 1);
        ta.dataset.ln = String(lineCount(b.text) + 1);
        laterLn();
        ta.dataset.title = "Step " + (at + 1) + " of " + N + ". " + s.ask;
        ta.placeholder = "# write step " + (at + 1) + " here";
        ansEd.ta.value = s.answer;
        ansEd.ta.rows = lineCount(s.answer);
        place();
        if (ss.done && ss.text === ss.acc) say(ss.done === "ok" ? "ok" : "kept");
        else if (ss.tries && ss.hint) say("no", ss.hint);
        updateGo();
      }
      paint(sofar.ta); paint(ta); if (!later.wrap.hidden) paint(later.ta);
      if (scroll) {
        var r = card.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 80, behavior: "smooth" });
      }
    }
    // the code after the step is numbered from the line under the learner's box
    function laterLn() {
      later.ta.dataset.ln = String(lineCount(sofar.ta.value) + Math.max(1, lineCount(ta.value)) + 1);
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
      var ss = st.s[st.at];
      ans.hidden = true;
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
      ans.hidden = !ss.shown;
      if (ss.shown) paint(ansEd.ta);
      showB.addEventListener("click", function () { ss.shown = !ss.shown; save(); say("no", msg); });
      keep.addEventListener("click", function () { accept("kept"); next(); });
    }
    // an accepted step goes into the function with clean 4-space indents, and the box shows them too
    function accept(kind) {
      var ss = st.s[st.at];
      ss.acc = tidy(ta.value); ss.text = ss.acc; ss.done = kind; ss.hint = "";
      if (ta.value !== ss.text) ta.value = ss.text;
      // a hand-edited head that already holds this step is out of date now
      if (st.head && st.head.upto > st.at) st.head = null;
      runRes = null;
      save();
    }
    function check() {
      var ss = st.s[st.at], s = steps[st.at];
      ss.text = ta.value;
      var mine = parse(ss.text);
      if (mine.length && s.forms.some(function (f) { return accepts(mine, f); })) {
        accept("ok");
        say("ok"); updateGo(); paint(ta);
        return;
      }
      if (!mine.length) { say("no", hint(s, ss.text, vocab)); return; }
      ss.tries++; ss.hint = hint(s, ss.text, vocab);
      ss.done = "";
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
      if (!later.wrap.hidden) { laterLn(); paint(later.ta); }
      // a changed step needs a new check before Next
      if (ss.done && ss.text !== ss.acc && /ok|kept/.test(fb.className)) { fb.textContent = ""; fb.className = "wi-fb"; }
      updateGo();
    });
    // editing the code so far (or the whole function on the last stage) is saved as the head
    function headEdit() {
      st.head = { upto: Math.min(st.at, N), text: sofar.ta.value, tail: st.at < N ? later.ta.value : "" };
      runRes = null;
      save();
    }
    sofar.ta.addEventListener("input", function () {
      headEdit();
      if (st.at < N) { ta.dataset.ln = String(lineCount(sofar.ta.value) + 1); paint(ta); if (!later.wrap.hidden) { laterLn(); paint(later.ta); } }
    });
    later.ta.addEventListener("input", headEdit);
    editorKeys(ta, function () { go.click(); });
    editorKeys(sofar.ta, function () { if (st.at >= N) go.click(); });
    editorKeys(later.ta, null);
    editorKeys(ansEd.ta, null);
    if (ex) editorKeys(ex.ta, null);

    /* the final run: exactly the code in the editor, on the real tests */
    function run() {
      if (!cfg || !window.MSPractice) { fb.textContent = ""; fb.appendChild(el("p", "wi-no", "The tests could not load on this page.")); return; }
      var src = sofar.ta.value.replace(/\s+$/, "") + "\n";
      go.disabled = true;
      fb.textContent = ""; fb.className = "wi-fb";
      var status = el("p", "wi-status", "Python is loading. The first time takes a few seconds.");
      fb.appendChild(status);
      window.MSPractice.runPython(src, cfg, status).then(function (res) {
        runRes = { res: res, src: src };
        results(runRes);
      }, function (err) {
        if (err.message === "slow") { runRes = { slow: true, src: src }; results(runRes); return; }
        fb.textContent = "";
        fb.appendChild(el("p", "wi-no", "Python could not start. Check your internet connection and try again."));
      }).then(function () { go.disabled = false; });
    }
    function stepOf(line, b) {
      for (var i = 0; i < b.ranges.length; i++) if (b.ranges[i] && line >= b.ranges[i][0] && line <= b.ranges[i][1]) return i;
      return -1;
    }
    function py(v) { return window.MSPractice && window.MSPractice.py ? window.MSPractice.py(v) : JSON.stringify(v); }
    // a test call breaks only after ", ", never inside a value
    function callHtml(call) { return call.replace(/, /g, ", \u0000").split("\u0000").map(function (p) { return '<span class="wi-nb">' + esc(p) + "</span>"; }).join("<wbr>"); }
    /* A class test is a list of calls. Every call shows on its own line, and an earlier call that
       returns a value has that value as a note, so the last line reads in context. A list of more than 10
       calls keeps its first 2 and last 4, with one note line for the calls in between. */
    function callsHtml(list) {
      var rows = [];
      list.forEach(function (s, i) {
        var ls = String(s[0]).split("\n");
        if (i < list.length - 1 && s[1] != null) ls[ls.length - 1] += "  # " + py(s[1]);
        rows.push(ls);
      });
      if (rows.length > 10) {
        var skipped = rows.length - 6;
        rows = rows.slice(0, 2).concat([["# " + skipped + " more calls"]], rows.slice(-4));
      }
      return [].concat.apply([], rows).map(function (l) { return '<span class="wi-cl">' + callHtml(l) + "</span>"; }).join("");
    }
    function where(line, b) {
      var si = stepOf(line, b), text = (sofar.ta.value.split("\n")[line - 1] || "").trim();
      return "line " + line + (text ? " (" + text + ")" : "") + (si >= 0 ? ", in step " + (si + 1) : "");
    }
    function results(rr) {
      var res = rr.res, b = build(N);
      fb.textContent = "";
      fb.className = "wi-fb";
      var kept = [], target = 0;
      st.s.forEach(function (s, i) { if (s.done === "kept") kept.push(i + 1); });
      if (kept.length) target = kept[0];
      var keptTxt = kept.length ? (kept.length === 1 ? "step " + kept[0] : "steps " + kept.slice(0, -1).join(", ") + " and " + kept[kept.length - 1]) : "";
      var keptTip = kept.length ? "You kept your own version of " + keptTxt + ", so check " + (kept.length === 1 ? "that step" : "those steps") + " first." : "";
      if (rr.slow) {
        fb.appendChild(el("p", "wi-no", "Your " + WHAT + " ran for more than 8 seconds, so I stopped it. A loop may never end. " + (data.slow_tip || "Check that each pass of every while loop changes the thing the loop checks.")));
        if (keptTip) fb.appendChild(el("p", "wi-tip", keptTip));
      } else if (res.load) {
        fb.appendChild(el("p", "wi-no", "Your " + WHAT + " did not run. Python stopped on " + (res.line ? where(res.line, b) : "a line it could not read") + " with " + res.load + "."));
        if (/IndentationError|TabError/.test(res.kind || res.load)) fb.appendChild(el("p", "wi-tip", "Fix the indent of that line right here in the editor above: each level inside an if, for or while is 4 spaces more than the line it belongs to. Then press Run the tests again."));
        else fb.appendChild(el("p", "wi-tip", "You can fix that line right here in the editor above, then press Run the tests again."));
        if (keptTip) fb.appendChild(el("p", "wi-tip", keptTip));
        var ls = res.line ? stepOf(res.line, b) : -1;
        if (ls >= 0) target = ls + 1;
      } else {
        var pass = res.tests.filter(function (r) { return r.ok; }).length, all = res.tests.length;
        fb.appendChild(el("p", pass === all ? "wi-ok" : "wi-sum", pass === all ? "All " + all + " tests pass. You wrote the whole " + WHAT + " yourself, one step at a time." : pass + " of " + all + " tests pass."));
        if (pass < all) {
          var crash = res.tests.filter(function (r) { return r.err && r.line; })[0];
          var tip = "";
          if (crash) {
            var si = stepOf(crash.line, b) + 1;
            tip = "A test crashed on " + where(crash.line, b) + "." + (si && kept.indexOf(si) >= 0 ? " You kept your own version of that step, so start there." : "");
            if (si) target = si;
          } else if (kept.length) tip = "You kept your own version of " + keptTxt + ". A kept step is the first place to look.";
          else tip = data.trace_tip || "Pick the first failing test and trace it by hand, one line at a time.";
          fb.appendChild(el("p", "wi-tip", tip + " You can change the code in the editor above and run the tests again."));
        }
        var ul = el("ul", "wi-tests");
        res.tests.forEach(function (r) {
          var t = cfg.tests[r.id], k = r.ok ? t.steps.length - 1 : r.step, call = t.steps[k][0], want = t.steps[k][1];
          var li = el("li", r.ok ? "pass" : "fail");
          var c = el("pre", "wi-call wi-pre"); c.innerHTML = callsHtml(t.steps.slice(0, k + 1));
          var g = el("div", "wi-got");
          g.appendChild(el("span", "wi-badge", r.ok ? "Pass" : "Fail"));
          var txt = r.ok ? "gives " + py(want)
            : r.err ? "crashed with " + r.err + (r.line ? " on " + where(r.line, b) : "")
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
        st = fresh(); st.tidy = 1;
        runRes = null; save(); ta.value = ""; show(true);
      });
    }

    window.addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

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
