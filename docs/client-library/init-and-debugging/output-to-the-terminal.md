# Output to the terminal

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## `refresh()` and `wrefresh(win)`

These functions must be called to put any output on the terminal, since other routines only change data structures. `wrefresh()` copies the named [window](../../glossary/window.md) to the terminal screen, taking into account what is already there in order to send as little as it can. `refresh()` does the same for `stdscr`. Unless `leaveok()` has been turned on, the terminal's cursor is left where the window's cursor is.

## `doupdate()` and `wnoutrefresh(win)`

These two functions update several windows more efficiently than `wrefresh()`. To use them, it helps to know how curses works. Besides the window structures, curses keeps two data structures for the terminal screen: a physical screen, describing what is on the screen now, and a [virtual screen](../../glossary/virtual-screen.md), describing what the program wants on the screen.

`wrefresh()` first copies the named window to the virtual screen with `wnoutrefresh()`, and then calls `doupdate()` to update the terminal. A series of `wrefresh()` calls for several windows alternates `wnoutrefresh()` and `doupdate()`, which sends several bursts of output to the screen. Calling `wnoutrefresh()` for each window and then `doupdate()` once sends a single burst, with fewer characters in all, and avoids a visible flicker at each update.
