#!/usr/bin/env python3
"""Render the approved CHOICE DIAGRAM prompt for every problem in choice_specs.

One layout, one colour code, 23 problems. The layout itself lives here and
nowhere else, so it cannot drift from card to card. Everything a problem is
allowed to change lives in choice_specs.py.

    python3 dp/choice_card.py            # write every prompt file
    python3 dp/choice_card.py stairs     # write one

Each prompt writes dp/images/<key>_one_call.png, which is the path
dp_workshop.html already points at, so a render updates the page directly.

Style history worth knowing before editing the template: this layout was
arrived at over about thirty renders. The parts that look fussy are the parts
that failed. In particular the cell rows are described as a COPY of the row
above rather than as a count, because stating a count produced four cells
instead of five on three separate renders.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from choice_specs import CHOICE

PROMPTS = Path(__file__).parent / "prompts"

CELL_WORDS = {
    "grey": "plain grey",
    "AMBER": "solid AMBER",
    "BLUE": "solid BLUE",
    "RED": "solid RED",
    "banned": "plain grey with a small NO ENTRY icon sitting on top of it",
}


def cells(pattern):
    """One line naming the five cells left to right."""
    return "   " + "   ".join(pattern)


def panels_intro(s):
    """Why the panel body opens the way it does, which depends on the mode."""
    if s.get("mode") == "ifelse":
        return """EACH PANEL ENDS WITH ITS OWN RETURN, so its body line opens with the word "return"
rather than with an equals sign. Nothing is bound to a name here, because nothing is
combined later. What the branch computes is what the call hands back."""
    return f"""THE VARIABLE NAME IS NOT IN THE PANEL. It rides on the ARROW that leaves the
panel's bottom edge on its way to the return box. The panel body therefore opens
with a bare "=" instead of with "{s['a']['var']} =". The equals sign says this panel
produces a value, and the arrow below says what that value is called, so the name
is never written twice."""


def body_prefix(s):
    """An if/else panel returns. A choice panel binds."""
    return "return" if s.get("mode") == "ifelse" else "="


def right_panel(s):
    """The second panel. A loop card has none, because it has no second option."""
    if s.get("mode") == "loop":
        return """THERE IS NO SECOND PANEL. The single panel above is the whole of the recursive step
on this card. Do not invent a right hand box to balance the page."""
    return f"""RIGHT BOX, RED FAMILY. A rounded box with a thin RED outline and a white fill.
On its top edge, a solid RED chip with bold white capitals: "{s['b']['chip']}"
{branch_picture(s, s['b'], 'RED')}{panel_extras(s['b'])}
   Under the picture, ONE SINGLE LINE and never two, in charcoal, set large and on
   one line without wrapping:
      "{body_prefix(s)} {s['b']['line']}"
   with the leading "{body_prefix(s)}" in RED and bold, and "{s['b']['hi']}" in
   RED.{amber_terms(s['b'])}"""


def result_block(s):
    """The bottom of the page. An if/else has no single combined result."""
    op = s["op"]
    tail = f"""

Under that line, separated by a thin green rule, two small green lines:
   "{s['why'][0]}"
   "{s['why'][1]}"

A small cute smiling star doodle sits at the bottom right corner of this box, and a
few small green sparkle ticks sit just outside its left and right edges."""

    if s.get("mode") == "ifelse":
        return f"""THE PAGE ENDS WITH THE TWO PANELS. There is no green box across the bottom, no
combined result, and nothing below the panels except two short lines of text. Each
panel already ends with its own return, and that IS the result. A box at the bottom
would claim the two branches are combined, which on this problem they never are.

{operator_spec(op, "Inside the panel whose return needs it")}

That giant operator lives inside the panel whose return needs it, and the other panel
has none. It appears ONCE on the whole page, inside that panel. Do not repeat it
underneath. This lopsidedness is the truth about this problem and must not be tidied
away into a shared box.

