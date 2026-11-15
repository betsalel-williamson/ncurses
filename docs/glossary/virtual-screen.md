# virtual screen

Besides its [windows](window.md), curses keeps two pictures of the whole terminal: the **physical screen**, what the terminal shows now, and the **virtual screen**, what the program wants it to show. `wnoutrefresh()` copies a window's changed lines to the virtual screen. `doupdate()` compares the two and sends the terminal only what differs. `wrefresh()` does both steps for one window.

A program that changes several windows calls `wnoutrefresh()` for each and then `doupdate()` once, which sends one burst of output instead of several. ncurses names the two pictures `curscr` (the physical screen) and `newscr` (the virtual screen). `wrefresh(curscr)` clears the terminal and repaints it, which helps after something else has written to it. See [`curs_refresh`](../../man/curs_refresh.3x).
