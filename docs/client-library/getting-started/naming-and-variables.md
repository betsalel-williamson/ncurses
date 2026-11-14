# Windows, names and variables

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Terminology

These guides use the following terminology with reasonable consistency:

window  
A data structure describing a sub-rectangle of the screen (possibly the entire screen). You can write to a window as though it were a miniature screen, scrolling independently of other windows on the physical screen.

screens  
A subset of windows which are as large as the terminal screen, i.e., they start at the upper left hand corner and encompass the lower right hand corner. One of these, `stdscr`, is automatically provided for the programmer.

terminal screen  
The package's idea of what the terminal display currently looks like, i.e., what the user sees now. This is a special screen.

## Standard windows

The routines can use several windows, but two are automatically given: `curscr`, which knows what the terminal looks like, and `stdscr`, which is what the programmer wants the terminal to look like next. The user should never actually access `curscr` directly. Changes should be made through the API, and then the routine `refresh()` (or `wrefresh()`) called.

## Function naming conventions

Many functions are defined to use `stdscr` as a default screen. For example, to add a character to `stdscr`, one calls `addch()` with the desired character as argument. To write to a different window, use the routine `waddch()` (for **w**indow-specific `addch()`). This convention of prepending function names with a "w" when they are to be applied to specific windows is consistent. The only routines which do not follow it are those for which a window must always be specified.

In order to move the current (y, x) coordinates from one point to another, the routines `move()` and `wmove()` are provided. However, it is often desirable to first move and then perform some I/O operation. In order to avoid clumsiness, most I/O routines can be preceded by the prefix "mv" and the desired (y, x) coordinates prepended to the arguments to the function. For example, the calls

```c
move(y, x);
addch(ch);
```

can be replaced by

```c
mvaddch(y, x, ch);
```

and

```c
wmove(win, y, x);
waddch(win, ch);
```

can be replaced by

```c
mvwaddch(win, y, x, ch);
```

Note that the window description pointer (`win`) comes before the added (y, x) coordinates. If a function requires a window pointer, it is always the first parameter passed.

## Variables

The `curses` library sets some variables describing the terminal capabilities.

| Type  | Name    | Description                      |
| ----- | ------- | -------------------------------- |
| `int` | `LINES` | number of lines on the terminal   |
| `int` | `COLS`  | number of columns on the terminal |

`curses.h` also introduces some `#define` constants and types of general usefulness:

`bool`  
boolean type (e.g., `bool doneit;`). Where the C compiler provides `<stdbool.h>`, it is C's `bool`; otherwise it is a type that `configure` chooses when `ncurses` is built.

`TRUE`  
boolean "true" flag (1).

`FALSE`  
boolean "false" flag (0).

`ERR`  
error flag returned by routines on a failure (-1).

`OK`  
flag returned by routines when things go right (0).