Below the two panels, with no box, no rule and no doodle around them, two small lines
centred on the page:
   in charcoal:  "whichever branch fired, that is what this call hands back."
   in green:     "{s['why'][0]} {s['why'][1]}"
"""

    if s.get("mode") == "loop":
        return f"""From the bottom of the single wide panel, ONE thick charcoal arrow drops into a wide
rounded box across the bottom of the page, with a thin GREEN outline and a very pale
green fill.

{operator_spec(op)}{outside_term(op)}{tail}"""

    return f"""From the bottom of each choice box a thin charcoal arrow curves down and inward,
and they meet at one wide rounded box across the bottom of the page. That box has
a thin GREEN outline and a very pale green fill.

EACH OF THOSE TWO ARROWS CARRIES A NAME. Beside the left arrow, in BLUE code
lettering, small and tidy: "{s['a']['var']}". Beside the right arrow, in RED code
lettering: "{s['b']['var']}". The name sits right against its own arrow, clear of
the panel above and of the green box below, so it plainly reads as the value
travelling down the arrow. This is the only place on the page where either variable
name is written before it appears in the return line.

{operator_spec(op)}{outside_term(op)}{tail}"""


def fork_block(s):
    """What the split means. A choice is not the same thing as a condition."""
    mode = s.get("mode", "choices")
    if mode == "loop":
        return f"""Centred, charcoal lettering:
   "{s.get('fork', 'So I could try every one of them.')}"
From it ONE thick CHARCOAL arrow drops into the single wide panel below.

THERE IS ONE PANEL ON THIS PAGE, NOT TWO. This problem does not choose between two
named options, it tries every one of them in turn, so the picture must show a fan of
tries rather than a pair of boxes. Drawing two panels here would teach the wrong
shape."""
    if mode == "ifelse":
        return f"""Centred, charcoal lettering, phrased as a QUESTION because this is a condition and
not a free choice:
   "{s['fork']}"
From it, two thin curved CHARCOAL arrows sweep down, one to the left box and one to
the right box. Above the left arrow, small charcoal capitals: "YES". Above the right
arrow: "NO".

ONLY ONE OF THE TWO PANELS EVER RUNS. This is an if and an else, not two choices
that are both explored, and the card must not suggest the two results are combined.
Directly under the question, one small charcoal line:
   "only one of these two runs."
"""
    return """Centred, charcoal lettering:
   "So I could go two ways."
From it, two thin curved CHARCOAL arrows sweep down, one to the left box and one
to the right box.

BOTH PANELS RUN. This is a genuine pair of choices, both explored, and their two
results are combined at the bottom of the page."""


def state_picture(s):
    """Where I am now, drawn. Five shapes cover all 26 problems.

    A problem may override with its own prose when its state is not a row, for
    instance two strings side by side or a window with two ends.
    """
    if s.get("state"):
        return s["state"]
    return f"""Below that, a row of FIVE equal rounded cells with a small gap between them. Left
to right the five cells are exactly:
{cells(s['row'])}
{s['actor']} stands on that amber cell with a few little motion sparks around it.
Nothing is written inside any cell.

FIVE CELLS, NOT FOUR AND NOT SIX, and the amber one is the THIRD of the five."""


def branch_picture(s, branch, colour):
    """The row redrawn inside one choice panel, or the problem's own prose."""
    if branch.get("picture"):
        return branch["picture"]
    return f"""   Inside, the same five cells as above, left to right exactly:
{cells(branch['row'])}
   Count the cells in that list and place the coloured one in exactly that slot. If
   the list puts the landing cell in the FOURTH slot it TOUCHES the amber cell with
   no cell in between, and if it puts it in the FIFTH there is exactly one cell in
   between. Getting this wrong changes what the code says.
   {s['actor_short'].capitalize()} stands just outside the row on its left.
   {branch['arc']}"""


