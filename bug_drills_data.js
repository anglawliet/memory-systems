window.DRILL_HABITS = {"A": "The tracker falls out of step with the pointers", "B": "Mixing up a position and a value, or a type and its methods", "C": "No fixed plan for shrinking the window", "E": "Using the wrong one of two similar names", "G": "The wrong comparison", "J": "A reversed direction or sign", "M": "Forgetting the \"nothing found\" return", "N": "Checking before the window is fixed", "O": "Doing only half of a two-part step", "P": "Hard-coding a value from the example"};
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"domain": "Algorithms",
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
"task": "Trace these lines by hand. What are the final values?",
"code": "window = {\"d\": 2, \"c\": 1}\nleft = 0\nright = 2\nsize = right - left + 1\nkinds = len(window)",
"ask": [
"size",
"kinds"
],
"why": "The value of `size` is the number of letters in the window, which is 3. The value of `len(window)` is the number of different letters, which is 2. They are easy to confuse because both sound like \"how big is the window\".",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "s = \"abca\"\nseen = set()\nleft = 0\nfor right in range(len(s)):\n    while s[right] in seen:\n        seen.remove(s[left])\n        left += 1\n    seen.add(s[right])",
"ask": [
"left",
"right",
"len(seen)"
],
"why": "At the last \"a\", the first \"a\" leaves. The value of `left` moves to 1. The set `seen` always holds exactly the letters from `left` to `right`. Those letters are b, c and a.",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "nums = [1, 0, 0, 1]\nk = 1\nzeros = 0\nleft = 0\nbest = 0\nfor right in range(len(nums)):\n    if nums[right] == 0:\n        zeros += 1\n    while zeros > k:\n        if nums[left] == 0:\n            zeros -= 1\n        left += 1\n    best = max(best, right - left + 1)",
"ask": [
"left",
"zeros",
"best"
],
"why": "At the second zero, `zeros` becomes 2, which is more than 1. The loop removes the 1 and then the first 0. The value of `left` ends at 2, and `zeros` returns to 1. The best window was [1, 0], with length 2. The window [0, 1] at the end also has length 2.",
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
"task": "Trace these lines by hand. What are the final values?",
"code": "nums = [5, 7, 9]\nleft = 1\nbest_left = nums[left]\nend = left + 2",
"ask": [
"best_left",
"end"
],
"why": "The value of `nums[left]` is 7, not the position 1. If `best_left` is a position used for slicing, it must be `left`.",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "nums = [2, 3, 1]\nk = 2\ntotal = 0\nsums = []\nfor right in range(len(nums)):\n    total += nums[right]\n    if right >= k:\n        total -= nums[right - k]\n    if right >= k - 1:\n        sums.append(total)",
"ask": [
"total",
"sums"
],
"why": "Use this order: add, fix, check. At `right = 2`, the 2 leaves before the sum is saved. So the second sum is 3 + 1 = 4.",
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
"task": "Trace these lines by hand. What are the final values?",
"code": "best = float(\"inf\")\nfound = best == float(\"-inf\")\nmissing = best == float(\"inf\")",
"ask": [
"found",
"missing"
],
"why": "The value of `best` starts at plus infinity. So it equals `float(\"inf\")`, not minus infinity. The \"nothing found\" check must use the same sign as the starting value.",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "s = \"AABAB\"\nk = 1\ncount = {}\nleft = 0\nbest = 0\nfor right in range(len(s)):\n    count[s[right]] = count.get(s[right], 0) + 1\n    while right - left + 1 - max(count.values()) > k:\n        count[s[left]] -= 1\n        left += 1\n    best = max(best, right - left + 1)",
"ask": [
"left",
"count[\"A\"]",
"best"
],
"why": "At the last \"B\", the window AABAB needs 2 changes. So the first \"A\" leaves. The window ABAB still needs 2 changes. So the second \"A\" also leaves. The value of `left` ends at 2, and the count of \"A\" is 1. The best window was AABA, with length 4.",
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
"task": "The function returns the area of a box given as (x1, y1, x2, y2), where x2 > x1 and y2 > y1.",
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
"why": "Width is the right edge minus the left edge, so it is `x2 - x1`. The line had the two sides reversed, which made every area negative.",
"domain": "Computer vision",
"bugText": "    width = x1 - x2"
},
{
"id": "v2",
"habit": "E",
"kind": "fix",
"fn": "overlap",
"task": "The function returns the overlap area of two boxes given as (x1, y1, x2, y2), or 0 if they do not touch.",
"code": "def overlap(a, b):\n    w = min(a[2], b[2]) - max(a[0], b[0])\n    h = min(a[3], b[3]) - max(a[0], b[1])\n    if w <= 0 or h <= 0:\n        return 0\n    return w * h",
"bug": [
3,
3
],
"fix": "    h = min(a[3], b[3]) - max(a[1], b[1])",
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
"why": "The height uses the y values, which sit at positions 1 and 3. The line copied `a[0]` from the width line above, so it mixed an x value into the height.",
"domain": "Computer vision",
"bugText": "    h = min(a[3], b[3]) - max(a[0], b[1])"
},
{
"id": "v3",
"habit": "B",
"kind": "fix",
"fn": "brightest_pixel",
"task": "The function returns the brightness at row y and column x of a grayscale image stored as a list of rows.",
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
"why": "An image is a list of rows, so the first index picks the row, which is `y`. The second index picks the column, which is `x`. Name what each index means before you use it.",
"domain": "Computer vision",
"bugText": "    row = image[x]\n    return row[y]"
},
{
"id": "v4",
"habit": "A",
"kind": "fix",
"fn": "rolling_brightness",
"task": "The function returns the average brightness of every group of k frames in a row.",
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
"why": "The frame `leaving` left the group, but `total` never lost it. Every time the window moves, the running total must drop the frame that left.",
"domain": "Computer vision",
"bugText": "            leaving = frames[right - k]"
},
{
"id": "v5",
"habit": "G",
"kind": "fix",
"fn": "motion_frames",
"task": "The function counts frames whose change from the previous frame is at least threshold.",
"code": "def motion_frames(levels, threshold):\n    count = 0\n    for i in range(1, len(levels)):\n        change = abs(levels[i] - levels[i - 1])\n        if change > threshold:\n            count += 1\n    return count",
"bug": [
5,
5
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
"task": "The function returns the k detections with the highest scores, highest first. Each detection is (label, score).",
"code": "def top_detections(dets, k):\n    ranked = sorted(dets, key=lambda d: d[1])\n    return ranked[:k]",
"bug": [
2,
2
],
"fix": "    ranked = sorted(dets, key=lambda d: d[1], reverse=True)",
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
"why": "`sorted` puts the smallest first. The highest scores come first only with `reverse=True`. Say the order out loud: \"highest first means reversed.\"",
"domain": "Computer vision",
"bugText": "    ranked = sorted(dets, key=lambda d: d[1])"
},
{
"id": "v7",
"habit": "M",
"kind": "fix",
"fn": "first_stable",
"task": "The function returns the first frame index where the object has been seen in 3 frames in a row, or -1 if that never happens.",
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
"why": "When the object is never stable, the loop ends without a return and Python gives back `None`. Right after the loop, write the \"never found\" answer.",
"domain": "Computer vision",
"bugText": "            return i"
},
{
"id": "v8",
"habit": "E",
"kind": "fix",
"fn": "clamp_box",
"task": "The function keeps a box (x1, y1, x2, y2) inside an image of the given width and height.",
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
"why": "The y values are limited by the height, not the width. The line was copied from the `x2` line above it, and one name stayed the same.",
"domain": "Computer vision",
"bugText": "    y2 = min(width, y2)"
},
{
"id": "s1",
"habit": "N",
"kind": "fix",
"fn": "allow",
"task": "A rate limiter. The function returns, for each request time, whether it is allowed. At most limit requests may happen in any window of seconds.",
"code": "def allow(times, limit, window):\n    recent = deque()\n    out = []\n    for t in times:\n        out.append(len(recent) < limit)\n        while recent and recent[0] <= t - window:\n            recent.popleft()\n        if out[-1]:\n            recent.append(t)\n    return out",
"bug": [
5,
7
],
"fix": "        while recent and recent[0] <= t - window:\n            recent.popleft()\n        out.append(len(recent) < limit)",
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
"why": "The order is add, fix, check. Old requests must leave the window before we decide. Here the decision came first, so expired requests still counted.",
"domain": "Backend",
"bugText": "        out.append(len(recent) < limit)\n        while recent and recent[0] <= t - window:\n            recent.popleft()"
},
{
"id": "s2",
"habit": "B",
"kind": "fix",
"fn": "count_hits",
"task": "The function counts how many requests each user made.",
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
"why": "A plain dictionary has no starting value for a new key, so `+= 1` raises KeyError. A Counter starts every new key at 0. This is the same crash as in Minimum Window Substring.",
"domain": "Backend",
"bugText": "    counts = {}"
},
{
"id": "s3",
"habit": "M",
"kind": "fix",
"fn": "first_error",
"task": "The function returns the line number of the first log line that starts with \"ERROR\", or -1 if there is none.",
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
"why": "A clean log never reaches `return i`, so the function returns `None`. Every search needs a \"not found\" line after the loop.",
"domain": "Backend",
"bugText": "            return i"
},
{
"id": "s4",
"habit": "N",
"kind": "fix",
"fn": "retry_delays",
"task": "The function returns the wait before each retry. The first wait is base seconds, and each wait doubles.",
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
"why": "Use the current wait first, then double it for next time. Doubling first skipped the base wait completely.",
"domain": "Backend",
"bugText": "        delay = delay * 2\n        out.append(delay)"
},
{
"id": "s5",
"habit": "G",
"kind": "fix",
"fn": "page_items",
"task": "The function returns page number page (pages start at 0) when each page holds size items.",
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
"why": "Pages start at 0 here, so page 0 starts at item 0, and the start is `page * size`. Check the first case by hand: page 0 must give the first items.",
"domain": "Backend",
"bugText": "    start = (page - 1) * size"
},
{
"id": "s6",
"habit": "G",
"kind": "fix",
"fn": "active_users",
"task": "The function counts users whose last activity was less than timeout seconds before now.",
"code": "def active_users(last_seen, now, timeout):\n    count = 0\n    for user in last_seen:\n        if now - last_seen[user] <= timeout:\n            count += 1\n    return count",
"bug": [
4,
4
],
"fix": "        if now - last_seen[user] < timeout:",
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
"why": "\"Less than timeout\" does not include the timeout itself, so the check is `<`. User b was exactly 10 seconds ago and must not count.",
"domain": "Backend",
"bugText": "        if now - last_seen[user] <= timeout:"
},
{
"id": "s7",
"habit": "E",
"kind": "fix",
"fn": "merge_events",
"task": "The function merges two lists of event times that are already sorted into one sorted list.",
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
"why": "After taking from `b`, its pointer `j` must move. The line was copied from the `a` branch above and still moved `i`.",
"domain": "Backend",
"bugText": "            i += 1"
},
{
"id": "s8",
"habit": "A",
"kind": "fix",
"fn": "unique_in_window",
"task": "The function returns, for each request id, whether it is new compared with the k requests just before it.",
"code": "def unique_in_window(ids, k):\n    recent = Counter()\n    out = []\n    for right in range(len(ids)):\n        if right > k:\n            old = ids[right - k - 1]\n        out.append(recent[ids[right]] == 0)\n        recent[ids[right]] += 1\n    return out",
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
"why": "The request `old` left the window, but its count stayed. The tracker must forget every request that slides out.",
"domain": "Backend",
"bugText": "            old = ids[right - k - 1]"
},
{
"id": "s9",
"habit": "B",
"kind": "fix",
"fn": "newer_version",
"task": "The function returns True if version a is newer than version b. Versions look like \"1.10.2\".",
"code": "def newer_version(a, b):\n    pa = a.split(\".\")\n    pb = b.split(\".\")\n    return pa > pb",
"bug": [
2,
3
],
"fix": "    pa = [int(x) for x in a.split(\".\")]\n    pb = [int(x) for x in b.split(\".\")]",
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
"why": "The parts are strings, and strings compare letter by letter, so \"10\" sorts before \"9\". Turn each part into a number before comparing.",
"domain": "Backend",
"bugText": "    pa = a.split(\".\")\n    pb = b.split(\".\")"
},
{
"id": "d1",
"habit": "E",
"kind": "fix",
"fn": "best_week",
"task": "The function returns the highest total sales in any 7 days in a row.",
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
"why": "The day leaving the week is `sales[right - 7]`. The line subtracted the day that just arrived, so the new day was added and then removed.",
"domain": "Data analytics",
"bugText": "            total -= sales[right]"
},
{
"id": "d2",
"habit": "E",
"kind": "fix",
"fn": "longest_goal_streak",
"task": "The function returns the longest run of days in a row with at least goal steps.",
"code": "def longest_goal_streak(steps, goal):\n    current = 0\n    best = 0\n    for s in steps:\n        if s >= goal:\n            current += 1\n            best = max(best, current)\n        else:\n            best = 0\n    return best",
"bug": [
9,
9
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
"why": "A missed day ends the current run, so `current` resets. Resetting `best` erased the record. Two names that sound alike hold very different things.",
"domain": "Data analytics",
"bugText": "            best = 0"
},
{
"id": "d3",
"habit": "E",
"kind": "fix",
"fn": "percent_change",
"task": "The function returns the percent change from old to new for each pair.",
"code": "def percent_change(pairs):\n    out = []\n    for old, new in pairs:\n        out.append((new - old) / new * 100)\n    return out",
"bug": [
4,
4
],
"fix": "        out.append((new - old) / old * 100)",
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
"why": "Percent change is measured against the starting value, so divide by `old`. Dividing by `new` gives a different number.",
"domain": "Data analytics",
"bugText": "        out.append((new - old) / new * 100)"
},
{
"id": "d4",
"habit": "B",
"kind": "fix",
"fn": "top_customer",
"task": "The function returns the name of the customer who spent the most.",
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
"why": "The task asks for the name, which is the key. `spend[name]` is the amount, the value. Say which one each variable holds.",
"domain": "Data analytics",
"bugText": "            best_name = spend[name]"
},
{
"id": "d5",
"habit": "A",
"kind": "fix",
"fn": "running_max_drop",
"task": "The function returns the biggest drop from an earlier peak to a later value.",
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
"why": "The tracker `peak` never learned about new highs, so every drop was measured from the first value. Each step, update what you track before you use it.",
"domain": "Finance",
"bugText": "        worst = max(worst, peak - v)"
},
{
"id": "f1",
"habit": "G",
"kind": "fix",
"fn": "first_overdraft",
"task": "The function returns the first day the balance goes below zero, or -1 if it never does.",
"code": "def first_overdraft(start, changes):\n    balance = start\n    for day, change in enumerate(changes):\n        balance += change\n        if balance <= 0:\n            return day\n    return -1",
"bug": [
5,
5
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
"task": "The function returns the best profit from buying on one day and selling on a later day.",
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
"why": "The tracker is the cheapest price, so it keeps the minimum. Using `max` kept the most expensive price instead.",
"domain": "Finance",
"bugText": "        cheapest = max(cheapest, p)"
},
{
"id": "r1",
"habit": "G",
"kind": "fix",
"fn": "spikes",
"task": "The function counts readings that jump by more than limit above the reading before them.",
"code": "def spikes(readings, limit):\n    count = 0\n    for i in range(len(readings)):\n        if readings[i + 1] - readings[i] > limit:\n            count += 1\n    return count",
"bug": [
3,
3
],
"fix": "    for i in range(len(readings) - 1):",
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
"why": "The loop reads `readings[i + 1]`, so `i` must stop one early. Check the last step by hand: when `i` is the last index, `i + 1` does not exist.",
"domain": "Sensors",
"bugText": "    for i in range(len(readings)):"
},
{
"id": "r2",
"habit": "A",
"kind": "fix",
"fn": "max_window_temp",
"task": "The function returns the highest average temperature over any k readings in a row.",
"code": "def max_window_temp(temps, k):\n    total = sum(temps[:k])\n    best = total\n    for right in range(k, len(temps)):\n        total += temps[right]\n        best = max(best, total)\n    return best / k",
"bug": [
5,
5
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
"why": "The window gained a reading but never lost one, so it kept growing. A fixed window adds the new reading and drops the oldest one in the same step.",
"domain": "Sensors",
"bugText": "        total += temps[right]"
},
{
"id": "r3",
"habit": "J",
"kind": "fix",
"fn": "last_n",
"task": "The function returns the last n sensor readings, oldest first.",
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
"why": "`readings[:n]` takes from the front. The last items come from the back, which is `readings[-n:]`.",
"domain": "Sensors",
"bugText": "    return readings[:n]"
},
{
"id": "q1",
"habit": "N",
"kind": "predict",
"task": "Trace this rate limiter by hand. What are the values when it ends?",
"code": "times = [1, 2, 3, 12]\nwindow = 10\nrecent = []\nfor t in times:\n    while recent and recent[0] <= t - window:\n        recent.pop(0)\n    recent.append(t)",
"ask": [
"len(recent)",
"recent[0]"
],
"why": "At time 12, every time up to 2 has left the 10-second window, so 1 and 2 are removed. That leaves 3 and 12.",
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
"task": "Trace these lines by hand. What are the values at the end?",
"code": "box = (2, 1, 6, 4)\nx1, y1, x2, y2 = box\nwidth = x2 - x1\nheight = y2 - y1\narea = width * height",
"ask": [
"width",
"height",
"area"
],
"why": "Width is right minus left, 6 - 2 = 4. Height is bottom minus top, 4 - 1 = 3. So the area is 12.",
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
"task": "Trace these lines by hand. What are the values at the end?",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "frames = [4, 8, 6, 2]\nk = 2\ntotal = 0\naverages = []\nfor right in range(len(frames)):\n    total += frames[right]\n    if right >= k:\n        total -= frames[right - k]\n    if right >= k - 1:\n        averages.append(total / k)",
"ask": [
"total",
"averages"
],
"why": "Each step adds the new frame and drops the one k steps back. The last window is 6 and 2, so `total` is 8.",
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
"task": "Trace this loop by hand. What are the values when it ends?",
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
"task": "Trace this loop by hand. What are the values when it ends?",
"code": "steps = [9, 9, 1, 9]\ngoal = 5\ncurrent = 0\nbest = 0\nfor s in steps:\n    if s >= goal:\n        current += 1\n        best = max(best, current)\n    else:\n        current = 0",
"ask": [
"current",
"best"
],
"why": "The day with 1 step resets `current`, but `best` keeps the record of 2. The last day starts a new run of 1.",
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
"task": "The function smashes the two heaviest stones until at most one is left, then returns its weight, or 0.",
"code": "def last_stone(stones):\n    heap = [-s for s in stones]\n    heapq.heapify(heap)\n    for _ in range(len(stones)):\n        if len(heap) < 2:\n            break\n        first = -heapq.heappop(heap)\n        second = -heap[0]\n        if first != second:\n            heapq.heappush(heap, -(first - second))\n    return -heap[0] if heap else 0",
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
"why": "A smash uses two stones, so both must leave the heap. Reading `heap[0]` only peeks, so the second stone stayed in the heap. Pop twice, then push back only the difference. This is the slip from Last Stone Weight on 20 November.",
"domain": "Heaps",
"bugText": "        second = -heap[0]"
},
{
"id": "h2",
"habit": "P",
"kind": "fix",
"fn": "kth_largest",
"task": "The function returns the k-th largest number in nums.",
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
"why": "The heap must keep k numbers, and k changes from call to call. The 3 came from the example. Read every number in your code and ask where it came from. This is the slip from Kth Largest in a Stream on 20 November.",
"domain": "Heaps",
"bugText": "        if len(heap) > 3:"
},
{
"id": "q7",
"habit": "O",
"kind": "predict",
"task": "Trace these lines by hand. What are the values at the end?",
"code": "import heapq\nheap = [-8, -7, -4, -2]\nheapq.heapify(heap)\nfirst = -heapq.heappop(heap)\nsecond = -heap[0]\nsize = len(heap)",
"ask": [
"first",
"second",
"size"
],
"why": "`heap[0]` looks at the top without removing it. Only `heappop` removes a stone, so after one pop and one peek the heap still holds 3 stones.",
"domain": "Heaps",
"answers": [
"8",
"7",
"3"
]
}
];
