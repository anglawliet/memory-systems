window.DRILL_HABITS = {"A": "The tracker falls out of step with the pointers", "B": "Mixing up a position and a value, or a type and its methods", "C": "No fixed plan for shrinking the window", "E": "Using the wrong one of two similar names", "G": "The wrong comparison", "J": "A reversed direction or sign", "M": "Forgetting the \"nothing found\" return", "N": "Checking before the window is fixed", "O": "Doing only half of a two-part step", "P": "Hard-coding a value from the example"};
window.DRILLS = [
{
"id": "e1",
"habit": "E",
"kind": "fix",
"fn": "window_sums",
"task": "Add up every group of `k` numbers in a row in `nums`. Return the list of sums. For example, `window_sums([1, 2, 3, 4], 2)` gives `[3, 5, 7]`, because 1 + 2, 2 + 3 and 3 + 4.",
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
"bugText": "            total -= added"
},
{
"id": "e2",
"habit": "E",
"kind": "fix",
"fn": "distinct_counts",
"task": "For every group of `k` letters in a row in `s`, count how many different letters it has. Return the list of counts. For example, `distinct_counts('aab', 2)` gives `[1, 2]`, because \"aa\" has 1 different letter and \"ab\" has 2.",
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
"bugText": "            window[letter] -= 1"
},
{
"id": "e3",
"habit": "E",
"kind": "fix",
"fn": "has_anagram",
"task": "Return True if `s2` has a group of letters in a row that uses exactly the letters of `s1`, in any order. Otherwise return False. For example, `has_anagram('adc', 'dcda')` gives `True`, because \"cda\" uses the same letters as \"adc\".",
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
"bugText": "        if len(window) > len(s1):"
},
{
"id": "e4",
"habit": "E",
"kind": "fix",
"fn": "max_profit",
"task": "Each number in `prices` is the price on one day. Buy on one day, sell on a later day, and return the biggest profit, or 0 if no sale makes money. For example, `max_profit([7, 1, 5, 3, 6, 4])` gives `5`, because buying at 1 and selling at 6 makes 5.",
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
"task": "Return the length of the longest group of letters in a row in `s` where no letter repeats. For example, `longest_unique('abcabcbb')` gives `3`, because \"abc\" has no repeat.",
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
"bugText": "        seen.add(s[left])"
},
{
"id": "a1",
"habit": "A",
"kind": "fix",
"fn": "has_anagram",
"task": "Return True if `s2` has a group of letters in a row that uses exactly the letters of `s1`, in any order. Otherwise return False. For example, `has_anagram('ab', 'aab')` gives `True`, because \"ab\" appears in \"aab\".",
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
"bugText": "            gone = s2[right - len(s1)]"
},
{
"id": "a2",
"habit": "A",
"kind": "fix",
"fn": "longest_replace",
"task": "You may change up to `k` letters. Return the length of the longest group of letters in a row in `s` that can become all one letter. For example, `longest_replace('ABA', 0)` gives `1`, because with no changes, each group can be only one letter long.",
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
"bugText": "            left += 1\n            count[s[left]] -= 1"
},
{
"id": "a3",
"habit": "A",
"kind": "fix",
"fn": "max_profit",
"task": "Each number in `prices` is the price on one day. Buy on one day, sell on a later day, and return the biggest profit, or 0 if no sale makes money. For example, `max_profit([7, 1, 5, 3, 6, 4])` gives `5`, because buying at 1 and selling at 6 makes 5.",
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
"task": "You may change up to `k` letters. Return the length of the longest group of letters in a row in `s` that can become all one letter. For example, `longest_replace('AABABBA', 1)` gives `4`, because changing one letter turns \"AABA\" into \"AAAA\".",
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
"bugText": "            count[left] -= 1"
},
{
"id": "b2",
"habit": "B",
"kind": "fix",
"fn": "longest_unique",
"task": "Return the length of the longest group of letters in a row in `s` where no letter repeats. For example, `longest_unique('abcb')` gives `3`, because \"abc\" has no repeat.",
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
"bugText": "            seen.pop(s[left])"
},
{
"id": "b3",
"habit": "B",
"kind": "fix",
"fn": "shortest_slice",
"task": "Find the shortest group of numbers in a row in `nums` whose sum is at least `target`. Return that group as a list. For example, `shortest_slice([2, 3, 1, 2, 4, 3], 7)` gives `[4, 3]`, because 4 + 3 = 7, and no single number reaches 7.",
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
"bugText": "                best_left = nums[left]"
},
{
"id": "g1",
"habit": "G",
"kind": "fix",
"fn": "longest_ones",
"task": "Each number in `nums` is 0 or 1. Return the length of the longest group of numbers in a row that has at most `k` zeros. For example, `longest_ones([1, 1, 0, 0, 1], 1)` gives `3`, because [1, 1, 0] has one zero.",
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
"bugText": "        while zeros >= k:"
},
{
"id": "g2",
"habit": "G",
"kind": "fix",
"fn": "count_small",
"task": "Count the groups of `k` numbers in a row in `nums` whose sum is at most `limit`. For example, `count_small([1, 2, 3, 1], 2, 4)` gives `2`, because 1 + 2 = 3 and 3 + 1 = 4 are at most 4, but 2 + 3 = 5 is not.",
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
"bugText": "            if total == limit:"
},
{
"id": "g3",
"habit": "G",
"kind": "fix",
"fn": "window_sums",
"task": "Add up every group of `k` numbers in a row in `nums`. Return the list of sums. For example, `window_sums([1, 2, 3, 4], 2)` gives `[3, 5, 7]`, because 1 + 2, 2 + 3 and 3 + 4.",
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
"bugText": "        if right > k:"
},
{
"id": "g4",
"habit": "G",
"kind": "fix",
"fn": "longest_replace",
"task": "You may change up to `k` letters. Return the length of the longest group of letters in a row in `s` that can become all one letter. For example, `longest_replace('AAAA', 2)` gives `4`, because \"AAAA\" is already all one letter.",
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
"bugText": "        if size - most == k:"
},
{
"id": "j1",
"habit": "J",
"kind": "fix",
"fn": "longest_unique",
"task": "Return the length of the longest group of letters in a row in `s` where no letter repeats. For example, `longest_unique('abcb')` gives `3`, because \"abc\" has no repeat.",
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
"bugText": "            left -= 1"
},
{
"id": "j2",
"habit": "J",
"kind": "fix",
"fn": "count_vowels",
"task": "Return how many vowels `s` has. For example, `count_vowels('banana')` gives `3`.",
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
"task": "Return the length of the shortest group of numbers in a row in `nums` whose sum is at least `target`, or 0 if no group reaches it. For example, `shortest_len([1, 1], 5)` gives `0`, because the whole list only adds up to 2.",
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
"bugText": "    if best == float('-inf'):"
},
{
"id": "j4",
"habit": "J",
"kind": "fix",
"fn": "window_max",
"task": "For every group of `k` numbers in a row in `nums`, find the biggest number. Return the list of biggest numbers. For example, `window_max([5, 1, 3], 3)` gives `[5]`.",
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
"bugText": "            queue.popleft()"
},
{
"id": "m1",
"habit": "M",
"kind": "fix",
"fn": "has_sum",
"task": "Return True if some group of `k` numbers in a row in `nums` adds up to exactly `target`. Otherwise return False. For example, `has_sum([1, 2, 3], 2, 5)` gives `True`, because 2 + 3 = 5.",
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
"task": "Return the first letter in `s` that shows up a second time, or an empty string if no letter repeats. For example, `first_repeat('abca')` gives `'a'`.",
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
"task": "Return True if `s2` has a group of letters in a row that uses exactly the letters of `s1`, in any order. Otherwise return False. For example, `has_anagram('ab', 'eidbaooo')` gives `True`, because \"ba\" uses the same letters as \"ab\".",
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
"bugText": "        if window == need:\n            return True\n        if right >= len(s1):\n            gone = s2[right - len(s1)]\n            window[gone] -= 1"
},
{
"id": "n2",
"habit": "N",
"kind": "fix",
"fn": "shortest_len",
"task": "Return the length of the shortest group of numbers in a row in `nums` whose sum is at least `target`, or 0 if no group reaches it. For example, `shortest_len([2, 3, 1, 2, 4, 3], 7)` gives `2`, because 4 + 3 = 7.",
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
"bugText": "            total -= nums[left]\n            left += 1\n            size = right - left + 1\n            best = min(best, size)"
},
{
"id": "c1",
"habit": "C",
"kind": "fix",
"fn": "longest_unique",
"task": "Return the length of the longest group of letters in a row in `s` where no letter repeats. For example, `longest_unique('aaccca')` gives `2`, because \"ac\" has no repeat.",
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
"bugText": "        if s[right] in seen:"
},
{
"id": "p1",
"habit": "A",
"kind": "predict",
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "The box is given by two corners, (x1, y1) and (x2, y2), where x2 is bigger than x1 and y2 is bigger than y1. Return the area of the box. For example, `box_area((0, 0, 4, 3))` gives `12`, because the box is 4 wide and 3 tall.",
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
"task": "Each box is given by two corners, (x1, y1, x2, y2). Return the area where the two boxes overlap, or 0 if they do not overlap. For example, `overlap((0, 0, 4, 4), (2, 2, 6, 6))` gives `4`, because the boxes share a 2 by 2 square.",
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
"bugText": "    y1 = max(a[0], b[1])"
},
{
"id": "v3",
"habit": "B",
"kind": "fix",
"fn": "brightest_pixel",
"task": "The image is a list of rows, and each row is a list of brightness values. Return the brightness at column `x` of row `y`. For example, `brightest_pixel([[1, 2, 3], [4, 5, 6]], 2, 1)` gives `6`, because row 1 is [4, 5, 6], and column 2 of it is 6.",
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
"task": "Each number in `frames` is the brightness of one video frame. Return the average brightness of every group of `k` frames in a row. For example, `rolling_brightness([10, 20, 30, 40], 2)` gives `[15, 25, 35]`, because (10 + 20) / 2 = 15, and so on.",
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
"bugText": "            leaving = frames[right - k]"
},
{
"id": "v5",
"habit": "G",
"kind": "fix",
"fn": "motion_frames",
"task": "Each number in `levels` is the brightness of one frame. Count the frames whose brightness changed by at least `threshold` from the frame before. For example, `motion_frames([0, 5, 5, 12], 5)` gives `2`, because 0 to 5 and 5 to 12 both change by at least 5.",
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
"bugText": "        if change > threshold:"
},
{
"id": "v6",
"habit": "J",
"kind": "fix",
"fn": "top_detections",
"task": "Each detection is a pair of a label and a score. Return the `k` detections with the highest scores, highest first. For example, `top_detections([('cat', 0.2), ('dog', 0.9), ('car', 0.5)], 2)` gives `[['dog', 0.9], ['car', 0.5]]`.",
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
"task": "Each item in `seen` is True when the camera saw the object in that frame. Return the index of the first frame that completes 3 sightings in a row, or -1 if that never happens. For example, `first_stable([True, True, False, True, True, True])` gives `5`, because frames 3, 4 and 5 are the first 3 sightings in a row.",
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
"task": "Move any edge of the box (x1, y1, x2, y2) that sticks out, so the box fits inside an image that is `width` wide and `height` tall. Return the new box. For example, `clamp_box((-5, -5, 50, 50), 40, 30)` gives `[0, 0, 40, 30]`, because the left and top edges move up to 0, and the right and bottom edges move in to 40 and 30.",
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
"task": "Each number in `times` is the second when a request arrived. Allow at most `limit` requests in any `window` seconds. Return True or False for each request. For example, `allow([1, 2, 3, 12], 2, 10)` gives `[True, True, False, True]`, because the request at second 3 would be the third one inside 10 seconds.",
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
"bugText": "        ok = len(recent) < limit\n        out.append(ok)\n        while recent:\n            if recent[0] > cutoff:\n                break\n            recent.popleft()"
},
{
"id": "s2",
"habit": "B",
"kind": "fix",
"fn": "count_hits",
"task": "Each item in `users` is the name of the user who made one request. Return how many requests each user made. For example, `dict(count_hits(['ann', 'bo', 'ann']))` gives `{'ann': 2, 'bo': 1}`.",
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
"task": "Return the index of the first line in `lines` that starts with \"ERROR\", or -1 if no line does. For example, `first_error(['INFO ok', 'ERROR disk', 'ERROR net'])` gives `1`, because line 0 is INFO and line 1 is the first ERROR.",
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
"task": "Return the wait before each of the `attempts` retries. The first wait is `base` seconds, and each later wait is twice the one before. For example, `retry_delays(1, 3)` gives `[1, 2, 4]`, because the waits are 1, then 2, then 4.",
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
"task": "Split `items` into pages of `size` items each. The first page is page 0. Return the items on page `page`. For example, `page_items([1, 2, 3, 4, 5], 0, 2)` gives `[1, 2]`, because page 0 holds the first 2 items.",
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
"task": "The dictionary `last_seen` holds the second each user was last active. Count the users who were active less than `timeout` seconds before `now`. For example, `active_users({'a': 95, 'b': 90, 'c': 50}, 100, 10)` gives `1`, because only user a, at 95, was active less than 10 seconds before 100.",
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
"task": "The lists `a` and `b` each hold event times in sorted order. Return one sorted list with all the times. For example, `merge_events([1, 4], [2, 3])` gives `[1, 2, 3, 4]`.",
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
"bugText": "            i += 1"
},
{
"id": "s8",
"habit": "A",
"kind": "fix",
"fn": "unique_in_window",
"task": "For each request id in `ids`, return True if it differs from all of the `k` ids just before it, and False if it matches one of them. For example, `unique_in_window(['a', 'b', 'a', 'a'], 1)` gives `[True, True, True, False]`, because the last \"a\" matches the \"a\" just before it.",
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
"bugText": "            old = ids[right - k - 1]"
},
{
"id": "s9",
"habit": "B",
"kind": "fix",
"fn": "newer_version",
"task": "Versions look like \"1.10.2\". Return True if version `a` is newer than version `b`. For example, `newer_version('1.10', '1.9')` gives `True`, because 10 is bigger than 9.",
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
"task": "Each number in `sales` is one day's sales. Return the highest total over any 7 days in a row. For example, `best_week([1, 1, 1, 1, 1, 1, 1, 9])` gives `15`, because the last 7 days add up to 6 + 9.",
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
"bugText": "            total -= sales[right]"
},
{
"id": "d2",
"habit": "E",
"kind": "fix",
"fn": "longest_goal_streak",
"task": "Each number in `steps` is one day's step count. Return the most days in a row that reached at least `goal` steps. For example, `longest_goal_streak([9, 9, 1, 9], 5)` gives `2`, because the first two days both reach 5.",
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
"bugText": "            best = 0"
},
{
"id": "d3",
"habit": "E",
"kind": "fix",
"fn": "percent_change",
"task": "Each pair holds an old value and a new value. Return the percent change from old to new for each pair. For example, `percent_change([(100, 150)])` gives `[50]`, because going from 100 to 150 is a 50 percent rise.",
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
"task": "The dictionary `spend` holds how much each customer spent. Return the name of the customer who spent the most. For example, `top_customer({'ann': 30, 'bo': 80})` gives `'bo'`.",
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
"task": "Return the biggest drop from a high value to any later, lower value in `values`. For example, `running_max_drop([3, 8, 2, 5])` gives `6`, because the values drop from 8 down to 2.",
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
"task": "The balance starts at `start`, and each number in `changes` is one day's change. Return the first day the balance drops below zero, or -1 if it never does. For example, `first_overdraft(10, [-10, -1])` gives `1`, because the balance is 0 after day 0 and -1 after day 1.",
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
"task": "Each number in `prices` is the price on one day. Buy on one day, sell on a later day, and return the biggest profit, or 0 if no sale makes money. For example, `max_profit_day([7, 1, 5, 3, 6, 4])` gives `5`, because buying at 1 and selling at 6 makes 5.",
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
"task": "Count the readings that are more than `limit` higher than the reading just before them. For example, `spikes([1, 9, 9, 20], 5)` gives `2`, because 1 to 9 and 9 to 20 both jump by more than 5.",
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
"task": "Return the highest average temperature over any `k` readings in a row. For example, `max_window_temp([1, 2, 3, 4], 2)` gives `3.5`, because (3 + 4) / 2 = 3.5.",
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
"task": "Return the last `n` readings, oldest first. For example, `last_n([1, 2, 3, 4], 2)` gives `[3, 4]`.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Run this loop in your head, one step at a time. Then type the value of each name when the loop ends.",
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
"task": "Each turn, smash the two heaviest stones. Equal stones both break, and different stones leave one stone that weighs the difference. Return the weight of the last stone, or 0 if no stone is left. For example, `last_stone([2, 7, 4, 1, 8, 1])` gives `1`, because 8 and 7 leave 1, 4 and 2 leave 2, 2 and 1 leave 1, 1 and 1 break, and 1 is left.",
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
"bugText": "        second = -heap[0]"
},
{
"id": "h2",
"habit": "P",
"kind": "fix",
"fn": "kth_largest",
"task": "Return the `k`-th largest number in `nums`. For example, `kth_largest([3, 2, 1, 5, 6, 4], 2)` gives `5`, because the largest is 6 and the second largest is 5.",
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
"task": "Run these lines in your head, one at a time. Then type the value of each name at the end.",
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
}
];