def amount_block(s, where):
    """The second state variable, drawn as a jar, and braced to the row.

    The brace is the teaching point, not decoration. A call carries ONE state,
    and when that state has two parts the picture has to say so, because the
    count of amber objects inside the brace is what later decides how many
    dimensions the memo table has.
    """
    a = s.get("amount")
    if not a:
        return ""
    return f"""
   To the right inside the same box, a small rounded JAR outlined in AMBER with a
   pale amber fill, filled to about two thirds of its height, labelled underneath
   in small AMBER code lettering: "{a['var']}"
   The jar carries NO number. Its fill level is the amount, and that is the only
   place the amount appears. {where}

   Directly under the amber cell, in small plain AMBER code lettering with NO box
   around it and NO connector line: "{s['state_var']}"
   That label appears exactly once on the whole page.

   THE ROW AND THE JAR ARE BRACED TOGETHER. A thin AMBER curly brace is drawn
   underneath both of them at once, spanning from the left end of the row to the
   right edge of the jar, and beneath it one small CHARCOAL caption:
      "two things say where I am"

   THIS BOX HOLDS FOUR THINGS AND NOTHING MORE: the row of cells, the jar, one small
   label under each of them, and the brace with its caption. No boxed tags, no
   leader lines, no property labels, no repeated variable names. It is the most
   crowded box on the page and it must still read as calm.

   THIS IS WHAT MAKES THIS PROBLEM DIFFERENT FROM CLIMBING STAIRS. There, one
   number said everything about where I was. Here it takes two, and the brace is
   what turns two loose objects into one state. The number of amber objects inside
   the brace is exactly the number of arguments the function takes."""


def state_var_label(s):
    """Where the index variable's name goes.

    On a braced card the name already hangs off the amber cell on a leader, so
    printing it in the corner as well says the same thing twice.
    """
    if s.get("amount") or s.get("state"):
        return f"""Inside the box the index variable is NOT labelled in the corner. Its name
"{s['state_var']}" appears exactly ONCE, on the amber leader tag described below, and
never a second time anywhere in this box."""
    return f"""Inside the box, on the left, the variable name ALONE in AMBER lettering, with no
equals sign after it and NO VALUE ASSIGNED TO IT:
   "{s['state_var']}\""""


def amber_terms(branch):
    """Words in a code line that belong to the current position, so are amber."""
    terms = branch.get("amber")
    if not terms:
        return ""
    listed = " and ".join(f'"{t}"' for t in terms)
    return f"""
   {listed} in that line {"are" if len(terms) > 1 else "is"} AMBER, not charcoal,
   because {"they belong" if len(terms) > 1 else "it belongs"} to the one position I
   am standing on rather than to the call being made. Every other word in the line
   is charcoal."""


def props_block(s):
    """The properties of the thing I am standing on, named in full once.

    The code line inside a panel has room for short forms only, so the long
    descriptive names live here, next to the cell they belong to, where there is
    space to read them. Colour is what links the two: amber in the code line
    means "this belongs to the position I am standing on".
    """
    props = s.get("props")
    if not props:
        return ""
    tags = ", ".join(f'"{p}"' for p in props)
    return f"""
Directly UNDER the amber cell, small AMBER code lettering on {"two stacked lines" if len(props) > 1 else "one line"}: {tags}
These are the properties of the one {s['unit']} I am standing on, not of the row as
a whole. They are amber for the same reason the cell is amber. When the code lines
below use their short forms, the amber colour is what says they mean these.
"""


def panel_extras(branch):
    """A gate the choice is only legal behind, and the second state variable.

    Problems whose two branches land on the same cell cannot be told apart by
    the row, so the jar is what carries the difference. Where that is true the
    jar description is doing the work the hop arc does on Climbing Stairs.
    """
    out = ""
    if branch.get("gate"):
        out += f"""
   Above the row, one small line in this panel's colour, reading as a condition
   rather than a caption: "{branch['gate']}"
   This choice is only legal when that holds. It is the gate a coder forgets."""
    if branch.get("jar"):
        out += f"""
   {branch['jar']}"""
    return out


