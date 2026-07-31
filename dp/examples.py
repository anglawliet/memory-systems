"""Four worked examples per problem, with the answers computed, not typed.

Every answer on the workshop page comes out of the reference solvers below
rather than out of my head, because a wrong answer on a teaching page is worse
than no answer. The solvers are deliberately brute force where brute force is
short enough to be obviously right, since their job is to be trustworthy rather
than fast. The inputs are tiny, so it all runs instantly.

    python3 dp/examples.py        # print every problem's examples and answers

gen_onecall_html.py calls examples_for(key) and renders what it gets back.
"""

from functools import lru_cache
from itertools import combinations, product
from math import comb

# ------------------------------------------------------------------ solvers


def stairs(n):
    """Ways to climb n steps taking 1 or 2 at a time."""
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = a + b, a
    return a if n > 0 else 1


def mincost(cost):
    """Cheapest way past the top, starting from step 0 or step 1."""
    n = len(cost)

    @lru_cache(None)
    def go(i):
        if i >= n:
            return 0
        return cost[i] + min(go(i + 1), go(i + 2))

    return min(go(0), go(1))


def decode(digits):
    """Ways to read a digit string as letters, A is 1 through Z is 26."""
    @lru_cache(None)
    def go(i):
        if i == len(digits):
            return 1
        if digits[i] == "0":
            return 0
        total = go(i + 1)
        if i + 1 < len(digits) and 10 <= int(digits[i:i + 2]) <= 26:
            total += go(i + 2)
        return total

    return go(0)


def maxprod(numbers):
    """Largest product of any unbroken run. Brute force over every run."""
    best = None
    for start in range(len(numbers)):
        running = 1
        for end in range(start, len(numbers)):
            running *= numbers[end]
            best = running if best is None else max(best, running)
    return best


def robber(houses):
    """Most money with no two adjacent houses taken."""
    take, skip = 0, 0
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)


def robber2(houses):
    """The same street bent into a circle."""
    if len(houses) == 1:
        return houses[0]
    return max(robber(houses[:-1]), robber(houses[1:]))


def knapsack(weights, values, capacity):
    """Most value packed, each item at most once."""
    best = 0
    for size in range(len(weights) + 1):
        for pick in combinations(range(len(weights)), size):
            if sum(weights[i] for i in pick) <= capacity:
                best = max(best, sum(values[i] for i in pick))
    return best


def _subset_sums(numbers):
    sums = {0}
    for number in numbers:
        sums |= {s + number for s in sums}
    return sums


def subsetsum(numbers, target):
    return target in _subset_sums(numbers)


def equalpartition(numbers):
    total = sum(numbers)
    return total % 2 == 0 and subsetsum(numbers, total // 2)


def countsubsets(numbers, target):
    """How many different groups add up to the target."""
    found = 0
    for size in range(len(numbers) + 1):
        for pick in combinations(numbers, size):
            if sum(pick) == target:
                found += 1
    return found


def minsubsetdiff(numbers):
    """Smallest gap between two piles."""
    total = sum(numbers)
    return min(abs(total - 2 * s) for s in _subset_sums(numbers))


def targetsum(numbers, target):
    """Ways to sign every number so the total hits the target."""
    hits = 0
    for signs in product((1, -1), repeat=len(numbers)):
        if sum(s * n for s, n in zip(signs, numbers)) == target:
            hits += 1
    return hits


def coinchange(coins, amount):
    """Fewest coins making the amount, or -1 if it cannot be done."""
    best = [0] + [None] * amount
    for value in range(1, amount + 1):
        options = [best[value - c] for c in coins
                   if c <= value and best[value - c] is not None]
        best[value] = min(options) + 1 if options else None
    return -1 if best[amount] is None else best[amount]


def coinchange2(coins, amount):
    """Combinations making the amount, order ignored."""
    ways = [1] + [0] * amount
    for coin in coins:
        for value in range(coin, amount + 1):
            ways[value] += ways[value - coin]
    return ways[amount]


def wordbreak(text, words):
    """Can the string be cut into pieces that are all in the list."""
    @lru_cache(None)
    def go(i):
        if i == len(text):
            return True
        return any(text.startswith(w, i) and go(i + len(w)) for w in words)

    return go(0)


def longestpal(text):
    """Longest stretch reading the same both ways. Ties go to the earliest."""
    best = ""
    for start in range(len(text)):
        for end in range(start + 1, len(text) + 1):
            piece = text[start:end]
            if piece == piece[::-1] and len(piece) > len(best):
                best = piece
    return best


def palsub(text):
    """How many substrings are palindromes, counted by position."""
    return sum(1
               for start in range(len(text))
               for end in range(start + 1, len(text) + 1)
               if text[start:end] == text[start:end][::-1])


def lcs(first, second):
    @lru_cache(None)
    def go(i, j):
        if i == len(first) or j == len(second):
            return 0
        if first[i] == second[j]:
            return 1 + go(i + 1, j + 1)
        return max(go(i + 1, j), go(i, j + 1))

    return go(0, 0)


def editdistance(first, second):
    @lru_cache(None)
    def go(i, j):
        if i == len(first):
            return len(second) - j
        if j == len(second):
            return len(first) - i
        if first[i] == second[j]:
            return go(i + 1, j + 1)
        return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))

    return go(0, 0)


