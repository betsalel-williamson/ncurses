# Attributes

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The ncurses package supports screen highlights including standout, reverse video, underline and blink. It also supports color, which is treated as another kind of highlight.

Highlights are encoded, internally, as high bits of the pseudo-character type (`chtype`) that `curses.h` uses to represent the contents of a screen cell. See the `curses.h` header file for a complete list of highlight mask values (look for the prefix `A_`).

There are two ways to make highlights. One is to logical-OR the value of the highlights you want into the character argument of an `addch()` call, or any other output call that takes a `chtype` argument, as [Output](../output/characters-and-strings.md#the-addch-class-of-functions) shows. The other is to set the current-highlight value, which is logical-ORed with any highlight you specify the first way. You do this with the functions `attron()`, `attroff()` and `attrset()`.

## A simple attributes example

The following program takes a C file as input and prints the file with comments in bold. Scan through the code.

**Example: A Simple Attributes example**

```c
/* pager functionality by Joseph Spainhour <spainhou@bellsouth.net> */
#include <curses.h>
#include <stdlib.h>

int
main(int argc, char *argv[])
{
    int ch, row, col;
    int prev = EOF;
    FILE *fp;
    int y, x;

    if (argc != 2) {
        printf("Usage: %s <a c file name>\n", argv[0]);
        return EXIT_FAILURE;
    }
    fp = fopen(argv[1], "r");
    if (fp == NULL) {
        perror("Cannot open input file");
        return EXIT_FAILURE;
    }
    /* Start curses mode */
    initscr();
    /* find the boundaries of the screen */
    getmaxyx(stdscr, row, col);
    (void) col;
    /* read the file till we reach the end */
    while ((ch = fgetc(fp)) != EOF) {
        /* get the current cursor position */
        getyx(stdscr, y, x);
        /* are we at the end of the screen? */
        if (y == (row - 1)) {
            /* tell the user to press a key */
            printw("<-Press Any Key->");
            getch();
            /* clear the screen */
            clear();
            /* start at the beginning of the screen */
            move(0, 0);
        }
        /* If it is / and * then only switch bold on */
        if (prev == '/' && ch == '*') {
            /* turn bold on */
            attron(A_BOLD);
            /* get the current cursor position */
            getyx(stdscr, y, x);
            /* back up one space */
            move(y, x - 1);
            /* The actual printing is done here */
            printw("%c%c", '/', ch);
        } else
            printw("%c", ch);
        refresh();
        /* Switch it off once we got * and then / */
        if (prev == '*' && ch == '/')
            attroff(A_BOLD);
        prev = ch;
    }
    /* End curses mode */
    endwin();
    fclose(fp);

    return EXIT_SUCCESS;
}
```

On the site, the program reads its own listing: the page passes it the file name `example.c`. Press any key at `<-Press Any Key->` to see the next screen.

Don't worry about all that initialization. Concentrate on the while loop. It reads each character in the file and searches for the pattern `/*`. Once it spots the pattern, it switches the bold attribute on with `attron()`. When we get the pattern `*/`, it is switched off by `attroff()`.

The program also introduces two useful functions, `getyx()` and `move()`. The first gets the coordinates of the present cursor into the variables `y` and `x`. Since `getyx()` is a macro, we don't have to pass pointers to variables. The function `move()` moves the cursor to the coordinates given to it.

The program is really a simple one which doesn't do much. Along these lines, one could write a more useful program which reads a C file, parses it and prints it in different colors. One could even extend it to other languages as well.
