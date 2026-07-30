"""Per-problem content for the one-call cards. Rendered by build_cards.py.

Each entry supplies only what differs between problems. Everything else, the
style block, the grey-bar rules, the step layout, comes from build_cards.py.

shape:
    "choices"  both branches are explored and MERGE into one combine box
    "ifelse"   a condition picks the branch, columns stay separate

Keep the four `script` lines in the approved voice: first person, active,
present tense, plain words, and line three names the uncertainty that forces
the branching. See MASTER_ONE_CALL_DIAGRAM_PROMPT.md section 5b.
"""

PROBLEMS = [

# ============================================================ LINEAR / FIBONACCI

{
 "key": "stairs",
 "title": "CLIMBING STAIRS",
 "lc": 70,
 "signature": "climb(current_step)",
 "shape": "choices",
 "shape_note": ("two real choices, both explored. The results are ADDED, not "
                "maxed, because we are counting routes rather than optimising."),
 "example": """   "n = 4 steps.  You may climb 1 or 2 at a time."
   "GOAL: count the distinct ways to reach the top"
   "1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2  ->  answer 5"
   Then one small green line:
   "we are standing on step 1 right now.\"""",
 "call": "climb( current_step = 1 )",
 "promise": "Returns how many ways lead from here to the top.",
 "state": """      A long flat grey bar labelled "steps", divided by faint tick marks into
      4 segments, with the far right end labelled "TOP" in gold.
      A BRIGHT PURPLE square sits on the bar at step 1 with a small "1" under
      it, labelled "current_step". Everything left of it is pale grey hatched
      and crossed out.""",
 "code_panel": """      "climb( current_step ):"
   badge 1, blue:    "if current_step == total: return 1"
                     "if current_step > total:  return 0"
   badge 2, blue:    "two moves are allowed"
   badge 3, green:   "one_step = climb( current_step + 1 )"
   badge 4, red:     "two_step = climb( current_step + 2 )"
   badge 5, purple:  "return one_step + two_step\"""",
 "base_title": "AM I AT THE TOP?",
 "base_case": "Did I reach the final step?",
 "base_why": "If so, return 1, because that is one way of reaching the top.",
 "question_pill": "TWO MOVES FROM HERE",
 "branch_a": {
   "title": "CLIMB 1 STEP",
   "body": """   The bar redrawn with the purple square moved one segment right, so the
   square now reads "2", not "1". A green arrow of length one is drawn above
   it labelled "+1 step".""",
   "expr": "climb( current_step + 1 )",
   "numeric": "climb( 2 )",
   "change": "I am now standing one step higher",
   "label": "ONE STEP",
   "var": "one_step",
   "ret": "climb( current_step + 1 )",
 },
 "branch_b": {
   "title": "CLIMB 2 STEPS",
   "body": """   The bar redrawn with the purple square moved two segments right, so the
   square now reads "3", not "1". A red arrow of length two is drawn above it
   labelled "+2 steps".""",
   "expr": "climb( current_step + 2 )",
   "numeric": "climb( 3 )",
   "change": "I am now standing two steps higher",
   "label": "TWO STEPS",
   "var": "two_step",
   "ret": "climb( current_step + 2 )",
 },
 "merge_title": "ADD THEM UP",
 "combine": "one_step + two_step",
 "combine_note": "routes through one are never routes through the other, so the counts add",
 "corner": {
   "title": "WHY PLUS, NOT MAX",
   "body": """   "We are counting routes, not picking a best one."
   "Every route starts with either a 1 or a 2, never both,"
   "so the two groups never overlap and simply add.\"""",
 },
 "code": """   "def climb( current_step ):"
   ""
   "    if current_step == total:"
   "        return 1"
   "    if current_step > total:"
   "        return 0"
   ""
   "    one_step = climb( current_step + 1 )"
   "    two_step = climb( current_step + 2 )"
   ""
   "    return one_step + two_step\"""",
 "start": "climb( 0 )",
 "script": [
   ("purple", "I stand on a step and look at the two moves I am allowed to make."),
   ("green",  "If I climb one step, I count every way to finish from the next step up."),
   ("red",    "If I climb two steps, I count every way to finish from two steps up."),
   ("gold",   "I add the two counts, because a route that starts with one step can never be the same as a route that starts with two."),
 ],
 "script_colours": """"two moves" in dark teal, "climb one step" in bright green, "climb two
steps" in bright red, "I add the two counts" in purple, "never be the same" in
gold.""",
 "footer_chip": "then add memoization on the step number",
 "question": "You are climbing a staircase that takes n steps. Each time you may climb 1 or 2 steps. How many distinct ways can you climb to the top?",
 "html_shape": "Two real choices, both counted. The branches merge with a plus, not a max, because we are counting routes rather than optimising one.",
},

{
 "key": "mincost",
 "title": "MIN COST CLIMBING STAIRS",
 "lc": 746,
 "signature": "cheapest(current_step)",
 "shape": "choices",
 "shape_note": ("two real choices, both explored, merged with MIN. The cost of "
                "the step you stand on is paid before you move."),
 "example": """   "cost =  10   15   20"
   with the three values as small plain cells and "0 1 2" underneath
   "GOAL: reach past the last step for the least total cost"
   "start at step 1, pay 15, jump two  ->  answer 15"
   Then one small green line:
   "we are standing on step 0 right now.\"""",
 "call": "cheapest( current_step = 0 )",
 "promise": "Returns the cheapest total from here to the top.",
 "state": """      A long flat grey bar labelled "cost", with a BRIGHT PURPLE square at
      index 0 showing "10" and a small "0" under it, labelled "current_step".
      A gold chip beside the bar reads "pay 10 to stand here".
      The rest of the bar is plain empty grey.""",
 "code_panel": """      "cheapest( current_step ):"
   badge 1, blue:    "if current_step >= len(cost): return 0"
   badge 2, blue:    "price = cost[ current_step ]"
   badge 3, green:   "one_step = cheapest( current_step + 1 )"
   badge 4, red:     "two_step = cheapest( current_step + 2 )"
   badge 5, purple:  "return price + min( one_step , two_step )\"""",
 "base_title": "AM I PAST THE END?",
 "base_case": "if  current_step >= 3   ->   return 0",
 "base_why": "off the end of the stairs, nothing left to pay",
 "question_pill": "PAY 10, THEN CHOOSE HOW FAR TO JUMP",
 "branch_a": {
   "title": "JUMP 1 STEP",
   "body": """   The bar redrawn with the purple square moved one cell right, green arrow
   above it labelled "+1".""",
   "expr": "cheapest( current_step + 1 )",
   "numeric": "cheapest( 1 )",
   "change": "land on the next step and pay its price",
   "label": "ONE STEP",
   "ret": "price + cheapest( current_step + 1 )",
 },
 "branch_b": {
   "title": "JUMP 2 STEPS",
   "body": """   The bar redrawn with the purple square moved two cells right, red arrow
   above it labelled "+2", and the skipped cell pale grey and crossed out.""",
   "expr": "cheapest( current_step + 2 )",
   "numeric": "cheapest( 2 )",
   "change": "skip one step entirely and pay nothing for it",
   "label": "TWO STEPS",
   "ret": "price + cheapest( current_step + 2 )",
 },
 "merge_title": "PAY, THEN TAKE THE CHEAPER",
 "combine": "price + min( one_step , two_step )",
 "combine_note": "the price of this step is paid either way, so it sits outside the min",
 "corner": {
   "title": "WHY THE PRICE IS OUTSIDE",
   "body": """   "Standing here costs 10 no matter which jump I pick."
   "Only the rest of the journey is a choice,"
   "so the min wraps the two calls, not the 10.\"""",
 },
 "code": """   "def cheapest( current_step ):"
   ""
   "    if current_step >= len(cost):"
   "        return 0"
   ""
   "    price = cost[ current_step ]"
   ""
   "    one_step = cheapest( current_step + 1 )"
   "    two_step = cheapest( current_step + 2 )"
   ""
   "    return price + min( one_step , two_step )\"""",
 "start": "min( cheapest(0) , cheapest(1) )",
 "script": [
   ("purple", "I pay the price of the step I am standing on, and that cost is the same whatever I do next."),
   ("green",  "From here I can jump one step, and then I owe the cheapest total from there."),
   ("red",    "Or I can jump two steps, skipping one price completely."),
   ("gold",   "I don't know which jump is cheaper in the long run, so I try both and add my own price to the smaller one."),
 ],
 "script_colours": """"pay the price" in gold, "jump one step" in bright green, "jump two steps"
in bright red, "the cheapest total" in dark teal, "the smaller one" in purple.""",
 "footer_chip": "then add memoization on the step number",
 "question": "Each step of a staircase has a cost. You may start at step 0 or step 1, and from a step you may climb one or two steps. Return the minimum cost to reach the top.",
 "html_shape": "Two real choices merged with min. The price of the current step sits outside the min, because it is paid whichever jump you take.",
},

{
 "key": "robber",
 "title": "HOUSE ROBBER",
 "lc": 198,
 "signature": "rob(current_house)",
 "shape": "choices",
 "shape_note": ("two real choices, both explored, merged with MAX. Taking a "
                "house forces you to skip the next one."),
 "example": """   "houses =   2   7   9   3   1"
   with the five values as small plain cells and "0 1 2 3 4" underneath
   "GOAL: take the most money without robbing two houses in a row"
   "take 2, 9 and 1  ->  answer 12"
   Then one small green line:
   "we are standing outside house 0 right now.\"""",
 "call": "rob( current_house = 0 )",
 "promise": "Returns the most money I can still take from here on.",
 "state": """      A long flat grey bar labelled "houses", with a BRIGHT PURPLE square at
      index 0 showing "2" and a small "0" under it, labelled "current_house".
      The rest of the bar is plain empty grey.""",
 "code_panel": """      "rob( current_house ):"
   badge 1, blue:    "if current_house >= len(houses): return 0"
   badge 2, blue:    "money = houses[ current_house ]"
   badge 3, green:   "take = money + rob( current_house + 2 )"
   badge 4, red:     "skip = rob( current_house + 1 )"
   badge 5, purple:  "return max( take , skip )\"""",
 "base_title": "ARE THERE HOUSES LEFT?",
 "base_case": "if  current_house >= 5   ->   return 0",
 "base_why": "past the last house, there is nothing left to take",
 "question_pill": "ROB THIS HOUSE, OR WALK PAST IT?",
 "branch_a": {
   "title": "ROB IT",
   "body": """   The bar redrawn: the purple square filled solid green with a tick, the
   NEXT cell pale red and crossed out with a small label "alarm, must skip",
   and a green arrow jumping over it to the cell after.""",
   "expr": "money + rob( current_house + 2 )",
   "numeric": "2 + rob( 2 )",
   "change": "I bank this money but must jump two houses",
   "adds": True,
   "label": "TAKE",
   "ret": "money + rob( current_house + 2 )",
 },
 "branch_b": {
   "title": "WALK PAST",
   "body": """   The bar redrawn: the purple square pale grey and crossed out in red, and a
   red arrow moving to the very next cell.""",
   "expr": "rob( current_house + 1 )",
   "numeric": "rob( 1 )",
   "change": "I take nothing but the next house stays open",
   "label": "SKIP",
   "ret": "rob( current_house + 1 )",
 },
 "merge_title": "KEEP THE BIGGER HAUL",
 "combine": "max( take , skip )",
 "combine_note": "a rich house is not worth it if it locks a richer neighbour",
 "corner": {
   "title": "WHY NOT JUST GRAB THE BIG ONES",
   "body": """   "Grabbing 7 here would lock the 9 next door."
   "The cost of a choice shows up one house later,"
   "which is exactly why both paths must be tried.\"""",
 },
 "code": """   "def rob( current_house ):"
   ""
   "    if current_house >= len(houses):"
   "        return 0"
   ""
   "    money = houses[ current_house ]"
   ""
   "    take = money + rob( current_house + 2 )"
   "    skip = rob( current_house + 1 )"
   ""
   "    return max( take , skip )\"""",
 "start": "rob( 0 )",
 "script": [
   ("purple", "I stand outside a house and decide whether to rob it or walk past."),
   ("green",  "If I rob it, I take its money but the alarm forces me to skip the next house entirely."),
   ("red",    "If I walk past, I take nothing, but the next house is still mine to rob."),
   ("gold",   "I don't know whether this house is worth more than the one it locks, so I try both and keep the bigger haul."),
 ],
 "script_colours": """"rob it" in bright green, "skip the next house" in bright red, "walk past"
in bright red, "still mine to rob" in dark teal, "the bigger haul" in purple.""",
 "footer_chip": "then add memoization on the house number",
 "question": "Given an array of house values, rob the most money you can without robbing two adjacent houses.",
 "html_shape": "Two real choices merged with max. Taking a house is not free: it forces the next one to be skipped, so the cost of a choice lands one step later.",
},

{
 "key": "robber2",
 "title": "HOUSE ROBBER II",
 "lc": 213,
 "signature": "rob_circle(houses)",
 "shape": "choices",
 "shape_note": ("a REDUCTION, not a new recursion. The circle is cut into two "
                "straight streets and the original House Robber runs on BOTH, "
                "so the two branches merge with max."),
 "example": """   "houses =   2   3   2    arranged in a CIRCLE"
   "The first and last house are neighbours too."
   "GOAL: rob the most without taking two neighbours"
   "rob only the 3  ->  answer 3"
   Then one small green line:
   "the two 2s look tempting, but in a ring they touch." """,
 "call": "rob_circle( houses )",
 "promise": "Returns the best haul when the street bends into a ring.",
 "state": """      A ring of three grey houses drawn as a circle, showing 2, 3, 2, with a
      thick RED double headed arrow between the FIRST and the LAST house
      labelled "these two are neighbours too".
      Under it one line: "that one extra edge is the whole problem".""",
 "code_panel": """      "rob_circle( houses ):"
   badge 1, blue:    "if len(houses) == 1: return houses[0]"
   badge 2, blue:    "the two ends cannot both be robbed"
   badge 3, green:   "drop_last  = rob_line( houses[ :-1 ] )"
   badge 4, red:     "drop_first = rob_line( houses[ 1: ] )"
   badge 5, purple:  "return max( drop_last , drop_first )" """,
 "base_title": "IS THERE ONLY ONE HOUSE?",
 "base_case": "if  only one house   ->   return its value",
 "base_why": "with a single house there is no neighbour to clash with",
 "question_pill": "WHICH END DO I GIVE UP?",
 "branch_a": {
   "title": "GIVE UP THE LAST HOUSE",
   "body": """   The ring cut open and straightened into a flat grey bar, with the LAST
   house pale grey, hatched and crossed out in green, and a green label under
   it reading "now it is an ordinary street".""",
   "expr": "rob_line( houses without the last )",
   "numeric": "rob_line( 2 , 3 )",
   "change": "the first house is now safe to rob",
   "label": "DROP LAST",
   "ret": "rob_line( houses[ :-1 ] )",
 },
 "branch_b": {
   "title": "GIVE UP THE FIRST HOUSE",
   "body": """   The ring cut open and straightened into a flat grey bar, with the FIRST
   house pale grey, hatched and crossed out in red, and a red label under it
   reading "now it is an ordinary street".""",
   "expr": "rob_line( houses without the first )",
   "numeric": "rob_line( 3 , 2 )",
   "change": "the last house is now safe to rob",
   "label": "DROP FIRST",
   "ret": "rob_line( houses[ 1: ] )",
 },
 "merge_title": "KEEP THE BETTER RUN",
 "combine": "max( drop_last , drop_first )",
 "combine_note": "both streets are actually robbed, and the better haul wins",
 "corner": {
   "title": "WHY TWO RUNS IS ENOUGH",
   "body": """   "The only new rule is that the two ends touch."
   "Every valid haul must leave out at least one end,"
   "so covering both cases covers every possibility." """,
 },
 "code": """   "def rob_circle( houses ):"
   ""
   "    if len(houses) == 1:"
   "        return houses[0]"
   ""
   "    drop_last  = rob_line( houses[ :-1 ] )"
   "    drop_first = rob_line( houses[ 1: ] )"
   ""
   "    return max( drop_last , drop_first )"
   ""
   ""
   "# rob_line is plain House Robber"
   "def rob_line( row ):"
   "    take = skip = 0"
   "    for money in row:"
   "        take, skip = skip + money, max( take , skip )"
   "    return max( take , skip )" """,
 "start": "rob_circle( houses )",
 "script": [
   ("purple", "The houses form a ring, so the first and the last one are neighbours as well."),
   ("green",  "That means I can never rob both ends, and at least one of them has to be left out."),
   ("red",    "I don't know which end is the one worth giving up, so I run the straight line robber twice, once without the last house and once without the first."),
   ("gold",   "I return whichever of those two runs brings back more money."),
 ],
 "script_colours": """"a ring" in dark teal, "never rob both ends" in bright red, "without the last
house" in bright green, "without the first" in bright red, "whichever of those
two runs" in purple.""",
 "footer_chip": "each run is the ordinary House Robber, so this costs two passes",
 "question": "The houses are arranged in a circle, so the first and last are adjacent. Rob the most money without taking two adjacent houses.",
 "html_shape": "A reduction rather than a new recursion. The circle is cut into two straight streets and the original House Robber runs on each.",
},

{
 "key": "decode",
 "title": "DECODE WAYS",
 "lc": 91,
 "signature": "ways(current_index)",
 "shape": "choices",
 "shape_note": ("two real choices, both explored and ADDED. Each choice is "
                "gated: one digit must not be zero, two digits must land in "
                "10 to 26."),
 "example": """   "digits =   2   2   6"
   with the three characters as small plain cells and "0 1 2" underneath
   "A is 1, B is 2, all the way to Z is 26."
   "GOAL: count the ways the whole string can be decoded"
   "2 2 6, 22 6, 2 26  ->  answer 3"
   Then one small green line:
   "we are standing at digit 0 right now." """,
 "call": "ways( current_index = 0 )",
 "promise": "Returns how many ways the rest of the string decodes.",
 "state": """      A long flat grey bar labelled "digits", with a BRIGHT PURPLE square at
      index 0 showing "2" and a small "0" under it, labelled "current_index".
      The rest of the bar is plain empty grey.""",
 "code_panel": """      "ways( current_index ):"
   badge 1, blue:    "if current_index == len(digits): return 1"
                     "if digits[current_index] is '0':  return 0"
   badge 2, blue:    "two_digit = 0"
   badge 3, green:   "one_digit = ways( current_index + 1 )"
   badge 4, red:     "if the pair is 10 to 26:"
                     "     two_digit = ways( current_index + 2 )"
   badge 5, purple:  "return one_digit + two_digit" """,
 "base_title": "IS THE STRING FINISHED?",
 "base_case": "if  current_index == 3   ->   return 1",
 "base_why": "reaching the end means one complete decoding was found",
 "question_pill": "TAKE ONE DIGIT, OR TWO?",
 "branch_a": {
   "title": "TAKE ONE DIGIT",
   "body": """   The bar redrawn with the purple square faded and ticked green, a small
   green chip above it reading "2 is B", and the pointer moved one to the
   right.""",
   "expr": "ways( current_index + 1 )",
   "numeric": "ways( 1 )",
   "change": "one digit eaten, one letter decoded",
   "label": "ONE DIGIT",
   "ret": "ways( current_index + 1 )",
 },
 "branch_b": {
   "title": "TAKE TWO DIGITS",
   "body": """   A small blue gate pill at the top reading "is the pair 10 to 26 ?   22
   YES" with a green check. Then the bar redrawn with TWO squares faded and
   ticked, joined underneath by a red bracket labelled "22 is V", and the
   pointer moved two to the right.""",
   "expr": "ways( current_index + 2 )",
   "numeric": "ways( 2 )",
   "change": "two digits eaten, still just one letter",
   "label": "TWO DIGITS",
   "ret": "ways( current_index + 2 )",
 },
 "merge_title": "ADD THE TWO COUNTS",
 "combine": "one_digit + two_digit",
 "combine_note": "the two groups start with different letters, so they never overlap",
 "corner": {
   "title": "THE TWO GATES",
   "body": """   "A leading zero decodes to no letter at all, so that call returns 0."
   "A pair only works when it lands between 10 and 26."
   "A blocked choice is worth 0, so the plus still works." """,
 },
 "code": """   "def ways( current_index ):"
   ""
   "    if current_index == len(digits):"
   "        return 1"
   "    if digits[ current_index ] == '0':"
   "        return 0"
   ""
   "    one_digit = ways( current_index + 1 )"
   ""
   "    two_digit = 0"
   "    pair = digits[ current_index : current_index + 2 ]"
   "    if 10 <= int(pair) <= 26:"
   "        two_digit = ways( current_index + 2 )"
   ""
   "    return one_digit + two_digit" """,
 "start": "ways( 0 )",
 "script": [
   ("purple", "I stand at a digit and decide how much of the string the next letter uses up."),
   ("green",  "I can decode this digit on its own, as long as it is not a zero, and carry on from the next one."),
   ("red",    "I can also pair it with the digit after it, but only when that pair lands between 10 and 26."),
   ("gold",   "I add the two counts, because a decoding that starts with one digit is never the same as one that starts with two."),
 ],
 "script_colours": """"this digit on its own" in bright green, "not a zero" in bright red, "pair it
with the digit after" in bright red, "between 10 and 26" in dark teal, "I add
the two counts" in purple.""",
 "footer_chip": "then add memoization on the index",
 "question": "A message of digits is encoded with A as 1 through Z as 26. Count how many ways the string can be decoded.",
 "html_shape": "Two real choices added together, and both are gated. A leading zero kills the one-digit choice, and only 10 through 26 permits the two-digit choice.",
},

{
 "key": "maxprod",
 "title": "MAXIMUM PRODUCT SUBARRAY",
 "lc": 152,
 "signature": "best_ending_here(current_index)",
 "shape": "choices",
 "shape_note": ("two real choices, extend or start fresh, but with a twist: a "
                "negative flips big into small, so the SMALLEST product has to "
                "be carried along beside the largest."),
 "example": """   "numbers =   2   3   -2   4"
   with the four values as small plain cells and "0 1 2 3" underneath
   "GOAL: the largest product of any run of neighbours"
   "2 times 3  ->  answer 6"
   Then one small green line:
   "we are at the -2, carrying 6 as the best so far." """,
 "call": "best_ending_here( current_index = 2 )",
 "promise": "Returns the best product of a run that ends right here.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 2 showing "-2" and a small "2" under it, labelled "current_index".
      Beside the bar TWO chips: a green one reading "biggest so far = 6" and
      an orange one reading "smallest so far = 2", with a tiny label under
      them "both are carried along".""",
 "code_panel": """      "walk through numbers, carrying two values:"
   badge 1, blue:    "biggest = smallest = numbers[0]"
   badge 2, blue:    "value = numbers[ current_index ]"
   badge 3, green:   "extend_big   = biggest  * value"
                     "extend_small = smallest * value"
   badge 4, red:     "start_fresh  = value"
   badge 5, purple:  "biggest  = max( extend_big, extend_small, start_fresh )"
                     "smallest = min( extend_big, extend_small, start_fresh )" """,
 "base_title": "WHERE DOES IT START?",
 "base_case": "the first number seeds both carried values",
 "base_why": "a run ending at index 0 can only be that one number",
 "question_pill": "EXTEND THE RUN, OR START A NEW ONE?",
 "branch_a": {
   "title": "EXTEND THE RUN",
   "body": """   The bar redrawn with the purple square joined to the cells on its left by
   a green bracket underneath labelled "one longer run".
   Two small results shown: "6 times -2 = -12" and "2 times -2 = -4",
   with a red note beside them: "the negative flipped the best into the
   worst".""",
   "expr": "biggest * value    and    smallest * value",
   "numeric": "-12    and    -4",
   "change": "the run grows by one number",
   "label": "EXTEND",
   "ret": "biggest * value",
 },
 "branch_b": {
   "title": "START FRESH HERE",
   "body": """   The bar redrawn with everything left of the purple square pale grey,
   hatched and crossed out in red, and a red label under the square reading
   "a brand new run of length one".""",
   "expr": "value",
   "numeric": "-2",
   "change": "everything before this number is abandoned",
   "label": "FRESH",
   "ret": "value",
 },
 "merge_title": "KEEP BOTH ENDS OF THE RANGE",
 "combine": "max( extend_big , extend_small , start_fresh )",
 "combine_note": "and the min of the same three, because today's worst may be tomorrow's best",
 "corner": {
   "title": "WHY CARRY THE SMALLEST TOO",
   "body": """   "A negative number turns the biggest product into the smallest,"
   "and the smallest into the biggest."
   "So a very negative running product is an asset, not junk." """,
 },
 "code": """   "biggest = smallest = answer = numbers[0]"
   ""
   "for current_index in range( 1 , len(numbers) ):"
   ""
   "    value = numbers[ current_index ]"
   ""
   "    extend_big   = biggest  * value"
   "    extend_small = smallest * value"
   "    start_fresh  = value"
   ""
   "    biggest  = max( extend_big, extend_small, start_fresh )"
   "    smallest = min( extend_big, extend_small, start_fresh )"
   ""
   "    answer = max( answer , biggest )" """,
 "start": "biggest = smallest = numbers[0]",
 "script": [
   ("purple", "At each number I decide whether to extend the run I already have or start a brand new one right here."),
   ("green",  "Extending means multiplying my running product by this number, and starting fresh means the run is just this number on its own."),
   ("red",    "A negative number flips everything, turning my biggest product into my smallest, so I cannot only track the best."),
   ("gold",   "I carry both the biggest and the smallest product ending here, and the answer is the biggest I ever see."),
 ],
 "script_colours": """"extend the run" in bright green, "start a brand new one" in bright red, "a
negative number flips everything" in bright red, "both the biggest and the
smallest" in dark teal, "the biggest I ever see" in purple.""",
 "footer_chip": "one pass, two carried values, no table needed",
 "question": "Given an integer array, find the contiguous subarray with the largest product and return that product.",
 "html_shape": "Extend or start fresh, but a negative flips big into small, so the smallest product is carried alongside the largest.",
},