def interleaving(first, second, target):
    if len(first) + len(second) != len(target):
        return False

    @lru_cache(None)
    def go(i, j):
        if i + j == len(target):
            return True
        if i < len(first) and first[i] == target[i + j] and go(i + 1, j):
            return True
        return j < len(second) and second[j] == target[i + j] and go(i, j + 1)

    return go(0, 0)


def distinctsubseq(big, small):
    @lru_cache(None)
    def go(i, j):
        if j == len(small):
            return 1
        if i == len(big):
            return 0
        found = go(i + 1, j)
        if big[i] == small[j]:
            found += go(i + 1, j + 1)
        return found

    return go(0, 0)


def regex(text, pattern):
    @lru_cache(None)
    def go(i, j):
        if j == len(pattern):
            return i == len(text)
        here = i < len(text) and pattern[j] in (text[i], ".")
        if j + 1 < len(pattern) and pattern[j + 1] == "*":
            return go(i, j + 2) or (here and go(i + 1, j))
        return here and go(i + 1, j + 1)

    return go(0, 0)


def uniquepaths(rows, columns):
    return comb(rows + columns - 2, rows - 1)


def stock(prices):
    """Most profit, with a rest day forced after every sale."""
    n = len(prices)

    @lru_cache(None)
    def go(day, holding):
        if day >= n:
            return 0
        rest = go(day + 1, holding)
        if holding:
            return max(rest, prices[day] + go(day + 2, False))
        return max(rest, -prices[day] + go(day + 1, True))

    return go(0, False)


def lis(numbers):
    @lru_cache(None)
    def go(i, previous):
        if i == len(numbers):
            return 0
        best = go(i + 1, previous)
        if previous == -1 or numbers[i] > numbers[previous]:
            best = max(best, 1 + go(i + 1, i))
        return best

    return go(0, -1)


def burst(balloons):
    padded = [1] + list(balloons) + [1]

    @lru_cache(None)
    def go(left, right):
        if left + 1 == right:
            return 0
        return max(padded[left] * padded[last] * padded[right]
                   + go(left, last) + go(last, right)
                   for last in range(left + 1, right))

    return go(0, len(padded) - 1)


# ------------------------------------------------------------------ examples
#
# Each entry is (what to show, the arguments, a short note). The answer is
# whatever the solver returns, so the page and the code can never disagree.

