# Evidence: define_key(3X)

The raw output of `../../key-check.sh`, run on 2026-11-18 against the static library built
from this tree. `environment.txt` gives the versions and the source commit.

| Case | Result | Code |
| --- | --- | --- |
| Before any screen exists | ERR | `ncurses/base/define_key.c:45-46` |
| `NULL` and a key code with no binding (5) | ERR | `define_key.c:42`, `:58-61` |
| A definition with no binding and a key code of 0 (6) | ERR | `define_key.c:73-75` |
| `NULL` and 0 (8) | ERR, as the page said | `define_key.c:74` |
| A prefix of bound strings, or a bound string plus more (9, 10) | ERR | `define_key.c:63-71`; `ncurses/base/key_defined.c:39-61` |
| An empty definition (11) | ERR | `ncurses/tinfo/add_tries.c:57-58` |
| A string already bound to another code (3, 12) | OK, and the binding moves | `define_key.c:56-57` |
| A key code above 65535 (14) | OK, but the code is stored modulo 65536: wgetch returns 1003 for 66539 | `ncurses/curses.priv.h:347`; `add_tries.c:72`; see issue #83 |
