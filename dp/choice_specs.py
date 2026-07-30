"""What each problem is allowed to change about its choice diagram.

The layout, the colour code and every rule about size and number use live in
dp/choice_card.py. Only the words and the state picture live here, so the cards
cannot drift apart.

Fields:
    title, subtitle     the two title lines. subtitle states the question.
    unit, units         "house" / "houses". Used by the narration and the rules.
    standing            "standing at" / "standing on" / "looking at".
    actor, actor_short  the cartoon character, long form and one word.
    note                two icon lines. The frozen-call line is added for you.
    state_var           the variable named in the current call box.
    row                 five cell colours, left to right. AMBER must be third.
    amount              optional second state variable, drawn as a jar.
    end_icon, end_label the concrete marker at the right hand end of the row.
    base                q, why, ret. The reason line explains the value.
    a, b                the two choices. chip, row, arc, line, hi, var, and
                        optionally gate and jar.
    op                  kind "infix" or "call". Infix takes glyph/left/right,
                        call takes glyph/args. outside adds a term in front.
    why                 two green lines under the return, saying why THIS
                        operator and not the other one.
    numbers             every numeral the page is allowed to show, counted out.
"""

CHOICE = {

"stairs": {
    "title": "CLIMBING STAIRS",
    "subtitle": "how many different ways I can reach the top, climbing 1 or 2 steps at a time",
    "unit": "step", "units": "steps", "standing": "standing on",
    "actor": "A small cute cartoon cat", "actor_short": "the cat",
    "note": ['a pair of footprints icon:  "Climb 1 or 2 steps at a time."',
             'a flag icon:                "Count every way to reach the top."'],
    "state_var": "current_step",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "end_icon": "a small flag icon", "end_label": "TOP",
    "base": {"q": "Already at the top?", "why": "this one route is finished", "ret": "1"},
    "a": {"chip": "JUMP 1 STEP", "row": ["grey", "grey", "AMBER", "BLUE", "grey"],
          "arc": ("A dashed grey arc springs from the AMBER cell and lands with a small "
                  "arrowhead on the blue cell immediately next to it, one cell along."),
          "line": "climb(current_step + 1)", "hi": "+ 1", "var": "one_step"},
    "b": {"chip": "JUMP 2 STEPS", "row": ["grey", "grey", "AMBER", "grey", "RED"],
          "arc": ("A dashed grey arc springs from the AMBER cell, sails clean OVER the "
                  "grey cell next to it and lands on the red cell, two cells along. It is "
                  "visibly WIDER than the arc in the other panel."),
          "line": "climb(current_step + 2)", "hi": "+ 2", "var": "two_step"},
    "op": {"kind": "infix", "name": "plus", "glyph": "+",
           "left": "one_step", "right": "two_step"},
    "why": ["the two groups of routes never overlap,", "so the counts simply add."],
    "numbers": ['the "1 or 2" on the note, because that is the rule of the problem',
                'the "1" in "return 1", because that is what the code returns',
                'the "+ 1" and "+ 2" inside the calls, because that is the code'],
},

"robber": {
    "title": "HOUSE ROBBER",
    "subtitle": "the most money I can collect without taking from two houses side by side",
    "unit": "house", "units": "houses", "standing": "standing at",
    "actor": "A small cute cartoon squirrel with a tiny coin sack",
    "actor_short": "the squirrel",
    "note": ['a row of houses icon:  "a row of houses."',
             'a no entry icon:       "Never take from two houses side by side."'],
    "state_var": "current_house",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "end_icon": "a small coin icon", "end_label": "LAST HOUSE",
    "base": {"q": "Past the last house?", "why": "no money", "ret": "0"},
    "a": {"chip": "TAKE THIS HOUSE", "row": ["grey", "grey", "AMBER", "banned", "BLUE"],
          "arc": ("A dashed grey arc springs from the AMBER cell, sails clean OVER the "
                  "forbidden neighbour and lands on the blue cell, two cells along. The "
                  "no entry icon on that neighbour is what says the jump must clear it."),
          "line": "money + rob(current_house + 2)", "hi": "+ 2",
          "amber": ["money"], "var": "take"},
    "b": {"chip": "SKIP THIS HOUSE", "row": ["grey", "grey", "AMBER", "RED", "grey"],
          "arc": ("A dashed grey arc springs from the AMBER cell and lands on the red cell "
                  "immediately next to it, one cell along."),
          "line": "rob(current_house + 1)", "hi": "+ 1", "var": "skip"},
    "op": {"kind": "call", "name": "max", "glyph": "MAX", "args": "take, skip"},
    "why": ["both choices are legal here,", "so I keep whichever one collects more."],
    "numbers": ['the "0" in "return 0", because that is what the code returns',
                'the "+ 1" and "+ 2" inside the calls, because that is the code'],
},

"robber2": {
    "title": "HOUSE ROBBER II",
    "subtitle": "the same street, but bent into a circle, so the first and last houses touch",
    "unit": "house", "units": "houses", "standing": "looking at",
    "actor": "A small cute cartoon squirrel with a tiny coin sack",
    "actor_short": "the squirrel",
    "note": ['a ring of houses icon:  "the street is a circle."',
             'a no entry icon:        "The first and last houses are neighbours now."'],
    "state_var": "the whole street",
    "state": """Below that, the five cells are bent into a RING rather than laid in a line: five
equal rounded cells arranged in a circle with a small gap between each, so the first
and the last cell plainly touch. The cell at the top of the ring is solid AMBER and
a small cute cartoon squirrel with a tiny coin sack stands on it.

A thin charcoal double headed arrow joins the two cells either side of the amber one
at the bottom of the ring, with one small charcoal caption beside it:
   "these two are neighbours too"

THE RING IS THE WHOLE POINT OF THIS CARD. Every other card in the series draws a
straight row. This one must not, because the entire difficulty of the problem is
that the two ends of the street have become adjacent.""",
    "end_icon": "no end marker at all, because a circle has no end,", "end_label": "",
    "base": {"q": "Only one house in the ring?", "why": "nothing to compare it with",
             "ret": "it"},
    "a": {"chip": "LEAVE OUT THE LAST HOUSE",
          "picture": """   Inside, the ring redrawn at the same size, with ONE cell painted plain grey and
   carrying a small no entry icon: the LAST house. The remaining four cells are cut
   open into a straight line beneath the ring, in BLUE, with a small blue arrow
   showing the ring becoming a row.
   One small blue caption: "now it is an ordinary street"
   The squirrel stands beside the straight blue row.""",
          "line": "rob_a_straight_street(first .. second_last)", "hi": "second_last",
          "var": "drop_last"},
    "b": {"chip": "LEAVE OUT THE FIRST HOUSE",
          "picture": """   Inside, the ring redrawn at the same size, with ONE cell painted plain grey and
   carrying a small no entry icon: the FIRST house. The remaining four cells are cut
   open into a straight line beneath the ring, in RED, with a small red arrow showing
   the ring becoming a row.
   One small red caption: "now it is an ordinary street"
   The squirrel stands beside the straight red row.""",
          "line": "rob_a_straight_street(second .. last)", "hi": "second",
          "var": "drop_first"},
    "op": {"kind": "call", "name": "max", "glyph": "MAX", "args": "drop_last, drop_first"},
    "why": ["the first and last house can never both be taken,",
            "so giving up one of them turns this back into the easy problem."],
    "numbers": ["no numerals at all are needed on this page"],
    "note_extra": ("THE TWO PANELS DO NOT MOVE A POSITION. They each throw ONE house away "
                   "and then solve the ordinary straight line problem, so what changes "
                   "between them is which cell is greyed out, not where anybody stands."),
},

"decode": {
    "title": "DECODE WAYS",
    "subtitle": "how many ways a string of digits can be read as letters, where A is 1 and Z is 26",
    "unit": "digit", "units": "digits", "standing": "standing on",
    "actor": "A small cute cartoon owl holding a tiny pencil", "actor_short": "the owl",
    "note": ['an alphabet icon:  "A is 1, and Z is 26."',
             'a no entry icon:   "Nothing may start with a zero."'],
    "state_var": "current_digit",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "end_icon": "a small full stop icon", "end_label": "END OF THE STRING",
    "base": {"q": "Read the whole string?", "why": "this one reading is finished", "ret": "1"},
    "a": {"chip": "READ ONE DIGIT", "row": ["grey", "grey", "AMBER", "BLUE", "grey"],
          "arc": ("A dashed grey arc springs from the AMBER cell and lands on the blue cell "
                  "immediately next to it, one cell along."),
          "gate": "only if this digit is not a zero",
          "line": "decode(current_digit + 1)", "hi": "+ 1", "var": "one_digit"},
    "b": {"chip": "READ TWO DIGITS", "row": ["grey", "grey", "AMBER", "grey", "RED"],
          "arc": ("A dashed grey arc springs from the AMBER cell, sails OVER the grey cell "
                  "next to it and lands on the red cell, two cells along. A thin red "
                  "bracket underneath joins the amber cell and the cell it flew over, "
                  "showing the two digits being read as one letter."),
          "gate": "only if the two digits together land between 10 and 26",
          "line": "decode(current_digit + 2)", "hi": "+ 2", "var": "two_digit"},
    "op": {"kind": "infix", "name": "plus", "glyph": "+",
           "left": "one_digit", "right": "two_digit"},
    "why": ["a reading that starts with one digit is never a reading that starts with two,",
            "so the counts simply add."],
    "numbers": ['the "1" and the "26" on the note and in the gates, because those are the '
                'rule of the problem',
                'the "10" in the second gate, for the same reason',
                'the "1" in "return 1", because that is what the code returns',
                'the "+ 1" and "+ 2" inside the calls, because that is the code'],
},

"mincost": {
    "title": "MIN COST CLIMBING STAIRS",
    "subtitle": "the cheapest way to the top, paying for each step I stand on",
    "unit": "step", "units": "steps", "standing": "standing on",
    "actor": "A small cute cartoon cat carrying a tiny purse", "actor_short": "the cat",
    "note": ['a pair of footprints icon:  "Climb 1 or 2 steps at a time."',
             'a coin icon:                "Every step I stand on has a price."'],
    "state_var": "current_step",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "end_icon": "a small flag icon", "end_label": "TOP",
    "base": {"q": "Off the end of the stairs?", "why": "nothing left to pay", "ret": "0"},
    "a": {"chip": "JUMP 1 STEP", "row": ["grey", "grey", "AMBER", "BLUE", "grey"],
          "arc": ("A dashed grey arc springs from the AMBER cell and lands on the blue cell "
                  "immediately next to it, one cell along."),
          "line": "cheapest(current_step + 1)", "hi": "+ 1", "var": "one_step"},
    "b": {"chip": "JUMP 2 STEPS", "row": ["grey", "grey", "AMBER", "grey", "RED"],
          "arc": ("A dashed grey arc springs from the AMBER cell, sails OVER the grey cell "
                  "next to it and lands on the red cell, two cells along, so it is visibly "
                  "wider than the arc in the other panel."),
          "line": "cheapest(current_step + 2)", "hi": "+ 2", "var": "two_step"},
    "op": {"kind": "call", "name": "min", "glyph": "MIN", "args": "one_step, two_step",
           "outside": "price"},
    "why": ["the price of this step is paid whichever way I jump,",
            "so it sits outside the MIN and never inside it."],
    "numbers": ['the "1 or 2" on the note, because that is the rule of the problem',
                'the "0" in "return 0", because that is what the code returns',
                'the "+ 1" and "+ 2" inside the calls, because that is the code'],
},

"maxprod": {
    "title": "MAXIMUM PRODUCT SUBARRAY",
    "subtitle": "the largest product any run of neighbouring numbers can make",
    "unit": "number", "units": "numbers", "standing": "standing on",
    "actor": "A small cute cartoon fox", "actor_short": "the fox",
    "note": ['a chain icon:        "the run has to be neighbours, with no gaps."',
             'a minus sign icon:   "One negative flips the biggest into the smallest."'],
    "state_var": "current_number",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "state": """Below that, a row of FIVE equal rounded cells with a small gap between them, left to
right exactly:
   grey   grey   AMBER   grey   grey
A small cute cartoon fox stands on the amber cell. Nothing is written inside any cell.

FIVE CELLS, NOT FOUR AND NOT SIX, and the amber one is the THIRD of the five.

To the right inside the same box, TWO small rounded pills stacked one above the other,
both outlined in AMBER, labelled in small amber code lettering:
   "biggest_so_far"
   "smallest_so_far"
A thin AMBER curly brace joins the row and the two pills, with one small CHARCOAL
caption beneath it:
   "three things say where I am"

WHY THE SMALLEST IS CARRIED TOO. A single negative number turns the biggest product
into the smallest and the smallest into the biggest, so the smallest has to be kept
alive to be ready for that moment. That is the whole reason this card has a second
pill, and it is the thing a coder forgets.""",
    "end_icon": "a small full stop icon", "end_label": "LAST NUMBER",
    "base": {"q": "Past the last number?", "why": "no run left to extend", "ret": "0"},
    "a": {"chip": "EXTEND THE RUN",
          "picture": """   Inside, the same five cells as above with the cell immediately after the AMBER one
   painted solid BLUE, and a dashed grey arc from the amber cell landing on it.
   Under the row, the two pills redrawn in BLUE, with a small blue swap arrow curling
   between them, and one small blue caption: "a negative swaps these two"
   The fox stands just outside the row on its left.""",
          "line": "current_number * biggest_so_far", "hi": "*",
          "amber": ["current_number", "biggest_so_far"], "var": "extend_big, extend_small"},
    "b": {"chip": "START A NEW RUN HERE",
          "picture": """   Inside, the same five cells as above with the AMBER cell ringed in RED and every
   cell before it faded, so the run plainly begins again at this position.
   Under the row, one small red caption: "the run before this is thrown away"
   The fox stands just outside the row on its left.""",
          "line": "current_number", "hi": "current_number",
          "amber": ["current_number"], "var": "start_fresh"},
    "op": {"kind": "call", "name": "max", "glyph": "MAX",
           "args": "extend_big, extend_small, start_fresh"},
    "why": ["three candidates go in and one comes out,",
            "because a negative number can make the smallest into the largest."],
    "numbers": ['the "0" in "return 0", because that is what the code returns'],
    "note_extra": ("THIS IS THE ONE CARD WHERE THE OPERATOR TAKES THREE ARGUMENTS. The left "
                   "panel produces TWO values, not one, so its arrow carries two names."),
},

"stock": {
    "title": "STOCK WITH COOLDOWN",
    "subtitle": "the most profit I can make, resting a day after every sale",
    "unit": "day", "units": "days", "standing": "standing on",
    "actor": "A small cute cartoon bear holding a tiny chart", "actor_short": "the bear",
    "note": ['a calendar icon:  "one decision each day."',
             'a bed icon:       "After selling, the next day must be a rest."'],
    "state_var": "current_day",
    "state": """Below that, a row of FIVE equal rounded cells with a small gap between them, left to
right exactly:
   grey   grey   AMBER   grey   grey
A small cute cartoon bear holding a tiny chart stands on the amber cell. Nothing is
written inside any cell.

FIVE CELLS, NOT FOUR AND NOT SIX, and the amber one is the THIRD of the five.

To the right inside the same box, a small two position SWITCH drawn as a rounded
track with a solid AMBER knob sitting in one of its two slots, labelled underneath in
small AMBER code lettering:
   "holding"
The switch carries no words like true or false. Which slot the knob sits in IS the
value.

A thin AMBER curly brace joins the row and the switch, with one small CHARCOAL
caption beneath it:
   "two things say where I am"

THE SWITCH IS WHY THIS PROBLEM NEEDS MORE THAN A DAY NUMBER. The same day means two
completely different situations depending on whether I am already holding a share, so
the day alone cannot be the state.""",
    "end_icon": "a small bell icon", "end_label": "LAST DAY",
    "base": {"q": "Past the last day?", "why": "no more trading", "ret": "0"},
    "a": {"chip": "ACT TODAY",
          "picture": """   Inside, the same five cells as above with the cell immediately after the AMBER one
   painted solid BLUE, and a dashed grey arc from the amber cell landing on it.
   To the right, the switch redrawn in BLUE with the knob MOVED to its other slot and
   a small blue arrow showing it flipping.
   One small blue caption: "buy if I hold nothing, sell if I do"
   The bear stands just outside the row on its left.""",
          "line": "price_today + act(current_day + 1, flipped)", "hi": "flipped",
          "amber": ["price_today"], "var": "act"},
    "b": {"chip": "REST TODAY",
          "picture": """   Inside, the same five cells as above with the cell immediately after the AMBER one
   painted solid RED, and a dashed grey arc from the amber cell landing on it.
   To the right, the switch redrawn in RED with the knob in EXACTLY the same slot as
   in the current call box, and a small red equals sign beside it.
   One small red caption: "nothing changes but the day"
   The bear stands just outside the row on its left.""",
          "line": "rest(current_day + 1, holding)", "hi": "holding", "var": "rest"},
    "op": {"kind": "call", "name": "max", "glyph": "MAX", "args": "act, rest"},
    "why": ["doing nothing is always allowed,", "so resting is a real choice and not a gap."],
    "numbers": ['the "0" in "return 0", because that is what the code returns',
                'the "+ 1" inside each call, because that is the code'],
},

"knapsack": {
    "title": "0/1 KNAPSACK",
    "subtitle": "the most value I can pack into the bag, taking each item at most once",
    "unit": "item",
    "units": "items",
    "standing": "looking at",
    "actor": "A small cute cartoon hedgehog wearing a little backpack",
    "actor_short": "the hedgehog",
    "note": [
        'a row of parcels icon:  "a row of items, each with a weight and a value."',
        'a bag icon:             "the bag has only so much room."',
    ],
    "state_var": "item_index",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "amount": {"var": "space_left"},
    "end_icon": "a small parcel icon",
    "end_label": "LAST ITEM",
    "base": {
        "q": "No items left?",
        "why": "nothing more to pack",
        "ret": "0",
    },
    "a": {
        "chip": "PUT IT IN THE BAG",
        "row": ["grey", "grey", "AMBER", "BLUE", "grey"],
        "arc": ("A dashed grey arc springs from the AMBER cell and lands with a small "
                "arrowhead on the blue cell immediately next to it, one cell along. "
                "Both choices move on by exactly one item, so this arc is the SAME "
                "length as the one in the other panel."),
        "gate": "only if it fits in the space left",
        "jar": ("To the right inside this panel, the same AMBER jar redrawn, but filled "
                "VISIBLY LOWER than the jar in the current call box, with a small blue "
                "arrow beside it pointing down. The lower fill is what says the bag has "
                "less room now. No number appears on or near the jar."),
        "line": "value + best(item_index + 1, space_left - weight)",
        "hi": "space_left -",
        "amber": ["value", "weight"],
        "var": "take",
    },
    "b": {
        "chip": "LEAVE IT BEHIND",
        "row": ["grey", "grey", "AMBER", "RED", "grey"],
        "arc": ("A dashed grey arc springs from the AMBER cell and lands with a small "
                "arrowhead on the red cell immediately next to it, one cell along. It "
                "is the SAME length as the arc in the other panel, because both "
                "choices move on by exactly one item."),
        "jar": ("To the right inside this panel, the same AMBER jar redrawn at EXACTLY "
                "the same fill level as the jar in the current call box, with a small "
                "red equals sign beside it. The unchanged fill is what says the bag "
                "kept all its room. No number appears on or near the jar."),
        "line": "best(item_index + 1, space_left)",
        "hi": "item_index + 1",
        "var": "skip",
    },
    "op": {
        "kind": "call",
        "name": "max",
        "glyph": "MAX",
        "args": "take, skip",
    },
    "why": [
        "only the more valuable pack survives,",
        "because a heavy item can cost me two lighter ones.",
    ],
    "numbers": [
        'the "0" in "return 0", because that is what the code returns',
        'the "+ 1" inside each call, because that is the code',
    ],
    "note_extra": (
        "THE TWO ROWS ARE DELIBERATELY IDENTICAL IN SHAPE. Unlike Climbing Stairs, both "
        "choices here step on by one item, so the row cannot tell them apart and the JAR "
        "is what does. The blue jar drops, the red jar does not. That contrast is the "
        "whole picture and it must be obvious at a glance."
    ),
},

}

