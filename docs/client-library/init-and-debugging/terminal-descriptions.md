# Terminal descriptions without curses

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## `setupterm(term, filedes, errret)`

`setupterm()` reads a terminal's description from the terminfo database without setting up the curses screen structures or changing the terminal's modes. A program that needs only the terminal's capabilities, for example to send a few escape sequences, can call it in place of `initscr()`.

- `term` is the name of the terminal type. If it's `NULL`, `setupterm()` uses the value of `TERM` in the environment.
- `filedes` is the file descriptor of the terminal used for output.
- `errret` points to an integer where `setupterm()` stores a status.

If `setupterm()` returns `OK`, the status is 1. If it returns `ERR`, the status says why:

| Status | Meaning |
| --- | --- |
| 1 | The terminal is a hard-copy type, which curses can't use. |
| 0 | The terminal type wasn't found, or it's a generic type with too little information for curses. |
| -1 | The terminfo database wasn't found. |

`errret` can also be `NULL`, meaning no status is wanted. Then, if something goes wrong, `setupterm()` prints an error message and exits instead of returning. So a simple program can call `setupterm(NULL, 1, NULL)` and not worry about initialization errors.

After the call, the global variable `cur_term` points to the current terminal's capabilities. A program can use two or more terminals by calling `setupterm()` for each one and switching between them with `set_curterm()`, which sets `cur_term` and returns its old value. `setupterm()` also copies the names section of the terminal description into the global array `ttytype[]`. Later calls overwrite that array, so save it yourself if you need it.
