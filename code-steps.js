// "Build it" mode for the colored code boxes.
// Each step lights up the lines I would write next in an interview, in the order I would build them.
// A small window above the Back / Next bar says what I would say out loud for that piece.
(function () {
  var boxes = document.querySelectorAll(".code-text");
  if (!boxes.length) return;

  var say = document.createElement("div");
  say.className = "say-box";
  say.innerHTML = '<div class="say-k"></div><div class="say-t"></div>';
  var bar = document.createElement("div");
  bar.className = "step-bar";
  bar.innerHTML =
    '<button type="button" class="sb-back">&#8592; Back</button>' +
    '<span class="sb-count"></span>' +
    '<button type="button" class="sb-next">Next &#8594;</button>' +
    '<button type="button" class="sb-done" aria-label="Stop">&#10005;</button>';
  document.body.appendChild(say);
  document.body.appendChild(bar);
  var back = bar.querySelector(".sb-back"), next = bar.querySelector(".sb-next"),
      count = bar.querySelector(".sb-count"), done = bar.querySelector(".sb-done");

  var active = null, steps = [], cur = 0, inView = false, timer = null;

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
    count.textContent = "Step " + (cur + 1) + " of " + steps.length;
    back.disabled = cur === 0;
    next.disabled = cur === steps.length - 1;

    // the window fades out, gets the new words, then fades back in
    say.classList.remove("in");
    clearTimeout(timer);
    timer = setTimeout(function () {
      say.querySelector(".say-k").textContent = summary ? "To wrap up, I would say" : "What I would say";
      say.querySelector(".say-t").textContent = steps[cur].say;
      say.classList.add("in");
      if (scroll) place();
    }, 160);
  }

  // scroll so the lit lines sit in the space above the window
  function place() {
    var first = active.querySelector(".ln.on");
    if (!first) return;
    var top = first.getBoundingClientRect().top;
    var room = say.getBoundingClientRect().top;
    var lit = active.querySelectorAll(".ln.on");
    var bottom = lit[lit.length - 1].getBoundingClientRect().bottom;
    if (top < 70 || bottom > room - 10) {
      window.scrollTo({ top: top + window.scrollY - 80, behavior: "smooth" });
    }
  }

  function updateBar() {
    var on = !!active && inView;
    bar.classList.toggle("shown", on);
    say.classList.toggle("shown", on);
    document.body.classList.toggle("has-step-bar", on);
  }

  function stop() {
    if (!active) return;
    active.classList.remove("stepping", "summary");
    active.querySelectorAll(".on, .built").forEach(function (el) { el.classList.remove("on", "built"); });
    active.querySelector(".step-btn").innerHTML = "Build it &#9654;";
    active = null;
    updateBar();
  }

  function start(box) {
    stop();
    active = box; cur = 0;
    steps = JSON.parse(box.querySelector("script.steps").textContent);
    box.classList.add("stepping");
    box.querySelector(".step-btn").innerHTML = "Show all";
    inView = true;
    updateBar();
    show(true);
  }

  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.target === active) { inView = e.isIntersecting; updateBar(); }
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
  next.addEventListener("click", function () { if (cur < steps.length - 1) { cur++; show(true); } });
  done.addEventListener("click", stop);
  document.addEventListener("keydown", function (e) {
    if (!active) return;
    if (e.key === "ArrowRight") next.click();
    if (e.key === "ArrowLeft") back.click();
    if (e.key === "Escape") stop();
  });
})();
