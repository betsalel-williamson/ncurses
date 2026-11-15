# stdscr

**`stdscr`**, the standard screen, is the [window](window.md) that `initscr()` creates. It is the size of the terminal, and it is always available. The functions without a `w` prefix work on it: `addch(ch)` is `waddch(stdscr, ch)`, and `refresh()` is `wrefresh(stdscr)`.

Don't confuse it with `curscr`, which is the library's copy of what the terminal shows (see [virtual screen](virtual-screen.md)). See [`curs_initscr`](../../man/curs_initscr.3x) and the naming conventions in [`ncurses`](../../man/ncurses.3x).
