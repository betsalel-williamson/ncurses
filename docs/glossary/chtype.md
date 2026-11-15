# chtype

A **`chtype`** is the integer type that holds one cell of a [window](window.md) in the 8-bit library: a character code combined with [attributes](attribute.md) and a [color pair](color-pair.md) number. ncurses uses eight bits for the character, so a `chtype` can't hold most Unicode characters. Combine the parts with `|`, for example `'x' | A_BOLD | COLOR_PAIR(1)`, and take them apart with the masks `A_CHARTEXT`, `A_ATTRIBUTES` and `A_COLOR`.

The [wide-character library](wide-character-library.md) stores each cell as a [complex character](complex-character.md) instead. See [`ncurses`](../../man/ncurses.3x) and [`curs_addch`](../../man/curs_addch.3x).
