# wide-character library

The **wide-character library**, `ncursesw`, is the configuration of ncurses that handles characters wider than a byte, such as UTF-8 text. It adds functions that take `wchar_t` strings and [complex characters](complex-character.md). Most are named by adding `_w` to the 8-bit name, so `waddch()` becomes `wadd_wch()`; the `addwstr()` and `inwstr()` families add only `w`, as in `waddwstr()`. The 8-bit configuration, `ncurses`, stores each cell as a [chtype](chtype.md).

Link with `-lncursesw`, define `_XOPEN_SOURCE_EXTENDED` or `NCURSES_WIDECHAR` before including `curses.h` so that the wide declarations are visible, and call `setlocale(LC_ALL, "")` before `initscr()`. Since ncurses 6.5 the wide-character library is what `configure` builds by default. See [`ncurses`](../../man/ncurses.3x).