# ================================================================ 0/1 KNAPSACK
# Every problem below is the SAME take-or-skip choice on the same state.
# Only the combine operator changes: max, or, plus, min.

{
 "key": "knapsack",
 "title": "0/1 KNAPSACK",
 "lc": 0,
 "signature": "best(item_index, space_left)",
 "shape": "choices",
 "shape_note": ("two real choices merged with MAX. Taking is gated by whether "
                "the item still fits. This is the parent of the whole family."),
 "example": """   "weights =   1   3   4      values =   15   20   30"
   with the three items drawn as small plain cells
   "bag holds 4 units of weight"
   "GOAL: the most value that fits"
   "take items 1 and 3 is too heavy, so take item 3  ->  answer 35"
   Then one small green line:
   "we are looking at item 0, with the bag still empty." """,
 "call": "best( item_index = 0 , space_left = 4 )",
 "promise": "Returns the most value I can still pack from here.",
 "state": """      A long flat grey bar labelled "items", with a BRIGHT PURPLE square at
      index 0 labelled "item_index", showing "w 1 / v 15" in bold white.
      Beside the bar, a big GOLD bag doodle with a chip on it reading
      "space_left = 4", tiny label "carried along".""",
 "code_panel": """      "best( item_index , space_left ):"
   badge 1, blue:    "if item_index == len(weights): return 0"
   badge 2, blue:    "weight = weights[ item_index ]"
                     "value  = values[ item_index ]"
   badge 3, green:   "take = 0"
                     "if weight <= space_left:"
                     "     take = value + best( item_index+1, space_left-weight )"
   badge 4, red:     "skip = best( item_index + 1 , space_left )"
   badge 5, purple:  "return max( take , skip )" """,
 "base_title": "ARE THERE ITEMS LEFT?",
 "base_case": "if  item_index == 3   ->   return 0",
 "base_why": "no items left to consider, so no more value can be added",
 "question_pill": "PUT THIS ITEM IN THE BAG, OR LEAVE IT?",
 "branch_a": {
   "title": "TAKE IT",
   "body": """   A small blue gate pill at the top: "does it fit ?   1 <= 4   YES" with a
   green check.
   Then the bar redrawn with the purple square filled solid green and ticked,
   and the bag chip now reading "space_left = 3" with a green arrow showing
   4 shrinking to 3.""",
   "expr": "value + best( item_index + 1 , space_left - weight )",
   "numeric": "15 + best( 1 , 3 )",
   "change": "value banked, and the bag has less room",
   "adds": True,
   "label": "TAKE",
   "ret": "value + best( item_index + 1 , space_left - weight )",
 },
 "branch_b": {
   "title": "LEAVE IT",
   "body": """   The bar redrawn with the purple square pale grey and crossed out in red,
   and the bag chip still reading "space_left = 4", unchanged.""",
   "expr": "best( item_index + 1 , space_left )",
   "numeric": "best( 1 , 4 )",
   "change": "no value gained, but the bag keeps all its room",
   "label": "SKIP",
   "ret": "best( item_index + 1 , space_left )",
 },
 "merge_title": "KEEP THE MORE VALUABLE PACK",
 "combine": "max( take , skip )",
 "combine_note": "a heavy item can be worth less than the two lighter ones it displaces",
 "corner": {
   "title": "THE WHOLE FAMILY IS THIS",
   "body": """   "Subset Sum, Target Sum, Coin Change and the rest"
   "all make this same take or skip choice."
   "Only the last line changes: max, or, plus, min." """,
 },
 "code": """   "def best( item_index , space_left ):"
   ""
   "    if item_index == len(weights):"
   "        return 0"
   ""
   "    weight = weights[ item_index ]"
   "    value  = values[ item_index ]"
   ""
   "    take = 0"
   "    if weight <= space_left:"
   "        take = value + best( item_index + 1 ,"
   "                             space_left - weight )"
   ""
   "    skip = best( item_index + 1 , space_left )"
   ""
   "    return max( take , skip )" """,
 "start": "best( 0 , capacity )",
 "script": [
   ("purple", "I look at one item at a time and decide whether it goes in the bag."),
   ("green",  "I can only take it if it still fits, and taking it banks its value but leaves less room for everything after."),
   ("red",    "I don't know whether this item is worth the space it eats, so I also try leaving it behind and keeping the room."),
   ("gold",   "I return whichever choice packs the most value."),
 ],
 "script_colours": """"goes in the bag" in bright green, "only take it if it still fits" in dark
teal, "leaves less room" in bright red, "leaving it behind" in bright red, "the
most value" in purple.""",
 "footer_chip": "then add memoization on the item index and the space left",
 "question": "Given item weights and values and a bag capacity, pack the most total value without exceeding the capacity. Each item may be taken at most once.",
 "html_shape": "The parent of the family. Take or skip merged with max, and taking is gated by whether the item still fits.",
},

