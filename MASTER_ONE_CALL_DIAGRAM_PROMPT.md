# Master Spec: "One Recursive Call" DP Diagram

A reusable recipe for generating a single colorful poster that explains **exactly one
invocation** of a recursive DP function. Hand this whole file to Claude in a new chat,
name the problem, and it should produce a diagram matching the LCS and LIS ones in
`dp/images/lcs_one_call.png` and `dp/images/lis_one_call.png`.

---

## 1. What this produces

One **landscape 1536x1024** PNG. A bright classroom poster, readable by a 10 year old,
that walks through a single frozen call in the same order the code executes.

**Use landscape for these.** The rest of `dp/images` is portrait 864x1821, and portrait
suits linear step-by-step explainers, but a one-call diagram is a **fork**: it needs two
columns side by side so both outcomes can be compared at a glance. Portrait was tried
and rejected here because it squeezed the columns to about 380px, forced every call
expression to wrap onto two lines, dropped the return boxes back to bare numbers, and
shortened the grey bars until the single purple highlight no longer stood out.

If you ever do need portrait, generate with `--size auto` and open the prompt with
"Create a TALL PORTRAIT hand-drawn educational infographic, aspect ratio roughly 9 wide
by 19 tall". That pairing yields exactly 864x1821. The wording is what steers `auto`;
asking for `1024x1536` gives the wrong proportion.

It deliberately does **not** cover: memoization, tabulation, DP tables, the recursion
tree, repeated subproblems, complexity, or the finished algorithm. Child calls appear
only as destination boxes and are never expanded.

---

## 1b. The pipeline

Do not hand write prompt files any more. Adding a problem means adding one dict:

```bash
# 1. add an entry to dp/specs.py
# 2. render both prompt files for every problem
python3 dp/build_cards.py
# 3. generate any image whose prompt exists but whose PNG does not (resumable)
bash dp/render_all.sh
# 4. shrink the new renders before they are committed
python3 dp/optimize_images.py
# 5. rebuild the One Call section of the workshop page
python3 dp/gen_onecall_html.py
```

| File | Role |
|---|---|
| `dp/specs.py` | per problem content only: question, code, four spoken lines, what each branch does |
| `dp/build_cards.py` | renders both prompt files, applying every rule in this document identically |
| `dp/render_all.sh` | generates missing images, skips finished ones, safe to re-run after an interruption |
| `dp/optimize_images.py` | re-encodes cards to a 256 colour palette in place, safe to re-run |
| `dp/gen_onecall_html.py` | rewrites the page section between the ONECALL markers, in the problems-tab order |

**Step 4 is not optional.** The API returns roughly 2 MB per card, and the
workshop is published with GitHub Pages, which does **not** resolve Git LFS
objects: an LFS tracked image is served to the browser as its 132 byte pointer
file with an `image/png` content type, so every card on the site silently comes
up broken. The images therefore have to be ordinary git blobs, which only works
if they are small. A 256 colour adaptive palette is visually identical on this
flat marker art (mean error around 2 of 255, text edges unchanged) and cuts
about 70% of the bytes. Never re-add `filter=lfs` for `*.png` in
`.gitattributes`.

`build_cards.py` supports three layouts, chosen by the `shape` field:

- **`choices`** two branches that MERGE into one combine box
- **`ifelse`** two branches that stay separate, each with its own return
- **`loop`** fans into three sample lanes plus an "and so on for every option"
  marker, then funnels into one operator. Needed by Coin Change, Word Break and
  Burst Balloons, which branch over a loop rather than two fixed choices.

Getting the shape wrong is the easiest way to publish a wrong diagram. House
Robber II was briefly tagged `ifelse` because the reduction reads like an
either/or in English ("give up the last house **or** the first"), while its code
evaluates both and takes the max. The card contradicted its own code panel, which
is exactly how it got caught. **Read the combine line in the code, not the English
description, to decide the shape.**

---

## 2. How to generate it

