// The practice editors: a symbol key bar on laptops, and a full-screen editor with
// our own code keyboard and smart suggestions on phones. Shared by every lesson.
// Use: CodeKeys.attach(lvElement, [["if", "if "], ["node"], ...])
(function () {
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  /* The code key bar: one tap for each symbol and common name, so typing
     code on a phone needs no Shift and no symbol pages. */
  var SYM = [["\u21e5", "tab"], ["\u21e4", "untab"], [":"], ["("], [")"], ["["], ["]"], ["{"], ["}"], ["'"],
             ["="], [","], ["."], ["#"], ["<"], [">"], ["+"], ["-"], ["0"], ["1"]];
  var PAIRS = { "(": ")", "[": "]", "{": "}", "'": "'" };

  function put(ta, text, back) {
    ta.focus({ preventScroll: true });
    var ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch (x) { ok = false; }
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (back) { var p = ta.selectionStart - back; ta.setSelectionRange(p, p); }
  }
  function shiftLine(ta, add) {
    ta.focus({ preventScroll: true });
    var v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
    var ls = v.lastIndexOf("\n", s - 1) + 1;
    if (add) {
      ta.setRangeText("    ", ls, ls);
      ta.setSelectionRange(s + 4, e + 4);
    } else {
      var n = Math.min(4, v.slice(ls).match(/^ */)[0].length);
      if (!n) return;
      ta.setRangeText("", ls, ls + n);
      ta.setSelectionRange(Math.max(ls, s - n), Math.max(ls, e - n));
    }
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function press(ta, k) {
    var s = ta.selectionStart, e = ta.selectionEnd, ch = k[0];
    if (k[1] === "tab") return shiftLine(ta, true);
    if (k[1] === "untab") return shiftLine(ta, false);
    // a closing ) ] or ' that is already there: step over it
    if ((ch === ")" || ch === "]" || ch === "}" || ch === "'") && s === e && ta.value[s] === ch) {
      ta.focus({ preventScroll: true }); ta.setSelectionRange(s + 1, s + 1); return;
    }
    if (PAIRS[ch] && k.length === 1) return put(ta, ch + PAIRS[ch], 1);
    put(ta, k[1] || ch, k[2] || 0);
  }
  // iPhones zoom the whole page when a text box has text smaller than 16px.
  // On touch screens the text box uses 16px text and is drawn at 75% size,
  // so it looks like 12px but the phone does not zoom.
  var TOUCH = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  // The box grows with the code, so nothing is hidden and the box never needs
  // its own scrolling. On touch screens the text is 16px drawn at 75% size,
  // and a negative bottom margin removes the empty space the scaling leaves.
  function grow(ta) {
    if (ta._fit) return ta._fit(ta);
    var min = ta.classList.contains("ed") ? (TOUCH ? 400 : 300) : Math.round(ta.rows * (TOUCH ? 16 : 12) * 1.55 + 22);
    ta.style.height = min + "px";
    var h = Math.max(min, ta.scrollHeight + 4);
    ta.style.height = h + "px";
    if (TOUCH) ta.style.marginBottom = Math.round(-h * 0.25 + 8) + "px";
  }
  function noZoom(ta) {
    if (TOUCH) ta.classList.add("zf");
    ta.style.overflowY = "hidden";
    grow(ta);
    ta.addEventListener("input", function () { grow(ta); });
    // "Show answer" and "Start over" set the code without typing, so grow then too
    var d = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    Object.defineProperty(ta, "value", {
      configurable: true,
      get: function () { return d.get.call(this); },
      set: function (v) { d.set.call(this, v); grow(this); }
    });
    // a box in a closed tab has no size yet, so grow again once it is shown
    if (window.ResizeObserver) {
      var lastW = -1;
      new ResizeObserver(function () {
        if (ta.offsetWidth === lastW) return;
        lastW = ta.offsetWidth;
        // wait a frame, so the size change does not run inside this same check
        requestAnimationFrame(function () { grow(ta); });
      }).observe(ta);
    }
  }
  function fixTa(ta) {
    noZoom(ta);
    ta.setAttribute("autocorrect", "off");
    ta.setAttribute("autocapitalize", "off");
    ta.setAttribute("spellcheck", "false");
    // phone keyboards may type curly quotes, which Python cannot read
    ta.addEventListener("input", function () {
      if (!/[\u2018\u2019\u201c\u201d]/.test(ta.value)) return;
      var s = ta.selectionStart, e = ta.selectionEnd;
      ta.value = ta.value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
      ta.setSelectionRange(s, e);
    });
    // typing ) or ] next to the same closing bracket steps over it
    ta.addEventListener("beforeinput", function (ev) {
      var s = ta.selectionStart;
      if (ev.inputType === "insertText" && (ev.data === ")" || ev.data === "]" || ev.data === "}") && s === ta.selectionEnd && ta.value[s] === ev.data) {
        ev.preventDefault(); ta.setSelectionRange(s + 1, s + 1);
      }
    });
  }
  function keyBar(lv, WORDS_KEYS) {
    var tas = $$("textarea", lv);
    if (!tas.length) return;
    tas.forEach(fixTa);
    if (TOUCH) return fullScreen(tas, lv, WORDS_KEYS);
    // on a laptop the bar of symbol keys sits above the box you are typing in
    var bar = el("div", "kbar"), sym = el("div", "kb-sym"), words = el("div", "kb-w");
    var cur = tas[0];
    function key(row, k, isWord) {
      var b = el("button", isWord ? "" : (k[1] ? "kb-act" : ""), k[0]);
      b.type = "button";
      b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
      b.addEventListener("click", function () { press(cur, k); });
      row.appendChild(b);
    }
    SYM.forEach(function (k) { key(sym, k, false); });
    WORDS_KEYS.forEach(function (k) { key(words, k, true); });
    bar.appendChild(sym); bar.appendChild(words);
    tas.forEach(function (ta) {
      ta.addEventListener("focus", function () {
        cur = ta;
        if (bar.nextSibling !== ta) ta.parentNode.insertBefore(bar, ta);
      });
    });
    tas[0].parentNode.insertBefore(bar, tas[0]);
  }

  /* Smart suggestions.
     The lesson's own solution lines (the Fill the gaps code and answers) are the word list.
     If the line you are typing starts like a solution line, the suggestions are the
     words that came next in those lines, for example after "node = " they are
     "self.root" and "node[letter]". While you type part of a word, they finish it. */
  var KEYWORDS = ["if", "for", "in", "not", "return", "def", "class", "self", "True", "False", "None",
                  "elif", "else", "while", "and", "or", "del", "len", "range", "append", "break", "continue"];
  function tokens(line) {
    var re = /([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|\d+|'[^']*'|"[^"]*"|==|!=|<=|>=|\+=|-=|\S)/g, out = [], m;
    while ((m = re.exec(line))) out.push({ t: m[1], s: m.index, e: m.index + m[1].length });
    return out;
  }
  function closeOf(toks, i) {
    var open = toks[i].t, shut = open === "[" ? "]" : ")", depth = 0;
    for (var j = i; j < toks.length; j++) {
      if (toks[j].t === open) depth++;
      else if (toks[j].t === shut && --depth === 0) return j;
    }
    return -1;
  }
  // one suggestion: a name with its [ ] parts, like node[letter] or board[r][c],
  // and a short call like len(board)
  function group(line, toks, i) {
    var j = i;
    if (/^[A-Za-z_]/.test(toks[i].t)) {
      while (toks[j + 1] && (toks[j + 1].t === "[" || toks[j + 1].t === "(")) {
        var k = closeOf(toks, j + 1);
        if (k < 0) break;
        if (toks[j + 1].t === "(" && line.slice(toks[i].s, toks[k].e).length > 24) break;
        j = k;
      }
    }
    return { text: line.slice(toks[i].s, toks[j].e), space: line.charAt(toks[j].e) === " " };
  }
  function buildCorpus(lv, words) {
    var lesson = lv.closest(".lsn") || document, texts = [];
    $$('.lv[data-lv="2"] pre', lesson).forEach(function (p) { texts.push(p.textContent); });
    $$('.lv[data-lv="2"] .blank', lesson).forEach(function (b) { if (b.dataset.answer) texts.push(b.dataset.answer); });
    var lines = [];
    texts.join("\n").split("\n").forEach(function (l) {
      l = l.trim();
      if (l && l.charAt(0) !== "#") lines.push({ line: l, toks: tokens(l) });
    });
    var vocab = {};
    lines.forEach(function (L) {
      L.toks.forEach(function (t, i) {
        if (!/^[A-Za-z_'"\d]/.test(t.t)) return;
        var g = group(L.line, L.toks, i);
        vocab[g.text] = (vocab[g.text] || 0) + 1;
        if (g.text !== t.t) vocab[t.t] = (vocab[t.t] || 0) + 1;
      });
    });
    KEYWORDS.forEach(function (k) { if (!vocab[k]) vocab[k] = 0.5; });
    (words || []).forEach(function (w) { var t = w[0].replace(/[\s(]+$/, ""); if (!vocab[t]) vocab[t] = 0.5; });
    return { lines: lines, vocab: vocab };
  }
  function suggest(ta, corpus) {
    var v = ta.value, c = ta.selectionStart;
    var before = v.slice(v.lastIndexOf("\n", c - 1) + 1, c);
    var part = (before.match(/[A-Za-z_][\w.]*$/) || [""])[0];
    var typed = tokens(before.slice(0, before.length - part.length)).map(function (t) { return t.t; });
    var found = {};
    function add(text, score, space) {
      if (!/^[A-Za-z_'"\d]/.test(text) || text === part) return;
      if (part && text.indexOf(part) !== 0) return;
      var f = found[text] || (found[text] = { text: text, score: 0, space: space });
      f.score += score;
    }
    // lines that start the same way as the line you are typing
    var exact = 0;
    corpus.lines.forEach(function (L) {
      if (L.toks.length <= typed.length) return;
      for (var i = 0; i < typed.length; i++) if (L.toks[i].t !== typed[i]) return;
      var g = group(L.line, L.toks, typed.length);
      add(g.text, 10, g.space); exact++;
    });
    // otherwise: what came after the last word you typed
    if (!exact && typed.length) {
      var last = typed[typed.length - 1];
      corpus.lines.forEach(function (L) {
        for (var i = 1; i < L.toks.length; i++) {
          if (L.toks[i - 1].t !== last) continue;
          var g = group(L.line, L.toks, i);
          add(g.text, 3, g.space);
        }
      });
    }
    // finish the word you are typing
    if (part) Object.keys(corpus.vocab).forEach(function (w) { add(w, corpus.vocab[w] / 10, KEYWORDS.indexOf(w) >= 0); });
    var list = Object.keys(found).map(function (k) { return found[k]; });
    list.sort(function (a, b) { return b.score - a.score || a.text.length - b.text.length; });
    return { part: part, list: list.slice(0, 8) };
  }

  /* On a phone, tapping a code box opens it full screen: a top row with the task,
     Run the tests and Done, the code in the middle, and our own code keyboard at the
     bottom. The phone's keyboard stays hidden, so the code gets most of the screen.
     The page behind is locked, so nothing jumps while you type.
     The same text box moves into the full screen and back, so the saved code,
     Hint, Show answer and the tests all keep working as before. */
  var LETTERS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  var NUMBERS = ["1234567890", "<>+-*/%!_#", "\";&|?@~"];
  function fullScreen(tas, lv, WORDS_KEYS) {
    var vv = window.visualViewport, corpus = null;
    var box = el("div", "code-full lsn"), top = el("div", "cf-top"), title = el("p", "cf-title");
    var sys = el("button", "cf-btn cf-sys", "\u2328\ufe0e");
    var done = el("button", "cf-btn", "Done"), go = el("button", "cf-btn cf-go", "Run the tests");
    var runBtn = lv.querySelector(".run-btn");
    sys.type = done.type = go.type = "button";
    sys.setAttribute("aria-label", "Switch to the iPhone keyboard");
    top.appendChild(title); top.appendChild(sys);
    if (runBtn) top.appendChild(go);
    top.appendChild(done);
    var mid = el("div", "cf-mid");
    var kb = el("div", "ck"), sug = el("div", "ck-sug"), symRow = el("div", "ck-row ck-sym"), keys = el("div", "ck-keys");
    kb.appendChild(sug); kb.appendChild(symRow); kb.appendChild(keys);
    box.appendChild(top); box.appendChild(mid); box.appendChild(kb);
    box.hidden = true;
    box.setAttribute("role", "dialog");
    document.body.appendChild(box);
    var open = null, holder = el("div", "cf-hold"), y = 0, closing = 0, shift = false, page = "abc", phoneKeys = false;

    // a key acts when the finger lifts, like the phone keyboard; it never takes focus
    function key(row, label, act, cls, repeat) {
      var b = el("button", "ck-k" + (cls ? " " + cls : ""), label);
      b.type = "button";
      var timer = 0, again = 0;
      function stop() { clearTimeout(timer); clearInterval(again); b.classList.remove("down"); }
      b.addEventListener("touchstart", function (ev) {
        ev.preventDefault(); b.classList.add("down");
        if (repeat) { act(); timer = setTimeout(function () { again = setInterval(act, 60); }, 420); }
      }, { passive: false });
      b.addEventListener("touchend", function (ev) { ev.preventDefault(); var was = b.classList.contains("down"); stop(); if (!repeat && was) act(); });
      b.addEventListener("touchcancel", stop);
      b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
      b.addEventListener("click", function () { act(); });
      row.appendChild(b);
      return b;
    }
    function after() { refresh(); requestAnimationFrame(caretRoom); }
    function type(text) { if (!open) return; put(open, text); after(); }
    function letter(ch) {
      type(shift ? ch.toUpperCase() : ch);
      if (shift) { shift = false; draw(); }
    }
    function backspace() {
      var ta = open; if (!ta) return;
      var v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
      ta.focus({ preventScroll: true });
      if (s === e) {
        if (!s) return;
        var ls = v.lastIndexOf("\n", s - 1) + 1, head = v.slice(ls, s);
        if (PAIRS[v.charAt(s - 1)] && v.charAt(s) === PAIRS[v.charAt(s - 1)]) { s -= 1; e += 1; }
        else if (head && !head.trim() && head.length % 4 === 0) s -= 4;
        else s -= 1;
        ta.setSelectionRange(s, e);
      }
      try { if (!document.execCommand("delete")) throw 0; } catch (x) {
        ta.setRangeText("", ta.selectionStart, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
      after();
    }
    // a new line keeps the indent, and goes one step deeper after a colon
    function enter() {
      var ta = open; if (!ta) return;
      var v = ta.value, s = ta.selectionStart, ls = v.lastIndexOf("\n", s - 1) + 1, line = v.slice(ls, s);
      var ind = line.match(/^ */)[0];
      if (/:\s*$/.test(line)) ind += "    ";
      type("\n" + ind);
    }
    function move(d) {
      var ta = open; if (!ta) return;
      var p = Math.max(0, Math.min(ta.value.length, ta.selectionStart + d));
      ta.focus({ preventScroll: true }); ta.setSelectionRange(p, p); after();
    }
    function draw() {
      symRow.textContent = "";
      key(symRow, "\u21e5", function () { press(open, ["", "tab"]); after(); }, "ck-act");
      key(symRow, "\u21e4", function () { press(open, ["", "untab"]); after(); }, "ck-act");
      [":", "(", ")", "[", "]", "{", "}", "'", "="].forEach(function (ch) { key(symRow, ch, function () { press(open, [ch]); after(); }); });
      keys.textContent = "";
      var rows = page === "abc" ? LETTERS : NUMBERS;
      rows.forEach(function (r, i) {
        var row = el("div", "ck-row");
        if (i === 2 && page === "abc") key(row, "\u21e7", function () { shift = !shift; draw(); }, "ck-act ck-wide" + (shift ? " on" : ""));
        r.split("").forEach(function (ch) {
          key(row, page === "abc" && shift ? ch.toUpperCase() : ch, function () { if (page === "abc") letter(ch); else press(open, [ch]), after(); });
        });
        if (i === 2) key(row, "\u232b", backspace, "ck-act ck-wide", true);
        keys.appendChild(row);
      });
      var bottom = el("div", "ck-row");
      key(bottom, page === "abc" ? "123" : "abc", function () { page = page === "abc" ? "123" : "abc"; shift = false; draw(); }, "ck-act ck-wide");
      key(bottom, ",", function () { type(","); });
      key(bottom, ".", function () { type("."); });
      key(bottom, "space", function () { type(" "); }, "ck-space");
      key(bottom, "\u2190", function () { move(-1); }, "ck-act", true);
      key(bottom, "\u2192", function () { move(1); }, "ck-act", true);
      key(bottom, "\u23ce", enter, "ck-act ck-wide ck-enter");
      keys.appendChild(bottom);
    }
    // show as many suggestions as fit on one row, never cut a word
    function refresh() {
      if (!open) return;
      if (!corpus) corpus = buildCorpus(lv, WORDS_KEYS);
      var s = suggest(open, corpus);
      sug.textContent = "";
      s.list.forEach(function (item) {
        var b = key(sug, item.text, function () {
          var ta = open, c = ta.selectionStart;
          ta.setSelectionRange(c - s.part.length, c);
          type(item.text + (item.space ? " " : ""));
        }, "ck-chip");
        if (sug.scrollWidth > sug.clientWidth + 1) sug.removeChild(b);
      });
      if (!sug.children.length) sug.appendChild(el("span", "ck-none", "Suggestions show here as you type"));
    }

    function sizeTa() {
      if (!open) return;
      // the text is 16px drawn at 75% size, so the box is a third taller than the space
      open.style.height = (mid.clientHeight / 0.75) + "px";
      open.style.marginBottom = "0px";
    }
    function place() {
      if (!open) return;
      box.style.top = (vv ? vv.offsetTop : 0) + "px";
      box.style.height = (vv ? vv.height : window.innerHeight) + "px";
      // if the phone's own keyboard is showing, hide our letter keys
      var theirs = !!vv && vv.height < window.innerHeight - 150;
      box.classList.toggle("sys-kb", theirs);
      sizeTa();
    }
    function titleFor(ta) {
      if (ta.classList.contains("ed")) return "Write the whole class";
      var b = ta.closest(".blank"), pre = b && b.previousElementSibling;
      while (pre && pre.tagName !== "PRE") pre = pre.previousElementSibling;
      var lines = pre ? pre.textContent.split("\n").filter(function (l) { return l.trim(); }) : [];
      return lines.length ? lines[lines.length - 1].trim() : "Fill the gap";
    }
    function show(ta) {
      clearTimeout(closing);
      if (open === ta) return;
      if (open) hide();
      open = ta;
      y = window.scrollY;
      holder.style.height = ta.getBoundingClientRect().height + "px";
      ta.parentNode.insertBefore(holder, ta);
      title.textContent = titleFor(ta);
      box.hidden = false;
      mid.appendChild(ta);
      ta._fit = sizeTa;
      ta.style.overflowY = "auto";
      // our keyboard replaces the phone's keyboard
      phoneKeys = false;
      ta.setAttribute("inputmode", "none");
      document.documentElement.classList.add("cf-lock");
      document.body.style.top = -y + "px";
      shift = false; page = "abc"; draw();
      place();
      ta.readOnly = false;
      ta.focus({ preventScroll: true });
      refresh();
    }
    function hide() {
      clearTimeout(closing);
      if (!open) return;
      var ta = open;
      open = null;
      ta._fit = null;
      ta.readOnly = true;
      ta.removeAttribute("inputmode");
      ta.style.overflowY = "hidden";
      ta.scrollTop = 0;
      if (holder.parentNode) holder.parentNode.replaceChild(ta, holder);
      box.hidden = true;
      document.documentElement.classList.remove("cf-lock");
      document.body.style.top = "";
      grow(ta);
      window.scrollTo({ top: y, behavior: "instant" });
    }
    // keep a line of space under the typing line inside the code area
    function caretRoom() {
      if (!open) return;
      var ta = open, c = caretY(ta), t = c.top / 0.75, b = c.bottom / 0.75, line = b - t;
      if (b + line > ta.scrollTop + ta.clientHeight) ta.scrollTop = b + line - ta.clientHeight;
      else if (t < ta.scrollTop) ta.scrollTop = Math.max(0, t - line);
    }
    tas.forEach(function (ta) {
      // in the page the box only opens the full screen
      ta.readOnly = true;
      ta.addEventListener("click", function () { if (open !== ta) show(ta); else refresh(); });
      ta.addEventListener("focus", function () { clearTimeout(closing); });
      ta.addEventListener("input", function () { if (open === ta) { requestAnimationFrame(caretRoom); refresh(); } });
      ta.addEventListener("keyup", function () { if (open === ta) refresh(); });
      // the phone keyboard's own Done button closes the full screen too
      ta.addEventListener("blur", function () {
        clearTimeout(closing);
        closing = setTimeout(function () { if (open === ta && document.activeElement !== ta) hide(); }, 350);
      });
    });
    document.addEventListener("selectionchange", function () { if (open && document.activeElement === open) refresh(); });
    // switch between our code keys and the phone's keyboard (for dictation)
    sys.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
    sys.addEventListener("click", function () {
      if (!open) return;
      var ta = open;
      phoneKeys = !phoneKeys;
      ta.setAttribute("inputmode", phoneKeys ? "text" : "none");
      sys.setAttribute("aria-label", phoneKeys ? "Switch to the code keys" : "Switch to the iPhone keyboard");
      ta.blur(); ta.focus({ preventScroll: true });
      clearTimeout(closing);
      setTimeout(place, 400);
    });
    done.addEventListener("click", hide);
    go.addEventListener("click", function () {
      hide();
      runBtn.click();
      var out = lv.querySelector(".run-out");
      if (out) setTimeout(function () { out.scrollIntoView({ block: "center" }); }, 50);
    });
    if (vv) { vv.addEventListener("resize", place); vv.addEventListener("scroll", place); }
    window.addEventListener("resize", place);
  }
  // Where the typing cursor is inside a code box, in pixels from the box's top.
  // A hidden copy of the box with the same font and width shows where the line wraps.
  var mirror = null;
  function caretY(ta) {
    if (!mirror) {
      mirror = el("div");
      mirror.setAttribute("aria-hidden", "true");
      mirror.style.cssText = "position:absolute;top:0;left:-9999px;visibility:hidden;white-space:pre-wrap;overflow-wrap:break-word;";
      document.body.appendChild(mirror);
    }
    var cs = getComputedStyle(ta);
    ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "tabSize",
     "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth",
     "borderLeftWidth", "borderRightWidth", "boxSizing"].forEach(function (k) { mirror.style[k] = cs[k]; });
    mirror.style.width = ta.offsetWidth + "px";
    mirror.textContent = ta.value.slice(0, ta.selectionEnd);
    var mark = el("span", null, "\u200b");
    mirror.appendChild(mark);
    var scale = ta.classList.contains("zf") ? 0.75 : 1;
    return { top: mark.offsetTop * scale, bottom: (mark.offsetTop + mark.offsetHeight) * scale };
  }
  // the code font changes line heights once it loads, so measure every box again then
  function growAll() { $$(".lsn textarea").forEach(grow); }
  // (a font only starts loading when a closed problem is opened, so listen for every load)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(growAll);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", growAll);
  document.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(".lsn textarea")) grow(e.target); });
  window.addEventListener("load", growAll);
  window.CodeKeys = { attach: keyBar, grow: grow, caretY: caretY, suggest: suggest, buildCorpus: buildCorpus };
})();
