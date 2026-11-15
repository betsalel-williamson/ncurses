# Some notes of caution

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Prefer `getstr()` to `noraw()` and `nocbreak()`

If you find yourself thinking you need `noraw()` or `nocbreak()`, think again and move carefully. It's probably better design to use `getstr()` or one of its relatives to simulate cooked mode. `noraw()` and `nocbreak()` try to restore cooked mode, but they may end up clobbering some control bits set before your application started. They're also likely to hurt your application's usability with other curses libraries.

## Don't mix `stdscr` with other windows

Bear in mind that `refresh()` is a synonym for `wrefresh(stdscr)`. Don't mix [`stdscr`](../../glossary/stdscr.md) with [windows](../../glossary/window.md) created by `newwin()`: a `refresh()` call will blow them off the screen. Use `subwin()` instead, or don't touch `stdscr` at all. Tile the screen with your own windows, call `wnoutrefresh()` for each of them in your program's event loop, and trigger the actual repainting with a single `doupdate()` call. [Windows and the screen](../windows/windows-and-refresh.md) explains how these calls work together.

## Prefer tiled windows to overlapping ones

You're much less likely to run into problems if you lay out your screens with tiled rather than overlapping windows. Historically, curses support for overlapping windows has been weak, fragile and poorly documented, and ncurses isn't yet an exception to this rule. The [panels library](../panels/index.md), part of the ncurses distribution, does a good job of strengthening the overlapping-windows facilities. [Compatibility with older versions](compatibility.md#refresh-of-overlapping-windows) describes one difference between libraries.

## Prefer `getmaxyx()` to `LINES` and `COLS`

Try to avoid the global variables `LINES` and `COLS`. Use `getmaxyx()` on `stdscr` instead. Your code may be ported to an environment where windows can be resized, or where several screens are open with different sizes.

## Painting quickly

Use the `addchstr()` family of functions to paint text quickly when you know the text contains no control characters. Try to change [attributes](../../glossary/attribute.md) on your screens infrequently.

Don't use `immedok()`. It makes every change to the window, such as `waddch()`, call `wrefresh()` at once, which can degrade performance considerably when writes are frequent.
