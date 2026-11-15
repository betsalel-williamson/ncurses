# terminal type

The **terminal type** is the name of a [terminfo](terminfo.md) entry, such as `xterm-256color` or `vt100`, that tells curses what kind of terminal the program runs on. curses reads it from the `TERM` environment variable when the program calls `initscr()`, and `newterm()` can take it as an argument. A wrong `TERM` gives wrong output: missing colors, garbled lines or keys that don't work.

Terminal emulators set `TERM` themselves, and `tset` can help when the right value isn't clear. `toe` lists the types the database holds. See [`term`](../../man/term.7).
