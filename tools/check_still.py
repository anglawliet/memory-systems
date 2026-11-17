# Checks that tapping Next never moves the page or the Next button. Run before every push:
#   python3 tools/check_still.py                 (all pages)
#   python3 tools/check_still.py sliding_window
# It loads every picture first and scrolls instantly, because lazy pictures and smooth
# scrolling would otherwise look like movement.
import sys
from playwright.sync_api import sync_playwright

PAGES = sys.argv[1:] or ['arrays', 'two_pointers', 'sliding_window', 'stack', 'binary_search', 'linked_list', 'heap', 'tries']
ROOT = 'file:///home/nambi/Documents/NAMBI-VAULT/memory_systems/'
problems = 0
with sync_playwright() as p:
    for engine in ('webkit', 'chromium'):
        b = getattr(p, engine).launch()
        for W, H in ((390, 844), (360, 740)):
            for page in PAGES:
                ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, has_touch=True)
                pg = ctx.new_page()
                pg.goto(ROOT + page + '.html'); pg.wait_for_load_state('load')
                pg.evaluate("document.querySelectorAll('.deriv').forEach(d=>d.classList.add('open'))")
                pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
                pg.wait_for_function("[...document.images].every(i=>i.complete)", timeout=90000)
                pg.wait_for_timeout(500)
                n = pg.evaluate("document.querySelectorAll('.wk-card').length")
                for ci in range(n):
                    card = f"document.querySelectorAll('.wk-card')[{ci}]"
                    ntab = max(1, pg.evaluate(f"{card}.querySelectorAll('.wk-tabs button').length"))
                    for t in range(ntab):
                        pg.evaluate(f"(()=>{{const b={card}.querySelectorAll('.wk-tabs button')[{t}]; if(b) b.click()}})()")
                        pg.wait_for_timeout(150)
                        pg.evaluate(f"(()=>{{const r={card}.getBoundingClientRect();window.scrollTo({{top:r.top+scrollY-110,behavior:'instant'}})}})()")
                        pg.wait_for_timeout(250)
                        seen = set()
                        total = int(pg.evaluate(f"{card}.querySelector('.vz-n').textContent").split(' of ')[1])
                        for i in range(total):
                            seen.add((round(pg.evaluate("scrollY")), round(pg.evaluate(f"{card}.querySelector('.vz-btn.primary').getBoundingClientRect().top"))))
                            pg.evaluate(f"{card}.querySelector('.vz-btn.primary').click()")
                            pg.wait_for_timeout(90)
                        if len(seen) > 1:
                            problems += 1
                            print(f'{engine} {W}px {page} card {ci + 1} tab {t + 1}: page or Next moved {sorted(seen)[:4]}')
                ctx.close()
        b.close()
print('problems:', problems)
sys.exit(1 if problems else 0)
