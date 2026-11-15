---
title: "Style tips for developers"
sidebar:
  order: 11
---

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

See the `TO-DO` file in the top-level directory of the source distribution for additions that would be particularly useful.

The prefix `_nc_` should be used on library public functions that are not part of the curses API in order to prevent pollution of the application namespace. If you have to add to or modify the function prototypes in `curses.h.in`, read `ncurses/base/MKlib_gen.sh` first so you can avoid breaking XSI conformance. Please join the ncurses mailing list; see [how to report bugs](/ncurses/contributing/hackguide/reporting-bugs/), or the `INSTALL` file in the top level of the distribution, for details on the list.

Look for the string `FIXME` in source files to tag minor bugs and potential problems that could use fixing.

Don't try to auto-detect OS features in the main body of the C code. That's the job of the configuration system.

To hold down complexity, do make your code data-driven. Especially, if you can drive logic from a table filtered out of `include/Caps`, do it. If you find you need to augment the data in that file in order to generate the proper table, that is still preferable to ad-hoc code: that's why the seventh column (flags) is there.

Have fun!