# ---------------------------------------------------------------- ROW + AN AMOUNT
# These seven all carry a second number that shrinks. The row cannot tell their
# two choices apart, because both step on by one item, so the JAR is what does.

_JAR_MOVES = {
    "down": ("filled VISIBLY LOWER than the jar in the current call box",
             "a small arrow beside it pointing DOWN"),
    "up": ("filled VISIBLY HIGHER than the jar in the current call box",
           "a small arrow beside it pointing UP"),
    "same": ("at EXACTLY the same fill level as the jar in the current call box",
             "a small equals sign beside it"),
}


def _jar(colour, move, why):
    """One jar description. The fill and the arrow must never disagree."""
    fill, mark = _JAR_MOVES[move]
    return (f"To the right inside this panel, the same AMBER jar redrawn, {fill}, with "
            f"{mark} in {colour}. {why} No number appears on or near the jar.")


def _amount_pair(taking, keeping, a_move="down", b_move="same"):
    """The two jar descriptions. Which way each jar moves is stated once."""
    return _jar("BLUE", a_move, taking), _jar("RED", b_move, keeping)


_TAKE_ARC = ("A dashed grey arc springs from the AMBER cell and lands with a small "
             "arrowhead on the blue cell immediately next to it, one cell along. Both "
             "choices move on by exactly one, so this arc is the SAME length as the one "
             "in the other panel.")
