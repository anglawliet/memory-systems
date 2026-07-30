# Maximum Product Subarray

> Given an array of numbers, find the largest product any run of neighbouring
> numbers can make. The run has to be unbroken, and it has to be non empty.

This problem looks like Climbing Stairs and behaves nothing like it. Everything
below is built up in the order it makes sense, so the last piece is never a
surprise.

---

## 1. Ask the right question at each position

Do not try to find the best run in the whole array at once. Walk left to right
and ask one small question at every number:

**What is the best product of a run that ends exactly here?**

Answer that at every position, and the answer to the whole problem is the best
of those answers.

The reason this question works is that it has only two possible answers:

- start a brand new run at this number
- extend the best run that ended just before you

Nothing else can end here. Any run ending at this position either began here or
came from the position before.

---

## 2. The easy version, with no negatives

Array: `2, 3, 4`

| at | options | best ending here |
|---:|---|---:|
| `2` | `2` | **2** |
| `3` | `3`, or `3 × 2 = 6` | **6** |
| `4` | `4`, or `4 × 6 = 24` | **24** |

Answer: the largest value in the last column, **24**.

One variable does the whole job:

```python
best_ending_here = max(number, number * best_ending_here)
```

If this part is not obvious yet, stay here. Everything that follows is a repair
to this one line.

---

## 3. Negatives break it

Array: `-2, 3, -4`

| at | options | best ending here |
|---:|---|---:|
| `-2` | `-2` | **-2** |
| `3` | `3`, or `3 × -2 = -6` | **3** |
| `-4` | `-4`, or `-4 × 3 = -12` | **-4** |

It answers **3**. The true answer is `-2 × 3 × -4 = 24`.

### Find the exact moment it went wrong

At the number `3`, two runs ended there:

```
[3]        =  3
[-2, 3]    = -6
```

You kept `3` and threw away `-6`, which looks obviously correct. It was wrong,
and you find out one step later, because the winning run is built as
`-6 × -4 = 24`.

**The value you needed was the one you discarded for being the smallest.**

---

## 4. The fix, and why it is forced

Multiplying by a negative reverses order. The most negative becomes the most
positive.

So the best run ending here can be built from either the **best** or the
**worst** run ending one step back, and you cannot tell which until you see the
sign of the current number. Since you cannot tell, keep both.

Three candidates at every position now:

| candidate | meaning |
|---|---|
| `number` | start a new run here |
| `number × biggest_ending_here` | extend, using the best so far |
| `number × smallest_ending_here` | extend, using the worst so far |

The new biggest is the `max` of those three. The new smallest is the `min` of
the same three.

### The same walk, done properly

| at | start fresh | from biggest | from smallest | biggest | smallest |
|---:|---:|---:|---:|---:|---:|
| `-2` | -2 | | | **-2** | -2 |
| `3` | 3 | `3 × -2 = -6` | `3 × -2 = -6` | **3** | -6 |
| `-4` | -4 | `-4 × 3 = -12` | `-4 × -6 = 24` | **24** | -12 |

Answer: **24**.

### All three candidates earn their place

Look at where each winning value came from in that table:

- at `3`, the biggest came from **starting fresh**, because `3` beat `-6`
- at `-4`, the biggest came from **the smallest**, `-4 × -6 = 24`
- at `-4`, the smallest came from **the biggest**, `-4 × 3 = -12`

Remove any one of the three and this tiny array already breaks.

---

## 5. The mental model

You are not tracking a number. You are tracking a **range**: the lowest and the
highest product that any run ending here can make.

```
multiply a range by a positive number   the ends stay where they are
multiply a range by a negative number   the ends swap
```

You keep both ends because a swap turns the end you would have thrown away into
the end you want.

There is **no swap step in the code.** Nothing is reordered before multiplying.
Both products are computed every time, and the fact that one of them wins is a
result, not an instruction.

---

## 6. Three ways to write it

All three compute the same values in the same order. They differ only in who is
holding the previous answer when it is needed.

### 6a. The loop, bottom up

This is how anyone actually writes it. Information flows forward through
variables.

```python
def max_product(numbers):
    biggest_ending_here = numbers[0]
    smallest_ending_here = numbers[0]
    answer = numbers[0]

    for number in numbers[1:]:
        start_fresh = number
        from_biggest = number * biggest_ending_here
        from_smallest = number * smallest_ending_here

        biggest_ending_here = max(start_fresh, from_biggest, from_smallest)
        smallest_ending_here = min(start_fresh, from_biggest, from_smallest)

        answer = max(answer, biggest_ending_here)

    return answer
```

**Name the three candidates before updating either variable.** If you assign
`biggest_ending_here` first and then compute `smallest_ending_here`, the second
line silently uses the brand new biggest instead of the old one. It gives right
answers on some inputs and wrong ones on others, which is the worst kind of bug.
Naming the candidates first makes it impossible to get wrong.

### 6b. Top down recursion

Each call promises one thing: *the best and worst run ending at this index*.
Information flows back through return values.

```python
def best_ending_at(index):
    if index == 0:
        return numbers[0], numbers[0]

    previous_biggest, previous_smallest = best_ending_at(index - 1)

    number = numbers[index]
    start_fresh = number
    from_biggest = number * previous_biggest
    from_smallest = number * previous_smallest

    return (max(start_fresh, from_biggest, from_smallest),
            min(start_fresh, from_biggest, from_smallest))
```

It returns a **pair**, because one number is not enough to answer the next call.

Careful: this gives you one index. The overall answer needs the biggest across
every index, so calling this once per index re-walks the whole chain each time
and turns a linear algorithm into a quadratic one.

### 6c. Forward recursion