Style comes from passing a reference image into the image model, not from describing
the style in words. Describing it alone produced flat, low-color results twice.

```bash
python3 dp/generate_with_reference.py <prompt_name>
```

Reads `dp/prompts/<prompt_name>.txt`, writes `dp/images/<prompt_name>.png`. Defaults to
landscape 1536x1024, which is what these diagrams want. See section 1 for portrait.

The script calls `client.images.edit(model="gpt-image-2", image=[reference], ...)` with
`quality="high"`. Note `input_fidelity` is **not** supported by `gpt-image-2` and will
400 if passed.

Reference image: `~/Downloads/ChatGPT Image Jul 26, 2026, 05_52_29 PM.png`
(the original LIS choice diagram). Keep a copy somewhere stable. Any previously
approved poster from this family also works as the reference.

Prompt files live in `dp/prompts/<name>.txt` and need this header so the script can
find the target filename:

```
================================================================================
PROMPT 1: One Recursive Call -> <name>.png
================================================================================
```

Expect to regenerate once or twice. The model occasionally garbles a word or
duplicates a fragment. Rerunning the identical prompt usually clears it.

---

## 3. The rules that matter most

These were each learned by getting them wrong first. Do not skip them.

### 3.1 Get the recurrence structurally right

Decide **which of two shapes** the problem has, because they are drawn differently:

| Shape | Meaning | How to draw it |
|---|---|---|
| **if / else** | A condition picks the branch. Only one ever runs. | Two columns that stay **separate** to the bottom, each with its **own return box**. A dashed divider between them labeled "only one branch runs". **No shared bottom box.** |
| **real choices** | Both options are explored and compared. | Both branches flow down into **one shared combine box** holding the `max` / `min` / `sum`. |

LCS is if / else: letters match or they do not. LIS is real choices: take or skip.
Drawing a merge where the code has an `if` teaches the recurrence wrong.

A `max` inside one branch, such as LCS's two skip calls, is still a genuine combine
and does get its own merge arrows. Only the top level differs.

### 3.2 Never freeze the call on a dead branch

Pick the concrete state so that **every branch you want to teach is alive**.

Bad: LCS frozen where the letters differ. The match branch is then dead, and the
`1 +` never appears as a real path. Bad: LIS frozen where `numbers[i] <= last_taken`,
which kills the take branch, which is the flaw in the original reference image.

### 3.2b If a choice is gated, show the gate failing too

Freeze the state so the gated choice is **allowed**, so the live path stays live. But do
not then reduce the failure to a one line footnote, which is not enough. Give it a
**small two-column panel in a corner**, no arrows touching it, showing the same gate
both ways with concrete numbers:

| BIGGER -> ALLOWED | NOT BIGGER -> BLOCKED |
|---|---|
| square shows `5`, `5 > 2 ?  YES` | square shows `1`, `1 > 2 ?  NO` |
| take is open: `1 + lis( 4 , 5 )` | take is blocked, **no call at all** |
| | the answer is just SKIP |

Finish with the asymmetry in one line: "SKIP is always there. TAKE has to earn its
place." A gated choice next to an ungated one is a real structural feature, and the
learner needs both halves to see it.

### 3.3 Follow the code's execution order

The page reads top to bottom in the order the function runs:

1. **Step 1**, base case guard. This is the first line of the function, so it goes at
   the **top** as a full-width band, never tucked in a bottom corner. End it with a
   small arrow labeled "not done, keep going".
2. **Step 2**, the condition or check.
3. **Step 3 / Step 4**, the branches, each ending in its own `return`.

Add a **big round numbered badge** on each block, and a small **"THE CODE" panel**
near the top carrying the same numbers beside plain-language pseudocode lines. Use
real code keywords as labels: `if`, `else`, `return`.

### 3.3b The condition splits the page left and right