_SKIP_ARC = ("A dashed grey arc springs from the AMBER cell and lands with a small "
             "arrowhead on the red cell immediately next to it, one cell along. It is "
             "the SAME length as the arc in the other panel.")

_PAIR_NOTE = ("THE TWO ROWS ARE DELIBERATELY IDENTICAL IN SHAPE. Both choices step on by "
              "one, so the row cannot tell them apart and the JAR is what does. The blue "
              "jar drops, the red jar does not. That contrast is the whole picture.")


def _row_and_amount(*, title, subtitle, unit, units, actor, actor_short, note, state_var,
                    amount_var, end_icon, end_label, base, a_chip, b_chip, a_line, b_line,
                    a_hi, b_hi, a_var, b_var, op, why, numbers, a_amber=None, a_gate=None,
                    taking="", keeping="", standing="looking at",
                    a_move="down", b_move="same"):
    take_jar, skip_jar = _amount_pair(taking, keeping, a_move, b_move)
    spec = {
        "title": title, "subtitle": subtitle, "unit": unit, "units": units,
        "standing": standing, "actor": actor, "actor_short": actor_short, "note": note,
        "state_var": state_var, "row": ["grey", "grey", "AMBER", "grey", "grey"],
        "amount": {"var": amount_var},
        "end_icon": end_icon, "end_label": end_label, "base": base,
        "a": {"chip": a_chip, "row": ["grey", "grey", "AMBER", "BLUE", "grey"],
              "arc": _TAKE_ARC, "jar": take_jar, "line": a_line, "hi": a_hi, "var": a_var},
        "b": {"chip": b_chip, "row": ["grey", "grey", "AMBER", "RED", "grey"],
              "arc": _SKIP_ARC, "jar": skip_jar, "line": b_line, "hi": b_hi, "var": b_var},
        "op": op, "why": why, "numbers": numbers, "note_extra": _PAIR_NOTE,
    }
    if a_amber:
        spec["a"]["amber"] = a_amber
    if a_gate:
        spec["a"]["gate"] = a_gate
    return spec


