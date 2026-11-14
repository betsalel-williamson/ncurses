# Windows and the screen

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

## What a window is

A window is an imaginary screen defined by the curses system. It does not mean a bordered window like those on a graphical desktop. In order to update the screen optimally, the routines need to know what the screen currently looks like and what the programmer wants it to look like next. For this purpose, a data type (structure) named `WINDOW` is defined which describes a window image to the routines, including its starting position on the screen (the (y, x) coordinates of the upper left hand corner) and its size.

One of these, called `curscr` (for current screen), is a screen image of what the terminal currently looks like. Another, called `stdscr` (for standard screen), is created when curses is initialized, covers the whole terminal, and is provided by default to make changes on. If you are doing simple tasks like printing a few strings and reading input, you can safely use this single window for all of your purposes. You can also create windows and call functions which explicitly work on the specified window.

A window is a purely internal representation. It is used to build and store a potential image of a portion of the terminal. It does not bear any necessary relation to what is really on the terminal screen; it is more like a scratchpad or write buffer.

## Updating the screen

To make the section of physical screen corresponding to a window reflect the contents of the window structure, the routine `refresh()` (or `wrefresh()` if the window is not `stdscr`) is called.

A given physical screen section may be within the scope of any number of overlapping windows. Also, changes can be made to windows in any order, without regard to motion efficiency. Then, at will, the programmer can effectively say "make it look like this," and let the package implementation determine the most efficient way to repaint the screen.

## Functions for stdscr and for other windows

For example, if you call

```c
printw("Hi There !!!");
refresh();
```

it prints the string on `stdscr` at the present cursor position. Similarly, the call to `refresh()` works on `stdscr` only.

If you have [created a window](creating-windows.md), call the function with a "w" added to the usual name, and the window as the first argument:

```c
wprintw(win, "Hi There !!!");
wrefresh(win);
```

The rest of the library follows the same [naming convention](../getting-started/naming-and-variables.md#function-naming-conventions). For each function there usually are three more:

```c
/* Print on stdscr at present cursor position */
printw(fmt, ...);
/* Move to (y, x) then print */
mvprintw(y, x, fmt, ...);
/* Print on window win at present cursor position in the window */
wprintw(win, fmt, ...);
/* Move to (y, x) relative to window co-ordinates and then print */
mvwprintw(win, y, x, fmt, ...);
```

Usually the w-less functions are macros which expand to the corresponding w-function with `stdscr` as the window parameter.
