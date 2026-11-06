// "Build it" mode for the colored code boxes.
// Each step lights up the lines I would write next in an interview, in the order I would build them.
// One panel at the bottom of the screen shows what I would say, with Back and Next under it.
(function () {
  var boxes = document.querySelectorAll(".code-text");
  if (!boxes.length) return;

  var sheet = document.createElement("div");
  sheet.className = "build-sheet";
  sheet.innerHTML =
    '<div class="bs-head"><span class="bs-step"></span>' +
    '<button type="button" class="bs-close" aria-label="Close">&#10005;</button></div>' +
    '<div class="bs-track"><i></i></div>' +
    '<div class="bs-text"></div>' +
    '<div class="bs-nav"><button type="button" class="bs-back">Back</button>' +
    '<button type="button" class="bs-next">Next</button></div>';
  document.body.appendChild(sheet);
  var stepLabel = sheet.querySelector(".bs-step"), fill = sheet.querySelector(".bs-track i"),
      text = sheet.querySelector(".bs-text"), back = sheet.querySelector(".bs-back"),
      next = sheet.querySelector(".bs-next"), close = sheet.querySelector(".bs-close");

  var active = null, steps = [], cur = 0, inView = false, timer = null;
  // on wide screens the panel sits beside the code instead of floating over it
  var wide = window.matchMedia("(min-width: 1000px)");
  function docked() { return sheet.classList.contains("docked"); }

  // plain lines become paragraphs, and lines starting with "* " become a bullet list
  function format(t) {
    var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    var out = "", list = false;
    t.split("\n").forEach(function (line) {
      if (line.indexOf("* ") === 0) {
        if (!list) { out += "<ul>"; list = true; }
        out += "<li>" + esc(line.slice(2)) + "</li>";
      } else {
        if (list) { out += "</ul>"; list = false; }
        if (line.trim()) out += "<p>" + esc(line) + "</p>";
      }
    });
    return out + (list ? "</ul>" : "");
  }

  // "10-12,15" becomes [10, 11, 12, 15]
  function lines(spec) {
    var out = [];
    spec.split(",").forEach(function (part) {
      if (!part) return;
      var ab = part.split("-"), a = +ab[0], b = +(ab[1] || ab[0]);
      for (var i = a; i <= b; i++) out.push(i);
    });
    return out;
  }

  function show(scroll) {
    var now = lines(steps[cur].lines), before = [];
    for (var k = 0; k < cur; k++) before = before.concat(lines(steps[k].lines));
    var summary = now.length === 0;
    active.classList.toggle("summary", summary);
    active.querySelectorAll("[data-l]").forEach(function (el) {
      var l = +el.dataset.l;
      el.classList.toggle("on", now.indexOf(l) >= 0);
      el.classList.toggle("built", before.indexOf(l) >= 0);
    });
    stepLabel.textContent = summary ? "Wrap up" : "Step " + (cur + 1) + " of " + steps.length;
    fill.style.width = ((cur + 1) / steps.length * 100) + "%";
    back.disabled = cur === 0;
    next.textContent = cur === steps.length - 1 ? "Done" : "Next";

    // only the words fade, so the panel itself stays still
    text.classList.add("out");
    clearTimeout(timer);
    timer = setTimeout(function () {
      text.innerHTML = format(steps[cur].say);
      text.classList.remove("out");
      pad();
      dock();
      if (scroll) place();
    }, 140);
  }

  // leave enough room under the page so the last lines can scroll above the panel
  function pad() {
    document.body.style.paddingBottom = active && inView && !docked() ? (sheet.offsetHeight + 40) + "px" : "";
  }

  // scroll so the lit lines sit between the top menu and the panel
  function place() {
    var lit = active.querySelectorAll(".ln.on, .note-row.on");
    if (!lit.length) return;
    var top = lit[0].getBoundingClientRect().top;
    var bottom = lit[lit.length - 1].getBoundingClientRect().bottom;
    var room = docked() ? window.innerHeight : sheet.getBoundingClientRect().top;
    if (top < 90 || bottom > room - 16) {
      window.scrollTo({ top: top + window.scrollY - 96, behavior: "smooth" });
    }
  }

  function update() {
    var on = !!active && inView;
    sheet.classList.toggle("shown", on);
    pad();
    dock();
  }

  // on wide screens, keep the panel to the right of the code box, below the top menu,
  // and never past the bottom of the code box
  function dock() {
    if (!active || !docked()) return;
    var r = active.getBoundingClientRect();
    var top = Math.min(Math.max(r.top, 90), r.bottom - sheet.offsetHeight);
    sheet.style.left = (r.right + 20) + "px";
    sheet.style.top = Math.max(top, r.top) + "px";
  }
  window.addEventListener("scroll", dock, { passive: true });
  window.addEventListener("resize", dock);

  function stop() {
    if (!active) return;
    var box = active;
    box.classList.remove("stepping", "summary");
    var stack = box.closest(".panel-stack");
    if (stack) stack.classList.remove("building", "docked");
    sheet.classList.remove("docked");
    sheet.style.left = sheet.style.top = "";
    box.querySelectorAll(".on, .built").forEach(function (el) { el.classList.remove("on", "built"); });
    box.querySelector(".step-btn").innerHTML = "Build it &#9654;";
    active = null;
    update();
    box.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function start(box) {
    if (active) stop();
    active = box; cur = 0;
    steps = JSON.parse(box.querySelector("script.steps").textContent);
    box.classList.add("stepping");
    // hide the picture panels around the code while building, so only the code is on screen
    var stack = box.closest(".panel-stack");
    if (stack) stack.classList.add("building");
    if (stack && wide.matches) {
      stack.classList.add("docked");
      sheet.classList.add("docked");
    }
    box.querySelector(".step-btn").innerHTML = "Exit";
    inView = true;
    update();
    // bring the code box to the top of the screen so the code and the panel start together
    window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    show(false);
  }

  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.target === active) { inView = e.isIntersecting; update(); }
    });
  });

  boxes.forEach(function (box) {
    var btn = box.querySelector(".step-btn");
    if (!btn || !box.querySelector("script.steps")) return;
    watcher.observe(box);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (active === box) stop(); else start(box);
    });
  });

  back.addEventListener("click", function () { if (cur > 0) { cur--; show(true); } });
  next.addEventListener("click", function () {
    if (cur < steps.length - 1) { cur++; show(true); } else stop();
  });
  close.addEventListener("click", stop);
  document.addEventListener("keydown", function (e) {
    if (!active) return;
    if (e.key === "ArrowRight") next.click();
    if (e.key === "ArrowLeft") back.click();
    if (e.key === "Escape") stop();
  });
})();