{
 "key": "subsetsum",
 "title": "SUBSET SUM",
 "lc": 0,
 "signature": "can_make(item_index, amount_left)",
 "shape": "choices",
 "shape_note": ("the same take or skip choice as knapsack, but the answers are "
                "true and false, so the combine is OR instead of max."),
 "example": """   "numbers =   3   34   4   12"
   with the four values as small plain cells
   "target = 7"
   "GOAL: can any subset add up to exactly 7?"
   "3 and 4  ->  answer yes"
   Then one small green line:
   "we are at the 3, still needing all 7." """,
 "call": "can_make( item_index = 0 , amount_left = 7 )",
 "promise": "Returns true if some subset from here hits the target exactly.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 0 showing "3", labelled "item_index".
      Beside the bar, a big TEAL chip reading "amount_left = 7", tiny label
      "how much is still owed".""",
 "code_panel": """      "can_make( item_index , amount_left ):"
   badge 1, blue:    "if amount_left == 0: return True"
                     "if item_index == len(numbers): return False"
   badge 2, blue:    "number = numbers[ item_index ]"
   badge 3, green:   "take = False"
                     "if number <= amount_left:"
                     "     take = can_make( item_index+1, amount_left-number )"
   badge 4, red:     "skip = can_make( item_index + 1 , amount_left )"
   badge 5, purple:  "return take or skip" """,
 "base_title": "IS THE TARGET ALREADY MET?",
 "base_case": "if  amount_left == 0   ->   return True",
 "base_why": "nothing left to pay means this subset worked. Running out of numbers is False.",
 "question_pill": "USE THIS NUMBER, OR PASS ON IT?",
 "branch_a": {
   "title": "USE IT",
   "body": """   A small blue gate pill: "does it fit ?   3 <= 7   YES" with a green check.
   Then the bar redrawn with the purple square filled solid green and ticked,
   and the teal chip now reading "amount_left = 4" with a green arrow showing
   7 shrinking to 4.""",
   "expr": "can_make( item_index + 1 , amount_left - number )",
   "numeric": "can_make( 1 , 4 )",
   "change": "the debt shrinks by this number",
   "label": "USE",
   "ret": "can_make( item_index + 1 , amount_left - number )",
 },
 "branch_b": {
   "title": "PASS ON IT",
   "body": """   The bar redrawn with the purple square pale grey and crossed out in red,
   and the teal chip still reading "amount_left = 7", unchanged.""",
   "expr": "can_make( item_index + 1 , amount_left )",
   "numeric": "can_make( 1 , 7 )",
   "change": "the debt is untouched",
   "label": "PASS",
   "ret": "can_make( item_index + 1 , amount_left )",
 },
 "merge_title": "ONE SUCCESS IS ENOUGH",
 "combine": "take  or  skip",
 "combine_note": "we only need one subset to work, not the best one",
 "corner": {
   "title": "SAME CHOICE, DIFFERENT COMBINE",
   "body": """   "Knapsack asked for the most value and used max."
   "This one only asks whether it is possible,"
   "so the very same two branches join with OR." """,
 },
 "code": """   "def can_make( item_index , amount_left ):"
   ""
   "    if amount_left == 0:"
   "        return True"
   "    if item_index == len(numbers):"
   "        return False"
   ""
   "    number = numbers[ item_index ]"
   ""
   "    take = False"
   "    if number <= amount_left:"
   "        take = can_make( item_index + 1 ,"
   "                         amount_left - number )"
   ""
   "    skip = can_make( item_index + 1 , amount_left )"
   ""
   "    return take or skip" """,
 "start": "can_make( 0 , target )",
 "script": [
   ("purple", "I go through the numbers one at a time and decide whether each one is part of my subset."),
   ("green",  "I can only use a number if it is not bigger than what I still owe, and using it shrinks the amount left."),
   ("red",    "I don't know whether this number belongs in the subset, so I also try passing on it and leaving the amount unchanged."),
   ("gold",   "I return true if either path reaches exactly zero, because one working subset is all I need."),
 ],
 "script_colours": """"part of my subset" in bright green, "not bigger than what I still owe" in dark
teal, "shrinks the amount left" in bright green, "passing on it" in bright red,
"either path" in purple.""",
 "footer_chip": "then add memoization on the index and the amount left",
 "question": "Given an array of positive numbers and a target, decide whether any subset adds up to exactly the target.",
 "html_shape": "The same take or skip as knapsack, but the answer is a yes or no, so the branches join with OR instead of max.",
},

{
 "key": "targetsum",
 "title": "TARGET SUM",
 "lc": 494,
 "signature": "count_ways(current_index, running_total)",
 "shape": "choices",
 "shape_note": ("the same two branches, but every number MUST be used. The "
                "choice is a plus sign or a minus sign, and the counts ADD."),
 "example": """   "numbers =   1   1   1      target = 1"
   with the three values as small plain cells
   "GOAL: put a + or a - in front of every number so the total is 1"
   "+1 +1 -1,  +1 -1 +1,  -1 +1 +1  ->  answer 3"
   Then one small green line:
   "we are at the first number, running total still 0." """,
 "call": "count_ways( current_index = 0 , running_total = 0 )",
 "promise": "Returns how many sign patterns from here hit the target.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 0 showing "1", labelled "current_index".
      Beside the bar, a TEAL chip reading "running_total = 0", tiny label
      "the sum built so far".""",
 "code_panel": """      "count_ways( current_index , running_total ):"
   badge 1, blue:    "if current_index == len(numbers):"
                     "     return 1 if running_total == target else 0"
   badge 2, blue:    "number = numbers[ current_index ]"
   badge 3, green:   "plus  = count_ways( current_index+1, running_total + number )"
   badge 4, red:     "minus = count_ways( current_index+1, running_total - number )"
   badge 5, purple:  "return plus + minus" """,
 "base_title": "HAVE ALL THE SIGNS BEEN PLACED?",
 "base_case": "if  current_index == 3   ->   return 1 if the total matches, else 0",
 "base_why": "every number now has a sign, so the total is either right or it is not",
 "question_pill": "PLUS SIGN, OR MINUS SIGN?",
 "branch_a": {
   "title": "PUT A PLUS IN FRONT",
   "body": """   The bar redrawn with the purple square filled solid green and a big green
   "+" drawn above it, and the teal chip now reading "running_total = 1" with
   a green arrow showing 0 becoming 1.""",
   "expr": "count_ways( current_index + 1 , running_total + number )",
   "numeric": "count_ways( 1 , 1 )",
   "change": "the total goes up by this number",
   "label": "PLUS",
   "ret": "count_ways( current_index + 1 , running_total + number )",
 },
 "branch_b": {
   "title": "PUT A MINUS IN FRONT",
   "body": """   The bar redrawn with the purple square filled solid red and a big red "-"
   drawn above it, and the teal chip now reading "running_total = -1" with a
   red arrow showing 0 becoming -1.""",
   "expr": "count_ways( current_index + 1 , running_total - number )",
   "numeric": "count_ways( 1 , -1 )",
   "change": "the total goes down by this number",
   "label": "MINUS",
   "ret": "count_ways( current_index + 1 , running_total - number )",
 },
 "merge_title": "ADD THE TWO COUNTS",
 "combine": "plus + minus",
 "combine_note": "no number is ever skipped here, it only gets one sign or the other",
 "corner": {
   "title": "NOT QUITE TAKE OR SKIP",
   "body": """   "Knapsack could leave an item out entirely."
   "Here every number must be used, so the branches are"
   "plus and minus rather than take and skip." """,
 },
 "code": """   "def count_ways( current_index , running_total ):"
   ""
   "    if current_index == len(numbers):"
   "        if running_total == target:"
   "            return 1"
   "        return 0"
   ""
   "    number = numbers[ current_index ]"
   ""
   "    plus  = count_ways( current_index + 1 ,"
   "                        running_total + number )"
   "    minus = count_ways( current_index + 1 ,"
   "                        running_total - number )"
   ""
   "    return plus + minus" """,
 "start": "count_ways( 0 , 0 )",
 "script": [
   ("purple", "Every number has to be used, so for each one I only choose whether it gets a plus or a minus."),
   ("green",  "If I choose a plus, the running total goes up by that number and I move on."),
   ("red",    "If I choose a minus, the running total goes down by it instead."),
   ("gold",   "I add the two counts, because each sign pattern is different, and at the very end I score one only if the total landed on the target."),
 ],
 "script_colours": """"a plus or a minus" in dark teal, "goes up" in bright green, "goes down" in
bright red, "I add the two counts" in purple, "landed on the target" in gold.""",
 "footer_chip": "then add memoization on the index and the running total",
 "question": "Put a plus or a minus in front of every number so the expression evaluates to the target. Count how many such assignments exist.",
 "html_shape": "Two branches added together, but nothing is ever skipped. Each number must take a sign, so the choice is plus or minus rather than take or skip.",
},

