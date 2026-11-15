# color pair

A **color pair** couples a foreground color with a background color. curses applies colors to characters only in pairs. After `start_color()`, `init_pair(n, fg, bg)` defines pair `n`, and `COLOR_PAIR(n)` turns the pair number into an [attribute](attribute.md) to use with `attron()` or in a [chtype](chtype.md).

Pair 0 is the terminal's default colors. `start_color()` sets it up, and ncurses lets a program change it only through `assume_default_colors()`. `COLORS` and `COLOR_PAIRS` hold how many colors and pairs the terminal supports. See [`curs_color`](../../man/curs_color.3x).