Everything above the condition is full width. The condition pill then fans **two thick
coloured arrows**, one curving down-left and one down-right, into **two columns side by
side** that run to the bottom and never rejoin, with a **full-height vertical dashed
divider** between them carrying a small grey pill reading "only one branch runs".

Seeing both outcomes at once, next to each other, is what makes the fork legible. This
is the whole reason these diagrams are landscape.

**Rejected alternative:** stacking the branches vertically and indenting each under its
`if` / `else` line with a coloured guide bar down the left edge. It renders convincingly
like real code, but it separates the two outcomes so you cannot compare them at a
glance. Tried and turned down in favour of the split.

### 3.4 Naming: every index carries what it indexes

Rejected along the way: `i` / `j` (opaque), `first_index` / `second_index` (index of
*which* string?), `string1_index_i` (says "index" twice).

Use:

| Problem shape | Names |
|---|---|
| Two strings | `text1` with `text1_index`, `text2` with `text2_index` |
| One array | `numbers` with `numbers_index` |
| A carried constraint | name it after **what it forbids**, e.g. `must_be_bigger_than` |

Match the language's real parameter names where sensible so the diagram transfers to
code you would actually write.

**Name a carried value by its job, not by its history.** This is the strongest naming
rule and it took three tries to land. For LIS, the second parameter went
`prev` to `previous_value` to `last_taken_value` to **`must_be_bigger_than`**:

- `prev` says nothing.
- `previous_value` is actively misleading, it reads as "the value at the previous index".
- `last_taken_value` is accurate but only says where the number **came from**, so the
  reader still has to work out why it is being carried at all.
- `must_be_bigger_than` states the **constraint it imposes**, so the validity check
  reads as a sentence: *is 5 > must_be_bigger_than?* The parameter explains its own
  existence.

Apply the same test to any carried state: capacity becomes `space_left_in_bag`, a
target becomes `amount_still_to_pay`, a cooldown flag becomes `can_buy_today`.

**Draw a carried value differently from an index.** An index points into the data, so
it is a square **on** the bar. A carried value is not a position, so it is a **chip
beside** the bar with a tiny label like "any number I take must beat this". Showing the
chip change in one branch and stay put in the other is what teaches the parameter.

### 3.5 Calls are expressions, numbers are support

Every recursive call shows the expression, with the numeric form on a smaller line
directly below it inside the same box:

```
1 + lcs( text1_index + 1 , text2_index + 1 )
=   1 + lcs( 3 , 2 )
```

The expression shows **which parameter changed**. The numbers keep it concrete. Never
show a bare numeric call on its own. Same for values: write
`numbers[ numbers_index ]` rather than a bare `5`.

Under each call box, one short line naming the state change: "both indexes move
forward", "only text2_index moves", "must_be_bigger_than becomes 5".

### 3.5b Read an indexed value once, then use the name

Never repeat `numbers[numbers_index]` or `text1[text1_index]` throughout the code and
the diagram. Pull it into a named variable on one line near the top, then use that name
everywhere after:

```python
current_value = numbers[numbers_index]        # do this once

take = 0
if current_value > must_be_bigger_than:
    take = 1 + lis(numbers_index + 1, current_value)
```

Three reasons this matters here. It removes bracket noise from every later line. It
makes the recursive call short enough to fit on one line instead of wrapping. And it
gives the thing a **spoken name**, so the diagram, the code, and the sentence you say
out loud all use the same word: "current_value".

Name it for what it is in the problem: `current_value`, `current_letter`,
`current_coin`, `current_weight`.

### 3.6 Grey out everything that is not the point

This one transformed the diagrams. Do **not** draw a string as a row of individually
colored letter cells with an index number under every cell. That is visual noise and
gives the eye no target.

Instead:

- A string is **one long flat rounded bar in plain neutral grey**, empty, no letters
  and no numbers inside it.
- Exactly **one square** sticks out: the current element, **bright purple** with its
  letter in bold white. Write its index number under it **only** in the top box.
- Parts already used or dropped are **pale grey, hatched, and crossed out**.
- **Never highlight two squares on the same bar**, with one exception below.

