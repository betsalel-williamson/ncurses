# Resizing the terminal

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

When the user resizes a terminal emulator window, such as an xterm, the program running in it gets the signal `SIGWINCH`.

## `KEY_RESIZE`

Unless your program installs its own `SIGWINCH` handler before it calls `initscr()` or `newterm()`, ncurses installs one. The handler only notes that the size changed. The next time the program reads input with `wgetch()`, or refreshes, ncurses calls `resizeterm()` with the new size, and `wgetch()` then returns `KEY_RESIZE`.

`resizeterm()` resizes `stdscr` and `curscr`, and updates `LINES` and `COLS`. It also resizes your other windows, keeping each [subwindow](../../glossary/subwindow.md) within its parent, and pads `stdscr` with blanks if the screen grew. Its effect on those other windows may be less satisfactory, because it can't know how you want the screen repainted, and it can't resize [pads](../../glossary/pad.md) at all. You'll usually have to write code that handles `KEY_RESIZE` yourself: lay out the windows again with `wresize()` and `mvwin()`, or create them again, and repaint.

## Your own handler

A program with its own `SIGWINCH` handler can call `resizeterm()` too, but not from inside the handler: `resizeterm()` allocates memory, which isn't safe in a signal handler. Set a flag in the handler, and call `resizeterm()` from the program's main loop.

The standard way to handle `SIGWINCH`, which works even with some other vendors' curses libraries, is `endwin()` followed by `refresh()` and a repaint that you code yourself. The `refresh()` picks up the new screen size from the terminal. Its drawbacks are that it clears the screen to reinitialize the display, and that it doesn't resize subwindows that must shrink.

## `wresize()`

`wresize()` resizes a single window in place. It's an ncurses extension, as `resizeterm()` is.
