# Formatted output with printw

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

These functions are similar to `printf()` with the added capability of printing at any position on the screen.

## `printw()` and `mvprintw()`

These two functions work much like `printf()`. `mvprintw()` can be used to move the cursor to a position and then print. If you want to move the cursor first and then print using the `printw()` function, use `move()` first and then use `printw()`, though I see no point why one should avoid using `mvprintw()`; you have the flexibility to manipulate.

## `wprintw()` and `mvwprintw()`

These two functions are similar to the above two, except that they print in the window given as an argument.

## `vw_printw()`

This function is similar to `vprintf()`. It can be used when a variable number of arguments are to be printed.

## A simple printw example

**Example: A Simple printw example**

```c
#include <stdlib.h>
#include <curses.h>
#include <string.h>

int
main(void)
{
    /* message to appear on the screen */
    char mesg[] = "Just a string";
    /* to store the number of rows and the number of columns of the screen */
    int row, col;

    /* start the curses mode */
    initscr();
    /* get the number of rows and columns */
    getmaxyx(stdscr, row, col);
    /* print the message at the center of the screen */
    mvprintw(row / 2, (col - (int) strlen(mesg)) / 2, "%s", mesg);
    mvprintw(row - 2, 0, "This screen has %d rows and %d columns\n", row,
             col);
    printw("Try resizing your window (if possible) "
           "and then run this program again");
    refresh();
    getch();
    endwin();

    return EXIT_SUCCESS;
}
```

The program above demonstrates how easy it is to use `printw()`. You just feed the coordinates and the message to appear on the screen, then it does what you want.

The program introduces a new function, `getmaxyx()`, a macro defined in `curses.h`. It gives the number of rows and the number of columns in a given window. `getmaxyx()` does this by updating the variables given to it. Since `getmaxyx()` is not a function, we don't pass pointers to it; we just give two integer variables.
