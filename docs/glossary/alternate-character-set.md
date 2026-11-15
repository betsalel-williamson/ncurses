# alternate character set

The **alternate character set** (ACS) is a set of line-drawing and other graphic characters that the DEC VT100 introduced and many terminals copy. curses names them with constants such as `ACS_HLINE`, `ACS_VLINE` and `ACS_ULCORNER`, and `box()` and `border()` draw with them. The [terminal type](terminal-type.md) description says how to show each one, and curses falls back to ASCII characters such as `-` and `+` when the description doesn't define a character.

The [wide-character library](wide-character-library.md) has matching `WACS_` constants. See the forms-drawing characters section of [`curs_addch`](../../man/curs_addch.3x).
