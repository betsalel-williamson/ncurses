# Evidence: keyok(3X)

The raw output of `../../key-check.sh PREFIX keyok`, run on 2026-11-18 against the static library
built from this tree. `environment.txt` gives the versions and the source commit.

Every case the page lists holds: ERR for a key code of 0 or below, for one with no binding, and for
a key already in the requested state (cases 1-4, 6, 8). The one case the page left out is a call
before any screen exists, which returns ERR (`ncurses/base/keyok.c:51-54`).

With two strings bound to KEY_F(1), disabling it moves both into the disabled tree (`keyok.c:77-90`),
so `\EOP` reads as ESC, 'O', 'P'; enabling it moves both back (`keyok.c:64-76`), and both read as 265.