# ============================================================ UNBOUNDED / LOOP

{
 "key": "coinchange",
 "title": "COIN CHANGE",
 "lc": 322,
 "signature": "fewest(amount_left)",
 "shape": "loop",
 "shape_note": ("a LOOP of choices, not two branches. Every coin is tried, and "
                "the results merge with MIN. A coin may be reused, so the same "
                "coin list is available in the next call."),
 "example": """   "coins =   1   2   5      amount = 11"
   with the three coins drawn as small circles
   "GOAL: the fewest coins that add up to the amount"
   "5 + 5 + 1  ->  answer 3"
   Then one small green line:
   "we still owe the full 11." """,
 "call": "fewest( amount_left = 11 )",
 "promise": "Returns the fewest coins that still pay off this amount.",
 "state": """      A big TEAL chip in the centre reading "amount_left = 11", drawn like a
      price tag, with the label "how much is still owed".
      Beside it, three grey coin circles showing 1, 2 and 5, with a small
      label "every coin can be used again and again".""",
 "code_panel": """      "fewest( amount_left ):"
   badge 1, blue:    "if amount_left == 0: return 0"
                     "if amount_left < 0:  return infinity"
   badge 2, blue:    "best = infinity"
   badge 3, green:   "for coin in coins:"
                     "     tried = 1 + fewest( amount_left - coin )"
                     "     best  = min( best , tried )"
   badge 4, purple:  "return best" """,
 "base_title": "IS THE DEBT CLEARED?",
 "base_case": "if  amount_left == 0   ->   return 0",
 "base_why": "nothing left to pay needs no coins. Going below zero returns infinity.",
 "question_pill": "WHICH COIN DO I HAND OVER NEXT?",
 "loop_note": "there is no take or skip here. Every coin gets its turn.",
 "lanes": [
   {"colour": "green", "label": "PAY WITH THE 1",
    "body": """      A grey coin circle showing "1" handed over, and the teal chip shrinking
      from 11 to 10 with a green arrow.""",
    "expr": "1 + fewest( amount_left - 1 )", "numeric": "1 + fewest( 10 )"},
   {"colour": "blue", "label": "PAY WITH THE 2",
    "body": """      A grey coin circle showing "2" handed over, and the teal chip shrinking
      from 11 to 9 with a blue arrow.""",
    "expr": "1 + fewest( amount_left - 2 )", "numeric": "1 + fewest( 9 )"},
   {"colour": "red", "label": "PAY WITH THE 5",
    "body": """      A grey coin circle showing "5" handed over, and the teal chip shrinking
      from 11 to 6 with a red arrow.""",
    "expr": "1 + fewest( amount_left - 5 )", "numeric": "1 + fewest( 6 )"},
 ],
 "merge_title": "KEEP THE SMALLEST PILE",
 "combine": "min( every coin tried )",
 "combine_note": "each lane already paid one coin, so every lane carries its own 1 +",
 "corner": {
   "title": "WHY INFINITY, NOT ZERO",
   "body": """   "Overshooting the amount is not an answer worth zero coins,"
   "it is no answer at all."
   "Infinity makes sure a broken path never wins a min." """,
 },
 "code": """   "def fewest( amount_left ):"
   ""
   "    if amount_left == 0:"
   "        return 0"
   "    if amount_left < 0:"
   "        return infinity"
   ""
   "    best = infinity"
   ""
   "    for coin in coins:"
   "        tried = 1 + fewest( amount_left - coin )"
   "        best  = min( best , tried )"
   ""
   "    return best" """,
 "start": "fewest( amount )",
 "script": [
   ("purple", "I look at how much is still owed and try handing over each coin in turn."),
   ("green",  "Whichever coin I hand over, that is one coin spent, and the amount left shrinks by its value."),
   ("red",    "I don't know which coin leads to the smallest pile, so I try every one of them rather than always grabbing the biggest."),
   ("gold",   "I return one plus the best of all those attempts, and a path that overshoots counts as infinity so it can never win."),
 ],
 "script_colours": """"still owed" in dark teal, "one coin spent" in bright green, "shrinks by its
value" in bright green, "every one of them" in bright red, "the best of all
those attempts" in purple, "infinity" in gold.""",
 "footer_chip": "then add memoization on the amount left",
 "question": "Given coin denominations and an amount, return the fewest coins needed to make that amount, or -1 if it cannot be made.",
 "html_shape": "A loop of choices rather than two branches. Every coin is tried and the results merge with min, and a broken path returns infinity so it can never win.",
},

{
 "key": "coinchange2",
 "title": "COIN CHANGE II",
 "lc": 518,
 "signature": "count_combos(coin_index, amount_left)",
 "shape": "choices",
 "shape_note": ("take or skip again, merged with PLUS because we are counting. "
                "The take branch does NOT advance the coin index, because a "
                "coin may be reused."),
 "example": """   "coins =   1   2   5      amount = 5"
   with the three coins drawn as small circles
   "GOAL: count the combinations that make the amount"
   "1x5, 1+2+2, 1+1+1+2, 1+1+1+1+1  ->  answer 4"
   Then one small green line:
   "order does not matter, so 2+1+2 is not a new way." """,
 "call": "count_combos( coin_index = 0 , amount_left = 5 )",
 "promise": "Returns how many combinations from here make the amount.",
 "state": """      A row of three grey coin circles labelled "coins", with the coin at index
      0 filled BRIGHT PURPLE showing "1", labelled "coin_index".
      Beside it, a TEAL price tag chip reading "amount_left = 5".""",
 "code_panel": """      "count_combos( coin_index , amount_left ):"
   badge 1, blue:    "if amount_left == 0: return 1"
                     "if coin_index == len(coins): return 0"
   badge 2, blue:    "coin = coins[ coin_index ]"
   badge 3, green:   "use = 0"
                     "if coin <= amount_left:"
                     "     use = count_combos( coin_index, amount_left-coin )"
   badge 4, red:     "drop = count_combos( coin_index + 1 , amount_left )"
   badge 5, purple:  "return use + drop" """,
 "base_title": "IS THE AMOUNT PAID OFF?",
 "base_case": "if  amount_left == 0   ->   return 1",
 "base_why": "one complete combination was found. Running out of coins returns 0.",
 "question_pill": "USE THIS COIN AGAIN, OR RETIRE IT?",
 "branch_a": {
   "title": "USE THIS COIN",
   "body": """   The purple coin stays exactly where it is, with a green loop arrow curling
   back onto it labelled "same coin, still available".
   The teal chip shrinks from 5 to 4 with a green arrow.""",
   "expr": "count_combos( coin_index , amount_left - coin )",
   "numeric": "count_combos( 0 , 4 )",
   "change": "the amount drops, but the coin index does NOT move",
   "label": "USE",
   "ret": "count_combos( coin_index , amount_left - coin )",
 },
 "branch_b": {
   "title": "RETIRE THIS COIN",
   "body": """   The purple coin greyed out and crossed in red with a label "never used
   again", and the pointer moved to the next coin.
   The teal chip still reads 5, unchanged.""",
   "expr": "count_combos( coin_index + 1 , amount_left )",
   "numeric": "count_combos( 1 , 5 )",
   "change": "this coin is finished with, the amount is untouched",
   "label": "RETIRE",
   "ret": "count_combos( coin_index + 1 , amount_left )",
 },
 "merge_title": "ADD THE TWO COUNTS",
 "combine": "use + drop",
 "combine_note": "counting combinations, so the two groups add rather than compete",
 "corner": {
   "title": "WHY THE INDEX STAYS PUT",
   "body": """   "Staying on the same coin is what allows reuse."
   "Retiring a coin for good is what stops 1+2 and 2+1"
   "from being counted as two different combinations." """,
 },
 "code": """   "def count_combos( coin_index , amount_left ):"
   ""
   "    if amount_left == 0:"
   "        return 1"
   "    if coin_index == len(coins):"
   "        return 0"
   ""
   "    coin = coins[ coin_index ]"
   ""
   "    use = 0"
   "    if coin <= amount_left:"
   "        use = count_combos( coin_index ,"
   "                            amount_left - coin )"
   ""
   "    drop = count_combos( coin_index + 1 , amount_left )"
   ""
   "    return use + drop" """,
 "start": "count_combos( 0 , amount )",
 "script": [
   ("purple", "I work through the coins one at a time and decide how many of each to spend."),
   ("green",  "If I use this coin, the amount left drops, but I stay on the same coin so I can use it again."),
   ("red",    "If I retire it, I move to the next coin and never come back to this one."),
   ("gold",   "I add the two counts, and retiring for good is exactly what stops the same combination being counted in a different order."),
 ],
 "script_colours": """"use this coin" in bright green, "stay on the same coin" in dark teal, "retire
it" in bright red, "never come back" in bright red, "I add the two counts" in
purple.""",
 "footer_chip": "then add memoization on the coin index and the amount left",
 "question": "Given coin denominations and an amount, count how many distinct combinations of coins add up to the amount. Order does not matter.",
 "html_shape": "Take or skip added together, but taking does not advance the coin index, because a coin may be reused. Retiring a coin for good is what stops order from being double counted.",
},

{
 "key": "uniquepaths",
 "title": "UNIQUE PATHS",
 "lc": 62,
 "signature": "paths(row, column)",
 "shape": "choices",
 "shape_note": ("two real choices, both explored and ADDED, because we are "
                "counting routes. Moving off the grid contributes zero."),
 "example": """   "a 3 by 7 grid, start top left, finish bottom right"
   "you may only move RIGHT or DOWN"
   "GOAL: count the distinct routes to the finish"
   "for a 3 by 7 grid  ->  answer 28"
   Then one small green line:
   "we are sitting at the top left corner." """,
 "call": "paths( row = 0 , column = 0 )",
 "promise": "Returns how many routes lead from this square to the finish.",
 "state": """      A small grid of plain grey squares, 3 rows by 7 columns, drawn flat with
      thin borders. The square at row 0 column 0 is filled BRIGHT PURPLE and
      labelled "row 0, column 0". The bottom right square is filled GOLD and
      labelled "finish". Every other square is plain empty grey.""",
 "code_panel": """      "paths( row , column ):"
   badge 1, blue:    "if row == last_row and column == last_column:"
                     "     return 1"
                     "if off the grid: return 0"
   badge 2, blue:    "two moves are allowed"
   badge 3, green:   "go_right = paths( row , column + 1 )"
   badge 4, red:     "go_down  = paths( row + 1 , column )"
   badge 5, purple:  "return go_right + go_down" """,
 "base_title": "AM I AT THE FINISH?",
 "base_case": "if  row and column are the finish   ->   return 1",
 "base_why": "arriving is one complete route. Falling off the grid returns 0.",
 "question_pill": "MOVE RIGHT, OR MOVE DOWN?",
 "branch_a": {
   "title": "MOVE RIGHT",
   "body": """   The grid redrawn with the purple square moved one column right and a thick
   green arrow drawn from the old square to the new one.""",
   "expr": "paths( row , column + 1 )",
   "numeric": "paths( 0 , 1 )",
   "change": "the column goes up, the row stays put",
   "label": "RIGHT",
   "ret": "paths( row , column + 1 )",
 },
 "branch_b": {
   "title": "MOVE DOWN",
   "body": """   The grid redrawn with the purple square moved one row down and a thick red
   arrow drawn from the old square to the new one.""",
   "expr": "paths( row + 1 , column )",
   "numeric": "paths( 1 , 0 )",
   "change": "the row goes up, the column stays put",
   "label": "DOWN",
   "ret": "paths( row + 1 , column )",
 },
 "merge_title": "ADD THE ROUTE COUNTS",
 "combine": "go_right + go_down",
 "combine_note": "a route through the right neighbour is never a route through the one below",
 "corner": {
   "title": "WHY PLUS, NOT MAX",
   "body": """   "Nothing is being optimised here, only counted."
   "Every route leaves this square either rightward"
   "or downward, never both, so the counts simply add." """,
 },
 "code": """   "def paths( row , column ):"
   ""
   "    if row == last_row and column == last_column:"
   "        return 1"
   "    if row > last_row or column > last_column:"
   "        return 0"
   ""
   "    go_right = paths( row , column + 1 )"
   "    go_down  = paths( row + 1 , column )"
   ""
   "    return go_right + go_down" """,
 "start": "paths( 0 , 0 )",
 "script": [
   ("purple", "I stand on a square of the grid and I am only ever allowed to move right or down."),
   ("green",  "If I move right, I count every route that finishes from the square beside me."),
   ("red",    "If I move down, I count every route that finishes from the square below me."),
   ("gold",   "I add the two counts, because a route that leaves rightward can never be the same as one that leaves downward."),
 ],
 "script_colours": """"right or down" in dark teal, "move right" in bright green, "move down" in
bright red, "I add the two counts" in purple, "never be the same" in gold.""",
 "footer_chip": "then add memoization on the row and the column",
 "question": "A robot starts at the top left of an m by n grid and may only move right or down. Count the distinct paths to the bottom right.",
 "html_shape": "Two real choices added together. Nothing is optimised, only counted, so the branches merge with a plus.",
},

