# The forms and menu libraries

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The forms and menu libraries should work reliably in any environment you can port ncurses to. The only portability issue anywhere in them is what flavor of regular expressions the built-in form field type `TYPE_REGEXP` will recognize.

The configuration code prefers the POSIX regex facility (`regcomp()` and `regexec()` from `regex.h`), but will settle for the older `compile()` and `step()` interface from `regexp.h` or `regexpr.h` if the former is not available.

Historical note: the panels code was written primarily to assist in porting u386mon 2.0 (comp.sources.misc v14i001-4) to systems lacking panels support; u386mon 2.10 and beyond use it. This version has been slightly cleaned up for ncurses.