def operator_spec(op, where="Inside the green box"):
    """The return line, which differs by operator kind and nothing else."""
    if op["kind"] == "infix":
        return f"""{where}, ONE line reading left to right, all in GREEN. It must read as
REAL CODE, and because {op['name']} is an INFIX operator it sits BETWEEN its two
operands, with no brackets and no comma anywhere:

   "return"                normal size
   "{op['left']}"          normal size
   the GIANT {op['glyph']}          ENORMOUS, a solid green shape in a rounded green badge,
                           many times taller than the lettering beside it, the
                           largest thing on the whole page, sitting BETWEEN the two
                           names as the operator that joins them
   "{op['right']}"         normal size, immediately after the giant operator

So the completed line reads:  return {op['left']} {op['glyph']} {op['right']}

THERE IS EXACTLY ONE {op['glyph']} ON THIS PAGE. Do not draw a giant operator and then
repeat it in smaller text nearby. The giant one IS the operator in the returned
expression, and the two names sit on either side of it."""
    return f"""{where}, ONE line reading left to right, all in GREEN. It must read as
REAL CODE. {op['name']} is a FUNCTION and not an infix operator, so it takes its
arguments in brackets and the giant word comes FIRST:

   "return"                normal size
   "{op['glyph']}"         ENORMOUS, in a solid green rounded badge, many times
                           taller than the lettering beside it, the largest thing
                           on the whole page
   "({op['args']})"        normal size, immediately after the giant word, with tight
                           brackets and one comma followed by a single space

So the completed line reads:  return {op['glyph']}({op['args']})

Writing the two names on either side of {op['glyph']} would not be valid code, which is
exactly the mistake this card exists to prevent.

THERE IS EXACTLY ONE OPERATOR ON THIS PAGE. Do not draw a giant {op['glyph']} and then
repeat the word in smaller text nearby. The giant word is itself the function being
called, and the bracketed pair beside it are its two arguments."""


def outside_term(op):
    """Some problems pay a cost that sits outside the operator."""
    if not op.get("outside"):
        return ""
    return f"""

ONE TERM SITS OUTSIDE THE OPERATOR. The line opens with "{op['outside']}" in AMBER,
then the joining "{op.get('join', '+')}", then the giant operator and its arguments. The
joining sign is never left out. It reads:

   return {op['outside']} {op.get('join', '+')} {op['glyph']}({op.get('args', '')})

That term is amber because it belongs to the position I am standing on, and it is
outside the operator because it is paid whichever choice I make. Putting it inside
would charge it twice. This is the single most misread line on this card."""