# =================================================================== LCS FAMILY

{
 "key": "editdistance",
 "title": "EDIT DISTANCE",
 "lc": 72,
 "signature": "edits(word1_index, word2_index)",
 "shape": "ifelse",
 "shape_note": ("if / else on the letter comparison. A match is FREE and moves "
                "both. A mismatch costs one edit and has THREE options, merged "
                "with min inside that branch."),
 "example": """   "word1 =  h o r s e        word2 =  r o s"
   with each word drawn as small plain cells
   "GOAL: fewest single letter edits to turn word1 into word2"
   "delete h, replace r with r, keep o, delete r, keep s  ->  answer 3"
   Then one small green line:
   "we are at the h and the r, nothing edited yet." """,
 "call": "edits( word1_index = 0 , word2_index = 0 )",
 "promise": "Returns the fewest edits still needed from here.",
 "state": """      Two long flat grey bars, one above the other.
      Row "word1": a BRIGHT PURPLE square showing "h" with "0" under it,
      labelled "word1_index", then plain empty grey.
      Row "word2": a BRIGHT PURPLE square showing "r" with "0" under it,
      labelled "word2_index", then plain empty grey.""",
 "code_panel": """      "edits( word1_index , word2_index ):"
   badge 1, blue:    "if word1_index == len(word1): return letters left in word2"
                     "if word2_index == len(word2): return letters left in word1"
   badge 2, blue:    "letter1 = word1[ word1_index ]"
                     "letter2 = word2[ word2_index ]"
   badge 3, green:   "if letter1 == letter2:"
                     "     return edits( word1_index+1 , word2_index+1 )"
   badge 4, red:     "return 1 + min( insert , delete , replace )" """,
 "base_title": "HAS EITHER WORD RUN OUT?",
 "base_case": "if  one word is finished   ->   return what is left of the other",
 "base_why": "with nothing to compare, every remaining letter is one edit",
 "question_pill": "letter1  ==  letter2  ?",
 "branch_a": {
   "title": "THEY MATCH   ->   FREE MOVE",
   "body": """   Both bars redrawn with their purple squares faded and ticked green, and
   both pointers stepped one to the right together.
   A big green chip beside them reading "costs 0 edits".""",
   "expr": "edits( word1_index + 1 , word2_index + 1 )",
   "numeric": "edits( 1 , 1 )",
   "change": "no edit spent, both pointers move",
   "label": "MATCH",
   "ret": "edits( word1_index + 1 , word2_index + 1 )",
 },
 "branch_b": {
   "title": "THEY DIFFER   ->   PAY 1, PICK ONE",
   "body": """   THREE small stacked rows, each in its own thin purple-outlined box, each
   showing what moves:
      "INSERT   edits( word1_index , word2_index + 1 )   = edits( 0 , 1 )"
         small line: "add letter2, only word2_index moves"
      "DELETE   edits( word1_index + 1 , word2_index )   = edits( 1 , 0 )"
         small line: "drop letter1, only word1_index moves"
      "REPLACE  edits( word1_index + 1 , word2_index + 1 ) = edits( 1 , 1 )"
         small line: "swap letter1 for letter2, both move"
   A big red curly brace to the LEFT spanning all three, with "min" in large
   red letters beside it, and a gold chip reading "+ 1 edit" above the brace.""",
   "expr": "1 + min( insert , delete , replace )",
   "numeric": "1 + min( edits(0,1) , edits(1,0) , edits(1,1) )",
   "change": "one edit spent whichever option is chosen",
   "label": "DIFFER",
   "ret": "1 + min( insert , delete , replace )",
 },
 "corner": {
   "title": "WHY THREE OPTIONS",
   "body": """   "Insert, delete and replace are the only single letter edits."
   "Each one leaves a different pair of pointers behind,"
   "which is exactly why all three have to be tried." """,
 },
 "code": """   "def edits( word1_index , word2_index ):"
   ""
   "    if word1_index == len(word1):"
   "        return len(word2) - word2_index"
   "    if word2_index == len(word2):"
   "        return len(word1) - word1_index"
   ""
   "    letter1 = word1[ word1_index ]"
   "    letter2 = word2[ word2_index ]"
   ""
   "    if letter1 == letter2:"
   "        return edits( word1_index + 1 , word2_index + 1 )"
   ""
   "    insert  = edits( word1_index , word2_index + 1 )"
   "    delete  = edits( word1_index + 1 , word2_index )"
   "    replace = edits( word1_index + 1 , word2_index + 1 )"
   ""
   "    return 1 + min( insert , delete , replace )" """,
 "start": "edits( 0 , 0 )",
 "script": [
   ("purple", "I compare the current letter of each word."),
   ("green",  "If they already match, there is nothing to fix, so I move forward in both words and it costs me nothing."),
   ("red",    "If they differ, I have to spend one edit, but I don't know which edit is best, so I try inserting, deleting and replacing."),
   ("gold",   "I return one plus the cheapest of those three, because whichever I pick, this one difference costs exactly one edit."),
 ],
 "script_colours": """"already match" in bright green, "costs me nothing" in bright green, "differ"
in bright red, "inserting, deleting and replacing" in bright red, "one plus the
cheapest" in purple.""",
 "footer_chip": "then add memoization on the two indexes",
 "question": "Given two words, return the minimum number of single character insertions, deletions or replacements needed to turn the first into the second.",
 "html_shape": "An if / else where the mismatch branch itself holds three options. A match is free, a mismatch costs one edit and picks the cheapest of insert, delete or replace.",
},

{
 "key": "longestpal",
 "title": "LONGEST PALINDROMIC SUBSTRING",
 "lc": 5,
 "signature": "expand(left_index, right_index)",
 "shape": "ifelse",
 "two_pointer": True,
 "shape_note": ("if / else, and lopsided. Matching ends let the window grow "
                "outward, a mismatch stops that centre dead."),
 "example": """   "text =  b a b a d"
   with the five letters as small plain cells and "0 1 2 3 4" underneath
   "GOAL: the longest stretch that reads the same both ways"
   "b a b  ->  answer 3"
   Then one small green line:
   "we are growing outward from the middle a, at index 1." """,
 "call": "expand( left_index = 1 , right_index = 1 )",
 "promise": "Grows this centre outward while both ends keep matching.",
 "state": """      A long flat grey bar labelled "text". A BRIGHT PURPLE square showing "a"
      and a TEAL square showing "a" sit on the SAME cell at index 1, drawn
      slightly offset so both are visible, labelled "left_index" and
      "right_index", with a small note "both start on the centre".
      The bar either side is plain empty grey.""",
 "code_panel": """      "expand( left_index , right_index ):"
   badge 1, blue:    "if left_index < 0 or right_index == len(text):"
                     "     return the window just inside"
   badge 2, blue:    "left_letter  = text[ left_index ]"
                     "right_letter = text[ right_index ]"
   badge 3, green:   "if left_letter == right_letter:"
                     "     return expand( left_index-1 , right_index+1 )"
   badge 4, red:     "return the window just inside" """,
 "base_title": "HAVE I RUN OFF EITHER EDGE?",
 "base_case": "if  left_index < 0   or   right_index == 5   ->   stop",
 "base_why": "there is no letter left to compare, so the window cannot grow further",
 "question_pill": "left_letter  ==  right_letter  ?",
 "branch_a": {
   "title": "THEY MATCH   ->   GROW OUTWARD",
   "body": """   The bar redrawn with the two squares stepping APART, purple one cell left
   and teal one cell right, two thick green arrows pointing outward, and the
   span between them tinted pale green labelled "still a palindrome".""",
   "expr": "expand( left_index - 1 , right_index + 1 )",
   "numeric": "expand( 0 , 2 )",
   "change": "the window gets two letters wider",
   "label": "GROW",
   "ret": "expand( left_index - 1 , right_index + 1 )",
 },
 "branch_b": {
   "title": "THEY DIFFER   ->   STOP HERE",
   "body": """   The bar redrawn with the two squares crossed out in red, a big red STOP
   sign doodle, and the words "NO recursive call" in large red lettering.
   The span already confirmed is outlined in gold and labelled "this is the
   best this centre can do".""",
   "expr": "no call at all",
   "numeric": "the window just inside",
   "change": "this centre is finished",
   "label": "STOP",
   "ret": "the window just inside",
 },
 "corner": {
   "title": "WHY EVERY CENTRE IS TRIED",
   "body": """   "An outer loop starts a fresh pair of pointers at every letter,"
   "and between every pair of letters for even lengths."
   "The longest window any centre reaches is the answer." """,
 },
 "code": """   "def expand( left_index , right_index ):"
   ""
   "    while left_index >= 0 and right_index < len(text)"
   "          and text[left_index] == text[right_index]:"
   "        left_index  -= 1"
   "        right_index += 1"
   ""
   "    return text[ left_index + 1 : right_index ]"
   ""
   ""
   "# every centre gets a turn"
   "best = ''"
   "for centre in range( len(text) ):"
   "    best = longer( best , expand( centre , centre ) )"
   "    best = longer( best , expand( centre , centre + 1 ) )" """,
 "start": "expand( centre , centre )   for every centre",
 "script": [
   ("purple", "I pick a centre and push two pointers outward from it, one to the left and one to the right."),
   ("green",  "While the two letters I land on keep matching, the window is still a palindrome and I can keep growing it."),
   ("red",    "The moment they differ I stop, because once the ends disagree nothing further out can rescue it."),
   ("gold",   "I try every letter as a centre, and every gap between letters for the even length ones, and keep the longest window I ever grew."),
 ],
 "script_colours": """"a centre" in dark teal, "outward" in dark teal, "keep matching" in bright
green, "keep growing it" in bright green, "the moment they differ I stop" in
bright red, "the longest window" in purple.""",
 "footer_chip": "every gap is a centre too, otherwise even length palindromes are missed",
 "question": "Given a string, return the longest substring that reads the same forwards and backwards.",
 "html_shape": "Two pointers pushed outward from a centre. Matching ends grow the window, a mismatch stops that centre dead with no recursive call.",
},

{
 "key": "distinctsubseq",
 "title": "DISTINCT SUBSEQUENCES",
 "lc": 115,
 "signature": "count(source_index, target_index)",
 "shape": "ifelse",
 "shape_note": ("if / else, but the match branch is unusual: even when the "
                "letters match you must ALSO try skipping, so that branch adds "
                "two calls together."),
 "example": """   "source =  r a b b b i t        target =  r a b b i t"
   with each string drawn as small plain cells
   "GOAL: count how many ways target appears inside source as a subsequence"
   "three different b choices  ->  answer 3"
   Then one small green line:
   "we are at the first letter of each." """,
 "call": "count( source_index = 0 , target_index = 0 )",
 "promise": "Returns how many ways the rest of target hides in the rest of source.",
 "state": """      Two long flat grey bars, one above the other.
      Row "source": a BRIGHT PURPLE square showing "r" with "0" under it,
      labelled "source_index", then plain empty grey.
      Row "target": a BRIGHT PURPLE square showing "r" with "0" under it,
      labelled "target_index", then plain empty grey.""",
 "code_panel": """      "count( source_index , target_index ):"
   badge 1, blue:    "if target_index == len(target): return 1"
                     "if source_index == len(source): return 0"
   badge 2, blue:    "source_letter = source[ source_index ]"
                     "target_letter = target[ target_index ]"
   badge 3, green:   "if they match:"
                     "     return use_it + skip_it"
   badge 4, red:     "return skip_it" """,
 "base_title": "IS THE TARGET FULLY MATCHED?",
 "base_case": "if  target_index == 6   ->   return 1",
 "base_why": "the whole target was found, that is one complete way. Source running out returns 0.",
 "question_pill": "source_letter  ==  target_letter  ?",
 "branch_a": {
   "title": "THEY MATCH   ->   TWO WAYS TO USE IT",
   "body": """   Two small stacked rows, each in its own thin purple-outlined box:
      "USE IT     count( source_index + 1 , target_index + 1 )  = count(1,1)"
         small line: "spend this source letter on the target"
      "SAVE IT    count( source_index + 1 , target_index )      = count(1,0)"
         small line: "keep looking for another copy later"
   A big green PLUS sign between the two boxes, large and bold.""",
   "expr": "count( s+1 , t+1 )  +  count( s+1 , t )",
   "numeric": "count( 1 , 1 ) + count( 1 , 0 )",
   "change": "both futures are counted, not compared",
   "label": "MATCH",
   "ret": "count( s+1 , t+1 ) + count( s+1 , t )",
 },
 "branch_b": {
   "title": "THEY DIFFER   ->   ONLY ONE WAY",
   "body": """   The source bar redrawn with its purple square crossed out in red and the
   pointer moved on. The target bar is untouched, with a red label
   "target_index does not move".""",
   "expr": "count( source_index + 1 , target_index )",
   "numeric": "count( 1 , 0 )",
   "change": "this source letter is useless here, walk past it",
   "label": "DIFFER",
   "ret": "count( source_index + 1 , target_index )",
 },
 "corner": {
   "title": "WHY MATCHING STILL SKIPS",
   "body": """   "A matching letter is not forced to be the one you use."
   "Another copy further along may start a different way,"
   "and we are counting ways, so both are added." """,
 },
 "code": """   "def count( source_index , target_index ):"
   ""
   "    if target_index == len(target):"
   "        return 1"
   "    if source_index == len(source):"
   "        return 0"
   ""
   "    source_letter = source[ source_index ]"
   "    target_letter = target[ target_index ]"
   ""
   "    skip_it = count( source_index + 1 , target_index )"
   ""
   "    if source_letter == target_letter:"
   "        use_it = count( source_index + 1 , target_index + 1 )"
   "        return use_it + skip_it"
   ""
   "    return skip_it" """,
 "start": "count( 0 , 0 )",
 "script": [
   ("purple", "I compare the current letter of the source with the current letter of the target."),
   ("green",  "If they match, I can spend this source letter on the target, but I can also save it and look for another copy further along."),
   ("red",    "If they don't match, this source letter is no use to me here, so I walk past it and the target stays where it is."),
   ("gold",   "I add the counts rather than compare them, because every different choice of which copy to use is a different way."),
 ],
 "script_colours": """"spend this source letter" in bright green, "save it" in bright green, "no use
to me here" in bright red, "walk past it" in bright red, "I add the counts" in
purple.""",
 "footer_chip": "then add memoization on the two indexes",
 "question": "Given two strings, count how many distinct subsequences of the first equal the second.",
 "html_shape": "An if / else where matching does not force your hand. A matched letter can be used or saved for a later copy, and because we are counting, those two futures add.",
},

