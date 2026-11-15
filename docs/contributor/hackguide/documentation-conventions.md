# Documentation conventions

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

There are three kinds of documentation associated with this package. Each has a different preferred format:

- Package-internal files (`README`, `INSTALL`, `TO-DO` and so on)
- Manual pages
- Everything else (that is, narrative documentation)

Our conventions are simple:

1. **Maintain package-internal files in plain text.** The expected viewer for them is `more(1)` or an editor window; there is no point in elaborate mark-up.
2. **Mark up manual pages in the man macros.** These have to be viewable through traditional `man(1)` programs.
3. **Write everything else in HTML.**

When in doubt, HTMLize a master and use `lynx(1)` to generate plain ASCII (as we do for the announcement document).

The reason for choosing HTML is that it is (a) well-adapted for on-line browsing through viewers that are everywhere; (b) more easily readable as plain text than most other mark-ups, if you don't have a viewer; and (c) carries enough information that you can generate a nice-looking printed version from it. Also, of course, it makes exporting things like the announcement document to the web pretty trivial.
