// "Step through" for the colored code boxes.
// Tapping the button lights up one block of code at a time and turns the rest gray.
// Back and Next sit in a bar fixed to the bottom of the screen, so they are always in reach.
(function () {
  var boxes = document.querySelectorAll(".code-text");
  if (!boxes.length) return;

  var bar = document.createElement("div");
  bar.className = "step-bar";
  bar.innerHTML =
    '<button type="button" class="sb-back">&#8592; Back</button>' +
    '<span class="sb-count"></span>' +
    '<button type="button" class="sb-next">Next &#8594;</button>' +
    '<button type="button" class="sb-done" aria-label="Stop stepping">&#10005;</button>';
  document.body.appendChild(bar);
  var back = bar.querySelector(".sb-back"), next = bar.querySelector(".sb-next"),
      count = bar.querySelector(".sb-count"), done = bar.querySelector(".sb-done");

  var active = null, cur = 0, total = 0, inView = false;

  function blocksOf(box) {
    var n = -1;
    box.querySelectorAll("[data-b]").forEach(function (el) { n = Math.max(n, +el.dataset.b); });
    return n + 1;
  }

  function show(scroll) {
    active.querySelectorAll("[data-b]").forEach(function (el) {
      el.classList.toggle("on", +el.dataset.b === cur);
    });
    count.textContent = "Part " + (cur + 1) + " of " + total;
    back.disabled = cur === 0;
    next.disabled = cur === total - 1;
    if (scroll) {
      var first = active.querySelector(".ln.on");
      var r = first.getBoundingClientRect();
      // only scroll when the block's first line is not comfortably on screen
      if (r.top < 70 || r.top > window.innerHeight * 0.55) {
        window.scrollTo({ top: r.top + window.scrollY - 90, behavior: "smooth" });
      }
    }
  }

  function updateBar() {
    bar.classList.toggle("shown", !!active && inView);
    document.body.classList.toggle("has-step-bar", !!active && inView);
  }

  function stop() {
    if (!active) return;
    active.classList.remove("stepping");
    active.querySelectorAll(".on").forEach(function (el) { el.classList.remove("on"); });
    active.querySelector(".step-btn").innerHTML = "Step through &#9654;";
    active = null;
    updateBar();
  }

  function start(box) {
    stop();
    active = box; cur = 0; total = blocksOf(box);
    box.classList.add("stepping");
    box.querySelector(".step-btn").innerHTML = "Show all";
    inView = true;
    show(true);
    updateBar();
  }

  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.target === active) { inView = e.isIntersecting; updateBar(); }
    });
  });

  boxes.forEach(function (box) {
    var btn = box.querySelector(".step-btn");
    if (!btn) return;
    watcher.observe(box);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (active === box) stop(); else start(box);
    });
  });

  back.addEventListener("click", function () { if (cur > 0) { cur--; show(true); } });
  next.addEventListener("click", function () { if (cur < total - 1) { cur++; show(true); } });
  done.addEventListener("click", stop);
  document.addEventListener("keydown", function (e) {
    if (!active) return;
    if (e.key === "ArrowRight") next.click();
    if (e.key === "ArrowLeft") back.click();
    if (e.key === "Escape") stop();
  });
})();
