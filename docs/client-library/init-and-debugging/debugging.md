# Debugging with traces

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

> **Note:** These functions aren't part of the standard curses interface.

The trace functions are normally available only in the debugging library, such as `libncurses_g.a` or `libncursesw_g.a`, or in a library built with the `TRACE` symbol defined. The `curs_trace(3X)` manual page lists them all.

## `curses_trace()`

`curses_trace()` sets the trace level, and returns the previous one. While the level isn't zero, the library writes a report on what it does to a file called `trace` in the current directory. If that file already exists, no tracing is done. Higher trace levels give more detailed reports: the level is a combination of the `TRACE_` values defined in `curses.h`, which the manual page describes. Setting the environment variable `NCURSES_TRACE` to a trace level turns tracing on too, as if `curses_trace()` were called.

`curses_trace()` replaces the older `trace()`, whose name often conflicted with functions in applications. Without tracing in the library, `curses_trace()` does nothing and returns 0.

## `_tracef()`

`_tracef()` writes your own debugging information to the same `trace` file. It's used like `printf()`, but writes a newline after its output.

## Reading trace files

Trace files can be hard to read because of the sheer volume of data in them. The script `test/tracemunch` in the ncurses distribution helps somewhat: it compacts long sequences of similar operations into single-line pseudo-operations. These pseudo-operations are named in capital letters.
