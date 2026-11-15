# termcap

**termcap** is the older terminal description format, from BSD Unix. It kept every terminal in one text file, usually `/etc/termcap`, and named [capabilities](terminal-capability.md) with two-letter codes. [terminfo](terminfo.md) replaced it in System V with a compiled database and longer names.

ncurses provides the termcap functions, such as `tgetent()` and `tgetstr()`, for older programs, and answers them from the terminfo database. Built with `--enable-termcap`, it can also read a termcap file when there is no terminfo entry. `captoinfo` converts termcap entries to terminfo source. See [`curs_termcap`](../../man/curs_termcap.3x).