def render(key, s):
    op = s["op"]
    return f"""{s['title']}, CHOICE DIAGRAM (portrait)
==============================================================
Generated by dp/choice_card.py from dp/choice_specs.py.
DO NOT EDIT THIS FILE. Edit the template or the spec, then
regenerate, or the two will drift apart.

One layout for every problem, so a reader who has learnt to
read one card can read them all. The only things that change
between cards are the words, the state picture and the
operator. The operator is the lesson.

COLOUR ROLES:
  charcoal  structure: title, narration, arrows, captions
  amber     where I am now, and anything belonging to it
  espresso  the base case: one box holding question, reason, return
  blue      the first choice, and everything inside its panel
  red       the second choice, and everything inside its panel
  green     the result this call returns
==============================================================

================================================================================
PROMPT 1: {s['title'].title()} choice diagram -> {key}_one_call.png
================================================================================

Create a TALL PORTRAIT educational infographic. The canvas is markedly taller
than it is wide, and the beats stack down it with generous white space between
them. This is a portrait page, never a landscape one.

=== STYLE ===

Minimal, cute and friendly, on a plain white background. Clean rounded
rectangles with thin coloured outlines, generous white space, soft hand lettered
sans serif. Flat colour only: no gradients, no shadows, no texture, no faceting.
Small cute cartoon characters used sparingly. The page should feel calm and
uncluttered, closer to a tidy notebook page than to a poster.

Every box on the page owns ONE colour family, and everything inside that box is
drawn in that family. Boxes never borrow each other's colours.

=== COLOUR ROLES, ONE MEANING EACH ===

   CHARCOAL   #333333   structure only: the title, the narration sentences, the
                        connecting arrows between boxes, and every small caption
   AMBER      #F5A524   WHERE I AM NOW: the "CURRENT CALL" header chip, the
                        highlighted cell, the words "SOME {s['unit']}" in the
                        narration, and the state variable names
   ESPRESSO   #5A3A22   THE BASE CASE: its single box, the lines inside it and the
                        badge around the returned value, and nothing else
   BLUE       #2563C9   the FIRST choice: its chip, its box outline, its landing
                        cell and the changing part of its call
   RED        #E23B2E   the SECOND choice: its chip, its box outline, its landing
                        cell and the changing part of its call
   GREEN      #2E7D4F   THE RESULT THIS CALL RETURNS: the bottom box, its giant
                        operator and its lettering
   GREY       #EDEDED   an ordinary empty cell, with a soft grey outline

Plain white page. Ordinary body text is charcoal. A colour is used only where it
carries one of the meanings above.

=== TITLE, across the top, centred, TWO STACKED LINES ===

   Line one, LARGE charcoal capitals, the biggest lettering in the top third:
      "{s['title']}"

   Line two, directly beneath it and MUCH SMALLER, charcoal sentence case rather
   than capitals, in a lighter weight, so it reads as a quiet subtitle and never
   competes with the name above it:
      "{s['subtitle']}"

The words "CHOICE DIAGRAM" and "ONE CALL" appear nowhere on this page. The
subtitle states the question the algorithm answers, and that is what sits under
the title instead.

=== NARRATION, directly under the subtitle, centred, TWO SHORT LINES ===

   "I am {s['standing']} SOME {s['unit']}."
   "It does not matter which one."

with the words "SOME {s['unit']}" in AMBER and the rest in charcoal. The first line
is larger than the subtitle above it but smaller than the title. The second line is
smaller and quieter than the first.

THIS IS THE POINT OF THE CARD, so it must not be softened. The {s['unit']} is never
named, never numbered and never pointed out as a particular one. The argument the
picture makes has to hold wherever the reader happens to be, and saying so out loud
is what makes the recursion believable.

=== TOP LEFT, THE NOTE ===

A rounded box with a thin amber outline, a very pale amber fill and a little
pushpin at its top. Three short lines, each with a small simple icon:
   {s['note'][0]}
   {s['note'][1]}
   a snowflake icon:  "This call is frozen right here."

The note never states how many {s['units']} there are. The row of cells below is
what shows that, and repeating it in words would be the same number twice.

=== THE CURRENT CALL BOX, top centre, AMBER FAMILY ===

A wide rounded box with a thin grey outline. Sitting on its top edge, a solid
AMBER chip with bold white capitals: "CURRENT CALL"

{state_var_label(s)}

NOTHING IS EVER WRITTEN AS "{s['state_var']} = 2" or with any other figure. The
amber cell in the row below is the value, and that is the only place the value
appears. Writing a number here would tie the whole card to one particular
{s['unit']} and invite the reader to count cells to check it.

{state_picture(s)}
{props_block(s)}
{amount_block(s, "It is drawn once here, and again inside each choice panel.")}

Immediately off the LEFT end of the row, before the first cell, three small grey
dots in a horizontal line, so the row clearly continues back off the page behind
{s['actor_short']}. There are no dots off the right end.

To the right of the row, just outside the box, {s['end_icon']} labelled
"{s['end_label']}" in grey, marking the end.

THE ROW IS OPEN ON THE LEFT AND CLOSED ON THE RIGHT. The dots on the left say
"some earlier call put me here". The marker on the right has to stay concrete,
because the base case question below asks whether I have run past the end, and that
question is meaningless without a visible end.

=== THE SPINE, ONE SINGLE LONG ARROW ===

From the bottom edge of the current call box, ONE long straight CHARCOAL arrow
runs STRAIGHT DOWN the centre of the page and does not stop until it reaches the
fork sentence just above the two choice boxes. It is a single unbroken arrow,
noticeably long, with exactly one arrowhead at its bottom end. No box sits on it
and nothing interrupts it.

THE SPINE ENDS AT THE FORK SENTENCE AND GOES NO FURTHER. It does not pass behind or
between the two choice panels, and it never reaches the green result box. Only TWO
arrows may enter the green box, one from each choice panel. A third line arriving
down the middle would claim the call returns something the choices did not produce.

=== THE BASE CASE, HANGING OFF THAT ARROW TO THE RIGHT, ESPRESSO FAMILY ===

At roughly the MIDPOINT of the long arrow there is a small solid charcoal dot on
the spine. From that dot a SHORTER and THINNER charcoal arrow branches sideways to
the RIGHT, leaving at a right angle, so it plainly reads as a quick detour rather
than the main path. Above that side arrow, in small charcoal letters: "but first"

The side arrow ends at ONE SINGLE rounded box out in the RIGHT MARGIN, with a thin
espresso outline and a very pale espresso fill. That one box holds the whole base
case, and it reads LEFT TO RIGHT in three parts:

   On the LEFT, short espresso lines stacked, all small:
      "{s['base']['q']}"
      "{s['base']['why']}"

   Then a short thick ESPRESSO ARROW pointing RIGHT.

   Then, filling the right of the box, the word "return" small in espresso with the
   value "{s['base']['ret']}" IMMEDIATELY TO ITS RIGHT on the same line, ENORMOUS,
   in a solid espresso rounded badge with the value in bold WHITE. It is about as
   tall as both left hand lines put together and is the largest thing inside this
   box. "return" sits BESIDE the badge and never stacked above it, so the whole box
   reads across in one straight line.

So the box reads:  {s['base']['q']} {s['base']['why']}  ->  return {s['base']['ret']}

THE REASON LINE IS THE POINT AND IS NEVER DROPPED. "{s['base']['why']}" is what
explains the returned value. Without it the reader has to take the value on trust,
and the whole reason this box exists is to make it derivable rather than memorised.

THE VALUE IS BIG BUT NOT THE BIGGEST. It outsizes everything else inside this box,
and it stays clearly SMALLER than the giant operator at the bottom of the page. The
operator is the punchline of the card and nothing may rival it.

THE BASE CASE IS ONE BOX AND NOTHING ELSE. There is no second box, no YES arrow
between two boxes, no restated question, and no caption underneath. The whole
detour is a single small box. It is the quietest thing on the page, because it is
the case that ends the call early rather than the case the card is about.

THE BASE CASE IS NOT IN THE MIDDLE OF THE FLOW. The long centre arrow passes
straight down through the middle of the page without being broken, and that one box
sits off to the RIGHT of it as a side branch. A reader's eye should be able to
travel from the current call all the way down to the two choices without ever
entering the base case.

THE SPINE CARRIES NO LABEL BELOW THE DOT. There is no "otherwise", no "keep going",
no "NO" and no other caption alongside it. The arrow continuing past the dot is
itself what says the call did not end there.

=== THE FORK ===

{fork_block(s)}

=== THE CHOICES ===

EACH PANEL HAS EXACTLY THREE THINGS IN IT: a chip naming the choice in plain words,
a picture of what this choice does to the state, and ONE SINGLE LINE of code.
Nothing else.

THE CHIP IS THE CHOICE IN PLAIN ENGLISH, in bold white capitals, because a reader
should be able to say what this panel does before reading any code.

{panels_intro(s)}

EACH CHOICE ROW IS A COPY OF THE ROW IN THE CURRENT CALL BOX. Do not lay out a new
row of cells for each panel and do not size the row to fit the panel. Take the five
cell row from the current call box, redraw it at the same cell count and the same
proportions, and change the fill of exactly ONE cell, the landing cell. Everything
else about the row is unchanged. If a panel ends up with four cells, the row was
built from scratch instead of copied, and that is the mistake to avoid.

LEFT BOX, BLUE FAMILY. A rounded box with a thin BLUE outline and a white fill.
On its top edge, a solid BLUE chip with bold white capitals: "{s['a']['chip']}"
{branch_picture(s, s['a'], 'BLUE')}{panel_extras(s['a'])}
   Under the picture, ONE SINGLE LINE and never two, in charcoal, set large and on
   one line without wrapping:
      "{body_prefix(s)} {s['a']['line']}"
   with the leading "{body_prefix(s)}" in BLUE and bold, and "{s['a']['hi']}" in
   BLUE.{amber_terms(s['a'])}

{right_panel(s)}


BRACKETS ARE TIGHT EVERYWHERE ON THE PAGE. Write "f(x + 1)" with no space after the
opening bracket and none before the closing one, exactly as the code is written. The
saved width is what lets each call sit on one line at full size.

NO PANEL BODY EVER WRAPS ONTO A SECOND LINE. A short name stacked above a long call
reads as a ragged block. If the line looks tight, make the panel wider or the page
gutters narrower. Never shrink the code, and never break it across two lines.

{s.get('note_extra', '')}

THE AMBER CELL APPEARS IN ALL THREE ROWS, because amber always means "where I am
now". The blue and red cells mean "where this choice would put me". Only the landing
cell moves, which is what lets a reader measure each jump by eye rather than from a
written number.

=== THE RESULT, bottom, GREEN FAMILY ===

{result_block(s)}

=== THE NUMBER BUDGET, COUNTED OUT ===

These numerals are allowed on this page, and no others:

{chr(10).join('   ' + n for n in s['numbers'])}

Everything else is shown by colour, by position or by distance. In particular:

   NO value after {s['state_var']}, anywhere.
   NO figure inside any cell on any row.
   NO count of {s['units']} in the note or in any caption.
   NO index row of figures under any row of cells.
   NO number in the subtitle or the narration.

The only exception is a numeral that is part of the problem's own NAME, such as the
"0/1" in "0/1 KNAPSACK" or the "II" in a sequel. A name is not a quantity.

If an amount can be seen by WHERE a cell sits or HOW FAR an arc reaches, it is
never also written down.

=== SIZE ORDER, OBEY STRICTLY, largest first ===

   1. the giant operator in the return line
   2. the title
   3. the two code lines inside the blue and red boxes
   4. the words of the bottom return line
   5. "I am {s['standing']} SOME {s['unit']}." and the base case value
   6. "So I could go two ways."
   7. the subtitle, every caption, and the note

=== COMPOSITION ===

The page reads straight down the centre: where I am, then one long arrow, then a
fork, then the two choices side by side, then one result. The only thing that
leaves that centre line is the base case, which hangs off the middle of the long
arrow into the right margin. Plenty of white space between the beats. Minimal,
cute, calm, and every word spelled correctly.
"""


def main():
    wanted = sys.argv[1:]
    keys = wanted or list(CHOICE)
    for key in keys:
        if key not in CHOICE:
            print(f"no choice spec for {key}")
            continue
        path = PROMPTS / f"{key}_choice.txt"
        path.write_text(render(key, CHOICE[key]))
        print(f"wrote {path.name}  ->  {key}_one_call.png")


if __name__ == "__main__":
    main()
