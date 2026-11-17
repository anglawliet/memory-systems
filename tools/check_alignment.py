# Alignment check for every step card. Run before every push:
#   python3 tools/check_alignment.py            (all pages)
#   python3 tools/check_alignment.py sliding_window
# It steps through every card, tab, example and step at 4 phone widths, and lists any
# misalignment. It exits with an error when it finds one.
import sys
from playwright.sync_api import sync_playwright

PAGES = sys.argv[1:] or ['arrays', 'two_pointers', 'sliding_window', 'stack', 'binary_search', 'linked_list', 'heap', 'tries']
WIDTHS = [320, 360, 390, 430]
ROOT = 'file:///home/nambi/Documents/NAMBI-VAULT/memory_systems/'

CHECK = r"""
(card) => {
  const out = [];
  const cr = card.getBoundingClientRect();
  // 1. letter boxes in one row sit on one line
  card.querySelectorAll('.wk-cells').forEach(cb => {
    const tops = [...cb.querySelectorAll('.wk-v')].map(v => Math.round(v.getBoundingClientRect().top));
    if (tops.length && Math.max(...tops) - Math.min(...tops) > 1) out.push('letter boxes not on one line');
    // 2. pointer labels: no overlap, and a label is lifted only when it must be
    const ps = [...cb.querySelectorAll('.wk-p')].filter(p => p.textContent);
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1].getBoundingClientRect(), b = ps[i].getBoundingClientRect();
      const sameLine = Math.abs(a.top - b.top) < 2;
      if (sameLine && b.left < a.right + 2) out.push('labels overlap: ' + ps[i - 1].textContent + ' / ' + ps[i].textContent);
      if (ps[i].classList.contains('up') && b.left >= a.right + 2 && !ps[i - 1].classList.contains('up')) out.push('label lifted for no reason: ' + ps[i].textContent);
    }
    const unl = ps.filter(p => !p.classList.contains('up')).map(p => Math.round(p.getBoundingClientRect().top));
    if (unl.length && Math.max(...unl) - Math.min(...unl) > 1) out.push('labels at different heights');
  });
  // 3. every "=" lines up down the card
  const vals = [...card.querySelectorAll('.wk-vars.fixed .wk-val')].map(v => Math.round(v.getBoundingClientRect().left));
  if (vals.length && Math.max(...vals) - Math.min(...vals) > 1) out.push('"=" signs not lined up');
  // 4. nothing sticks out of the card
  card.querySelectorAll('.wk-stage *').forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1)) out.push('sticks out of the card: ' + (e.className || e.tagName));
  });
  return [...new Set(out)];
}
"""

problems = 0
with sync_playwright() as p:
    b = p.webkit.launch()
    for page in PAGES:
        for W in WIDTHS:
            ctx = b.new_context(viewport={'width': W, 'height': 800}, device_scale_factor=2, has_touch=True)
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(ROOT + page + '.html'); pg.wait_for_load_state('load')
            pg.evaluate("document.querySelectorAll('.deriv').forEach(d=>d.classList.add('open'))")
            pg.wait_for_timeout(300)
            cards = pg.evaluate("document.querySelectorAll('.wk-card').length")
            for ci in range(cards):
                card = pg.locator('.wk-card').nth(ci)
                ntab = max(1, card.locator('.wk-tabs button').count())
                nex = max(1, card.locator('.wk-exs button').count())
                for t in range(ntab):
                    for e in range(nex):
                        if card.locator('.wk-tabs button').count(): card.locator('.wk-tabs button').nth(t).evaluate('b=>b.click()')
                        if card.locator('.wk-exs button').count(): card.locator('.wk-exs button').nth(e).evaluate('b=>b.click()')
                        total = int(card.locator('.vz-n').inner_text().split(' of ')[1])
                        for step in range(total):
                            for msg in card.evaluate(CHECK):
                                problems += 1
                                if problems <= 60: print(f'{page} {W}px card {ci + 1} tab {t + 1} example {e + 1} step {step + 1}: {msg}')
                            card.locator('.vz-btn.primary').evaluate('b=>b.click()')
            for m in errs: problems += 1; print(page, W, 'page error:', m)
            ctx.close()
    b.close()
print('problems:', problems)
sys.exit(1 if problems else 0)
