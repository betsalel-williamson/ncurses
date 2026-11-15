# Initialization and wrapup

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## `initscr()`

The first function called should almost always be `initscr()`. It determines the [terminal type](../../glossary/terminal-type.md) and initializes the curses data structures. `initscr()` also arranges that the first call to `refresh()` clears the screen. If an error occurs, `initscr()` writes a message to standard error and the program exits. Otherwise it returns a pointer to [`stdscr`](../../glossary/stdscr.md).

A few functions may be called before `initscr()`:

- `slk_init()`, to set up soft-label keys
- `filter()`, for a program that runs in a pipeline
- `ripoffline()`, to reserve lines at the top or bottom of the screen
- `use_env()` and `use_tioctl()`, to choose how curses finds the screen size
- `newterm()`, for a program that uses more than one terminal

## `endwin()`

Your program should always call `endwin()` before it exits or shells out. It restores the terminal modes to what they were when `initscr()` was first called, moves the cursor to the lower left corner of the screen, and resets the terminal into its normal, non-visual mode. So once a program has called `initscr()`, it should call `endwin()` before exiting.

Calling `refresh()` or `doupdate()` after a temporary escape from the program restores the curses screen from before the escape. [Leaving curses mode for a while](../screen/leaving-curses-mode.md) shows this with a shell.

## `newterm(type, ofp, ifp)`

A program that sends output to more than one terminal should use `newterm()` instead of `initscr()`, calling it once for each terminal. It returns a `SCREEN *`, which the program should save as a reference to that terminal. A `SCREEN` isn't a screen in the sense of the rest of this guide: it holds the parameters curses uses for that terminal.

The arguments are the type of the terminal, as a string, and `FILE` pointers for the terminal's output and input. If the type is `NULL`, curses uses the environment variable `TERM`. Call `endwin()` once for each terminal opened this way when the program finishes with it. Unlike `initscr()`, `newterm()` doesn't exit on an error: it returns a null pointer.

## `set_term(new)`

`set_term()` switches to a terminal previously opened by `newterm()`. It takes the new terminal's `SCREEN` reference and returns the previous one. Every other call affects only the current terminal.

## `delscreen(sp)`

`delscreen()` is the inverse of `newterm()`: it frees the data structures for a `SCREEN` reference. `endwin()` doesn't free them, so that a program can return to curses later. Call `delscreen()` after `endwin()`, once the program no longer needs that terminal.