{
 "key": "interleaving",
 "title": "INTERLEAVING STRING",
 "lc": 97,
 "signature": "can_weave(first_index, second_index)",
 "shape": "choices",
 "shape_note": ("two real choices merged with OR. The next letter of the target "
                "must come from one of the two sources, and either may work."),
 "example": """   "first =  a a b c        second =  d b b c a"
   "target =  a a d b b c b c a"
   with each string drawn as small plain cells
   "GOAL: can the target be woven from the two, keeping each in order?"
   "  ->  answer yes"
   Then one small green line:
   "nothing taken from either string yet." """,
 "call": "can_weave( first_index = 0 , second_index = 0 )",
 "promise": "Returns true if the rest of the target can be woven from what is left.",
 "state": """      Three long flat grey bars stacked.
      Row "first": a BRIGHT PURPLE square showing "a", labelled "first_index".
      Row "second": a TEAL square showing "d", labelled "second_index".
      Row "target": a GOLD square showing "a", labelled "the letter we owe",
      with a small note "its position is first_index + second_index".""",
 "code_panel": """      "can_weave( first_index , second_index ):"
   badge 1, blue:    "if both strings are used up:"
                     "     return True"
   badge 2, blue:    "needed = target[ first_index + second_index ]"
   badge 3, green:   "from_first = first has letters left and"
                     "     first[first_index] == needed and"
                     "     can_weave( first_index + 1 , second_index )"
   badge 4, red:     "from_second = second has letters left and"
                     "     second[second_index] == needed and"
                     "     can_weave( first_index , second_index + 1 )"
   badge 5, purple:  "return from_first or from_second" """,
 "base_title": "ARE BOTH STRINGS USED UP?",
 "base_case": "if  both indexes are at the end   ->   return True",
 "base_why": "every letter was placed and the target was built exactly",
 "question_pill": "WHICH STRING SUPPLIES THE NEXT LETTER?",
 "branch_a": {
   "title": "TAKE IT FROM THE FIRST",
   "body": """   A small blue gate pill: "does first[0] equal the letter we owe ?   a = a
   YES" with a green check.
   Then the first bar redrawn with its purple square ticked green and the
   pointer moved on, the second bar untouched, and the gold target square
   moved one to the right.""",
   "expr": "can_weave( first_index + 1 , second_index )",
   "numeric": "can_weave( 1 , 0 )",
   "change": "only first_index moves",
   "label": "FROM FIRST",
   "ret": "can_weave( first_index + 1 , second_index )",
 },
 "branch_b": {
   "title": "TAKE IT FROM THE SECOND",
   "body": """   A small blue gate pill: "does second[0] equal the letter we owe ?   d vs a
   NO" with a red X, and a label "this lane is blocked right now".
   The second bar redrawn with its teal square crossed in red.""",
   "expr": "can_weave( first_index , second_index + 1 )",
   "numeric": "blocked, contributes False",
   "change": "only second_index moves, when the letter allows it",
   "label": "FROM SECOND",
   "ret": "can_weave( first_index , second_index + 1 )",
 },
 "merge_title": "EITHER ROUTE WILL DO",
 "combine": "from_first  or  from_second",
 "combine_note": "a blocked lane is worth False, so the or still has an answer",
 "corner": {
   "title": "WHY NO THIRD INDEX",
   "body": """   "The position in the target is never stored."
   "It is always first_index + second_index,"
   "because every letter placed came from one of the two." """,
 },
 "code": """   "def can_weave( first_index , second_index ):"
   ""
   "    if first_index == len(first) and second_index == len(second):"
   "        return True"
   ""
   "    needed = target[ first_index + second_index ]"
   ""
   "    from_first = ( first_index < len(first)"
   "                   and first[first_index] == needed"
   "                   and can_weave( first_index + 1 , second_index ) )"
   ""
   "    from_second = ( second_index < len(second)"
   "                    and second[second_index] == needed"
   "                    and can_weave( first_index , second_index + 1 ) )"
   ""
   "    return from_first or from_second" """,
 "start": "can_weave( 0 , 0 )",
 "script": [
   ("purple", "I look at the next letter the target needs, and it has to come from one of my two strings."),
   ("green",  "If the first string offers that letter, I can take it from there and move only that pointer."),
   ("red",    "If the second string offers it too, I don't know which one to spend, so I try that route as well."),
   ("gold",   "I return true if either route works, and I never track a position in the target because it is always the two indexes added together."),
 ],
 "script_colours": """"the next letter the target needs" in dark teal, "from the first string" in
bright green, "from the second" in bright red, "either route works" in purple,
"the two indexes added together" in gold.""",
 "footer_chip": "then add memoization on the two indexes",
 "question": "Given three strings, decide whether the third is formed by interleaving the first two while keeping the order of each.",
 "html_shape": "Two real choices joined with OR. The next letter owed must come from one of the two strings, and the position in the target is never stored because it is just the two indexes added.",
},

{
 "key": "regex",
 "title": "REGULAR EXPRESSION MATCHING",
 "lc": 10,
 "signature": "matches(text_index, pattern_index)",
 "shape": "ifelse",
 "shape_note": ("if / else on whether the NEXT pattern character is a star. "
                "A star branch has two options joined by OR, a plain branch "
                "just steps both forward."),
 "example": """   "text =  a a b        pattern =  a * b"
   with each drawn as small plain cells
   "a dot matches any single letter. A star means zero or more of the"
   "character before it."
   "a* eats both a letters, then b matches b  ->  answer yes"
   Then one small green line:
   "we are at the first a, and the pattern starts with a star group." """,
 "call": "matches( text_index = 0 , pattern_index = 0 )",
 "promise": "Returns true if the rest of the text fits the rest of the pattern.",
 "state": """      Two long flat grey bars.
      Row "text": a BRIGHT PURPLE square showing "a" with "0" under it,
      labelled "text_index".
      Row "pattern": a BRIGHT PURPLE square showing "a" with "0" under it,
      labelled "pattern_index", and the NEXT cell showing a big gold star,
      circled and labelled "the star belongs to the a".""",
 "code_panel": """      "matches( text_index , pattern_index ):"
   badge 1, blue:    "if pattern is finished: return text is finished too"
   badge 2, blue:    "here = text has letters left and"
                     "       pattern[pattern_index] in ( text letter , '.' )"
   badge 3, green:   "if next pattern char is '*':"
                     "     return skip_group or (here and eat_one)"
   badge 4, red:     "return here and matches( text+1 , pattern+1 )" """,
 "base_title": "IS THE PATTERN USED UP?",
 "base_case": "if  pattern_index == len(pattern)   ->   return text is finished too",
 "base_why": "an empty pattern only matches an empty piece of text",
 "question_pill": "IS THE NEXT PATTERN CHARACTER A STAR?",
 "branch_a": {
   "title": "YES, A STAR   ->   TWO OPTIONS",
   "body": """   Two small stacked rows, each in its own thin purple-outlined box:
      "USE IT ZERO TIMES   matches( text_index , pattern_index + 2 )
       = matches( 0 , 2 )"
         small line: "jump the whole a* group, text untouched"
      "EAT ONE LETTER      matches( text_index + 1 , pattern_index )
       = matches( 1 , 0 )"
         small line: "consume one a, the group stays available"
   A big green OR between the two boxes, large and bold.""",
   "expr": "skip the group   or   eat one letter",
   "numeric": "matches( 0 , 2 )   or   matches( 1 , 0 )",
   "change": "either the group is abandoned or the text shrinks by one",
   "label": "STAR",
   "ret": "matches( t , p+2 )  or  ( here and matches( t+1 , p ) )",
 },
 "branch_b": {
   "title": "NO STAR   ->   ONE PLAIN STEP",
   "body": """   A small blue gate pill: "does this character match ?   a vs a, or a dot
   YES" with a green check.
   Then both bars redrawn with their purple squares ticked and both pointers
   stepped one to the right together.""",
   "expr": "matches( text_index + 1 , pattern_index + 1 )",
   "numeric": "matches( 1 , 1 )",
   "change": "both move exactly one, if the character agreed",
   "label": "PLAIN",
   "ret": "here  and  matches( text_index + 1 , pattern_index + 1 )",
 },
 "corner": {
   "title": "THE STAR IS NOT ITS OWN CHARACTER",
   "body": """   "A star always belongs to the character before it."
   "That is why skipping the group jumps TWO cells,"
   "and why eating a letter leaves pattern_index alone." """,
 },
 "code": """   "def matches( text_index , pattern_index ):"
   ""
   "    if pattern_index == len(pattern):"
   "        return text_index == len(text)"
   ""
   "    here = ( text_index < len(text) and"
   "             pattern[pattern_index] in"
   "                 ( text[text_index] , '.' ) )"
   ""
   "    star_next = ( pattern_index + 1 < len(pattern)"
   "                  and pattern[pattern_index + 1] == '*' )"
   ""
   "    if star_next:"
   "        skip_group = matches( text_index , pattern_index + 2 )"
   "        eat_one    = here and matches( text_index + 1 ,"
   "                                       pattern_index )"
   "        return skip_group or eat_one"
   ""
   "    return here and matches( text_index + 1 ,"
   "                             pattern_index + 1 )" """,
 "start": "matches( 0 , 0 )",
 "script": [
   ("purple", "Before anything else I check whether the next pattern character is a star, because a star changes everything."),
   ("green",  "With a star I can use the group zero times and jump past it entirely, leaving the text untouched."),
   ("red",    "Or, if the current letter fits, I can eat one letter and keep the group around, and I don't know which of those is right, so I try both."),
   ("gold",   "Without a star it is simple: the characters must agree and both pointers step forward exactly one."),
 ],
 "script_colours": """"a star" in gold, "zero times" in bright green, "jump past it" in bright green,
"eat one letter" in bright red, "keep the group around" in bright red, "must
agree" in purple.""",
 "footer_chip": "then add memoization on the two indexes",
 "question": "Implement regular expression matching where a dot matches any single character and a star matches zero or more of the preceding element.",
 "html_shape": "The fork is whether a star follows. A star branch tries using the group zero times or eating one letter and joins them with OR. Without a star, both pointers simply step one.",
},

