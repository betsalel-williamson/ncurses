# terminfo

**terminfo** is the database that describes terminals, and the library interface that reads it. Each [terminal type](terminal-type.md) has an entry listing its [capabilities](terminal-capability.md): its size, its colors, and the [escape sequences](escape-sequence.md) for each operation and key. curses reads the entry for `TERM` when it starts and uses it for everything it sends.

Entries are written in a text source format and compiled by `tic` into a binary file per terminal, kept under a directory such as `/usr/share/terminfo`. The `TERMINFO` and `TERMINFO_DIRS` environment variables add other places to look. `infocmp` prints an entry back as source. terminfo replaced [termcap](termcap.md) in System V. See [`terminfo`](../../man/terminfo.head) and [`tic`](../../man/tic.1m).