The same recursion, walking up from `0` instead of down from the end. It works
because it **carries** the values forward as arguments instead of going to fetch
them.

```python
def walk(index, biggest, smallest, answer):
    if index == len(numbers):
        return answer

    number = numbers[index]
    start_fresh = number
    from_biggest = number * biggest
    from_smallest = number * smallest

    new_biggest = max(start_fresh, from_biggest, from_smallest)
    new_smallest = min(start_fresh, from_biggest, from_smallest)

    return walk(index + 1, new_biggest, new_smallest, max(answer, new_biggest))
```

This is the loop wearing a recursion costume. It also mixes two promises into
one function, which is a fair thing to dislike. See section 8.

---

## 7. Why going down and going up are both fine

**Going down.** Ask for index 5 and the function immediately has a problem: it
needs index 4, which it does not have, so it asks. That call needs index 3, so
it asks again, all the way to index 0, which can answer alone.

The trip down **computes nothing.** It only records what still needs answering.
Every piece of arithmetic happens on the way back up, in the order `0, 1, 2, …`.

**Going up.** Since the real work happens in that order anyway, and you already
know that is the order, just do it in that order and never ask anyone for
anything. That is the loop.

```
going down    I need something I do not have, so I go and get it
going up      I already hold what I need, because I computed it last step
```

Same dependency graph, walked in opposite directions. That is the entire
difference between a memoized recursion and a table.

### So why does anyone go down?

- **You do not always know the right order.** Left to right is obvious here.
  On a grid you need a valid row and column order. On Burst Balloons the order
  is by window size, smallest first, which is not obvious at all. Recursion
  works the order out for you.
- **You may not need every subproblem.** Going up computes all of them. Going
  down computes only the ones actually reached.
- **The recursion usually reads like the problem statement.** The loop reads
  like a machine.

---

## 8. `answer` is not part of the DP

In the code above, `biggest` and `smallest` are DP values. `answer` is not.

Check it: `new_biggest` and `new_smallest` are built only from `number`,
`biggest` and `smallest`. `answer` never appears on the right hand side of
anything except its own update. It is a spectator. Delete it and the DP still
computes correctly, you just have nothing to hand back.

`answer` is a **reduction over** the DP values, not one of them.

### Why this problem needs a reduction at all

In Climbing Stairs the answer *is* a single call. `climb(0)` is the number you
want. Same for House Robber and Knapsack. Return the root and you are done.

Here the best run can end **anywhere**, so no single position holds the answer.
After computing "best ending here" at every position you still have to sweep
those and take the largest.

| the answer is the root call | you must sweep every position |
|---|---|
| Climbing Stairs | Maximum Product Subarray |
| House Robber | Longest Increasing Subsequence |
| 0/1 Knapsack | Longest Palindromic Substring |
| Coin Change | Palindromic Substrings |
| Unique Paths | |
| Edit Distance | |

The right hand column is exactly where people write a correct recurrence and
still return the wrong number, because they hand back the last value instead of
the best one.

The reduction can live in three places, all the same thing:

```
top down     take the max as the calls unwind
forward      carry it as an argument
loop         one variable outside the loop
```

The loop version is cleanest because a loop has an "outside" to put it in.

---

## 9. This is a chain, not a tree

Count the recursive calls in `best_ending_at`. There is exactly **one**.

So the shape is a straight line of calls from the end down to `0`, and then
values coming back up. No branching, no tree, nothing to explore.

That has a consequence worth carrying to every other problem:

| calls per step | shape | does memoization help? |
|---|---|---|
| one | chain | **no**, every subproblem is reached exactly once |
| two or more, to different places | tree | **yes**, subproblems are reached along many paths |

Climbing Stairs calls `climb(step + 1)` and `climb(step + 2)`, so `climb(5)` is
reached from both `climb(4)` and `climb(3)`. Without memoization you recompute
it exponentially often. Maximum Product never revisits anything, so there is
nothing to cache and the loop is not an optimisation, it is the honest shape.

### Look at the arguments, not just the count

The three candidates here all refer to the **same** earlier position,
`index - 1`. They are three expressions built from one earlier answer.

In Climbing Stairs the two calls go to **different** positions, `+1` and `+2`.
That is a genuine fork.

```
fork    several calls, to different places      Climbing Stairs, House Robber
scan    one call back, several expressions      Maximum Product, Stock
```

If you have been picturing this problem as a fork with two branches, that is
why it felt wrong. There is one arrow back into a single past, not several
arrows out into different futures.

---

## 10. Checks worth running

**Zeros need no special case.** Array `2, 0, 3`. At `0` all three candidates are
`0`, so both carried values become `0` and the run effectively restarts. At `3`
the winner is `start_fresh`. Answer `3`, correct.

**All negatives still work.** Array `-2, -3`. At `-3` the candidates are `-3`,
`-3 × -2 = 6` and `6`. Biggest `6`, correct.

**A single number works.** Both carried values start at `numbers[0]`, so a one
element array returns that element, which is right, because the run must be
non empty.

---

## 11. What to take to the next problem

**Derive extra state, do not guess it.** Write the obvious one variable version.
Break it on a small input. Then look at what you discarded that later turned out
to matter. That discarded thing is the state you were missing. It is the same
move that produces the `holding` flag on Stock with Cooldown and `last_taken` on
Longest Increasing Subsequence.

**"Ending here" and "so far" are different quantities.** One is local and can go
down as you walk. The other only ever goes up. Confusing them is the most common
way to write a correct recurrence and a wrong program.

**Name your candidates before you assign anything.** It is the cheapest possible
protection against reading a value you have already overwritten.

**Count the recursive calls before reaching for memoization.** One call means a
chain, and a chain needs a loop, not a cache.