{
 "key": "stock",
 "title": "STOCK WITH COOLDOWN",
 "lc": 309,
 "signature": "trade(day_index, holding)",
 "shape": "choices",
 "shape_note": ("two real choices merged with MAX, but the state carries a flag. "
                "Selling jumps TWO days because of the cooldown."),
 "example": """   "prices =   1   2   3   0   2"
   with the five values as small plain cells and "0 1 2 3 4" underneath
   "GOAL: the most profit, but you must rest one day after selling"
   "buy at 1, sell at 2, rest, buy at 0, sell at 2  ->  answer 3"
   Then one small green line:
   "day 0, hands empty, nothing bought yet." """,
 "call": "trade( day_index = 0 , holding = False )",
 "promise": "Returns the most profit still available from this day on.",
 "state": """      A long flat grey bar labelled "prices", with a BRIGHT PURPLE square at
      index 0 showing "1" and a small "0" under it, labelled "day_index".
      Beside the bar, a big chip shaped like a hand reading
      "holding = no", tiny label "am I sitting on a share?".""",
 "code_panel": """      "trade( day_index , holding ):"
   badge 1, blue:    "if day_index >= len(prices): return 0"
   badge 2, blue:    "price = prices[ day_index ]"
   badge 3, green:   "if holding:"
                     "     act = price + trade( day_index + 2 , False )"
                     "else:"
                     "     act = -price + trade( day_index + 1 , True )"
   badge 4, red:     "rest = trade( day_index + 1 , holding )"
   badge 5, purple:  "return max( act , rest )" """,
 "base_title": "HAS THE MARKET CLOSED?",
 "base_case": "if  day_index >= 5   ->   return 0",
 "base_why": "no days left, so no more profit can be made",
 "question_pill": "ACT TODAY, OR SIT ON MY HANDS?",
 "branch_a": {
   "title": "ACT   ->   BUY, OR SELL",
   "body": """   Two small stacked rows, each in its own thin purple-outlined box, only one
   of which applies depending on the flag:
      "HANDS EMPTY, so BUY:  -price + trade( day_index + 1 , holding yes )
       = -1 + trade( 1 , yes )"
         small line: "money goes out, the flag flips on"
      "HOLDING, so SELL:     price + trade( day_index + 2 , holding no )
       = price + trade( 2 , no )"
         small line: "money comes in, and the cooldown skips a day"
   The BUY row is highlighted as the live one, with a green label
   "this is our case today", and a big red arrow on the SELL row pointing at
   the "+2" with the word "COOLDOWN".""",
   "expr": "-price + trade( day_index + 1 , holding = yes )",
   "numeric": "-1 + trade( 1 , yes )",
   "change": "the flag flips, and selling later costs a rest day",
   "adds": True,
   "label": "ACT",
   "ret": "act",
 },
 "branch_b": {
   "title": "REST   ->   DO NOTHING",
   "body": """   The bar redrawn with the purple square pale grey and crossed out in red,
   the pointer moved one day on, and the hand chip UNCHANGED, with a red
   label "the flag carries over exactly as it was".""",
   "expr": "trade( day_index + 1 , holding )",
   "numeric": "trade( 1 , no )",
   "change": "no money moves and nothing about my position changes",
   "label": "REST",
   "ret": "trade( day_index + 1 , holding )",
 },
 "merge_title": "KEEP THE RICHER DAY",
 "combine": "max( act , rest )",
 "combine_note": "resting is always legal, so the max always has something to compare",
 "corner": {
   "title": "WHY A FLAG, NOT JUST A DAY",
   "body": """   "The same day means two different things depending on"
   "whether I already own a share."
   "So holding is part of the state, not a detail." """,
 },
 "code": """   "def trade( day_index , holding ):"
   ""
   "    if day_index >= len(prices):"
   "        return 0"
   ""
   "    price = prices[ day_index ]"
   ""
   "    if holding:"
   "        act = price + trade( day_index + 2 , False )"
   "    else:"
   "        act = -price + trade( day_index + 1 , True )"
   ""
   "    rest = trade( day_index + 1 , holding )"
   ""
   "    return max( act , rest )" """,
 "start": "trade( 0 , False )",
 "script": [
   ("purple", "Each day I either act or do nothing, and what acting means depends on whether I am already holding a share."),
   ("green",  "With empty hands, acting means buying, so I pay today's price and from tomorrow I am holding."),
   ("red",    "Holding a share, acting means selling, so I collect today's price, and the cooldown means I skip the next day entirely."),
   ("gold",   "Resting is always allowed and changes nothing, so I try both and keep whichever leaves me richer."),
 ],
 "script_colours": """"act or do nothing" in dark teal, "buying" in bright green, "selling" in bright
red, "skip the next day" in bright red, "whichever leaves me richer" in
purple.""",
 "footer_chip": "then add memoization on the day and the holding flag",
 "question": "Given daily stock prices, maximise profit with as many transactions as you like, but you must rest one day after selling before buying again.",
 "html_shape": "Two real choices merged with max, and the state carries a holding flag. Selling jumps two days rather than one, which is the cooldown made visible.",
},

{
 "key": "wordbreak",
 "title": "WORD BREAK",
 "lc": 139,
 "signature": "can_split(start_index)",
 "shape": "loop",
 "shape_note": ("a LOOP of choices merged with OR. Every possible first word is "
                "tried, and only one of them needs to work."),
 "example": """   "text =  c a t s a n d o g"
   with the letters as small plain cells
   "words =  cat , cats , and , sand , dog"
   "GOAL: can the text be cut into words from the list?"
   "cats + and + og fails, cat + sand + og fails  ->  answer no"
   Then one small green line:
   "we are at the very start of the text." """,
 "call": "can_split( start_index = 0 )",
 "promise": "Returns true if the rest of the text splits into known words.",
 "state": """      A long flat grey bar labelled "text", with a BRIGHT PURPLE marker at the
      very left edge labelled "start_index = 0", and the whole bar to its
      right tinted pale yellow labelled "still to be cut up".
      Beside it a small grey card listing the words: cat, cats, and, sand, dog.""",
 "code_panel": """      "can_split( start_index ):"
   badge 1, blue:    "if start_index == len(text): return True"
   badge 2, blue:    "best = False"
   badge 3, green:   "for end_index in range( start_index+1 , len(text)+1 ):"
                     "     piece = text[ start_index : end_index ]"
                     "     if piece in words and can_split( end_index ):"
                     "          return True"
   badge 4, purple:  "return False" """,
 "base_title": "IS THE WHOLE TEXT USED UP?",
 "base_case": "if  start_index == len(text)   ->   return True",
 "base_why": "reaching the end means every letter landed inside some word",
 "question_pill": "WHERE DO I MAKE THE FIRST CUT?",
 "loop_note": "every cut position is tried, not just the first one that looks right.",
 "lanes": [
   {"colour": "green", "label": "CUT AFTER  cat",
    "body": """      The bar with the first three letters filled solid green and ticked,
      labelled "cat is a known word", and the marker moved to index 3.""",
    "expr": "can_split( 3 )", "numeric": "the rest is  s a n d o g"},
   {"colour": "blue", "label": "CUT AFTER  cats",
    "body": """      The bar with the first four letters filled solid blue and ticked,
      labelled "cats is a known word", and the marker moved to index 4.""",
    "expr": "can_split( 4 )", "numeric": "the rest is  a n d o g"},
   {"colour": "red", "label": "CUT AFTER  ca",
    "body": """      The bar with the first two letters filled pale red and crossed out,
      labelled "ca is not in the list", with a red X and the words
      "no call made".""",
    "expr": "blocked", "numeric": "contributes False"},
 ],
 "merge_title": "ONE GOOD CUT IS ENOUGH",
 "combine": "true if ANY cut works",
 "combine_note": "a piece that is not a word never becomes a call at all",
 "corner": {
   "title": "WHY NOT JUST TAKE THE LONGEST WORD",
   "body": """   "Grabbing cats first leaves andog, which fails."
   "Grabbing cat first leaves sandog, which also fails."
   "Only trying every cut can prove that neither works." """,
 },
 "code": """   "def can_split( start_index ):"
   ""
   "    if start_index == len(text):"
   "        return True"
   ""
   "    for end_index in range( start_index + 1 ,"
   "                            len(text) + 1 ):"
   ""
   "        piece = text[ start_index : end_index ]"
   ""
   "        if piece in words and can_split( end_index ):"
   "            return True"
   ""
   "    return False" """,
 "start": "can_split( 0 )",
 "script": [
   ("purple", "I stand at a position in the text and try every possible first word starting from there."),
   ("green",  "If a piece is in my word list, I cut it off and ask the same question about whatever is left."),
   ("red",    "I don't know which cut is the right one, and taking the longest word first can dead end, so I try every cut position."),
   ("gold",   "I return true as soon as any one of them succeeds, because I only need a single valid way to split the text."),
 ],
 "script_colours": """"every possible first word" in dark teal, "in my word list" in bright green,
"cut it off" in bright green, "can dead end" in bright red, "any one of them
succeeds" in purple.""",
 "footer_chip": "then add memoization on the start index",
 "question": "Given a string and a dictionary of words, decide whether the string can be segmented into a sequence of dictionary words.",
 "html_shape": "A loop of cut positions joined with OR. Taking the longest word first can dead end, so every cut has to be tried.",
},

{
 "key": "burst",
 "title": "BURST BALLOONS",
 "lc": 312,
 "signature": "best(left_edge, right_edge)",
 "shape": "loop",
 "shape_note": ("a LOOP over which balloon is burst LAST inside the open range. "
                "Choosing last, not first, is what makes the two sides "
                "independent."),
 "example": """   "balloons =   3   1   5   8"
   with the four values as small plain cells
   "bursting a balloon pays left neighbour x it x right neighbour"
   "GOAL: burst them all in the order that pays the most"
   "best order pays  ->  answer 167"
   Then one small green line:
   "imagine a 1 glued to each end so the edges behave." """,
 "call": "best( left_edge = 0 , right_edge = 5 )",
 "promise": "Returns the most coins from bursting everything strictly between.",
 "state": """      A long flat grey bar labelled "balloons", with a padded 1 drawn faintly at
      each end. A BRIGHT PURPLE square marks left_edge and a TEAL square marks
      right_edge, both labelled, and the whole span between them tinted pale
      yellow with the label "still to burst, and both edges SURVIVE".""",
 "code_panel": """      "best( left_edge , right_edge ):"
   badge 1, blue:    "if right_edge - left_edge < 2: return 0"
   badge 2, blue:    "top = 0"
   badge 3, green:   "for last in range( left_edge+1 , right_edge ):"
                     "     pay  = nums[left_edge]*nums[last]*nums[right_edge]"
                     "     pay += best( left_edge , last )"
                     "     pay += best( last , right_edge )"
                     "     top  = max( top , pay )"
   badge 4, purple:  "return top" """,
 "base_title": "IS THE RANGE EMPTY?",
 "base_case": "if  the two edges are neighbours   ->   return 0",
 "base_why": "there is no balloon strictly between them, so nothing to burst",
 "question_pill": "WHICH BALLOON DO I BURST LAST?",
 "loop_note": "last, not first. That is the whole trick.",
 "lanes": [
   {"colour": "green", "label": "BURST THE 3 LAST",
    "body": """      The bar with the 3 highlighted gold and labelled "survives until the
      end", and everything either side tinted as two separate sub ranges.""",
    "expr": "pay + best( left , here ) + best( here , right )",
    "numeric": "1 x 3 x 1  plus the two sides"},
   {"colour": "blue", "label": "BURST THE 5 LAST",
    "body": """      The bar with the 5 highlighted gold, and two clearly separate tinted
      spans either side of it, labelled "left part" and "right part".""",
    "expr": "pay + best( left , here ) + best( here , right )",
    "numeric": "1 x 5 x 1  plus the two sides"},
   {"colour": "red", "label": "BURST THE 8 LAST",
    "body": """      The bar with the 8 highlighted gold and the two sides tinted
      separately.""",
    "expr": "pay + best( left , here ) + best( here , right )",
    "numeric": "1 x 8 x 1  plus the two sides"},
 ],
 "merge_title": "KEEP THE RICHEST ORDER",
 "combine": "max( every balloon tried as the last one )",
 "combine_note": "the two sides never interfere, because the last balloon is still standing",
 "corner": {
   "title": "WHY LAST AND NOT FIRST",
   "body": """   "If I burst one FIRST, its neighbours change and the two"
   "halves affect each other, so they cannot be solved apart."
   "Bursting it LAST keeps both edges alive, which cuts the"
   "range into two problems that never touch." """,
 },
 "code": """   "def best( left_edge , right_edge ):"
   ""
   "    if right_edge - left_edge < 2:"
   "        return 0"
   ""
   "    top = 0"
   ""
   "    for last in range( left_edge + 1 , right_edge ):"
   ""
   "        pay  = ( nums[left_edge]"
   "                 * nums[last]"
   "                 * nums[right_edge] )"
   ""
   "        pay += best( left_edge , last )"
   "        pay += best( last , right_edge )"
   ""
   "        top = max( top , pay )"
   ""
   "    return top" """,
 "start": "best( 0 , len(nums) - 1 )   with a 1 padded on each end",
 "script": [
   ("purple", "Instead of asking which balloon I pop first, I ask which one I pop last inside this range."),
   ("green",  "The last balloon is still standing while everything else goes, so its two neighbours are exactly the edges of my range."),
   ("red",    "If I picked the first one instead, popping it would change the neighbours on both sides and the two halves would depend on each other."),
   ("gold",   "Choosing the last one splits the range into two parts that never interfere, so I try every balloon as the last and keep the richest total."),
 ],
 "script_colours": """"which one I pop last" in gold, "still standing" in bright green, "exactly the
edges" in dark teal, "depend on each other" in bright red, "never interfere" in
bright green, "the richest total" in purple.""",
 "footer_chip": "then add memoization on the two edges",
 "question": "Each balloon has a number. Bursting one pays the product of it and its two current neighbours. Burst them all in the order that maximises the coins.",
 "html_shape": "A loop over which balloon is burst LAST, not first. Bursting last keeps both edges alive, which is what makes the two sides independent problems.",
},