CHOICE["subsetsum"] = _row_and_amount(
    title="SUBSET SUM",
    subtitle="whether any group of these numbers adds up to exactly the target",
    unit="number", units="numbers",
    actor="A small cute cartoon mouse", actor_short="the mouse",
    note=['a row of tiles icon:  "a row of numbers, each usable once."',
          'a target icon:        "One group hitting the target is enough."'],
    state_var="item_index", amount_var="amount_left",
    end_icon="a small tile icon", end_label="LAST NUMBER",
    base={"q": "Nothing left to make?", "why": "this group worked", "ret": "True"},
    a_chip="USE THIS NUMBER", b_chip="PASS ON IT",
    a_line="can_make(item_index + 1, amount_left - number)", a_hi="amount_left -",
    b_line="can_make(item_index + 1, amount_left)", b_hi="item_index + 1",
    a_amber=["number"], a_gate="only if it is not bigger than the amount left",
    a_var="take", b_var="skip",
    taking="The lower fill is what says the target is closer.",
    keeping="The unchanged fill is what says the target is no nearer.",
    op={"kind": "infix", "name": "or", "glyph": "OR", "left": "take", "right": "skip"},
    why=["I only need ONE group to work, not the best one,",
         "so a single True anywhere is enough."],
    numbers=['the "+ 1" inside each call, because that is the code'],
)

CHOICE["equalpartition"] = _row_and_amount(
    title="EQUAL SUM PARTITION",
    subtitle="whether these numbers can be split into two piles of exactly the same total",
    unit="number", units="numbers",
    actor="A small cute cartoon rabbit", actor_short="the rabbit",
    note=['a balance scales icon:  "two piles, equal totals."',
          'a half icon:            "So one pile must be exactly half of everything."'],
    state_var="item_index", amount_var="half_left",
    end_icon="a small tile icon", end_label="LAST NUMBER",
    base={"q": "Half filled exactly?", "why": "the other pile matches it", "ret": "True"},
    a_chip="PUT IT IN THE PILE", b_chip="LEAVE IT OUT",
    a_line="can_make(item_index + 1, half_left - number)", a_hi="half_left -",
    b_line="can_make(item_index + 1, half_left)", b_hi="item_index + 1",
    a_amber=["number"], a_gate="only if it is not bigger than the half still to fill",
    a_var="take", b_var="skip",
    taking="The lower fill is what says the pile is closer to half.",
    keeping="The unchanged fill is what says the pile did not grow.",
    op={"kind": "infix", "name": "or", "glyph": "OR", "left": "take", "right": "skip"},
    why=["only ONE pile is ever built,",
         "because whatever is left over is automatically the other one."],
    numbers=['the "+ 1" inside each call, because that is the code'],
)

CHOICE["countsubsets"] = _row_and_amount(
    title="COUNT OF SUBSETS WITH SUM",
    subtitle="how many different groups of these numbers add up to exactly the target",
    unit="number", units="numbers",
    actor="A small cute cartoon mouse holding a tally stick", actor_short="the mouse",
    note=['a row of tiles icon:  "a row of numbers, each usable once."',
          'a tally icon:         "Count every group that works, not just one."'],
    state_var="item_index", amount_var="amount_left",
    end_icon="a small tile icon", end_label="LAST NUMBER",
    base={"q": "Nothing left to make?", "why": "that is one whole group", "ret": "1"},
    a_chip="USE THIS NUMBER", b_chip="PASS ON IT",
    a_line="count(item_index + 1, amount_left - number)", a_hi="amount_left -",
    b_line="count(item_index + 1, amount_left)", b_hi="item_index + 1",
    a_amber=["number"], a_gate="only if it is not bigger than the amount left",
    a_var="take", b_var="skip",
    taking="The lower fill is what says the target is closer.",
    keeping="The unchanged fill is what says the target is no nearer.",
    op={"kind": "infix", "name": "plus", "glyph": "+", "left": "take", "right": "skip"},
    why=["a group that uses this number is never a group that skips it,",
         "so the two counts add instead of competing."],
    numbers=['the "1" in "return 1", because that is what the code returns',
             'the "+ 1" inside each call, because that is the code'],
)

CHOICE["minsubsetdiff"] = _row_and_amount(
    title="MINIMUM SUBSET SUM DIFFERENCE",
    subtitle="the smallest gap I can leave between two piles made from these numbers",
    unit="number", units="numbers",
    actor="A small cute cartoon rabbit", actor_short="the rabbit",
    note=['a balance scales icon:  "two piles, as level as I can make them."',
          'a ruler icon:           "What I want is the gap, not the piles."'],
    state_var="item_index", amount_var="first_pile",
    end_icon="a small tile icon", end_label="LAST NUMBER",
    base={"q": "No numbers left?", "why": "measure the gap now", "ret": "the gap"},
    a_chip="PUT IT IN THE FIRST PILE", b_chip="PUT IT IN THE OTHER",
    a_line="best(item_index + 1, first_pile + number)", a_hi="first_pile +",
    b_line="best(item_index + 1, first_pile)", b_hi="item_index + 1",
    a_amber=["number"], a_var="take", b_var="skip",
    a_move="up",
    taking="The higher fill is what says this pile is growing.",
    keeping="The unchanged fill is what says this number went to the other pile.",
    op={"kind": "call", "name": "min", "glyph": "MIN", "args": "take, skip"},
    why=["every number lands in one pile or the other,",
         "so I keep whichever split leaves the smaller gap."],
    numbers=['the "+ 1" inside each call, because that is the code'],
)

CHOICE["targetsum"] = _row_and_amount(
    title="TARGET SUM",
    subtitle="how many ways I can put a plus or a minus in front of each number to hit the target",
    unit="number", units="numbers",
    actor="A small cute cartoon hedgehog", actor_short="the hedgehog",
    note=['a plus and minus icon:  "every number gets a sign, none are skipped."',
          'a target icon:          "Count every signing that hits the target."'],
    state_var="item_index", amount_var="still_to_reach",
    end_icon="a small tile icon", end_label="LAST NUMBER",
    base={"q": "Signed them all?", "why": "one if I landed on the target", "ret": "1 or 0"},
    a_chip="PUT A PLUS IN FRONT", b_chip="PUT A MINUS IN FRONT",
    a_line="count(item_index + 1, still_to_reach - number)", a_hi="still_to_reach -",
    b_line="count(item_index + 1, still_to_reach + number)", b_hi="still_to_reach +",
    a_amber=["number"], a_var="plus", b_var="minus",
    b_move="up",
    taking="The lower fill is what says a plus brought the target closer.",
    keeping="The higher fill is what says a minus pushed the target further away. This is "
            "the one card where the red jar moves at all, and it must plainly rise.",
    op={"kind": "infix", "name": "plus", "glyph": "+", "left": "plus", "right": "minus"},
    why=["this is not take or skip, because every number is used,",
         "so both signs are counted and neither is a refusal."],
    numbers=['the "1 or 0" in the base case, because that is what the code returns',
             'the "+ 1" inside each call, because that is the code'],
)

