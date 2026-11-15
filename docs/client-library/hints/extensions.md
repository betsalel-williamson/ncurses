# ncurses extensions

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

These functions aren't part of SVr4 curses or the X/Open Curses standard.

## Resizing

`wresize()` resizes a window in place. `resizeterm()` resizes all the windows when the terminal's size changes. [Resizing the terminal](resizing.md) describes how ncurses calls it for you, and how to call it from a program with its own `SIGWINCH` handler.

## Function keys

`define_key()` defines, at run time, function-key control sequences that aren't in the terminal description. `keyok()` temporarily enables or disables the interpretation of any function-key control sequence.

## Default colors

`use_default_colors()` lets an application use the terminal's default foreground and background colors as an additional default color. Several terminal emulators support this feature, which is based on ISO 6429.

## Number of colors

SVr4 curses defines only 8 colors. ncurses supports as many as the terminal description gives in its `colors` capability, such as 256 for `xterm-256color`. `start_color()` sets `COLORS` to that number. The color functions in SVr4 and X/Open Curses take `short` arguments, which limits a portable program to the colors and color pairs a `short` can number. The ncurses extensions `init_extended_color()` and `init_extended_pair()` take `int` arguments instead. [Colors](../attributes/colors.md) has an example program.
