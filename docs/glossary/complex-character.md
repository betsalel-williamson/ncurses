# complex character

A **complex character** (type `cchar_t`) is how the [wide-character library](wide-character-library.md) stores one cell of a [window](window.md). It holds one spacing character and zero or more non-spacing characters, such as combining accents, each a `wchar_t`, together with [attributes](attribute.md) and a [color pair](color-pair.md) in separate fields. It plays the part that [chtype](chtype.md) plays in the 8-bit library.

`cchar_t` is a structure, so build one with `setcchar()` and read it with `getcchar()` rather than with bit masks. See [`curs_getcchar`](../../man/curs_getcchar.3x).