CHOICE["coinchange2"] = _row_and_amount(
    title="COIN CHANGE II",
    subtitle="how many different combinations of these coins add up to the amount",
    unit="coin", units="coins",
    actor="A small cute cartoon raccoon", actor_short="the raccoon",
    note=['a coin stack icon:  "each kind of coin may be used again and again."',
          'a tally icon:       "Count combinations, not orderings."'],
    state_var="coin_index", amount_var="amount_left",
    end_icon="a small coin icon", end_label="LAST COIN",
    base={"q": "Nothing left to pay?", "why": "that is one whole combination", "ret": "1"},
    a_chip="USE THIS COIN AGAIN", b_chip="RETIRE THIS COIN",
    a_line="count(coin_index, amount_left - coin)", a_hi="coin_index",
    b_line="count(coin_index + 1, amount_left)", b_hi="coin_index + 1",
    a_amber=["coin"], a_gate="only if the coin is not bigger than the amount left",
    a_var="use", b_var="drop",
    taking="The lower fill is what says the amount is closer to paid.",
    keeping="The unchanged fill is what says nothing was paid.",
    op={"kind": "infix", "name": "plus", "glyph": "+", "left": "use", "right": "drop"},
    why=["the index stays put when I use a coin, so the same coin can come again,",
         "and it only moves on when I retire that coin for good."],
    numbers=['the "1" in "return 1", because that is what the code returns',
             'the "+ 1" inside the second call, because that is the code'],
)

# ------------------------------------------------------- TWO STRINGS, AN IF AND AN ELSE
# On these the letters decide, so only one branch ever runs and nothing merges.

_TWO_ROWS = """Below that, TWO short rows of equal rounded cells, one above the other with a small
gap between them, each row holding FIVE cells with a letter written inside every cell.
The rows are the two strings.

In the TOP row the THIRD cell is solid AMBER. In the BOTTOM row the THIRD cell is
solid AMBER as well. Every other cell in both rows is plain grey.

{actor} stands between the two rows, level with the two amber cells, looking at both
at once.

Directly under each amber cell, in small plain AMBER code lettering with no box and no
connector: "{va}" under the top row, "{vb}" under the bottom row.

A thin AMBER curly brace joins the two rows, with one small CHARCOAL caption beneath:
   "two things say where I am"

FIVE CELLS IN EACH ROW, and the amber cell is the THIRD in both. The two amber cells
sit in the same column so the pair being compared is obvious at a glance.

A small charcoal magnifying glass sits over the two amber cells, because comparing
those two letters is the only thing this call does before it branches."""


def _two_rows(va, vb, actor):
    return _TWO_ROWS.format(va=va, vb=vb, actor=actor)


CHOICE["lcs"] = {
    "title": "LONGEST COMMON SUBSEQUENCE",
    "subtitle": "the longest run of letters that appears in both strings, in order, with gaps allowed",
    "unit": "pair of letters", "units": "letters", "standing": "looking at",
    "mode": "ifelse",
    "actor": "A small cute cartoon owl", "actor_short": "the owl",
    "note": ['two ribbons icon:  "two strings, compared letter by letter."',
             'a gap icon:        "Letters may be skipped, but never reordered."'],
    "state_var": "first_index",
    "state": _two_rows("first_index", "second_index", "A small cute cartoon owl"),
    "end_icon": "a small full stop icon at the end of each row", "end_label": "END",
    "base": {"q": "Either string used up?", "why": "nothing left to match", "ret": "0"},
    "fork": "Do the two letters match?",
    "a": {"chip": "THEY MATCH",
          "picture": """   Inside, the two rows redrawn with both amber cells ringed in BLUE and a small blue
   tick between them. Both rows have a blue arrow moving one cell to the right, so
   BOTH indexes advance together.
   One small blue caption: "this letter is in the answer"
   The owl stands between the rows.""",
          "line": "1 + lcs(first_index + 1, second_index + 1)", "hi": "1 +", "var": "grow"},
    "b": {"chip": "THEY DIFFER",
          "picture": """   Inside, the two rows redrawn with a small red cross between the amber cells. TWO
   separate red arrows are drawn, one advancing the TOP row only and one advancing the
   BOTTOM row only, side by side, so it is clear these are two different attempts and
   not one move.
   One small red caption: "give up one letter, try both ways of doing it"
   The owl stands between the rows.""",
          "line": "MAX(lcs(first + 1, second), lcs(first, second + 1))", "hi": "MAX",
          "var": "best"},
    "op": {"kind": "call", "name": "max", "glyph": "MAX",
           "args": "drop from the first, drop from the second"},
    "why": ["a match is never worth giving up,", "so only a mismatch has anything to choose."],
    "numbers": ['the "0" in "return 0" and the "1" that a match adds, because those are '
                'what the code returns',
                'the "+ 1" inside the calls, because that is the code'],
}

CHOICE["editdistance"] = {
    "title": "EDIT DISTANCE",
    "subtitle": "the fewest single letter edits that turn one string into the other",
    "unit": "pair of letters", "units": "letters", "standing": "looking at",
    "mode": "ifelse",
    "actor": "A small cute cartoon beaver holding a tiny rubber", "actor_short": "the beaver",
    "note": ['three tools icon:  "insert, delete, or replace one letter."',
             'a coin icon:       "Every edit costs exactly one."'],
    "state_var": "first_index",
    "state": _two_rows("first_index", "second_index",
                       "A small cute cartoon beaver holding a tiny rubber"),
    "end_icon": "a small full stop icon at the end of each row", "end_label": "END",
    "base": {"q": "One string empty?", "why": "insert whatever is left of the other",
             "ret": "what remains"},
    "fork": "Do the two letters match?",
    "a": {"chip": "THEY MATCH",
          "picture": """   Inside, the two rows redrawn with both amber cells ringed in BLUE and a small blue
   tick between them, and a blue arrow advancing BOTH rows one cell together.
   One small blue caption: "free move, nothing to pay"
   The beaver stands between the rows with its hands behind its back, doing nothing.""",
          "line": "edit(first_index + 1, second_index + 1)", "hi": "+ 1", "var": "free"},
    "b": {"chip": "THEY DIFFER",
          "picture": """   Inside, the two rows redrawn with a small red cross between the amber cells, and
   THREE separate small red arrows fanning out below, each labelled in tiny red
   lettering: "insert", "delete", "replace". The insert arrow advances the bottom row,
   the delete arrow advances the top row, the replace arrow advances both.
   One small red caption: "pay one, then pick the cheapest of the three"
   The beaver stands between the rows holding up the rubber.""",
          "line": "1 + MIN(insert, delete, replace)", "hi": "1 +", "var": "cheapest"},
    "op": {"kind": "call", "name": "min", "glyph": "MIN", "args": "insert, delete, replace",
           "outside": "1"},
    "why": ["the one is paid whichever edit I choose,",
            "so it sits outside the MIN and never inside it."],
    "numbers": ['the "1" that every edit costs, because that is the code',
                'the "+ 1" inside the calls, because that is the code'],
}

CHOICE["distinctsubseq"] = {
    "title": "DISTINCT SUBSEQUENCES",
    "subtitle": "how many different ways the small string hides inside the big one",
    "unit": "pair of letters", "units": "letters", "standing": "looking at",
    "mode": "ifelse",
    "actor": "A small cute cartoon mouse holding a tally stick", "actor_short": "the mouse",
    "note": ['two ribbons icon:  "the small string must appear in order."',
             'a tally icon:      "Count every position it could sit in."'],
    "state_var": "big_index",
    "state": _two_rows("big_index", "small_index",
                       "A small cute cartoon mouse holding a tally stick"),
    "end_icon": "a small full stop icon at the end of each row", "end_label": "END",
    "base": {"q": "Small string finished?", "why": "that is one whole way", "ret": "1"},
    "fork": "Do the two letters match?",
    "a": {"chip": "THEY MATCH",
          "picture": """   Inside, the two rows redrawn with both amber cells ringed in BLUE and a blue tick
   between them. TWO blue arrows are drawn: one advancing BOTH rows, and one advancing
   the TOP row alone.
   One small blue caption: "use this letter, or look for another one like it"
   The mouse stands between the rows.""",
          "line": "use + skip", "hi": "use", "var": "both_ways"},
    "b": {"chip": "THEY DIFFER",
          "picture": """   Inside, the two rows redrawn with a small red cross between the amber cells and ONE
   red arrow advancing the TOP row only, the bottom row plainly unchanged.
   One small red caption: "only one thing I can do, walk on"
   The mouse stands between the rows.""",
          "line": "count(big_index + 1, small_index)", "hi": "small_index", "var": "walk_on"},
    "op": {"kind": "infix", "name": "plus", "glyph": "+", "left": "use", "right": "skip"},
    "why": ["a matching letter can still be skipped,",
            "which is the step almost everybody forgets."],
    "numbers": ['the "1" in "return 1", because that is what the code returns',
                'the "+ 1" inside the calls, because that is the code'],
}

