# Multiple terminals and capability tests

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Handling multiple terminal screens

`initscr()` calls `newterm()` to do most of its work. If you're writing a program that opens several terminals, use `newterm()` directly.

Each call takes a [terminal type](../../glossary/terminal-type.md) and a pair of file pointers, and returns a `SCREEN` reference. The terminal it opens becomes the current one, so `stdscr` is the last one allocated. Switch between terminals with `set_term()`. Like `initscr()`, `newterm()` saves each terminal's shell and program modes, as `def_shell_mode()` and `def_prog_mode()` do, and each terminal has its own saved modes. [Initialization and wrapup](../init-and-debugging/initialization-and-wrapup.md) describes these functions.

## Testing for terminal capabilities

Sometimes you'll want to test for the presence of capabilities before deciding whether to go into curses mode. An easy way is to call `setupterm()`, then use `tigetflag()`, `tigetnum()` and `tigetstr()` to do the testing. [Terminal descriptions without curses](../init-and-debugging/terminal-descriptions.md) describes these functions.

A useful case comes up when you want to know whether a terminal type should be treated as smart (cursor-addressable) or stupid. The right test is whether `tigetstr("cup")` returns a value other than `NULL`. Alternatively, include `term.h` and test the value of the macro `cursor_address`.
