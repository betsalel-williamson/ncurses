# Evidence: key_defined(3X)

The raw output of `../../key-check.sh PREFIX key-defined`, run on 2026-11-18 against the static
library built from this tree. `environment.txt` gives the versions and the source commit.

| Case | Result | Code |
| --- | --- | --- |
| Before any screen exists | -1 | `ncurses/base/key_defined.c:72-77` (`code = ERR` unless there is a screen and a string) |
| `NULL` (9) | -1 | the same lines |
| A prefix of bound strings (4, 5) | -1, as the page said | `key_defined.c:48-49` |
| A bound string plus more characters (6, 7) | the bound string's key code | `key_defined.c:50-52`: the recursion into an empty child returns `OK`, so the parent's value is returned |
| An empty or unbound string (3, 8, 10) | 0 | `key_defined.c:43-45`, `:46-59` |

Case 6 is also listed in issue #83: key_defined reports `\EOPx` as bound to KEY_F(1).