Result: about two numbers on the page instead of twenty. Everything that was a number
becomes geometry.

**Two-pointer exception.** Problems like palindromes genuinely have two live positions
on one bar. Then highlight both, but in **different colours**, purple for the left and
teal for the right, each labelled with its own name, and tint the span between them as
the part still in question. Two same-coloured squares would read as one thing
highlighted twice.

### 3.6b Ground every concrete number in a visible example

If a number appears anywhere on the page, the reader must be able to see where it came
from. `numbers_index == 8` is meaningless next to a grey bar with nothing written on it.

Put a **sticky note in the top left** holding the actual data:

```
THE EXAMPLE
numbers =  10  9  2  5  3  7  101  18
           0   1  2  3  4  5   6   7
           8 numbers, so the last index is 7
GOAL: longest run that keeps increasing
here that is  2, 3, 7, 101  ->  answer 4
we already took the 2. now we are looking at the 5.
```

That last line matters most: it explains **why the frozen call has these arguments**,
connecting the abstract state to the story. Then the base case can say
"the last index is 7, so 8 means we walked off the end" and it lands.

### 3.6c Show the identity value that keeps the combine honest

If a choice can be unavailable, the combine still needs something to compare against.
Do not hand wave it as "then the answer is just the other one". Show the initialization
explicitly in the code panel:

```
take = 0        <- nothing gained yet
```

and in the gate panel spell out the arithmetic: `max( 0 , skip ) = skip`, with the `0`
circled. The learner's real question is "how can you take a max when one side did not
happen", and the answer is that the blocked side is worth the identity, `0` for a max on
counts, `False` for an OR, `infinity` for a min.

### 3.7 Text budget

Few words, big lettering. One short line per idea. No explanatory sub-captions, no
"this comparison controls the decision" filler. If text would have to shrink to fit,
make the box bigger instead.

---

## 4. Visual style block

Paste this verbatim into every prompt:

```
STYLE: a bright, fun classroom poster for a 10 year old, in friendly hand-drawn
marker lettering.
- Page background: soft warm cream with a faint pale dotted grid, plus a few
  small confetti dots and doodle stars in the empty areas.
- Every major box has a SOLID SATURATED colored header bar with its title in
  bold WHITE lettering, a soft pastel tint filling the body, a thick rounded
  outline and a soft drop shadow.
- Thick COLORED arrows matching the block they point to, big friendly
  arrowheads.
- Two or three BIG cute cartoon doodles with smiling faces and rosy cheeks.
- A yellow sticky note with a red pushpin for the goal.
- All lettering large, dark and crisp on the pale fills. Never shrink text.
```

Color language, kept consistent across every diagram in the family:

| Color | Means |
|---|---|
| Purple | the current call, and every recursive call box |
| Blue | base case guard, and the condition being checked |
| Green | the match path, the take path, valid choices |
| Red | the differ path, the skip path, invalid choices |
| Gold / orange | the `+1` accent and sparkles |
| Grey | everything deliberately de-emphasized |

Plain colored text on a white background is **not** enough. That was rejected twice.
Fills, header bars, and tinted bodies are what make it read as colorful.

---

## 5. Prompt template

Replace everything in `<angle brackets>`.

