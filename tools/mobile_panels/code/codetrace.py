# Builds the "3. Code" tab of a step card by really running the code, one line at a time,
# like a debugger. Each step lights up one line, shows a short caption with the reason,
# and a quiet note at the end of the line with the new value (only when the code does not
# already make it obvious).
#   python3 codetrace.py p76_min_window_substring      (one lesson)
#   python3 codetrace.py                               (every lesson in TRACE)
# Captions live in <lesson>.trace.json: one template per line number ("12"), and for if/while
# lines one for True ("12T") and one for False ("12F"). {name} is filled with that variable's
# value after the line runs.
import sys, os, re, json, html, ast, copy, builtins
from collections import Counter, deque

D = os.path.dirname(os.path.abspath(__file__))
# lesson -> (function name, examples in the same order as the card's example buttons)
TRACE = {
    'p121_buy_sell_stock': ('maxProfit', [([7, 1, 5, 6, 4],), ([5, 4, 3, 1],), ([3, 8, 1, 4],)]),
    'p3_longest_substring': ('lengthOfLongestSubstring', [("abcb",), ("dvdf",), ("bbbb",)]),
    'p424_char_replacement': ('characterReplacement', [("AABAB", 1), ("ABAB", 2), ("ABBCB", 1)]),
    'p567_permutation_in_string': ('checkInclusion', [("ab", "idbao"), ("ab", "idboa"), ("abc", "bbacb")]),
    'p76_min_window_substring': ('minWindow', [("AXBCA", "ABC"), ("ABAXB", "AAB"), ("AAC", "AB")]),
    'p239_window_maximum': ('maxSlidingWindow', [([3, 1, 2, 5], 2), ([4, 3, 2, 1], 2), ([2, 2, 1], 2)]),
}
BUILTIN = set(dir(builtins)) | {'Counter', 'deque', 'True', 'False', 'None'}


def show(v):
    # values written the way the lessons write them: {A: 1, B: 2}, {a, b}, [3, 1]
    if isinstance(v, (Counter, dict)):
        return '{' + ', '.join(f'{show_key(k)}: {show(x)}' for k, x in v.items()) + '}'
    if isinstance(v, (set, frozenset)):
        return '{' + ', '.join(show_key(k) for k in v) + '}' if v else 'set()'
    if isinstance(v, (list, deque, tuple)):
        return '[' + ', '.join(show(x) for x in v) + ']'
    if isinstance(v, float) and v == float('inf'):
        return 'inf'
    if isinstance(v, str):
        return '"' + v + '"' if len(v) != 1 else v
    return str(v)


def show_key(k):
    return k if isinstance(k, str) else show(k)


def snap(loc):
    out = {}
    for k, v in loc.items():
        try: out[k] = copy.deepcopy(v)
        except Exception: out[k] = v
    return out


def run(src, func, args):
    # returns [(line, locals before, locals after, returned value or None)]
    ns = {}
    exec(compile(src, '<card>', 'exec'), ns)
    steps, state = [], {'line': None, 'before': None}

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != '<card>' or frame.f_code.co_name != func:
            return tracer
        if event == 'line':
            if state['line'] is not None:
                steps.append((state['line'], state['before'], snap(frame.f_locals), None))
            state['line'], state['before'] = frame.f_lineno, snap(frame.f_locals)
        elif event == 'return':
            if state['line'] is not None:
                steps.append((state['line'], state['before'], snap(frame.f_locals), arg))
            state['line'] = None
        return tracer

    sys.settrace(tracer)
    try: result = ns[func](*copy.deepcopy(list(args)))
    finally: sys.settrace(None)
    return steps, result


def names_in(expr):
    return [n for n in dict.fromkeys(re.findall(r'[A-Za-z_]\w*', expr)) if n not in BUILTIN]


def note_for(code, before, after, ret):
    s = code.strip()
    m = re.match(r'(if|elif|while)\s+(.*):$', s)
    if m:
        val = eval(m.group(2), {'Counter': Counter, 'deque': deque, 'float': float, 'len': len, 'max': max, 'min': min}, dict(before))
        parts = [f'{n} = {show(before[n])}' for n in names_in(m.group(2)) if n in before]
        return ', '.join(parts[:3]) + (' → ' if parts else '→ ') + str(bool(val)), bool(val)
    if s.startswith('return'):
        return '→ ' + show(ret), None
    changed = [n for n in after if n not in before or before[n] != after[n] or type(before[n]) != type(after[n])]
    m = re.match(r'([A-Za-z_]\w*)\s*=\s*(.*)$', s)
    if m and m.group(1) in after:
        if not names_in(m.group(2)):
            # a plain literal like "left = 0" or "window = Counter()": the code already says it
            changed = [n for n in changed if n != m.group(1)]
        elif m.group(1) not in changed:
            # a computed value is worth seeing even when it did not change, like best = max(best, profit)
            changed = [m.group(1)] + changed
    if not changed:
        return '', None
    return ', '.join(f'{n} = {show(after[n])}' for n in changed), None


def fill(t, vals):
    return re.sub(r'\{(\w+)\}', lambda m: vals[m.group(1)] if m.group(1) in vals else m.group(0), t)


def build(name):
    func, exs = TRACE[name]
    f = f'{D}/{name}.lesson.html'
    h = open(f).read()
    src = html.unescape(re.search(r'<div class="wk"[^>]*>\n<pre class="snip">(.*?)</pre>', h, re.S).group(1))
    lines = src.split('\n')
    caps = json.load(open(f'{D}/{name}.trace.json'))
    labels = re.findall(r'data-ex="([^"]+)" data-tab="3\. Code"', h)
    assert len(labels) == len(exs), (name, labels)
    for label, args in zip(labels, exs):
        steps, result = run(src, func, args)
        arr = args[0] if isinstance(args[0], str) else [str(x) for x in args[0]]
        F = []
        for line, before, after, ret in steps:
            code = lines[line - 1]
            note, cond = note_for(code, before, after, ret)
            vals = {k: show(v) for k, v in after.items()}
            vals['ret'] = show(ret)
            key = f'{line}{"T" if cond else "F"}' if cond is not None else str(line)
            say = caps.get(key) or caps.get(str(line)) or ''
            fr = {'line': str(line), 'say': fill(say, vals), 'note': note}
            if not F: fr.update(arr=arr, win=[], ptr={}, bad=[], dim=[], hit=[], vars=[])
            F.append(fr)
        F[-1]['res'] = 'return ' + show(result)
        js = json.dumps(F, ensure_ascii=False).replace('</', '<\\/')
        h, n = re.subn(r'(<script type="application/json" data-ex="' + re.escape(label) + r'" data-tab="3\. Code">)(.*?)(</script>)',
                       lambda m: m.group(1) + js + m.group(3), h, count=1, flags=re.S)
        assert n == 1, (name, label)
        print(name, label, len(F), 'steps', 'missing captions:' if any(not x['say'] for x in F) else '', sorted({x['line'] for x in F if not x['say']}))
    open(f, 'w').write(h)


if __name__ == '__main__':
    for name in sys.argv[1:] or TRACE:
        if os.path.exists(f'{D}/{name}.trace.json'): build(name)
        else: print(name, 'has no trace.json yet')