EXAMPLES = {

"stairs": (stairs, [
    ("n = 1", (1,), "one step, one way"),
    ("n = 2", (2,), "1+1, or 2"),
    ("n = 3", (3,), "the counts start adding"),
    ("n = 5", (5,), "Fibonacci, not doubling"),
]),

"mincost": (mincost, [
    ("cost = 10, 15, 20", ([10, 15, 20],), "start at index 1 and jump two"),
    ("cost = 1, 100, 1, 1, 1, 100, 1, 1, 100, 1",
     ([1, 100, 1, 1, 1, 100, 1, 1, 100, 1],), "hop over every expensive step"),
    ("cost = 5, 5", ([5, 5],), "pay one of them, then step off"),
    ("cost = 0, 0, 0", ([0, 0, 0],), "free stairs cost nothing"),
]),

"decode": (decode, [
    ('"12"', ("12",), "AB, or L"),
    ('"226"', ("226",), "BBF, BZ, VF"),
    ('"06"', ("06",), "nothing may start with a zero"),
    ('"11106"', ("11106",), "the 0 forces one reading of 10"),
]),

"maxprod": (maxprod, [
    ("2, 3, -2, 4", ([2, 3, -2, 4],), "the negative cuts the run"),
    ("-2, 0, -1", ([-2, 0, -1],), "a zero resets everything"),
    ("-2, 3, -4", ([-2, 3, -4],), "two negatives, so keep the smallest too"),
    ("2, 3, 4", ([2, 3, 4],), "all positive, just keep extending"),
]),

"robber": (robber, [
    ("1, 2, 3, 1", ([1, 2, 3, 1],), "take the first and the third"),
    ("2, 7, 9, 3, 1", ([2, 7, 9, 3, 1],), "skipping 7 beats taking it"),
    ("5", ([5],), "one house, take it"),
    ("2, 1, 1, 2", ([2, 1, 1, 2],), "both ends, never the middle"),
]),

"robber2": (robber2, [
    ("2, 3, 2", ([2, 3, 2],), "the two 2s now touch, so take 3"),
    ("1, 2, 3, 1", ([1, 2, 3, 1],), "the circle costs nothing here"),
    ("1, 2, 3", ([1, 2, 3],), "only one house can be taken"),
    ("3", ([3],), "one house is its own neighbour"),
]),

"knapsack": (knapsack, [
    ("weights 1,3,4,5 / values 1,4,5,7 / bag 7",
     ([1, 3, 4, 5], [1, 4, 5, 7], 7), "3 and 4 beat the single 5"),
    ("weights 1,2,3 / values 6,10,12 / bag 5",
     ([1, 2, 3], [6, 10, 12], 5), "the two lighter ones win"),
    ("weights 2,3 / values 3,4 / bag 1", ([2, 3], [3, 4], 1),
     "nothing fits"),
    ("weights 4 / values 10 / bag 4", ([4], [10], 4), "an exact fit"),
]),

"subsetsum": (subsetsum, [
    ("3, 34, 4, 12, 5, 2 -> 9", ([3, 34, 4, 12, 5, 2], 9), "4 and 5"),
    ("1, 2, 3 -> 6", ([1, 2, 3], 6), "use everything"),
    ("1, 2, 5 -> 4", ([1, 2, 5], 4), "no group reaches it"),
    ("2, 4 -> 3", ([2, 4], 3), "all even, so an odd target is hopeless"),
]),

"equalpartition": (equalpartition, [
    ("1, 5, 11, 5", ([1, 5, 11, 5],), "11 against 1+5+5"),
    ("1, 2, 3, 5", ([1, 2, 3, 5],), "total 11, an odd total can never split"),
    ("2, 2", ([2, 2],), "one each"),
    ("1", ([1],), "one number cannot make two piles"),
]),

"countsubsets": (countsubsets, [
    ("1, 1, 2, 3 -> 4", ([1, 1, 2, 3], 4), "the two 1s count separately"),
    ("1, 2, 3 -> 3", ([1, 2, 3], 3), "3 alone, or 1+2"),
    ("1, 1 -> 2", ([1, 1], 2), "only one way to use both"),
    ("2, 4 -> 3", ([2, 4], 3), "no group works"),
]),

"minsubsetdiff": (minsubsetdiff, [
    ("1, 6, 11, 5", ([1, 6, 11, 5],), "11+1 against 6+5"),
    ("1, 2, 3, 9", ([1, 2, 3, 9],), "9 against 1+2+3"),
    ("1, 1", ([1, 1],), "a perfect split"),
    ("10", ([10],), "one pile gets everything"),
]),

"targetsum": (targetsum, [
    ("1, 1, 1, 1, 1 -> 3", ([1, 1, 1, 1, 1], 3), "one minus, five places"),
    ("1, 2, 1 -> 2", ([1, 2, 1], 2), "two signings work"),
    ("1 -> 1", ([1], 1), "just the plus"),
    ("1 -> 2", ([1], 2), "out of reach either way"),
]),

"coinchange": (coinchange, [
    ("coins 1,2,5 -> 11", ([1, 2, 5], 11), "5+5+1"),
    ("coins 2,5 -> 7", ([2, 5], 7), "5+2"),
    ("coins 1 -> 0", ([1], 0), "nothing owed, nothing spent"),
    ("coins 2 -> 3", ([2], 3), "impossible, so -1 and never 0"),
]),

"coinchange2": (coinchange2, [
    ("coins 1,2,5 -> 5", ([1, 2, 5], 5), "order is ignored"),
    ("coins 2,3 -> 6", ([2, 3], 6), "2+2+2, or 3+3"),
    ("coins 1 -> 3", ([1], 3), "only one combination"),
    ("coins 2 -> 3", ([2], 3), "no combination at all"),
]),

"wordbreak": (wordbreak, [
    ('"leetcode" / leet, code', ("leetcode", ("leet", "code")), "one clean cut"),
    ('"applepenapple" / apple, pen', ("applepenapple", ("apple", "pen")),
     "words may be reused"),
    ('"catsandog" / cats, dog, sand, and, cat',
     ("catsandog", ("cats", "dog", "sand", "and", "cat")),
     "every cut dead ends"),
    ('"aaa" / a', ("aaa", ("a",)), "three cuts of the same word"),
]),

"longestpal": (longestpal, [
    ('"babad"', ("babad",), '"aba" is equally long, ties go to the earliest'),
    ('"cbbd"', ("cbbd",), "an even length centre"),
    ('"a"', ("a",), "one letter is already a palindrome"),
    ('"ac"', ("ac",), "nothing matches, so a single letter"),
]),

"palsub": (palsub, [
    ('"abc"', ("abc",), "just the three letters"),
    ('"aaa"', ("aaa",), "3 letters, 2 pairs, 1 triple"),
    ('"aba"', ("aba",), "three letters plus the whole thing"),
    ('"aa"', ("aa",), "two letters plus the pair"),
]),

"lcs": (lcs, [
    ('"abcde" / "ace"', ("abcde", "ace"), "gaps are allowed"),
    ('"abc" / "abc"', ("abc", "abc"), "identical strings"),
    ('"abc" / "def"', ("abc", "def"), "nothing in common"),
    ('"ezupkr" / "ubmrapg"', ("ezupkr", "ubmrapg"), "order still has to hold"),
]),

"editdistance": (editdistance, [
    ('"horse" -> "ros"', ("horse", "ros"), "replace, delete, delete"),
    ('"intention" -> "execution"', ("intention", "execution"), "five edits"),
    ('"abc" -> "abc"', ("abc", "abc"), "already there"),
    ('"" -> "abc"', ("", "abc"), "insert whatever is left"),
]),

"interleaving": (interleaving, [
    ('"abc" + "def" -> "adbcef"', ("abc", "def", "adbcef"),
     "both stay in order"),
    ('"a" + "b" -> "ab"', ("a", "b", "ab"), "the smallest real shuffle"),
    ('"aabcc" + "dbbca" -> "aadbbbaccc"', ("aabcc", "dbbca", "aadbbbaccc"),
     "one letter out of place, and no shuffle produces it"),
    ('"" + "" -> ""', ("", "", ""), "empty interleaves to empty"),
]),

"distinctsubseq": (distinctsubseq, [
    ('"rabbbit" / "rabbit"', ("rabbbit", "rabbit"), "three places for the b"),
    ('"babgbag" / "bag"', ("babgbag", "bag"), "five different positions"),
    ('"abc" / "abc"', ("abc", "abc"), "exactly one way"),
    ('"abc" / "d"', ("abc", "d"), "the letter is not there"),
]),

"regex": (regex, [
    ('"aa" / "a*"', ("aa", "a*"), "the star repeats the a"),
    ('"ab" / ".*"', ("ab", ".*"), "any letter, any number of times"),
    ('"aa" / "a"', ("aa", "a"), "the pattern must match the whole string"),
    ('"mississippi" / "mis*is*p*."', ("mississippi", "mis*is*p*."),
     "close, and still no"),
]),

"uniquepaths": (uniquepaths, [
    ("3 by 7 grid", (3, 7), "a plain grid, no obstacles"),
    ("3 by 2 grid", (3, 2), "down, down, right in some order"),
    ("2 by 2 grid", (2, 2), "right then down, or down then right"),
    ("1 by 1 grid", (1, 1), "already at the corner"),
]),

"stock": (stock, [
    ("1, 2, 3, 0, 2", ([1, 2, 3, 0, 2],), "buy, sell, rest, buy, sell"),
    ("1, 4, 2, 7", ([1, 4, 2, 7],), "one long hold beats two trades here"),
    ("2, 1", ([2, 1],), "falling prices, so do nothing"),
    ("1", ([1],), "one day is not enough to trade"),
]),

"lis": (lis, [
    ("10, 9, 2, 5, 3, 7, 101, 18", ([10, 9, 2, 5, 3, 7, 101, 18],),
     "2, 3, 7, 101"),
    ("0, 1, 0, 3, 2, 3", ([0, 1, 0, 3, 2, 3],), "0, 1, 2, 3"),
    ("7, 7, 7, 7", ([7, 7, 7, 7],), "equal is not increasing"),
    ("1, 2, 3", ([1, 2, 3],), "already increasing"),
]),

"burst": (burst, [
    ("3, 1, 5, 8", ([3, 1, 5, 8],), "the classic, order is everything"),
    ("1, 5", ([1, 5],), "burst the 1 first"),
    ("1, 2", ([1, 2],), "burst the 1 first here too"),
    ("5", ([5],), "1 x 5 x 1"),
]),

}


def _show(answer):
    if isinstance(answer, bool):
        return "true" if answer else "false"
    if isinstance(answer, str):
        return f'"{answer}"'
    return str(answer)


def examples_for(key):
    """[(input, answer, note)] for one problem, or [] if it has none."""
    entry = EXAMPLES.get(key)
    if not entry:
        return []
    solve, cases = entry
    return [(shown, _show(solve(*args)), note) for shown, args, note in cases]


def main():
    for key in EXAMPLES:
        print(f"\n{key}")
        for shown, answer, note in examples_for(key):
            print(f"   {shown:<46} {answer:<10} {note}")


if __name__ == "__main__":
    main()