```
Create a landscape hand-drawn educational infographic, 1536x1024.

<PASTE THE STYLE BLOCK FROM SECTION 4>

HOW STRINGS AND ARRAYS ARE DRAWN, VERY IMPORTANT:
<PASTE THE RULES FROM SECTION 3.6>

STEP BADGES: steps 1 to 4 each get a big round numbered badge in the colour of
that step, on the top left corner of the block. The same numbers appear beside
the matching lines in the code panel.

TITLE, very large, first word purple, rest black:
   "<PROBLEM>  -  ONE CALL,  IN CODE ORDER"

TOP LEFT: small yellow sticky note with a red pushpin and a target doodle:
   "GOAL"
   "<one line saying what the whole problem asks for>"

TOP CENTER: box with a purple header bar reading "THE CALL ARRIVES".
   On its left, large purple lettering:
      "<fn>( <param1> = <v1> , <param2> = <v2> )"
   On its right, the state drawn as grey bars with one purple square each.

TOP RIGHT: box with a dark slate header bar reading "THE CODE". Pale grey body,
short plain-language pseudocode lines, each numbered line carrying a small round
coloured badge:
      "<fn>( <param1> , <param2> ):"
   badge 1, blue:    "<base case condition>:"
                     "      return <base value>"
   badge 2, blue:    "<the condition being checked>:"
   badge 3, green:   "      return <branch A in words>"
   badge 4, red:     "else: return <branch B in words>"

=== STEP 1, full width, blue ===
Wide band, solid BLUE header bar: "STEP 1   FIRST, ARE WE DONE?"
Badge "1". Two short lines:
   "if  <base case condition>   ->   return <base value>"
   "<why, in four words>"
On the right end, a small green arrow curving down labelled
   "not done, keep going"

=== STEP 2, full width, blue ===
Centered SOLID BLUE pill, bold white lettering, badge "2":
   "<the condition, written with the descriptive names>"

=== THE SPLIT ===
From that pill, TWO thick colored arrows fan out, one curving down to the LEFT
and one curving down to the RIGHT, into two columns that sit SIDE BY SIDE and
run all the way down to the bottom of the page. Green arrow left, red right.
<IF THE SHAPE IS if/else: a long vertical DASHED grey line running the whole
height between the columns, with a small grey pill near its top reading
"only one branch runs">

=== STEP 3, LEFT COLUMN (green) ===
Solid GREEN header bar: "STEP 3   <WHAT IS TRUE HERE>". Badge "3".
   The state redrawn as bars showing what this choice consumed.
   A purple-outlined box, gold starburst around any "+ 1":
      "<expression form of the call>"
      "=   <numeric form>"
   One short line: "<what changed>"
Green arrow down to a green return box:
   "return  <expression form>"
   "=   <numeric form>"

=== STEP 4, RIGHT COLUMN (red) ===
Solid RED header bar: "STEP 4   <WHAT IS TRUE HERE>". Badge "4".
   <one group per option, each with its own bars and call box>
   <if there are two options, a big red curly brace to their LEFT spanning both,
    with "max" in large red letters beside it>
Red arrow down to a red return box:
   "return  <expression form>"

<IF THE SHAPE IS real-choices INSTEAD: delete the dashed divider and the two
separate return boxes. Both branches send a thick arrow down into ONE shared
combine box at the bottom center, purple header bar, holding:
   "<CHOICE A>  =  <numeric form>"     in green
   "<CHOICE B>  =  <numeric form>"     in red
   "return  max ( <CHOICE A> , <CHOICE B> )"   in purple, "max" biggest
   "try both, keep the better one">

<IF a choice can be invalid: a small corner box, red outline, no arrow touching
it: "IF <failing condition>" / "<CHOICE> is invalid. Only <other>.">

COMPOSITION: the page reads top to bottom in the exact order the code runs.
Airy and colorful, calm grey bars with a single bright purple square drawing the
eye in each row. Every word spelled correctly.
```

---

## 5b. The companion card: "THE CODE, AND THE ONE IDEA"

Each problem gets a **second** landscape image, a practice card, filename
`<problem>_code_and_script.png`. Same style, two panels.

**LEFT panel, "THE CODE".** Dark slate header. The real runnable code on a pale grey
card, neat monospace hand, line numbers down the left in faint grey, soft syntax
colouring: keywords purple, function name blue, numbers orange, parameter names dark
teal. No badges, no annotations. Under it a small grey chip with the initial call, e.g.
`start with  lis( 0 , negative infinity )`.

