# terminal capability

A **terminal capability** is one fact about a [terminal type](terminal-type.md), recorded in its [terminfo](terminfo.md) entry. A capability is a boolean (such as `am`, the terminal wraps at the right margin), a number (such as `cols`, the number of columns) or a string (such as `cup`, the [escape sequence](escape-sequence.md) that moves the cursor). Each has a short name used in terminfo source and a longer C name, such as `cursor_address` for `cup`, plus a two-letter [termcap](termcap.md) code.

The low-level functions `tigetflag()`, `tigetnum()` and `tigetstr()` read capabilities directly, and `tput` reads them from the shell. See [`terminfo`](../../man/terminfo.head) and [`curs_terminfo`](../../man/curs_terminfo.3x).
