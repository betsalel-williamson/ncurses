# A mouse menu example

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

That's pretty much it for interfacing with the mouse. Let's create the [menu from the Keyboard guide](../keyboard/key-usage-example.md) again and enable mouse interaction. To make things simpler, key handling is removed.

**Example: Access the menu with mouse !!!**

```c
#include <stdlib.h>
#include <string.h>
#include <curses.h>

#define WIDTH 30
#define HEIGHT 10

int startx = 0;
int starty = 0;

const char *choices[] = {
    "Choice 1",
    "Choice 2",
    "Choice 3",
    "Choice 4",
    "Exit",
};

int n_choices = sizeof(choices) / sizeof(char *);

static void
print_menu(WINDOW *menu_win, int highlight)
{
    int x, y, i;

    x = 2;
    y = 2;
    box(menu_win, 0, 0);
    for (i = 0; i < n_choices; ++i) {
        if (highlight == i + 1) {
            wattron(menu_win, A_REVERSE);
            mvwprintw(menu_win, y, x, "%s", choices[i]);
            wattroff(menu_win, A_REVERSE);
        } else
            mvwprintw(menu_win, y, x, "%s", choices[i]);
        ++y;
    }
    wrefresh(menu_win);
}

/* Report the choice according to mouse position */
static void
report_choice(int mouse_x, int mouse_y, int *p_choice)
{
    int i, j, len, choice;

    i = startx + 2;
    j = starty + 2;

    for (choice = 0; choice < n_choices; ++choice) {
        len = (int) strlen(choices[choice]);
        if (mouse_y == j + choice && mouse_x >= i && mouse_x < i + len) {
            if (choice == n_choices - 1)
                *p_choice = -1;
            else
                *p_choice = choice + 1;
            break;
        }
    }
}

int
main(void)
{
    int c, choice = 0;
    WINDOW *menu_win;
    MEVENT event;

    /* Initialize curses */
    initscr();
    clear();
    noecho();
    cbreak();                   /* disable line buffering and
                                 * editing control characters   */

    /* Try to put the window in the middle of screen */
    startx = (COLS - WIDTH) / 2;
    starty = (LINES - HEIGHT) / 2;

    attron(A_REVERSE);
    mvprintw(LINES - 1, 1,
             "Click on Exit to quit (Works best in a virtual console)");
    refresh();
    attroff(A_REVERSE);

    /* Print the menu for the first time */
    menu_win = newwin(HEIGHT, WIDTH, starty, startx);
    keypad(menu_win, TRUE);
    print_menu(menu_win, 1);
    /* Get all the mouse events */
    mousemask(ALL_MOUSE_EVENTS, NULL);

    while (1) {
        c = wgetch(menu_win);
        switch (c) {
        case KEY_MOUSE:
            /* When the user clicks the left mouse button */
            if (getmouse(&event) == OK) {
                if (event.bstate & (BUTTON1_PRESSED | BUTTON1_CLICKED)) {
                    report_choice(event.x, event.y, &choice);
                    if (choice == -1)   /* Exit chosen */
                        goto end;
                    mvprintw(LINES - 2, 1,
                             "Choice made is : %d String Chosen is \"%10s\"",
                             choice, choices[choice - 1]);
                    refresh();
                }
            }
            print_menu(menu_win, choice);
            break;
        }
    }
end:
    endwin();
    return EXIT_SUCCESS;
}
```

Click a choice to see it reported on the line above the reverse-video prompt, and click Exit to end the program. Key handling is removed, so F1 doesn't end this one.

The program checks for `BUTTON1_CLICKED` as well as `BUTTON1_PRESSED`. It asks for `ALL_MOUSE_EVENTS`, which makes clicks visible, so ncurses reports a quick press and release as one `BUTTON1_CLICKED` event and never as `BUTTON1_PRESSED`. Only a press held longer than the [mouse interval](mouse-events.md#clicks-and-mouseinterval) arrives as `BUTTON1_PRESSED`.

`report_choice()` compares the click with the screen positions of the menu's text: the window starts at `startx` and `starty`, and its first choice is printed 2 rows down and 2 columns in. `getmouse()` reports zero-origin screen coordinates, the same origin as `startx` and `starty`, so they are compared as they come.
