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
        if (bar.nextSibling !== ta) {
          var sp = bar.previousSibling;
          if (sp && sp.className === "kb-space") ta.parentNode.insertBefore(sp, ta);
          ta.parentNode.insertBefore(bar, ta);
        }
      });
    });
    tas[0].parentNode.insertBefore(bar, tas[0]);
    if (TOUCH) dock(bar, tas);
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
  // While the phone keyboard is open, pin the key bar right on top of it.
  // A spacer keeps the page from jumping when the bar leaves its place.
  // The code box you type in shrinks to the space between the top of the screen and
  // the key bar, and scrolls inside itself. The phone then never hides the typing line
  // behind the bar, because the line is always inside the box, and the box is above the bar.
  function dock(bar, tas) {
    var vv = window.visualViewport, spacer = el("div", "kb-space"), on = false, timer = 0, follow = 0, fitted = null;
    if (!vv) return;
    function place() {
      if (!on) return;
      bar.style.top = Math.round(vv.offsetTop + vv.height - bar.offsetHeight) + "px";
    }
    function scale(ta) { return ta.classList.contains("zf") ? 0.75 : 1; }
    function room() { return vv.height - bar.offsetHeight - 20; }
    // the box's full height, or the space on screen if the code is longer
    function fit(ta) {
      // measure the code without resizing the box: a resize would make the page jump
      var k = scale(ta);
      var min = ta.classList.contains("ed") ? 0 : Math.round(ta.rows * (TOUCH ? 16 : 12) * 1.55 + 22);
      var full = Math.max(min, ta.scrollHeight + 4), most = Math.max(120, room() / k);
      var h = Math.min(full, most);
      ta.style.height = h + "px";
      ta.style.overflowY = full > most ? "auto" : "hidden";
      if (TOUCH) ta.style.marginBottom = Math.round(-h * 0.25 + 8) + "px";
    }
    function unfit() {
      if (!fitted) return;
      var ta = fitted; fitted = null;
      ta._fit = null; ta.style.overflowY = "hidden"; ta.scrollTop = 0; grow(ta);
    }
    // keep the typing line inside the box's own scroll window, with a line of room
    function caretInBox(ta) {
      if (ta.scrollHeight <= ta.clientHeight + 1) return;
      var c = caretY(ta), k = scale(ta), top = c.top / k, bottom = c.bottom / k, line = bottom - top;
      if (bottom + line > ta.scrollTop + ta.clientHeight) ta.scrollTop = bottom + line - ta.clientHeight;
      else if (top - line < ta.scrollTop) ta.scrollTop = Math.max(0, top - line);
    }
    // move the page so the whole box is between the top of the screen and the key bar
    function boxInView(ta) {
      var r = ta.getBoundingClientRect(), h = r.height * 1;
      var seeTop = vv.offsetTop + 8, seeBottom = vv.offsetTop + vv.height - bar.offsetHeight - 8;
      var shown = r.top + parseFloat(ta.style.height) * scale(ta);
      if (r.top < seeTop || shown > seeBottom) window.scrollBy({ top: r.top - seeTop, behavior: "instant" });
    }
    function follow1() {
      var ta = document.activeElement;
      if (!on || tas.indexOf(ta) < 0) return;
      if (fitted !== ta) { unfit(); fitted = ta; ta._fit = fit; }
      fit(ta);
      caretInBox(ta);
      boxInView(ta);
    }
    function soon() { clearTimeout(follow); follow = setTimeout(follow1, 30); }
    function check() {
      var open = tas.indexOf(document.activeElement) >= 0 && vv.height < window.innerHeight - 120;
      if (open && !on) {
        spacer.style.height = bar.offsetHeight + "px";
        bar.parentNode.insertBefore(spacer, bar);
        bar.classList.add("docked"); on = true;
        // the browser must not move the page on its own while the box changes size
        document.documentElement.style.overflowAnchor = "none";
        document.documentElement.style.scrollBehavior = "auto";
      } else if (!open && on) {
        bar.classList.remove("docked"); bar.style.top = "";
        if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
        on = false;
        unfit();
        document.documentElement.style.overflowAnchor = "";
        document.documentElement.style.scrollBehavior = "";
      }
      place();
      soon();
    }
    function later() { clearTimeout(timer); timer = setTimeout(check, 60); }
    vv.addEventListener("resize", later);
    vv.addEventListener("scroll", place);
    tas.forEach(function (ta) {
      ta.addEventListener("focus", function () { setTimeout(check, 350); soon(); });
      ta.addEventListener("blur", function () { setTimeout(check, 150); });
      ta.addEventListener("input", function () { follow1(); soon(); });
      ta.addEventListener("click", soon);
      ta.addEventListener("keyup", soon);
    });
    bar.addEventListener("click", soon);
    bar.addEventListener("touchend", soon);
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