{
 "key": "equalpartition",
 "title": "EQUAL SUM PARTITION",
 "lc": 416,
 "signature": "can_make(item_index, amount_left)",
 "shape": "choices",
 "shape_note": ("Subset Sum wearing a disguise. The only new work is choosing "
                "the target, and the branches still join with OR."),
 "example": """   "numbers =   1   5   11   5"
   with the four values as small plain cells
   "the whole set adds to 22, so each half must be 11"
   "GOAL: can the set be split into two halves of equal sum?"
   "11 on its own, and 1 + 5 + 5  ->  answer yes"
   Then one small green line:
   "an odd total would be impossible before we even start." """,
 "call": "can_make( item_index = 0 , amount_left = 11 )",
 "promise": "Returns true if some subset from here reaches exactly half.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 0 showing "1", labelled "item_index".
      Beside it a TEAL chip reading "amount_left = 11" with a small label
      "half of the total", and above that a gold chip reading
      "total 22, so the target is 11".""",
 "code_panel": """      "if total is odd: return False"
      "can_make( item_index , amount_left ):"
   badge 1, blue:    "if amount_left == 0: return True"
                     "if item_index == len(numbers): return False"
   badge 2, blue:    "number = numbers[ item_index ]"
   badge 3, green:   "take = False"
                     "if number <= amount_left:"
                     "     take = can_make( item_index+1, amount_left-number )"
   badge 4, red:     "skip = can_make( item_index + 1 , amount_left )"
   badge 5, purple:  "return take or skip" """,
 "base_title": "IS HALF ALREADY REACHED?",
 "base_case": "if  amount_left == 0   ->   return True",
 "base_why": "one half is complete, so the other half is whatever is left over",
 "question_pill": "PUT THIS NUMBER IN THE FIRST HALF?",
 "branch_a": {
   "title": "PUT IT IN",
   "body": """   A small blue gate pill: "does it fit ?   1 <= 11   YES" with a green check.
   Then the bar redrawn with the purple square filled solid green and ticked,
   and the teal chip shrinking from 11 to 10 with a green arrow.""",
   "expr": "can_make( item_index + 1 , amount_left - number )",
   "numeric": "can_make( 1 , 10 )",
   "change": "the half we are filling needs less now",
   "label": "IN",
   "ret": "can_make( item_index + 1 , amount_left - number )",
 },
 "branch_b": {
   "title": "LEAVE IT OUT",
   "body": """   The bar redrawn with the purple square pale grey and crossed out in red,
   and the teal chip still reading 11. A small red label reads
   "it lands in the other half instead".""",
   "expr": "can_make( item_index + 1 , amount_left )",
   "numeric": "can_make( 1 , 11 )",
   "change": "nothing added to this half",
   "label": "OUT",
   "ret": "can_make( item_index + 1 , amount_left )",
 },
 "merge_title": "EITHER WAY WILL DO",
 "combine": "take  or  skip",
 "combine_note": "we only need one valid half, and the leftovers form the other by themselves",
 "corner": {
   "title": "WHY ONLY ONE HALF IS BUILT",
   "body": """   "Anything not chosen automatically forms the second half."
   "So there is no need to track two sums,"
   "and the problem collapses into plain Subset Sum." """,
 },
 "code": """   "total = sum( numbers )"
   "if total % 2 == 1:"
   "    return False"
   ""
   "def can_make( item_index , amount_left ):"
   ""
   "    if amount_left == 0:"
   "        return True"
   "    if item_index == len(numbers):"
   "        return False"
   ""
   "    number = numbers[ item_index ]"
   ""
   "    take = False"
   "    if number <= amount_left:"
   "        take = can_make( item_index + 1 ,"
   "                         amount_left - number )"
   ""
   "    skip = can_make( item_index + 1 , amount_left )"
   ""
   "    return take or skip" """,
 "start": "can_make( 0 , total // 2 )",
 "script": [
   ("purple", "If the whole set adds up to an odd number I can stop immediately, because two equal halves are impossible."),
   ("green",  "Otherwise I only need to build one half worth exactly half the total, since everything I leave out forms the other half by itself."),
   ("red",    "For each number I don't know which half it belongs in, so I try putting it in and leaving it out."),
   ("gold",   "I return true if either path lands exactly on half, because one working split is all I need."),
 ],
 "script_colours": """"odd number" in bright red, "one half" in dark teal, "putting it in" in bright
green, "leaving it out" in bright red, "either path" in purple.""",
 "footer_chip": "this is Subset Sum with the target fixed at half the total",
 "question": "Given an array of positive numbers, decide whether it can be split into two subsets with equal sums.",
 "html_shape": "Subset Sum in disguise. Only one half needs building, because whatever is left out forms the other, so the target is simply half the total.",
},

{
 "key": "countsubsets",
 "title": "COUNT OF SUBSETS WITH SUM",
 "lc": 0,
 "signature": "count(item_index, amount_left)",
 "shape": "choices",
 "shape_note": ("the same take or skip on the same state as Subset Sum, but the "
                "answers are counts, so the combine is PLUS instead of OR."),
 "example": """   "numbers =   2   3   5   6   8   10      target = 10"
   with the six values as small plain cells
   "GOAL: count the subsets that add to exactly the target"
   "2+3+5, 2+8, 10  ->  answer 3"
   Then one small green line:
   "we are at the 2, still needing all 10." """,
 "call": "count( item_index = 0 , amount_left = 10 )",
 "promise": "Returns how many subsets from here hit the target exactly.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 0 showing "2", labelled "item_index".
      Beside the bar, a TEAL chip reading "amount_left = 10", tiny label
      "how much is still owed".""",
 "code_panel": """      "count( item_index , amount_left ):"
   badge 1, blue:    "if amount_left == 0: return 1"
                     "if item_index == len(numbers): return 0"
   badge 2, blue:    "number = numbers[ item_index ]"
   badge 3, green:   "take = 0"
                     "if number <= amount_left:"
                     "     take = count( item_index+1, amount_left-number )"
   badge 4, red:     "skip = count( item_index + 1 , amount_left )"
   badge 5, purple:  "return take + skip" """,
 "base_title": "IS THE TARGET MET EXACTLY?",
 "base_case": "if  amount_left == 0   ->   return 1",
 "base_why": "one complete subset was found. Running out of numbers returns 0.",
 "question_pill": "USE THIS NUMBER, OR PASS ON IT?",
 "branch_a": {
   "title": "USE IT",
   "body": """   A small blue gate pill: "does it fit ?   2 <= 10   YES" with a green check.
   Then the bar redrawn with the purple square filled solid green and ticked,
   and the teal chip shrinking from 10 to 8 with a green arrow.""",
   "expr": "count( item_index + 1 , amount_left - number )",
   "numeric": "count( 1 , 8 )",
   "change": "the debt shrinks by this number",
   "label": "USE",
   "ret": "count( item_index + 1 , amount_left - number )",
 },
 "branch_b": {
   "title": "PASS ON IT",
   "body": """   The bar redrawn with the purple square pale grey and crossed out in red,
   and the teal chip still reading 10, unchanged.""",
   "expr": "count( item_index + 1 , amount_left )",
   "numeric": "count( 1 , 10 )",
   "change": "the debt is untouched",
   "label": "PASS",
   "ret": "count( item_index + 1 , amount_left )",
 },
 "merge_title": "ADD THE TWO COUNTS",
 "combine": "take + skip",
 "combine_note": "subsets containing this number are never subsets without it",
 "corner": {
   "title": "ONE FAMILY, FOUR ENDINGS",
   "body": """   "Knapsack ends in max, Subset Sum ends in or,"
   "this one ends in plus, and Min Subset Diff ends in min."
   "The two branches above are identical in all four." """,
 },
 "code": """   "def count( item_index , amount_left ):"
   ""
   "    if amount_left == 0:"
   "        return 1"
   "    if item_index == len(numbers):"
   "        return 0"
   ""
   "    number = numbers[ item_index ]"
   ""
   "    take = 0"
   "    if number <= amount_left:"
   "        take = count( item_index + 1 ,"
   "                      amount_left - number )"
   ""
   "    skip = count( item_index + 1 , amount_left )"
   ""
   "    return take + skip" """,
 "start": "count( 0 , target )",
 "script": [
   ("purple", "I go through the numbers one at a time and decide whether each belongs in my subset."),
   ("green",  "If a number is no bigger than what I still owe, I can use it, and the amount left shrinks."),
   ("red",    "I can also pass on it and leave the amount untouched, and I have to try both because either can lead to a valid subset."),
   ("gold",   "I add the two counts rather than compare them, because a subset that contains this number is never the same as one that leaves it out."),
 ],
 "script_colours": """"belongs in my subset" in dark teal, "use it" in bright green, "shrinks" in
bright green, "pass on it" in bright red, "I add the two counts" in purple.""",
 "footer_chip": "same two branches as Subset Sum, only the last line differs",
 "question": "Given an array of positive numbers and a target, count how many subsets add up to exactly the target.",
 "html_shape": "The same take or skip as Subset Sum, but counting instead of deciding, so the branches join with a plus rather than an OR.",
},

{
 "key": "minsubsetdiff",
 "title": "MINIMUM SUBSET SUM DIFFERENCE",
 "lc": 0,
 "signature": "closest(item_index, first_pile)",
 "shape": "choices",
 "shape_note": ("take or skip again, but the answer is a gap, so the combine is "
                "MIN. Only one pile is built, and the other is whatever is left."),
 "example": """   "numbers =   1   6   11   5      total = 23"
   with the four values as small plain cells
   "GOAL: split into two piles whose sums are as close as possible"
   "1 + 11 = 12  against  6 + 5 = 11  ->  answer 1"
   Then one small green line:
   "if one pile is p, the other is 23 minus p." """,
 "call": "closest( item_index = 0 , first_pile = 0 )",
 "promise": "Returns the smallest gap still reachable from here.",
 "state": """      A long flat grey bar labelled "numbers", with a BRIGHT PURPLE square at
      index 0 showing "1", labelled "item_index".
      Beside the bar TWO chips: a green one reading "first_pile = 0" and a grey
      one reading "the other pile = 23 - first_pile", with a tiny label
      "only one pile is tracked".""",
 "code_panel": """      "closest( item_index , first_pile ):"
   badge 1, blue:    "if item_index == len(numbers):"
                     "     return abs( total - 2 * first_pile )"
   badge 2, blue:    "number = numbers[ item_index ]"
   badge 3, green:   "take = closest( item_index+1, first_pile + number )"
   badge 4, red:     "skip = closest( item_index+1, first_pile )"
   badge 5, purple:  "return min( take , skip )" """,
 "base_title": "HAVE ALL THE NUMBERS BEEN PLACED?",
 "base_case": "if  item_index == 4   ->   return the gap between the two piles",
 "base_why": "with everything placed, the gap is the total minus twice this pile",
 "question_pill": "WHICH PILE DOES THIS NUMBER JOIN?",
 "branch_a": {
   "title": "INTO THE FIRST PILE",
   "body": """   The bar redrawn with the purple square filled solid green and ticked, the
   green chip growing from 0 to 1 with a green arrow, and the grey chip
   dropping from 23 to 22 automatically.""",
   "expr": "closest( item_index + 1 , first_pile + number )",
   "numeric": "closest( 1 , 1 )",
   "change": "this pile grows, so the other one shrinks by itself",
   "label": "FIRST",
   "ret": "closest( item_index + 1 , first_pile + number )",
 },
 "branch_b": {
   "title": "INTO THE OTHER PILE",
   "body": """   The bar redrawn with the purple square crossed out in red and a red label
   "it lands in the other pile", with the green chip unchanged at 0.""",
   "expr": "closest( item_index + 1 , first_pile )",
   "numeric": "closest( 1 , 0 )",
   "change": "nothing joins the tracked pile",
   "label": "OTHER",
   "ret": "closest( item_index + 1 , first_pile )",
 },
 "merge_title": "KEEP THE SMALLEST GAP",
 "combine": "min( take , skip )",
 "combine_note": "every number must land somewhere, so nothing is ever truly skipped",
 "corner": {
   "title": "WHY ONE PILE IS ENOUGH",
   "body": """   "The two piles always add up to the fixed total."
   "So knowing one of them tells you the other,"
   "and the gap is just the total minus twice the one you track." """,
 },
 "code": """   "total = sum( numbers )"
   ""
   "def closest( item_index , first_pile ):"
   ""
   "    if item_index == len(numbers):"
   "        other_pile = total - first_pile"
   "        return abs( other_pile - first_pile )"
   ""
   "    number = numbers[ item_index ]"
   ""
   "    take = closest( item_index + 1 ,"
   "                    first_pile + number )"
   ""
   "    skip = closest( item_index + 1 , first_pile )"
   ""
   "    return min( take , skip )" """,
 "start": "closest( 0 , 0 )",
 "script": [
   ("purple", "Every number has to go into one of two piles, so for each one I only choose which pile it joins."),
   ("green",  "If it joins the pile I am tracking, that sum grows, and the other pile shrinks by itself because the total is fixed."),
   ("red",    "If it goes in the other pile, my tracked sum stays where it is, and I don't know which placement ends up closer, so I try both."),
   ("gold",   "I return the smallest gap I can reach, and I only ever track one pile because the total tells me the other."),
 ],
 "script_colours": """"one of two piles" in dark teal, "that sum grows" in bright green, "the other
pile" in bright red, "the smallest gap" in purple, "the total tells me the
other" in gold.""",
 "footer_chip": "same two branches again, this time ending in min",
 "question": "Given an array of numbers, split it into two subsets so the absolute difference of their sums is as small as possible.",
 "html_shape": "Take or skip merged with min. Only one pile is tracked, because the fixed total means the other is implied, and the gap is the total minus twice the tracked pile.",
},

]
