# Forms-drawing characters

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

The `addch()` function (and some others, including `box()` and `border()`) can accept some pseudo-character arguments which are specially defined by ncurses. These are `#define` values set up in the `curses.h` header; see there for a complete list (look for the prefix `ACS_`).

The most useful of the ACS defines are the forms-drawing characters. You can use these to draw boxes, tables, horizontal or vertical lines, and simple graphs on the screen. If the terminal does not have such characters, curses maps them to a recognizable (though ugly) set of ASCII defaults when it starts. The manual page `curs_addch(3X)` lists each character and its default, under "Forms-Drawing Characters".

The [window border program](../windows/creating-windows.md) draws its box with these characters, and [Other border functions](../windows/border-functions.md) draws lines with them.
