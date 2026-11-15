# keypad mode

**Keypad mode** makes curses turn the [escape sequences](escape-sequence.md) that function keys send into single key codes, such as `KEY_LEFT` or `KEY_F(1)`, which `getch()` returns as values above 255. Without it the program reads the raw bytes of each sequence. `keypad(win, TRUE)` turns it on for one [window](window.md); most programs call `keypad(stdscr, TRUE)`.

curses learns which sequences each key sends from the [terminal type](terminal-type.md) description. To tell the Escape key from the start of a sequence, it waits briefly after an Escape for more input. See [`curs_inopts`](../../man/curs_inopts.3x) and [`curs_getch`](../../man/curs_getch.3x).
