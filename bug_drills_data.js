window.DRILL_HABITS = {"A": "The tracker falls out of step with the pointers", "B": "Mixing up a position and a value, or a type and its methods", "C": "No fixed plan for shrinking the window", "E": "Using the wrong one of two similar names", "G": "The wrong comparison", "J": "A reversed direction or sign", "M": "Forgetting the \"nothing found\" return", "N": "Checking before the window is fixed", "O": "Doing only half of a two-part step", "P": "Hard-coding a value from the example"};
window.DRILLS = [
{
"id": "e1",
"habit": "E",
"kind": "fix",
"fn": "window_sums",
"task": "`nums` is a list of numbers, and `k` is a window size. A window is `k` numbers that sit next to each other in `nums`. Slide the window from the start of the list to the end, one position at a time, and return a list with the sum of each window. For example, `window_sums([1, 2, 3, 4], 2)` gives `[3, 5, 7]`. Window [1, 2]: the sum is 3. Window [2, 3]: the sum is 5. Window [3, 4]: the sum is 7.",
"code": "def window_sums(nums, k):\n    total = 0\n    sums = []\n    for right in range(len(nums)):\n        added = nums[right]\n        total += added\n        if right >= k:\n            gone = nums[right - k]\n            total -= added\n        if right >= k - 1:\n            sums.append(total)\n    return sums",
"bug": [
9,
9
],
"fix": "            total -= gone",
"tests": [
[
"window_sums([1, 2, 3, 4], 2)",
[
3,
5,
7
]
],
[
"window_sums([5, 1, 1], 1)",
[
5,
1,
1
]
],
[
"window_sums([2, 4, 6], 2)",
[
6,
10
]
]
],
"why": "The line subtracted `added`, the number that just joined, so `total` lost the wrong number. Subtract `gone`, the number that left: `total -= gone`. The line was copied from `total += added` above it, and one name stayed the same.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new number"
],
[
7,
"drop the number that left"
],
[
10,
"save each full window"
]
],
"bugText": "            total -= added"
},
{
"id": "e2",
"habit": "E",
"kind": "fix",
"fn": "distinct_counts",
"task": "`s` is a string, and `k` is a window size. A window is `k` letters that sit next to each other in `s`. Slide the window from the start of `s` to the end, one letter at a time. For each window, count how many different letters it holds, and return the list of counts. For example, `distinct_counts('aab', 2)` gives `[1, 2]`. Window \"aa\": only the letter a, so 1. Window \"ab\": the letters a and b, so 2.",
"code": "def distinct_counts(s, k):\n    window = Counter()\n    out = []\n    for right in range(len(s)):\n        letter = s[right]\n        window[letter] += 1\n        if right >= k:\n            gone = s[right - k]\n            window[letter] -= 1\n            if window[gone] == 0:\n                del window[gone]\n        if right >= k - 1:\n            out.append(len(window))\n    return out",
"bug": [
9,
9
],
"fix": "            window[gone] -= 1",
"tests": [
[
"distinct_counts('aab', 2)",
[
1,
2
]
],
[
"distinct_counts('abc', 2)",
[
2,
2
]
],
[
"distinct_counts('aaaa', 3)",
[
1,
1
]
]
],
"why": "The line lowered the count of `letter`, the letter that just joined. Lower the count of `gone`, the letter that left: `window[gone] -= 1`. The line was copied from `window[letter] += 1`, and one name stayed the same. You made this exact slip in Minimum Window on 19 November.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new letter"
],
[
7,
"drop the letter that left"
],
[
12,
"save each full window"
]
],
"bugText": "            window[letter] -= 1"
},
{
"id": "e3",
"habit": "E",
"kind": "fix",
"fn": "has_anagram",
"task": "`s1` and `s2` are strings. Return True if `s2` holds a stretch of letters that sit next to each other and use exactly the letters of `s1`, each the same number of times, in any order. Otherwise return False. Such a stretch is always as long as `s1`. For example, `has_anagram('adc', 'dcda')` gives `True`. Stretch \"dcd\": two d's and no a, so no match. Stretch \"cda\": one c, one d and one a, the same letters as \"adc\", so the answer is True.",
"code": "def has_anagram(s1, s2):\n    need = Counter(s1)\n    window = Counter()\n    left = 0\n    for right in range(len(s2)):\n        window[s2[right]] += 1\n        if len(window) > len(s1):\n            window[s2[left]] -= 1\n            left += 1\n        if window == need:\n            return True\n    return False",
"bug": [
7,
7
],
"fix": "        if right - left + 1 > len(s1):",
"tests": [
[
"has_anagram('adc', 'dcda')",
true
],
[
"has_anagram('ab', 'eidbaooo')",
true
],
[
"has_anagram('ab', 'eidboaoo')",
false
]
],
"why": "The check `len(window)` counts how many different letters the dictionary holds, not how many letters sit in the window. For \"dcd\", it gives 2, but the window holds 3 letters. Measure the window with `right - left + 1`.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new letter"
],
[
7,
"keep the window at len(s1)"
],
[
10,
"check the window"
]
],
"bugText": "        if len(window) > len(s1):"
},
{
"id": "e4",
"habit": "E",
"kind": "fix",
"fn": "max_profit",
"task": "Each number in `prices` is the price of one share on one day, in day order. You buy one share on one day and sell it on a later day. Return the biggest profit, which is the sell price minus the buy price, or 0 if no sale makes money. For example, `max_profit([7, 1, 5, 3, 6, 4])` gives `5`. The cheapest price is 1, on the second day. The highest price after that day is 6, so buying at 1 and selling at 6 makes 6 - 1 = 5.",
"code": "def max_profit(prices):\n    lowest = prices[0]\n    best = 0\n    for price in prices:\n        lowest = min(lowest, price)\n        profit = price - lowest\n        best = max(best, profit)\n    return profit",
"bug": [
8,
8
],
"fix": "    return best",
"tests": [
[
"max_profit([7, 1, 5, 3, 6, 4])",
5
],
[
"max_profit([2, 9, 1])",
7
],
[
"max_profit([5, 4, 3])",
0
]
],
"why": "The function returned `profit`, which is only the last day's profit. Return `best`, the biggest profit seen on any day.",
"domain": "Algorithms",
"bugText": "    return profit"
},
{
"id": "e5",
"habit": "E",
"kind": "fix",
"fn": "longest_unique",
"task": "`s` is a string. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch in which no letter appears twice. For example, `longest_unique('abcabcbb')` gives `3`. The stretch \"abc\" has no repeat and has length 3. Every stretch of 4 letters, such as \"abca\", repeats a letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[left])\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
9,
9
],
"fix": "        seen.add(s[right])",
"tests": [
[
"longest_unique('abcabcbb')",
3
],
[
"longest_unique('pwwkew')",
3
],
[
"longest_unique('abcb')",
3
]
],
"why": "The line added `s[left]`, but the letter joining the window is `s[right]`. The line was copied from `seen.remove(s[left])` two lines above. This was the first mistake in your log, on 14 November.",
"domain": "Algorithms",
"jobs": [
[
6,
"make room for s[right]"
],
[
9,
"add the new letter"
],
[
10,
"record the best size"
]
],
"bugText": "        seen.add(s[left])"
},
{
"id": "a1",
"habit": "A",
"kind": "fix",
"fn": "has_anagram",
"task": "`s1` and `s2` are strings. Return True if `s2` holds a stretch of letters that sit next to each other and use exactly the letters of `s1`, each the same number of times, in any order. Otherwise return False. Such a stretch is always as long as `s1`. For example, `has_anagram('ab', 'aab')` gives `True`. Stretch \"aa\": two a's and no b, so no match. Stretch \"ab\": one a and one b, the same letters as \"ab\", so the answer is True.",
"code": "def has_anagram(s1, s2):\n    need = Counter(s1)\n    window = Counter()\n    for right in range(len(s2)):\n        window[s2[right]] += 1\n        if right >= len(s1):\n            gone = s2[right - len(s1)]\n        if window == need:\n            return True\n    return False",
"bug": [
7,
7
],
"fix": "            gone = s2[right - len(s1)]\n            window[gone] -= 1",
"tests": [
[
"has_anagram('ab', 'aab')",
true
],
[
"has_anagram('ab', 'eidbaooo')",
true
],
[
"has_anagram('ab', 'eidboaoo')",
false
]
],
"why": "When `gone` left the window, its count never went down, so the dictionary `window` still counted it. Add `window[gone] -= 1` right after finding `gone`. You missed this same line in Minimum Window on 18 November.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new letter"
],
[
6,
"drop the letter that left"
],
[
8,
"check the window"
]
],
"bugText": "            gone = s2[right - len(s1)]"
},
{
"id": "a2",
"habit": "A",
"kind": "fix",
"fn": "longest_replace",
"task": "`s` is a string of capital letters, and `k` is how many letters you may change. A change turns one letter into any other letter. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch that can become one letter repeated, using `k` changes or fewer. For example, `longest_replace('ABA', 0)` gives `1`. With 0 changes, a stretch must already be one letter repeated. \"AB\" and \"BA\" mix two letters, so the longest stretch is a single letter.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        size = right - left + 1\n        most = max(count.values())\n        while size - most > k:\n            left += 1\n            count[s[left]] -= 1\n            size = right - left + 1\n            most = max(count.values())\n        best = max(best, size)\n    return best",
"bug": [
10,
11
],
"fix": "            count[s[left]] -= 1\n            left += 1",
"tests": [
[
"longest_replace('ABA', 0)",
1
],
[
"longest_replace('BBAABB', 1)",
3
],
[
"longest_replace('BAAABA', 0)",
3
]
],
"why": "The code moved `left` before lowering the count, so `s[left]` pointed at the next letter, not the one leaving. Lower the count first with `count[s[left]] -= 1`, then move `left`.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new letter"
],
[
9,
"shrink until it is valid"
],
[
14,
"record the best size"
]
],
"bugText": "            left += 1\n            count[s[left]] -= 1"
},
{
"id": "a3",
"habit": "A",
"kind": "fix",
"fn": "max_profit",
"task": "Each number in `prices` is the price of one share on one day, in day order. You buy one share on one day and sell it on a later day. Return the biggest profit, which is the sell price minus the buy price, or 0 if no sale makes money. For example, `max_profit([7, 1, 5, 3, 6, 4])` gives `5`. The cheapest price is 1, on the second day. The highest price after that day is 6, so buying at 1 and selling at 6 makes 6 - 1 = 5.",
"code": "def max_profit(prices):\n    lowest = prices[0]\n    best = 0\n    for price in prices:\n        profit = price - lowest\n        best = max(best, profit)\n    return best",
"bug": [
5,
5
],
"fix": "        lowest = min(lowest, price)\n        profit = price - lowest",
"tests": [
[
"max_profit([7, 1, 5, 3, 6, 4])",
5
],
[
"max_profit([3, 8, 1, 4])",
5
],
[
"max_profit([2, 1, 4])",
3
]
],
"why": "The variable `lowest` never changed, so every profit was measured from the first day's price. Update it each day with `lowest = min(lowest, price)` before finding the profit. Each time the loop moves, ask which tracker must learn about the new item.",
"domain": "Algorithms",
"bugText": "        profit = price - lowest"
},
{
"id": "b1",
"habit": "B",
"kind": "fix",
"fn": "longest_replace",
"task": "`s` is a string of capital letters, and `k` is how many letters you may change. A change turns one letter into any other letter. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch that can become one letter repeated, using `k` changes or fewer. For example, `longest_replace('AABABBA', 1)` gives `4`. Change the B in \"AABA\" to A, and the stretch becomes \"AAAA\", with length 4. Every stretch of 5 letters needs at least 2 changes.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        size = right - left + 1\n        most = max(count.values())\n        while size - most > k:\n            count[left] -= 1\n            left += 1\n            size = right - left + 1\n            most = max(count.values())\n        best = max(best, size)\n    return best",
"bug": [
10,
10
],
"fix": "            count[s[left]] -= 1",
"tests": [
[
"longest_replace('AABABBA', 1)",
4
],
[
"longest_replace('ABC', 0)",
1
],
[
"longest_replace('AAAB', 0)",
3
]
],
"why": "The line used `left`, which is a position like 2, but the counts use letters as keys. Use the letter at that position: `count[s[left]] -= 1`.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new letter"
],
[
9,
"shrink until it is valid"
],
[
14,
"record the best size"
]
],
"bugText": "            count[left] -= 1"
},
{
"id": "b2",
"habit": "B",
"kind": "fix",
"fn": "longest_unique",
"task": "`s` is a string. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch in which no letter appears twice. For example, `longest_unique('abcb')` gives `3`. The stretch \"abc\" has no repeat and has length 3. The whole string \"abcb\" repeats b.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.pop(s[left])\n            left += 1\n        seen.add(s[right])\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
7,
7
],
"fix": "            seen.remove(s[left])",
"tests": [
[
"longest_unique('abcb')",
3
],
[
"longest_unique('aab')",
2
],
[
"longest_unique('abc')",
3
]
],
"why": "A set's `pop()` takes no value and removes a random item, so the call crashed. Use `remove` to take out one chosen item: `seen.remove(s[left])`. Name the type first, then choose the method.",
"domain": "Algorithms",
"jobs": [
[
6,
"make room for s[right]"
],
[
9,
"add the new letter"
],
[
10,
"record the best size"
]
],
"bugText": "            seen.pop(s[left])"
},
{
"id": "b3",
"habit": "B",
"kind": "fix",
"fn": "shortest_slice",
"task": "`nums` is a list of positive numbers, and `target` is a number. Look at every stretch of numbers that sit next to each other in `nums`. Find the shortest stretch whose sum is `target` or more, and return that stretch as a list. For example, `shortest_slice([2, 3, 1, 2, 4, 3], 7)` gives `[4, 3]`. No single number reaches 7. Of the stretches of 2 numbers, only [4, 3] reaches 7, because 4 + 3 = 7.",
"code": "def shortest_slice(nums, target):\n    total = 0\n    left = 0\n    best_left = 0\n    best_size = len(nums) + 1\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            size = right - left + 1\n            if size < best_size:\n                best_left = nums[left]\n                best_size = size\n            total -= nums[left]\n            left += 1\n    end = best_left + best_size\n    return nums[best_left:end]",
"bug": [
11,
11
],
"fix": "                best_left = left",
"tests": [
[
"shortest_slice([2, 3, 1, 2, 4, 3], 7)",
[
4,
3
]
],
[
"shortest_slice([1, 4, 4], 4)",
[
4
]
],
[
"shortest_slice([5, 1, 3], 6)",
[
5,
1
]
]
],
"why": "The line saved `nums[left]`, the number at that spot. The return line slices with `best_left`, so it needs the position. Save `left` instead.",
"domain": "Algorithms",
"jobs": [
[
7,
"add the new number"
],
[
8,
"shrink while sum is enough"
],
[
10,
"remember the best window"
],
[
15,
"slice out the best window"
]
],
"bugText": "                best_left = nums[left]"
},
{
"id": "g1",
"habit": "G",
"kind": "fix",
"fn": "longest_ones",
"task": "Each number in `nums` is 0 or 1. Look at every stretch of numbers that sit next to each other in `nums`. Return the length of the longest stretch that holds `k` zeros or fewer. For example, `longest_ones([1, 1, 0, 0, 1], 1)` gives `3`. The stretch [1, 1, 0] holds one zero and has length 3. Every stretch of 4 numbers holds both zeros, which is more than 1.",
"code": "def longest_ones(nums, k):\n    zeros = 0\n    left = 0\n    best = 0\n    for right in range(len(nums)):\n        if nums[right] == 0:\n            zeros += 1\n        while zeros >= k:\n            if nums[left] == 0:\n                zeros -= 1\n            left += 1\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
8,
8
],
"fix": "        while zeros > k:",
"tests": [
[
"longest_ones([1, 1, 0, 0, 1], 1)",
3
],
[
"longest_ones([1, 0, 1], 1)",
3
],
[
"longest_ones([0, 1], 2)",
2
]
],
"why": "\"At most k zeros\" means a window with exactly k zeros is fine. The check `zeros >= k` shrank that window anyway. Shrink only when `zeros > k`.",
"domain": "Algorithms",
"jobs": [
[
6,
"count the new zero"
],
[
8,
"shrink to at most k zeros"
],
[
12,
"record the best size"
]
],
"bugText": "        while zeros >= k:"
},
{
"id": "g2",
"habit": "G",
"kind": "fix",
"fn": "count_small",
"task": "`nums` is a list of numbers, `k` is a window size, and `limit` is a number. A window is `k` numbers that sit next to each other in `nums`. Count the windows whose sum is `limit` or less. For example, `count_small([1, 2, 3, 1], 2, 4)` gives `2`. Window [1, 2]: the sum is 3, so it counts. Window [2, 3]: the sum is 5, which is more than 4, so it does not count. Window [3, 1]: the sum is 4, so it counts.",
"code": "def count_small(nums, k, limit):\n    total = 0\n    found = 0\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1:\n            if total == limit:\n                found += 1\n    return found",
"bug": [
9,
9
],
"fix": "            if total <= limit:",
"tests": [
[
"count_small([1, 2, 3, 1], 2, 4)",
2
],
[
"count_small([1, 1, 1], 1, 5)",
3
],
[
"count_small([4, 4], 2, 7)",
0
]
],
"why": "\"At most limit\" means less than or equal, so the check is `total <= limit`. The check `total == limit` counted only windows that hit the limit exactly.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new number"
],
[
6,
"drop the number that left"
],
[
8,
"count a window under limit"
]
],
"bugText": "            if total == limit:"
},
{
"id": "g3",
"habit": "G",
"kind": "fix",
"fn": "window_sums",
"task": "`nums` is a list of numbers, and `k` is a window size. A window is `k` numbers that sit next to each other in `nums`. Slide the window from the start of the list to the end, one position at a time, and return a list with the sum of each window. For example, `window_sums([1, 2, 3, 4], 2)` gives `[3, 5, 7]`. Window [1, 2]: the sum is 3. Window [2, 3]: the sum is 5. Window [3, 4]: the sum is 7.",
"code": "def window_sums(nums, k):\n    total = 0\n    sums = []\n    for right in range(len(nums)):\n        total += nums[right]\n        if right > k:\n            total -= nums[right - k]\n        if right >= k - 1:\n            sums.append(total)\n    return sums",
"bug": [
6,
6
],
"fix": "        if right >= k:",
"tests": [
[
"window_sums([1, 2, 3, 4], 2)",
[
3,
5,
7
]
],
[
"window_sums([1, 1, 1], 1)",
[
1,
1,
1
]
],
[
"window_sums([3, 3], 2)",
[
6
]
]
],
"why": "With `right > k`, the first number left one step too late. For k = 2, the window held 3 numbers when `right` was 2. Start removing when `right >= k`, and check that first moment by hand.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new number"
],
[
6,
"drop the number that left"
],
[
8,
"save each full window"
]
],
"bugText": "        if right > k:"
},
{
"id": "g4",
"habit": "G",
"kind": "fix",
"fn": "longest_replace",
"task": "`s` is a string of capital letters, and `k` is how many letters you may change. A change turns one letter into any other letter. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch that can become one letter repeated, using `k` changes or fewer. For example, `longest_replace('AAAA', 2)` gives `4`. The whole string is already all A, so it needs no changes and has length 4.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        size = right - left + 1\n        most = max(count.values())\n        if size - most == k:\n            best = max(best, size)\n        while size - most > k:\n            count[s[left]] -= 1\n            left += 1\n            size = right - left + 1\n            most = max(count.values())\n    return best",
"bug": [
9,
9
],
"fix": "        if size - most <= k:",
"tests": [
[
"longest_replace('AAAA', 2)",
4
],
[
"longest_replace('AABABBA', 1)",
4
],
[
"longest_replace('ABAB', 2)",
4
]
],
"why": "A window is valid when it needs at most k changes, so the check is `<= k`. \"AAAA\" needs 0 changes, and 0 is not equal to 2, so `== k` skipped it. You made this slip on 19 November at 3:08 AM.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new letter"
],
[
9,
"record a valid window"
],
[
11,
"shrink until it is valid"
]
],
"bugText": "        if size - most == k:"
},
{
"id": "j1",
"habit": "J",
"kind": "fix",
"fn": "longest_unique",
"task": "`s` is a string. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch in which no letter appears twice. For example, `longest_unique('abcb')` gives `3`. The stretch \"abc\" has no repeat and has length 3. The whole string \"abcb\" repeats b.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left -= 1\n        seen.add(s[right])\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
8,
8
],
"fix": "            left += 1",
"tests": [
[
"longest_unique('abcb')",
3
],
[
"longest_unique('aa')",
1
],
[
"longest_unique('abc')",
3
]
],
"why": "The window shrinks from the left, so `left` moves forward, toward `right`. The line `left -= 1` moved it backward. Say the direction out loud: \"shrink means left goes up.\"",
"domain": "Algorithms",
"jobs": [
[
6,
"make room for s[right]"
],
[
9,
"add the new letter"
],
[
10,
"record the best size"
]
],
"bugText": "            left -= 1"
},
{
"id": "j2",
"habit": "J",
"kind": "fix",
"fn": "count_vowels",
"task": "`s` is a string of lowercase letters. Return how many letters in `s` are vowels, meaning a, e, i, o or u. For example, `count_vowels('banana')` gives `3`, because \"banana\" holds three a's and no other vowel.",
"code": "def count_vowels(s):\n    found = 0\n    for i in len(range(s)):\n        if s[i] in 'aeiou':\n            found += 1\n    return found",
"bug": [
3,
3
],
"fix": "    for i in range(len(s)):",
"tests": [
[
"count_vowels('banana')",
3
],
[
"count_vowels('xyz')",
0
],
[
"count_vowels('a')",
1
]
],
"why": "The call `range(s)` failed because `s` is a string, not a number. Read nested calls from the inside out: first get the length with `len(s)`, then make the range with `range(len(s))`.",
"domain": "Algorithms",
"bugText": "    for i in len(range(s)):"
},
{
"id": "j3",
"habit": "J",
"kind": "fix",
"fn": "shortest_len",
"task": "`nums` is a list of positive numbers, and `target` is a number. Look at every stretch of numbers that sit next to each other in `nums`. Return the length of the shortest stretch whose sum is `target` or more, or 0 if no stretch reaches `target`. For example, `shortest_len([1, 1], 5)` gives `0`. The whole list sums to only 1 + 1 = 2, which is less than 5, so no stretch reaches 5.",
"code": "def shortest_len(nums, target):\n    total = 0\n    left = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            size = right - left + 1\n            best = min(best, size)\n            total -= nums[left]\n            left += 1\n    if best == float('-inf'):\n        return 0\n    return best",
"bug": [
12,
12
],
"fix": "    if best == float('inf'):",
"tests": [
[
"shortest_len([1, 1], 5)",
0
],
[
"shortest_len([2, 3, 1, 2, 4, 3], 7)",
2
],
[
"shortest_len([7], 7)",
1
]
],
"why": "The variable `best` starts at plus infinity, so \"nothing found\" means it still equals `float('inf')`. The check compared with minus infinity, the opposite sign. You made this slip on 19 November at 6:15 AM.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new number"
],
[
7,
"shrink while sum is enough"
],
[
12,
"nothing found gives 0"
]
],
"bugText": "    if best == float('-inf'):"
},
{
"id": "j4",
"habit": "J",
"kind": "fix",
"fn": "window_max",
"task": "`nums` is a list of numbers, and `k` is a window size. A window is `k` numbers that sit next to each other in `nums`. Slide the window from the start of the list to the end, one position at a time, and return a list with the biggest number in each window. For example, `window_max([3, 1, 2, 5], 2)` gives `[3, 2, 5]`. Window [3, 1]: the biggest is 3. Window [1, 2]: the biggest is 2. Window [2, 5]: the biggest is 5.",
"code": "def window_max(nums, k):\n    queue = deque()\n    out = []\n    for right in range(len(nums)):\n        new = nums[right]\n        while queue:\n            back = nums[queue[-1]]\n            if back >= new:\n                break\n            queue.popleft()\n        queue.append(right)\n        if queue[0] <= right - k:\n            queue.popleft()\n        if right >= k - 1:\n            out.append(nums[queue[0]])\n    return out",
"bug": [
10,
10
],
"fix": "            queue.pop()",
"tests": [
[
"window_max([5, 1, 3], 3)",
[
5
]
],
[
"window_max([3, 1, 2, 5], 2)",
[
3,
2,
5
]
],
[
"window_max([9, 2, 4, 1], 3)",
[
9,
4
]
]
],
"why": "Smaller numbers must leave from the back of the queue, where the new number arrives. The method `popleft()` removed from the front instead. Use `pop()` to remove from the back.",
"domain": "Algorithms",
"jobs": [
[
6,
"drop smaller from the back"
],
[
11,
"add the new position"
],
[
12,
"drop the front if it left"
],
[
14,
"record the max"
]
],
"bugText": "            queue.popleft()"
},
{
"id": "m1",
"habit": "M",
"kind": "fix",
"fn": "has_sum",
"task": "`nums` is a list of numbers, `k` is a window size, and `target` is a number. A window is `k` numbers that sit next to each other in `nums`. Return True if any window sums to exactly `target`, and False if none does. For example, `has_sum([1, 2, 3], 2, 5)` gives `True`. Window [1, 2]: the sum is 3, not 5. Window [2, 3]: the sum is 5, so the answer is True.",
"code": "def has_sum(nums, k, target):\n    total = 0\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1:\n            if total == target:\n                return True",
"bug": [
9,
9
],
"fix": "                return True\n    return False",
"tests": [
[
"has_sum([1, 2, 3], 2, 5)",
true
],
[
"has_sum([1, 2, 3], 2, 9)",
false
],
[
"has_sum([4], 1, 1)",
false
]
],
"why": "When no window adds up to the target, the loop ends and the function returns `None`. Add `return False` after the loop. Right after writing a loop, write the line for \"nothing found\".",
"domain": "Algorithms",
"bugText": "                return True"
},
{
"id": "m2",
"habit": "M",
"kind": "fix",
"fn": "first_repeat",
"task": "`s` is a string. Read `s` from left to right, and return the first letter that you meet for the second time. If no letter appears twice, return an empty string, `\"\"`. For example, `first_repeat('abca')` gives `'a'`. Read a, b and c: each one is new. Read a again: a is the first letter met twice, so the answer is 'a'.",
"code": "def first_repeat(s):\n    seen = set()\n    for letter in s:\n        if letter in seen:\n            return letter\n        seen.add(letter)",
"bug": [
6,
6
],
"fix": "        seen.add(letter)\n    return \"\"",
"tests": [
[
"first_repeat('abca')",
"a"
],
[
"first_repeat('abc')",
""
],
[
"first_repeat('')",
""
]
],
"why": "When no letter repeats, the loop ends without a return, so Python gives back `None` instead of an empty string. Add `return \"\"` after the loop. Ask what to return when the loop finds nothing.",
"domain": "Algorithms",
"bugText": "        seen.add(letter)"
},
{
"id": "n1",
"habit": "N",
"kind": "fix",
"fn": "has_anagram",
"task": "`s1` and `s2` are strings. Return True if `s2` holds a stretch of letters that sit next to each other and use exactly the letters of `s1`, each the same number of times, in any order. Otherwise return False. Such a stretch is always as long as `s1`. For example, `has_anagram('ab', 'eidbaooo')` gives `True`. Stretches \"ei\", \"id\" and \"db\" do not match. Stretch \"ba\": one b and one a, the same letters as \"ab\", so the answer is True.",
"code": "def has_anagram(s1, s2):\n    need = Counter(s1)\n    window = Counter()\n    for right in range(len(s2)):\n        window[s2[right]] += 1\n        if window == need:\n            return True\n        if right >= len(s1):\n            gone = s2[right - len(s1)]\n            window[gone] -= 1\n    return False",
"bug": [
6,
10
],
"fix": "        if right >= len(s1):\n            gone = s2[right - len(s1)]\n            window[gone] -= 1\n        if window == need:\n            return True",
"tests": [
[
"has_anagram('ab', 'eidbaooo')",
true
],
[
"has_anagram('ab', 'ba')",
true
],
[
"has_anagram('ab', 'eidboaoo')",
false
]
],
"why": "The check ran while the window was still one letter too long, so the right window was never compared. Keep this order inside the loop: add the new letter, remove the old one, then check. You made this slip on 19 November at 5:58 AM.",
"domain": "Algorithms",
"jobs": [
[
5,
"add the new letter"
],
[
11,
"no window matched"
]
],
"bugText": "        if window == need:\n            return True\n        if right >= len(s1):\n            gone = s2[right - len(s1)]\n            window[gone] -= 1"
},
{
"id": "n2",
"habit": "N",
"kind": "fix",
"fn": "shortest_len",
"task": "`nums` is a list of positive numbers, and `target` is a number. Look at every stretch of numbers that sit next to each other in `nums`. Return the length of the shortest stretch whose sum is `target` or more, or 0 if no stretch reaches `target`. For example, `shortest_len([2, 3, 1, 2, 4, 3], 7)` gives `2`. No single number reaches 7. The stretch [4, 3] sums to 7 and has length 2.",
"code": "def shortest_len(nums, target):\n    total = 0\n    left = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            total -= nums[left]\n            left += 1\n            size = right - left + 1\n            best = min(best, size)\n    if best == float('inf'):\n        return 0\n    return best",
"bug": [
8,
11
],
"fix": "            size = right - left + 1\n            best = min(best, size)\n            total -= nums[left]\n            left += 1",
"tests": [
[
"shortest_len([2, 3, 1, 2, 4, 3], 7)",
2
],
[
"shortest_len([7], 7)",
1
],
[
"shortest_len([1, 4, 4], 4)",
1
]
],
"why": "The code moved `left` before saving the length, so it measured a window that might no longer reach the target. Save `best` while the window is still valid, then shrink it.",
"domain": "Algorithms",
"jobs": [
[
6,
"add the new number"
],
[
7,
"shrink while sum is enough"
],
[
12,
"nothing found gives 0"
]
],
"bugText": "            total -= nums[left]\n            left += 1\n            size = right - left + 1\n            best = min(best, size)"
},
{
"id": "c1",
"habit": "C",
"kind": "fix",
"fn": "longest_unique",
"task": "`s` is a string. Look at every stretch of letters that sit next to each other in `s`. Return the length of the longest stretch in which no letter appears twice. For example, `longest_unique('aaccca')` gives `2`. The stretch \"ac\" has no repeat and has length 2. Every stretch of 3 letters, such as \"acc\", repeats a letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        if s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[right])\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
6,
6
],
"fix": "        while s[right] in seen:",
"tests": [
[
"longest_unique('aaccca')",
2
],
[
"longest_unique('baaaca')",
2
],
[
"longest_unique('aacccab')",
3
]
],
"why": "Removing one letter may leave the repeat in place. For \"abcb\", removing \"a\" still leaves the first \"b\". Use `while` instead of `if`, so the window keeps shrinking until the repeat is gone.",
"domain": "Algorithms",
"jobs": [
[
6,
"make room for s[right]"
],
[
9,
"add the new letter"
],
[
10,
"record the best size"
]
],
"bugText": "        if s[right] in seen:"
},
{
"id": "p1",
"habit": "A",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs.",
"code": "s = \"abb\"\ncount = {\"a\": 1, \"b\": 2}\nleft = 0\nleft += 1\ncount[s[left]] -= 1",
"ask": [
"left",
"count[\"a\"]",
"count[\"b\"]"
],
"why": "The code moved `left` first, so `s[left]` became the letter after the one that should leave. The count of \"b\" went down, and \"a\" stayed at 1. Lower the count before moving `left`.",
"domain": "Algorithms",
"answers": [
"1",
"1",
"1"
]
},
{
"id": "p2",
"habit": "E",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs.",
"code": "window = {\"d\": 2, \"c\": 1}\nleft = 0\nright = 2\nsize = right - left + 1\nkinds = len(window)",
"ask": [
"size",
"kinds"
],
"why": "The variable `size` is how many letters the window holds: 3. The value `len(window)` is how many different letters it holds: 2. The two are easy to mix up, because both sound like \"how big is the window\".",
"domain": "Algorithms",
"answers": [
"3",
"2"
]
},
{
"id": "p3",
"habit": "A",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "s = \"abca\"\nseen = set()\nleft = 0\nfor right in range(len(s)):\n    while s[right] in seen:\n        seen.remove(s[left])\n        left += 1\n    seen.add(s[right])",
"ask": [
"left",
"right",
"len(seen)"
],
"why": "At the last \"a\", the first \"a\" leaves, and `left` moves to 1. The set `seen` always holds the letters from `left` to `right`, which are b, c and a, so its length is 3.",
"domain": "Algorithms",
"answers": [
"1",
"3",
"3"
]
},
{
"id": "p4",
"habit": "G",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "nums = [1, 0, 0, 1]\nk = 1\nzeros = 0\nleft = 0\nbest = 0\nfor right in range(len(nums)):\n    if nums[right] == 0:\n        zeros += 1\n    while zeros > k:\n        if nums[left] == 0:\n            zeros -= 1\n        left += 1\n    size = right - left + 1\n    best = max(best, size)",
"ask": [
"left",
"zeros",
"best"
],
"why": "At the second zero, `zeros` becomes 2, which is more than 1. The loop drops the 1 and then the first 0, so `left` ends at 2 and `zeros` goes back to 1. The best window was [1, 0], with length 2.",
"domain": "Algorithms",
"answers": [
"2",
"1",
"2"
]
},
{
"id": "p5",
"habit": "B",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs.",
"code": "nums = [5, 7, 9]\nleft = 1\nbest_left = nums[left]\nend = left + 2",
"ask": [
"best_left",
"end"
],
"why": "The value of `nums[left]` is 7, the number at that spot, not the position 1. A variable used for slicing, like `best_left`, must hold the position `left`.",
"domain": "Algorithms",
"answers": [
"7",
"3"
]
},
{
"id": "p6",
"habit": "N",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "nums = [2, 3, 1]\nk = 2\ntotal = 0\nsums = []\nfor right in range(len(nums)):\n    total += nums[right]\n    if right >= k:\n        total -= nums[right - k]\n    if right >= k - 1:\n        sums.append(total)",
"ask": [
"total",
"sums"
],
"why": "Use this order: add, remove, then save. At `right = 2`, the 2 leaves before the sum is saved, so the second sum is 3 + 1 = 4.",
"domain": "Algorithms",
"answers": [
"4",
"[5, 4]"
]
},
{
"id": "p7",
"habit": "J",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs. `float(\"inf\")` is positive infinity, and `float(\"-inf\")` is negative infinity.",
"code": "best = float(\"inf\")\nfound = best == float(\"-inf\")\nmissing = best == float(\"inf\")",
"ask": [
"found",
"missing"
],
"why": "The variable `best` starts at plus infinity, so it equals `float(\"inf\")`, not minus infinity. The \"nothing found\" check must use the same sign as the starting value.",
"domain": "Algorithms",
"answers": [
"False",
"True"
]
},
{
"id": "p8",
"habit": "A",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "s = \"AABAB\"\nk = 1\ncount = {}\nleft = 0\nbest = 0\nfor right in range(len(s)):\n    if s[right] not in count:\n        count[s[right]] = 0\n    count[s[right]] += 1\n    size = right - left + 1\n    most = max(count.values())\n    while size - most > k:\n        count[s[left]] -= 1\n        left += 1\n        size = right - left + 1\n        most = max(count.values())\n    best = max(best, size)",
"ask": [
"left",
"count[\"A\"]",
"best"
],
"why": "At the last \"B\", the window AABAB needs 2 changes, so the first \"A\" leaves. The window ABAB still needs 2 changes, so the second \"A\" leaves too. That leaves `left` at 2 and the count of \"A\" at 1, and the best window was AABA, with length 4.",
"domain": "Algorithms",
"answers": [
"2",
"1",
"4"
]
},
{
"id": "v1",
"habit": "J",
"kind": "fix",
"fn": "box_area",
"task": "`box` is a tuple of four numbers, `(x1, y1, x2, y2)`. The point (x1, y1) is one corner of the box, and (x2, y2) is the opposite corner, with `x2` bigger than `x1` and `y2` bigger than `y1`. Return the area of the box, which is its width times its height. For example, `box_area((0, 0, 4, 3))` gives `12`. The width is 4 - 0 = 4, the height is 3 - 0 = 3, and 4 times 3 is 12.",
"code": "def box_area(box):\n    x1, y1, x2, y2 = box\n    width = x1 - x2\n    height = y2 - y1\n    return width * height",
"bug": [
3,
3
],
"fix": "    width = x2 - x1",
"tests": [
[
"box_area((0, 0, 4, 3))",
12
],
[
"box_area((2, 1, 5, 6))",
15
],
[
"box_area((1, 1, 2, 2))",
1
]
],
"why": "Width is the right edge minus the left edge: `x2 - x1`. The line subtracted the other way, so every area came out negative.",
"domain": "Computer vision",
"bugText": "    width = x1 - x2"
},
{
"id": "v2",
"habit": "E",
"kind": "fix",
"fn": "overlap",
"task": "`a` and `b` are boxes, and each is a tuple `(x1, y1, x2, y2)`. The point (x1, y1) is the corner with the smaller x and y, and (x2, y2) is the opposite corner. Return the area that both boxes cover, or 0 if they do not overlap. For example, `overlap((0, 0, 4, 4), (2, 2, 6, 6))` gives `4`. Along x, both boxes cover 2 to 4, which is 2 wide. Along y, both cover 2 to 4, which is 2 tall. So the shared area is 2 times 2 = 4.",
"code": "def overlap(a, b):\n    x1 = max(a[0], b[0])\n    y1 = max(a[0], b[1])\n    x2 = min(a[2], b[2])\n    y2 = min(a[3], b[3])\n    width = x2 - x1\n    height = y2 - y1\n    if width <= 0 or height <= 0:\n        return 0\n    return width * height",
"bug": [
3,
3
],
"fix": "    y1 = max(a[1], b[1])",
"tests": [
[
"overlap((0, 0, 4, 4), (2, 2, 6, 6))",
4
],
[
"overlap((0, 5, 4, 9), (2, 1, 6, 8))",
6
],
[
"overlap((0, 0, 1, 1), (2, 2, 3, 3))",
0
]
],
"why": "The height uses the y values, which sit at positions 1 and 3. The line used `a[0]`, an x value, because it was copied from the `x1` line above. Use `max(a[1], b[1])`.",
"domain": "Computer vision",
"jobs": [
[
2,
"top-left of the overlap"
],
[
4,
"bottom-right of the overlap"
],
[
8,
"boxes that miss share 0"
]
],
"bugText": "    y1 = max(a[0], b[1])"
},
{
"id": "v3",
"habit": "B",
"kind": "fix",
"fn": "brightest_pixel",
"task": "`image` is a list of rows, and each row is a list of brightness values. `x` is a column number and `y` is a row number, and both count from 0. Return the brightness in column `x` of row `y`. The function reads just this one pixel, despite its name. For example, `brightest_pixel([[1, 2, 3], [4, 5, 6]], 2, 1)` gives `6`. Row 1 is [4, 5, 6], and column 2 of that row holds 6.",
"code": "def brightest_pixel(image, x, y):\n    row = image[x]\n    return row[y]",
"bug": [
2,
3
],
"fix": "    row = image[y]\n    return row[x]",
"tests": [
[
"brightest_pixel([[1, 2, 3], [4, 5, 6]], 2, 1)",
6
],
[
"brightest_pixel([[7, 8], [9, 10]], 0, 1)",
9
],
[
"brightest_pixel([[0, 5]], 1, 0)",
5
]
],
"why": "An image is a list of rows, so the first index picks the row, `y`, and the second index picks the column, `x`. The code swapped them. Say what each index means before you use it.",
"domain": "Computer vision",
"bugText": "    row = image[x]\n    return row[y]"
},
{
"id": "v4",
"habit": "A",
"kind": "fix",
"fn": "rolling_brightness",
"task": "Each number in `frames` is the brightness of one video frame, in order, and `k` is a window size. A window is `k` frames that sit next to each other. Slide the window from the first frame to the last, one frame at a time, and return a list with the average brightness of each window, which is the window's sum divided by `k`. For example, `rolling_brightness([10, 20, 30, 40], 2)` gives `[15.0, 25.0, 35.0]`. Window [10, 20]: (10 + 20) / 2 = 15.0. Window [20, 30]: 25.0. Window [30, 40]: 35.0.",
"code": "def rolling_brightness(frames, k):\n    total = 0\n    out = []\n    for right in range(len(frames)):\n        total += frames[right]\n        if right >= k:\n            leaving = frames[right - k]\n        if right >= k - 1:\n            out.append(total / k)\n    return out",
"bug": [
7,
7
],
"fix": "            leaving = frames[right - k]\n            total -= leaving",
"tests": [
[
"rolling_brightness([10, 20, 30, 40], 2)",
[
15.0,
25.0,
35.0
]
],
[
"rolling_brightness([5, 5, 5], 3)",
[
5.0
]
],
[
"rolling_brightness([0, 10, 0], 1)",
[
0.0,
10.0,
0.0
]
]
],
"why": "The frame `leaving` left the group, but `total` still included it, so the total kept growing. Add `total -= leaving` each time the window moves.",
"domain": "Computer vision",
"jobs": [
[
5,
"add the new frame"
],
[
6,
"drop the frame that left"
],
[
8,
"save the average"
]
],
"bugText": "            leaving = frames[right - k]"
},
{
"id": "v5",
"habit": "G",
"kind": "fix",
"fn": "motion_frames",
"task": "Each number in `levels` is the brightness of one video frame, in order. Compare each frame with the frame just before it. Count the frames whose brightness changed by `threshold` or more, up or down. The first frame has no frame before it, so it never counts. For example, `motion_frames([0, 5, 5, 12], 5)` gives `2`. From 0 to 5, the change is 5, so it counts. From 5 to 5, the change is 0. From 5 to 12, the change is 7, so it counts.",
"code": "def motion_frames(\n    levels, threshold\n):\n    count = 0\n    for i in range(1, len(levels)):\n        before = levels[i - 1]\n        after = levels[i]\n        change = abs(after - before)\n        if change > threshold:\n            count += 1\n    return count",
"bug": [
9,
9
],
"fix": "        if change >= threshold:",
"tests": [
[
"motion_frames([0, 5, 5, 12], 5)",
2
],
[
"motion_frames([1, 1, 1], 0)",
2
],
[
"motion_frames([3, 9], 7)",
0
]
],
"why": "\"At least threshold\" includes the threshold itself, so the check is `>=`. With `>`, a change of exactly 5 was not counted.",
"domain": "Computer vision",
"jobs": [
[
6,
"measure the change"
],
[
9,
"count big enough changes"
]
],
"bugText": "        if change > threshold:"
},
{
"id": "v6",
"habit": "J",
"kind": "fix",
"fn": "top_detections",
"task": "Each item in `dets` is a detection, written as a pair `(label, score)`, such as `('dog', 0.9)`. Return the `k` detections with the highest scores, in a list ordered from highest score to lowest. For example, `top_detections([('cat', 0.2), ('dog', 0.9), ('car', 0.5)], 2)` gives `[('dog', 0.9), ('car', 0.5)]`. From highest to lowest, the scores are 0.9 for dog, 0.5 for car and 0.2 for cat, and the first 2 are dog and car.",
"code": "def top_detections(dets, k):\n    def score(det):\n        return det[1]\n    ranked = sorted(dets, key=score)\n    return ranked[:k]",
"bug": [
4,
4
],
"fix": "    ranked = sorted(dets, key=score)\n    ranked.reverse()",
"tests": [
[
"top_detections([('cat', 0.2), ('dog', 0.9), ('car', 0.5)], 2)",
[
[
"dog",
0.9
],
[
"car",
0.5
]
]
],
[
"top_detections([('a', 0.1)], 1)",
[
[
"a",
0.1
]
]
],
[
"top_detections([('x', 0.3), ('y', 0.7)], 1)",
[
[
"y",
0.7
]
]
]
],
"why": "The function `sorted` puts the smallest score first. Add `ranked.reverse()` to put the highest score first. Say the order out loud: \"highest first means reversed.\"",
"domain": "Computer vision",
"bugText": "    ranked = sorted(dets, key=score)"
},
{
"id": "v7",
"habit": "M",
"kind": "fix",
"fn": "first_stable",
"task": "Each item in `seen` is True if the camera saw the object in that frame, and False if it did not. Frames count from 0. Return the number of the first frame that ends 3 True values in a row, with no False between them, or -1 if that never happens. For example, `first_stable([True, True, False, True, True, True])` gives `5`. Frames 0 and 1 are True, but frame 2 is False, so the count starts over. Frames 3, 4 and 5 are True, so frame 5 is the first frame that ends 3 in a row.",
"code": "def first_stable(seen):\n    run = 0\n    for i in range(len(seen)):\n        if seen[i]:\n            run += 1\n        else:\n            run = 0\n        if run == 3:\n            return i",
"bug": [
9,
9
],
"fix": "            return i\n    return -1",
"tests": [
[
"first_stable([True, True, False, True, True, True])",
5
],
[
"first_stable([True, False, True])",
-1
],
[
"first_stable([])",
-1
]
],
"why": "When the object never shows up 3 times in a row, the loop ends without a return, and Python gives back `None`. Add `return -1` after the loop.",
"domain": "Computer vision",
"bugText": "            return i"
},
{
"id": "v8",
"habit": "E",
"kind": "fix",
"fn": "clamp_box",
"task": "`box` is a tuple `(x1, y1, x2, y2)`, where (x1, y1) is the top left corner and (x2, y2) is the bottom right corner. The image covers x from 0 to `width` and y from 0 to `height`. Move each edge of the box that lies outside the image onto the image's edge, and return the new box as a tuple. For example, `clamp_box((-5, -5, 50, 50), 40, 30)` gives `(0, 0, 40, 30)`. x1 is -5, below 0, so it becomes 0, and y1 becomes 0 the same way. x2 is 50, past the width of 40, so it becomes 40. y2 is 50, past the height of 30, so it becomes 30.",
"code": "def clamp_box(box, width, height):\n    x1, y1, x2, y2 = box\n    x1 = max(0, x1)\n    y1 = max(0, y1)\n    x2 = min(width, x2)\n    y2 = min(width, y2)\n    return (x1, y1, x2, y2)",
"bug": [
6,
6
],
"fix": "    y2 = min(height, y2)",
"tests": [
[
"clamp_box((-5, -5, 50, 50), 40, 30)",
[
0,
0,
40,
30
]
],
[
"clamp_box((1, 2, 3, 4), 10, 10)",
[
1,
2,
3,
4
]
],
[
"clamp_box((0, 0, 9, 9), 20, 5)",
[
0,
0,
9,
5
]
]
],
"why": "The y values must stay inside the height, not the width: `y2 = min(height, y2)`. The line was copied from the `x2` line above it, and one name stayed the same.",
"domain": "Computer vision",
"bugText": "    y2 = min(width, y2)"
},
{
"id": "s1",
"habit": "N",
"kind": "fix",
"fn": "allow",
"task": "Each number in `times` is the second when one request arrived, in order. A request at second t is allowed if fewer than `limit` allowed requests arrived less than `window` seconds before t, which means after second t - `window`. Blocked requests never count. Return a list with True for each allowed request and False for each blocked one. For example, `allow([1, 2, 3, 12], 2, 10)` gives `[True, True, False, True]`. Second 1: no recent requests, so allowed. Second 2: one recent request, so allowed. Second 3: the requests at seconds 1 and 2 already make 2, so blocked. Second 12: seconds 1 and 2 are 10 or more seconds old, so they no longer count, and the request is allowed.",
"code": "def allow(times, limit, window):\n    recent = deque()\n    out = []\n    for t in times:\n        cutoff = t - window\n        ok = len(recent) < limit\n        out.append(ok)\n        while recent:\n            if recent[0] > cutoff:\n                break\n            recent.popleft()\n        if ok:\n            recent.append(t)\n    return out",
"bug": [
6,
11
],
"fix": "        while recent:\n            if recent[0] > cutoff:\n                break\n            recent.popleft()\n        ok = len(recent) < limit\n        out.append(ok)",
"tests": [
[
"allow([1, 2, 3, 12], 2, 10)",
[
true,
true,
false,
true
]
],
[
"allow([0, 5, 10], 1, 5)",
[
true,
true,
true
]
],
[
"allow([1, 1, 1], 2, 1)",
[
true,
true,
false
]
]
],
"why": "The code decided before removing old requests, so expired requests still counted against the limit. Keep this order: add, remove the old ones, then decide.",
"domain": "Backend",
"jobs": [
[
5,
"times up to cutoff expire"
],
[
12,
"remember allowed requests"
]
],
"bugText": "        ok = len(recent) < limit\n        out.append(ok)\n        while recent:\n            if recent[0] > cutoff:\n                break\n            recent.popleft()"
},
{
"id": "s2",
"habit": "B",
"kind": "fix",
"fn": "count_hits",
"task": "Each item in `users` is the name of the user who made one request. Return a Counter, which is a dictionary that maps each name to how many requests that user made. The example wraps the result in `dict()` so it prints as a plain dictionary. For example, `dict(count_hits(['ann', 'bo', 'ann']))` gives `{'ann': 2, 'bo': 1}`, because ann made 2 requests and bo made 1.",
"code": "def count_hits(users):\n    counts = {}\n    for user in users:\n        counts[user] += 1\n    return counts",
"bug": [
2,
2
],
"fix": "    counts = Counter()",
"tests": [
[
"dict(count_hits(['ann', 'bo', 'ann']))",
{
"ann": 2,
"bo": 1
}
],
[
"dict(count_hits([]))",
{}
],
[
"dict(count_hits(['x']))",
{
"x": 1
}
]
],
"why": "A plain dictionary has no starting value for a new key, so `counts[user] += 1` raised a KeyError. A `Counter` starts every new key at 0. You hit the same crash in Minimum Window Substring.",
"domain": "Backend",
"bugText": "    counts = {}"
},
{
"id": "s3",
"habit": "M",
"kind": "fix",
"fn": "first_error",
"task": "Each item in `lines` is one line of a log file, as a string. Return the position of the first line that starts with \"ERROR\", counting from 0, or -1 if no line does. For example, `first_error(['INFO ok', 'ERROR disk', 'ERROR net'])` gives `1`. The line at position 0 starts with INFO. The line at position 1 starts with ERROR, so the answer is 1, even though position 2 also starts with ERROR.",
"code": "def first_error(lines):\n    for i, line in enumerate(lines):\n        if line.startswith(\"ERROR\"):\n            return i",
"bug": [
4,
4
],
"fix": "            return i\n    return -1",
"tests": [
[
"first_error(['INFO ok', 'ERROR disk', 'ERROR net'])",
1
],
[
"first_error(['INFO ok'])",
-1
],
[
"first_error([])",
-1
]
],
"why": "A log with no errors never reaches `return i`, so the function returns `None`. Add `return -1` after the loop. Every search needs a \"not found\" line after the loop.",
"domain": "Backend",
"bugText": "            return i"
},
{
"id": "s4",
"habit": "N",
"kind": "fix",
"fn": "retry_delays",
"task": "A program retries a failed request `attempts` times and waits before each retry. The first wait is `base` seconds, and each later wait is twice the wait before it. Return the list of waits. For example, `retry_delays(1, 3)` gives `[1, 2, 4]`. Retry 1 waits 1 second. Retry 2 waits 1 times 2 = 2. Retry 3 waits 2 times 2 = 4.",
"code": "def retry_delays(base, attempts):\n    delay = base\n    out = []\n    for _ in range(attempts):\n        delay = delay * 2\n        out.append(delay)\n    return out",
"bug": [
5,
6
],
"fix": "        out.append(delay)\n        delay = delay * 2",
"tests": [
[
"retry_delays(1, 3)",
[
1,
2,
4
]
],
[
"retry_delays(5, 1)",
[
5
]
],
[
"retry_delays(2, 0)",
[]
]
],
"why": "The code doubled the wait before using it, so the base wait was never used. Add the current wait first, then double it for the next retry.",
"domain": "Backend",
"bugText": "        delay = delay * 2\n        out.append(delay)"
},
{
"id": "s5",
"habit": "G",
"kind": "fix",
"fn": "page_items",
"task": "Split `items` into pages of `size` items each, in order. Pages count from 0, and the last page may hold fewer items. Return the items on page number `page`. For example, `page_items([1, 2, 3, 4, 5], 2, 2)` gives `[5]`. Page 0 holds [1, 2]. Page 1 holds [3, 4]. Page 2 holds [5].",
"code": "def page_items(items, page, size):\n    start = (page - 1) * size\n    end = start + size\n    return items[start:end]",
"bug": [
2,
2
],
"fix": "    start = page * size",
"tests": [
[
"page_items([1, 2, 3, 4, 5], 0, 2)",
[
1,
2
]
],
[
"page_items([1, 2, 3, 4, 5], 2, 2)",
[
5
]
],
[
"page_items(['a', 'b', 'c'], 1, 1)",
[
"b"
]
]
],
"why": "Pages start at 0 here, so page 0 starts at item 0, and the start is `page * size`. The code used `(page - 1) * size`, which counts pages from 1. Check page 0 by hand: it must give the first items.",
"domain": "Backend",
"bugText": "    start = (page - 1) * size"
},
{
"id": "s6",
"habit": "G",
"kind": "fix",
"fn": "active_users",
"task": "`last_seen` is a dictionary that maps each user to the second when that user was last active, and `now` is the current second. A user is active if they were last seen less than `timeout` seconds before `now`. Return how many users are active. For example, `active_users({'a': 95, 'b': 90, 'c': 50}, 100, 10)` gives `1`. User a was seen 100 - 95 = 5 seconds ago, less than 10, so a counts. User b was seen exactly 10 seconds ago, which is not less than 10, so b does not count. User c was seen 50 seconds ago and does not count.",
"code": "def active_users(\n    last_seen, now, timeout\n):\n    count = 0\n    for user in last_seen:\n        age = now - last_seen[user]\n        if age <= timeout:\n            count += 1\n    return count",
"bug": [
7,
7
],
"fix": "        if age < timeout:",
"tests": [
[
"active_users({'a': 95, 'b': 90, 'c': 50}, 100, 10)",
1
],
[
"active_users({'a': 100}, 100, 1)",
1
],
[
"active_users({}, 5, 5)",
0
]
],
"why": "\"Less than timeout\" leaves out the timeout itself, so the check is `<`. User b was active exactly 10 seconds ago and must not count.",
"domain": "Backend",
"bugText": "        if age <= timeout:"
},
{
"id": "s7",
"habit": "E",
"kind": "fix",
"fn": "merge_events",
"task": "`a` and `b` are lists of event times, and each list is sorted from smallest to largest. Return one list that holds every time from both lists, sorted from smallest to largest. For example, `merge_events([2], [1, 3])` gives `[1, 2, 3]`, because the times from both lists, in order, are 1, 2 and 3.",
"code": "def merge_events(a, b):\n    i, j, out = 0, 0, []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            i += 1\n    return out + a[i:] + b[j:]",
"bug": [
9,
9
],
"fix": "            j += 1",
"tests": [
[
"merge_events([1, 4], [2, 3])",
[
1,
2,
3,
4
]
],
[
"merge_events([], [5])",
[
5
]
],
[
"merge_events([2], [1, 3])",
[
1,
2,
3
]
]
],
"why": "After taking a time from `b`, its pointer `j` must move forward. The line moved `i` instead, because it was copied from the `a` branch above.",
"domain": "Backend",
"jobs": [
[
4,
"take the smaller time"
],
[
10,
"add what is left"
]
],
"bugText": "            i += 1"
},
{
"id": "s8",
"habit": "A",
"kind": "fix",
"fn": "unique_in_window",
"task": "Each item in `ids` is a request id, in order. For each id, look back at the `k` ids just before it, or fewer at the start of the list. Return a list with True when the id matches none of those, and False when it matches one of them. For example, `unique_in_window(['a', 'b', 'a', 'a'], 1)` gives `[True, True, True, False]`. Here each id looks back at 1 id. First 'a': nothing before it, so True. 'b': the id before is 'a', so True. Second 'a': the id before is 'b', so True. Third 'a': the id before is 'a', a match, so False.",
"code": "def unique_in_window(ids, k):\n    recent = Counter()\n    out = []\n    for right in range(len(ids)):\n        if right > k:\n            old = ids[right - k - 1]\n        new = ids[right]\n        out.append(recent[new] == 0)\n        recent[new] += 1\n    return out",
"bug": [
6,
6
],
"fix": "            old = ids[right - k - 1]\n            recent[old] -= 1",
"tests": [
[
"unique_in_window(['a', 'b', 'a', 'a'], 1)",
[
true,
true,
true,
false
]
],
[
"unique_in_window(['x', 'x'], 5)",
[
true,
false
]
],
[
"unique_in_window(['a', 'b', 'c', 'a'], 2)",
[
true,
true,
true,
true
]
]
],
"why": "The request `old` left the window, but its count stayed the same, so the code still treated it as recent. Add `recent[old] -= 1`, so the tracker forgets every request that slides out.",
"domain": "Backend",
"jobs": [
[
5,
"forget the id that left"
],
[
7,
"is the new id unseen?"
],
[
9,
"remember the new id"
]
],
"bugText": "            old = ids[right - k - 1]"
},
{
"id": "s9",
"habit": "B",
"kind": "fix",
"fn": "newer_version",
"task": "`a` and `b` are version strings made of whole numbers joined by dots, such as \"1.10.2\". Compare the first parts, and if they tie, compare the next parts, and so on. Each part is a whole number, so 10 is bigger than 9. Return True if `a` is newer than `b`, and False if it is older or the same. For example, `newer_version('1.10', '1.9')` gives `True`. The first parts are 1 and 1, which tie. The second parts are 10 and 9, and 10 is bigger.",
"code": "def newer_version(a, b):\n    a_parts = a.split(\".\")\n    b_parts = b.split(\".\")\n    return a_parts > b_parts",
"bug": [
4,
4
],
"fix": "    a_nums = list(map(int, a_parts))\n    b_nums = list(map(int, b_parts))\n    return a_nums > b_nums",
"tests": [
[
"newer_version('1.10', '1.9')",
true
],
[
"newer_version('2.0', '10.0')",
false
],
[
"newer_version('1.2.3', '1.2.3')",
false
]
],
"why": "The parts are strings, and strings compare letter by letter, so \"10\" comes before \"9\". Turn each part into a number with `int` before comparing.",
"domain": "Backend",
"bugText": "    return a_parts > b_parts"
},
{
"id": "d1",
"habit": "E",
"kind": "fix",
"fn": "best_week",
"task": "Each number in `sales` is one day's sales, in day order. A week is any 7 days that sit next to each other in the list. Return the highest total of any week. For example, `best_week([1, 1, 1, 1, 1, 1, 1, 9])` gives `15`. Days 0 to 6 add up to 7. Days 1 to 7 add up to six 1s plus 9, which is 15.",
"code": "def best_week(sales):\n    total = 0\n    best = 0\n    for right in range(len(sales)):\n        total += sales[right]\n        if right >= 7:\n            total -= sales[right]\n        if right >= 6:\n            best = max(best, total)\n    return best",
"bug": [
7,
7
],
"fix": "            total -= sales[right - 7]",
"tests": [
[
"best_week([1, 1, 1, 1, 1, 1, 1, 9])",
15
],
[
"best_week([2] * 7)",
14
],
[
"best_week([5, 0, 0, 0, 0, 0, 0, 0, 1])",
5
]
],
"why": "The day leaving the week is `sales[right - 7]`. The line subtracted `sales[right]`, the day that just arrived, so the new day was added and then removed.",
"domain": "Data analytics",
"jobs": [
[
5,
"add the new day"
],
[
6,
"drop the day that left"
],
[
8,
"record each full week"
]
],
"bugText": "            total -= sales[right]"
},
{
"id": "d2",
"habit": "E",
"kind": "fix",
"fn": "longest_goal_streak",
"task": "Each number in `steps` is one day's step count, in day order. A day reaches the goal if its count is `goal` or more. Return the most days in a row that all reach the goal, with no missed day between them. For example, `longest_goal_streak([9, 9, 1, 9], 5)` gives `2`. Day 0: 9 reaches 5, so the streak is 1. Day 1: the streak is 2. Day 2: 1 misses, so the streak drops to 0. Day 3: the streak is 1. The longest streak was 2.",
"code": "def longest_goal_streak(\n    steps, goal\n):\n    current = 0\n    best = 0\n    for s in steps:\n        if s >= goal:\n            current += 1\n            best = max(best, current)\n        else:\n            best = 0\n    return best",
"bug": [
11,
11
],
"fix": "            current = 0",
"tests": [
[
"longest_goal_streak([9, 9, 1, 9], 5)",
2
],
[
"longest_goal_streak([1, 1], 5)",
0
],
[
"longest_goal_streak([5, 5, 5, 0, 5], 5)",
3
]
],
"why": "A missed day ends the current run, so only `current` resets to 0. Resetting `best` erased the record. Two names that sound alike can hold very different things.",
"domain": "Data analytics",
"jobs": [
[
7,
"a goal day grows the run"
],
[
10,
"a missed day ends the run"
]
],
"bugText": "            best = 0"
},
{
"id": "d3",
"habit": "E",
"kind": "fix",
"fn": "percent_change",
"task": "Each item in `pairs` is a pair `(old, new)` of two numbers. For each pair, return the percent change from `old` to `new`, which says by what percent of `old` the value rose or fell. A fall gives a negative number. For example, `percent_change([(100, 150), (50, 25)])` gives `[50.0, -50.0]`. From 100 to 150, the value rises by 50, which is half of 100, so 50 percent. From 50 to 25, it falls by 25, which is half of 50, so -50 percent.",
"code": "def percent_change(pairs):\n    out = []\n    for old, new in pairs:\n        diff = new - old\n        percent = diff / new * 100\n        out.append(percent)\n    return out",
"bug": [
5,
5
],
"fix": "        percent = diff / old * 100",
"tests": [
[
"percent_change([(100, 150)])",
[
50.0
]
],
[
"percent_change([(50, 25), (10, 10)])",
[
-50.0,
0.0
]
],
[
"percent_change([(4, 5)])",
[
25.0
]
]
],
"why": "Percent change compares against the starting value, so divide by `old`. Dividing by `new` gives a different number.",
"domain": "Data analytics",
"bugText": "        percent = diff / new * 100"
},
{
"id": "d4",
"habit": "B",
"kind": "fix",
"fn": "top_customer",
"task": "`spend` is a dictionary that maps each customer's name to the amount that customer spent. Return the name of the customer who spent the most, as a string. For example, `top_customer({'ann': 30, 'bo': 80})` gives `'bo'`, because bo spent 80 and ann spent only 30.",
"code": "def top_customer(spend):\n    best_name = None\n    best_amount = -1\n    for name in spend:\n        if spend[name] > best_amount:\n            best_amount = spend[name]\n            best_name = spend[name]\n    return best_name",
"bug": [
7,
7
],
"fix": "            best_name = name",
"tests": [
[
"top_customer({'ann': 30, 'bo': 80})",
"bo"
],
[
"top_customer({'x': 1})",
"x"
],
[
"top_customer({'a': 5, 'b': 2, 'c': 9})",
"c"
]
],
"why": "The task asks for the name, which is the dictionary key. The value `spend[name]` is the amount spent. Save `name` instead.",
"domain": "Data analytics",
"bugText": "            best_name = spend[name]"
},
{
"id": "d5",
"habit": "A",
"kind": "fix",
"fn": "running_max_drop",
"task": "`values` is a list of numbers in time order, such as daily prices. A drop is an earlier value minus a later, lower value. Return the biggest drop, or 0 if the values never go down. For example, `running_max_drop([3, 8, 2, 5])` gives `6`. The highest value before 2 is 8, and 8 - 2 = 6. No other pair drops more.",
"code": "def running_max_drop(values):\n    peak = values[0]\n    worst = 0\n    for v in values:\n        worst = max(worst, peak - v)\n    return worst",
"bug": [
5,
5
],
"fix": "        peak = max(peak, v)\n        worst = max(worst, peak - v)",
"tests": [
[
"running_max_drop([3, 8, 2, 5])",
6
],
[
"running_max_drop([1, 2, 3])",
0
],
[
"running_max_drop([5, 1, 9, 4])",
5
]
],
"why": "The variable `peak` never learned about new highs, so every drop was measured from the first value. Update `peak` with `max(peak, v)` before measuring the drop.",
"domain": "Finance",
"bugText": "        worst = max(worst, peak - v)"
},
{
"id": "f1",
"habit": "G",
"kind": "fix",
"fn": "first_overdraft",
"task": "The bank balance starts at `start`. Each number in `changes` is one day's change to the balance, in day order, and days count from 0. Return the first day that ends with the balance below zero, or -1 if that never happens. For example, `first_overdraft(10, [-10, -1])` gives `1`. Day 0: 10 - 10 = 0, which is not below zero. Day 1: 0 - 1 = -1, which is below zero, so the answer is 1.",
"code": "def first_overdraft(\n    start, changes\n):\n    balance = start\n    for day in range(len(changes)):\n        balance += changes[day]\n        if balance <= 0:\n            return day\n    return -1",
"bug": [
7,
7
],
"fix": "        if balance < 0:",
"tests": [
[
"first_overdraft(10, [-10, -1])",
1
],
[
"first_overdraft(5, [1, -6])",
-1
],
[
"first_overdraft(0, [-1])",
0
]
],
"why": "\"Below zero\" means less than zero. A balance of exactly 0 is not an overdraft, so the check is `< 0`.",
"domain": "Finance",
"bugText": "        if balance <= 0:"
},
{
"id": "f2",
"habit": "N",
"kind": "fix",
"fn": "max_profit_day",
"task": "Each number in `prices` is the price of one share on one day, in day order. You buy one share on one day and sell it on a later day. Return the biggest profit, which is the sell price minus the buy price, or 0 if no sale makes money. For example, `max_profit_day([7, 1, 5, 3, 6, 4])` gives `5`. The cheapest price is 1, on the second day. The highest price after that day is 6, so buying at 1 and selling at 6 makes 6 - 1 = 5.",
"code": "def max_profit_day(prices):\n    cheapest = prices[0]\n    best = 0\n    for p in prices:\n        best = max(best, p - cheapest)\n        cheapest = max(cheapest, p)\n    return best",
"bug": [
6,
6
],
"fix": "        cheapest = min(cheapest, p)",
"tests": [
[
"max_profit_day([7, 1, 5, 3, 6, 4])",
5
],
[
"max_profit_day([3, 2, 1])",
0
],
[
"max_profit_day([2, 9])",
7
]
],
"why": "The variable `cheapest` must keep the lowest price, so use `min`. With `max`, it kept the highest price instead.",
"domain": "Finance",
"bugText": "        cheapest = max(cheapest, p)"
},
{
"id": "r1",
"habit": "G",
"kind": "fix",
"fn": "spikes",
"task": "Each number in `readings` is one sensor reading, in time order. A spike is a reading that is more than `limit` higher than the reading just before it. Return how many spikes there are. For example, `spikes([1, 9, 9, 20], 5)` gives `2`. From 1 to 9, the reading rises by 8, more than 5, so 9 is a spike. From 9 to 9, it rises by 0. From 9 to 20, it rises by 11, so 20 is a spike.",
"code": "def spikes(readings, limit):\n    count = 0\n    stop = len(readings)\n    for i in range(stop):\n        before = readings[i]\n        after = readings[i + 1]\n        if after - before > limit:\n            count += 1\n    return count",
"bug": [
3,
3
],
"fix": "    stop = len(readings) - 1",
"tests": [
[
"spikes([1, 9, 9, 20], 5)",
2
],
[
"spikes([4], 1)",
0
],
[
"spikes([1, 2, 3], 0)",
2
]
],
"why": "The loop reads `readings[i + 1]`, so `i` must stop one step early. On the last index, `i + 1` does not exist. Set `stop = len(readings) - 1`, so the loop ends one step early.",
"domain": "Sensors",
"bugText": "    stop = len(readings)"
},
{
"id": "r2",
"habit": "A",
"kind": "fix",
"fn": "max_window_temp",
"task": "Each number in `temps` is one temperature reading, in time order, and `k` is a window size. A window is `k` readings that sit next to each other. Return the highest average of any window, where the average is the window's sum divided by `k`. For example, `max_window_temp([1, 2, 3, 4], 2)` gives `3.5`. Window [1, 2] averages 1.5. Window [2, 3] averages 2.5. Window [3, 4] averages 3.5, the highest.",
"code": "def max_window_temp(temps, k):\n    total = sum(temps[:k])\n    best = total\n    end = len(temps)\n    for right in range(k, end):\n        total += temps[right]\n        best = max(best, total)\n    return best / k",
"bug": [
6,
6
],
"fix": "        total += temps[right]\n        total -= temps[right - k]",
"tests": [
[
"max_window_temp([1, 2, 3, 4], 2)",
3.5
],
[
"max_window_temp([5, 5], 2)",
5.0
],
[
"max_window_temp([9, 0, 0], 1)",
9.0
]
],
"why": "The window gained a reading on each step but never lost one, so it kept growing. Add `total -= temps[right - k]` to drop the oldest reading in the same step.",
"domain": "Sensors",
"bugText": "        total += temps[right]"
},
{
"id": "r3",
"habit": "J",
"kind": "fix",
"fn": "last_n",
"task": "Each number in `readings` is one reading, in time order, oldest first. `n` is a whole number of 1 or more. Return the newest `n` readings, still oldest first. For example, `last_n([1, 2, 3, 4], 2)` gives `[3, 4]`, because 3 and 4 are the two newest readings.",
"code": "def last_n(readings, n):\n    return readings[:n]",
"bug": [
2,
2
],
"fix": "    return readings[-n:]",
"tests": [
[
"last_n([1, 2, 3, 4], 2)",
[
3,
4
]
],
[
"last_n([7, 8], 2)",
[
7,
8
]
],
[
"last_n([5, 6, 7], 1)",
[
7
]
]
],
"why": "The slice `readings[:n]` takes items from the front. The last items come from the back: `readings[-n:]`.",
"domain": "Sensors",
"bugText": "    return readings[:n]"
},
{
"id": "q1",
"habit": "N",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends. `recent.pop(0)` removes the first item of `recent`.",
"code": "times = [1, 2, 3, 12]\nwindow = 10\nrecent = []\nfor t in times:\n    cutoff = t - window\n    while recent:\n        if recent[0] > cutoff:\n            break\n        recent.pop(0)\n    recent.append(t)",
"ask": [
"len(recent)",
"recent[0]"
],
"why": "At time 12, the times 1 and 2 are 10 or more seconds old, so both leave. That leaves 3 and 12, so the length is 2 and the first time is 3.",
"domain": "Backend",
"answers": [
"2",
"3"
]
},
{
"id": "q2",
"habit": "J",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs.",
"code": "box = (2, 1, 6, 4)\nx1, y1, x2, y2 = box\nwidth = x2 - x1\nheight = y2 - y1\narea = width * height",
"ask": [
"width",
"height",
"area"
],
"why": "Width is right minus left: 6 - 2 = 4. Height is bottom minus top: 4 - 1 = 3. So the area is 4 times 3, which is 12.",
"domain": "Computer vision",
"answers": [
"4",
"3",
"12"
]
},
{
"id": "q3",
"habit": "G",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs.",
"code": "items = ['a', 'b', 'c', 'd', 'e']\npage = 1\nsize = 2\nstart = page * size\nend = start + size\nshown = items[start:end]",
"ask": [
"start",
"end",
"shown"
],
"why": "Page 1 is the second page, so it starts at item 2. A slice stops before `end`, so it shows c and d.",
"domain": "Backend",
"answers": [
"2",
"4",
"['c', 'd']"
]
},
{
"id": "q4",
"habit": "A",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "frames = [4, 8, 6, 2]\nk = 2\ntotal = 0\naverages = []\nfor right in range(len(frames)):\n    total += frames[right]\n    if right >= k:\n        total -= frames[right - k]\n    if right >= k - 1:\n        averages.append(total / k)",
"ask": [
"total",
"averages"
],
"why": "Each step adds the new frame and drops the one k steps back. The last window holds 6 and 2, so `total` ends at 8.",
"domain": "Computer vision",
"answers": [
"8",
"[6.0, 7.0, 4.0]"
]
},
{
"id": "q5",
"habit": "N",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "delay = 3\nwaits = []\nfor _ in range(3):\n    waits.append(delay)\n    delay = delay * 2",
"ask": [
"waits",
"delay"
],
"why": "Each wait is used first and doubled after, so the waits are 3, 6 and 12, and `delay` ends at 24.",
"domain": "Backend",
"answers": [
"[3, 6, 12]",
"24"
]
},
{
"id": "q6",
"habit": "E",
"kind": "predict",
"task": "Run this loop in your head, one pass at a time. Then, in each box under the code, type the value of the name or expression next to it after the loop ends.",
"code": "steps = [9, 9, 1, 9]\ngoal = 5\ncurrent = 0\nbest = 0\nfor s in steps:\n    if s >= goal:\n        current += 1\n        best = max(best, current)\n    else:\n        current = 0",
"ask": [
"current",
"best"
],
"why": "The day with 1 step resets `current`, but `best` keeps the record of 2. The last day starts a new run, so `current` ends at 1.",
"domain": "Data analytics",
"answers": [
"1",
"2"
]
},
{
"id": "h1",
"habit": "O",
"kind": "fix",
"fn": "last_stone",
"task": "Each number in `stones` is the weight of one stone. Each turn, take the two heaviest stones and smash them together. If they weigh the same, both break. If not, the lighter one breaks, and the heavier one goes back, lighter by the other stone's weight. Stop when one stone or none is left. Return the weight of the last stone, or 0 if none is left. For example, `last_stone([2, 7, 4, 1, 8, 1])` gives `1`. Smash 8 and 7: a 1 goes back, so the stones are [2, 4, 1, 1, 1]. Smash 4 and 2: a 2 goes back, so [2, 1, 1, 1]. Smash 2 and 1: a 1 goes back, so [1, 1, 1]. Smash 1 and 1: both break, so [1]. One stone is left, and it weighs 1.",
"code": "def last_stone(stones):\n    heap = [-s for s in stones]\n    heapq.heapify(heap)\n    for _ in range(len(stones)):\n        if len(heap) < 2:\n            break\n        first = -heapq.heappop(heap)\n        second = -heap[0]\n        if first != second:\n            rest = first - second\n            heapq.heappush(heap, -rest)\n    return -heap[0] if heap else 0",
"bug": [
8,
8
],
"fix": "        second = -heapq.heappop(heap)",
"tests": [
[
"last_stone([2, 7, 4, 1, 8, 1])",
1
],
[
"last_stone([2, 2])",
0
],
[
"last_stone([3, 7, 2])",
2
]
],
"why": "A smash uses two stones, so both must leave the heap. The peek at `heap[0]` left the second stone in place. Pop twice with `heappop`, then push back only the difference. You made this slip in Last Stone Weight on 20 November.",
"domain": "Heaps",
"jobs": [
[
5,
"stop with under 2 stones"
],
[
7,
"take the two heaviest"
],
[
9,
"push back the difference"
]
],
"bugText": "        second = -heap[0]"
},
{
"id": "h2",
"habit": "P",
"kind": "fix",
"fn": "kth_largest",
"task": "`nums` is a list of numbers, and `k` is a whole number from 1 to the length of `nums`. Return the number that would sit in place `k`, counting from 1, if you sorted `nums` from largest to smallest. Equal numbers each take their own place. For example, `kth_largest([3, 2, 1, 5, 6, 4], 2)` gives `5`. From largest to smallest, the numbers are 6, 5, 4, 3, 2, 1, and the 2nd one is 5.",
"code": "def kth_largest(nums, k):\n    heap = []\n    for n in nums:\n        heapq.heappush(heap, n)\n        if len(heap) > 3:\n            heapq.heappop(heap)\n    return heap[0]",
"bug": [
5,
5
],
"fix": "        if len(heap) > k:",
"tests": [
[
"kth_largest([3, 2, 1, 5, 6, 4], 2)",
5
],
[
"kth_largest([1], 1)",
1
],
[
"kth_largest([7, 7, 8], 3)",
7
]
],
"why": "The 3 came from the example, but `k` changes with every call. Compare with `k`, not a fixed number. For every number in your code, ask where it came from. You made this slip in Kth Largest on 20 November.",
"domain": "Heaps",
"bugText": "        if len(heap) > 3:"
},
{
"id": "q7",
"habit": "O",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then, in each box under the code, type the value of the name or expression next to it after the last line runs. `heapq.heapify` arranges the list so the smallest number sits at `heap[0]`. `heapq.heappop` removes that smallest number and returns it.",
"code": "import heapq\nheap = [-8, -7, -4, -2]\nheapq.heapify(heap)\nfirst = -heapq.heappop(heap)\nsecond = -heap[0]\nsize = len(heap)",
"ask": [
"first",
"second",
"size"
],
"why": "A peek at `heap[0]` reads the top stone and leaves it in the heap. Only `heappop` removes a stone, so one pop and one peek leave 3 of the 4 stones.",
"domain": "Heaps",
"answers": [
"8",
"7",
"3"
]
},
{
"id": "t1",
"habit": "B",
"kind": "trace",
"fn": "window_max",
"src": "j4",
"call": "window_max([3, 1, 2], 2)",
"loop": "right",
"watch": [
"queue",
"out"
],
"changes": [
[
10,
"queue"
],
[
11,
"queue"
],
[
13,
"queue"
],
[
15,
"out"
]
],
"code": "def window_max(nums, k):\n    queue = deque()\n    out = []\n    for right in range(len(nums)):\n        new = nums[right]\n        while queue:\n            back = nums[queue[-1]]\n            if back >= new:\n                break\n            queue.pop()\n        queue.append(right)\n        if queue[0] <= right - k:\n            queue.popleft()\n        if right >= k - 1:\n            out.append(nums[queue[0]])\n    return out",
"task": "`window_max(nums, k)` slides a window of `k` numbers that sit next to each other along `nums`, and returns the biggest number in each window. For example, `window_max([5, 1, 3], 2)` gives `[5, 3]`, because window [5, 1] has 5 as its biggest and window [1, 3] has 3. Dry-run `window_max([3, 1, 2], 2)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "`queue` holds positions, not numbers. At `right = 2`, the 2 pushes out position 1 from the back, and position 0 drops off the front because it left the window, so `queue` ends as `[2]`.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"11": [
"[0]"
]
}
},
{
"loop": "1",
"lines": {
"11": [
"[0, 1]"
],
"15": [
"[3]"
]
}
},
{
"loop": "2",
"lines": {
"10": [
"[0]"
],
"11": [
"[0, 2]"
],
"13": [
"[2]"
],
"15": [
"[3, 2]"
]
}
}
]
},
{
"id": "t2",
"habit": "C",
"kind": "trace",
"fn": "longest_unique",
"src": "e5",
"call": "longest_unique('abcb')",
"loop": "right",
"watch": [
"left",
"seen",
"best"
],
"changes": [
[
7,
"seen"
],
[
8,
"left"
],
[
9,
"seen"
],
[
11,
"best"
]
],
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[right])\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"task": "`longest_unique(s)` returns the length of the longest stretch of letters that sit next to each other in `s` with no letter twice. For example, `longest_unique('aab')` gives `2`, because \"ab\" has no repeat and \"aab\" repeats a. Dry-run `longest_unique('abcb')` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At the second \"b\", the loop removes \"a\" and then the first \"b\", so `left` jumps from 0 to 2. One removal is not enough, which is why the code uses `while`.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"9": [
"{'a'}"
],
"11": [
"1"
]
}
},
{
"loop": "1",
"lines": {
"9": [
"{'a', 'b'}"
],
"11": [
"2"
]
}
},
{
"loop": "2",
"lines": {
"9": [
"{'a', 'b', 'c'}"
],
"11": [
"3"
]
}
},
{
"loop": "3",
"lines": {
"7": [
"{'b', 'c'}",
"{'c'}"
],
"8": [
"1",
"2"
],
"9": [
"{'b', 'c'}"
],
"11": [
"3"
]
}
}
]
},
{
"id": "t3",
"habit": "A",
"kind": "trace",
"fn": "longest_replace",
"src": "a2",
"call": "longest_replace('ABAB', 1)",
"loop": "right",
"watch": [
"left",
"count",
"best"
],
"changes": [
[
6,
"count"
],
[
10,
"count"
],
[
11,
"left"
],
[
14,
"best"
]
],
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        size = right - left + 1\n        most = max(count.values())\n        while size - most > k:\n            count[s[left]] -= 1\n            left += 1\n            size = right - left + 1\n            most = max(count.values())\n        best = max(best, size)\n    return best",
"task": "`longest_replace(s, k)` returns the length of the longest stretch of letters that sit next to each other in `s` and can become one letter repeated with `k` changes or fewer. For example, `longest_replace('AAB', 1)` gives `3`, because changing the B to A makes \"AAA\". Dry-run `longest_replace('ABAB', 1)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 3`, \"ABAB\" needs 2 changes, so the first \"A\" leaves: its count drops to 1 before `left` moves to 1. `best` stays 3.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"6": [
"{'A': 1}"
],
"14": [
"1"
]
}
},
{
"loop": "1",
"lines": {
"6": [
"{'A': 1, 'B': 1}"
],
"14": [
"2"
]
}
},
{
"loop": "2",
"lines": {
"6": [
"{'A': 2, 'B': 1}"
],
"14": [
"3"
]
}
},
{
"loop": "3",
"lines": {
"6": [
"{'A': 2, 'B': 2}"
],
"10": [
"{'A': 1, 'B': 2}"
],
"11": [
"1"
],
"14": [
"3"
]
}
}
]
},
{
"id": "t4",
"habit": "A",
"kind": "trace",
"fn": "has_anagram",
"src": "e3",
"call": "has_anagram('ab', 'aab')",
"loop": "right",
"watch": [
"left",
"window"
],
"changes": [
[
6,
"window"
],
[
8,
"window"
],
[
9,
"left"
]
],
"code": "def has_anagram(s1, s2):\n    need = Counter(s1)\n    window = Counter()\n    left = 0\n    for right in range(len(s2)):\n        window[s2[right]] += 1\n        if right - left + 1 > len(s1):\n            window[s2[left]] -= 1\n            left += 1\n        if window == need:\n            return True\n    return False",
"task": "`has_anagram(s1, s2)` returns True when `s2` holds a stretch of letters that sit next to each other and use exactly the letters of `s1`, in any order. For example, `has_anagram('ab', 'cba')` gives `True`, because \"ba\" holds one b and one a. Dry-run `has_anagram('ab', 'aab')` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, the window \"aab\" is one letter too long, so the first \"a\" leaves and `left` moves to 1. Only then does `window` match `need`, and the function returns True inside that pass.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"6": [
"{'a': 1}"
]
}
},
{
"loop": "1",
"lines": {
"6": [
"{'a': 2}"
]
}
},
{
"loop": "2",
"lines": {
"6": [
"{'a': 2, 'b': 1}"
],
"8": [
"{'a': 1, 'b': 1}"
],
"9": [
"1"
]
}
}
]
},
{
"id": "t5",
"habit": "N",
"kind": "trace",
"fn": "shortest_len",
"src": "j3",
"call": "shortest_len([1, 1, 4], 4)",
"loop": "right",
"watch": [
"total",
"left",
"best"
],
"changes": [
[
6,
"total"
],
[
9,
"best"
],
[
10,
"total"
],
[
11,
"left"
]
],
"code": "def shortest_len(nums, target):\n    total = 0\n    left = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            size = right - left + 1\n            best = min(best, size)\n            total -= nums[left]\n            left += 1\n    if best == float('inf'):\n        return 0\n    return best",
"task": "`shortest_len(nums, target)` returns the length of the shortest stretch of numbers that sit next to each other in `nums` whose sum is `target` or more, or 0 if none reaches it. For example, `shortest_len([2, 5], 5)` gives `1`, because the single number 5 reaches 5. Dry-run `shortest_len([1, 1, 4], 4)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, the sum reaches 6, and the inner loop shrinks three times: sizes 3, 2 and 1 all reach 4. `best` saves each size before the shrink, so it ends at 1.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"6": [
"1"
]
}
},
{
"loop": "1",
"lines": {
"6": [
"2"
]
}
},
{
"loop": "2",
"lines": {
"6": [
"6"
],
"9": [
"3",
"2",
"1"
],
"10": [
"5",
"4",
"0"
],
"11": [
"1",
"2",
"3"
]
}
}
]
},
{
"id": "t6",
"habit": "G",
"kind": "trace",
"fn": "window_sums",
"src": "g3",
"call": "window_sums([4, 1, 2], 2)",
"loop": "right",
"watch": [
"total",
"sums"
],
"changes": [
[
5,
"total"
],
[
7,
"total"
],
[
9,
"sums"
]
],
"code": "def window_sums(nums, k):\n    total = 0\n    sums = []\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1:\n            sums.append(total)\n    return sums",
"task": "`window_sums(nums, k)` returns the sum of each window of `k` numbers that sit next to each other in `nums`, from left to right. For example, `window_sums([1, 2, 3], 2)` gives `[3, 5]`, because 1 + 2 = 3 and 2 + 3 = 5. Dry-run `window_sums([4, 1, 2], 2)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "The first number leaves at `right = 2`, when `right` reaches `k`. The 4 leaves, so `total` drops from 7 to 3.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"5": [
"4"
]
}
},
{
"loop": "1",
"lines": {
"5": [
"5"
],
"9": [
"[5]"
]
}
},
{
"loop": "2",
"lines": {
"5": [
"7"
],
"7": [
"3"
],
"9": [
"[5, 3]"
]
}
}
]
},
{
"id": "t7",
"habit": "E",
"kind": "trace",
"fn": "distinct_counts",
"src": "e2",
"call": "distinct_counts('abb', 2)",
"loop": "right",
"watch": [
"window",
"out"
],
"changes": [
[
6,
"window"
],
[
9,
"window"
],
[
11,
"window"
],
[
13,
"out"
]
],
"code": "def distinct_counts(s, k):\n    window = Counter()\n    out = []\n    for right in range(len(s)):\n        letter = s[right]\n        window[letter] += 1\n        if right >= k:\n            gone = s[right - k]\n            window[gone] -= 1\n            if window[gone] == 0:\n                del window[gone]\n        if right >= k - 1:\n            out.append(len(window))\n    return out",
"task": "`distinct_counts(s, k)` returns how many different letters each window of `k` letters that sit next to each other in `s` holds, from left to right. For example, `distinct_counts('aab', 2)` gives `[1, 2]`, because \"aa\" holds only a and \"ab\" holds a and b. Dry-run `distinct_counts('abb', 2)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, \"a\" leaves and its count reaches 0, so the code deletes it. `len(window)` then counts only \"b\", which gives 1.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"6": [
"{'a': 1}"
]
}
},
{
"loop": "1",
"lines": {
"6": [
"{'a': 1, 'b': 1}"
],
"13": [
"[2]"
]
}
},
{
"loop": "2",
"lines": {
"6": [
"{'a': 1, 'b': 2}"
],
"9": [
"{'a': 0, 'b': 2}"
],
"11": [
"{'b': 2}"
],
"13": [
"[2, 1]"
]
}
}
]
},
{
"id": "t8",
"habit": "A",
"kind": "trace",
"fn": "max_profit",
"src": "a3",
"call": "max_profit([3, 8, 1, 4])",
"loop": "price",
"watch": [
"lowest",
"best"
],
"changes": [
[
5,
"lowest"
],
[
7,
"best"
]
],
"code": "def max_profit(prices):\n    lowest = prices[0]\n    best = 0\n    for price in prices:\n        lowest = min(lowest, price)\n        profit = price - lowest\n        best = max(best, profit)\n    return best",
"task": "`max_profit(prices)` returns the biggest profit from buying on one day and selling on a later day, or 0 if no sale makes money. Each number in `prices` is one day's price. For example, `max_profit([2, 5])` gives `3`, because buying at 2 and selling at 5 makes 3. Dry-run `max_profit([3, 8, 1, 4])` by hand. Each chip in the `# price =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At the price 1, `lowest` drops to 1, but `best` keeps the 5 from buying at 3 and selling at 8. The later profit 4 - 1 = 3 does not beat it.",
"domain": "Algorithms",
"passes": [
{
"loop": "3",
"lines": {
"5": [
"3"
],
"7": [
"0"
]
}
},
{
"loop": "8",
"lines": {
"5": [
"3"
],
"7": [
"5"
]
}
},
{
"loop": "1",
"lines": {
"5": [
"1"
],
"7": [
"5"
]
}
},
{
"loop": "4",
"lines": {
"5": [
"1"
],
"7": [
"5"
]
}
}
]
},
{
"id": "t9",
"habit": "G",
"kind": "trace",
"fn": "longest_ones",
"src": "g1",
"call": "longest_ones([1, 0, 0, 1], 1)",
"loop": "right",
"watch": [
"zeros",
"left",
"best"
],
"changes": [
[
7,
"zeros"
],
[
10,
"zeros"
],
[
11,
"left"
],
[
13,
"best"
]
],
"code": "def longest_ones(nums, k):\n    zeros = 0\n    left = 0\n    best = 0\n    for right in range(len(nums)):\n        if nums[right] == 0:\n            zeros += 1\n        while zeros > k:\n            if nums[left] == 0:\n                zeros -= 1\n            left += 1\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"task": "Each number in `nums` is 0 or 1. `longest_ones(nums, k)` returns the length of the longest stretch of numbers that sit next to each other and hold `k` zeros or fewer. For example, `longest_ones([0, 1, 0], 1)` gives `2`, because [0, 1] and [1, 0] each hold one zero. Dry-run `longest_ones([1, 0, 0, 1], 1)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At the second zero, `zeros` becomes 2, so the loop drops the 1 and then the first 0. `left` moves twice, to 2, and `zeros` is back to 1.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"13": [
"1"
]
}
},
{
"loop": "1",
"lines": {
"7": [
"1"
],
"13": [
"2"
]
}
},
{
"loop": "2",
"lines": {
"7": [
"2"
],
"11": [
"1",
"2"
],
"10": [
"1"
],
"13": [
"2"
]
}
},
{
"loop": "3",
"lines": {
"13": [
"2"
]
}
}
]
},
{
"id": "t10",
"habit": "A",
"kind": "trace",
"fn": "rolling_brightness",
"src": "v4",
"call": "rolling_brightness([2, 4, 6], 2)",
"loop": "right",
"watch": [
"total",
"out"
],
"changes": [
[
5,
"total"
],
[
8,
"total"
],
[
10,
"out"
]
],
"code": "def rolling_brightness(frames, k):\n    total = 0\n    out = []\n    for right in range(len(frames)):\n        total += frames[right]\n        if right >= k:\n            leaving = frames[right - k]\n            total -= leaving\n        if right >= k - 1:\n            out.append(total / k)\n    return out",
"task": "`rolling_brightness(frames, k)` returns the average of each window of `k` frames that sit next to each other, from left to right. The average is the window's sum divided by `k`. For example, `rolling_brightness([2, 4], 2)` gives `[3.0]`. Dry-run `rolling_brightness([2, 4, 6], 2)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, the frame 2 leaves, so `total` goes from 12 to 10. Each average divides by `k`, so the values are floats like `3.0`.",
"domain": "Computer vision",
"passes": [
{
"loop": "0",
"lines": {
"5": [
"2"
]
}
},
{
"loop": "1",
"lines": {
"5": [
"6"
],
"10": [
"[3.0]"
]
}
},
{
"loop": "2",
"lines": {
"5": [
"12"
],
"8": [
"10"
],
"10": [
"[3.0, 5.0]"
]
}
}
]
},
{
"id": "t11",
"habit": "N",
"kind": "trace",
"fn": "allow",
"src": "s1",
"call": "allow([1, 2, 3, 12], 2, 10)",
"loop": "t",
"watch": [
"recent",
"out"
],
"changes": [
[
9,
"recent"
],
[
11,
"out"
],
[
13,
"recent"
]
],
"code": "def allow(times, limit, window):\n    recent = deque()\n    out = []\n    for t in times:\n        cutoff = t - window\n        while recent:\n            if recent[0] > cutoff:\n                break\n            recent.popleft()\n        ok = len(recent) < limit\n        out.append(ok)\n        if ok:\n            recent.append(t)\n    return out",
"task": "`allow(times, limit, window)` is a rate limiter. Each number in `times` is the second a request arrived. A request at second t is allowed if fewer than `limit` allowed requests arrived after second t - `window`, and blocked requests never count. It returns True or False for each request. For example, `allow([1, 1], 1, 5)` gives `[True, False]`. Dry-run `allow([1, 2, 3, 12], 2, 10)` by hand. Each chip in the `# t =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At time 3, two requests are still recent, so the request is refused and never joins `recent`. At time 12, the cutoff is 2, so both 1 and 2 leave before the check.",
"domain": "Backend",
"passes": [
{
"loop": "1",
"lines": {
"11": [
"[True]"
],
"13": [
"[1]"
]
}
},
{
"loop": "2",
"lines": {
"11": [
"[True, True]"
],
"13": [
"[1, 2]"
]
}
},
{
"loop": "3",
"lines": {
"11": [
"[True, True, False]"
]
}
},
{
"loop": "12",
"lines": {
"9": [
"[2]",
"[]"
],
"11": [
"[True, True, False, True]"
],
"13": [
"[12]"
]
}
}
]
},
{
"id": "t12",
"habit": "A",
"kind": "trace",
"fn": "unique_in_window",
"src": "s8",
"call": "unique_in_window('abaa', 1)",
"loop": "right",
"watch": [
"recent",
"out"
],
"changes": [
[
7,
"recent"
],
[
9,
"out"
],
[
10,
"recent"
]
],
"code": "def unique_in_window(ids, k):\n    recent = Counter()\n    out = []\n    for right in range(len(ids)):\n        if right > k:\n            old = ids[right - k - 1]\n            recent[old] -= 1\n        new = ids[right]\n        out.append(recent[new] == 0)\n        recent[new] += 1\n    return out",
"task": "`unique_in_window(ids, k)` returns, for each id, True if it matches none of the `k` ids just before it, and False if it matches one. Here `ids` is a string, so each letter is one id. For example, `unique_in_window('aa', 1)` gives `[True, False]`. Dry-run `unique_in_window('abaa', 1)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, the first \"a\" leaves, so its count drops to 0 and the new \"a\" counts as new. A count can sit at 0 in the Counter, like `'b': 0` at the end.",
"domain": "Backend",
"passes": [
{
"loop": "0",
"lines": {
"9": [
"[True]"
],
"10": [
"{'a': 1}"
]
}
},
{
"loop": "1",
"lines": {
"9": [
"[True, True]"
],
"10": [
"{'a': 1, 'b': 1}"
]
}
},
{
"loop": "2",
"lines": {
"7": [
"{'a': 0, 'b': 1}"
],
"9": [
"[True, True, True]"
],
"10": [
"{'a': 1, 'b': 1}"
]
}
},
{
"loop": "3",
"lines": {
"7": [
"{'a': 1, 'b': 0}"
],
"9": [
"[True, True, True, False]"
],
"10": [
"{'a': 2, 'b': 0}"
]
}
}
]
},
{
"id": "t13",
"habit": "A",
"kind": "trace",
"fn": "running_max_drop",
"src": "d5",
"call": "running_max_drop([3, 8, 2, 5])",
"loop": "v",
"watch": [
"peak",
"worst"
],
"changes": [
[
5,
"peak"
],
[
6,
"worst"
]
],
"code": "def running_max_drop(values):\n    peak = values[0]\n    worst = 0\n    for v in values:\n        peak = max(peak, v)\n        worst = max(worst, peak - v)\n    return worst",
"task": "`running_max_drop(values)` returns the biggest drop from an earlier value to a later, lower value, or 0 if the values never go down. For example, `running_max_drop([5, 1, 3])` gives `4`, because 5 - 1 = 4. Dry-run `running_max_drop([3, 8, 2, 5])` by hand. Each chip in the `# v =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "`peak` learns about the 8 before the drop is measured, so the 2 gives a drop of 8 - 2 = 6. The 5 gives only 3, so `worst` stays 6.",
"domain": "Finance",
"passes": [
{
"loop": "3",
"lines": {
"5": [
"3"
],
"6": [
"0"
]
}
},
{
"loop": "8",
"lines": {
"5": [
"8"
],
"6": [
"0"
]
}
},
{
"loop": "2",
"lines": {
"5": [
"8"
],
"6": [
"6"
]
}
},
{
"loop": "5",
"lines": {
"5": [
"8"
],
"6": [
"6"
]
}
}
]
},
{
"id": "t14",
"habit": "E",
"kind": "trace",
"fn": "longest_goal_streak",
"src": "d2",
"call": "longest_goal_streak([9, 9, 1], 5)",
"loop": "s",
"watch": [
"current",
"best"
],
"changes": [
[
8,
"current"
],
[
9,
"best"
],
[
11,
"current"
]
],
"code": "def longest_goal_streak(\n    steps, goal\n):\n    current = 0\n    best = 0\n    for s in steps:\n        if s >= goal:\n            current += 1\n            best = max(best, current)\n        else:\n            current = 0\n    return best",
"task": "`longest_goal_streak(steps, goal)` returns the most days in a row whose step count is `goal` or more. For example, `longest_goal_streak([6, 1, 6, 6], 5)` gives `2`, because the last two days both reach 5. Dry-run `longest_goal_streak([9, 9, 1], 5)` by hand. Each chip in the `# s =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "The day with 1 step resets `current` to 0. `best` keeps the record of 2.",
"domain": "Data analytics",
"passes": [
{
"loop": "9",
"lines": {
"8": [
"1"
],
"9": [
"1"
]
}
},
{
"loop": "9",
"lines": {
"8": [
"2"
],
"9": [
"2"
]
}
},
{
"loop": "1",
"lines": {
"11": [
"0"
]
}
}
]
},
{
"id": "t15",
"habit": "G",
"kind": "trace",
"fn": "count_small",
"src": "g2",
"call": "count_small([1, 2, 3, 1], 2, 4)",
"loop": "right",
"watch": [
"total",
"found"
],
"changes": [
[
5,
"total"
],
[
7,
"total"
],
[
10,
"found"
]
],
"code": "def count_small(nums, k, limit):\n    total = 0\n    found = 0\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1:\n            if total <= limit:\n                found += 1\n    return found",
"task": "`count_small(nums, k, limit)` counts the windows of `k` numbers that sit next to each other in `nums` whose sum is `limit` or less. For example, `count_small([3, 1, 5], 2, 4)` gives `1`, because 3 + 1 = 4 counts and 1 + 5 = 6 does not. Dry-run `count_small([1, 2, 3, 1], 2, 4)` by hand. Each chip in the `# right =` row under the loop line is one pass of the loop. Pick a pass, then type in each gold box the value of its name right after the line above the box runs.",
"why": "At `right = 2`, the window 2 + 3 = 5 is over the limit, so `found` stays 1. At `right = 3`, the window 3 + 1 = 4 equals the limit, and \"at most\" counts it.",
"domain": "Algorithms",
"passes": [
{
"loop": "0",
"lines": {
"5": [
"1"
]
}
},
{
"loop": "1",
"lines": {
"5": [
"3"
],
"10": [
"1"
]
}
},
{
"loop": "2",
"lines": {
"5": [
"6"
],
"7": [
"5"
]
}
},
{
"loop": "3",
"lines": {
"5": [
"6"
],
"7": [
"4"
],
"10": [
"2"
]
}
}
]
},
{
"id": "a4",
"habit": "A",
"kind": "fix",
"fn": "max_vowels",
"task": "`s` is a string of lowercase letters, and `k` is a window size. A window is `k` letters that sit next to each other in `s`. The vowels are a, e, i, o and u. Return the most vowels that any window holds. For example, `max_vowels('abciiidef', 3)` gives `3`. Windows \"abc\", \"bci\" and \"cii\" hold 1, 1 and 2 vowels. Window \"iii\" holds 3, and no window of 3 letters can hold more.",
"code": "def max_vowels(s, k):\n    inside = 0\n    best = 0\n    for right in range(len(s)):\n        if s[right] in 'aeiou':\n            inside += 1\n        if right >= k:\n            gone = s[right - k]\n        best = max(best, inside)\n    return best",
"bug": [
8,
8
],
"fix": "            gone = s[right - k]\n            if gone in 'aeiou':\n                inside -= 1",
"tests": [
[
"max_vowels('abciiidef', 3)",
3
],
[
"max_vowels('aeiou', 2)",
2
],
[
"max_vowels('leetcode', 3)",
2
]
],
"why": "The letter `gone` left the window, but `inside` still counted it when it was a vowel. Add `if gone in 'aeiou':` and `inside -= 1` right after finding `gone`. Every time the window loses a letter, the counter must lose it too.",
"domain": "Sliding window",
"jobs": [
[
5,
"count the new vowel"
],
[
7,
"drop the letter that left"
],
[
9,
"record the best count"
]
],
"bugText": "            gone = s[right - k]"
},
{
"id": "a5",
"habit": "A",
"kind": "fix",
"fn": "reverse_list",
"task": "The dictionary `links` stores a linked list. A linked list is a chain of nodes where each node points to the next one. Each key is a node, its value is the next node, and the last node maps to `None`. `head` is the first node. Reverse the chain in place, which means you change `links` so each node points to the node that came before it. Return the new first node. For example, `reverse_list({'a': 'b', 'b': 'c', 'c': None}, 'a')` gives `'c'`. The chain a, b, c becomes c, b, a, so `links` ends as {'a': None, 'b': 'a', 'c': 'b'}, and the new first node is 'c'.",
"code": "def reverse_list(links, head):\n    before = None\n    node = head\n    while node is not None:\n        after = links[node]\n        links[node] = before\n        node = after\n    return before",
"bug": [
6,
6
],
"fix": "        links[node] = before\n        before = node",
"tests": [
[
"reverse_list({'a': 'b', 'b': 'c', 'c': None}, 'a')",
"c"
],
[
"reverse_list({'x': None}, 'x')",
"x"
],
[
"reverse_list({'a': 'b', 'b': None}, 'a')",
"b"
]
],
"why": "The pointer `node` moved forward every pass, but `before` stayed at `None`. So every node pointed back to `None`, and the function returned `None`. Add `before = node` before `node` moves, so `before` always holds the node just behind.",
"domain": "Linked lists",
"bugText": "        links[node] = before"
},
{
"id": "a6",
"habit": "A",
"kind": "fix",
"fn": "merge_ranges",
"task": "Each item in `ranges` is a range `[start, end]`, and the ranges can come in any order. Two ranges overlap when they share at least one point, so [1, 4] and [4, 5] overlap. Join every group of overlapping ranges into one range, and return the joined ranges sorted by start. For example, `merge_ranges([[1, 3], [2, 6], [8, 10]])` gives `[[1, 6], [8, 10]]`. [1, 3] and [2, 6] share 2 to 3, so they join into [1, 6]. [8, 10] starts after 6, so it stays on its own.",
"code": "def merge_ranges(ranges):\n    ordered = sorted(ranges)\n    out = []\n    begin = ordered[0][0]\n    finish = ordered[0][1]\n    for start, end in ordered:\n        if start <= finish:\n            finish = max(finish, end)\n        else:\n            out.append([begin, finish])\n            finish = end\n    out.append([begin, finish])\n    return out",
"bug": [
11,
11
],
"fix": "            begin = start\n            finish = end",
"tests": [
[
"merge_ranges([[1, 3], [2, 6], [8, 10]])",
[
[
1,
6
],
[
8,
10
]
]
],
[
"merge_ranges([[1, 4], [4, 5]])",
[
[
1,
5
]
]
],
[
"merge_ranges([[5, 6], [1, 2]])",
[
[
1,
2
],
[
5,
6
]
]
]
],
"why": "When a gap starts a new range, `finish` moved to the new range, but `begin` stayed at the old start. So [8, 10] came out as [1, 10]. Set `begin = start` as well. A range is two numbers, so both must move together.",
"domain": "Intervals",
"jobs": [
[
4,
"start with the first range"
],
[
7,
"an overlap stretches it"
],
[
9,
"a gap starts a new range"
],
[
12,
"save the last range"
]
],
"bugText": "            finish = end"
},
{
"id": "a7",
"habit": "A",
"kind": "fix",
"fn": "pivot_index",
"task": "`nums` is a list of numbers, and positions count from 0. Return the first position `i` where the sum of the numbers before `i` equals the sum of the numbers after `i`, or -1 if no position works. The number at `i` belongs to neither side, and an empty side sums to 0. For example, `pivot_index([1, 7, 3, 6, 5, 6])` gives `3`. Position 3 holds 6. The numbers before it sum to 1 + 7 + 3 = 11, and the numbers after it sum to 5 + 6 = 11. Positions 0, 1 and 2 do not balance.",
"code": "def pivot_index(nums):\n    total = sum(nums)\n    left_sum = 0\n    for i in range(len(nums)):\n        rest = total - nums[i]\n        right_sum = rest - left_sum\n        if left_sum == right_sum:\n            return i\n    return -1",
"bug": [
8,
8
],
"fix": "            return i\n        left_sum += nums[i]",
"tests": [
[
"pivot_index([1, 7, 3, 6, 5, 6])",
3
],
[
"pivot_index([1, 2, 3])",
-1
],
[
"pivot_index([2, 1, -1])",
0
]
],
"why": "The loop moved to the next position, but `left_sum` stayed at 0. So every check compared 0 with the right side. Add `left_sum += nums[i]` at the end of each pass, so the number you just passed joins the left side.",
"domain": "Hashing",
"bugText": "            return i"
},
{
"id": "a8",
"habit": "A",
"kind": "fix",
"fn": "climb_ways",
"task": "You climb a staircase with `n` steps, and each move climbs 1 step or 2 steps. Return how many different orders of moves reach exactly step `n`. For example, `climb_ways(4)` gives `5`. The five orders are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2.",
"code": "def climb_ways(n):\n    before = 1\n    current = 1\n    for _ in range(n - 1):\n        new = before + current\n        current = new\n    return current",
"bug": [
6,
6
],
"fix": "        before = current\n        current = new",
"tests": [
[
"climb_ways(4)",
5
],
[
"climb_ways(2)",
2
],
[
"climb_ways(5)",
8
]
],
"why": "The ways for each step are the ways for the two steps below it added together. `current` moved up one step, but `before` stayed at 1, so each new count added 1 instead of the count one step lower. Add `before = current` before `current = new`, so the pair moves up together.",
"domain": "Dynamic programming",
"bugText": "        current = new"
},
{
"id": "b4",
"habit": "B",
"kind": "fix",
"fn": "two_sum",
"task": "`nums` is a list of numbers, and positions count from 0. Find two different positions whose numbers add up to `target`, and return the two positions as a list, smaller position first. Return `[]` if no pair works. For example, `two_sum([3, 2, 4], 6)` gives `[1, 2]`. Positions 1 and 2 hold 2 and 4, and 2 + 4 = 6. The 3 at position 0 would need a second 3, and the list has only one.",
"code": "def two_sum(nums, target):\n    where = {}\n    for i in range(len(nums)):\n        need = target - nums[i]\n        if need in where:\n            return [where[need], i]\n        where[nums[i]] = nums[i]\n    return []",
"bug": [
7,
7
],
"fix": "        where[nums[i]] = i",
"tests": [
[
"two_sum([2, 7, 11, 15], 9)",
[
0,
1
]
],
[
"two_sum([3, 2, 4], 6)",
[
1,
2
]
],
[
"two_sum([1, 2], 7)",
[]
]
],
"why": "The dict `where` saved `nums[i]`, the number, as its own answer. The function must return positions, so it must save `i`, the position: `where[nums[i]] = i`. Ask what each dict value must be: a position or a number?",
"domain": "Hashing",
"bugText": "        where[nums[i]] = nums[i]"
},
{
"id": "b5",
"habit": "B",
"kind": "fix",
"fn": "wait_days",
"task": "Each number in `temps` is one day's temperature, in day order. For each day, count how many days you wait until a day that is warmer. If no warmer day comes later, the answer for that day is 0. Return the list of waits. For example, `wait_days([5, 3, 4])` gives `[0, 1, 0]`. Day 0 is 5, and no later day is warmer, so 0. Day 1 is 3, and the next day is 4, which is warmer, so the wait is 1. Day 2 is the last day, so 0.",
"code": "def wait_days(temps):\n    answer = [0] * len(temps)\n    stack = []\n    for day in range(len(temps)):\n        while stack:\n            top = stack[-1]\n            if temps[top] >= temps[day]:\n                break\n            stack.pop()\n            answer[top] = day - top\n        stack.append(temps[day])\n    return answer",
"bug": [
11,
11
],
"fix": "        stack.append(day)",
"tests": [
[
"wait_days([30, 40, 50, 60])",
[
1,
1,
1,
0
]
],
[
"wait_days([5, 3, 4])",
[
0,
1,
0
]
],
[
"wait_days([9])",
[
0
]
]
],
"why": "The stack must hold days, because the line `answer[top] = day - top` treats `top` as a day. Pushing `temps[day]` put a temperature there, so `temps[top]` read a wrong spot or crashed. Push the position: `stack.append(day)`.",
"domain": "Stacks",
"jobs": [
[
5,
"settle colder days"
],
[
11,
"this day waits too"
]
],
"bugText": "        stack.append(temps[day])"
},
{
"id": "b6",
"habit": "B",
"kind": "fix",
"fn": "find_spot",
"task": "`nums` is a list of different numbers sorted from smallest to largest, and positions count from 0. If `target` is in `nums`, return its position. If not, return the position where `target` would go so the list stays sorted. For example, `find_spot([1, 3, 5, 6], 5)` gives `2`, because 5 sits at position 2. And `find_spot([1, 3, 5, 6], 2)` gives `1`, because 2 is missing and belongs between 1 and 3, at position 1.",
"code": "def find_spot(nums, target):\n    low = 0\n    high = len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return nums[mid]\n        if nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return low",
"bug": [
7,
7
],
"fix": "            return mid",
"tests": [
[
"find_spot([1, 3, 5, 6], 5)",
2
],
[
"find_spot([1, 3, 5, 6], 1)",
0
],
[
"find_spot([1, 3, 5, 6], 2)",
1
]
],
"why": "The task asks for a position. `nums[mid]` is the number at that position, which equals `target`, so the function returned 5 instead of 2. Return `mid`, the position.",
"domain": "Binary search",
"jobs": [
[
6,
"found it"
],
[
8,
"keep the half with target"
],
[
12,
"where target would go"
]
],
"bugText": "            return nums[mid]"
},
{
"id": "b7",
"habit": "B",
"kind": "fix",
"fn": "has_path",
"task": "The dictionary `graph` maps each node to a list of the nodes it links to, and each link goes one way, from the key to each node in its list. Return True if you can walk from `start` to `goal` by following links, and False if not. A node reaches itself without moving. For example, `has_path({'a': ['b'], 'b': ['c'], 'c': []}, 'a', 'c')` gives `True`. From a, follow the link to b. From b, follow the link to c, which is the goal.",
"code": "def has_path(graph, start, goal):\n    seen = set()\n    seen.append(start)\n    stack = [start]\n    while stack:\n        node = stack.pop()\n        if node == goal:\n            return True\n        for neighbor in graph[node]:\n            if neighbor not in seen:\n                seen.add(neighbor)\n                stack.append(neighbor)\n    return False",
"bug": [
3,
3
],
"fix": "    seen.add(start)",
"tests": [
[
"has_path({'a': ['b'], 'b': ['c'], 'c': []}, 'a', 'c')",
true
],
[
"has_path({'a': ['b'], 'b': [], 'c': ['a']}, 'a', 'c')",
false
],
[
"has_path({'a': []}, 'a', 'a')",
true
]
],
"why": "`seen` is a set, and a set has no `append`, so the line crashed. A list uses `append`, and a set uses `add`: `seen.add(start)`. The `stack.append` below is fine, because `stack` is a list. Name the type before choosing the method.",
"domain": "Graphs",
"jobs": [
[
2,
"mark start as seen"
],
[
6,
"visit the next node"
],
[
9,
"push unseen neighbors"
]
],
"bugText": "    seen.append(start)"
},
{
"id": "b8",
"habit": "B",
"kind": "fix",
"fn": "top_k_frequent",
"task": "`nums` is a list of numbers. Count how many times each number appears. Return the `k` numbers with the highest counts, sorted from smallest number to largest. For example, `top_k_frequent([1, 1, 1, 2, 2, 3], 2)` gives `[1, 2]`. 1 appears 3 times, 2 appears twice and 3 appears once, so the 2 most frequent numbers are 1 and 2.",
"code": "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    heap = []\n    for num in counts:\n        pair = (counts[num], num)\n        heapq.heappush(heap, pair)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    out = []\n    for pair in heap:\n        out.append(pair[0])\n    return sorted(out)",
"bug": [
11,
11
],
"fix": "        out.append(pair[1])",
"tests": [
[
"top_k_frequent([1, 1, 1, 2, 2, 3], 2)",
[
1,
2
]
],
[
"top_k_frequent([4, 4, 9], 1)",
[
4
]
],
[
"top_k_frequent([7], 1)",
[
7
]
]
],
"why": "Each heap item is `(count, number)`. `pair[0]` is the count, so the function returned how often numbers appeared, not the numbers. Take `pair[1]`. Say what each spot in a tuple holds before you index it.",
"domain": "Heaps",
"jobs": [
[
4,
"keep the k most common"
],
[
9,
"collect the numbers"
]
],
"bugText": "        out.append(pair[0])"
},
{
"id": "c2",
"habit": "C",
"kind": "fix",
"fn": "count_small_products",
"task": "`nums` is a list of positive whole numbers. A stretch is one or more numbers that sit next to each other in `nums`. Count the stretches whose product, which is all their numbers multiplied together, is less than `k`. For example, `count_small_products([10, 5, 2, 6], 100)` gives `8`. All 4 single numbers count. Of the pairs, [10, 5] is 50, [5, 2] is 10 and [2, 6] is 12, so all 3 count. Of the triples, [10, 5, 2] is 100, which is not less than 100, and [5, 2, 6] is 60, which counts. All four numbers make 600. So 4 + 3 + 1 = 8 stretches count.",
"code": "def count_small_products(nums, k):\n    product = 1\n    left = 0\n    found = 0\n    for right in range(len(nums)):\n        product *= nums[right]\n        if product >= k:\n            product //= nums[left]\n            left += 1\n        found += right - left + 1\n    return found",
"bug": [
7,
7
],
"fix": "        while product >= k:",
"tests": [
[
"count_small_products([10, 5, 2, 6], 100)",
8
],
[
"count_small_products([1, 2], 2)",
1
],
[
"count_small_products([2, 1, 5], 4)",
3
]
],
"why": "Removing one number may leave the product still too big. In `[1, 2]` with `k = 2`, dropping 1 keeps the product at 2, so the window [2] was counted. Shrink with `while product >= k:` until the window is valid again.",
"domain": "Sliding window",
"jobs": [
[
6,
"add the new number"
],
[
7,
"shrink from the left"
],
[
10,
"count runs ending here"
]
],
"bugText": "        if product >= k:"
},
{
"id": "c3",
"habit": "C",
"kind": "fix",
"fn": "count_cheap",
"task": "`prices` is a list of positive prices. A stretch is one or more prices that sit next to each other in `prices`. Count the stretches whose total is `budget` or less. For example, `count_cheap([1, 2, 3], 3)` gives `4`. All 3 single prices count. Of the pairs, [1, 2] totals 3 and counts, but [2, 3] totals 5. All three prices total 6. So 3 + 1 = 4 stretches count.",
"code": "def count_cheap(prices, budget):\n    total = 0\n    left = 0\n    found = 0\n    for right in range(len(prices)):\n        total += prices[right]\n        if total > budget:\n            total -= prices[left]\n            left += 1\n        found += right - left + 1\n    return found",
"bug": [
7,
7
],
"fix": "        while total > budget:",
"tests": [
[
"count_cheap([1, 2, 3], 3)",
4
],
[
"count_cheap([1, 2], 1)",
1
],
[
"count_cheap([2, 2, 1, 4], 3)",
4
]
],
"why": "Removing one price may leave the total over the budget. In `[1, 2]` with a budget of 1, dropping 1 leaves [2], which still costs too much, but it was counted. Shrink with `while total > budget:` until the total fits.",
"domain": "Sliding window",
"jobs": [
[
6,
"add the new price"
],
[
7,
"shrink from the left"
],
[
10,
"count runs ending here"
]
],
"bugText": "        if total > budget:"
},
{
"id": "c4",
"habit": "C",
"kind": "fix",
"fn": "shortest_abc",
"task": "`s` holds only the letters a, b and c, and holds each of them at least once. Look at every stretch of letters that sit next to each other in `s`. Return the length of the shortest stretch that holds all three letters. For example, `shortest_abc('aabc')` gives `3`. The stretch \"abc\" holds a, b and c and has length 3. A stretch of 2 letters cannot hold three different letters.",
"code": "def shortest_abc(s):\n    count = Counter()\n    left = 0\n    best = len(s)\n    for right in range(len(s)):\n        count[s[right]] += 1\n        if len(count) == 3:\n            size = right - left + 1\n            best = min(best, size)\n            gone = s[left]\n            count[gone] -= 1\n            if count[gone] == 0:\n                del count[gone]\n            left += 1\n    return best",
"bug": [
7,
7
],
"fix": "        while len(count) == 3:",
"tests": [
[
"shortest_abc('abcabc')",
3
],
[
"shortest_abc('aabc')",
3
],
[
"shortest_abc('aaabcb')",
3
]
],
"why": "Shrinking once may still leave all three letters inside, and that shorter window is never measured. In \"aabc\", dropping the first a leaves \"abc\", which still holds all three. Use `while len(count) == 3:` so you keep measuring and shrinking.",
"domain": "Sliding window",
"jobs": [
[
6,
"add the new letter"
],
[
7,
"shrink from the left"
],
[
8,
"record the length"
]
],
"bugText": "        if len(count) == 3:"
},
{
"id": "c5",
"habit": "C",
"kind": "fix",
"fn": "longest_k_repeats",
"task": "`nums` is a list of numbers. Look at every stretch of numbers that sit next to each other in `nums`. Return the length of the longest stretch in which no number appears more than `k` times. For example, `longest_k_repeats([5, 6, 6, 6], 2)` gives `3`. The stretch [5, 6, 6] holds 6 twice, which is allowed, and has length 3. The whole list holds 6 three times, which is more than 2.",
"code": "def longest_k_repeats(nums, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(nums)):\n        new = nums[right]\n        count[new] += 1\n        if count[new] > k:\n            count[nums[left]] -= 1\n            left += 1\n        size = right - left + 1\n        best = max(best, size)\n    return best",
"bug": [
8,
8
],
"fix": "        while count[new] > k:",
"tests": [
[
"longest_k_repeats([1, 2, 3, 1, 2, 3, 1, 2], 2)",
6
],
[
"longest_k_repeats([1, 2, 2, 1], 1)",
2
],
[
"longest_k_repeats([5, 6, 6, 6], 2)",
3
]
],
"why": "The number at `left` may not be the repeated one. In [1, 2, 2], dropping 1 still leaves two 2s. Shrink with `while count[new] > k:` until the new number fits.",
"domain": "Sliding window",
"jobs": [
[
7,
"add the new number"
],
[
8,
"shrink from the left"
],
[
11,
"record the best size"
]
],
"bugText": "        if count[new] > k:"
},
{
"id": "c6",
"habit": "C",
"kind": "fix",
"fn": "max_unique_sum",
"task": "`nums` is a list of positive numbers. Look at every stretch of numbers that sit next to each other in `nums`. Among the stretches in which no number appears twice, return the biggest sum. For example, `max_unique_sum([4, 2, 4, 5, 6])` gives `17`. The stretch [2, 4, 5, 6] has no repeat and sums to 17. The whole list holds 4 twice, so it does not qualify.",
"code": "def max_unique_sum(nums):\n    seen = set()\n    left = 0\n    total = 0\n    best = 0\n    for right in range(len(nums)):\n        new = nums[right]\n        if new in seen:\n            seen.remove(nums[left])\n            total -= nums[left]\n            left += 1\n        seen.add(new)\n        total += new\n        best = max(best, total)\n    return best",
"bug": [
8,
8
],
"fix": "        while new in seen:",
"tests": [
[
"max_unique_sum([4, 2, 4, 5, 6])",
17
],
[
"max_unique_sum([1, 2, 2])",
3
],
[
"max_unique_sum([5, 2, 1, 2, 5, 2, 1, 2, 5])",
8
]
],
"why": "The repeat may sit further in than `left`. In [1, 2, 2], dropping 1 still leaves the first 2, so the sum 4 counted two 2s. Shrink with `while new in seen:` until the old copy is gone.",
"domain": "Sliding window",
"jobs": [
[
8,
"shrink from the left"
],
[
12,
"add the new number"
],
[
14,
"record the best sum"
]
],
"bugText": "        if new in seen:"
},
{
"id": "e6",
"habit": "E",
"kind": "fix",
"fn": "pair_sum",
"task": "`nums` is a list of numbers sorted from smallest to largest, and positions count from 0. Find two different positions whose numbers add up to `target`, and return the two positions as a list, smaller position first. If more than one pair works, return the pair with the smallest first position. Return `[]` if no pair works. For example, `pair_sum([1, 3, 4, 6], 7)` gives `[0, 3]`. Positions 0 and 3 hold 1 and 6, and 1 + 6 = 7. The pair 3 + 4 also makes 7, but it starts at position 1, later than 0.",
"code": "def pair_sum(nums, target):\n    left = 0\n    right = len(nums) - 1\n    while left < right:\n        low = nums[left]\n        high = nums[left]\n        total = low + high\n        if total == target:\n            return [left, right]\n        if total < target:\n            left += 1\n        else:\n            right -= 1\n    return []",
"bug": [
6,
6
],
"fix": "        high = nums[right]",
"tests": [
[
"pair_sum([2, 7, 11, 15], 9)",
[
0,
1
]
],
[
"pair_sum([1, 3, 4, 6], 7)",
[
0,
3
]
],
[
"pair_sum([1, 2], 9)",
[]
]
],
"why": "The line `high = nums[left]` was copied from the line above, so the code added the left number to itself. The other number sits at the right end: `high = nums[right]`.",
"domain": "Two pointers",
"jobs": [
[
5,
"one number from each end"
],
[
8,
"found the pair"
],
[
10,
"move toward the target"
]
],
"bugText": "        high = nums[left]"
},
{
"id": "e7",
"habit": "E",
"kind": "fix",
"fn": "can_attend",
"task": "Each item in `meetings` is one meeting, written as `[start, end]`, and the meetings can come in any order. Return True if one person can attend every meeting, which means no two meetings overlap, and False if not. A meeting that starts exactly when another ends does not overlap it. For example, `can_attend([[0, 30], [5, 10], [15, 20]])` gives `False`, because the meeting from 5 to 10 happens during the meeting from 0 to 30.",
"code": "def can_attend(meetings):\n    ordered = sorted(meetings)\n    prev_end = 0\n    for start, end in ordered:\n        if start < prev_end:\n            return False\n        prev_end = start\n    return True",
"bug": [
7,
7
],
"fix": "        prev_end = end",
"tests": [
[
"can_attend([[0, 30], [5, 10], [15, 20]])",
false
],
[
"can_attend([[7, 10], [2, 4]])",
true
],
[
"can_attend([[1, 5], [3, 4]])",
false
]
],
"why": "The next meeting must start after this one ends, so `prev_end` must hold `end`. Saving `start` let the meeting at 5 pass, because 5 is not less than 0. Use `prev_end = end`.",
"domain": "Intervals",
"bugText": "        prev_end = start"
},
{
"id": "e8",
"habit": "E",
"kind": "fix",
"fn": "has_cycle",
"task": "The dictionary `links` stores a linked list. A linked list is a chain of nodes where each node points to the next one. Each key is a node and its value is the next node. In a list with an end, the last node maps to `None`. Start at `head` and follow the links. Return True if you come back to a node you already visited, which is called a cycle, and False if you reach `None`. For example, `has_cycle({'a': 'b', 'b': 'a'}, 'a')` gives `True`. From a, go to b. From b, go back to a, which you already visited.",
"code": "def has_cycle(links, head):\n    slow = head\n    fast = head\n    while fast is not None:\n        step = links[fast]\n        if step is None:\n            return False\n        slow = links[slow]\n        fast = links[fast]\n        if slow == fast:\n            return True\n    return False",
"bug": [
9,
9
],
"fix": "        fast = links[step]",
"tests": [
[
"has_cycle({'a': 'b', 'b': 'c', 'c': None}, 'a')",
false
],
[
"has_cycle({'a': 'b', 'b': 'a'}, 'a')",
true
],
[
"has_cycle({'a': None}, 'a')",
false
]
],
"why": "The fast pointer moves two nodes each pass. `step` is already one node ahead, so the second move is `fast = links[step]`. Using `links[fast]` moved fast one node, so it landed on slow at once, and every list looked like a loop.",
"domain": "Linked lists",
"jobs": [
[
5,
"fast needs two more nodes"
],
[
8,
"slow moves 1, fast moves 2"
],
[
10,
"they meet only in a loop"
]
],
"bugText": "        fast = links[fast]"
},
{
"id": "e9",
"habit": "E",
"kind": "fix",
"fn": "course_order",
"task": "The dictionary `graph` maps each course to a list of the courses that need it first. So `'a': ['c']` means you must take a before c. Return all the courses in an order you can take them, so every course comes after all the courses it needs. Start with the courses that need nothing, in the order they appear in `graph`. Each time you take a course, any course that now has everything it needs joins the end of the line. For example, `course_order({'a': ['c'], 'b': ['c'], 'c': []})` gives `['a', 'b', 'c']`. At the start, a and b need nothing, so the line is a, b. Take a, then b. Now c has both courses it needs, so take c.",
"code": "def course_order(graph):\n    need = Counter()\n    for course in graph:\n        for later in graph[course]:\n            need[later] += 1\n    ready = deque()\n    for course in graph:\n        if need[course] == 0:\n            ready.append(course)\n    order = []\n    while ready:\n        course = ready.popleft()\n        order.append(course)\n        for later in graph[course]:\n            need[later] -= 1\n            if need[course] == 0:\n                ready.append(later)\n    return order",
"bug": [
16,
16
],
"fix": "            if need[later] == 0:",
"tests": [
[
"course_order({'a': ['c'], 'b': ['c'], 'c': []})",
[
"a",
"b",
"c"
]
],
[
"course_order({'x': ['y'], 'y': ['z'], 'z': []})",
[
"x",
"y",
"z"
]
],
[
"course_order({'m': []})",
[
"m"
]
]
],
"why": "The count that just went down belongs to `later`, so the check is `need[later] == 0`. `need[course]` is already 0, because `course` was ready, so every later course joined the queue at once, and some joined twice.",
"domain": "Graphs",
"jobs": [
[
2,
"count what each course needs"
],
[
6,
"start with courses ready"
],
[
11,
"take courses in order"
],
[
14,
"free the courses after it"
]
],
"bugText": "            if need[course] == 0:"
},
{
"id": "e10",
"habit": "E",
"kind": "fix",
"fn": "has_prefix",
"task": "`words` is a list of words, and `prefix` is a string. Return True if at least one word in `words` starts with `prefix`, and False if none does. The code first builds a trie, which is a tree of nested dictionaries with one level for each letter. The words 'cat' and 'cow' give the trie {'c': {'a': {'t': {}}, 'o': {'w': {}}}}. For example, `has_prefix(['cat'], 'cow')` gives `False`. The trie has c, but under c it has only a, not o.",
"code": "def has_prefix(words, prefix):\n    root = {}\n    for word in words:\n        node = root\n        for letter in word:\n            if letter not in node:\n                node[letter] = {}\n            node = node[letter]\n    node = root\n    for letter in prefix:\n        if letter not in node:\n            return False\n        node = root[letter]\n    return True",
"bug": [
13,
13
],
"fix": "        node = node[letter]",
"tests": [
[
"has_prefix(['apple', 'app'], 'app')",
true
],
[
"has_prefix(['cat'], 'ca')",
true
],
[
"has_prefix(['cat'], 'cow')",
false
]
],
"why": "Each step must go one level down from `node`. `root[letter]` jumped back to the top level, so the second letter crashed. Use `node = node[letter]`, the same line as in the build loop above.",
"domain": "Tries",
"jobs": [
[
2,
"build the trie"
],
[
9,
"walk down the prefix"
]
],
"bugText": "        node = root[letter]"
},
{
"id": "g5",
"habit": "G",
"kind": "fix",
"fn": "first_at_least",
"task": "`nums` is a list of numbers sorted from smallest to largest, and positions count from 0. Return the first position whose number is `target` or bigger. If every number is smaller than `target`, return `len(nums)`, the position just past the end. For example, `first_at_least([1, 3, 3, 5], 3)` gives `1`. Position 0 holds 1, which is smaller than 3. Position 1 holds 3, the first number that is 3 or bigger.",
"code": "def first_at_least(nums, target):\n    low = 0\n    high = len(nums)\n    while low < high:\n        mid = (low + high) // 2\n        if nums[mid] > target:\n            high = mid\n        else:\n            low = mid + 1\n    return low",
"bug": [
6,
6
],
"fix": "        if nums[mid] >= target:",
"tests": [
[
"first_at_least([1, 3, 3, 5], 3)",
1
],
[
"first_at_least([2, 4], 4)",
1
],
[
"first_at_least([1, 2], 5)",
2
]
],
"why": "\"At least\" includes `target` itself. With `>`, a middle number equal to 3 sent the search to the right, so it found the first number bigger than 3. Use `>=`.",
"domain": "Binary search",
"jobs": [
[
4,
"close in on the first spot"
],
[
6,
"pick a half"
]
],
"bugText": "        if nums[mid] > target:"
},
{
"id": "g6",
"habit": "G",
"kind": "fix",
"fn": "min_rooms",
"task": "Each item in `meetings` is one meeting, written as `[start, end]`, and the meetings can come in any order. Return the fewest rooms needed so every meeting has a room for its whole time. A room is free again the moment its meeting ends, so a meeting that ends at 5 and a meeting that starts at 5 can share a room. For example, `min_rooms([[0, 30], [5, 10], [15, 20]])` gives `2`. Room 1 holds 0 to 30. The meeting from 5 to 10 overlaps it, so it takes room 2. The meeting from 15 to 20 starts after 10, so it reuses room 2.",
"code": "def min_rooms(meetings):\n    ordered = sorted(meetings)\n    ends = []\n    for start, end in ordered:\n        if ends and ends[0] < start:\n            heapq.heappop(ends)\n        heapq.heappush(ends, end)\n    return len(ends)",
"bug": [
5,
5
],
"fix": "        if ends and ends[0] <= start:",
"tests": [
[
"min_rooms([[0, 30], [5, 10], [15, 20]])",
2
],
[
"min_rooms([[1, 5], [5, 9]])",
1
],
[
"min_rooms([[2, 4], [2, 4]])",
2
]
],
"why": "A room that frees at 5 can take a meeting that starts at 5, so the check is `ends[0] <= start`. With `<`, the meetings [1, 5] and [5, 9] used 2 rooms instead of 1.",
"domain": "Heaps",
"bugText": "        if ends and ends[0] < start:"
},
{
"id": "g7",
"habit": "G",
"kind": "fix",
"fn": "remove_digits",
"task": "`num` is a string of digits, and `k` is how many digits to remove. Remove exactly `k` digits, keep the rest in their order, and return the smallest number you can get, as a string. Drop any zeros at the front, and return '0' if nothing is left. For example, `remove_digits('1432219', 3)` gives `'1219'`. Removing the 4, the 3 and the first 2 leaves 1, 2, 1, 9. No other choice of 3 digits leaves a smaller number.",
"code": "def remove_digits(num, k):\n    stack = []\n    for digit in num:\n        while k > 0 and stack:\n            if stack[-1] < digit:\n                break\n            stack.pop()\n            k -= 1\n        stack.append(digit)\n    while k > 0:\n        stack.pop()\n        k -= 1\n    joined = ''.join(stack)\n    result = joined.lstrip('0')\n    if result == '':\n        return '0'\n    return result",
"bug": [
5,
5
],
"fix": "            if stack[-1] <= digit:",
"tests": [
[
"remove_digits('112', 1)",
"11"
],
[
"remove_digits('1432219', 3)",
"1219"
],
[
"remove_digits('10', 2)",
"0"
]
],
"why": "Pop a digit only when it is bigger than the new digit. Popping an equal digit gains nothing and wastes a removal, so '112' gave '12' instead of '11'. Stop when `stack[-1] <= digit`.",
"domain": "Stacks",
"jobs": [
[
4,
"drop bigger digits first"
],
[
10,
"use up any k left"
],
[
13,
"remove leading zeros"
]
],
"bugText": "            if stack[-1] < digit:"
},
{
"id": "g8",
"habit": "G",
"kind": "fix",
"fn": "near_repeat",
"task": "`nums` is a list of numbers, and positions count from 0. Return True if the same number appears at two positions whose distance is `k` or less, and False if not. The distance is the bigger position minus the smaller one. For example, `near_repeat([1, 2, 3, 1], 3)` gives `True`. The two 1s sit at positions 0 and 3, so their distance is 3, which is 3 or less.",
"code": "def near_repeat(nums, k):\n    last = {}\n    for i in range(len(nums)):\n        num = nums[i]\n        if num in last:\n            gap = i - last[num]\n            if gap < k:\n                return True\n        last[num] = i\n    return False",
"bug": [
7,
7
],
"fix": "            if gap <= k:",
"tests": [
[
"near_repeat([1, 2, 3, 1], 3)",
true
],
[
"near_repeat([1, 2, 1], 1)",
false
],
[
"near_repeat([5, 5], 1)",
true
]
],
"why": "\"At most k apart\" includes a gap of exactly `k`. With `<`, the gap of 3 did not count. Use `gap <= k`.",
"domain": "Hashing",
"jobs": [
[
5,
"compare with the last spot"
],
[
9,
"remember where num was"
]
],
"bugText": "            if gap < k:"
},
{
"id": "g9",
"habit": "G",
"kind": "fix",
"fn": "has_majority",
"task": "`nums` is a list of numbers. Return True if one number fills more than half of the list, and False if not. Exactly half is not enough. For example, `has_majority([3, 3, 4])` gives `True`, because 3 fills 2 of the 3 spots, and 2 is more than half of 3. And `has_majority([1, 1, 2, 2])` gives `False`, because 1 and 2 each fill exactly half.",
"code": "def has_majority(nums):\n    counts = Counter(nums)\n    half = len(nums) // 2\n    for num in counts:\n        if counts[num] >= half:\n            return True\n    return False",
"bug": [
5,
5
],
"fix": "        if counts[num] > half:",
"tests": [
[
"has_majority([1, 2])",
false
],
[
"has_majority([3, 3, 4])",
true
],
[
"has_majority([1, 1, 2, 2])",
false
]
],
"why": "\"More than half\" leaves out exactly half. In [1, 2], the number 1 fills exactly half, and `>=` said True. Use `counts[num] > half`.",
"domain": "Hashing",
"bugText": "        if counts[num] >= half:"
},
{
"id": "j5",
"habit": "J",
"kind": "fix",
"fn": "find_number",
"task": "`nums` is a list of numbers sorted from smallest to largest, and positions count from 0. Return the position of `target`, or -1 if `target` is not in the list. For example, `find_number([1, 3, 5, 7, 9], 7)` gives `3`, because 7 sits at position 3. And `find_number([1, 2, 3], 8)` gives `-1`, because 8 is missing.",
"code": "def find_number(nums, target):\n    low = 0\n    high = len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            high = mid - 1\n        else:\n            low = mid + 1\n    return -1",
"bug": [
8,
8
],
"fix": "        if nums[mid] > target:",
"tests": [
[
"find_number([1, 3, 5, 7, 9], 7)",
3
],
[
"find_number([2, 4], 4)",
1
],
[
"find_number([1, 2, 3], 8)",
-1
]
],
"why": "When the middle number is too small, `target` sits to the right, so `low` must move up. The check was reversed, so the search threw away the half that held `target`. Use `if nums[mid] > target:` before `high = mid - 1`.",
"domain": "Binary search",
"jobs": [
[
6,
"found it"
],
[
8,
"keep the half with target"
]
],
"bugText": "        if nums[mid] < target:"
},
{
"id": "j6",
"habit": "J",
"kind": "fix",
"fn": "is_palindrome",
"task": "`s` is a string. Return True if `s` reads the same from left to right as from right to left, and False if not. For example, `is_palindrome('racecar')` gives `True`, because read backward it is still \"racecar\". And `is_palindrome('ab')` gives `False`, because read backward it is \"ba\".",
"code": "def is_palindrome(s):\n    left = 0\n    right = len(s) - 1\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right += 1\n    return True",
"bug": [
8,
8
],
"fix": "        right -= 1",
"tests": [
[
"is_palindrome('racecar')",
true
],
[
"is_palindrome('abba')",
true
],
[
"is_palindrome('ab')",
false
]
],
"why": "`right` starts at the end and walks toward the middle, so it goes down. `right += 1` walked off the end and crashed. Use `right -= 1`.",
"domain": "Two pointers",
"bugText": "        right += 1"
},
{
"id": "j7",
"habit": "J",
"kind": "fix",
"fn": "eval_rpn",
"task": "Each item in `tokens` is a string that holds a whole number, such as '5', or one of the operators `+`, `-` and `*`. Read the tokens from left to right and keep a stack of numbers, where you add and remove numbers only at the top. A number goes on top of the stack. An operator takes the top two numbers off, applies the operator to them in the order they were added, and puts the result on top. Return the one number left at the end. For example, `eval_rpn(['5', '2', '-'])` gives `3`. '5': the stack is [5]. '2': the stack is [5, 2]. '-': take off 5 and 2, compute 5 - 2 = 3, and the stack is [3].",
"code": "def eval_rpn(tokens):\n    stack = []\n    for token in tokens:\n        if token in '+-*':\n            right = stack.pop()\n            left = stack.pop()\n            if token == '+':\n                stack.append(left + right)\n            elif token == '-':\n                stack.append(right - left)\n            else:\n                stack.append(left * right)\n        else:\n            stack.append(int(token))\n    return stack[0]",
"bug": [
10,
10
],
"fix": "                stack.append(left - right)",
"tests": [
[
"eval_rpn(['5', '2', '-'])",
3
],
[
"eval_rpn(['2', '1', '+', '3', '*'])",
9
],
[
"eval_rpn(['4', '13', '5', '-', '+'])",
12
]
],
"why": "The stack gives back the last number first, so the first pop is the right number. \"5 2 -\" means 5 - 2, which is `left - right`. The line had the order reversed and gave -3.",
"domain": "Stacks",
"jobs": [
[
4,
"apply the operator"
],
[
13,
"push a number"
]
],
"bugText": "                stack.append(right - left)"
},
{
"id": "j8",
"habit": "J",
"kind": "fix",
"fn": "halve_piles",
"task": "Each number in `piles` is how many stones are in one pile. Each turn, pick the biggest pile and remove half of its stones, rounded down. So a pile of 9 loses 4 and keeps 5. After `k` turns, return the total number of stones left in all piles. For example, `halve_piles([5, 4, 9], 2)` gives `12`. Turn 1: the biggest pile is 9, it loses 4, and the piles are [5, 4, 5]. Turn 2: the biggest pile is a 5, it loses 2, and the piles are [3, 4, 5]. The total is 3 + 4 + 5 = 12.",
"code": "def halve_piles(piles, k):\n    heap = []\n    for pile in piles:\n        heapq.heappush(heap, -pile)\n    for _ in range(k):\n        biggest = -heapq.heappop(heap)\n        taken = biggest // 2\n        rest = biggest - taken\n        heapq.heappush(heap, rest)\n    return -sum(heap)",
"bug": [
9,
9
],
"fix": "        heapq.heappush(heap, -rest)",
"tests": [
[
"halve_piles([5, 4, 9], 2)",
12
],
[
"halve_piles([10], 1)",
5
],
[
"halve_piles([4, 3, 6, 7], 3)",
12
]
],
"why": "The heap stores every pile with a minus sign, so the biggest pile comes out first. The pile went back without its minus sign, so it looked like the smallest and broke the total. Push `-rest`.",
"domain": "Heaps",
"jobs": [
[
2,
"max heap with minus signs"
],
[
5,
"halve the biggest k times"
]
],
"bugText": "        heapq.heappush(heap, rest)"
},
{
"id": "j9",
"habit": "J",
"kind": "fix",
"fn": "range_sums",
"task": "`nums` is a list of numbers, and positions count from 0. Each item in `queries` is a pair `[first, last]` of positions. For each query, return the sum of the numbers from position `first` to position `last`, including both ends. For example, `range_sums([5, -1, 2], [[0, 2], [1, 1]])` gives `[6, -1]`. Query [0, 2]: 5 + (-1) + 2 = 6. Query [1, 1]: only position 1, which holds -1.",
"code": "def range_sums(nums, queries):\n    prefix = [0]\n    for num in nums:\n        running = prefix[-1] + num\n        prefix.append(running)\n    out = []\n    for first, last in queries:\n        upto = prefix[last + 1]\n        before = prefix[first]\n        total = before - upto\n        out.append(total)\n    return out",
"bug": [
10,
10
],
"fix": "        total = upto - before",
"tests": [
[
"range_sums([1, 2, 3, 4], [[1, 2]])",
[
5
]
],
[
"range_sums([5, -1, 2], [[0, 2], [1, 1]])",
[
6,
-1
]
],
[
"range_sums([7], [[0, 0]])",
[
7
]
]
],
"why": "`upto` holds the sum through `last`, and `before` holds the sum before `first`. The range sum is the bigger one minus the smaller one: `upto - before`. The reversed order gave -5.",
"domain": "Hashing",
"jobs": [
[
2,
"build the prefix sums"
],
[
7,
"answer each range"
]
],
"bugText": "        total = before - upto"
},
{
"id": "m3",
"habit": "M",
"kind": "fix",
"fn": "has_gap_pair",
"task": "`nums` is a list of numbers. Return True if two numbers at different positions in `nums` differ by exactly `diff`, and False if not. For example, `has_gap_pair([1, 5, 3], 2)` gives `True`, because 3 - 1 = 2. And `has_gap_pair([1, 2], 5)` gives `False`, because 1 and 2 differ by only 1.",
"code": "def has_gap_pair(nums, diff):\n    seen = set()\n    for num in nums:\n        if num - diff in seen:\n            return True\n        if num + diff in seen:\n            return True\n        seen.add(num)",
"bug": [
8,
8
],
"fix": "        seen.add(num)\n    return False",
"tests": [
[
"has_gap_pair([1, 5, 3], 2)",
true
],
[
"has_gap_pair([1, 2], 5)",
false
],
[
"has_gap_pair([], 1)",
false
]
],
"why": "When no pair exists, the loop ends without a return, and Python gives back `None`. Add `return False` after the loop. Right after writing a loop, write the line for \"nothing found\".",
"domain": "Hashing",
"bugText": "        seen.add(num)"
},
{
"id": "m4",
"habit": "M",
"kind": "fix",
"fn": "path_len",
"task": "The dictionary `graph` maps each node to a list of the nodes it links to, and each link goes one way. Return the fewest links you must follow to get from `start` to `goal`, or -1 if `goal` cannot be reached. If `start` is `goal`, the answer is 0. For example, `path_len({'a': ['b'], 'b': ['c'], 'c': []}, 'a', 'c')` gives `2`. a to b is one link, and b to c is a second link.",
"code": "def path_len(graph, start, goal):\n    steps = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        if node == goal:\n            return steps[node]\n        hops = steps[node] + 1\n        for neighbor in graph[node]:\n            if neighbor not in steps:\n                steps[neighbor] = hops\n                queue.append(neighbor)",
"bug": [
12,
12
],
"fix": "                queue.append(neighbor)\n    return -1",
"tests": [
[
"path_len({'a': ['b'], 'b': ['c'], 'c': []}, 'a', 'c')",
2
],
[
"path_len({'a': [], 'b': []}, 'a', 'b')",
-1
],
[
"path_len({'a': ['a']}, 'a', 'a')",
0
]
],
"why": "An unreachable goal empties the queue, the loop ends, and Python gives back `None`. Add `return -1` after the loop.",
"domain": "Graphs",
"jobs": [
[
2,
"steps from start"
],
[
6,
"reached the goal"
],
[
9,
"visit new neighbors"
]
],
"bugText": "                queue.append(neighbor)"
},
{
"id": "m5",
"habit": "M",
"kind": "fix",
"fn": "first_unique",
"task": "`s` is a string, and positions count from 0. Return the position of the first letter that appears only once in the whole string, or -1 if every letter appears more than once. For example, `first_unique('loveleetcode')` gives `2`. The l at position 0 appears again later, and so does the o at position 1. The v at position 2 appears only once.",
"code": "def first_unique(s):\n    counts = Counter(s)\n    for i in range(len(s)):\n        if counts[s[i]] == 1:\n            return i",
"bug": [
5,
5
],
"fix": "            return i\n    return -1",
"tests": [
[
"first_unique('leetcode')",
0
],
[
"first_unique('aabb')",
-1
],
[
"first_unique('loveleetcode')",
2
]
],
"why": "When every letter repeats, the loop never returns, and Python gives back `None`. Add `return -1` after the loop.",
"domain": "Hashing",
"bugText": "            return i"
},
{
"id": "m6",
"habit": "M",
"kind": "fix",
"fn": "find_step",
"task": "The dictionary `links` stores a linked list. A linked list is a chain of nodes where each node points to the next one. Each key is a node, its value is the next node, and the last node maps to `None`. Start at `head` and follow the links. Return how many links you follow to reach `goal`, or -1 if `goal` is not in the list. For example, `find_step({'a': 'b', 'b': None}, 'a', 'b')` gives `1`. You start at a, which is not the goal. One link takes you to b, which is the goal.",
"code": "def find_step(links, head, goal):\n    node = head\n    step = 0\n    while node is not None:\n        if node == goal:\n            return step\n        node = links[node]\n        step += 1",
"bug": [
8,
8
],
"fix": "        step += 1\n    return -1",
"tests": [
[
"find_step({'a': 'b', 'b': None}, 'a', 'b')",
1
],
[
"find_step({'a': 'b', 'b': None}, 'a', 'z')",
-1
],
[
"find_step({'a': None}, 'a', 'a')",
0
]
],
"why": "A missing `goal` walks off the end, the loop stops, and Python gives back `None`. Add `return -1` after the loop.",
"domain": "Linked lists",
"bugText": "        step += 1"
},
{
"id": "m7",
"habit": "M",
"kind": "fix",
"fn": "first_gap",
"task": "Each item in `meetings` is one meeting, written as `[start, end]` in hours. The meetings can come in any order, and no two overlap. A gap is the free time between the end of one meeting and the start of the next meeting in time order. Return the start hour of the first gap, in time order, that lasts `need` hours or more, or -1 if there is none. For example, `first_gap([[9, 10], [13, 14], [10, 12]], 1)` gives `12`. In time order, the meetings are 9 to 10, 10 to 12 and 13 to 14. The gap from 10 to 10 lasts 0 hours. The gap from 12 to 13 lasts 1 hour, which is enough.",
"code": "def first_gap(meetings, need):\n    ordered = sorted(meetings)\n    for i in range(1, len(ordered)):\n        free_from = ordered[i - 1][1]\n        free_to = ordered[i][0]\n        gap = free_to - free_from\n        if gap >= need:\n            return free_from",
"bug": [
8,
8
],
"fix": "            return free_from\n    return -1",
"tests": [
[
"first_gap([[9, 10], [13, 14], [10, 12]], 1)",
12
],
[
"first_gap([[1, 2], [2, 3]], 1)",
-1
],
[
"first_gap([[5, 6]], 1)",
-1
]
],
"why": "A full schedule has no gap, so the loop ends without a return, and Python gives back `None`. Add `return -1` after the loop.",
"domain": "Intervals",
"bugText": "            return free_from"
},
{
"id": "n3",
"habit": "N",
"kind": "fix",
"fn": "best_run_sum",
"task": "`nums` is a list of numbers, some of them negative. A stretch is one or more numbers that sit next to each other in `nums`. Return the biggest sum of any stretch. For example, `best_run_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4])` gives `6`. The stretch [4, -1, 2, 1] sums to 6. Adding more numbers on either side only lowers the sum.",
"code": "def best_run_sum(nums):\n    current = 0\n    best = nums[0]\n    for num in nums:\n        best = max(best, current)\n        extended = current + num\n        current = max(num, extended)\n    return best",
"bug": [
5,
7
],
"fix": "        extended = current + num\n        current = max(num, extended)\n        best = max(best, current)",
"tests": [
[
"best_run_sum([1, 2])",
3
],
[
"best_run_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4])",
6
],
[
"best_run_sum([-3, 5])",
5
]
],
"why": "The order inside the loop is add, fix, check. Here `best` was saved before `current` took the new number, so the run that ends at the last number was never saved. [1, 2] gave 1 instead of 3. Update `current` first, then save `best`.",
"domain": "Dynamic programming",
"bugText": "        best = max(best, current)\n        extended = current + num\n        current = max(num, extended)"
},
{
"id": "n4",
"habit": "N",
"kind": "fix",
"fn": "max_depth",
"task": "`s` is a string that may hold brackets, '(' and ')', along with other characters, and every '(' has a matching ')'. Each '(' goes one level deeper, and each ')' comes back up one level. Return the deepest level reached. For example, `max_depth('(()(()))')` gives `3`. The levels after each bracket are 1, 2, 1, 2, 3, 2, 1, 0, and the deepest is 3.",
"code": "def max_depth(s):\n    depth = 0\n    best = 0\n    for char in s:\n        if char == '(':\n            best = max(best, depth)\n            depth += 1\n        elif char == ')':\n            depth -= 1\n    return best",
"bug": [
6,
7
],
"fix": "            depth += 1\n            best = max(best, depth)",
"tests": [
[
"max_depth('(1)')",
1
],
[
"max_depth('(()(()))')",
3
],
[
"max_depth('abc')",
0
]
],
"why": "The depth was recorded before stepping in, so it was always one level short. '(1)' gave 0 instead of 1. Add 1 to `depth` first, then record `best`.",
"domain": "Stacks",
"jobs": [
[
5,
"step in"
],
[
8,
"step out"
]
],
"bugText": "            best = max(best, depth)\n            depth += 1"
},
{
"id": "n5",
"habit": "N",
"kind": "fix",
"fn": "count_target_sums",
"task": "`nums` is a list of numbers, which can be negative or zero. A stretch is one or more numbers that sit next to each other in `nums`. Count the stretches that add up to exactly `k`. Stretches at different positions count separately, even if they hold the same numbers. For example, `count_target_sums([1, 1, 1], 2)` gives `2`. The stretch at positions 0 and 1 sums to 2, and the stretch at positions 1 and 2 also sums to 2. A single 1 is too small, and all three sum to 3.",
"code": "def count_target_sums(nums, k):\n    seen = Counter()\n    seen[0] = 1\n    total = 0\n    found = 0\n    for num in nums:\n        total += num\n        seen[total] += 1\n        found += seen[total - k]\n    return found",
"bug": [
8,
9
],
"fix": "        found += seen[total - k]\n        seen[total] += 1",
"tests": [
[
"count_target_sums([0, 0], 0)",
3
],
[
"count_target_sums([1, -1], 0)",
1
],
[
"count_target_sums([1, 1, 1], 2)",
2
]
],
"why": "The code saved the current total before looking up earlier totals. When `k` is 0, the lookup then found the total it had just saved, which counts a run of zero numbers. [1, -1] with `k = 0` gave 3 instead of 1. Look up first, then save: `found += seen[total - k]`, then `seen[total] += 1`.",
"domain": "Hashing",
"jobs": [
[
3,
"the empty start"
],
[
7,
"add the new number"
]
],
"bugText": "        seen[total] += 1\n        found += seen[total - k]"
},
{
"id": "n6",
"habit": "N",
"kind": "fix",
"fn": "fewest_whites",
"task": "Each letter in `blocks` is 'W' for a white block or 'B' for a black block, and `k` is a window size. A window is `k` blocks that sit next to each other. Return the fewest white blocks that any window holds. For example, `fewest_whites('WBB', 2)` gives `0`. Window \"WB\" holds 1 white block. Window \"BB\" holds 0, so the answer is 0.",
"code": "def fewest_whites(blocks, k):\n    whites = 0\n    best = k\n    for right in range(len(blocks)):\n        if blocks[right] == 'W':\n            whites += 1\n        if right >= k - 1:\n            best = min(best, whites)\n        if right >= k:\n            if blocks[right - k] == 'W':\n                whites -= 1\n    return best",
"bug": [
7,
11
],
"fix": "        if right >= k:\n            if blocks[right - k] == 'W':\n                whites -= 1\n        if right >= k - 1:\n            best = min(best, whites)",
"tests": [
[
"fewest_whites('WBBWWBBWBW', 7)",
3
],
[
"fewest_whites('WBWBBBW', 2)",
0
],
[
"fewest_whites('WBB', 2)",
0
]
],
"why": "The order inside the loop is add, fix, check. Here the check ran before the leaving block was dropped, so it counted `k + 1` blocks. In \"WBB\", the check saw \"WBB\" with 1 white and missed \"BB\". Drop the leaving block first, then check.",
"domain": "Sliding window",
"jobs": [
[
5,
"add the new block"
],
[
12,
"fewest whites seen"
]
],
"bugText": "        if right >= k - 1:\n            best = min(best, whites)\n        if right >= k:\n            if blocks[right - k] == 'W':\n                whites -= 1"
},
{
"id": "n7",
"habit": "N",
"kind": "fix",
"fn": "cheapest_total",
"task": "Each number in `prices` is one price, and the prices arrive one at a time. After each new price, add up the `k` cheapest prices seen so far, or all of them if fewer than `k` have arrived. Return the list of these totals. For example, `cheapest_total([5, 1, 3], 2)` gives `[5, 6, 4]`. After 5: only 5 so far, so 5. After 1: the 2 cheapest are 5 and 1, so 6. After 3: the 2 cheapest of 5, 1 and 3 are 1 and 3, so 4.",
"code": "def cheapest_total(prices, k):\n    heap = []\n    out = []\n    for price in prices:\n        heapq.heappush(heap, -price)\n        out.append(-sum(heap))\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return out",
"bug": [
6,
8
],
"fix": "        if len(heap) > k:\n            heapq.heappop(heap)\n        out.append(-sum(heap))",
"tests": [
[
"cheapest_total([5, 1, 3], 2)",
[
5,
6,
4
]
],
[
"cheapest_total([2, 8], 1)",
[
2,
2
]
],
[
"cheapest_total([4], 3)",
[
4
]
]
],
"why": "The total was saved while the heap still held `k + 1` prices, so the priciest one was counted too. Pop the extra price first, then save the total.",
"domain": "Heaps",
"bugText": "        out.append(-sum(heap))\n        if len(heap) > k:\n            heapq.heappop(heap)"
},
{
"id": "o1",
"habit": "O",
"kind": "fix",
"fn": "reverse_in_place",
"task": "`items` is a list. Reverse it in place, which means you change the same list instead of making a new one, and return it. Swap the first and last items, then the second and second to last, and keep moving inward until the two ends meet. For example, `reverse_in_place([1, 2, 3])` gives `[3, 2, 1]`. Swap 1 and 3: the list is [3, 2, 1]. The middle item, 2, stays where it is.",
"code": "def reverse_in_place(items):\n    left = 0\n    right = len(items) - 1\n    while left < right:\n        saved = items[left]\n        items[left] = items[right]\n        left += 1\n        right -= 1\n    return items",
"bug": [
6,
6
],
"fix": "        items[left] = items[right]\n        items[right] = saved",
"tests": [
[
"reverse_in_place([1, 2, 3])",
[
3,
2,
1
]
],
[
"reverse_in_place([4, 5])",
[
5,
4
]
],
[
"reverse_in_place([])",
[]
]
],
"why": "A swap changes two spots. The code copied the right item to the left, but never put the saved left item on the right, so [1, 2, 3] became [3, 2, 3]. Add `items[right] = saved`.",
"domain": "Two pointers",
"bugText": "        items[left] = items[right]"
},
{
"id": "o2",
"habit": "O",
"kind": "fix",
"fn": "count_groups",
"task": "There are `n` people, numbered 0 to `n - 1`. Each item `[a, b]` in `edges` links person a and person b. A group is everyone you can reach from one person through a chain of links, and a person with no links forms a group alone. Return how many groups there are. For example, `count_groups(4, [[0, 1], [1, 2], [0, 2]])` gives `2`. People 0, 1 and 2 are linked, so they form one group. Person 3 has no links and forms the second group.",
"code": "def count_groups(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            x = parent[x]\n        return x\n    groups = n\n    for a, b in edges:\n        root_a = find(a)\n        root_b = find(b)\n        if root_a != root_b:\n            groups -= 1\n    return groups",
"bug": [
12,
12
],
"fix": "            parent[root_a] = root_b\n            groups -= 1",
"tests": [
[
"count_groups(3, [[0, 1], [1, 0]])",
2
],
[
"count_groups(4, [[0, 1], [1, 2], [0, 2]])",
2
],
[
"count_groups(2, [])",
2
]
],
"why": "Joining two groups has two parts: link one root under the other, and lower the count. The code only lowered the count, so the same two groups were joined again by the next edge. Add `parent[root_a] = root_b`.",
"domain": "Graphs",
"jobs": [
[
3,
"walk up to the root"
],
[
8,
"join the two groups"
]
],
"bugText": "            groups -= 1"
},
{
"id": "o3",
"habit": "O",
"kind": "fix",
"fn": "join_cost",
"task": "Each number in `sticks` is the length of one stick. Joining two sticks makes one stick whose length is their total, and the join costs that total. Keep joining until one stick is left, always joining the two shortest sticks, and return the total cost. For example, `join_cost([2, 4, 3])` gives `14`. Join 2 and 3: the cost is 5, and the sticks are [4, 5]. Join 4 and 5: the cost is 9, and one stick is left. The total cost is 5 + 9 = 14.",
"code": "def join_cost(sticks):\n    heap = list(sticks)\n    heapq.heapify(heap)\n    cost = 0\n    while len(heap) > 1:\n        first = heapq.heappop(heap)\n        second = heapq.heappop(heap)\n        joined = first + second\n        cost += joined\n    return cost",
"bug": [
9,
9
],
"fix": "        cost += joined\n        heapq.heappush(heap, joined)",
"tests": [
[
"join_cost([2, 4, 3])",
14
],
[
"join_cost([1, 8, 3, 5])",
30
],
[
"join_cost([5])",
0
]
],
"why": "A join takes two sticks out and puts one new stick back. The joined stick never went back into the heap, so later joins skipped it. Add `heapq.heappush(heap, joined)`.",
"domain": "Heaps",
"jobs": [
[
5,
"join until one stick"
],
[
6,
"take the two cheapest"
]
],
"bugText": "        cost += joined"
},
{
"id": "o4",
"habit": "O",
"kind": "fix",
"fn": "reach_count",
"task": "There are `n` people, numbered 0 to `n - 1`. Each item `[a, b]` in `edges` links a and b both ways, so a can reach b and b can reach a. Return how many people `start` can reach through any chain of links, counting `start` itself. For example, `reach_count(3, [[0, 1], [2, 1]], 0)` gives `3`. Person 0 reaches 1. Person 1 reaches 2 through the link [2, 1]. So 0 reaches 0, 1 and 2, which makes 3 people.",
"code": "def reach_count(n, edges, start):\n    graph = {}\n    for node in range(n):\n        graph[node] = []\n    for a, b in edges:\n        graph[a].append(b)\n    seen = {start}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for other in graph[node]:\n            if other not in seen:\n                seen.add(other)\n                queue.append(other)\n    return len(seen)",
"bug": [
6,
6
],
"fix": "        graph[a].append(b)\n        graph[b].append(a)",
"tests": [
[
"reach_count(3, [[0, 1], [2, 1]], 0)",
3
],
[
"reach_count(3, [[1, 0]], 0)",
2
],
[
"reach_count(2, [], 1)",
1
]
],
"why": "A two-way link must go into both people's lists. The code only added `b` to `a`'s list, so the walk could not go from 1 back to 2. Add `graph[b].append(a)`.",
"domain": "Graphs",
"jobs": [
[
2,
"build the two-way graph"
],
[
9,
"walk out from start"
]
],
"bugText": "        graph[a].append(b)"
},
{
"id": "o5",
"habit": "O",
"kind": "fix",
"fn": "stack_mins",
"task": "Each item in `ops` is either a number or the word 'pop'. Start with an empty stack. A stack is a pile where you add and remove items only at the top. A number means push, which puts that number on top of the stack. 'pop' removes the number on top of the stack, which is the one added last. After every item, write down the smallest number on the stack, and return the list of these smallest numbers. The stack is never empty after a 'pop'. For example, `stack_mins([3, 1, 'pop'])` gives `[3, 1, 3]`. Push 3: the stack is [3], and the smallest is 3. Push 1: the stack is [3, 1], and the smallest is 1. 'pop' removes 1: the stack is [3], and the smallest is 3.",
"code": "def stack_mins(ops):\n    stack = []\n    mins = []\n    out = []\n    for op in ops:\n        if op == 'pop':\n            stack.pop()\n        else:\n            stack.append(op)\n            low = op\n            if mins:\n                low = min(low, mins[-1])\n            mins.append(low)\n        out.append(mins[-1])\n    return out",
"bug": [
7,
7
],
"fix": "            stack.pop()\n            mins.pop()",
"tests": [
[
"stack_mins([3, 1, 'pop'])",
[
3,
1,
3
]
],
[
"stack_mins([2, 5, 'pop'])",
[
2,
2,
2
]
],
[
"stack_mins([4, 2, 'pop', 1])",
[
4,
2,
4,
1
]
]
],
"why": "The code keeps two stacks: `stack` for the numbers and `mins` for the smallest so far. A pop must leave both. Only `stack` lost its top, so `mins` still said 1 after the 1 was gone. Add `mins.pop()`.",
"domain": "Stacks",
"jobs": [
[
6,
"pop from the stack"
],
[
8,
"push and save the min"
],
[
14,
"record the min"
]
],
"bugText": "            stack.pop()"
},
{
"id": "p9",
"habit": "P",
"kind": "fix",
"fn": "search_grid",
"task": "`grid` is a list of rows of numbers. Each row is sorted from smallest to largest, and each row's first number is bigger than the last number of the row above. So if you read the rows one after another, all the numbers are in sorted order. Return True if `target` is in the grid, and False if not. For example, `search_grid([[1, 3, 5, 7], [10, 11, 16, 20]], 11)` gives `True`, because 11 is in the second row.",
"code": "def search_grid(grid, target):\n    cols = 4\n    low = 0\n    high = len(grid) * cols - 1\n    while low <= high:\n        mid = (low + high) // 2\n        row = mid // cols\n        col = mid % cols\n        value = grid[row][col]\n        if value == target:\n            return True\n        if value < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return False",
"bug": [
2,
2
],
"fix": "    cols = len(grid[0])",
"tests": [
[
"search_grid([[1, 3, 5, 7], [10, 11, 16, 20]], 11)",
true
],
[
"search_grid([[1, 2], [3, 4]], 3)",
true
],
[
"search_grid([[1, 2, 3]], 4)",
false
]
],
"why": "The 4 came from the example grid, which has 4 columns. A grid with 2 columns then read the wrong spots or crashed. Use `cols = len(grid[0])`. For every number in your code, ask where it came from.",
"domain": "Binary search",
"jobs": [
[
2,
"the grid as one list"
],
[
7,
"turn mid into row and col"
],
[
10,
"found it"
]
],
"bugText": "    cols = 4"
},
{
"id": "p10",
"habit": "P",
"kind": "fix",
"fn": "coin_ways",
"task": "`coins` is a list of coin values, and you may use each value as many times as you like. Return how many different ways there are to make exactly `amount`. Two ways that use the same coins in a different order count as one way. For example, `coin_ways(11, [1, 5])` gives `3`. The three ways are eleven 1s, one 5 with six 1s, and two 5s with one 1.",
"code": "def coin_ways(amount, coins):\n    ways = [0] * 12\n    ways[0] = 1\n    stop = amount + 1\n    for coin in coins:\n        for goal in range(coin, stop):\n            rest = goal - coin\n            ways[goal] += ways[rest]\n    return ways[amount]",
"bug": [
2,
2
],
"fix": "    ways = [0] * (amount + 1)",
"tests": [
[
"coin_ways(15, [5, 10])",
2
],
[
"coin_ways(11, [1, 5])",
3
],
[
"coin_ways(3, [2])",
0
]
],
"why": "The 12 came from the example amount of 11. An amount of 15 needs 16 slots, so the code crashed. Use `[0] * (amount + 1)`.",
"domain": "Dynamic programming",
"bugText": "    ways = [0] * 12"
},
{
"id": "p11",
"habit": "P",
"kind": "fix",
"fn": "rotate",
"task": "`nums` is a list, and `k` is a whole number of 0 or more. Move every item `k` places to the right. An item pushed past the end wraps around to the front, and when `k` is bigger than the length of `nums`, items wrap around more than once. Return the new list. For example, `rotate([1, 2, 3, 4, 5, 6, 7], 3)` gives `[5, 6, 7, 1, 2, 3, 4]`. Each move of one place sends the last item to the front. After 1 move: [7, 1, 2, 3, 4, 5, 6]. After 2 moves: [6, 7, 1, 2, 3, 4, 5]. After 3 moves: [5, 6, 7, 1, 2, 3, 4].",
"code": "def rotate(nums, k):\n    shift = k % 7\n    cut = len(nums) - shift\n    return nums[cut:] + nums[:cut]",
"bug": [
2,
2
],
"fix": "    shift = k % len(nums)",
"tests": [
[
"rotate([1, 2, 3, 4, 5, 6, 7], 3)",
[
5,
6,
7,
1,
2,
3,
4
]
],
[
"rotate([1, 2, 3], 8)",
[
2,
3,
1
]
],
[
"rotate([1, 2], 5)",
[
2,
1
]
]
],
"why": "The 7 came from the example list, which holds 7 numbers. For a list of 3, the shift must wrap at 3, not 7. Use `k % len(nums)`.",
"domain": "Two pointers",
"bugText": "    shift = k % 7"
},
{
"id": "p12",
"habit": "P",
"kind": "fix",
"fn": "find_judge",
"task": "There are `n` people, numbered 1 to `n`. Each pair `[a, b]` in `trust` means person a trusts person b. The town judge is the one person who trusts nobody and whom everyone else trusts. Return the judge's number, or -1 if no person fits. For example, `find_judge(3, [[1, 3], [2, 3]])` gives `3`. Person 3 trusts nobody, and persons 1 and 2 both trust 3.",
"code": "def find_judge(n, trust):\n    score = [0] * (n + 1)\n    for a, b in trust:\n        score[a] -= 1\n        score[b] += 1\n    for person in range(1, n + 1):\n        if score[person] == 2:\n            return person\n    return -1",
"bug": [
7,
7
],
"fix": "        if score[person] == n - 1:",
"tests": [
[
"find_judge(3, [[1, 3], [2, 3]])",
3
],
[
"find_judge(2, [[1, 2]])",
2
],
[
"find_judge(4, [[1, 3], [2, 3], [4, 3]])",
3
]
],
"why": "The judge is trusted by everyone else, which is `n - 1` people. The 2 came from the example with 3 people, so any other size failed. Use `score[person] == n - 1`.",
"domain": "Graphs",
"bugText": "        if score[person] == 2:"
},
{
"id": "p13",
"habit": "P",
"kind": "fix",
"fn": "closest_points",
"task": "Each item in `points` is a point `[x, y]`. The value x * x + y * y measures how far a point is from (0, 0), and a smaller value means closer. Return the `k` closest points, sorted the way Python sorts lists, by x and then by y. For example, `closest_points([[3, 3], [5, -1], [-2, 4]], 2)` gives `[[-2, 4], [3, 3]]`. [3, 3] gives 9 + 9 = 18, [5, -1] gives 25 + 1 = 26, and [-2, 4] gives 4 + 16 = 20. The two closest are [3, 3] and [-2, 4], and sorted by x they are [[-2, 4], [3, 3]].",
"code": "def closest_points(points, k):\n    heap = []\n    for x, y in points:\n        dist = x * x + y * y\n        item = (-dist, x, y)\n        heapq.heappush(heap, item)\n        if len(heap) > 2:\n            heapq.heappop(heap)\n    out = []\n    for item in heap:\n        out.append([item[1], item[2]])\n    return sorted(out)",
"bug": [
7,
7
],
"fix": "        if len(heap) > k:",
"tests": [
[
"closest_points([[3, 3], [5, -1], [-2, 4]], 2)",
[
[
-2,
4
],
[
3,
3
]
]
],
[
"closest_points([[1, 3], [-2, 2]], 1)",
[
[
-2,
2
]
]
],
[
"closest_points([[0, 1], [2, 2], [1, 0]], 3)",
[
[
0,
1
],
[
1,
0
],
[
2,
2
]
]
]
],
"why": "The heap must keep `k` points, and `k` changes with every call. The 2 came from the example. Use `len(heap) > k`.",
"domain": "Heaps",
"jobs": [
[
4,
"distance squared"
],
[
7,
"keep only the closest"
],
[
9,
"collect the points"
]
],
"bugText": "        if len(heap) > 2:"
}
];