CHOICE["regex"] = {
    "title": "REGULAR EXPRESSION MATCHING",
    "subtitle": "whether the pattern matches the whole string, where a star means any number of the letter before it",
    "unit": "pair of letters", "units": "letters", "standing": "looking at",
    "mode": "ifelse",
    "actor": "A small cute cartoon cat wearing tiny glasses", "actor_short": "the cat",
    "note": ['a star icon:  "a star repeats the letter before it, any number of times."',
             'a dot icon:   "A dot matches any single letter."'],
    "state_var": "text_index",
    "state": _two_rows("text_index", "pattern_index",
                       "A small cute cartoon cat wearing tiny glasses"),
    "end_icon": "a small full stop icon at the end of each row", "end_label": "END",
    "base": {"q": "Pattern used up?", "why": "true only if the text is finished too",
             "ret": "True or False"},
    "fork": "Is the next pattern character a star?",
    "a": {"chip": "YES, A STAR",
          "picture": """   Inside, the two rows redrawn with the amber cell in the BOTTOM row and the cell
   after it ringed together in BLUE, showing the letter and its star as ONE unit. TWO
   blue arrows are drawn: one skipping the pair in the bottom row entirely, and one
   advancing the TOP row alone while the bottom row stays put.
   One small blue caption: "use it zero times, or one more time"
   The cat stands between the rows.""",
          "line": "zero_times or one_more", "hi": "or", "var": "star"},
    "b": {"chip": "NO STAR",
          "picture": """   Inside, the two rows redrawn with a small red magnifier over the two amber cells and
   ONE red arrow advancing BOTH rows together by one cell.
   One small red caption: "the letters must match right here"
   The cat stands between the rows.""",
          "line": "match(text_index + 1, pattern_index + 1)", "hi": "+ 1", "var": "plain"},
    "op": {"kind": "infix", "name": "or", "glyph": "OR",
           "left": "zero_times", "right": "one_more"},
    "why": ["a star is never its own character,",
            "it always belongs to the letter standing in front of it."],
    "numbers": ['the "+ 1" inside the calls, because that is the code'],
}

CHOICE["interleaving"] = {
    "title": "INTERLEAVING STRING",
    "subtitle": "whether two strings can be shuffled together, keeping each one in order, to spell a third",
    "unit": "letter", "units": "letters", "standing": "looking at",
    "actor": "A small cute cartoon squirrel", "actor_short": "the squirrel",
    "note": ['two ribbons plaiting icon:  "letters from either string, never reordered."',
             'a target icon:              "The result has to spell the third string exactly."'],
    "state_var": "first_index",
    "state": _two_rows("first_index", "second_index", "A small cute cartoon squirrel") + """

Below both rows, a THIRD row of five cells with a letter in each, outlined in charcoal
rather than amber, with its THIRD cell ringed in charcoal and one small charcoal
caption beside it:
   "the letter I have to produce next"

THE THIRD ROW IS NOT PART OF THE STATE. It is charcoal, not amber, and it carries no
label, because its position is always the two amber positions added together. That is
why this problem needs only two indexes and not three, and it is the thing worth
carrying away from this card.""",
    "end_icon": "a small full stop icon at the end of each row", "end_label": "END",
    "base": {"q": "All three finished together?", "why": "the shuffle worked", "ret": "True"},
    "a": {"chip": "TAKE IT FROM THE FIRST",
          "picture": """   Inside, the three rows redrawn, with the amber cell of the TOP row ringed in BLUE
   and a blue arrow advancing the TOP row by one. The bottom string row is plainly
   unchanged.
   One small blue caption: "this letter came from the first string"
   The squirrel stands beside the top row.""",
          "gate": "only if that letter is the one needed next",
          "line": "works(first_index + 1, second_index)", "hi": "first_index + 1",
          "var": "from_first"},
    "b": {"chip": "TAKE IT FROM THE SECOND",
          "picture": """   Inside, the three rows redrawn, with the amber cell of the BOTTOM row ringed in RED
   and a red arrow advancing the BOTTOM row by one. The top string row is plainly
   unchanged.
   One small red caption: "this letter came from the second string"
   The squirrel stands beside the bottom row.""",
          "gate": "only if that letter is the one needed next",
          "line": "works(first_index, second_index + 1)", "hi": "second_index + 1",
          "var": "from_second"},
    "op": {"kind": "infix", "name": "or", "glyph": "OR",
           "left": "from_first", "right": "from_second"},
    "why": ["I only need one shuffle to work,", "so a single True anywhere is enough."],
    "numbers": ['the "+ 1" inside the calls, because that is the code'],
}

CHOICE["longestpal"] = {
    "title": "LONGEST PALINDROMIC SUBSTRING",
    "subtitle": "the longest stretch of the string that reads the same both ways",
    "unit": "pair of ends", "units": "letters", "standing": "holding",
    "mode": "ifelse",
    "actor": "A small cute cartoon crab holding both ends", "actor_short": "the crab",
    "note": ['a mirror icon:      "it has to read the same from both ends."',
             'a no gaps icon:     "The stretch must be unbroken."'],
    "state_var": "left_end",
    "state": """Below that, ONE row of FIVE equal rounded cells with a letter written in each. The
FIRST and the LAST cell of the row are both solid AMBER, and every cell between them
is plain grey.

A small cute cartoon crab stands under the row with one claw touching each amber cell,
holding both ends at once.

Directly under the two amber cells, in small plain AMBER code lettering with no boxes:
   "left_end" under the first, "right_end" under the last.

A thin AMBER curly brace spans the whole row, with one small CHARCOAL caption beneath:
   "two things say where I am"

THE STATE IS A WINDOW, NOT A POSITION. Two ends, not one index, which is why this card
draws two amber cells and every other card draws one. A double headed charcoal arrow
between the two amber cells shows the stretch they enclose.""",
    "end_icon": "no end marker, because the window carries its own ends,", "end_label": "",
    "base": {"q": "Ends met, or crossed?", "why": "one letter is already a palindrome",
             "ret": "True"},
    "fork": "Do the two end letters match?",
    "a": {"chip": "THEY MATCH",
          "picture": """   Inside, the same row redrawn with both end cells ringed in BLUE and TWO blue arrows
   pointing INWARD, one from each end, so the window is visibly closing.
   One small blue caption: "the ends agree, so look inside"
   The crab stands under the row with its claws drawn closer together.""",
          "line": "inside(left_end + 1, right_end - 1)", "hi": "+ 1", "var": "inward"},
    "b": {"chip": "THEY DIFFER",
          "picture": """   Inside, the same row redrawn with both end cells ringed in RED and a small red cross
   drawn between them. NO arrows at all: nothing moves.
   One small red caption: "this stretch is finished, it cannot be a palindrome"
   The crab stands under the row with its claws apart.""",
          "line": "False", "hi": "False", "var": "dead_stop"},
    "op": {"kind": "infix", "name": "and", "glyph": "AND",
           "left": "the ends match", "right": "the inside is a palindrome"},
    "why": ["a mismatch is a dead stop that recurses into nothing,",
            "which is why this card is lopsided and the others are not."],
    "numbers": ['the "+ 1" and the "- 1" inside the call, because that is the code'],
}

