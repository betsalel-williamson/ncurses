# Evidence: keyok(3X)

The raw output of `../../key-check.sh PREFIX keyok`, run on 2026-11-18 against the static library
built from this tree. `environment.txt` gives the versions and the source commit.

Every claim on the page holds, so the page is unchanged: keyok returns ERR for a key code of 0 or
below, for one with no binding, and for a key already in the requested state (cases 1-4, 6, 8).
Case 0, a call before any screen exists, also returns ERR (`ncurses/base/keyok.c:51-54`), as nearly
every curses function does; the page doesn't need to say so.

With two strings bound to KEY_F(1), disabling it moves both into the disabled tree (`keyok.c:77-90`),
so `\EOP` reads as ESC, 'O', 'P'; enabling it moves both back (`keyok.c:64-76`), and both read as 265.
