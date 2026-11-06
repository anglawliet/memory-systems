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
  if (on && links.scrollWidth > links.clientWidth) {
    var a = on.getBoundingClientRect(), n = links.getBoundingClientRect();
    links.scrollLeft += (a.left + a.width / 2) - (n.left + n.width / 2);
  }
})();
