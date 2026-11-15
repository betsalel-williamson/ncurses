# Line-drawing characters

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

If you have ever programmed in DOS, you know about the nifty characters in the extended character set. They are printable only on some terminals. ncurses functions like `box()` use these characters. Their names all start with `ACS_`, meaning alternate character set. You might have noticed them in some of the programs in these guides. Here is an example showing all the characters.

**Example: ACS Variables Example**

```c
#include <stdlib.h>
#include <curses.h>

int
main(void)
{
    int n = 0;

    initscr();

    /* Two columns of 16, so all 31 fit on a 24-line screen */
#define SHOW(string, acs)                             \
    mvprintw(n % 16, (n / 16) * 30, "%-26s", string); \
    addch(acs);                                       \
    n++
    /* clang-format off */
    SHOW("Upper left corner",        ACS_ULCORNER);
    SHOW("Lower left corner",        ACS_LLCORNER);
    SHOW("Lower right corner",       ACS_LRCORNER);
    SHOW("Tee pointing right",       ACS_LTEE);
    SHOW("Tee pointing left",        ACS_RTEE);
    SHOW("Tee pointing up",          ACS_BTEE);
    SHOW("Tee pointing down",        ACS_TTEE);
    SHOW("Horizontal line",          ACS_HLINE);
    SHOW("Vertical line",            ACS_VLINE);
    SHOW("Large Plus or cross over", ACS_PLUS);
    SHOW("Scan Line 1",              ACS_S1);
    SHOW("Scan Line 3",              ACS_S3);
    SHOW("Scan Line 7",              ACS_S7);
    SHOW("Scan Line 9",              ACS_S9);
    SHOW("Diamond",                  ACS_DIAMOND);
    SHOW("Checker board (stipple)",  ACS_CKBOARD);
    SHOW("Degree Symbol",            ACS_DEGREE);
    SHOW("Plus/Minus Symbol",        ACS_PLMINUS);
    SHOW("Bullet",                   ACS_BULLET);
    SHOW("Arrow Pointing Left",      ACS_LARROW);
    SHOW("Arrow Pointing Right",     ACS_RARROW);
    SHOW("Arrow Pointing Down",      ACS_DARROW);
    SHOW("Arrow Pointing Up",        ACS_UARROW);
    SHOW("Board of squares",         ACS_BOARD);
    SHOW("Lantern Symbol",           ACS_LANTERN);
    SHOW("Solid Square Block",       ACS_BLOCK);
    SHOW("Less/Equal sign",          ACS_LEQUAL);
    SHOW("Greater/Equal sign",       ACS_GEQUAL);
    SHOW("Pi",                       ACS_PI);
    SHOW("Not equal",                ACS_NEQUAL);
    SHOW("UK pound sign",            ACS_STERLING);
    /* clang-format on */

    refresh();
    getch();
    endwin();

    return EXIT_SUCCESS;
}
```

There are 31 characters, more than a 24-line screen has lines, so the program shows them in two columns of 16. On a terminal narrower than 57 columns, the second column wraps.

The `/* clang-format off */` and `/* clang-format on */` comments keep the table of names lined up when the code is reformatted.
