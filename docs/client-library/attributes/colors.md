# Colors

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

## The basics

Life seems dull with no colors. Curses has a nice mechanism to handle colors. Let's get into the thick of things with a small program.

**Example: A Simple Color example**

```c
#include <stdlib.h>
#include <string.h>
#include <curses.h>

static void
print_in_middle(WINDOW *win, int starty, int startx, int width,
                const char *string)
{
    int length, x, y;
    float temp;

    if (win == NULL)
        win = stdscr;
    getyx(win, y, x);
    if (startx != 0)
        x = startx;
    if (starty != 0)
        y = starty;
    if (width == 0)
        width = 80;

    length = (int) strlen(string);
    temp = (float) (width - length) / 2;
    x = startx + (int) temp;
    mvwprintw(win, y, x, "%s", string);
    refresh();
}

int
main(void)
{
    /* Start curses mode */
    initscr();
    if (has_colors() == FALSE) {
        endwin();
        printf("Your terminal does not support color\n");
        exit(EXIT_FAILURE);
    }
    /* Start color */
    start_color();
    init_pair(1, COLOR_RED, COLOR_BLACK);

    attron(COLOR_PAIR(1));
    print_in_middle(stdscr, LINES / 2, 0, 0, "Voila !!! In color ...");
    attroff(COLOR_PAIR(1));
    getch();
    endwin();

    return EXIT_SUCCESS;
}
```

As you can see, to start using color, you should first call the function `start_color()`. After that, you can use the color capabilities of your terminal using various functions. To find out whether a terminal has color capabilities or not, you can use the `has_colors()` function, which returns `FALSE` if the terminal does not support color.

Curses initializes all the colors supported by the terminal when `start_color()` is called. These can be accessed by the defined constants like `COLOR_BLACK`, etc.

## Color pairs

Now, to actually start using colors, you have to define pairs. The package actually thinks in terms of color pairs, combinations of foreground and background colors. That means you have to use the function `init_pair()` to define the foreground and background for the pair number you give.

Once you have done an `init_pair()` that creates color pair N, you can use `COLOR_PAIR(N)` as a highlight that invokes that particular color combination, as a normal [attribute](attributes.md). Note that `COLOR_PAIR(N)`, for constant N, is itself a compile-time constant and can be used in initializers.

This may seem cumbersome at first. But this elegant solution allows us to manage color pairs very easily. To appreciate it, you have to look into the source code of "dialog", a utility for displaying dialog boxes from shell scripts. The developers have defined foreground and background combinations for all the colors they might need and initialized them at the beginning. This makes it very easy to set attributes just by accessing a pair which we already have defined as a constant. A program might, for example, set up eight color pairs, each of the guaranteed-available colors on black, so that each color pair is, in effect, given the name of its foreground color.

The following colors are defined in `curses.h`. You can use these as parameters for various color functions.

```text
COLOR_BLACK   0
COLOR_RED     1
COLOR_GREEN   2
COLOR_YELLOW  3
COLOR_BLUE    4
COLOR_MAGENTA 5
COLOR_CYAN    6
COLOR_WHITE   7
```

## Changing color definitions

The function `init_color()` can be used to change the RGB values for the colors defined by curses initially. Say you wanted to change the intensity of red slightly. Then you can use this function as

```c
/*
 * param 1        : color number
 * param 2, 3, 4  : rgb content min = 0, max = 1000
 */
init_color(COLOR_RED, 700, 0, 0);
```

If your terminal cannot change the color definitions, the function returns `ERR`. The function `can_change_color()` can be used to find out whether the terminal has the capability of changing color content or not. The RGB content is scaled from 0 to 1000. Initially, ncurses defines red with content 680 (r), 0 (g), 0 (b), so the call above makes it slightly brighter.

## Color content

The functions `color_content()` and `pair_content()` can be used to find the color content and the foreground and background combination for the pair.