**RIGHT panel, "SAY THIS OUT LOUD".** Green header. **Only four sentences.** This panel
is spoken aloud to practise and memorise, so it must look almost empty next to the code.
Lettering **much larger** than the code, generous space between lines, one coloured dot
per line, key phrases colour-coded to match the diagrams (take green, skip red).

### The voice, copy this exactly

Every problem's four sentences use the same tone. This is the approved model, for LCS:

> 🟣 I compare the current letters from both strings.
> 🟢 If they match, I include that letter in the answer and move forward in both strings.
> 🔴 If they don't match, I don't know which letter is causing the mismatch, so I try
> skipping the current letter from the first string and then the current letter from the
> second string.
> 🟡 I return whichever choice gives me the longer common subsequence.

What that voice is made of:

- **First person, active, present tense.** "I compare", "I include", "I try", "I return".
  Not "the letters are compared", not "we can then observe that".
- **Contractions are fine.** "don't" sounds like a person talking.
- **Plain words only.** No "at least one of them has to go", no "the outer pair is
  settled", no "sacrifice", no "invariant". If it would sound odd said aloud to a friend,
  it is wrong.
- **Reuse the code's own nouns.** "the current letter" matches `current_letter` in the
  code, so the card, the diagram, and the sentence all use one word.

The four sentences follow a fixed job list:

1. **What I look at.** One short line. *"I compare the current letters from both strings."*
2. **The easy case, and what I do.** *"If they match, I include that letter and move
   forward in both strings."*
3. **The hard case, and WHY it is hard, then what I try.** This is the longest line and
   the most important one. Name the **uncertainty** that forces the branching:
   *"I don't know which letter is causing the mismatch, so I try skipping..."* A learner
   who hears the uncertainty understands why the recursion explores more than one path.
   If a branch is genuinely decisive, say that instead: *"I stop right away, because
   nothing inside can fix a bad pair at the ends."*
4. **What I return.** *"I return whichever choice gives me the longer common
   subsequence."* Name the actual quantity, not "the answer".

Also:

- **Explain the idea, not the code.** A line by line narration was tried first and
  rejected. Nobody wants to hear "on line four I return zero".
- **No example numbers.** "Five beats two" cannot be reused in a real interview.
- **Anything else**, complexity or memoization, goes in a **small grey chip** at the
  bottom, visibly outside the spoken script.

Footer strip across the page, three tips: "explain the idea first", "then write the
code", "finish with the next improvement".

---

## 6. Worked examples in this repo

| File | Shape | Why it is a good model |
|---|---|---|
| `dp/prompts/lcs_one_call.txt` | if / else | separate returns, dashed divider, code-order layout, grey bars |
| `dp/prompts/lis_one_call.txt` | real choices | shared `max` combine box, gate panel, example sticky note |
| `dp/prompts/lis_code_and_script.txt` | companion card | the four sentence spoken script |

Copy the closest one and edit rather than writing from scratch.

Each problem should end up with **two** images: `<problem>_one_call.png` and
`<problem>_code_and_script.png`.

---

## 7. Before you accept the output, check

- [ ] Is the recurrence right? Does the `+ 1` or the added cost actually appear on a live path?
- [ ] Do if / else branches stay separate, and do real choices merge?
- [ ] Is the base case at the **top** as step 1, not in a corner?
- [ ] Does every recursive call show the expression **and** the numbers?
- [ ] Does every index name say what it indexes? No bare `i`, `j`, `prev`.
- [ ] Does every carried value name say what it **does**, not where it came from?
- [ ] Is any indexed lookup repeated instead of being read once into `current_value`?
- [ ] If a choice is gated, is the failing case shown concretely, not just mentioned?
- [ ] Is there exactly **one** highlighted square per bar, everything else grey?
- [ ] Are the step badges consistent between the code panel and the blocks?
- [ ] Any garbled or duplicated words? Zoom in on every call box. This is the most
      common defect, and a plain rerun fixes it.
- [ ] Does anything imply memoization, a table, or a recursion tree? It should not.
