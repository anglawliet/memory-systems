// The code key bar for the practice editors on phones. Shared by every lesson.
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
    var bar = el("div", "kbar"), sym = el("div", "kb-sym"), words = el("div", "kb-w");
    var cur = tas[0];
    function key(row, k, isWord) {
      var b = el("button", isWord ? "" : (k[1] ? "kb-act" : ""), k[0]);
      b.type = "button";
      b.setAttribute("aria-label", k[1] === "tab" ? "Indent" : k[1] === "untab" ? "Outdent" : "Type " + (k[1] || k[0]));
      {
        // keep the phone keyboard open: do not let the tap take focus
        b.addEventListener("touchstart", function (ev) { ev.preventDefault(); b.classList.add("down"); }, { passive: false });
        b.addEventListener("touchend", function (ev) { ev.preventDefault(); b.classList.remove("down"); press(cur, k); });
      }
      b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
      b.addEventListener("click", function () { press(cur, k); });
      row.appendChild(b);
    }
    SYM.forEach(function (k) { key(sym, k, false); });
    WORDS_KEYS.forEach(function (k) { key(words, k, true); });
    bar.appendChild(sym); bar.appendChild(words);
    tas.forEach(function (ta) {
      fixTa(ta);
      ta.addEventListener("focus", function () {
        cur = ta;
        if (!TOUCH && bar.nextSibling !== ta) ta.parentNode.insertBefore(bar, ta);
      });
    });
    if (TOUCH) fullScreen(bar, tas, lv);
    else tas[0].parentNode.insertBefore(bar, tas[0]);
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
  // On a phone, tapping a code box opens it full screen: a top row with Done and
  // Run the tests, the code in the middle, and the key bar right on the keyboard.
  // The page behind is locked, so nothing on the page can jump while you type.
  // The same text box moves into the full screen and back, so the saved code,
  // Hint, Show answer and the tests all keep working as before.
  function fullScreen(bar, tas, lv) {
    var vv = window.visualViewport;
    var box = el("div", "code-full lsn"), top = el("div", "cf-top"), title = el("p", "cf-title");
    var done = el("button", "cf-btn", "Done"), go = el("button", "cf-btn cf-go", "Run the tests");
    var runBtn = lv.querySelector(".run-btn");
    done.type = go.type = "button";
    top.appendChild(title);
    if (runBtn) top.appendChild(go);
    top.appendChild(done);
    var mid = el("div", "cf-mid");
    box.appendChild(top); box.appendChild(mid); box.appendChild(bar);
    box.hidden = true;
    box.setAttribute("role", "dialog");
    document.body.appendChild(box);
    var open = null, holder = el("div", "cf-hold"), y = 0, closing = 0;

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
      // lock the page where it is
      document.documentElement.classList.add("cf-lock");
      document.body.style.top = -y + "px";
      place();
      ta.readOnly = false;
      ta.focus({ preventScroll: true });
    }
    function hide() {
      clearTimeout(closing);
      if (!open) return;
      var ta = open;
      open = null;
      ta._fit = null;
      ta.readOnly = true;
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
      var ta = open, c = caretY(ta), top = c.top / 0.75, bottom = c.bottom / 0.75, line = bottom - top;
      if (bottom + line > ta.scrollTop + ta.clientHeight) ta.scrollTop = bottom + line - ta.clientHeight;
      else if (top < ta.scrollTop) ta.scrollTop = Math.max(0, top - line);
    }
    tas.forEach(function (ta) {
      // in the page the box only opens the full screen; the keyboard opens there
      ta.readOnly = true;
      ta.addEventListener("click", function () { if (open !== ta) show(ta); });
      ta.addEventListener("focus", function () { clearTimeout(closing); });
      ta.addEventListener("input", function () { if (open === ta) requestAnimationFrame(caretRoom); });
      // the keyboard's own Done button closes the full screen too
      ta.addEventListener("blur", function () {
        clearTimeout(closing);
        closing = setTimeout(function () { if (open === ta && document.activeElement !== ta) hide(); }, 350);
      });
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
  // the code font changes line heights once it loads, so measure every box again then
  function growAll() { $$(".lsn textarea").forEach(grow); }
  // (a font only starts loading when a closed problem is opened, so listen for every load)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(growAll);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", growAll);
  document.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(".lsn textarea")) grow(e.target); });
  window.addEventListener("load", growAll);
  window.CodeKeys = { attach: keyBar, grow: grow, caretY: caretY };
})();