CHOICE["palsub"] = {
    "title": "PALINDROMIC SUBSTRINGS",
    "subtitle": "how many of the stretches inside this string read the same both ways",
    "unit": "pair of ends", "units": "letters", "standing": "holding",
    "mode": "ifelse",
    "actor": "A small cute cartoon crab with a tally stick", "actor_short": "the crab",
    "note": ['a mirror icon:  "it has to read the same from both ends."',
             'a tally icon:   "Two stretches at different places count separately."'],
    "state_var": "left_end",
    "state": """Below that, ONE row of FIVE equal rounded cells with a letter written in each. The
FIRST and the LAST cell of the row are both solid AMBER, and every cell between them
is plain grey.

A small cute cartoon crab with a tally stick stands under the row with one claw
touching each amber cell.

Directly under the two amber cells, in small plain AMBER code lettering with no boxes:
   "left_end" under the first, "right_end" under the last.

A thin AMBER curly brace spans the whole row, with one small CHARCOAL caption beneath:
   "two things say where I am"

THE STATE IS A WINDOW, NOT A POSITION. Two ends, not one index. A double headed
charcoal arrow between the two amber cells shows the stretch they enclose.""",
    "end_icon": "no end marker, because the window carries its own ends,", "end_label": "",
    "base": {"q": "Ends met?", "why": "a single letter always counts", "ret": "1"},
    "fork": "Do the two end letters match?",
    "a": {"chip": "THEY MATCH",
          "picture": """   Inside, the same row redrawn with both end cells ringed in BLUE and TWO blue arrows
   pointing INWARD, and a small blue tally mark added beside the row.
   One small blue caption: "count this one, then look inside"
   The crab stands under the row with its claws drawn closer.""",
          "line": "1 + inside(left_end + 1, right_end - 1)", "hi": "1 +", "var": "counted"},
    "b": {"chip": "THEY DIFFER",
          "picture": """   Inside, the same row redrawn with both end cells ringed in RED, a small red cross
   between them, and NO arrows at all.
   One small red caption: "nothing to count here"
   The crab stands under the row with its claws apart.""",
          "line": "0", "hi": "0", "var": "nothing"},
    "op": {"kind": "infix", "name": "plus", "glyph": "+",
           "left": "1", "right": "whatever is inside"},
    "why": ["every centre is tried separately,",
            "so two identical stretches in different places both count."],
    "numbers": ['the "1" a match adds and the "0" a mismatch returns, because those are '
                'what the code returns',
                'the "+ 1" and "- 1" inside the call, because that is the code'],
}

CHOICE["uniquepaths"] = {
    "title": "UNIQUE PATHS",
    "subtitle": "how many different routes cross the grid, moving only right or down",
    "unit": "square", "units": "squares", "standing": "standing on",
    "actor": "A small cute cartoon turtle", "actor_short": "the turtle",
    "note": ['two arrows icon:  "only right, and only down."',
             'a flag icon:      "Count every route to the far corner."'],
    "state_var": "row_index",
    "state": """Below that, a GRID of FIVE cells across and FOUR cells down, all equal rounded cells
with small gaps, rather than a single row. Every cell is plain grey except ONE, which
is solid AMBER: the cell in the second row and the second column, so it plainly has
squares both to its right and below it.

A small cute cartoon turtle stands on the amber cell.

Directly under the grid, in small plain AMBER code lettering with no boxes, two labels
side by side: "row_index" and "column_index", joined by a thin AMBER curly brace with
one small CHARCOAL caption beneath it:
   "two things say where I am"

The bottom right cell of the grid carries a small flag icon and the grey label "GOAL".

THIS IS THE ONE CARD WITH A GRID INSTEAD OF A ROW, because two numbers are needed to
say where I am and one of them cannot be drawn along a line.""",
    "end_icon": "a small flag icon in the far corner", "end_label": "GOAL",
    "base": {"q": "Off the grid?", "why": "no route that way", "ret": "0"},
    "a": {"chip": "MOVE RIGHT",
          "picture": """   Inside, the same grid redrawn at the same size, with the cell immediately to the
   RIGHT of the amber one painted solid BLUE and a short dashed blue arrow pointing
   into it from the amber cell.
   The turtle stands on the amber cell facing right.""",
          "line": "paths(row_index, column_index + 1)", "hi": "column_index + 1",
          "var": "go_right"},
    "b": {"chip": "MOVE DOWN",
          "picture": """   Inside, the same grid redrawn at the same size, with the cell immediately BELOW the
   amber one painted solid RED and a short dashed red arrow pointing down into it from
   the amber cell.
   The turtle stands on the amber cell facing down.""",
          "line": "paths(row_index + 1, column_index)", "hi": "row_index + 1",
          "var": "go_down"},
    "op": {"kind": "infix", "name": "plus", "glyph": "+",
           "left": "go_right", "right": "go_down"},
    "why": ["a route that starts by going right is never one that starts by going down,",
            "so the counts add instead of competing."],
    "numbers": ['the "0" in "return 0", because that is what the code returns',
                'the "+ 1" inside the calls, because that is the code'],
}

# ------------------------------------------------------------ A LOOP THAT FANS OUT
# These four do not pick between two named options. They try every option in turn,
# so the card shows ONE panel with a fan of tries and no second box.

CHOICE["coinchange"] = {
    "title": "COIN CHANGE",
    "subtitle": "the fewest coins that add up to the amount, or none if it cannot be done",
    "unit": "amount", "units": "coins", "standing": "owing",
    "mode": "loop",
    "actor": "A small cute cartoon raccoon holding a purse", "actor_short": "the raccoon",
    "note": ['a coin stack icon:  "each kind of coin may be used again and again."',
             'a scales icon:      "I want the fewest coins, not the fewest kinds."'],
    "state_var": "amount_left",
    "state": """Below that, ONE tall rounded JAR outlined in AMBER with a pale amber fill, filled to
about three quarters of its height, with a small cute cartoon raccoon holding a purse
standing beside it. Underneath, in small plain AMBER code lettering with no box:
   "amount_left"

There is NO ROW OF CELLS ON THIS CARD, because there is no position to stand on. One
number is the whole state, and the jar is that number. Its fill level is the amount and
no figure appears on or near it.

To the left of the jar, a small tidy shelf holding THREE coins of visibly different
sizes, in charcoal, labelled in small grey capitals: "THE COINS I MAY USE"
The coins carry no figures. Their different sizes are what says they are worth
different amounts.""",
    "end_icon": "a small empty jar icon", "end_label": "PAID OFF",
    "base": {"q": "Nothing left to pay?", "why": "no coins needed", "ret": "0"},
    "fork": "So I could try every coin in turn.",
    "a": {"chip": "TRY EVERY COIN, ONE AT A TIME",
          "picture": """   Inside, ONE wide panel holding THREE small jars side by side, each a copy of the
   amber jar above but redrawn in BLUE, and each filled to a DIFFERENT lower level.
   Above each jar sits the coin that was spent, and a short dashed blue arrow runs from
   the big amber jar down into each of the three.
   Under the three jars, one small blue caption: "a bigger coin leaves less to pay"
   The three fills must be visibly different from each other. That difference is the
   only thing that says the coins are worth different amounts.

   THE FAN IS THE POINT. Three arrows leaving one jar is what says every coin is tried,
   not chosen between. Do not draw two boxes, and do not draw a single arrow.""",
          "gate": "only coins no bigger than the amount left",
          "line": "1 + fewest(amount_left - coin)", "hi": "1 +",
          "amber": ["coin"], "var": "each try"},
    "b": {"chip": "", "row": [], "arc": "", "line": "", "hi": "", "var": ""},
    "op": {"kind": "call", "name": "min", "glyph": "MIN",
           "args": "every coin I tried", "outside": "1"},
    "why": ["the one coin I just spent is paid whichever coin it was,",
            "so it sits outside the MIN and never inside it."],
    "numbers": ['the "0" in "return 0", because that is what the code returns',
                'the "1" added for the coin just spent, because that is the code'],
    "note_extra": ("WHY NOT ZERO WHEN IT CANNOT BE PAID. An impossible amount must come back "
                   "as something no MIN would ever pick, which is infinity, never zero. Zero "
                   "would look like the best answer of all and poison every call above it. "
                   "One small charcoal line under the result box says so: "
                   '"impossible comes back as infinity, never as zero."'),
}

