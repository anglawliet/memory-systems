window.DRILL_HABITS = {"A": "The tracker falls out of step with the pointers", "B": "Mixing up a position and a value, or a type and its methods", "C": "No fixed plan for shrinking the window", "E": "Using the wrong one of two similar names", "G": "The wrong comparison", "J": "A reversed direction or sign", "M": "Forgetting the \"nothing found\" return", "N": "Checking before the window is fixed"};
window.DRILLS = [
{
"id": "e1",
"habit": "E",
"kind": "fix",
"fn": "window_sums",
"task": "The function returns the sum of each window of k numbers in a row.",
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
"why": "The number leaving the window is `gone`. Subtract `gone` from `total`. The line was copied from `total += added` above it, but one name was not changed.",
"bugText": "            total -= added"
},
{
"id": "e2",
"habit": "E",
"kind": "fix",
"fn": "distinct_counts",
"task": "The function returns the number of different letters in each window of k letters.",
"code": "def distinct_counts(s, k):\n    window = Counter()\n    out = []\n    for right in range(len(s)):\n        letter = s[right]\n        window[letter] += 1\n        if right >= k:\n            gone = s[right - k]\n            window[letter] -= 1\n        if right >= k - 1:\n            out.append(sum(1 for c in window.values() if c > 0))\n    return out",
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
"why": "The letter leaving the window is `gone`. Lower its count. The remove line copied `window[letter] += 1`, but the name was not changed. This is the exact slip from Minimum Window on 19 November.",
"bugText": "            window[letter] -= 1"
},
{
"id": "e3",
"habit": "E",
"kind": "fix",
"fn": "has_anagram",
"task": "The function returns True if a window of s2 has exactly the letters of s1 in any order.",
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
"why": "The value of `len(window)` is the number of different letters in the dictionary. It is not the number of letters in the window. For \"dcd\" it is 2, not 3. The window length is `right - left + 1`.",
"bugText": "        if len(window) > len(s1):"
},
{
"id": "e4",
"habit": "E",
"kind": "fix",
"fn": "max_profit",
"task": "The function returns the best profit from buying on one day and selling on a later day.",
"code": "def max_profit(prices):\n    cheapest = prices[0]\n    best = 0\n    for price in prices:\n        cheapest = min(cheapest, price)\n        profit = price - cheapest\n        best = max(best, profit)\n    return profit",
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
"why": "The value of `profit` is only today's profit. The value of `best` is the biggest profit seen so far. The function must return `best`.",
"bugText": "    return profit"
},
{
"id": "e5",
"habit": "E",
"kind": "fix",
"fn": "longest_unique",
"task": "The function returns the length of the longest part of s with no repeated letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[left])\n        best = max(best, right - left + 1)\n    return best",
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
"why": "The letter joining the window is `s[right]`. The line copied `seen.remove(s[left])` from two lines above. This is the first mistake in the log, from 14 November.",
"bugText": "        seen.add(s[left])"
},
{
"id": "a1",
"habit": "A",
"kind": "fix",
"fn": "has_anagram",
"task": "The function returns True if a window of s2 has exactly the letters of s1 in any order.",
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
"why": "The letter `gone` left the window, but its count did not go down. The tracker `window` must change whenever the window loses a letter. The same line was missing in Minimum Window on 18 November.",
"bugText": "            gone = s2[right - len(s1)]"
},
{
"id": "a2",
"habit": "A",
"kind": "fix",
"fn": "longest_replace",
"task": "The function returns the longest window that needs at most k letter changes to become all one letter.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        while right - left + 1 - max(count.values()) > k:\n            left += 1\n            count[s[left]] -= 1\n        best = max(best, right - left + 1)\n    return best",
"bug": [
8,
9
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
"why": "Moving `left` first makes `s[left]` the next letter. It is not the letter leaving. Lower the count of the letter at `left` first. Then move `left`.",
"bugText": "            left += 1\n            count[s[left]] -= 1"
},
{
"id": "a3",
"habit": "A",
"kind": "fix",
"fn": "max_profit",
"task": "The function returns the best profit from buying on one day and selling on a later day.",
"code": "def max_profit(prices):\n    cheapest = prices[0]\n    best = 0\n    for price in prices:\n        profit = price - cheapest\n        best = max(best, profit)\n    return best",
"bug": [
5,
5
],
"fix": "        cheapest = min(cheapest, price)\n        profit = price - cheapest",
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
"why": "The loop moves to a new day, but `cheapest` never changes. Every profit is measured from day 0. Each time the loop moves, ask which tracker must learn about the new item.",
"bugText": "        profit = price - cheapest"
},
{
"id": "b1",
"habit": "B",
"kind": "fix",
"fn": "longest_replace",
"task": "The function returns the longest window that needs at most k letter changes to become all one letter.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        while right - left + 1 - max(count.values()) > k:\n            count[left] -= 1\n            left += 1\n        best = max(best, right - left + 1)\n    return best",
"bug": [
8,
8
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
"why": "The value of `left` is a position, such as 2. The counts use letters as keys. Use `s[left]`, the letter at that position.",
"bugText": "            count[left] -= 1"
},
{
"id": "b2",
"habit": "B",
"kind": "fix",
"fn": "longest_unique",
"task": "The function returns the length of the longest part of s with no repeated letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.pop(s[left])\n            left += 1\n        seen.add(s[right])\n        best = max(best, right - left + 1)\n    return best",
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
"why": "The value of `seen` is a set. A set's `pop()` takes no value and removes a random item. Use `remove` to remove one chosen item from a set. Name the type before choosing the method.",
"bugText": "            seen.pop(s[left])"
},
{
"id": "b3",
"habit": "B",
"kind": "fix",
"fn": "shortest_slice",
"task": "The function returns the shortest run of numbers with a sum of at least target.",
"code": "def shortest_slice(nums, target):\n    total = 0\n    left = 0\n    best_left, best_size = 0, len(nums) + 1\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            if right - left + 1 < best_size:\n                best_left, best_size = nums[left], right - left + 1\n            total -= nums[left]\n            left += 1\n    return nums[best_left:best_left + best_size]",
"bug": [
9,
9
],
"fix": "                best_left, best_size = left, right - left + 1",
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
"why": "The value of `best_left` must be a position because the return line uses it for slicing. The value of `nums[left]` is the number at that position.",
"bugText": "                best_left, best_size = nums[left], right - left + 1"
},
{
"id": "g1",
"habit": "G",
"kind": "fix",
"fn": "longest_ones",
"task": "The function returns the longest window with at most k zeros.",
"code": "def longest_ones(nums, k):\n    zeros = 0\n    left = 0\n    best = 0\n    for right in range(len(nums)):\n        if nums[right] == 0:\n            zeros += 1\n        while zeros >= k:\n            if nums[left] == 0:\n                zeros -= 1\n            left += 1\n        best = max(best, right - left + 1)\n    return best",
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
"why": "\"At most k zeros\" means k zeros is allowed. The window is invalid only when `zeros > k`. Using `>=` removes a window with exactly k zeros.",
"bugText": "        while zeros >= k:"
},
{
"id": "g2",
"habit": "G",
"kind": "fix",
"fn": "count_small",
"task": "The function counts the windows of k numbers with a sum of at most limit.",
"code": "def count_small(nums, k, limit):\n    total = 0\n    found = 0\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1 and total == limit:\n            found += 1\n    return found",
"bug": [
8,
8
],
"fix": "        if right >= k - 1 and total <= limit:",
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
"why": "\"At most limit\" means `<=`. The check `== limit` counts only windows that equal the limit. Read the problem's words. Choose the matching comparison.",
"bugText": "        if right >= k - 1 and total == limit:"
},
{
"id": "g3",
"habit": "G",
"kind": "fix",
"fn": "window_sums",
"task": "The function returns the sum of each window of k numbers in a row.",
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
"why": "The first number leaves when `right` reaches k. For k = 2, the window has 3 numbers at `right = 2`. The value `nums[0]` must leave then. Try the first moment by hand: `right = k`.",
"bugText": "        if right > k:"
},
{
"id": "g4",
"habit": "G",
"kind": "fix",
"fn": "longest_replace",
"task": "The function returns the longest window that needs at most k letter changes to become all one letter.",
"code": "def longest_replace(s, k):\n    count = Counter()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        count[s[right]] += 1\n        size = right - left + 1\n        if size - max(count.values()) == k:\n            best = max(best, size)\n        while right - left + 1 - max(count.values()) > k:\n            count[s[left]] -= 1\n            left += 1\n    return best",
"bug": [
8,
8
],
"fix": "        if size - max(count.values()) <= k:",
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
"why": "A window is valid when it needs at most k changes. \"AAAA\" needs 0 changes. Since 0 is not equal to 2, `== k` skipped it. This is the slip from 19 November at 3:08 AM.",
"bugText": "        if size - max(count.values()) == k:"
},
{
"id": "j1",
"habit": "J",
"kind": "fix",
"fn": "longest_unique",
"task": "The function returns the length of the longest part of s with no repeated letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left -= 1\n        seen.add(s[right])\n        best = max(best, right - left + 1)\n    return best",
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
"why": "The window shrinks from the left. The value of `left` moves forward toward `right`. Say the direction out loud: \"shrink means `left` goes up.\"",
"bugText": "            left -= 1"
},
{
"id": "j2",
"habit": "J",
"kind": "fix",
"fn": "count_vowels",
"task": "The function counts the vowels in s.",
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
"why": "Read nested calls from the inside out. First find the length of `s`. Then make a range of that length. The call `range(s)` fails because `s` is a string.",
"bugText": "    for i in len(range(s)):"
},
{
"id": "j3",
"habit": "J",
"kind": "fix",
"fn": "shortest_len",
"task": "The function returns the length of the shortest run with a sum of at least target, or 0 if none exists.",
"code": "def shortest_len(nums, target):\n    total = 0\n    left = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            best = min(best, right - left + 1)\n            total -= nums[left]\n            left += 1\n    return 0 if best == float('-inf') else best",
"bug": [
11,
11
],
"fix": "    return 0 if best == float('inf') else best",
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
"why": "The value of `best` starts at plus infinity. So \"nothing found\" means it is still `float('inf')`. The check used minus infinity, which has the reversed sign. This is the slip from 19 November at 6:15 AM.",
"bugText": "    return 0 if best == float('-inf') else best"
},
{
"id": "j4",
"habit": "J",
"kind": "fix",
"fn": "window_max",
"task": "The function returns the biggest number in each window of k numbers.",
"code": "def window_max(nums, k):\n    queue = deque()\n    out = []\n    for right in range(len(nums)):\n        while queue and nums[queue[-1]] < nums[right]:\n            queue.popleft()\n        queue.append(right)\n        if queue[0] <= right - k:\n            queue.popleft()\n        if right >= k - 1:\n            out.append(nums[queue[0]])\n    return out",
"bug": [
6,
6
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
"why": "Remove smaller numbers from the back. This is where the new number arrives. The method `pop()` removes from the back. The method `popleft()` removes from the front.",
"bugText": "            queue.popleft()"
},
{
"id": "m1",
"habit": "M",
"kind": "fix",
"fn": "has_sum",
"task": "The function returns True if a window of k numbers adds up to target. It returns False if none does.",
"code": "def has_sum(nums, k, target):\n    total = 0\n    for right in range(len(nums)):\n        total += nums[right]\n        if right >= k:\n            total -= nums[right - k]\n        if right >= k - 1 and total == target:\n            return True",
"bug": [
8,
8
],
"fix": "            return True\n    return False",
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
"why": "When the loop ends without finding a window, the function reaches the end and returns `None`. Right after writing a loop, write the line for \"nothing found\".",
"bugText": "            return True"
},
{
"id": "m2",
"habit": "M",
"kind": "fix",
"fn": "first_repeat",
"task": "The function returns the first letter that appears twice, or an empty string if no letter repeats.",
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
"why": "The loop returns only when it finds a repeat. If no repeat exists, Python returns `None`, not \"\". Ask: what do I return when the loop finds nothing?",
"bugText": "        seen.add(letter)"
},
{
"id": "n1",
"habit": "N",
"kind": "fix",
"fn": "has_anagram",
"task": "The function returns True if a window of s2 has exactly the letters of s1 in any order.",
"code": "def has_anagram(s1, s2):\n    need = Counter(s1)\n    window = Counter()\n    for right in range(len(s2)):\n        window[s2[right]] += 1\n        if window == need:\n            return True\n        if right >= len(s1):\n            window[s2[right - len(s1)]] -= 1\n    return False",
"bug": [
6,
9
],
"fix": "        if right >= len(s1):\n            window[s2[right - len(s1)]] -= 1\n        if window == need:\n            return True",
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
"why": "The order inside the loop is add, fix, check. Here, the check ran when the window was one letter too long. The correct window was never compared. This is the slip from 19 November at 5:58 AM.",
"bugText": "        if window == need:\n            return True\n        if right >= len(s1):\n            window[s2[right - len(s1)]] -= 1"
},
{
"id": "n2",
"habit": "N",
"kind": "fix",
"fn": "shortest_len",
"task": "The function returns the length of the shortest run with a sum of at least target, or 0 if none exists.",
"code": "def shortest_len(nums, target):\n    total = 0\n    left = 0\n    best = float('inf')\n    for right in range(len(nums)):\n        total += nums[right]\n        while total >= target:\n            total -= nums[left]\n            left += 1\n            best = min(best, right - left + 1)\n    return 0 if best == float('inf') else best",
"bug": [
8,
10
],
"fix": "            best = min(best, right - left + 1)\n            total -= nums[left]\n            left += 1",
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
"why": "Save the window while it is still valid. Do this before shrinking it. Here, `best` was saved after `left` moved. It measured a window that might no longer reach the target.",
"bugText": "            total -= nums[left]\n            left += 1\n            best = min(best, right - left + 1)"
},
{
"id": "c1",
"habit": "C",
"kind": "fix",
"fn": "longest_unique",
"task": "The function returns the length of the longest part of s with no repeated letter.",
"code": "def longest_unique(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right in range(len(s)):\n        if s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[right])\n        best = max(best, right - left + 1)\n    return best",
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
"why": "Removing one letter may not remove the repeat. For \"abcb\", removing \"a\" still leaves the first \"b\". Use `while` to shrink until the repeat is gone.",
"bugText": "        if s[right] in seen:"
},
{
"id": "p1",
"habit": "A",
"kind": "predict",
"task": "Trace these lines by hand. What are the final values?",
"code": "s = \"abb\"\ncount = {\"a\": 1, \"b\": 2}\nleft = 0\nleft += 1\ncount[s[left]] -= 1",
"ask": [
"left",
"count[\"a\"]",
"count[\"b\"]"
],
"why": "The value of `left` moved first. So `s[left]` is the letter after the one that should leave. The count of \"b\" went down, and \"a\" stayed at 1. This is why the count must go down before `left` moves.",
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
"task": "Trace these lines by hand. What are the final values?",
"code": "window = {\"d\": 2, \"c\": 1}\nleft = 0\nright = 2\nsize = right - left + 1\nkinds = len(window)",
"ask": [
"size",
"kinds"
],
"why": "The value of `size` is the number of letters in the window, which is 3. The value of `len(window)` is the number of different letters, which is 2. They are easy to confuse because both sound like \"how big is the window\".",
"answers": [
"3",
"2"
]
},
{
"id": "p3",
"habit": "A",
"kind": "predict",
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "s = \"abca\"\nseen = set()\nleft = 0\nfor right in range(len(s)):\n    while s[right] in seen:\n        seen.remove(s[left])\n        left += 1\n    seen.add(s[right])",
"ask": [
"left",
"right",
"len(seen)"
],
"why": "At the last \"a\", the first \"a\" leaves. The value of `left` moves to 1. The set `seen` always holds exactly the letters from `left` to `right`. Those letters are b, c and a.",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "nums = [1, 0, 0, 1]\nk = 1\nzeros = 0\nleft = 0\nbest = 0\nfor right in range(len(nums)):\n    if nums[right] == 0:\n        zeros += 1\n    while zeros > k:\n        if nums[left] == 0:\n            zeros -= 1\n        left += 1\n    best = max(best, right - left + 1)",
"ask": [
"left",
"zeros",
"best"
],
"why": "At the second zero, `zeros` becomes 2, which is more than 1. The loop removes the 1 and then the first 0. The value of `left` ends at 2, and `zeros` returns to 1. The best window was [1, 0], with length 2. The window [0, 1] at the end also has length 2.",
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
"task": "Trace these lines by hand. What are the final values?",
"code": "nums = [5, 7, 9]\nleft = 1\nbest_left = nums[left]\nend = left + 2",
"ask": [
"best_left",
"end"
],
"why": "The value of `nums[left]` is 7, not the position 1. If `best_left` is a position used for slicing, it must be `left`.",
"answers": [
"7",
"3"
]
},
{
"id": "p6",
"habit": "N",
"kind": "predict",
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "nums = [2, 3, 1]\nk = 2\ntotal = 0\nsums = []\nfor right in range(len(nums)):\n    total += nums[right]\n    if right >= k:\n        total -= nums[right - k]\n    if right >= k - 1:\n        sums.append(total)",
"ask": [
"total",
"sums"
],
"why": "Use this order: add, fix, check. At `right = 2`, the 2 leaves before the sum is saved. So the second sum is 3 + 1 = 4.",
"answers": [
"4",
"[5, 4]"
]
},
{
"id": "p7",
"habit": "J",
"kind": "predict",
"task": "Trace these lines by hand. What are the final values?",
"code": "best = float(\"inf\")\nfound = best == float(\"-inf\")\nmissing = best == float(\"inf\")",
"ask": [
"found",
"missing"
],
"why": "The value of `best` starts at plus infinity. So it equals `float(\"inf\")`, not minus infinity. The \"nothing found\" check must use the same sign as the starting value.",
"answers": [
"False",
"True"
]
},
{
"id": "p8",
"habit": "A",
"kind": "predict",
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "s = \"AABAB\"\nk = 1\ncount = {}\nleft = 0\nbest = 0\nfor right in range(len(s)):\n    count[s[right]] = count.get(s[right], 0) + 1\n    while right - left + 1 - max(count.values()) > k:\n        count[s[left]] -= 1\n        left += 1\n    best = max(best, right - left + 1)",
"ask": [
"left",
"count[\"A\"]",
"best"
],
"why": "At the last \"B\", the window AABAB needs 2 changes. So the first \"A\" leaves. The window ABAB still needs 2 changes. So the second \"A\" also leaves. The value of `left` ends at 2, and the count of \"A\" is 1. The best window was AABA, with length 4.",
"answers": [
"2",
"1",
"4"
]
}
];
