# Building with EMX on OS/2

> Adapted from `README.emx`, by Thomas Dickey.

You can build ncurses on OS/2 in the EMX environment, but you must build and acquire tools. Not all of the tools distributed with EMX work properly, and some additional ones are required.

The configure script distributed with ncurses won't run as-is in EMX. You can generate a new one if you have autoconf built for EMX. You'll need the EMX development tools, of course. Get these programs to start:

- GNU m4 (version 1.4)
- GNU autoconf (version 2.13)
- GNU patch (version 2.5)

Apply the autoconf patches from <https://invisible-island.net/autoconf> or <ftp://ftp.invisible-island.net/autoconf>. In date order, they are:

1. `autoconf-2.13-20030927.patch.gz`
2. `autoconf-2.13-20030927-emx.patch.gz`

I built my development environment for ncurses using EMX 0.9c at the end of 1997. Much of the EMX patch for autoconf was done originally by J.J.G. Ripoll, using a similar environment (he prefers the `ash` shell). Newer versions may fix these problems:

- The pdksh program distributed at Hobbes and Leo (with a 1996 date) is defective. It doesn't process "here documents" correctly, which makes it useless for running the autoconf script. I built my own copy of pdksh 5.2.13, which has the bug corrected (documented in the change log for pdksh).
- I also built the cmp and diff programs from source, because the distributed binaries didn't work.

Other required utilities, such as ar, cat, chmod, cp, gawk, grep, mv, ls, rm, mkdir, sed, sort and tr, worked.

Once you have autoconf patched and installed, run `autoconf` from the top-level directory of ncurses to generate the EMX-specific configure script.

> **Note:** The configure script in this distribution needs autoconf 2.52 with Thomas Dickey's patches (`AC_PREREQ(2.52.20210101)` in `configure.in`), not autoconf 2.13. The 2.13 patches above predate that requirement.