CHOICE["wordbreak"] = {
    "title": "WORD BREAK",
    "subtitle": "whether the string can be cut into pieces that are all real words",
    "unit": "letter", "units": "letters", "standing": "standing on",
    "mode": "loop",
    "actor": "A small cute cartoon owl with a tiny dictionary", "actor_short": "the owl",
    "note": ['a dictionary icon:  "a list of words I am allowed to use."',
             'a scissors icon:    "Words may be reused as often as I like."'],
    "state_var": "current_letter",
    "row": ["grey", "grey", "AMBER", "grey", "grey"],
    "end_icon": "a small full stop icon", "end_label": "END OF THE STRING",
    "base": {"q": "Reached the end?", "why": "every piece was a word", "ret": "True"},
    "fork": "So I could try every cut from here.",
    "a": {"chip": "TRY EVERY CUT FROM HERE",
          "picture": """   Inside, the same five cells as above, and THREE dashed BLUE arcs of DIFFERENT
   lengths all springing from the AMBER cell: a short one landing on the next cell, a
   medium one landing two along, and a long one landing three along. Under each arc, a
   small blue bracket marks the piece that arc cuts off, and a tiny tick or cross sits
   beside each bracket showing whether that piece is in the dictionary.
   The owl stands just outside the row on its left holding the dictionary open.

   THREE ARCS FROM ONE CELL IS THE POINT. It is what says every cut is tried rather
   than one being chosen. Do not draw two panels and do not draw a single arc.""",
          "gate": "only cuts whose piece is a real word",
          "line": "can_break(after this piece)", "hi": "after this piece",
          "var": "each cut"},
    "b": {"chip": "", "row": [], "arc": "", "line": "", "hi": "", "var": ""},
    "op": {"kind": "call", "name": "any", "glyph": "ANY",
           "args": "every cut I tried"},
    "why": ["one working set of cuts is enough,",
            "so the longest word first is not always the right greedy guess."],
    "numbers": ["no numerals at all are needed on this page"],
}

CHOICE["burst"] = {
    "title": "BURST BALLOONS",
    "subtitle": "the most coins I can win by choosing the order I burst them in",
    "unit": "stretch of balloons", "units": "balloons", "standing": "holding",
    "mode": "loop",
    "actor": "A small cute cartoon hedgehog holding a tiny pin", "actor_short": "the hedgehog",
    "note": ['a balloon icon:   "bursting one makes its neighbours touch."',
             'a coin icon:      "A burst pays the two balloons either side of it."'],
    "state_var": "left_end",
    "state": """Below that, ONE row of FIVE equal rounded balloon shapes. The FIRST and the LAST are
both solid AMBER, and the three between them are plain grey.

A small cute cartoon hedgehog holding a tiny pin stands under the row with a claw at
each amber end.

Directly under the two amber balloons, in small plain AMBER code lettering with no
boxes: "left_end" under the first, "right_end" under the last.

A thin AMBER curly brace spans the row, with one small CHARCOAL caption beneath:
   "two things say where I am"

THE STATE IS A WINDOW, and the two amber balloons at its ends are the two that never
burst inside this call. That is what makes the pieces independent, and it is the only
reason this problem can be split at all.""",
    "end_icon": "no end marker, because the window carries its own ends,", "end_label": "",
    "base": {"q": "Nothing between the ends?", "why": "no balloons left to burst", "ret": "0"},
    "fork": "So I could try every balloon as the LAST one to burst.",
    "a": {"chip": "TRY EACH ONE AS THE LAST TO BURST",
          "picture": """   Inside, the same row of five balloons redrawn THREE times, stacked in a small column,
   each copy with a DIFFERENT middle balloon ringed in BLUE and marked with a tiny pin.
   In each copy, two thin blue brackets show the two smaller windows left either side of
   the ringed balloon.
   Under the three copies, one small blue caption: "the last one to burst still has both
   ends beside it"
   The hedgehog stands beside the stack.

   THREE COPIES IS THE POINT. Every balloon in the window gets its turn as the last one,
   and each turn splits the window into two smaller ones. Do not draw two panels.""",
          "line": "coins + best(left side) + best(right side)", "hi": "+",
          "amber": ["coins"], "var": "each choice of last"},
    "b": {"chip": "", "row": [], "arc": "", "line": "", "hi": "", "var": ""},
    "op": {"kind": "call", "name": "max", "glyph": "MAX",
           "args": "every balloon tried as the last"},
    "why": ["asking which bursts LAST keeps the two ends fixed,",
            "and asking which bursts first would not, which is why first fails."],
    "numbers": ['the "0" in "return 0", because that is what the code returns'],
}

CHOICE["lis"] = {
    "title": "LONGEST INCREASING SUBSEQUENCE",
    "subtitle": "the longest run of numbers that keeps going up, with gaps allowed",
    "unit": "number", "units": "numbers", "standing": "standing on",
    "mode": "loop",
    "actor": "A small cute cartoon frog", "actor_short": "the frog",
    "note": ['an upward staircase icon:  "each number must beat the one before it."',
             'a gap icon:                "Numbers may be skipped, never reordered."'],
    "state_var": "current_number",
    "state": """Below that, a row of FIVE equal rounded cells with a small gap between them, left to
right exactly:
   grey   grey   AMBER   grey   grey
A small cute cartoon frog stands on the amber cell. Nothing is written inside any cell,
but each cell is drawn at a DIFFERENT HEIGHT, like a tiny bar chart, so the reader can
see which numbers are bigger without a single figure being written.

FIVE CELLS, NOT FOUR AND NOT SIX, and the amber one is the THIRD of the five.

To the right inside the same box, a small rounded pill outlined in AMBER labelled in
small amber code lettering: "last_taken"
A thin AMBER curly brace joins the row and the pill, with one small CHARCOAL caption:
   "two things say where I am"

THE PILL IS WHY THIS NEEDS MORE THAN A POSITION. Whether I may take this number depends
on what I took last, so the position alone cannot be the state.""",
    "end_icon": "a small full stop icon", "end_label": "LAST NUMBER",
    "base": {"q": "Past the last number?", "why": "no run left to grow", "ret": "0"},
    "fork": "So I could try every number ahead of me.",
    "a": {"chip": "TRY EVERY NUMBER AHEAD",
          "picture": """   Inside, the same five bars redrawn, with THREE dashed BLUE arcs of different lengths
   springing from the AMBER bar to three later bars. Every arc that lands on a bar
   TALLER than the amber one carries a small blue tick. Any arc landing on a SHORTER bar
   carries a small grey cross and is drawn faded, showing the move is not allowed.
   Under the row, one small blue caption: "only the taller ones are legal"
   The frog stands just outside the row on its left.

   THE HEIGHTS DO THE WORK. Which moves are legal is shown by which bars are taller,
   never by writing the numbers down. Three arcs from one bar is what says every later
   number is tried rather than one being chosen.""",
          "gate": "only numbers taller than the one I last took",
          "line": "1 + longest(that number)", "hi": "1 +", "var": "each try"},
    "b": {"chip": "", "row": [], "arc": "", "line": "", "hi": "", "var": ""},
    "op": {"kind": "call", "name": "max", "glyph": "MAX",
           "args": "every number I could jump to", "outside": "1"},
    "why": ["a blocked take is worth nothing rather than being illegal,",
            "so the MAX quietly ignores it and nothing special is needed."],
    "numbers": ['the "0" in "return 0", because that is what the code returns',
                'the "1" added for the number just taken, because that is the code'],
}
