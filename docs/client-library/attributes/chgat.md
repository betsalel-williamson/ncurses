# Change attributes in place with chgat

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

The function `chgat()` is listed at the end of the man page `curs_attr`. It actually is a useful one. This function can be used to set attributes for a group of characters without moving. I mean it!!! Without moving the cursor :-) It changes the attributes of a given number of characters starting at the current cursor location.

We can give -1 as the character count to update till the end of the line. If you want to change attributes of characters from the current position to the end of the line, just use this.

```c
chgat(-1, A_REVERSE, 0, NULL);
```

This function is useful when changing attributes for characters that are already on the screen. Move to the character from which you want to change and change the attribute.

The other functions `wchgat()`, `mvchgat()` and `mvwchgat()` behave similarly, except that the w functions operate on the particular window. The mv functions first move the cursor, then perform the work given to them. Actually, `chgat()` is a macro which is replaced by a `wchgat()` with `stdscr` as the window. Most of the "w-less" functions are macros.

**Example: chgat usage example**

```c
#include <stdlib.h>
#include <curses.h>

int
main(void)
{
    /* Start curses mode */
    initscr();
    /* Start color functionality */
    start_color();

    init_pair(1, COLOR_CYAN, COLOR_BLACK);
    printw("A Big string which i didn't care to type fully ");
    mvchgat(0, 0, -1, A_BLINK, 1, NULL);
    /*
     * First two parameters specify the position at which to start
     * Third parameter number of characters to update. -1 means till
     * end of line
     * Fourth parameter is the normal attribute you wanted to give
     * to the character
     * Fifth is the color index. It is the index given during init_pair()
     * use 0 if you didn't want color
     * Sixth one is always NULL
     */
    refresh();
    getch();
    /* End curses mode */
    endwin();
    return EXIT_SUCCESS;
}
```

This example also introduces us to the color world of curses. [Colors](colors.md) explains it in detail. Use 0 for no color.
