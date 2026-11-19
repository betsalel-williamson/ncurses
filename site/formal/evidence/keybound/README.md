# Evidence: keybound(3X)

The raw output of `../../key-check.sh PREFIX keybound`, run on 2026-11-18 against the static library
built from this tree. `environment.txt` gives the versions and the source commit.

The check binds three strings to KEY_F(1), after terminfo's `\EOP`, in the order `\E[zz1`,
`\E[aa2`, `\EOz3`.

- Newest first, as the page said, would give `\EOz3`, `\E[aa2`, `\E[zz1`, `\EOP`.
- Oldest first would give `\EOP`, `\E[zz1`, `\E[aa2`, `\EOz3`.
- keybound gives `\EOP`, `\EOz3`, `\E[zz1`, `\E[aa2`: the strings under `\EO` first, then those under
  `\E[`, which is the order of a depth-first walk of the tree of bound strings
  (`ncurses/base/tries.c:51-85`).

Every binding yields KEY_F(1) on input, not only the one at count 0. Out-of-range counts, key code
0, negative key codes and calls before newterm return NULL (`ncurses/base/keybound.c:44-53`).
