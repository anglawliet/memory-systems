// Shared page script.
// 1. Adds the light/dark switch to the top bar and remembers the choice.
//    (A tiny script in each page's head applies the saved choice before the page paints.)
// 2. On narrow screens, scrolls the top bar so the current section's link is visible.
(function () {
  var root = document.documentElement;
  var inner = document.querySelector(".ms-topbar .ms-inner");
  if (inner) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ms-theme";
    btn.innerHTML =
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    function label() {
      var dark = root.getAttribute("data-theme") === "dark";
      // the strip behind the phone's clock matches the page color
      var tc = document.querySelector('meta[name="theme-color"]');
      if (tc) tc.setAttribute("content", dark ? "#0f1114" : "#f8f7f4");
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.title = dark ? "Light theme" : "Dark theme";
    }
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") !== "dark";
      root.setAttribute("data-theme", dark ? "dark" : "light");
      try { localStorage.setItem("ms-theme", dark ? "dark" : "light"); } catch (e) {}
      label();
    });
    label();
    inner.appendChild(btn);
  }

  var links = document.querySelector(".ms-links");
  var on = links && links.querySelector("a.on");
  function showOn() {
    if (!on || links.scrollWidth <= links.clientWidth) return;
    var a = on.getBoundingClientRect(), n = links.getBoundingClientRect();
    links.scrollLeft += (a.left + a.width / 2) - (n.left + n.width / 2);
  }
  showOn();
  // fonts change the link widths, so center the link again once the page has loaded
  window.addEventListener("load", showOn);

  // 4. Walkthrough cards on phones.
  //    Long code sits in a short window, so keep the highlighted line in the middle of it.
  //    After a tap on Next, Back or a tab, scroll so the whole card is on screen.
  function centerLine(pre) {
    var all = pre.querySelectorAll(".snl.ptr, .l3-ln.hl"), on = all[all.length - 1];
    if (!on || pre.scrollHeight <= pre.clientHeight + 2) return;
    pre.scrollTop = on.offsetTop - (pre.clientHeight - on.offsetHeight) / 2;
  }
  if (window.MutationObserver) {
    new MutationObserver(function (list) {
      var seen = [];
      list.forEach(function (m) {
        var pre = m.target.closest && m.target.closest(".vz-code pre, pre.l3-code");
        if (pre && seen.indexOf(pre) < 0) { seen.push(pre); centerLine(pre); }
      });
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
  }
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest("button");
    var card = btn && btn.closest(".lsn .viz.pro, .lsn .l3");
    if (!card || window.innerWidth >= 760) return;
    setTimeout(function () {
      var bar = document.querySelector(".ms-topbar");
      var top = (bar ? bar.getBoundingClientRect().bottom : 0) + 8;
      var r = card.getBoundingClientRect();
      if (r.height > window.innerHeight - top - 8) return;
      if (r.top < top || r.bottom > window.innerHeight - 8) {
        window.scrollBy({ top: r.top - top, behavior: "smooth" });
      }
    }, 60);
  });

  // 3. Tap a lesson picture to see it bigger. The picture opens over the page,
  //    wider than the screen, so the small words are readable. Drag to move around.
  document.addEventListener("click", function (ev) {
    var img = ev.target.closest && ev.target.closest(".lsn .lsn-pic");
    if (!img) return;
    var box = document.createElement("div");
    box.className = "pic-zoom";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Bigger picture");
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    var close = document.createElement("button");
    close.type = "button";
    close.className = "pz-close";
    close.setAttribute("aria-label", "Close the bigger picture");
    close.textContent = "×";
    var hint = document.createElement("p");
    hint.className = "pz-hint";
    hint.textContent = "Drag to see the rest of the picture";
    box.appendChild(big); box.appendChild(close); box.appendChild(hint);
    var y = window.scrollY;
    document.body.appendChild(box);
    document.documentElement.style.overflow = "hidden";
    function shut() {
      if (!box.parentNode) return;
      box.parentNode.removeChild(box);
      document.documentElement.style.overflow = "";
      window.scrollTo(0, y);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") shut(); }
    close.addEventListener("click", shut);
    // a tap on the dark area around the picture also closes it
    box.addEventListener("click", function (e) { if (e.target === box) shut(); });
    document.addEventListener("keydown", onKey);
    close.focus({ preventScroll: true });
  });
})();
