# window

A **window** is a rectangular grid of character cells that a curses program writes to and reads from, with its own cursor and its own settings such as attributes and the background. Cells are addressed by line and column, written (y, x), with (0, 0) at the window's upper left corner. A `WINDOW *` pointer names a window in the library's functions.

A window lives in memory. Writing to it changes nothing on the terminal until the program refreshes it, which copies it to the [virtual screen](virtual-screen.md) and then to the terminal. [stdscr](stdscr.md) is the window that is always available. A [subwindow](subwindow.md) shares its parent's cells, a [pad](pad.md) can be larger than the screen, and a [panel](panel.md) gives a window a place in a stack so that windows can overlap.

Plain curses doesn't manage overlapping windows. A program either uses `stdscr` as one window that fills the screen or tiles the screen with windows that don't overlap. See [`curs_window`](../../man/curs_window.3x).
